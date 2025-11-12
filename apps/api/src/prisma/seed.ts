import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Use environment variable or default
  const existing = await prisma.users.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await prisma.users.create({
      data: { name: 'Admin', email: adminEmail, hash, role: 'admin', active: true }
    });
  }

  const agentCount = await prisma.agents.count();
  if (agentCount === 0) {
    await prisma.agents.create({
      data: {
        name: 'Default Agent',
        systemPrompt: 'You are a helpful hospital assistant.',
        voiceId: process.env.VOICE_ID || null,
        faqJson: {},
        createdBy: 'seed'
      }
    });
  }

  const convCount = await prisma.conversations.count();
  if (convCount === 0) {
    const conv = await prisma.conversations.create({
      data: { channel: 'whatsapp', patientRef: 'patient-123', status: 'active' }
    });
    await prisma.messages.create({
      data: { conversationId: conv.id, from: 'patient', body: 'Hello, I need an appointment.' }
    });
  }
}

main()
  .then(() => console.log('Seed complete'))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());