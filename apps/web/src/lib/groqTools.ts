/**
 * Groq Tool-Calling Integration for Serenity Royale Hospital
 * 
 * AI Agent Rules:
 * - READ-ONLY database access via stats endpoints
 * - All "write" actions routed through n8n workflows
 * - Sensitive actions require UI confirmation
 * 
 * Security: All Groq API calls now go through Supabase Edge Function
 * to keep the API key secure on the backend.
 */

import { supabase } from './supabase';
import { logger } from './logger';

// Input validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePhone(phone: string): boolean {
  // Accept international format with +, or US format with/without country code
  const phoneRegex = /^(\+?1[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim();
}

function validateAppointmentDate(dateString: string): boolean {
  const appointmentDate = new Date(dateString);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(appointmentDate.getTime())) {
    return false;
  }
  
  // Check if date is in the future (allow same day but future time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
  
  return appointmentDay >= today;
}

function validateTimeFormat(timeString: string): boolean {
  // Accept HH:MM format (24-hour) or HH:MM:SS format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  return timeRegex.test(timeString);
}

// Get Supabase URL for Edge Function
const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) throw new Error('VITE_SUPABASE_URL not configured');
  return url;
};

// Helper function to validate and parse JSON responses
async function validateJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    logger.error('Expected JSON but got:', text.substring(0, 200));
    throw new Error(`Server returned ${contentType || 'non-JSON'} response instead of JSON`);
  }

  try {
    return await response.json();
  } catch (error) {
    logger.error('Failed to parse JSON response:', error);
    throw new Error('Invalid JSON response from server');
  }
}

// ============================================
// TOOL DEFINITIONS
// ============================================

