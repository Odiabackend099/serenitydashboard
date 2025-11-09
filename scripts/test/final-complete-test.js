#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.p-iTMEooHf9AlaWZPklBjZq-fV0aiYBY9fq633KQ1vU';
const n8nWebhookUrl = 'https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🎯 COMPLETE END-TO-END TEST');
  console.log('='.repeat(70));
  console.log('Target: Send email to odiabackend@gmail.com');
  console.log('='.repeat(70));
  console.log('');

  const timestamp = Date.now();
  
  // Step 1: Test database
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
    reason: 'General checkup - COMPLETE TEST',
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

  // Step 2: Test n8n webhook
  console.log('📋 Step 2: Test n8n webhook...');
  
  const payload = {
    // Send ALL possible field variations
    userId: testAppt.patient_ref,
    patientRef: testAppt.patient_ref,
    patient_ref: testAppt.patient_ref,
    
    sessionId: `session-${timestamp}`,
    conversationId: `conv-${timestamp}`,
    conversation_id: `conv-${timestamp}`,
    
    intent: 'appointment',
    
    patientEmail: 'odiabackend@gmail.com',
    patient_email: 'odiabackend@gmail.com',
    email: 'odiabackend@gmail.com',
    
    patientPhone: '+234 806 219 7384',
    patient_phone: '+234 806 219 7384',
    phone: '+234 806 219 7384',
    
    patientName: 'Test Patient for odiabackend',
    patient_name: 'Test Patient for odiabackend',
    name: 'Test Patient for odiabackend',
    
    appointmentDate: '2025-11-14',
    appointment_date: '2025-11-14',
    
    appointmentTime: '14:00',
    appointment_time: '14:00',
    
    appointmentReason: 'General checkup and consultation',
    appointment_reason: 'General checkup and consultation',
    reason: 'General checkup and consultation',
    
    appointmentType: 'consultation',
    appointment_type: 'consultation',
    
    message: 'I would like to book an appointment for Monday at 2pm',
    text: 'I would like to book an appointment for Monday at 2pm',
    channel: 'webchat',
    timestamp: new Date().toISOString(),
    hasContactInfo: true
  };

  console.log('Calling:', n8nWebhookUrl);
  console.log('');

  const res = await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log(`Response: ${res.status} ${res.statusText}`);
  console.log('');

  if (res.ok) {
    try {
      const data = await res.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Response received (no JSON body)');
    }
    
    console.log('');
    console.log('='.repeat(70));
    console.log('✅ n8n WORKFLOW EXECUTED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📧 EMAIL STATUS:');
    console.log('   If Gmail OAuth is configured: ✅ Email sent');
    console.log('   If Gmail OAuth NOT configured: ⚠️  No email (but workflow ran)');
    console.log('');
    console.log('📬 Check: odiabackend@gmail.com');
    console.log('   Subject: Appointment Confirmation - Serenity Royale Hospital');
    console.log('');
    console.log('If no email received:');
    console.log('   1. Check spam folder');
    console.log('   2. In n8n, check Gmail OAuth is connected');
    console.log('   3. Check n8n execution logs');
    console.log('');
  } else {
    const errorText = await res.text();
    console.log('❌ n8n Error:', errorText);
    console.log('');
    
    if (errorText.includes('patient_ref')) {
      console.log('🔧 FIELD MAPPING ERROR DETECTED!');
      console.log('');
      console.log('Fix in n8n:');
      console.log('   1. Open "Save Appointment to Supabase" node');
      console.log('   2. Change patient_ref from {{ $json.userId }}');
      console.log('   3. To: {{ $json.patient_ref }}');
      console.log('   4. Save');
      console.log('');
    }
  }

  // Step 3: Verify what was saved
  console.log('📋 Step 3: Verify appointments in database...');
  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('patient_email', 'odiabackend@gmail.com');

  console.log(`✅ Found ${count} appointment(s) for odiabackend@gmail.com`);
  console.log('');
  console.log('View at: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/editor/appointments');
  console.log('');
  console.log('='.repeat(70));
}

main();
