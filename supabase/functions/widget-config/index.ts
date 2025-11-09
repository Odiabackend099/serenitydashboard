import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const vapiPublicKey = Deno.env.get('VAPI_PUBLIC_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!vapiPublicKey) {
      console.error('[widget-config] VAPI_PUBLIC_KEY environment variable not set');
      return new Response(
        JSON.stringify({ error: 'VAPI configuration missing. Please contact administrator.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current agent_config (most recent version)
    const { data: agentConfig, error: configError } = await supabase
      .from('agent_config')
      .select('*')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (configError) {
      console.error('[widget-config] Error fetching agent_config:', configError);
    }

    // Return public configuration for widget initialization
    const config = {
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      },
      vapi: {
        publicKey: vapiPublicKey,
        assistantId: agentConfig?.assistant_id || process.env.VITE_VAPI_ASSISTANT_ID || 'your-vapi-assistant-id',
      },
      features: {
        textChat: true,
        voiceChat: true,
        attachments: false, // Future feature
      },
      agent: {
        firstMessage: agentConfig?.metadata?.firstMessage || 'Hi! How can I help you today?',
        voiceId: agentConfig?.voice_id || 'jennifer',
      },
    };

    return new Response(
      JSON.stringify(config),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('[widget-config] Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
