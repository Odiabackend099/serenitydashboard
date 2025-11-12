import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const { assistant_id, system_prompt, voice_id } = await req.json();

    // Validate inputs
    if (!assistant_id || !system_prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: assistant_id, system_prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get VAPI private key from environment
    const vapiPrivateKey = Deno.env.get('VAPI_PRIVATE_KEY');
    if (!vapiPrivateKey) {
      console.error('VAPI_PRIVATE_KEY not configured in Edge Function secrets');
      return new Response(
        JSON.stringify({ error: 'VAPI integration not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get webhook URL for tool callbacks
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/vapi-webhook`;

    // Prepare VAPI update payload - only update system prompt and tools
    // Voice configuration is already set in VAPI dashboard, don't override it
    const vapiPayload: any = {
      model: {
        provider: 'groq',
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: system_prompt + '\n\nIMPORTANT: After booking an appointment, ALWAYS call the send_appointment_confirmation function to send a confirmation email to the patient.'
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'send_appointment_confirmation',
              description: 'Send appointment confirmation email to patient after successfully booking an appointment. MUST be called after every appointment booking.',
              parameters: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    description: 'Patient email address'
                  },
                  name: {
                    type: 'string',
                    description: 'Patient full name'
                  },
                  date: {
                    type: 'string',
                    description: 'Appointment date (e.g., "2024-01-15")'
                  },
                  time: {
                    type: 'string',
                    description: 'Appointment time (e.g., "2:30 PM")'
                  },
                  reason: {
                    type: 'string',
                    description: 'Reason for appointment'
                  }
                },
                required: ['email', 'name', 'date', 'time']
              }
            },
            server: {
              url: webhookUrl
            }
          }
        ]
      }
    };

    // Update VAPI assistant configuration
    const vapiResponse = await fetch(`https://api.vapi.ai/assistant/${assistant_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vapiPayload)
    });

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error('VAPI API error:', vapiResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to update VAPI assistant',
          details: errorText,
          status: vapiResponse.status
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const vapiData = await vapiResponse.json();

    // Log successful sync to audit trail
    await supabaseClient.from('audit_log').insert({
      action: 'vapi_sync',
      entity_type: 'agent_config',
      entity_id: assistant_id,
      details: {
        assistant_id,
        voice_id,
        system_prompt_length: system_prompt.length,
        vapi_response_status: vapiResponse.status
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'VAPI assistant configuration updated successfully',
        assistant_id,
        vapi_data: vapiData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in sync-vapi-config:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
