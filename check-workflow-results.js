#!/usr/bin/env node

// Check workflow results in database
const SUPABASE_URL = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

async function checkMessages() {
  console.log('\n===========================================');
  console.log('Checking Messages Table');
  console.log('===========================================\n');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?order=created_at.desc&limit=10&select=id,conversation_id,from_type,body,created_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      const error = await response.text();
      console.log('Error details:', error);
      return;
    }

    const messages = await response.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      console.log('❌ No messages found in database');
      console.log('   Response:', messages);
      return;
    }

    console.log(`✅ Found ${messages.length} recent messages:\n`);
    messages.forEach((msg, idx) => {
      console.log(`${idx + 1}. ID: ${msg.id.substring(0, 8)}...`);
      console.log(`   Conversation: ${msg.conversation_id}`);
      console.log(`   From: ${msg.from_type}`);
      console.log(`   Message: ${msg.body?.substring(0, 60)}${msg.body?.length > 60 ? '...' : ''}`);
      console.log(`   Time: ${new Date(msg.created_at).toLocaleString()}`);
      console.log('');
    });

    // Check for test messages from today
    const today = new Date().toISOString().split('T')[0];
    const todayMessages = messages.filter(m => m.created_at?.includes(today));
    console.log(`📊 Messages created today: ${todayMessages.length}`);

  } catch (error) {
    console.error('❌ Error checking messages:', error.message);
  }
}

async function checkAppointments() {
  console.log('\n===========================================');
  console.log('Checking Appointments Table');
  console.log('===========================================\n');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/appointments?order=created_at.desc&limit=10&select=id,conversation_id,patient_name,patient_phone,appointment_date,appointment_time,reason,status,created_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      const error = await response.text();
      console.log('Error details:', error);
      return;
    }

    const appointments = await response.json();

    if (!Array.isArray(appointments) || appointments.length === 0) {
      console.log('❌ No appointments found in database');
      console.log('   Response:', appointments);
      return;
    }

    console.log(`✅ Found ${appointments.length} recent appointments:\n`);
    appointments.forEach((apt, idx) => {
      console.log(`${idx + 1}. ID: ${apt.id.substring(0, 8)}...`);
      console.log(`   Patient: ${apt.patient_name}`);
      console.log(`   Phone: ${apt.patient_phone}`);
      console.log(`   Date/Time: ${apt.appointment_date} at ${apt.appointment_time}`);
      console.log(`   Reason: ${apt.reason}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Created: ${new Date(apt.created_at).toLocaleString()}`);
      console.log('');
    });

    // Check for test appointments from today
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.created_at?.includes(today));
    console.log(`📊 Appointments created today: ${todayAppointments.length}`);

  } catch (error) {
    console.error('❌ Error checking appointments:', error.message);
  }
}

async function main() {
  await checkMessages();
  await checkAppointments();

  console.log('\n===========================================');
  console.log('✅ Workflow Verification Complete!');
  console.log('===========================================\n');
}

main();
