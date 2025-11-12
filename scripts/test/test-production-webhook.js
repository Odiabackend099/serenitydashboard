#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// PRODUCTION webhook URL (not test)
const n8nWebhookUrl = 'https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🎯 PRODUCTION WEBHOOK TEST');
  console.log('='.repeat(70));
  console.log('Using PRODUCTION URL:', n8nWebhookUrl);
  console.log('='.repeat(70));
  console.log('');

  const timestamp = Date.now();
  
  // Create appointment in database first
  console.log('📋 Step 1: Create appointment in database...');
  const testAppt = {
    conversation_id: null,
    patient_ref: `test-patient-${timestamp}`,
    patient_name: 'Test Patient for odiabackend',
    patient_email: 'odiabackend@gmail.com',
    patient_phone: '+234 806 219 7384',
    appointment_date: '2025-11-14',
    appointment_time: '14:00:00',
    appointment_type: 'consultation',
    reason: 'General checkup - PRODUCTION TEST',
    status: 'pending'
  };

  const { data: dbAppt, error: dbError } = await supabase
    .from('appointments')
    .insert(testAppt)
    .select()
    .single();

  if (dbError) {
    console.log('❌ Database error:', dbError.message);
    return;
  }

  console.log('✅ Database appointment created!');
  console.log(`   ID: ${dbAppt.id}`);
  console.log('');

  // Test production webhook
  console.log('📋 Step 2: Trigger production n8n webhook...');
  
  const payload = {
    userId: testAppt.patient_ref,
    patientRef: testAppt.patient_ref,
    patient_ref: testAppt.patient_ref,
    
    sessionId: `session-${timestamp}`,
    conversationId: `conv-${timestamp}`,
    
    intent: 'appointment',
    
    patientEmail: 'odiabackend@gmail.com',
    patientPhone: '+234 806 219 7384',
    patientName: 'Test Patient for odiabackend',
    
    appointmentDate: '2025-11-14',
    appointmentTime: '14:00',
    appointmentReason: 'General checkup and consultation',
    appointmentType: 'consultation',
    
    message: 'I would like to book an appointment for Monday at 2pm',
    channel: 'webchat',
    timestamp: new Date().toISOString()
  };

  try {
    const res = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log(`Response: ${res.status} ${res.statusText}`);
    console.log('');

    if (res.ok) {
      let responseData;
      try {
        responseData = await res.json();
        console.log('Response:', JSON.stringify(responseData, null, 2));
      } catch (e) {
        const text = await res.text();
        console.log('Response (text):', text);
      }
      
      console.log('');
      console.log('═'.repeat(70));
      console.log('🎉 SUCCESS! n8n PRODUCTION WEBHOOK EXECUTED!');
      console.log('═'.repeat(70));
      console.log('');
      console.log('✅ Workflow processed the appointment request');
      console.log('✅ Should have saved to database via n8n');
      console.log('✅ Should have sent email if Gmail OAuth is configured');
      console.log('');
      console.log('📧 CHECK YOUR EMAIL: odiabackend@gmail.com');
      console.log('   Subject: Appointment Confirmation - Serenity Royale Hospital');
      console.log('');
      console.log('If you don\'t see the email:');
      console.log('   1. Check spam folder');
      console.log('   2. In n8n UI, check execution logs');
      console.log('   3. Verify Gmail OAuth is connected');
      console.log('   4. Check the "Send Email" node didn\'t fail');
      console.log('');
      
    } else {
      const errorText = await res.text();
      console.log('❌ Error Response:', errorText);
      console.log('');
      
      if (res.status === 404) {
        console.log('Workflow not activated. Please:');
        console.log('   1. Go to https://cwai97.app.n8n.cloud');
        console.log('   2. Click "Active" toggle');
        console.log('   3. Save');
      } else if (errorText.includes('patient_ref')) {
        console.log('Field mapping error. Fix:');
        console.log('   patient_ref: {{ $json.userId }} → {{ $json.patient_ref }}');
      }
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  // Check total appointments
  console.log('📋 Step 3: Check all appointments for odiabackend@gmail.com...');
  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('patient_email', 'odiabackend@gmail.com');

  console.log(`✅ Total appointments: ${count}`);
  console.log('');
  console.log('View at: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/editor/appointments');
  console.log('');
}

main();
