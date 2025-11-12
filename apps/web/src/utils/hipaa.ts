/**
 * HIPAA-Compliant Logging and PHI Redaction Utilities
 *
 * This module provides utilities to prevent Protected Health Information (PHI)
 * from being logged or exposed in non-compliant ways.
 *
 * PHI includes: Names, emails, phone numbers, medical record numbers, SSN,
 * addresses, dates of birth, and any other personally identifiable information.
 */

// Common PHI patterns
const PHI_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  phone: /(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}\b/g,
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
  // Nigerian phone numbers
  nigerianPhone: /(\+?234|0)[7-9][0-1]\d{8}/g,
};

/**
 * Redacts PHI from any string
 */
export function redactPHI(text: string): string {
  if (!text || typeof text !== 'string') return text;

  let redacted = text;

  // Redact emails
  redacted = redacted.replace(PHI_PATTERNS.email, '[EMAIL_REDACTED]');

  // Redact phone numbers
  redacted = redacted.replace(PHI_PATTERNS.phone, '[PHONE_REDACTED]');
  redacted = redacted.replace(PHI_PATTERNS.nigerianPhone, '[PHONE_REDACTED]');

  // Redact SSN
  redacted = redacted.replace(PHI_PATTERNS.ssn, '[SSN_REDACTED]');

  return redacted;
}

/**
 * Redacts PHI from objects (deep)
 */
export function redactPHIFromObject(obj: any): any {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    return redactPHI(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactPHIFromObject(item));
  }

  if (typeof obj === 'object') {
    const redacted: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip logging these PHI fields entirely
      const phiFields = [
        'patient_name', 'patientName', 'name',
        'patient_email', 'patientEmail', 'email',
        'patient_phone', 'patientPhone', 'phone', 'phone_number', 'phoneNumber',
        'patient_ref', 'patientRef',
        'ssn', 'social_security_number',
        'medical_record_number', 'mrn',
        'address', 'street_address',
        'date_of_birth', 'dob', 'birth_date',
        'body', 'content', 'message', 'transcript'
      ];

      if (phiFields.includes(key.toLowerCase())) {
        redacted[key] = '[PHI_REDACTED]';
      } else if (typeof value === 'string') {
        redacted[key] = redactPHI(value);
      } else if (typeof value === 'object') {
        redacted[key] = redactPHIFromObject(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  return obj;
}

/**
 * HIPAA-compliant logger
 *
 * Usage:
 *   import { logger } from './utils/hipaa';
 *   logger.info('Appointment booked', { appointmentId: '123' });
 *   logger.error('Failed to send email', { error: e.message });
 */
export const logger = {
  /**
   * Log informational messages (development only)
   */
  info: (message: string, meta?: any) => {
    if (import.meta.env.DEV) {
      const redacted = meta ? redactPHIFromObject(meta) : undefined;
      console.log(`[INFO] ${message}`, redacted || '');
    }
  },

  /**
   * Log debug messages (development only)
   */
  debug: (message: string, meta?: any) => {
    if (import.meta.env.DEV) {
      const redacted = meta ? redactPHIFromObject(meta) : undefined;
      console.log(`[DEBUG] ${message}`, redacted || '');
    }
  },

  /**
   * Log warnings (always)
   */
  warn: (message: string, meta?: any) => {
    const redacted = meta ? redactPHIFromObject(meta) : undefined;
    console.warn(`[WARN] ${message}`, redacted || '');
  },

  /**
   * Log errors (always)
   */
  error: (message: string, meta?: any) => {
    const redacted = meta ? redactPHIFromObject(meta) : undefined;
    console.error(`[ERROR] ${message}`, redacted || '');
  },
};

/**
 * Sanitize data for audit logging (keeps IDs, removes PHI)
 */
export function sanitizeForAuditLog(data: any): any {
  const allowedFields = [
    'id', 'appointment_id', 'conversation_id', 'message_id',
    'channel', 'status', 'created_at', 'updated_at',
    'action', 'tool_name', 'result', 'success'
  ];

  if (typeof data !== 'object' || !data) return data;

  const sanitized: any = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  }

  return sanitized;
}

/**
 * Check if a string contains PHI
 */
export function containsPHI(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  return (
    PHI_PATTERNS.email.test(text) ||
    PHI_PATTERNS.phone.test(text) ||
    PHI_PATTERNS.nigerianPhone.test(text) ||
    PHI_PATTERNS.ssn.test(text)
  );
}
