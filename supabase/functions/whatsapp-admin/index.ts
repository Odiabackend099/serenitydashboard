import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { logger } from '../_shared/hipaa.ts';

const META_ACCESS_TOKEN = 'EAAJaXqNZCT2sBP10xUw1ZCci6ZAolSXpg8dWZB5Y9CYF44lkQO6tDX1ZCOABvuktlTeNdZC2JjZBGa3h7cuzmj3jjTXYPSZAHqYf8mrhqWwQ1WcEfWHerk1AQ2s3wAZAuxuVBR3yKHorSFjyLxKC1mSOo24IzXMVAnyV0FzdFy04lv8inw6ditrgdkA6GSr2fZBUbC09hUExqcXGNZAF7DsYE7NZC7fjgrZACc2FtVeSLcHrt8MONF48ZD';
const PHONE_NUMBER_ID = '825467040645950';

interface SendMessageRequest {
  action: 'send_message' | 'send_booking_confirmation' | 'send_reschedule' | 'send_cancellation' | 'get_summary';
  phone?: string;
  message?: string;
  appointment_id?: string;
  date_range?: { start: string; end: string };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication (business owner only)
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body: SendMessageRequest = await req.json();
    logger.info('WhatsApp admin action', { action: body.action, userId: user.id });

    // Execute action
    let result;
    switch (body.action) {
      case 'send_message':
        if (!body.phone || !body.message) {
          return new Response(JSON.stringify({ error: 'Phone and message required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await sendCustomMessage(supabase, body.phone, body.message);
        break;

      case 'send_booking_confirmation':
        if (!body.appointment_id) {
          return new Response(JSON.stringify({ error: 'Appointment ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await sendBookingConfirmation(supabase, body.appointment_id);
        break;

      case 'send_reschedule':
        if (!body.appointment_id) {
          return new Response(JSON.stringify({ error: 'Appointment ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await sendRescheduleConfirmation(supabase, body.appointment_id);
        break;

      case 'send_cancellation':
        if (!body.appointment_id) {
          return new Response(JSON.stringify({ error: 'Appointment ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await sendCancellationConfirmation(supabase, body.appointment_id);
        break;

      case 'get_summary':
        result = await getConversationSummary(supabase, body.date_range);
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    logger.error('WhatsApp admin error', { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
    });
  }
});

// Send custom WhatsApp message
async function sendCustomMessage(supabase: any, phone: string, message: string) {
  const response = await fetch(
    `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp API error: ${errorText}`);
  }

  // Log message to database
  const { data: conversation } = await supabase
    .from('whatsapp_conversations')
    .select('id')
    .eq('patient_phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (conversation) {
    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      message_type: 'text',
      message_content: message,
      from_phone: 'business',
      to_phone: phone,
      timestamp: new Date().toISOString()
    });
  }

  logger.info('WhatsApp message sent', { phone: phone.substring(0, 8) + '***' });
  return { success: true, message_sent: true };
}

// Send booking confirmation
async function sendBookingConfirmation(supabase: any, appointmentId: string) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (error || !appointment) {
    throw new Error('Appointment not found');
  }

  const message = `✅ Appointment Confirmed!

Dear ${appointment.patient_name},

Your appointment at Serenity Royale Hospital is confirmed:

📅 Date: ${appointment.date}
🕐 Time: ${appointment.time}
📋 Reason: ${appointment.reason}

Please arrive 10 minutes early.

If you need to reschedule, reply to this message.

See you soon! 😊`;

  return await sendCustomMessage(supabase, appointment.patient_phone, message);
}

// Send reschedule confirmation
async function sendRescheduleConfirmation(supabase: any, appointmentId: string) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (error || !appointment) {
    throw new Error('Appointment not found');
  }

  const message = `🔄 Appointment Rescheduled

Dear ${appointment.patient_name},

Your appointment has been rescheduled:

📅 New Date: ${appointment.date}
🕐 New Time: ${appointment.time}

Please arrive 10 minutes early.

If you have any questions, reply to this message.

Thank you! 😊`;

  return await sendCustomMessage(supabase, appointment.patient_phone, message);
}

// Send cancellation confirmation
async function sendCancellationConfirmation(supabase: any, appointmentId: string) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (error || !appointment) {
    throw new Error('Appointment not found');
  }

  const message = `❌ Appointment Cancelled

Dear ${appointment.patient_name},

Your appointment scheduled for ${appointment.date} at ${appointment.time} has been cancelled.

To book a new appointment, reply to this message with your preferred date and time.

We hope to see you soon! 😊`;

  return await sendCustomMessage(supabase, appointment.patient_phone, message);
}

// Get conversation summary
async function getConversationSummary(supabase: any, dateRange?: { start: string; end: string }) {
  const start = dateRange?.start || new Date().toISOString().split('T')[0];
  const end = dateRange?.end || new Date().toISOString().split('T')[0];

  const { data: analytics, error: analyticsError } = await supabase
    .from('conversation_analytics')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false });

  if (analyticsError) {
    throw new Error(`Failed to fetch analytics: ${analyticsError.message}`);
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .gte('created_at', start)
    .lte('created_at', end + 'T23:59:59');

  if (conversationsError) {
    throw new Error(`Failed to fetch conversations: ${conversationsError.message}`);
  }

  // Calculate summary totals
  const summary = {
    total_conversations: conversations?.length || 0,
    total_appointments_booked: analytics?.reduce((sum: number, day: any) => sum + day.appointments_booked, 0) || 0,
    total_appointments_rescheduled: analytics?.reduce((sum: number, day: any) => sum + day.appointments_rescheduled, 0) || 0,
    total_appointments_cancelled: analytics?.reduce((sum: number, day: any) => sum + day.appointments_cancelled, 0) || 0,
    total_messages: analytics?.reduce((sum: number, day: any) => sum + day.total_messages, 0) || 0,
    total_availability_checks: analytics?.reduce((sum: number, day: any) => sum + day.availability_checks, 0) || 0,
    total_general_inquiries: analytics?.reduce((sum: number, day: any) => sum + day.general_inquiries, 0) || 0
  };

  return {
    success: true,
    date_range: { start, end },
    analytics,
    conversations,
    summary
  };
}
