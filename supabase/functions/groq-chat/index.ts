import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
      tools,
      tool_choice = 'auto',
      temperature = 0.7,
      max_tokens = 1000,
    }: GroqRequest = await req.json();

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
              logger.info('Booking appointment via n8n', {
                patient: parsedArgs.name,
                email: parsedArgs.email,
                rawDate: parsedArgs.date
              });

              const n8nWebhookBase = Deno.env.get('N8N_WEBHOOK_BASE');
              if (!n8nWebhookBase) {
                throw new Error('N8N_WEBHOOK_BASE environment variable not configured');
              }

              // Parse relative dates (tomorrow, today, etc.) to YYYY-MM-DD format
              let appointmentDate = parsedArgs.date;
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
              const emailSubject = `Appointment Confirmation - ${appointmentDate} at ${parsedArgs.time}`;
              const emailMessage = `Dear ${parsedArgs.name},

Your appointment has been confirmed!

📅 Date: ${appointmentDate}
🕐 Time: ${parsedArgs.time}
📋 Reason: ${parsedArgs.reason || 'General consultation'}

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
                  toList: parsedArgs.email,
                  subject: emailSubject,
                  message: emailMessage,
                  // Patient data (required for Create Appointment node)
                  patient_ref: parsedArgs.email, // Required NOT NULL field for appointments table
                  patient_name: parsedArgs.name,
                  patientName: parsedArgs.name, // Fallback for backward compatibility
                  patient_email: parsedArgs.email,
                  patientEmail: parsedArgs.email, // Fallback
                  patient_phone: parsedArgs.phone || '',
                  patientPhone: parsedArgs.phone || '', // Fallback
                  appointment_date: appointmentDate,
                  appointmentDate: appointmentDate, // Fallback
                  appointment_time: parsedArgs.time,
                  appointmentTime: parsedArgs.time, // Fallback
                  reason: parsedArgs.reason || 'General consultation',
                  appointmentReason: parsedArgs.reason || 'General consultation', // Fallback
                  source: 'groq_chat_widget',
                  timestamp: new Date().toISOString(),
                }
              };

              logger.info('Sending to n8n webhook', {
                action: n8nPayload.action,
                bodyAction: n8nPayload.body.action,
                patientEmail: parsedArgs.email,
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
                  patientName: parsedArgs.name,
                  patientEmail: parsedArgs.email,
                  date: appointmentDate,
                  time: parsedArgs.time,
                  reason: parsedArgs.reason || 'General consultation',
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
                doctor: parsedArgs.doctor_name
              });

              const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

              // Query for conflicting appointments
              const { data, error } = await supabaseClient
                .from('appointments')
                .select('*')
                .eq('appointment_date', parsedArgs.date)
                .eq('appointment_time', parsedArgs.time)
                .eq('doctor_name', parsedArgs.doctor_name || 'Dr. Smith')
                .in('status', ['scheduled', 'confirmed']);

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

      // Return response with tool results
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

    // No tool calls, return response as-is
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
