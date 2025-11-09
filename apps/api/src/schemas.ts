import { z } from 'zod';

export const CreateMessageSchema = z.object({
  conversationId: z.string(),
  from: z.enum(['patient', 'ai', 'staff']),
  body: z.string(),
  mediaUrl: z.string().optional(),
  channel: z.enum(['whatsapp', 'voice']).optional()
});

export const CreateAppointmentSchema = z.object({
  patientRef: z.string(),
  start: z.string(),
  end: z.string(),
  doctor: z.string(),
  source: z.enum(['ai', 'staff']),
  status: z.enum(['confirmed', 'pending', 'cancelled'])
});