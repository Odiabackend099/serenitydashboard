#!/usr/bin/env node

/**
 * Complete end-to-end test with correct service role key
 * This will test both database creation and n8n webhook
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.p-iTMEooHf9AlaWZPklBjZq-fV0aiYBY9fq633KQ1vU';
const n8nWebhookUrl = 'https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🎯 Complete Appointment Booking System Test');
  console.log('='.repeat(70));
  console.log('');

  // Test 1: Verify table exists
  console.log('📋 Test 1: Verify appointments table exists...');
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Appointments table does NOT exist!');
        console.log('');
        console.log('Please run this SQL in Supabase SQL Editor:');
        console.log('https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/sql');
        console.log('');
        console.log('Copy contents from: CREATE_APPOINTMENTS_TABLE_FINAL.sql');
        console.log('');
        return;
      } else {
        console.log('⚠️  Table check returned error:', error.message);
      }
    } else {
      console.log('✅ Appointments table exists and is accessible!');
    }
  } catch (err) {
    console.log('Error:', err.message);
  }

  console.log('');

  // Test 2: Create test appointment directly in database
  console.log('📋 Test 2: Create test appointment in database...');

  const timestamp = Date.now();
  const testAppointment = {
    conversation_id: `test-conv-${timestamp}`,
    patient_ref: `test-patient-${timestamp}`,
    patient_name: 'Test Patient (for odiabackend@gmail.com)',
    patient_email: 'odiabackend@gmail.com',
    patient_phone: '+234 806 219 7384',
    appointment_date: '2025-11-14',
    appointment_time: '14:00:00',
    appointment_type: 'consultation',
    reason: 'General checkup and consultation - AUTOMATED SYSTEM TEST',
    status: 'pending',
    notes: 'This is a test appointment to verify the complete booking system'
  };

  const { data: appointment, error: insertError } = await supabase
    .from('appointments')
    .insert(testAppointment)
    .select()
    .single();

  if (insertError) {
    console.log('❌ Failed to create appointment:', insertError.message);
    console.log('');
    return;
  }

  console.log('✅ Appointment created successfully!');
  console.log('   ID:', appointment.id);
  console.log('   Patient:', appointment.patient_name);
  console.log('   Email:', appointment.patient_email);
  console.log('   Date:', appointment.appointment_date);
  console.log('   Time:', appointment.appointment_time);
  console.log('');

  // Test 3: Trigger n8n webhook (which should send email)
  console.log('📋 Test 3: Trigger n8n webhook for email confirmation...');

  const webhookPayload = {
    // Multiple ID formats for compatibility
    userId: testAppointment.patient_ref,
    patientRef: testAppointment.patient_ref,
    patient_ref: testAppointment.patient_ref,

    // Session IDs
    conversationId: testAppointment.conversation_id,
    sessionId: testAppointment.conversation_id,
    conversation_id: testAppointment.conversation_id,

    // Intent
    intent: 'appointment',

    // Patient contact info (CRITICAL for email)
    patientEmail: 'odiabackend@gmail.com',
    patient_email: 'odiabackend@gmail.com',
    email: 'odiabackend@gmail.com',

    patientPhone: '+234 806 219 7384',
    patient_phone: '+234 806 219 7384',
    phone: '+234 806 219 7384',

    patientName: 'Test Patient (for odiabackend@gmail.com)',
    patient_name: 'Test Patient (for odiabackend@gmail.com)',
    name: 'Test Patient (for odiabackend@gmail.com)',

    // Appointment details
    appointmentDate: '2025-11-14',
    appointment_date: '2025-11-14',

    appointmentTime: '14:00',
    appointment_time: '14:00',

    appointmentReason: 'General checkup and consultation',
    appointment_reason: 'General checkup and consultation',
    reason: 'General checkup and consultation',

    appointmentType: 'consultation',
    appointment_type: 'consultation',

    // Message context
    message: 'I would like to book an appointment for next Monday at 2pm for a general checkup',
    text: 'I would like to book an appointment for next Monday at 2pm for a general checkup',
    channel: 'webchat',
    timestamp: new Date().toISOString(),
    hasContactInfo: true
  };

  console.log('Sending to:', n8nWebhookUrl);
  console.log('');

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });

    console.log(`Response: ${response.status} ${response.statusText}`);
    console.log('');

    if (response.ok) {
      try {
        const result = await response.json();
        console.log('✅ n8n webhook SUCCESS!');
        console.log('Response data:', JSON.stringify(result, null, 2));
        console.log('');
        console.log('━'.repeat(70));
        console.log('🎉 SUCCESS! EMAIL SHOULD BE SENT!');
        console.log('━'.repeat(70));
        console.log('');
        console.log('📧 CHECK YOUR EMAIL: odiabackend@gmail.com');
        console.log('');
        console.log('Expected email:');
        console.log('  Subject: Appointment Confirmation - Serenity Royale Hospital');
        console.log('  To: odiabackend@gmail.com');
        console.log('  Content: Beautiful HTML confirmation with appointment details');
        console.log('');
      } catch (e) {
        console.log('✅ Webhook processed (could not parse JSON response)');
      }
    } else {
      const errorText = await response.text();
      console.log('⚠️  n8n returned an error:');
      console.log(errorText);
      console.log('');
      console.log('This means the n8n workflow needs to be setup:');
      console.log('');
      console.log('1. Go to: https://cwai97.app.n8n.cloud');
      console.log('2. Import: n8n-srhcareai-enhanced.json');
      console.log('3. Configure Supabase credential');
      console.log('4. Configure Gmail OAuth');
      console.log('5. Activate the workflow');
      console.log('');
      console.log('See FINAL_SETUP_STEPS.md for detailed instructions');
    }
  } catch (error) {
    console.log('❌ Error calling n8n webhook:', error.message);
    console.log('');
    console.log('The n8n workflow may not be active or configured.');
  }

  console.log('');
  console.log('='.repeat(70));
  console.log('📊 Test Summary:');
  console.log('');
  console.log('✅ Database: Appointment created successfully');
  console.log('   View at: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/editor/appointments');
  console.log('');
  console.log('To complete n8n setup:');
  console.log('   See: FINAL_SETUP_STEPS.md');
  console.log('   See: QUICK_START.txt');
  console.log('');
}

main().catch(console.error);
