#!/usr/bin/env node

/**
 * Test Appointment Booking - Direct to Supabase
 * This bypasses n8n and saves directly to Supabase appointments table
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.Gq3vNhC8bZWqGHECwOyQpXZGHKW8x-RZX0sqNwx_YjQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppointmentBooking() {
  console.log('🗓️  Testing Appointment Booking - Direct to Supabase');
  console.log('================================================\n');

  const appointmentData = {
    conversation_id: `test-conv-${Date.now()}`,
    patient_ref: 'test-patient-001',
    patient_name: 'Test Patient for odiabackend',
    patient_email: 'odiabackend@gmail.com',
    patient_phone: '+234 806 219 7384',
    appointment_date: '2025-11-14',
    appointment_time: '14:00:00',
    appointment_type: 'consultation',
    reason: 'General checkup and consultation - TEST BOOKING',
    status: 'pending',
    notes: 'This is a test appointment created via script to verify the system'
  };

  console.log('📤 Creating appointment in Supabase...');
  console.log('Data:', JSON.stringify(appointmentData, null, 2));
  console.log('');

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating appointment:', error.message);
      console.error('Details:', error);

      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n⚠️  The appointments table does not exist yet!');
        console.log('📋 Please run the migration first:');
        console.log('   node apply-appointments-migration.js');
        console.log('\nOr manually run CREATE_APPOINTMENTS_TABLE_FINAL.sql in Supabase SQL Editor');
      }
      return;
    }

    console.log('✅ Appointment created successfully!');
    console.log('📋 Appointment ID:', data.id);
    console.log('📧 Patient Email:', data.patient_email);
    console.log('📅 Date:', data.appointment_date);
    console.log('🕐 Time:', data.appointment_time);
    console.log('');

    console.log('📧 Email Notification:');
    console.log('Since n8n Gmail is not configured yet, here\'s what would be sent:');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('To: odiabackend@gmail.com');
    console.log('Subject: Appointment Confirmation - Serenity Royale Hospital');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Hello Test Patient for odiabackend,');
    console.log('');
    console.log('Your appointment has been successfully booked.');
    console.log('');
    console.log('Details:');
    console.log('  Date: November 14, 2025');
    console.log('  Time: 2:00 PM');
    console.log('  Type: Consultation');
    console.log('  Reason: General checkup and consultation');
    console.log('');
    console.log('Important Information:');
    console.log('  • Please arrive 15 minutes before your scheduled time');
    console.log('  • Bring your ID and insurance card');
    console.log('  • If you need to reschedule, call us at +234 806 219 7384');
    console.log('');
    console.log('Our staff will contact you within 24 hours to confirm.');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    console.log('✅ SUCCESS! Appointment saved to database.');
    console.log('');
    console.log('📊 To view in Supabase:');
    console.log('   1. Go to https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq');
    console.log('   2. Navigate to Table Editor > appointments');
    console.log('   3. Look for appointment ID: ' + data.id.slice(0, 8) + '...');
    console.log('');
    console.log('📧 To enable actual email sending:');
    console.log('   1. Open n8n: https://cwai97.app.n8n.cloud');
    console.log('   2. Import workflow: n8n-srhcareai-enhanced.json');
    console.log('   3. Configure Gmail OAuth credentials');
    console.log('   4. Activate the workflow');
    console.log('   5. Run: node test-appointment-booking-email.js');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }

  console.log('\n================================================');
}

testAppointmentBooking();
