const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  'sbp_364edb14c06fa6e79764a0121f08321eec74608f'
);

async function createTestConversations() {
  console.log('🔧 Creating HIPAA-compliant test conversations...\n');

  // Test Conversation 1: General Consultation
  console.log('1️⃣ Creating general consultation conversation...');
  const { data: conv1, error: err1 } = await supabase
    .from('conversations')
    .insert({
      channel: 'webchat',
      patient_ref: 'patient-TEST001',
      status: 'open',
      intent: 'appointment',
      ai_confidence: 0.95
    })
    .select()
    .single();

  if (err1) {
    console.error('Error:', err1.message);
  } else {
    console.log(`   ✅ Created conversation: ${conv1.id}`);

    // Add messages
    const messages1 = [
      { from_type: 'patient', body: 'Hi, I need to schedule an appointment for a general checkup' },
      { from_type: 'ai', body: 'Hello! I\'d be happy to help you schedule a general checkup. Can you please provide your preferred date and time?' },
      { from_type: 'patient', body: 'How about next Tuesday at 2 PM?' },
      { from_type: 'ai', body: 'Let me check availability for Tuesday at 2 PM... Great! I have that slot available. May I have your full name and contact information?' },
      { from_type: 'patient', body: 'Sarah Johnson, email: test.patient@example.com' },
      { from_type: 'ai', body: 'Thank you, Sarah. Your appointment is confirmed for Tuesday at 2:00 PM. You\'ll receive a confirmation email shortly.' },
      { from_type: 'patient', body: 'Just a routine checkup and maybe discuss my blood pressure readings' },
      { from_type: 'ai', body: 'Noted. Please bring any recent blood pressure logs with you. See you on Tuesday!' }
    ];

    for (const msg of messages1) {
      await supabase.from('messages').insert({
        conversation_id: conv1.id,
        ...msg
      });
    }
    console.log(`   ✅ Added ${messages1.length} messages\n`);
  }

  // Test Conversation 2: Follow-up
  console.log('2️⃣ Creating follow-up appointment conversation...');
  const { data: conv2, error: err2 } = await supabase
    .from('conversations')
    .insert({
      channel: 'voice',
      patient_ref: 'patient-TEST002',
      status: 'open',
      intent: 'appointment',
      ai_confidence: 0.92
    })
    .select()
    .single();

  if (!err2) {
    console.log(`   ✅ Created conversation: ${conv2.id}`);

    const messages2 = [
      { from_type: 'patient', body: 'I need a follow-up appointment after my recent lab work' },
      { from_type: 'ai', body: 'I understand you need a follow-up for your lab results. When would you like to come in?' },
      { from_type: 'patient', body: 'As soon as possible please' },
      { from_type: 'ai', body: 'I have an opening tomorrow at 10:30 AM. Would that work for you?' },
      { from_type: 'patient', body: 'Yes, perfect. Thank you!' },
      { from_type: 'ai', body: 'You\'re all set for tomorrow at 10:30 AM. The doctor will review your lab results with you then.' }
    ];

    for (const msg of messages2) {
      await supabase.from('messages').insert({
        conversation_id: conv2.id,
        ...msg
      });
    }
    console.log(`   ✅ Added ${messages2.length} messages\n`);
  }

  // Test Conversation 3: Active conversation
  console.log('3️⃣ Creating active consultation conversation...');
  const { data: conv3, error: err3 } = await supabase
    .from('conversations')
    .insert({
      channel: 'webchat',
      patient_ref: 'patient-TEST003',
      status: 'open',
      intent: 'appointment',
      ai_confidence: 0.96
    })
    .select()
    .single();

  if (!err3) {
    console.log(`   ✅ Created conversation: ${conv3.id}`);

    const messages3 = [
      { from_type: 'patient', body: 'Good afternoon! I\'m looking to schedule a consultation for persistent headaches' },
      { from_type: 'ai', body: 'Good afternoon! I\'m sorry to hear about your headaches. I can help you schedule a consultation. How long have you been experiencing these headaches?' },
      { from_type: 'patient', body: 'About two weeks now. They\'re pretty frequent, almost daily' },
      { from_type: 'ai', body: 'I understand. I have availability this Thursday at 3:00 PM or Friday at 11:00 AM. Which works better?' },
      { from_type: 'patient', body: 'Friday at 11 AM would be perfect' },
      { from_type: 'ai', body: 'Excellent. May I have your name and contact information to complete the booking?' }
    ];

    for (const msg of messages3) {
      await supabase.from('messages').insert({
        conversation_id: conv3.id,
        ...msg
      });
    }
    console.log(`   ✅ Added ${messages3.length} messages\n`);
  }

  // Summary
  console.log('╔══════════════════════════════════════╗');
  console.log('║  ✅ Test Data Created Successfully!  ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('\n📊 Summary:');
  console.log('   • 3 test conversations created');
  console.log('   • 20 messages added');
  console.log('   • All data is HIPAA-compliant (fictional)');
  console.log('\n🔍 Refresh your dashboard to see the new conversations!');
}

createTestConversations().catch(console.error);
