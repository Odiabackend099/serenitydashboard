import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { CreateAppointmentSchema, CreateMessageSchema } from './schemas';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4001;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

// Simple RBAC middleware
type JwtClaims = { id: string; role?: string };
type AuthedRequest = Request & { user?: JwtClaims };
function auth(requiredRole?: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET missing' });
    try {
      const payload = jwt.verify(token, secret) as JwtClaims;
      req.user = payload;
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

// Socket.io rooms per conversation
io.on('connection', (socket: Socket) => {
  socket.on('join', (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
  });
});

// Schemas moved to ./schemas

// Routes
app.get('/api/conversations', auth(), async (req: Request, res: Response) => {
  const status = (req.query.status as string) || 'active';
  const convs = await prisma.conversations.findMany({ where: { status } });
  res.json(convs);
});

app.post('/api/conversations', async (req: Request, res: Response) => {
  // Allow unauthenticated conversation creation for chat widget (patient-facing)
  // In production, add rate limiting and validation
  const { channel, patientRef } = req.body;
  if (!channel || !patientRef) {
    return res.status(400).json({ error: 'channel and patientRef required' });
  }

  try {
    const conv = await prisma.conversations.create({
      data: {
        channel,
        patientRef,
        status: 'active'
      }
    });
    console.log(`[API] Conversation created: ${conv.id} (${channel})`);
    res.json(conv);
  } catch (error: any) {
    console.error('[API] Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

app.get('/api/conversations/:id', auth(), async (req: Request, res: Response) => {
  const id = req.params.id;
  const conv = await prisma.conversations.findUnique({ where: { id } });
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  res.json(conv);
});

app.get('/api/conversations/:id/messages', auth(), async (req: Request, res: Response) => {
  const id = req.params.id;
  const msgs = await prisma.messages.findMany({ where: { conversationId: id }, orderBy: { ts: 'asc' } });
  res.json(msgs);
});

app.post('/api/messages', async (req: Request, res: Response) => {
  // Allow unauthenticated message creation for chat widget (patient-facing)
  // In production, add rate limiting and validation
  const parsed = CreateMessageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { conversationId, from, body, mediaUrl } = parsed.data;

  try {
    const msg = await prisma.messages.create({ data: { conversationId, from, body, mediaUrl } });

    // Emit Socket.io event for real-time updates
    io.to(`conv:${conversationId}`).emit('message:new', msg);

    console.log(`[API] Message created in conversation ${conversationId}: ${from}`);
    res.json(msg);
  } catch (error: any) {
    console.error('[API] Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

app.get('/api/appointments', auth(), async (req: Request, res: Response) => {
  const appts = await prisma.appointments.findMany({ orderBy: { start: 'asc' } });
  res.json(appts);
});

app.post('/api/appointments', auth(), async (req: Request, res: Response) => {
  const parsed = CreateAppointmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { patientRef, start, end, doctor, source, status } = parsed.data;
  const appt = await prisma.appointments.create({
    data: { patientRef, start: new Date(start), end: new Date(end), doctor, source, status }
  });
  res.json(appt);
});

// Webhooks (stubs)
app.post('/webhook/twilio', async (req: Request, res: Response) => {
  // TODO: verify Twilio signature
  const body = req.body;
  // Map inbound WhatsApp message to a conversation/message
  res.json({ ok: true });
});

app.post('/webhook/voice', async (req: Request, res: Response) => {
  // VOICE_PROVIDER=vapi expected. Verify webhook signature accordingly.
  const evt = req.body;
  // Handle call events/transcripts
  res.json({ ok: true });
});

app.post('/webhook/n8n/calendar-result', async (req: Request, res: Response) => {
  // Handle n8n confirmation callbacks for calendar operations
  res.json({ ok: true });
});

// Auth (simplified)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = (req.body || {}) as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.hash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET missing' });
  const token = jwt.sign({ id: user.id, role: user.role } as JwtClaims, secret, { expiresIn: '15m' });
  const refresh = jwt.sign({ id: user.id, role: user.role } as JwtClaims, secret, { expiresIn: '7d' });
  res.json({ accessToken: token, refreshToken: refresh });
});

app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = (req.body || {}) as { refreshToken?: string };
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET missing' });
    const payload = jwt.verify(refreshToken, secret) as JwtClaims;
    const token = jwt.sign({ id: payload.id, role: payload.role } as JwtClaims, secret, { expiresIn: '15m' });
    res.json({ accessToken: token });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

app.get('/api/me', auth(), async (req: AuthedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = await prisma.users.findUnique({ where: { id: req.user.id } });
  res.json({ id: user?.id, name: user?.name, email: user?.email, role: user?.role });
});

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Voice (test-mode stub)
app.post('/api/voice/start', async (req: Request, res: Response) => {
  const { assistantId, phone } = (req.body || {}) as { assistantId?: string; phone?: string };
  if (!assistantId || !phone) return res.status(400).json({ error: 'assistantId and phone required' });
  // In production: call VAPI to initiate an outbound call bridged to the assistant.
  // This is a test-mode stub that simply acknowledges the request.
  res.json({ ok: true, started: true, assistantId, phone });
});