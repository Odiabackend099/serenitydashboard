import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import { checkRateLimit, getClientId, rateLimitResponse } from "../_shared/rate-limiter.ts";
import { logger } from "../_shared/hipaa.ts";

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
}

interface CalendarRequest {
  action: 'create' | 'reschedule' | 'cancel';
  appointment_id: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  appointment_date?: string;
  appointment_time?: string;
  reason?: string;
  new_date?: string;
  new_time?: string;
  google_calendar_event_id?: string;
}

/**
 * Calculate end time for appointment (default 30 minutes)
 */
function calculateEndTime(date: string, time: string, durationMinutes: number = 30): string {
  const startDateTime = new Date(`${date}T${time}`);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

  const hours = String(endDateTime.getHours()).padStart(2, '0');
  const minutes = String(endDateTime.getMinutes()).padStart(2, '0');
  const seconds = String(endDateTime.getSeconds()).padStart(2, '0');

  return `${date}T${hours}:${minutes}:${seconds}`;
}

/**
 * Get Google Calendar access token using refresh token
 */
async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    logger.error('Failed to get Google access token', { error });
    throw new Error('Failed to authenticate with Google Calendar');
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

/**
 * Create a Google Calendar event
 */
async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: CalendarEvent
): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    logger.error('Failed to create calendar event', { error: error.substring(0, 200) });
    throw new Error('Failed to create calendar event');
  }

  const data = await response.json();
  return data.id;
}

/**
 * Update a Google Calendar event
 */
async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...updates, sendUpdates: 'all' }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    logger.error('Failed to update calendar event', { eventId, error: error.substring(0, 200) });
    throw new Error('Failed to update calendar event');
  }
}

/**
 * Delete a Google Calendar event
 */
async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}?sendUpdates=all`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    logger.error('Failed to delete calendar event', { eventId, error: error.substring(0, 200) });
    throw new Error('Failed to delete calendar event');
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req);
  }

  // Rate limiting
  const clientId = getClientId(req);
  const rateLimit = checkRateLimit(clientId, { windowMs: 60000, max: 20 }); // 20 req/min

  if (!rateLimit.allowed) {
    logger.warn('Rate limit exceeded', { clientId });
    return rateLimitResponse(rateLimit);
  }

  try {
    // Get Google Calendar credentials from environment
    const gcalClientId = Deno.env.get('GCAL_CLIENT_ID');
    const gcalClientSecret = Deno.env.get('GCAL_CLIENT_SECRET');
    const gcalRefreshToken = Deno.env.get('GCAL_REFRESH_TOKEN');
    const gcalCalendarId = Deno.env.get('GCAL_CALENDAR_ID') || 'primary';
    const gcalTimezone = Deno.env.get('GCAL_TIMEZONE') || 'Africa/Lagos';

    if (!gcalClientId || !gcalClientSecret || !gcalRefreshToken) {
      logger.error('Google Calendar not configured', {
        hasClientId: !!gcalClientId,
        hasClientSecret: !!gcalClientSecret,
        hasRefreshToken: !!gcalRefreshToken,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Google Calendar integration not configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request
    const requestData: CalendarRequest = await req.json();
    const { action, appointment_id } = requestData;

    logger.info('Calendar sync request', { action, appointment_id });

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get access token
    const accessToken = await getAccessToken(gcalClientId, gcalClientSecret, gcalRefreshToken);

    let result: any = { ok: false };

    switch (action) {
      case 'create': {
        const {
          patient_name,
          patient_email,
          patient_phone,
          appointment_date,
          appointment_time,
          reason,
        } = requestData;

        if (!appointment_date || !appointment_time) {
          throw new Error('Missing required fields: appointment_date, appointment_time');
        }

        // Create calendar event
        const event: CalendarEvent = {
          summary: `Appointment: ${patient_name || 'Patient'}`,
          description: [
            `Reason: ${reason || 'General consultation'}`,
            patient_phone ? `Phone: ${patient_phone}` : '',
            `Booked via Serenity AI Assistant`,
          ].filter(Boolean).join('\n'),
          start: {
            dateTime: `${appointment_date}T${appointment_time}`,
            timeZone: gcalTimezone,
          },
          end: {
            dateTime: calculateEndTime(appointment_date, appointment_time, 30),
            timeZone: gcalTimezone,
          },
          attendees: patient_email ? [{ email: patient_email }] : [],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 24 hours before
              { method: 'popup', minutes: 30 },       // 30 minutes before
            ],
          },
        };

        const eventId = await createCalendarEvent(accessToken, gcalCalendarId, event);

        // Update appointment in database with Google Calendar event ID
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ google_calendar_event_id: eventId })
          .eq('id', appointment_id);

        if (updateError) {
          logger.error('Failed to update appointment with event ID', {
            appointment_id,
            eventId,
            error: updateError.message
          });
        }

        logger.info('Calendar event created', { appointment_id, eventId });

        result = {
          ok: true,
          action: 'create',
          event_id: eventId,
          appointment_id,
        };
        break;
      }

      case 'reschedule': {
        const { new_date, new_time, google_calendar_event_id } = requestData;

        if (!new_date || !new_time || !google_calendar_event_id) {
          throw new Error('Missing required fields: new_date, new_time, google_calendar_event_id');
        }

        // Update calendar event
        await updateCalendarEvent(accessToken, gcalCalendarId, google_calendar_event_id, {
          start: {
            dateTime: `${new_date}T${new_time}`,
            timeZone: gcalTimezone,
          },
          end: {
            dateTime: calculateEndTime(new_date, new_time, 30),
            timeZone: gcalTimezone,
          },
        });

        logger.info('Calendar event rescheduled', {
          appointment_id,
          event_id: google_calendar_event_id
        });

        result = {
          ok: true,
          action: 'reschedule',
          event_id: google_calendar_event_id,
          appointment_id,
        };
        break;
      }

      case 'cancel': {
        const { google_calendar_event_id } = requestData;

        if (!google_calendar_event_id) {
          throw new Error('Missing required field: google_calendar_event_id');
        }

        // Delete calendar event
        await deleteCalendarEvent(accessToken, gcalCalendarId, google_calendar_event_id);

        logger.info('Calendar event cancelled', {
          appointment_id,
          event_id: google_calendar_event_id
        });

        result = {
          ok: true,
          action: 'cancel',
          event_id: google_calendar_event_id,
          appointment_id,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    logger.error('Error in google-calendar-sync', { error: error.message });
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
