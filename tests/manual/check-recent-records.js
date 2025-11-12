#!/usr/bin/env node

// Check for very recent records (last 5 minutes)
const SUPABASE_URL = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

async function checkRecentMessages() {
  console.log('\n===========================================');
  console.log('Checking Messages from Last 5 Minutes');
  console.log('===========================================\n');

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?created_at=gte.${fiveMinutesAgo}&order=created_at.desc&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`);
      return;
    }

    const messages = await response.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      console.log('❌ No messages found in the last 5 minutes');
      console.log('   The "Save Message to Database" node may not be working');
      return;
    }

    console.log(`✅ Found ${messages.length} message(s) in the last 5 minutes:\n`);
    messages.forEach((msg, idx) => {
      console.log(`${idx + 1}. Conversation: ${msg.conversation_id}`);
      console.log(`   From: ${msg.from_type}`);
      console.log(`   Message: ${msg.body}`);
      console.log(`   Created: ${new Date(msg.created_at).toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function checkRecentAppointments() {
  console.log('\n===========================================');
  console.log('Checking Appointments from Last 5 Minutes');
  console.log('===========================================\n');

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/appointments?created_at=gte.${fiveMinutesAgo}&order=created_at.desc&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`);
      return;
    }

    const appointments = await response.json();

    if (!Array.isArray(appointments) || appointments.length === 0) {
      console.log('❌ No appointments found in the last 5 minutes');
      console.log('   The "Create Appointment" node may have failed');
      console.log('   Check n8n Executions tab for error details');
      return;
    }

    console.log(`✅ Found ${appointments.length} appointment(s) in the last 5 minutes:\n`);
    appointments.forEach((apt, idx) => {
      console.log(`${idx + 1}. Patient: ${apt.patient_name}`);
      console.log(`   Phone: ${apt.patient_phone}`);
      console.log(`   Date/Time: ${apt.appointment_date} at ${apt.appointment_time}`);
      console.log(`   Type: ${apt.appointment_type}`);
      console.log(`   Reason: ${apt.reason}`);
      console.log(`   Created: ${new Date(apt.created_at).toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  await checkRecentMessages();
  await checkRecentAppointments();

  console.log('\n===========================================');
  console.log('Next Step: Check n8n Executions Tab');
  console.log('===========================================');
  console.log('Go to: https://cwai97.app.n8n.cloud');
  console.log('Click: Executions tab');
  console.log('Look for: Any red error indicators');
  console.log('');
}

main();
