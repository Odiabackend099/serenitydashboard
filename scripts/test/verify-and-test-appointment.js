#!/usr/bin/env node

/**
 * Complete verification and test of appointment booking system
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const n8nWebhookUrl = 'https://cwai97.app.n8n.cloud/webhook-test/serenity-webhook-v2';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🧪 Complete Appointment Booking System Test');
  console.log('='.repeat(60));
  console.log('');
  
  // Check if service role key is configured
  if (!supabaseServiceKey) {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    console.log('Please set your Supabase service role key:');
    console.log('export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
    process.exit(1);
  }

  // Step 1: Verify appointments table exists
  console.log('📋 Step 1: Verifying appointments table...');
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('❌ Appointments table does not exist!');
      console.log('');
      console.log('📝 To create it, run this SQL in Supabase SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/sql');
      console.log('');
      console.log('Copy and paste the contents of: CREATE_APPOINTMENTS_TABLE_FINAL.sql');
      console.log('');
      return;
    }

    console.log('✅ Appointments table exists!');
  } catch (err) {
    console.log('⚠️  Error checking table:', err.message);
  }

  console.log('');

  // Step 2: Test direct appointment creation in Supabase
  console.log('📋 Step 2: Testing direct appointment creation...');

  const testAppointment = {
    conversation_id: `test-conv-${Date.now()}`,
    patient_ref: `test-patient-${Date.now()}`,
    patient_name: 'Test Patient for odiabackend',
    patient_email: 'odiabackend@gmail.com',
    patient_phone: '+234 806 219 7384',
    appointment_date: '2025-11-14',
    appointment_time: '14:00:00',
    appointment_type: 'consultation',
    reason: 'General checkup - AUTOMATED TEST',
    status: 'pending',
    notes: 'Test booking created by automated system'
  };

  const { data: createdAppointment, error: createError } = await supabase
    .from('appointments')
    .insert(testAppointment)
    .select()
    .single();

  if (createError) {
    console.log('❌ Error creating appointment:', createError.message);
    console.log('');

    if (createError.message.includes('relation') && createError.message.includes('does not exist')) {
      console.log('The appointments table needs to be created first.');
      console.log('Please run CREATE_APPOINTMENTS_TABLE_FINAL.sql in Supabase SQL Editor.');
    }
    return;
  }

  console.log('✅ Appointment created in database!');
  console.log('   ID:', createdAppointment.id);
  console.log('   Email:', createdAppointment.patient_email);
  console.log('');

  // Step 3: Test n8n webhook
  console.log('📋 Step 3: Testing n8n webhook integration...');

  const webhookPayload = {
    // Identity fields
    userId: testAppointment.patient_ref,
    patientRef: testAppointment.patient_ref,
    patient_ref: testAppointment.patient_ref,

    // Session
    conversationId: testAppointment.conversation_id,
    sessionId: testAppointment.conversation_id,

    // Intent
    intent: 'appointment',

    // Contact
    patientEmail: 'odiabackend@gmail.com',
    patientPhone: '+234 806 219 7384',
    patientName: 'Test Patient for odiabackend',

    // Appointment
    appointmentDate: '2025-11-14',
    appointmentTime: '14:00',
    appointmentReason: 'General checkup - n8n webhook test',
    appointmentType: 'consultation',

    // Message
    message: 'I need to book an appointment for next Monday at 2pm',
    channel: 'webchat',
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });

    console.log(`Response: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ n8n webhook processed successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('');
      console.log('📧 EMAIL SHOULD BE SENT TO: odiabackend@gmail.com');
      console.log('');
      console.log('✉️  CHECK YOUR INBOX!');
    } else {
      const errorText = await response.text();
      console.log('⚠️  n8n webhook returned error:');
      console.log(errorText);
      console.log('');
      console.log('Possible issues:');
      console.log('1. n8n workflow not activated');
      console.log('2. Gmail OAuth not configured');
      console.log('3. Supabase credentials not set in n8n');
      console.log('');
      console.log('To fix:');
      console.log('1. Open https://cwai97.app.n8n.cloud');
      console.log('2. Import n8n-srhcareai-enhanced.json if not already');
      console.log('3. Configure Supabase credential');
      console.log('4. Configure Gmail OAuth2 credential');
      console.log('5. Activate the workflow');
    }
  } catch (error) {
    console.log('❌ Error calling n8n webhook:', error.message);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('📊 Test Summary:');
  console.log('   ✅ Database appointment creation: SUCCESS');
  console.log('   View in Supabase: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/editor/appointments');
  console.log('');
  console.log('For n8n email to work, ensure:');
  console.log('   1. Workflow is imported and active');
  console.log('   2. Gmail OAuth is configured');
  console.log('   3. Supabase credentials are set');
  console.log('');
}

main().catch(console.error);
