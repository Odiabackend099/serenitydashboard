import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    // Check if request contains admin-only tools (get_stats, trigger_automation)
    const hasAdminTools = tools && tools.some((tool: any) =>
      ['get_stats', 'trigger_automation'].includes(tool.function?.name)
    );

    if (hasAdminTools && !isAuthenticated) {
      console.warn('⚠️ SECURITY: Blocked unauthenticated admin tool access attempt');
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

    console.log('Groq chat request:', { messageCount: messages.length, model, hasTools: !!tools, authenticated: isAuthenticated });

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
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${groqResponse.status} ${errorText}`);
    }

    const groqData = await groqResponse.json();
    console.log('Groq response received');

    // If there are tool calls, execute them
    const message = groqData.choices?.[0]?.message;
    if (message?.tool_calls && message.tool_calls.length > 0 && tools) {
      console.log('Tool calls detected:', message.tool_calls.length);

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const toolResults = [];

      for (const toolCall of message.tool_calls) {
        const { name, arguments: args } = toolCall.function;
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;

        console.log('Executing tool:', name, parsedArgs);

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
                throw new Error('N8N_WEBHOOK_BASE not configured');
              }

              const response = await fetch(`${n8nWebhookBase}/serenity-assistant`, {
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

              result = await response.json();
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
          console.error('Tool execution error:', error);
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
    console.error('Error in groq-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