// ADMIN TOOLS - Full backend access (requires authentication)
export const adminTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_stats',
      description: 'Get real-time hospital statistics (conversations, messages, calls, appointments)',
      parameters: {
        type: 'object',
        properties: {
          metric: {
            type: 'string',
            enum: ['conversations_today', 'messages_today', 'calls_today', 'upcoming_appointments', 'all'],
            description: 'The statistic to retrieve',
          },
        },
        required: ['metric'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'trigger_automation',
      description: 'Trigger n8n workflow automation (requires confirmation for sensitive actions)',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['send_email', 'book_event', 'send_whatsapp', 'daily_summary', 'book_appointment', 'reschedule_appointment', 'cancel_appointment'],
            description: 'The automation action to trigger',
          },
          payload: {
            type: 'object',
            description: 'Action-specific parameters',
          },
        },
        required: ['action', 'payload'],
      },
    },
  },
  // Calendar Management Tools
  {
    type: 'function' as const,
    function: {
      name: 'create_calendar_event',
      description: 'Create a Google Calendar event for an appointment',
      parameters: {
        type: 'object',
        properties: {
          appointment_id: {
            type: 'string',
            description: 'The appointment ID from the database',
          },
          patient_name: {
            type: 'string',
            description: 'Patient full name',
          },
          patient_email: {
            type: 'string',
            description: 'Patient email address (optional, for calendar invite)',
          },
          patient_phone: {
            type: 'string',
            description: 'Patient phone number',
          },
          appointment_date: {
            type: 'string',
            description: 'Appointment date in YYYY-MM-DD format',
          },
          appointment_time: {
            type: 'string',
            description: 'Appointment time in HH:MM format (24-hour)',
          },
          reason: {
            type: 'string',
            description: 'Reason for appointment',
          },
        },
        required: ['appointment_id', 'appointment_date', 'appointment_time'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'reschedule_calendar_event',
      description: 'Reschedule an existing calendar event to a new date and time',
      parameters: {
        type: 'object',
        properties: {
          appointment_id: {
            type: 'string',
            description: 'The appointment ID from the database',
          },
          google_calendar_event_id: {
            type: 'string',
            description: 'The Google Calendar event ID',
          },
          new_date: {
            type: 'string',
            description: 'New appointment date in YYYY-MM-DD format',
          },
          new_time: {
            type: 'string',
            description: 'New appointment time in HH:MM format (24-hour)',
          },
        },
        required: ['appointment_id', 'google_calendar_event_id', 'new_date', 'new_time'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'cancel_calendar_event',
      description: 'Cancel and delete a calendar event',
      parameters: {
        type: 'object',
        properties: {
          appointment_id: {
            type: 'string',
            description: 'The appointment ID from the database',
          },
          google_calendar_event_id: {
            type: 'string',
            description: 'The Google Calendar event ID to cancel',
          },
        },
        required: ['appointment_id', 'google_calendar_event_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_appointments',
      description: 'Get list of appointments, optionally filtered by date or status',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Filter by date (YYYY-MM-DD), leave empty for all upcoming',
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            description: 'Filter by appointment status',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of appointments to return (default: 10)',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'schedule_followup_email',
      description: 'Schedule a follow-up email to be sent to a patient at a specific time',
      parameters: {
        type: 'object',
        properties: {
          patient_email: {
            type: 'string',
            description: 'Patient email address',
          },
          patient_name: {
            type: 'string',
            description: 'Patient full name',
          },
          followup_type: {
            type: 'string',
            enum: ['reminder', 'feedback', 'followup', 'manual'],
            description: 'Type of follow-up: reminder (before appt), feedback (after appt), followup (general), manual (ad-hoc)',
          },
          scheduled_for: {
            type: 'string',
            description: 'When to send the email (ISO 8601 timestamp, e.g., "2025-01-15T14:00:00Z")',
          },
          appointment_id: {
            type: 'string',
            description: 'Optional: Link to specific appointment',
          },
          custom_subject: {
            type: 'string',
            description: 'Optional: Custom email subject line',
          },
          custom_body: {
            type: 'string',
            description: 'Optional: Custom email body text',
          },
        },
        required: ['patient_email', 'followup_type', 'scheduled_for'],
      },
    },
  },
  // TIER 1: Conversation Management Tools
  {
    type: 'function' as const,
    function: {
      name: 'get_conversations',
      description: 'Get list of conversations with filters (channel, status, date range, search). Essential for viewing patient interaction history.',
      parameters: {
        type: 'object',
        properties: {
          channel: {
            type: 'string',
            enum: ['whatsapp', 'voice', 'web'],
            description: 'Filter by communication channel',
          },
          status: {
            type: 'string',
            enum: ['active', 'pending', 'resolved', 'archived'],
            description: 'Filter by conversation status',
          },
          from_date: {
            type: 'string',
            description: 'Start date for filtering (YYYY-MM-DD)',
          },
          to_date: {
            type: 'string',
            description: 'End date for filtering (YYYY-MM-DD)',
          },
          search: {
            type: 'string',
            description: 'Search by patient name or phone number',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of conversations to return (default: 20)',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_conversation_thread',
      description: 'Get full message history for a specific conversation. Use this to understand context before responding.',
      parameters: {
        type: 'object',
        properties: {
          conversation_id: {
            type: 'string',
            description: 'The conversation ID',
          },
          include_metadata: {
            type: 'boolean',
            description: 'Include metadata like timestamps, read status, etc. (default: true)',
          },
        },
        required: ['conversation_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_patient',
      description: 'Search for patients by name, email, or phone number. Essential for finding existing patient records.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (name, email, or phone)',
          },
          search_type: {
            type: 'string',
            enum: ['name', 'email', 'phone', 'any'],
            description: 'Type of search to perform (default: any)',
          },
          limit: {
            type: 'number',
            description: 'Maximum results (default: 10)',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'send_message',
      description: 'Send a message in an existing conversation thread. Use for follow-ups, reminders, or replies.',
      parameters: {
        type: 'object',
        properties: {
          conversation_id: {
            type: 'string',
            description: 'The conversation ID to send message in',
          },
          message: {
            type: 'string',
            description: 'The message text to send',
          },
          channel: {
            type: 'string',
            enum: ['whatsapp', 'web', 'sms'],
            description: 'Channel to send message through',
          },
        },
        required: ['conversation_id', 'message', 'channel'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_conversation_status',
      description: 'Change conversation status (active, pending, resolved, archived). Use to manage conversation workflow.',
      parameters: {
        type: 'object',
        properties: {
          conversation_id: {
            type: 'string',
            description: 'The conversation ID',
          },
          status: {
            type: 'string',
            enum: ['active', 'pending', 'resolved', 'archived'],
            description: 'New status to set',
          },
          notes: {
            type: 'string',
            description: 'Optional notes about status change',
          },
        },
        required: ['conversation_id', 'status'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'assign_to_staff',
      description: 'Assign a conversation to a staff member. Use for escalation or routing.',
      parameters: {
        type: 'object',
        properties: {
          conversation_id: {
            type: 'string',
            description: 'The conversation ID',
          },
          staff_email: {
            type: 'string',
            description: 'Email of staff member to assign to',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Priority level for this assignment',
          },
          notes: {
            type: 'string',
            description: 'Optional notes for the staff member',
          },
        },
        required: ['conversation_id', 'staff_email'],
      },
    },
  },
  // TIER 2: Enhanced Appointment & Analytics Tools
  {
    type: 'function' as const,
    function: {
      name: 'check_availability',
      description: 'Check appointment slot availability for a specific date and time range. Always use this BEFORE booking.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Date to check (YYYY-MM-DD)',
          },
          doctor_name: {
            type: 'string',
            description: 'Optional: Specific doctor to check availability for',
          },
          appointment_type: {
            type: 'string',
            enum: ['consultation', 'followup', 'emergency', 'routine'],
            description: 'Type of appointment',
          },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_appointment_enhanced',
      description: 'Create appointment with full details including doctor assignment, type, and automatic calendar sync.',
      parameters: {
        type: 'object',
        properties: {
          patient_name: {
            type: 'string',
            description: 'Patient full name',
          },
          patient_email: {
            type: 'string',
            description: 'Patient email',
          },
          patient_phone: {
            type: 'string',
            description: 'Patient phone number',
          },
          appointment_date: {
            type: 'string',
            description: 'Date (YYYY-MM-DD)',
          },
          appointment_time: {
            type: 'string',
            description: 'Time (HH:MM 24-hour format)',
          },
          doctor_name: {
            type: 'string',
            description: 'Assigned doctor name',
          },
          appointment_type: {
            type: 'string',
            enum: ['consultation', 'followup', 'emergency', 'routine'],
            description: 'Type of appointment',
          },
          reason: {
            type: 'string',
            description: 'Reason/notes for appointment',
          },
          send_sms: {
            type: 'boolean',
            description: 'Send SMS confirmation (default: true)',
          },
          create_calendar_event: {
            type: 'boolean',
            description: 'Create Google Calendar event (default: true)',
          },
        },
        required: ['patient_name', 'patient_phone', 'appointment_date', 'appointment_time'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_analytics',
      description: 'Get analytics and metrics for specified time period. Supports daily, weekly, monthly views.',
      parameters: {
        type: 'object',
        properties: {
          metric_type: {
            type: 'string',
            enum: ['conversations', 'appointments', 'channel_distribution', 'response_time', 'satisfaction', 'all'],
            description: 'Type of analytics to retrieve',
          },
          time_period: {
            type: 'string',
            enum: ['today', 'week', 'month', 'custom'],
            description: 'Time period for analytics',
          },
          from_date: {
            type: 'string',
            description: 'Start date for custom period (YYYY-MM-DD)',
          },
          to_date: {
            type: 'string',
            description: 'End date for custom period (YYYY-MM-DD)',
          },
          group_by: {
            type: 'string',
            enum: ['day', 'week', 'month', 'channel', 'staff'],
            description: 'How to group the data',
          },
        },
        required: ['metric_type', 'time_period'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'send_whatsapp_message',
      description: 'Send a WhatsApp message directly to a patient. Use for proactive outreach, reminders, or updates.',
      parameters: {
        type: 'object',
        properties: {
          phone_number: {
            type: 'string',
            description: 'Patient phone number (with country code, e.g., +234...)',
          },
          message: {
            type: 'string',
            description: 'Message text to send',
          },
          template_name: {
            type: 'string',
            description: 'Optional: Pre-approved WhatsApp template name',
          },
          create_conversation: {
            type: 'boolean',
            description: 'Create new conversation thread if one doesn\'t exist (default: true)',
          },
        },
        required: ['phone_number', 'message'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'send_sms_reminder',
      description: 'Send SMS reminder for appointment or follow-up. HIPAA-compliant - minimal details only.',
      parameters: {
        type: 'object',
        properties: {
          phone_number: {
            type: 'string',
            description: 'Patient phone number',
          },
          appointment_id: {
            type: 'string',
            description: 'Appointment ID for reminder',
          },
          reminder_type: {
            type: 'string',
            enum: ['24h_before', '1h_before', 'custom'],
            description: 'Type of reminder',
          },
          custom_message: {
            type: 'string',
            description: 'Custom message (if reminder_type is custom)',
          },
        },
        required: ['phone_number', 'appointment_id', 'reminder_type'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_patient_summary',
      description: 'Get comprehensive patient summary including appointment history, conversation history, and key metrics.',
      parameters: {
        type: 'object',
        properties: {
          patient_identifier: {
            type: 'string',
            description: 'Patient phone, email, or ID',
          },
          include_conversations: {
            type: 'boolean',
            description: 'Include conversation history (default: true)',
          },
          include_appointments: {
            type: 'boolean',
            description: 'Include appointment history (default: true)',
          },
        },
        required: ['patient_identifier'],
      },
    },
  },
];

// PUBLIC TOOLS - Safe tools for public users (appointment booking with email confirmation)
export const publicTools = [
  {
    type: 'function' as const,
    function: {
      name: 'book_appointment_with_confirmation',
      description: 'Book an appointment for a patient and send confirmation email. Use this after collecting appointment details.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Patient full name',
          },
          email: {
            type: 'string',
            description: 'Patient email address',
          },
          phone: {
            type: 'string',
            description: 'Patient phone number',
          },
          date: {
            type: 'string',
            description: 'Appointment date in YYYY-MM-DD format (e.g., "2025-11-15"). For "tomorrow", calculate the actual date. Today is ' + new Date().toISOString().split('T')[0],
          },
          time: {
            type: 'string',
            description: 'Appointment time in 12-hour format with AM/PM (e.g., "2:30 PM")',
          },
          reason: {
            type: 'string',
            description: 'Reason for appointment',
          },
        },
        required: ['name', 'email', 'date', 'time'],
      },
    },
  },
];

// Legacy export for backward compatibility
export const tools = adminTools;

// Get tools based on mode (public vs authenticated)
export function getToolsForMode(mode: 'public' | 'private' = 'private'): any[] {
  return mode === 'public' ? publicTools : adminTools;
}

// ============================================
// TOOL IMPLEMENTATIONS
// ============================================

export async function getStats(metric: string): Promise<any> {
  // Route through assistant-call Edge Function for proper audit logging
  const supabaseUrl = getSupabaseUrl();
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;

  const response = await fetch(`${supabaseUrl}/functions/v1/assistant-call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      tool_name: 'get_stats',
      args: { metric },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Stats request failed:', errorText);
    throw new Error(`Failed to get stats (${response.status}): ${errorText}`);
  }

  return await validateJsonResponse(response);
}

export async function triggerAutomation(action: string, payload: any): Promise<any> {
  // Route through assistant-call Edge Function which forwards to n8n
  const supabaseUrl = getSupabaseUrl();
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;

  const response = await fetch(`${supabaseUrl}/functions/v1/assistant-call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      tool_name: action, // 'send_email', 'book_appointment', etc.
      args: payload,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Automation request failed:', errorText);
    throw new Error(`Automation failed (${response.status}): ${errorText}`);
  }

  return await validateJsonResponse(response);
}

export async function bookAppointmentWithConfirmation(
  name: string,
  email: string,
  phone: string,
  date: string,
  time: string,
  reason?: string
): Promise<any> {
  // Call n8n webhook directly for appointment booking + email confirmation
  const n8nWebhookBase = import.meta.env.VITE_N8N_WEBHOOK_BASE;
  if (!n8nWebhookBase) {
    throw new Error('N8N webhook not configured');
  }

  // Use the serenity-webhook-v2 endpoint (matches SIMPLIFIED_WORKING_WORKFLOW.json)
  const response = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Primary fields for n8n workflow
      message: `Appointment booking request from ${name}`,
      userId: email,
      channel: 'web',
      intent: 'appointment',

      // Patient contact (both formats for compatibility)
      patientName: name,
      patientEmail: email,
      patientPhone: phone,
      patient_name: name,
      patient_email: email,
      patient_phone: phone,

      // Appointment details (both formats)
      appointmentDate: date,
      appointmentTime: time,
      appointmentReason: reason || 'General consultation',
      appointmentType: 'consultation',
      appointment_date: date,
      appointment_time: time,
      appointment_reason: reason || 'General consultation',
      appointment_type: 'consultation',

      // Legacy fields for backward compatibility
      name,
      email,
      phone,
      date,
      time,
      reason: reason || 'General consultation',

      // Metadata
      source: 'groq_text_chat',
      action: 'book_appointment_with_confirmation',
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Appointment booking failed:', errorText);
    throw new Error(`Appointment booking failed: ${errorText}`);
  }

  return await validateJsonResponse(response);
}

// ============================================
// CALENDAR TOOL IMPLEMENTATIONS
// ============================================

export async function createCalendarEvent(args: {
  appointment_id: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
}): Promise<any> {
  const supabaseUrl = getSupabaseUrl();
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;

  const response = await fetch(`${supabaseUrl}/functions/v1/google-calendar-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      action: 'create',
      ...args,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Calendar event creation failed:', errorText);
    throw new Error(`Failed to create calendar event: ${errorText}`);
  }

  return await validateJsonResponse(response);
}

export async function rescheduleCalendarEvent(args: {
  appointment_id: string;
  google_calendar_event_id: string;
  new_date: string;
  new_time: string;
}): Promise<any> {
  const supabaseUrl = getSupabaseUrl();
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;

  const response = await fetch(`${supabaseUrl}/functions/v1/google-calendar-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      action: 'reschedule',
      ...args,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Calendar event rescheduling failed:', errorText);
    throw new Error(`Failed to reschedule calendar event: ${errorText}`);
  }

  return await validateJsonResponse(response);
}

export async function cancelCalendarEvent(args: {
  appointment_id: string;
  google_calendar_event_id: string;
}): Promise<any> {
  const supabaseUrl = getSupabaseUrl();
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;

  const response = await fetch(`${supabaseUrl}/functions/v1/google-calendar-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      action: 'cancel',
      ...args,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Calendar event cancellation failed:', errorText);
    throw new Error(`Failed to cancel calendar event: ${errorText}`);
  }

  return await validateJsonResponse(response);
}

export async function getAppointments(args: {
  date?: string;
  status?: string;
  limit?: number;
}): Promise<any> {
  const { date, status, limit = 10 } = args;

  let query = supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })
    .limit(limit);

  // If no date filter, get upcoming appointments
  if (!date) {
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('appointment_date', today);
  } else {
    query = query.eq('appointment_date', date);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to get appointments:', error.message);
    throw new Error(`Failed to get appointments: ${error.message}`);
  }

  return { ok: true, appointments: data || [] };
}

export async function scheduleFollowupEmail(args: {
  patient_email: string;
  patient_name?: string;
  followup_type: string;
  scheduled_for: string;
  appointment_id?: string;
  custom_subject?: string;
  custom_body?: string;
}): Promise<any> {
  const { data, error} = await supabase
    .from('scheduled_followups')
    .insert({
      patient_email: args.patient_email,
      patient_name: args.patient_name,
      followup_type: args.followup_type,
      scheduled_for: args.scheduled_for,
      appointment_id: args.appointment_id,
      custom_subject: args.custom_subject,
      custom_body: args.custom_body,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    logger.error('Failed to schedule follow-up email:', error.message);
    throw new Error(`Failed to schedule follow-up: ${error.message}`);
  }

  return {
    ok: true,
    message: `Follow-up email scheduled for ${args.scheduled_for}`,
    followup_id: data.id,
    data,
  };
}

// ============================================
// TIER 1: CONVERSATION MANAGEMENT IMPLEMENTATIONS
// ============================================

export async function getConversations(args: {
  channel?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  limit?: number;
}): Promise<any> {
  const { channel, status, from_date, to_date, search, limit = 20 } = args;

  let query = supabase
    .from('conversations')
    .select('*, messages(count)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (channel) query = query.eq('channel', channel);
  if (status) query = query.eq('status', status);
  if (from_date) query = query.gte('created_at', from_date);
  if (to_date) query = query.lte('created_at', to_date);

  // Search by patient name or phone
  if (search) {
    query = query.or(`patient_name.ilike.%${search}%,patient_phone.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to get conversations:', error.message);
    throw new Error(`Failed to get conversations: ${error.message}`);
  }

  return { ok: true, conversations: data || [], count: data?.length || 0 };
}

export async function getConversationThread(args: {
  conversation_id: string;
  include_metadata?: boolean;
}): Promise<any> {
  const { conversation_id, include_metadata = true } = args;

  // Get conversation details
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversation_id)
    .single();

  if (convError) {
    logger.error('Failed to get conversation:', convError.message);
    throw new Error(`Conversation not found: ${convError.message}`);
  }

  // Get all messages in thread
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true });

  if (msgError) {
    logger.error('Failed to get messages:', msgError.message);
    throw new Error(`Failed to get messages: ${msgError.message}`);
  }

  return {
    ok: true,
    conversation,
    messages: messages || [],
    message_count: messages?.length || 0,
  };
}

export async function searchPatient(args: {
  query: string;
  search_type?: string;
  limit?: number;
}): Promise<any> {
  const { query, search_type = 'any', limit = 10 } = args;

  let dbQuery = supabase
    .from('conversations')
    .select('patient_name, patient_phone, patient_email, id, channel, status, created_at')
    .limit(limit);

  // Apply search based on type
  switch (search_type) {
    case 'name':
      dbQuery = dbQuery.ilike('patient_name', `%${query}%`);
      break;
    case 'email':
      dbQuery = dbQuery.ilike('patient_email', `%${query}%`);
      break;
    case 'phone':
      dbQuery = dbQuery.ilike('patient_phone', `%${query}%`);
      break;
    default: // 'any'
      dbQuery = dbQuery.or(`patient_name.ilike.%${query}%,patient_email.ilike.%${query}%,patient_phone.ilike.%${query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    logger.error('Failed to search patients:', error.message);
    throw new Error(`Patient search failed: ${error.message}`);
  }

  // Deduplicate by phone number (primary identifier)
  const uniquePatients = data?.reduce((acc: any[], curr: any) => {
    if (!acc.find(p => p.patient_phone === curr.patient_phone)) {
      acc.push(curr);
    }
    return acc;
  }, []) || [];

  return { ok: true, patients: uniquePatients, count: uniquePatients.length };
}

export async function sendMessage(args: {
  conversation_id: string;
  message: string;
  channel: string;
}): Promise<any> {
  const { conversation_id, message, channel } = args;

  // Insert message into database
  const { data: msgData, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      content: message,
      sender: 'assistant',
      channel,
    })
    .select()
    .single();

  if (msgError) {
    logger.error('Failed to save message:', msgError.message);
    throw new Error(`Failed to save message: ${msgError.message}`);
  }

  // Get conversation details to send via appropriate channel
  const { data: conversation } = await supabase
    .from('conversations')
    .select('patient_phone, patient_email')
    .eq('id', conversation_id)
    .single();

  // Send via n8n webhook based on channel
  const n8nWebhookBase = import.meta.env.VITE_N8N_WEBHOOK_BASE;
  if (n8nWebhookBase && conversation) {
    try {
      await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          channel,
          message,
          phone: conversation.patient_phone,
          email: conversation.patient_email,
          conversation_id,
        }),
      });
    } catch (error) {
      logger.warn('Failed to send via n8n, message saved to DB only');
    }
  }

  return {
    ok: true,
    message: 'Message sent successfully',
    data: msgData,
  };
}

export async function updateConversationStatus(args: {
  conversation_id: string;
  status: string;
  notes?: string;
}): Promise<any> {
  const { conversation_id, status, notes } = args;

  const { data, error } = await supabase
    .from('conversations')
    .update({
      status,
      notes: notes || undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversation_id)
    .select()
    .single();

  if (error) {
    logger.error('Failed to update conversation status:', error.message);
    throw new Error(`Failed to update status: ${error.message}`);
  }

  return {
    ok: true,
    message: `Conversation status updated to ${status}`,
    data,
  };
}

export async function assignToStaff(args: {
  conversation_id: string;
  staff_email: string;
  priority?: string;
  notes?: string;
}): Promise<any> {
  const { conversation_id, staff_email, priority = 'medium', notes } = args;

  const { data, error } = await supabase
    .from('conversations')
    .update({
      assigned_to: staff_email,
      priority,
      assignment_notes: notes,
      status: 'assigned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversation_id)
    .select()
    .single();

  if (error) {
    logger.error('Failed to assign conversation:', error.message);
    throw new Error(`Failed to assign: ${error.message}`);
  }

  return {
    ok: true,
    message: `Conversation assigned to ${staff_email} with ${priority} priority`,
    data,
  };
}

// ============================================
// TIER 2: ENHANCED APPOINTMENT & ANALYTICS
// ============================================

export async function checkAvailability(args: {
  date: string;
  doctor_name?: string;
  appointment_type?: string;
}): Promise<any> {
  const { date, doctor_name, appointment_type } = args;

  // Get all appointments for the date
  let query = supabase
    .from('appointments')
    .select('appointment_time, doctor_name, status')
    .eq('appointment_date', date)
    .neq('status', 'cancelled');

  if (doctor_name) query = query.eq('doctor_name', doctor_name);

  const { data: bookedSlots, error } = await query;

  if (error) {
    logger.error('Failed to check availability:', error.message);
    throw new Error(`Availability check failed: ${error.message}`);
  }

  // Generate available slots (9 AM - 5 PM, 30-min intervals)
  const allSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    allSlots.push(`${String(hour).padStart(2, '0')}:00`);
    allSlots.push(`${String(hour).padStart(2, '0')}:30`);
  }

  // Filter out booked slots
  const bookedTimes = new Set(bookedSlots?.map(slot => slot.appointment_time) || []);
  const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));

  return {
    ok: true,
    date,
    available_slots: availableSlots,
    booked_slots: Array.from(bookedTimes),
    total_available: availableSlots.length,
    doctor_name: doctor_name || 'Any',
  };
}

export async function createAppointmentEnhanced(args: {
  patient_name: string;
  patient_email?: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  doctor_name?: string;
  appointment_type?: string;
  reason?: string;
  send_sms?: boolean;
  create_calendar_event?: boolean;
}): Promise<any> {
  const {
    patient_name,
    patient_email,
    patient_phone,
    appointment_date,
    appointment_time,
    doctor_name = 'General Practitioner',
    appointment_type = 'consultation',
    reason = 'General consultation',
    send_sms = true,
    create_calendar_event = true,
  } = args;

  // Create appointment in database
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      patient_name,
      patient_email,
      patient_phone,
      appointment_date,
      appointment_time,
      doctor_name,
      appointment_type,
      reason,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    logger.error('Failed to create appointment:', error.message);
    throw new Error(`Appointment creation failed: ${error.message}`);
  }

  const results: any = { ok: true, appointment, actions: [] };

  // Create calendar event if requested
  if (create_calendar_event) {
    try {
      await createCalendarEvent({
        appointment_id: appointment.id,
        patient_name,
        patient_email,
        patient_phone,
        appointment_date,
        appointment_time,
        reason,
      });
      results.actions.push('calendar_event_created');
    } catch (error: any) {
      logger.warn('Calendar event creation failed:', error.message);
      results.warnings = results.warnings || [];
      results.warnings.push('Calendar event not created');
    }
  }

  // Send SMS if requested
  if (send_sms) {
    try {
      await sendSmsReminder({
        phone_number: patient_phone,
        appointment_id: appointment.id,
        reminder_type: 'confirmation',
      });
      results.actions.push('sms_sent');
    } catch (error: any) {
      logger.warn('SMS sending failed:', error.message);
      results.warnings = results.warnings || [];
      results.warnings.push('SMS not sent');
    }
  }

  return results;
}

export async function getAnalytics(args: {
  metric_type: string;
  time_period: string;
  from_date?: string;
  to_date?: string;
  group_by?: string;
}): Promise<any> {
  const { metric_type, time_period, from_date, to_date, group_by } = args;

  // Calculate date range
  let startDate: string;
  let endDate: string = new Date().toISOString().split('T')[0];

  switch (time_period) {
    case 'today':
      startDate = endDate;
      break;
    case 'week':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    case 'month':
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    case 'custom':
      startDate = from_date || endDate;
      endDate = to_date || endDate;
      break;
    default:
      startDate = endDate;
  }

  const analytics: any = { ok: true, period: { start: startDate, end: endDate } };

  // Get metrics based on type
  if (metric_type === 'conversations' || metric_type === 'all') {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, channel, status, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59');

    analytics.conversations = {
      total: conversations?.length || 0,
      by_channel: conversations?.reduce((acc: any, conv: any) => {
        acc[conv.channel] = (acc[conv.channel] || 0) + 1;
        return acc;
      }, {}),
      by_status: conversations?.reduce((acc: any, conv: any) => {
        acc[conv.status] = (acc[conv.status] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  if (metric_type === 'appointments' || metric_type === 'all') {
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, status, appointment_type, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59');

    analytics.appointments = {
      total: appointments?.length || 0,
      by_status: appointments?.reduce((acc: any, appt: any) => {
        acc[appt.status] = (acc[appt.status] || 0) + 1;
        return acc;
      }, {}),
      by_type: appointments?.reduce((acc: any, appt: any) => {
        acc[appt.appointment_type || 'general'] = (acc[appt.appointment_type || 'general'] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  return analytics;
}

export async function sendWhatsappMessage(args: {
  phone_number: string;
  message: string;
  template_name?: string;
  create_conversation?: boolean;
}): Promise<any> {
  const { phone_number, message, template_name, create_conversation = true } = args;

  const n8nWebhookBase = import.meta.env.VITE_N8N_WEBHOOK_BASE;
  if (!n8nWebhookBase) {
    throw new Error('N8N webhook not configured');
  }

  const response = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'send_whatsapp',
      phone: phone_number,
      message,
      template: template_name,
      create_conversation,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp send failed: ${error}`);
  }

  return {
    ok: true,
    message: 'WhatsApp message sent successfully',
    phone: phone_number,
  };
}

export async function sendSmsReminder(args: {
  phone_number: string;
  appointment_id: string;
  reminder_type: string;
  custom_message?: string;
}): Promise<any> {
  const { phone_number, appointment_id, reminder_type, custom_message } = args;

  // Get appointment details
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointment_id)
    .single();

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  // Generate message based on reminder type
  let messageText = custom_message;
  if (!messageText) {
    const apptDate = appointment.appointment_date;
    const apptTime = appointment.appointment_time;

    switch (reminder_type) {
      case '24h_before':
        messageText = `Reminder: You have an appointment tomorrow at ${apptTime}. Serenity Hospital.`;
        break;
      case '1h_before':
        messageText = `Reminder: Your appointment is in 1 hour at ${apptTime}. Serenity Hospital.`;
        break;
      case 'confirmation':
        messageText = `Appointment confirmed for ${apptDate} at ${apptTime}. Serenity Hospital.`;
        break;
      default:
        messageText = `Appointment reminder for ${apptDate} at ${apptTime}. Serenity Hospital.`;
    }
  }

  const n8nWebhookBase = import.meta.env.VITE_N8N_WEBHOOK_BASE;
  if (!n8nWebhookBase) {
    throw new Error('N8N webhook not configured');
  }

  const response = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'send_sms',
      phone: phone_number,
      message: messageText,
      appointment_id,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SMS send failed: ${error}`);
  }

  return {
    ok: true,
    message: 'SMS reminder sent successfully',
    phone: phone_number,
  };
}

export async function getPatientSummary(args: {
  patient_identifier: string;
  include_conversations?: boolean;
  include_appointments?: boolean;
}): Promise<any> {
  const {
    patient_identifier,
    include_conversations = true,
    include_appointments = true,
  } = args;

  const summary: any = { ok: true };

  // Search for patient
  const searchResult = await searchPatient({
    query: patient_identifier,
    search_type: 'any',
    limit: 1,
  });

  if (!searchResult.patients || searchResult.patients.length === 0) {
    throw new Error('Patient not found');
  }

  const patient = searchResult.patients[0];
  summary.patient = patient;

  // Get conversations if requested
  if (include_conversations) {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*, messages(count)')
      .eq('patient_phone', patient.patient_phone)
      .order('created_at', { ascending: false });

    summary.conversations = {
      total: conversations?.length || 0,
      recent: conversations?.slice(0, 5) || [],
    };
  }

  // Get appointments if requested
  if (include_appointments) {
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_phone', patient.patient_phone)
      .order('appointment_date', { ascending: false });

    summary.appointments = {
      total: appointments?.length || 0,
      upcoming: appointments?.filter(a =>
        new Date(a.appointment_date) >= new Date() && a.status !== 'cancelled'
      ) || [],
      past: appointments?.filter(a =>
        new Date(a.appointment_date) < new Date()
      )?.slice(0, 5) || [],
    };
  }

  return summary;
}

// ============================================
// TOOL VALIDATION & TESTING
// ============================================

/**
 * Test tool execution and return explicit success/failure status
 * Returns: { ok: true, data: any } or { ok: false, error: string }
 */
export async function testToolExecution(toolName: string, args: any): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    switch (toolName) {
      case 'get_stats': {
        const result = await getStats(args.metric);
        return { ok: true, data: result };
      }

      case 'trigger_automation': {
        const result = await triggerAutomation(args.action, args.payload);
        return { ok: true, data: result };
      }

      case 'create_calendar_event': {
        const result = await createCalendarEvent(args);
        return { ok: true, data: result };
      }

      case 'reschedule_calendar_event': {
        const result = await rescheduleCalendarEvent(args);
        return { ok: true, data: result };
      }

      case 'cancel_calendar_event': {
        const result = await cancelCalendarEvent(args);
        return { ok: true, data: result };
      }

      case 'get_appointments': {
        const result = await getAppointments(args);
        return { ok: true, data: result };
      }

      case 'schedule_followup_email': {
        const result = await scheduleFollowupEmail(args);
        return { ok: true, data: result };
      }

      // Tier 1: Conversation Management
      case 'get_conversations': {
        const result = await getConversations(args);
        return { ok: true, data: result };
      }

      case 'get_conversation_thread': {
        const result = await getConversationThread(args);
        return { ok: true, data: result };
      }

      case 'search_patient': {
        const result = await searchPatient(args);
        return { ok: true, data: result };
      }

      case 'send_message': {
        const result = await sendMessage(args);
        return { ok: true, data: result };
      }

      case 'update_conversation_status': {
        const result = await updateConversationStatus(args);
        return { ok: true, data: result };
      }

      case 'assign_to_staff': {
        const result = await assignToStaff(args);
        return { ok: true, data: result };
      }

      // Tier 2: Enhanced Appointment & Analytics
      case 'check_availability': {
        const result = await checkAvailability(args);
        return { ok: true, data: result };
      }

      case 'create_appointment_enhanced': {
        const result = await createAppointmentEnhanced(args);
        return { ok: true, data: result };
      }

      case 'get_analytics': {
        const result = await getAnalytics(args);
        return { ok: true, data: result };
      }

      case 'send_whatsapp_message': {
        const result = await sendWhatsappMessage(args);
        return { ok: true, data: result };
      }

      case 'send_sms_reminder': {
        const result = await sendSmsReminder(args);
        return { ok: true, data: result };
      }

      case 'get_patient_summary': {
        const result = await getPatientSummary(args);
        return { ok: true, data: result };
      }

      default:
        return { ok: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

// ============================================
// TOOL EXECUTION ROUTER
// ============================================

export async function executeTool(toolCall: any): Promise<string> {
  const { name, arguments: args } = toolCall.function;
  const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;

  try {
    switch (name) {
      case 'get_stats':
        const stats = await getStats(parsedArgs.metric);
        return JSON.stringify({ success: true, data: stats });

      case 'trigger_automation':
        const result = await triggerAutomation(parsedArgs.action, parsedArgs.payload);
        return JSON.stringify({ success: true, data: result });

      case 'book_appointment_with_confirmation':
        const booking = await bookAppointmentWithConfirmation(
          parsedArgs.name,
          parsedArgs.email,
          parsedArgs.phone,
          parsedArgs.date,
          parsedArgs.time,
          parsedArgs.reason
        );
        return JSON.stringify({
          success: true,
          message: 'Appointment booked and confirmation email sent!',
          data: booking
        });

      case 'create_calendar_event':
        const createResult = await createCalendarEvent(parsedArgs);
        return JSON.stringify({
          success: true,
          message: 'Calendar event created successfully!',
          data: createResult
        });

      case 'reschedule_calendar_event':
        const rescheduleResult = await rescheduleCalendarEvent(parsedArgs);
        return JSON.stringify({
          success: true,
          message: 'Calendar event rescheduled successfully!',
          data: rescheduleResult
        });

      case 'cancel_calendar_event':
        const cancelResult = await cancelCalendarEvent(parsedArgs);
        return JSON.stringify({
          success: true,
          message: 'Calendar event cancelled successfully!',
          data: cancelResult
        });

      case 'get_appointments':
        const appointments = await getAppointments(parsedArgs);
        return JSON.stringify({
          success: true,
          data: appointments
        });

      case 'schedule_followup_email':
        const followupResult = await scheduleFollowupEmail(parsedArgs);
        return JSON.stringify({
          success: true,
          message: followupResult.message,
          data: followupResult
        });

      // Tier 1: Conversation Management Tools
      case 'get_conversations':
        const conversations = await getConversations(parsedArgs);
        return JSON.stringify({
          success: true,
          data: conversations
        });

      case 'get_conversation_thread':
        const thread = await getConversationThread(parsedArgs);
        return JSON.stringify({
          success: true,
          data: thread
        });

      case 'search_patient':
        const patients = await searchPatient(parsedArgs);
        return JSON.stringify({
          success: true,
          data: patients
        });

      case 'send_message':
        const msgResult = await sendMessage(parsedArgs);
        return JSON.stringify({
          success: true,
          message: msgResult.message,
          data: msgResult
        });

      case 'update_conversation_status':
        const statusUpdate = await updateConversationStatus(parsedArgs);
        return JSON.stringify({
          success: true,
          message: statusUpdate.message,
          data: statusUpdate
        });

      case 'assign_to_staff':
        const assignment = await assignToStaff(parsedArgs);
        return JSON.stringify({
          success: true,
          message: assignment.message,
          data: assignment
        });

      // Tier 2: Enhanced Appointment & Analytics
      case 'check_availability':
        const availability = await checkAvailability(parsedArgs);
        return JSON.stringify({
          success: true,
          data: availability
        });

      case 'create_appointment_enhanced':
        const enhancedAppt = await createAppointmentEnhanced(parsedArgs);
        return JSON.stringify({
          success: true,
          message: 'Appointment created with enhanced features',
          data: enhancedAppt
        });

      case 'get_analytics':
        const analyticsData = await getAnalytics(parsedArgs);
        return JSON.stringify({
          success: true,
          data: analyticsData
        });

      case 'send_whatsapp_message':
        const whatsappResult = await sendWhatsappMessage(parsedArgs);
        return JSON.stringify({
          success: true,
          message: whatsappResult.message,
          data: whatsappResult
        });

      case 'send_sms_reminder':
        const smsResult = await sendSmsReminder(parsedArgs);
        return JSON.stringify({
          success: true,
          message: smsResult.message,
          data: smsResult
        });

      case 'get_patient_summary':
        const patientSummary = await getPatientSummary(parsedArgs);
        return JSON.stringify({
          success: true,
          data: patientSummary
        });

      default:
        return JSON.stringify({ success: false, error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ success: false, error: error.message });
  }
}

// ============================================
// MAIN CHAT COMPLETION WITH TOOL CALLING
// ============================================

export async function chatWithTools(
  messages: Array<{ role: string; content: string }>,
  onToolCall?: (toolName: string, args: any) => Promise<boolean>, // Return true to proceed, false to cancel
  toolsToUse: any[] = adminTools, // Tools to make available
  systemPromptOverride?: string // Optional custom system prompt
): Promise<string> {
  const MAX_RETRIES = 3;
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      return await executeChatWithTools(messages, onToolCall, toolsToUse, systemPromptOverride);
    } catch (error: any) {
      retryCount++;
      
      // Don't retry authentication errors
      if (error.message?.includes('Authentication failed')) {
        throw error;
      }
      
      // Don't retry permission errors
      if (error.message?.includes('permission')) {
        throw error;
      }
      
      // Log retry attempt
      logger.warn(`Chat request failed (attempt ${retryCount}/${MAX_RETRIES}):`, error.message);
      
      if (retryCount >= MAX_RETRIES) {
        logger.error('Max retries reached, throwing error');
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
  
  throw new Error('Unexpected error in retry loop');
}

async function executeChatWithTools(
  messages: Array<{ role: string; content: string }>,
  onToolCall?: (toolName: string, args: any) => Promise<boolean>,
  toolsToUse: any[] = adminTools,
  systemPromptOverride?: string
): Promise<string> {
  const defaultSystemPrompt = `You are a helpful medical assistant for Serenity Royale Hospital.
You can view statistics and trigger automations via approved tools.
Always be professional, HIPAA-compliant, and ask for confirmation before sensitive actions.
If asked about patient data you don't have access to, politely explain you can only view aggregate stats.`;

  const systemPrompt = {
    role: 'system',
    content: systemPromptOverride || defaultSystemPrompt,
  };

  let fullMessages = [systemPrompt, ...messages];
  let iterations = 0;
  const MAX_ITERATIONS = 5;
  const supabaseUrl = getSupabaseUrl();

  // Get auth token for Edge Function
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;
  
  // Log authentication status for debugging
  if (!authToken) {
    logger.warn('No authentication token found - using anonymous access');
  } else {
    logger.log('Using authenticated session for groq-chat request');
  }

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Call Groq via Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/groq-chat`;
    
    // Prepare headers with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    };
    
    // Only add Authorization header if we have a valid token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: fullMessages,
        model: 'llama-3.1-8b-instant',
        tools: toolsToUse,
      tool_choice: toolsToUse.length > 0 ? 'auto' : 'none',
      temperature: 0.7,
      max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      logger.error('Groq Edge Function error:', error);
      
      // Provide user-friendly error messages based on status codes
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again or contact support if the issue persists.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to perform this action. Please contact an administrator.');
      } else if (response.status === 404) {
        throw new Error('The requested service is temporarily unavailable. Please try again later.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Our team has been notified. Please try again in a few minutes.');
      } else {
        throw new Error(`Service error: ${response.status}. Please try again or contact support.`);
      }
    }

    const completion = await validateJsonResponse(response);

    // Handle tool results from Edge Function
    if (completion.tool_results && completion.tool_results.length > 0) {
      const toolResults = completion.tool_results;

      // Validate tool execution success and check for user denials
      let allToolsSucceeded = true;
      for (const toolResult of toolResults) {
        const content = JSON.parse(toolResult.content);

        // Check if tool execution failed
        if (content.error) {
          logger.error(`Tool ${toolResult.name} failed:`, content.error);
          allToolsSucceeded = false;
        }

        // Check if tool was denied by user (special error code)
        if (content.error && content.error.includes('User denied')) {
          logger.log(`Tool ${toolResult.name} denied by user`);
          return "I understand you don't want to proceed with that action. Is there anything else I can help you with?";
        }
      }

      // Add assistant message + tool results to conversation
      const assistantMessage = completion.choices?.[0]?.message;
      if (assistantMessage) {
        fullMessages = [
          ...fullMessages,
          assistantMessage,
          ...toolResults,
        ];
      }

      // Continue loop to get final response
      continue;
    }

    const message = completion.choices?.[0]?.message;

    if (!message) {
      throw new Error('No response from Groq');
    }

    // Check if there are tool calls that need user confirmation BEFORE execution
    if (message.tool_calls && message.tool_calls.length > 0 && onToolCall) {
      // Check each tool call for user approval
      for (const toolCall of message.tool_calls) {
        const { name, arguments: args } = toolCall.function;
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;

        // Ask for user confirmation
        const approved = await onToolCall(name, parsedArgs);

        if (!approved) {
          // User denied the action - return immediately without executing
          return "I understand you don't want to proceed with that action. Is there anything else I can help you with?";
        }
      }
      // If we get here, user approved all tool calls
      // Continue to add message and let Edge Function execute tools on next iteration
    }

    // If no tool calls, return the final response
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content || 'I apologize, I could not generate a response.';
    }

    // Tool calls were made and approved - Edge Function will execute them on next iteration
    // Add message to conversation and continue
    fullMessages = [
      ...fullMessages,
      message,
    ];
  }
  
  return 'I apologize, I reached the maximum number of tool calls. Please try rephrasing your request.';
}
