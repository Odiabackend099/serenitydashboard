import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncAgentRequest {
  system_prompt: string;
  voice_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const vapiPrivateKey = Deno.env.get('VAPI_PRIVATE_KEY') ?? '';

    if (!vapiPrivateKey) {
      throw new Error('VAPI_PRIVATE_KEY not configured');
    }

    // Parse request
    const { system_prompt, voice_id }: SyncAgentRequest = await req.json();

    if (!system_prompt) {
      return new Response(
        JSON.stringify({ error: 'system_prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create/Update VAPI Assistant
    const vapiResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: {
          provider: 'groq',
          model: 'llama-3.1-70b-versatile',
          systemPrompt: system_prompt,
        },
        voice: {
          provider: 'playht',
          voiceId: voice_id || 'jennifer',
        },
        firstMessage: 'Hello, this is Serenity Royale Hospital. How can I help you today?',
        serverUrl: Deno.env.get('WEBHOOK_PUBLIC_URL') + '/vapi-webhook',
      }),
    });

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error('VAPI API Error:', errorText);
      throw new Error(`VAPI API error: ${vapiResponse.status}`);
    }

    const vapiData = await vapiResponse.json();
    const assistant_id = vapiData.id;

    // Update Supabase agent_config
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const { error: upsertError } = await supabase
      .from('agent_config')
      .upsert({
        system_prompt,
        voice_id: voice_id || 'jennifer',
        assistant_id,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError);
      throw upsertError;
    }

    // Log to audit
    if (userId) {
      await supabase.from('audit_logs').insert({
        actor: userId,
        action: 'agent_config_updated',
        meta: { assistant_id, voice_id },
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        assistant_id,
        message: 'VAPI assistant synced successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in vapi-sync-agent:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
