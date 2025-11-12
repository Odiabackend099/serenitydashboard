import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VapiWebhookPayload {
  type: string;
  call?: {
    id: string;
    phoneNumber?: string;
    customer?: {
      number: string;
    };
  };
  message?: {
    role: string;
    content: string;
  };
  transcript?: string;
  endedReason?: string;
  functionCall?: {
    name: string;
    parameters: any;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: VapiWebhookPayload = await req.json();
    console.log('VAPI Webhook received:', payload.type);

    // Extract patient reference (phone number)
    const patientRef = payload.call?.customer?.number || 
                       payload.call?.phoneNumber || 
                       'unknown';
    const callId = payload.call?.id || 'unknown';

    // Find or create conversation
    let conversationId: string;
    
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('channel', 'voice')
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
          channel: 'voice',
          patient_ref: patientRef,
          status: 'open',
          metadata: { call_id: callId },
        })
        .select('id')
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      conversationId = newConv.id;
    }

    // Handle different webhook types
    switch (payload.type) {
      case 'transcript':
      case 'message':
        if (payload.message || payload.transcript) {
          const content = payload.message?.content || payload.transcript || '';
          const fromRole = payload.message?.role === 'assistant' ? 'ai' : 'patient';

          await supabase.from('messages').insert({
            conversation_id: conversationId,
            from_role: fromRole,
            body: content,
            metadata: { vapi_event: payload.type },
          });
        }
        break;

      case 'call-ended':
      case 'end-of-call-report':
        // Update conversation status
        await supabase
          .from('conversations')
          .update({ 
            status: payload.endedReason === 'hangup' ? 'closed' : 'open',
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversationId);

        // Log to audit
        await supabase.from('audit_logs').insert({
          action: 'call_ended',
          meta: { 
            conversation_id: conversationId, 
            call_id: callId,
            reason: payload.endedReason 
          },
        });
        break;

      case 'function-call':
        // Handle tool calls from VAPI
        console.log('Function call received:', payload.functionCall);

        if (payload.functionCall?.name === 'send_appointment_confirmation') {
          const params = payload.functionCall.parameters;

          // Trigger n8n appointment confirmation workflow
          const n8nWebhookBase = Deno.env.get('N8N_WEBHOOK_BASE');
          if (!n8nWebhookBase) {
            console.error('N8N_WEBHOOK_BASE not configured');
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Email service not configured'
              }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          try {
            // Call n8n webhook for appointment confirmation email (matches SIMPLIFIED_WORKING_WORKFLOW.json)
            const n8nResponse = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                // Primary fields for n8n workflow
                message: `Appointment booking request from ${params.name}`,
                userId: params.email,
                channel: 'voice',
                intent: 'appointment',

                // Patient contact (both formats for compatibility)
                patientName: params.name,
                patientEmail: params.email,
                patientPhone: params.phone || 'Not provided',
                patient_name: params.name,
                patient_email: params.email,
                patient_phone: params.phone || 'Not provided',

                // Appointment details (both formats)
                appointmentDate: params.date,
                appointmentTime: params.time,
                appointmentReason: params.reason || 'General consultation',
                appointmentType: 'consultation',
                appointment_date: params.date,
                appointment_time: params.time,
                appointment_reason: params.reason || 'General consultation',
                appointment_type: 'consultation',

                // Legacy fields for backward compatibility
                name: params.name,
                email: params.email,
                phone: params.phone || 'Not provided',
                date: params.date,
                time: params.time,
                reason: params.reason || 'General consultation',

                // Metadata
                conversation_id: conversationId,
                call_id: callId,
                source: 'vapi_voice_call',
                action: 'send_appointment_confirmation',
                timestamp: new Date().toISOString(),
              })
            });

            if (!n8nResponse.ok) {
              console.error('n8n appointment confirmation failed:', n8nResponse.statusText);
            } else {
              console.log('✅ Appointment confirmation email sent to:', params.email);

              // Log to audit trail
              await supabase.from('audit_logs').insert({
                action: 'appointment_confirmation_sent',
                meta: {
                  conversation_id: conversationId,
                  email: params.email,
                  date: params.date,
                  time: params.time
                }
              });
            }

            // Return success response to VAPI
            return new Response(
              JSON.stringify({
                success: true,
                result: 'Confirmation email sent successfully'
              }),
              {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );

          } catch (error) {
            console.error('Error sending appointment confirmation:', error);
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Failed to send confirmation email'
              }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
        }
        break;

      default:
        console.log('Unhandled webhook type:', payload.type);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in vapi-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
