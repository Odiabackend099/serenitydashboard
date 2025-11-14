/**
 * Input Validation Schemas using Zod
 *
 * Provides centralized, type-safe validation for all user inputs
 * to prevent injection attacks, XSS, and data corruption.
 */

import { z } from 'zod';

/**
 * Email validation schema
 * - RFC 5322 compliant
 * - Max length 254 characters
 */
export const EmailSchema = z
  .string()
  .email('Invalid email address')
  .max(254, 'Email address too long')
  .toLowerCase()
  .trim();

/**
 * Phone number validation schema
 * - International format: +[country code][number]
 * - 10-15 digits (excluding country code)
 * - Allows spaces, dashes, dots for readability (removed before storage)
 */
export const PhoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{9,14}$/,
    'Invalid phone number format. Use international format: +1234567890'
  )
  .min(10, 'Phone number too short')
  .max(16, 'Phone number too long');

/**
 * Patient name validation schema
 * - 2-100 characters
 * - Only letters, spaces, hyphens, apostrophes
 * - Prevents XSS and injection attacks
 */
export const NameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

/**
 * Date validation schema (YYYY-MM-DD format)
 * - Validates format
 * - Ensures date is in the future (for appointments)
 */
export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed >= today;
  }, 'Appointment date must be today or in the future');

/**
 * Time validation schema (12-hour format with AM/PM)
 * - Validates format: "10:30 AM" or "2:00 PM"
 */
export const TimeSchema = z
  .string()
  .regex(
    /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
    'Time must be in 12-hour format (e.g., "10:30 AM")'
  );

/**
 * Appointment reason validation schema
 * - 3-500 characters
 * - Prevents overly long or short reasons
 */
export const ReasonSchema = z
  .string()
  .min(3, 'Reason must be at least 3 characters')
  .max(500, 'Reason too long (max 500 characters)')
  .trim();

/**
 * General text input validation
 * - Max 1000 characters
 * - Prevents excessively long inputs
 */
export const TextInputSchema = z
  .string()
  .max(1000, 'Input too long (max 1000 characters)')
  .trim();

/**
 * Appointment booking validation schema
 * - Validates all required fields for booking an appointment
 */
export const AppointmentBookingSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  phone: PhoneSchema,
  date: DateSchema,
  time: TimeSchema,
  reason: ReasonSchema
});

export type AppointmentBooking = z.infer<typeof AppointmentBookingSchema>;

/**
 * Appointment rescheduling validation schema
 */
export const AppointmentRescheduleSchema = z.object({
  appointment_id: z.string().uuid('Invalid appointment ID'),
  email: EmailSchema,
  new_date: DateSchema,
  new_time: TimeSchema,
  reason: ReasonSchema.optional()
});

export type AppointmentReschedule = z.infer<typeof AppointmentRescheduleSchema>;

/**
 * Appointment cancellation validation schema
 */
export const AppointmentCancelSchema = z.object({
  appointment_id: z.string().uuid('Invalid appointment ID'),
  email: EmailSchema,
  reason: ReasonSchema.optional()
});

export type AppointmentCancel = z.infer<typeof AppointmentCancelSchema>;

/**
 * Search query validation schema
 * - Prevents SQL injection and XSS
 */
export const SearchQuerySchema = z
  .string()
  .min(1, 'Search query cannot be empty')
  .max(100, 'Search query too long')
  .regex(/^[a-zA-Z0-9\s@.-]+$/, 'Search query contains invalid characters')
  .trim();

/**
 * Chat message validation schema
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000)
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Validate and sanitize input data
 *
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated and sanitized data
 * @throws Error if validation fails
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }

  return result.data;
}

/**
 * Validate and sanitize input data (async version)
 */
export async function validateInputAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  const result = await schema.safeParseAsync(data);

  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }

  return result.data;
}

/**
 * Sanitize HTML to prevent XSS
 * - Removes all HTML tags
 * - Encodes special characters
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize SQL to prevent SQL injection
 * - Removes SQL wildcards and quotes
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/[%_'"\\]/g, '')
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Normalize phone number to E.164 format
 * - Removes all non-digit characters except leading +
 */
export function normalizePhone(phone: string): string {
  // Remove all spaces, dashes, dots
  let cleaned = phone.replace(/[\s.-]/g, '');

  // Ensure it has a leading +
  if (!cleaned.startsWith('+')) {
    // Assume US number if no country code
    cleaned = '+1' + cleaned;
  }

  return cleaned;
}

/**
 * Validate email format (basic check)
 */
export function isValidEmail(email: string): boolean {
  try {
    EmailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone format (basic check)
 */
export function isValidPhone(phone: string): boolean {
  try {
    PhoneSchema.parse(normalizePhone(phone));
    return true;
  } catch {
    return false;
  }
}

export default {
  EmailSchema,
  PhoneSchema,
  NameSchema,
  DateSchema,
  TimeSchema,
  ReasonSchema,
  AppointmentBookingSchema,
  AppointmentRescheduleSchema,
  AppointmentCancelSchema,
  SearchQuerySchema,
  ChatMessageSchema,
  validateInput,
  validateInputAsync,
  sanitizeHtml,
  sanitizeSql,
  normalizePhone,
  isValidEmail,
  isValidPhone
};
