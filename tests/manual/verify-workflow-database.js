#!/usr/bin/env node

// Verify n8n workflow database records
const SUPABASE_URL = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.Gq3vNhC8bZWqGHECwOyQpXZGHKW8x-RZX0sqNwx_YjQ';

async function checkMessages() {
  console.log('\n===========================================');
  console.log('Checking Messages Table');
  console.log('===========================================\n');

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/messages?order=created_at.desc&limit=5&select=id,conversation_id,from_type,body,created_at`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  );

  const messages = await response.json();

  if (messages.length === 0) {
    console.log('❌ No messages found in database');
    console.log('   The "Save Message to Database" node may have failed');
    return;
  }

  console.log(`✅ Found ${messages.length} recent messages:\n`);
  messages.forEach((msg, idx) => {
    console.log(`${idx + 1}. Conversation: ${msg.conversation_id}`);
    console.log(`   From: ${msg.from_type}`);
    console.log(`   Message: ${msg.body?.substring(0, 60)}${msg.body?.length > 60 ? '...' : ''}`);
    console.log(`   Time: ${new Date(msg.created_at).toLocaleString()}`);
    console.log('');
  });

  // Check for test messages
  const testMessages = messages.filter(m =>
    m.conversation_id?.includes('test-conv') ||
    m.body?.includes('Testing')
  );

  if (testMessages.length > 0) {
    console.log(`✅ Found ${testMessages.length} test message(s) from workflow test`);
  }
}

async function checkAppointments() {
  console.log('\n===========================================');
  console.log('Checking Appointments Table');
  console.log('===========================================\n');

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/appointments?order=created_at.desc&limit=5&select=id,conversation_id,patient_name,patient_phone,appointment_date,appointment_time,reason,status,created_at`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  );

  const appointments = await response.json();

  if (appointments.length === 0) {
    console.log('❌ No appointments found in database');
    console.log('   The "Create Appointment" node may have failed');
    return;
  }

  console.log(`✅ Found ${appointments.length} recent appointments:\n`);
  appointments.forEach((apt, idx) => {
    console.log(`${idx + 1}. Patient: ${apt.patient_name}`);
    console.log(`   Phone: ${apt.patient_phone}`);
    console.log(`   Date/Time: ${apt.appointment_date} at ${apt.appointment_time}`);
    console.log(`   Reason: ${apt.reason}`);
    console.log(`   Status: ${apt.status}`);
    console.log(`   Created: ${new Date(apt.created_at).toLocaleString()}`);
    console.log('');
  });

  // Check for test appointment
  const testAppointments = appointments.filter(a =>
    a.conversation_id?.includes('test-conv') ||
    a.patient_name?.includes('Jane Smith')
  );

  if (testAppointments.length > 0) {
    console.log(`✅ Found ${testAppointments.length} test appointment(s) from workflow test`);
  }
}

async function main() {
  try {
    await checkMessages();
    await checkAppointments();

    console.log('\n===========================================');
    console.log('Database Verification Complete!');
    console.log('===========================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('   Details:', error.cause);
    }
    process.exit(1);
  }
}

main();
