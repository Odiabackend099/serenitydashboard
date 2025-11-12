import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ToolCallRequest {
  tool_name: string;
  args: any;
  conversation_id?: string;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const n8nWebhookBase = Deno.env.get('N8N_WEBHOOK_BASE') ?? '';

    if (!n8nWebhookBase) {
      throw new Error('N8N_WEBHOOK_BASE not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { tool_name, args, conversation_id, user_id }: ToolCallRequest = await req.json();

    console.log(`[assistant-call] Tool: ${tool_name}`, args);

    // Log to audit_logs
    const auditId = crypto.randomUUID();
    await supabase.from('audit_logs').insert({
      id: auditId,
      action: 'tool_call',
      intent: tool_name,
      status: 'pending',
      meta: {
        args,
        conversation_id,
        user_id,
      },
    });

    let result: any = {};
    let status = 'success';
    let error: string | null = null;

    try {
      // Route based on tool_name
      switch (tool_name) {
        case 'get_stats': {
          // READ-ONLY: Direct Supabase query
          const today = new Date().toISOString().split('T')[0];
          const metric = args.metric || 'all';

          if (metric === 'all' || metric === 'conversations_today') {
            const { count } = await supabase
              .from('conversations')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', today);
            result.conversations_today = count || 0;
          }

          if (metric === 'all' || metric === 'messages_today') {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', today);
            result.messages_today = count || 0;
          }

          if (metric === 'all' || metric === 'calls_today') {
            const { count } = await supabase
              .from('conversations')
              .select('*', { count: 'exact', head: true })
              .eq('channel', 'voice')
              .gte('created_at', today);
            result.calls_today = count || 0;
          }

          if (metric === 'all' || metric === 'upcoming_appointments') {
            const { data } = await supabase
              .from('appointments')
              .select('*')
              .gte('start', new Date().toISOString())
              .order('start', { ascending: true })
              .limit(5);
            result.upcoming_appointments = data || [];
          }

          result.success = true;
          break;
        }

        // WRITE ACTIONS: Forward to n8n
        case 'send_email':
        case 'book_appointment':
        case 'send_whatsapp':
        case 'daily_summary': {
          console.log(`[assistant-call] Forwarding to n8n: ${tool_name}`);

          const n8nResponse = await fetch(`${n8nWebhookBase}/serenity-assistant`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: tool_name,
              payload: args,
              conversation_id,
              user_id,
              audit_id: auditId,
            }),
          });

          if (!n8nResponse.ok) {
            const errorText = await n8nResponse.text();
            throw new Error(`n8n webhook failed: ${n8nResponse.status} - ${errorText}`);
          }

          const n8nResult = await n8nResponse.json();
          result = {
            success: true,
            action: tool_name,
            n8n_response: n8nResult,
          };
          break;
        }

        default:
          throw new Error(`Unknown tool: ${tool_name}`);
      }
    } catch (toolError: any) {
      console.error(`[assistant-call] Tool execution error:`, toolError);
      status = 'failed';
      error = toolError.message;
      result = {
        success: false,
        error: toolError.message,
      };
    }

    // Update audit log with result
    await supabase
      .from('audit_logs')
      .update({
        status,
        error,
        meta: {
          args,
          conversation_id,
          user_id,
          result,
        },
      })
      .eq('id', auditId);

    return new Response(
      JSON.stringify(result),
      {
        status: status === 'success' ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('[assistant-call] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
