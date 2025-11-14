import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import { checkRateLimit, getClientId, rateLimitResponse } from "../_shared/rate-limiter.ts";
import { logger, sanitizeForAuditLog } from "../_shared/hipaa.ts";

interface ChatMessage {
  role: string;
  content: string;
}

interface GroqRequest {
  messages: ChatMessage[];
  model?: string;
  tools?: any[];
  tool_choice?: string;
  temperature?: number;
  max_tokens?: number;
  mode?: 'public' | 'private'; // WhatsApp integration: auto-load public tools
  patient_phone?: string; // WhatsApp patient identifier (+234...)
  message_type?: string; // text, voice, image, document
}

// Zod validation schemas
const EmailSchema = z.string().email().max(254);
const PhoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/);
const NameSchema = z.string().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/);
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const TimeSchema = z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i);
const ReasonSchema = z.string().min(3).max(500);

const AppointmentBookingSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  phone: PhoneSchema,
  date: DateSchema,
  time: TimeSchema,
  reason: ReasonSchema
});

// Helper function to log WhatsApp conversations to database
async function logWhatsAppConversation(
  supabase: any,
  patientPhone: string,
  inboundMessage: string,
  messageType: string,
  aiResponse: string,
  toolExecuted?: string,
  toolResult?: any
) {
  try {
    // 1. Find or create conversation
    let { data: conversation, error: convError } = await supabase
      .from('whatsapp_conversations')
      .select('id, patient_email, patient_name')
      .eq('patient_phone', patientPhone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (convError || !conversation) {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('whatsapp_conversations')
        .insert({
          patient_phone: patientPhone,
          conversation_status: 'active',
          last_message_from: 'patient',
          last_message_at: new Date().toISOString(),
          conversation_context: {
            topic: toolExecuted || 'general_inquiry',
            message_count: 1
          }
        })
        .select()
        .single();

      if (createError) {
        logger.error('Failed to create conversation', { error: createError.message });
        return;
      }
      conversation = newConv;
    } else {
      // Update existing conversation
      await supabase
        .from('whatsapp_conversations')
        .update({
          last_message_from: 'business',
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);
    }

    // 2. Log inbound message
    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'inbound',
      message_type: messageType,
      message_content: inboundMessage,
      from_phone: patientPhone,
      to_phone: 'business',
      timestamp: new Date().toISOString()
    });

    // 3. Log outbound AI response
    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      message_type: 'text',
      message_content: aiResponse,
      from_phone: 'business',
      to_phone: patientPhone,
      ai_response: aiResponse,
      tool_executed: toolExecuted || null,
      tool_result: toolResult || null,
      timestamp: new Date().toISOString()
    });

    // 4. Update analytics
    const today = new Date().toISOString().split('T')[0];
    await supabase.rpc('increment_analytics', {
      p_date: today,
      p_tool_executed: toolExecuted
    });

    logger.info('WhatsApp conversation logged', {
      conversationId: conversation.id,
      patientPhone: patientPhone.substring(0, 8) + '***',
      toolExecuted
    });

  } catch (error: any) {
    logger.error('Failed to log WhatsApp conversation', { error: error.message });
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
  const rateLimit = checkRateLimit(clientId, { windowMs: 60000, max: 10 }); // 10 req/min

  if (!rateLimit.allowed) {
    logger.warn('Rate limit exceeded', { clientId });
    return rateLimitResponse(rateLimit);
  }

  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    // Parse request
    const {
      messages,
      model = 'llama-3.1-8b-instant',
      tools: requestTools,
      tool_choice = 'auto',
      temperature = 0.7,
      max_tokens = 1000,
      mode,
      patient_phone,
      message_type,
    }: GroqRequest = await req.json();

    // Auto-load public tools for WhatsApp integration
    const publicTools = mode === 'public' ? [
      {
        type: 'function',
        function: {
          name: 'book_appointment_with_confirmation',
          description: 'Book an appointment and send confirmation email. **CRITICAL**: DO NOT call this tool until you have collected ALL required information from the user: name, email, phone, date, time, and reason. If any information is missing, ASK the user for it first before calling this tool.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Patient full name' },
              email: { type: 'string', description: 'Patient email address' },
              phone: { type: 'string', description: 'Patient phone number' },
              date: { type: 'string', description: 'Appointment date in YYYY-MM-DD format (e.g., "2025-11-15"). For "tomorrow", calculate the actual date. Today is ' + new Date().toISOString().split('T')[0] },
              time: { type: 'string', description: 'Appointment time in 12-hour format with AM/PM (e.g., "2:30 PM")' },
              reason: { type: 'string', description: 'Reason for appointment' }
            },
            required: ['name', 'email', 'phone', 'date', 'time', 'reason']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_my_appointments',
          description: 'Get patient\'s appointments by email. Use this when a patient asks "show my appointments" or "what appointments do I have".',
          parameters: {
            type: 'object',
            properties: {
              email: { type: 'string', description: 'Patient email address to lookup appointments' },
              status: { type: 'string', enum: ['all', 'upcoming', 'past', 'confirmed', 'pending', 'cancelled'], description: 'Filter appointments by status. Default is "upcoming"' }
            },
            required: ['email']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'check_availability',
          description: 'Check if a specific date and time slot is available for booking',
          parameters: {
            type: 'object',
            properties: {
              date: { type: 'string', description: 'Date to check in YYYY-MM-DD format' },
              time: { type: 'string', description: 'Time to check in 12-hour format with AM/PM' },
              provider: { type: 'string', description: 'Provider name (optional). Default is "Dr. Sarah Johnson"' }
            },
            required: ['date', 'time']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'reschedule_appointment',
          description: 'Reschedule an existing appointment to a new date and time',
          parameters: {
            type: 'object',
            properties: {
              appointment_id: { type: 'string', description: 'The appointment ID to reschedule' },
              email: { type: 'string', description: 'Patient email for verification' },
              new_date: { type: 'string', description: 'New appointment date in YYYY-MM-DD format' },
              new_time: { type: 'string', description: 'New appointment time in 12-hour format with AM/PM' },
              reason: { type: 'string', description: 'Reason for rescheduling (optional)' }
            },
            required: ['appointment_id', 'email', 'new_date', 'new_time']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'cancel_appointment',
          description: 'Cancel an existing appointment',
          parameters: {
            type: 'object',
            properties: {
              appointment_id: { type: 'string', description: 'The appointment ID to cancel' },
              email: { type: 'string', description: 'Patient email for verification' },
              reason: { type: 'string', description: 'Reason for cancellation (optional)' }
            },
            required: ['appointment_id', 'email']
          }
        }
      }
    ] : [];

    // Merge tools: use request tools if provided, otherwise use public tools for public mode
    const tools = requestTools || (publicTools.length > 0 ? publicTools : undefined);

    // Log WhatsApp-specific context
    if (mode === 'public' && patient_phone) {
      logger.info('WhatsApp request', { phone: patient_phone.substring(0, 8) + '***', messageType: message_type });
    }

    // 🔒 SECURITY: Block admin tool execution for unauthenticated requests
    const authHeader = req.headers.get('authorization');
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');

    // Check if request contains admin-only tools (only get_stats is admin-only)
    // Note: trigger_automation is now public for appointment booking
    const hasAdminTools = tools && tools.some((tool: any) =>
      ['get_stats'].includes(tool.function?.name)
    );

    if (hasAdminTools && !isAuthenticated) {
      logger.warn('SECURITY: Blocked unauthenticated admin tool access attempt', { clientId });
      return new Response(
        JSON.stringify({
          error: 'Authentication required for admin tools. Please log in to use advanced features.'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Public tools (book_appointment_with_confirmation) are allowed without auth

    logger.debug('Groq chat request', { messageCount: messages.length, model, hasTools: !!tools, authenticated: isAuthenticated });

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools,
        tool_choice,
        temperature,
        max_tokens,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      logger.error('Groq API error', { status: groqResponse.status, error: errorText.substring(0, 100) });
      throw new Error(`Groq API error ${groqResponse.status}: ${errorText.substring(0, 200)}`);
    }

    const groqData = await groqResponse.json();
    logger.debug('Groq response received');

    // If there are tool calls, execute them
    const message = groqData.choices?.[0]?.message;
    if (message?.tool_calls && message.tool_calls.length > 0 && tools) {
      logger.debug('Tool calls detected', { count: message.tool_calls.length });

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const toolResults = [];

      for (const toolCall of message.tool_calls) {
        const { name, arguments: args } = toolCall.function;
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;

        logger.debug('Executing tool', { tool: name, args: sanitizeForAuditLog(parsedArgs) });

        try {
          let result: any;

          switch (name) {
            case 'get_stats': {
              const today = new Date().toISOString().split('T')[0];

              switch (parsedArgs.metric) {
                case 'conversations_today': {
                  const { count } = await supabase
                    .from('conversations')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', today);
                  result = { metric: 'conversations_today', value: count || 0 };
                  break;
                }

                case 'messages_today': {
                  const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', today);
                  result = { metric: 'messages_today', value: count || 0 };
                  break;
                }

                case 'calls_today': {
                  const { count } = await supabase
                    .from('conversations')
                    .select('*', { count: 'exact', head: true })
                    .eq('channel', 'voice')
                    .gte('created_at', today);
                  result = { metric: 'calls_today', value: count || 0 };
                  break;
                }

                case 'upcoming_appointments': {
                  const { data } = await supabase
                    .from('appointments')
                    .select('*')
                    .gte('start', new Date().toISOString())
                    .order('start', { ascending: true })
                    .limit(5);
                  result = { metric: 'upcoming_appointments', appointments: data || [] };
                  break;
                }

                case 'all': {
                  const [conversations, messages, calls, appointments] = await Promise.all([
                    supabase.from('conversations').select('*', { count: 'exact', head: true }).gte('created_at', today),
                    supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', today),
                    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('channel', 'voice').gte('created_at', today),
                    supabase.from('appointments').select('*').gte('start', new Date().toISOString()).order('start', { ascending: true }).limit(5),
                  ]);

                  result = {
                    conversations_today: conversations.count || 0,
                    messages_today: messages.count || 0,
                    calls_today: calls.count || 0,
                    upcoming_appointments: appointments.data || [],
                  };
                  break;
                }

                default:
                  throw new Error(`Unknown metric: ${parsedArgs.metric}`);
              }
              break;
            }

            case 'trigger_automation': {
              const n8nWebhookBase = Deno.env.get('N8N_WEBHOOK_BASE');
              if (!n8nWebhookBase) {
                logger.error('N8N_WEBHOOK_BASE environment variable not set');
                throw new Error('N8N_WEBHOOK_BASE not configured');
              }
              logger.debug('Calling n8n webhook', { base: n8nWebhookBase, action: parsedArgs.action });

    const response = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: parsedArgs.action,
                  payload: parsedArgs.payload,
                }),
              });

              if (!response.ok) {
                throw new Error(`n8n automation failed: ${response.statusText}`);
              }

              // Handle empty response from n8n webhook
              const responseText = await response.text();
              if (responseText && responseText.trim().length > 0) {
                try {
                  result = JSON.parse(responseText);
                } catch (e) {
                  logger.warn('n8n returned non-JSON response', { response: responseText.substring(0, 100) });
                  result = { success: true, message: 'Automation triggered successfully' };
                }
              } else {
                // Empty response = success
                logger.info('n8n webhook executed successfully (empty response)');
                result = { success: true, message: 'Automation triggered successfully' };
              }
              break;
            }

            case 'book_appointment_with_confirmation': {
              // PUBLIC TOOL: Book appointment and send confirmation via n8n
              // SECURITY: Validate all inputs with Zod
              const validationResult = AppointmentBookingSchema.safeParse(parsedArgs);

              if (!validationResult.success) {
                const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                logger.warn('Appointment booking validation failed', { errors });
                throw new Error(`Invalid appointment data: ${errors}`);
              }

              const validated = validationResult.data;

              logger.info('Booking appointment via n8n', {
                patient: validated.name.substring(0, 10) + '...',
                email: validated.email.substring(0, 5) + '***',
                date: validated.date
              });

              const n8nWebhookBase = Deno.env.get('N8N_WEBHOOK_BASE');
              if (!n8nWebhookBase) {
                throw new Error('N8N_WEBHOOK_BASE environment variable not configured');
              }

              // Parse relative dates (tomorrow, today, etc.) to YYYY-MM-DD format
              let appointmentDate = validated.date;
              if (appointmentDate && (appointmentDate.toLowerCase().includes('tomorrow') || appointmentDate.toLowerCase() === 'tomorrow')) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                appointmentDate = tomorrow.toISOString().split('T')[0];
                logger.info('Converted relative date', { from: parsedArgs.date, to: appointmentDate });
              } else if (appointmentDate && (appointmentDate.toLowerCase().includes('today') || appointmentDate.toLowerCase() === 'today')) {
                appointmentDate = new Date().toISOString().split('T')[0];
                logger.info('Converted relative date', { from: parsedArgs.date, to: appointmentDate });
              }

              // Call n8n webhook with appointment data
              // CRITICAL: n8n workflow expects all data in $json.body.*
              const emailSubject = `Appointment Confirmation - ${appointmentDate} at ${validated.time}`;
              const emailMessage = `Dear ${validated.name},

Your appointment has been confirmed!

📅 Date: ${appointmentDate}
🕐 Time: ${validated.time}
📋 Reason: ${validated.reason || 'General consultation'}

Please arrive 10 minutes early.

Best regards,
Serenity Hospital Team`;

              // CRITICAL: n8n Switch node checks $json.body.action
              // Send action at BOTH root level and inside body for maximum compatibility
              const n8nPayload = {
                action: 'book_appointment', // Root level for $json.action
                body: {
                  // Primary routing: action 'book_appointment' triggers Create Appointment node
                  action: 'book_appointment', // Nested for $json.body.action
                  channel: 'webchat',
                  // Gmail node fields (accessed via $json.body.*)
                  toList: validated.email,
                  subject: emailSubject,
                  message: emailMessage,
                  // Patient data (required for Create Appointment node)
                  patient_ref: validated.email, // Required NOT NULL field for appointments table
                  patient_name: validated.name,
                  patientName: validated.name, // Fallback for backward compatibility
                  patient_email: validated.email,
                  patientEmail: validated.email, // Fallback
                  patient_phone: validated.phone || '',
                  patientPhone: validated.phone || '', // Fallback
                  appointment_date: appointmentDate,
                  appointmentDate: appointmentDate, // Fallback
                  appointment_time: validated.time,
                  appointmentTime: validated.time, // Fallback
                  reason: validated.reason || 'General consultation',
                  appointmentReason: validated.reason || 'General consultation', // Fallback
                  source: 'groq_chat_widget',
                  timestamp: new Date().toISOString(),
                }
              };

              logger.info('Sending to n8n webhook', {
                action: n8nPayload.action,
                bodyAction: n8nPayload.body.action,
                patientEmail: validated.email.substring(0, 5) + '***',
                appointmentDate
              });

              const response = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(n8nPayload),
              });

              if (!response.ok) {
                const errorText = await response.text();
                logger.error('n8n booking webhook failed', {
                  status: response.status,
                  error: errorText
                });
                throw new Error(`Appointment booking failed: ${response.statusText}`);
              }

              // Parse n8n response (may be empty)
              const responseText = await response.text();
              let n8nResult = {};
              if (responseText) {
                try {
                  n8nResult = JSON.parse(responseText);
                } catch (e) {
                  logger.warn('n8n returned non-JSON response', { response: responseText.substring(0, 100) });
                  n8nResult = { message: responseText };
                }
              }
              logger.info('Appointment booked successfully', { result: n8nResult });

              result = {
                success: true,
                message: 'Appointment booked successfully. Confirmation email sent.',
                appointmentDetails: {
                  patientName: validated.name,
                  patientEmail: validated.email,
                  date: appointmentDate,
                  time: validated.time,
                  reason: validated.reason || 'General consultation',
                },
                n8nResponse: n8nResult,
              };
              break;
            }

            case 'get_appointments': {
              // Get filtered list of appointments
              logger.info('Fetching appointments', { filters: parsedArgs });

              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

              let query = supabaseClient
                .from('appointments')
                .select('*')
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });

              // Apply filters
              if (parsedArgs.date) {
                query = query.eq('appointment_date', parsedArgs.date);
              }
              if (parsedArgs.status) {
                query = query.eq('status', parsedArgs.status);
              }
              if (parsedArgs.patient_email) {
                query = query.eq('patient_email', parsedArgs.patient_email);
              }
              if (parsedArgs.doctor_name) {
                query = query.eq('doctor_name', parsedArgs.doctor_name);
              }

              // Limit results
              query = query.limit(parsedArgs.limit || 50);

              const { data, error } = await query;

              if (error) {
                logger.error('Failed to fetch appointments', { error: error.message });
                throw new Error(`Database query failed: ${error.message}`);
              }

              result = {
                success: true,
                count: data.length,
                appointments: data,
              };
              break;
            }

            case 'check_availability': {
              // Check if appointment slot is available
              logger.info('Checking availability', {
                date: parsedArgs.date,
                time: parsedArgs.time,
                provider: parsedArgs.provider
              });

              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

              // Query for conflicting appointments (simplified - doesn't filter by provider)
              // This checks if ANY appointment exists at this time slot
              const { data, error } = await supabaseClient
                .from('appointments')
                .select('id, appointment_date, appointment_time, patient_name, status')
                .eq('appointment_date', parsedArgs.date)
                .eq('appointment_time', parsedArgs.time)
                .in('status', ['pending', 'confirmed']);

              if (error) {
                logger.error('Availability check failed', { error: error.message });
                throw new Error(`Database query failed: ${error.message}`);
              }

              const isAvailable = data.length === 0;

              result = {
                success: true,
                available: isAvailable,
                date: parsedArgs.date,
                time: parsedArgs.time,
                doctor: parsedArgs.doctor_name || 'Dr. Smith',
                conflictingAppointments: data.length,
              };
              break;
            }

            case 'get_conversations': {
              // Get list of conversations with filters
              logger.info('Fetching conversations', { filters: parsedArgs });

              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

              let query = supabaseClient
                .from('conversations')
                .select('*, messages(count)')
                .order('updated_at', { ascending: false });

              // Apply filters
              if (parsedArgs.channel) {
                query = query.eq('channel', parsedArgs.channel);
              }
              if (parsedArgs.status) {
                query = query.eq('status', parsedArgs.status);
              }
              if (parsedArgs.patient_ref) {
                query = query.eq('patient_ref', parsedArgs.patient_ref);
              }

              // Limit results
              query = query.limit(parsedArgs.limit || 50);

              const { data, error } = await query;

              if (error) {
                logger.error('Failed to fetch conversations', { error: error.message });
                throw new Error(`Database query failed: ${error.message}`);
              }

              result = {
                success: true,
                count: data.length,
                conversations: data,
              };
              break;
            }

            case 'get_conversation_thread': {
              // Get full message history for a conversation
              logger.info('Fetching conversation thread', { conversationId: parsedArgs.conversation_id });

              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

              // Get conversation details
              const { data: conversation, error: convError } = await supabaseClient
                .from('conversations')
                .select('*')
                .eq('id', parsedArgs.conversation_id)
                .single();

              if (convError) {
                logger.error('Conversation not found', { error: convError.message });
                throw new Error(`Conversation not found: ${convError.message}`);
              }

              // Get messages
              const { data: messages, error: msgError } = await supabaseClient
                .from('messages')
                .select('*')
                .eq('conversation_id', parsedArgs.conversation_id)
                .order('ts', { ascending: true });

              if (msgError) {
                logger.error('Failed to fetch messages', { error: msgError.message });
                throw new Error(`Failed to fetch messages: ${msgError.message}`);
              }

              result = {
                success: true,
                conversation,
                messages,
                messageCount: messages.length,
              };
              break;
            }

            case 'search_patient': {
              // Search for patients by name, email, or phone
              logger.info('Searching for patient', { query: parsedArgs.query });

              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
              const searchQuery = parsedArgs.query.toLowerCase();

              // Search in appointments table
              const { data, error } = await supabaseClient
                .from('appointments')
                .select('patient_name, patient_email, patient_phone, appointment_date, appointment_time, status')
                .or(`patient_name.ilike.%${searchQuery}%,patient_email.ilike.%${searchQuery}%,patient_phone.ilike.%${searchQuery}%`)
                .order('appointment_date', { ascending: false })
                .limit(20);

              if (error) {
                logger.error('Patient search failed', { error: error.message });
                throw new Error(`Search failed: ${error.message}`);
              }

              // Deduplicate patients
              const uniquePatients = new Map();
              data.forEach(apt => {
                const key = apt.patient_email || apt.patient_phone;
                if (!uniquePatients.has(key)) {
                  uniquePatients.set(key, {
                    name: apt.patient_name,
                    email: apt.patient_email,
                    phone: apt.patient_phone,
                    lastAppointment: apt.appointment_date,
                    status: apt.status,
                  });
                }
              });

              result = {
                success: true,
                count: uniquePatients.size,
                patients: Array.from(uniquePatients.values()),
              };
              break;
            }

            case 'send_message': {
              // Send message in conversation thread
              logger.info('Sending message', {
                conversationId: parsedArgs.conversation_id,
                fromRole: 'staff'
              });

              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

              // Insert message
              const { data, error } = await supabaseClient
                .from('messages')
                .insert({
                  conversation_id: parsedArgs.conversation_id,
                  from_role: 'staff',
                  body: parsedArgs.message,
                  staff_id: parsedArgs.staff_id || null,
                  metadata: { sent_via: 'ai_assistant' },
                })
                .select()
                .single();

              if (error) {
                logger.error('Failed to send message', { error: error.message });
                throw new Error(`Failed to send message: ${error.message}`);
              }

              // Update conversation timestamp
              await supabaseClient
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', parsedArgs.conversation_id);

              result = {
                success: true,
                message: data,
                sentAt: data.ts,
              };
              break;
            }

            case 'get_analytics': {
              // Get analytics for specified time period
              logger.info('Fetching analytics', { period: parsedArgs.period });

              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
              const now = new Date();
              let startDate: Date;

              // Calculate date range
              switch (parsedArgs.period) {
                case 'today':
                  startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  break;
                case 'week':
                  startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  break;
                case 'month':
                  startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                  break;
                default:
                  startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              }

              // Fetch analytics data
              const [conversations, messages, appointments] = await Promise.all([
                supabaseClient
                  .from('conversations')
                  .select('channel, status, created_at')
                  .gte('created_at', startDate.toISOString()),
                supabaseClient
                  .from('messages')
                  .select('from_role, ts')
                  .gte('ts', startDate.toISOString()),
                supabaseClient
                  .from('appointments')
                  .select('status, source, created_at')
                  .gte('created_at', startDate.toISOString()),
              ]);

              result = {
                success: true,
                period: parsedArgs.period,
                startDate: startDate.toISOString(),
                endDate: now.toISOString(),
                conversations: {
                  total: conversations.data?.length || 0,
                  byChannel: conversations.data?.reduce((acc: any, c: any) => {
                    acc[c.channel] = (acc[c.channel] || 0) + 1;
                    return acc;
                  }, {}),
                  byStatus: conversations.data?.reduce((acc: any, c: any) => {
                    acc[c.status] = (acc[c.status] || 0) + 1;
                    return acc;
                  }, {}),
                },
                messages: {
                  total: messages.data?.length || 0,
                  byRole: messages.data?.reduce((acc: any, m: any) => {
                    acc[m.from_role] = (acc[m.from_role] || 0) + 1;
                    return acc;
                  }, {}),
                },
                appointments: {
                  total: appointments.data?.length || 0,
                  byStatus: appointments.data?.reduce((acc: any, a: any) => {
                    acc[a.status] = (acc[a.status] || 0) + 1;
                    return acc;
                  }, {}),
                  bySource: appointments.data?.reduce((acc: any, a: any) => {
                    acc[a.source] = (acc[a.source] || 0) + 1;
                    return acc;
                  }, {}),
                },
              };
              break;
            }

            case 'get_my_appointments': {
              // PUBLIC TOOL: Get patient's appointments by email
              logger.info('Fetching patient appointments', { email: parsedArgs.email, status: parsedArgs.status });

              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

              let query = supabaseClient
                .from('appointments')
                .select('*')
                .eq('patient_email', parsedArgs.email)
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });

              // Apply status filter
              const status = parsedArgs.status || 'upcoming';
              const today = new Date().toISOString().split('T')[0];

              switch (status) {
                case 'upcoming':
                  query = query.gte('appointment_date', today).in('status', ['confirmed', 'pending']);
                  break;
                case 'past':
                  query = query.lt('appointment_date', today);
                  break;
                case 'confirmed':
                case 'pending':
                case 'cancelled':
                  query = query.eq('status', status);
                  break;
                case 'all':
                  // No filter
                  break;
              }

              query = query.limit(10);

              const { data, error } = await query;

              if (error) {
                logger.error('Failed to fetch patient appointments', { error: error.message });
                throw new Error(`Database query failed: ${error.message}`);
              }

              result = {
                success: true,
                count: data.length,
                appointments: data.map(apt => ({
                  id: apt.id,
                  date: apt.appointment_date,
                  time: apt.appointment_time,
                  reason: apt.reason,
                  status: apt.status,
                  doctor: apt.doctor_name || 'Dr. Sarah Johnson',
                })),
              };
              break;
            }

            case 'reschedule_appointment': {
              // PUBLIC TOOL: Reschedule appointment via n8n
              logger.info('Rescheduling appointment', {
                appointmentId: parsedArgs.appointment_id,
                email: parsedArgs.email,
                newDate: parsedArgs.new_date,
                newTime: parsedArgs.new_time
              });

              const n8nWebhookBase = Deno.env.get('N8N_WEBHOOK_BASE');
              if (!n8nWebhookBase) {
                throw new Error('N8N_WEBHOOK_BASE environment variable not configured');
              }

              // Verify ownership before rescheduling
              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
              const { data: appointment, error: fetchError } = await supabaseClient
                .from('appointments')
                .select('*')
                .eq('id', parsedArgs.appointment_id)
                .eq('patient_email', parsedArgs.email)
                .single();

              if (fetchError || !appointment) {
                logger.error('Appointment not found or unauthorized', { error: fetchError?.message });
                throw new Error('Appointment not found or you do not have permission to modify it');
              }

              // Call n8n webhook for rescheduling
              const n8nPayload = {
                action: 'reschedule_appointment',
                body: {
                  action: 'reschedule_appointment',
                  appointment_id: parsedArgs.appointment_id,
                  patient_email: parsedArgs.email,
                  patient_name: appointment.patient_name,
                  new_date: parsedArgs.new_date,
                  new_time: parsedArgs.new_time,
                  reason: parsedArgs.reason || 'Patient requested reschedule',
                  old_date: appointment.appointment_date,
                  old_time: appointment.appointment_time,
                }
              };

              const response = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(n8nPayload),
              });

              if (!response.ok) {
                const errorText = await response.text();
                logger.error('n8n reschedule webhook failed', {
                  status: response.status,
                  error: errorText
                });
                throw new Error(`Rescheduling failed: ${response.statusText}`);
              }

              result = {
                success: true,
                message: 'Appointment rescheduled successfully. Confirmation email sent.',
                appointmentId: parsedArgs.appointment_id,
                oldDate: appointment.appointment_date,
                oldTime: appointment.appointment_time,
                newDate: parsedArgs.new_date,
                newTime: parsedArgs.new_time,
              };
              break;
            }

            case 'cancel_appointment': {
              // PUBLIC TOOL: Cancel appointment via n8n
              logger.info('Cancelling appointment', {
                appointmentId: parsedArgs.appointment_id,
                email: parsedArgs.email
              });

              const n8nWebhookBase = Deno.env.get('N8N_WEBHOOK_BASE');
              if (!n8nWebhookBase) {
                throw new Error('N8N_WEBHOOK_BASE environment variable not configured');
              }

              // Verify ownership before cancelling
              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
              const { data: appointment, error: fetchError } = await supabaseClient
                .from('appointments')
                .select('*')
                .eq('id', parsedArgs.appointment_id)
                .eq('patient_email', parsedArgs.email)
                .single();

              if (fetchError || !appointment) {
                logger.error('Appointment not found or unauthorized', { error: fetchError?.message });
                throw new Error('Appointment not found or you do not have permission to cancel it');
              }

              // Call n8n webhook for cancellation
              const n8nPayload = {
                action: 'cancel_appointment',
                body: {
                  action: 'cancel_appointment',
                  appointment_id: parsedArgs.appointment_id,
                  patient_email: parsedArgs.email,
                  patient_name: appointment.patient_name,
                  appointment_date: appointment.appointment_date,
                  appointment_time: appointment.appointment_time,
                  reason: parsedArgs.reason || 'Patient requested cancellation',
                }
              };

              const response = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(n8nPayload),
              });

              if (!response.ok) {
                const errorText = await response.text();
                logger.error('n8n cancel webhook failed', {
                  status: response.status,
                  error: errorText
                });
                throw new Error(`Cancellation failed: ${response.statusText}`);
              }

              result = {
                success: true,
                message: 'Appointment cancelled successfully. Confirmation email sent.',
                appointmentId: parsedArgs.appointment_id,
                cancelledDate: appointment.appointment_date,
                cancelledTime: appointment.appointment_time,
              };
              break;
            }

            default:
              result = { error: `Unknown tool: ${name}` };
          }

          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolCall.function.name,
            content: JSON.stringify(result),
          });
        } catch (error: any) {
          logger.error('Tool execution error', { tool: name, error: error.message });
          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolCall.function.name,
            content: JSON.stringify({ error: error.message }),
          });
        }
      }

      // For WhatsApp integration, call Groq again with tool results to get final response
      if (mode === 'public' && toolResults.length > 0) {
        logger.debug('Calling Groq again with tool results for final response');

        // Build conversation with tool results
        const messagesWithTools = [
          ...messages,
          message, // AI's message with tool calls
          ...toolResults // Tool execution results
        ];

        const finalResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: messagesWithTools,
            temperature,
            max_tokens,
          }),
        });

        if (finalResponse.ok) {
          const finalData = await finalResponse.json();
          const responseText = finalData.choices?.[0]?.message?.content || 'Appointment processed successfully.';

          // Log WhatsApp conversation with tool execution
          if (patient_phone) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            const userMessage = messages[messages.length - 1]?.content || '';
            const executedTool = toolResults[0]?.role === 'tool' ? toolResults[0]?.name : undefined;
            const executedToolResult = toolResults[0]?.content;

            // Call logging function (async, don't block response)
            logWhatsAppConversation(
              supabase,
              patient_phone,
              userMessage,
              message_type || 'text',
              responseText,
              executedTool,
              executedToolResult
            ).catch(err => logger.error('Logging failed', { error: err.message }));
          }

          return new Response(
            JSON.stringify({
              response: responseText,
              success: true,
              patient_phone,
              message_type,
              tool_executed: true
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }

      // For web chat (authenticated), return full response with tool results
      return new Response(
        JSON.stringify({
          ...groqData,
          tool_results: toolResults,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // No tool calls - extract and return response
    // For WhatsApp integration (mode=public), return simple text response
    if (mode === 'public') {
      const responseText = groqData.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';

      // Log WhatsApp conversation to database
      if (patient_phone) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const userMessage = messages[messages.length - 1]?.content || '';

        // Call logging function (async, don't block response)
        logWhatsAppConversation(
          supabase,
          patient_phone,
          userMessage,
          message_type || 'text',
          responseText,
          undefined, // no tool executed
          undefined  // no tool result
        ).catch(err => logger.error('Logging failed', { error: err.message }));
      }

      return new Response(
        JSON.stringify({
          response: responseText,
          success: true,
          patient_phone,
          message_type
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For web chat (authenticated), return full Groq response
    return new Response(
      JSON.stringify(groqData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    logger.error('Error in groq-chat', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
