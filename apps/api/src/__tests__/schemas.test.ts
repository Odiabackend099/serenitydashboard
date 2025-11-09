import { describe, it, expect } from 'vitest';
import { CreateMessageSchema, CreateAppointmentSchema } from '../schemas';

describe('Schemas', () => {
  it('validates CreateMessageSchema', () => {
    const parsed = CreateMessageSchema.safeParse({
      conversationId: 'c1',
      from: 'staff',
      body: 'Hello',
      channel: 'whatsapp'
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid CreateMessageSchema', () => {
    const parsed = CreateMessageSchema.safeParse({
      conversationId: 'c1',
      from: 'unknown',
      body: 'Hello'
    } as any);
    expect(parsed.success).toBe(false);
  });

  it('validates CreateAppointmentSchema', () => {
    const parsed = CreateAppointmentSchema.safeParse({
      patientRef: 'p1',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      doctor: 'Dr. Who',
      source: 'staff',
      status: 'confirmed'
    });
    expect(parsed.success).toBe(true);
  });
});