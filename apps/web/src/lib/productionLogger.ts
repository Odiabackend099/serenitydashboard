/**
 * Production-Safe Logger
 *
 * Prevents sensitive data from being logged in production builds.
 * Use this instead of console.log to avoid PHI/PII leaks.
 */

const IS_PRODUCTION = import.meta.env.PROD;
const IS_DEVELOPMENT = import.meta.env.DEV;

// PHI/PII sensitive keys that should never be logged
const SENSITIVE_KEYS = [
  'email',
  'phone',
  'patient_name',
  'patient_email',
  'patient_phone',
  'name',
  'password',
  'token',
  'api_key',
  'apikey',
  'secret',
  'ssn',
  'dob',
  'date_of_birth',
  'address',
  'medical_record_number',
  'mrn'
];

/**
 * Redact sensitive data from objects before logging
 */
function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Check if string looks like email or phone
    if (data.includes('@')) return '[EMAIL_REDACTED]';
    if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(data)) return '[PHONE_REDACTED]';
    if (data.length > 100) return data.substring(0, 100) + '... [TRUNCATED]';
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();

    if (SENSITIVE_KEYS.some(sk => keyLower.includes(sk))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Production-safe logger that redacts sensitive data
 */
export const logger = {
  /**
   * Debug logging - only in development
   */
  debug: (...args: any[]) => {
    if (IS_DEVELOPMENT) {
      console.debug(...args);
    }
  },

  /**
   * Info logging - only in development
   */
  info: (...args: any[]) => {
    if (IS_DEVELOPMENT) {
      console.info(...args);
    }
  },

  /**
   * Warning logging - always logged but redacted
   */
  warn: (...args: any[]) => {
    if (IS_PRODUCTION) {
      console.warn(...args.map(redactSensitiveData));
    } else {
      console.warn(...args);
    }
  },

  /**
   * Error logging - always logged but redacted
   */
  error: (...args: any[]) => {
    if (IS_PRODUCTION) {
      console.error(...args.map(redactSensitiveData));
    } else {
      console.error(...args);
    }
  },

  /**
   * Safe logging with automatic PHI redaction
   */
  safe: (message: string, data?: Record<string, any>) => {
    const redacted = data ? redactSensitiveData(data) : {};

    if (IS_PRODUCTION) {
      console.log(message, redacted);
    } else {
      console.log(message, data); // Show full data in dev
    }
  },

  /**
   * Performance logging - only in development
   */
  perf: (label: string, fn: () => void) => {
    if (IS_DEVELOPMENT) {
      console.time(label);
      fn();
      console.timeEnd(label);
    } else {
      fn();
    }
  }
};

/**
 * Export default for convenience
 */
export default logger;
