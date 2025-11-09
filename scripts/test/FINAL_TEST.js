#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.p-iTMEooHf9AlaWZPklBjZq-fV0aiYBY9fq633KQ1vU'
);

async function sendTestEmail() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║      FINAL TEST - Send Email to odiabackend@gmail.com    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

  const payload = {
    userId: `patient-${Date.now()}`,
    patientRef: `patient-${Date.now()}`,
    patient_ref: `patient-${Date.now()}`,
    sessionId: `session-${Date.now()}`,
    conversationId: `conv-${Date.now()}`,
    intent: 'appointment',
    patientEmail: 'odiabackend@gmail.com',
    patientPhone: '+234 806 219 7384',
    patientName: 'Test Patient (Final Test)',
    appointmentDate: '2025-11-14',
    appointmentTime: '14:00',
    appointmentReason: 'General checkup and consultation',
    appointmentType: 'consultation',
    message: 'Book appointment for next Monday at 2pm',
    channel: 'webchat',
    timestamp: new Date().toISOString()
  };

  console.log('📤 Sending to n8n production webhook...');
  
  const res = await fetch('https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log(`\n✅ Response: ${res.status} ${res.statusText}`);

  if (res.ok) {
    console.log('');
    console.log('═'.repeat(63));
    console.log('🎉 SUCCESS! WORKFLOW EXECUTED!');
    console.log('═'.repeat(63));
    console.log('');
    console.log('✅ n8n workflow processed the request');
    console.log('✅ Appointment should be saved to database');
    console.log('✅ Email should be sent (if Gmail configured)');
    console.log('');
    console.log('📧 CHECK YOUR EMAIL: odiabackend@gmail.com');
    console.log('');
    console.log('Expected email:');
    console.log('  ┌─────────────────────────────────────────────────┐');
    console.log('  │ From: Your Gmail account                        │');
    console.log('  │ To: odiabackend@gmail.com                       │');
    console.log('  │ Subject: Appointment Confirmation -             │');
    console.log('  │          Serenity Royale Hospital               │');
    console.log('  │                                                 │');
    console.log('  │ Hello Test Patient,                             │');
    console.log('  │                                                 │');
    console.log('  │ Your appointment has been successfully booked.  │');
    console.log('  │                                                 │');
    console.log('  │ Date: November 14, 2025                         │');
    console.log('  │ Time: 2:00 PM                                   │');
    console.log('  │ Type: Consultation                              │');
    console.log('  │                                                 │');
    console.log('  └─────────────────────────────────────────────────┘');
    console.log('');
    console.log('If no email arrived:');
    console.log('  1. Check spam/junk folder');
    console.log('  2. Check n8n execution logs:');
    console.log('     https://cwai97.app.n8n.cloud');
    console.log('  3. Verify Gmail OAuth is connected in n8n');
    console.log('  4. Check "Send Email" node didn\'t fail');
    console.log('');
  } else {
    const error = await res.text().catch(() => 'Could not read error');
    console.log('\n❌ Error:', error);
    console.log('\nTroubleshooting:');
    console.log('  1. Check workflow is Active in n8n');
    console.log('  2. Fix patient_ref field mapping');
    console.log('  3. Check n8n execution logs');
  }

  // Show appointment count
  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('patient_email', 'odiabackend@gmail.com');

  console.log(`📊 Total appointments in database: ${count}`);
  console.log('');
  console.log('═'.repeat(63));
  console.log('');
}

sendTestEmail();
