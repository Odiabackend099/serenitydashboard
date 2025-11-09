import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify Twilio signature
function verifyTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  const hmac = createHmac('sha1', authToken);
  hmac.update(data);
  const expectedSignature = hmac.digest('base64');

  return signature === expectedSignature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN') ?? '';
    const n8nWebhookBase = Deno.env.get('N8N_WEBHOOK_BASE') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse form data from Twilio
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Verify Twilio signature (mandatory for security)
    const twilioSignature = req.headers.get('X-Twilio-Signature');

    if (!twilioSignature) {
      console.error('[twilio-webhook] Missing X-Twilio-Signature header');
      return new Response(
        JSON.stringify({ error: 'Forbidden: Missing signature' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!twilioAuthToken) {
      console.error('[twilio-webhook] TWILIO_AUTH_TOKEN environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = Deno.env.get('WEBHOOK_PUBLIC_URL') + '/twilio-whatsapp-webhook';
    const isValid = verifyTwilioSignature(twilioAuthToken, twilioSignature, url, params);

    if (!isValid) {
      console.error('[twilio-webhook] Invalid Twilio signature');
      return new Response(
        JSON.stringify({ error: 'Forbidden: Invalid signature' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const from = params.From || params.from;
    const body = params.Body || params.body;
    const mediaUrl = params.MediaUrl0 || params.mediaUrl0;
    const messageSid = params.MessageSid || params.messageSid;

    if (!from || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing From or Body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean phone number for patient_ref
    const patientRef = from.replace('whatsapp:', '');

    // Find or create conversation
    let conversationId: string;
    
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('channel', 'whatsapp')
      .eq('patient_ref', patientRef)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          channel: 'whatsapp',
          patient_ref: patientRef,
          status: 'open',
          metadata: { message_sid: messageSid },
        })
        .select('id')
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      conversationId = newConv.id;
    }

    // Insert patient message
    const { error: msgError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      from_role: 'patient',
      body,
      media_url: mediaUrl || null,
      metadata: { message_sid: messageSid, from },
    });

    if (msgError) {
      console.error('Error inserting message:', msgError);
      throw msgError;
    }

    // Optional: Trigger n8n auto-reply workflow
    if (n8nWebhookBase) {
      try {
        await fetch(`${n8nWebhookBase}/whatsapp-auto-reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationId,
            patient_ref: patientRef,
            message: body,
          }),
        });
      } catch (n8nError) {
        console.error('n8n webhook error (non-fatal):', n8nError);
      }
    }

    // Respond with TwiML (empty response = no auto-reply from this webhook)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { 
        status: 200, 
        headers: { 'Content-Type': 'text/xml' } 
      }
    );

  } catch (error) {
    console.error('Error in twilio-whatsapp-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
