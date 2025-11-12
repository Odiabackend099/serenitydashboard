const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your_anon_key_here'
);

async function createAllChannelsTestData() {
  console.log('🔧 Creating HIPAA-compliant test conversations for ALL channels...\n');

  // Delete old test conversations
  console.log('🗑️  Cleaning up old test data...');
  const { data: oldConvs } = await supabase
    .from('conversations')
    .select('id')
    .like('patient_ref', 'patient-TEST%');

  if (oldConvs && oldConvs.length > 0) {
    for (const conv of oldConvs) {
      await supabase.from('messages').delete().eq('conversation_id', conv.id);
      await supabase.from('conversations').delete().eq('id', conv.id);
    }
    console.log(`   ✅ Deleted ${oldConvs.length} old test conversations\n`);
  }

  // ========================================
  // WEBCHAT CONVERSATIONS
  // ========================================

  // Webchat 1: Appointment Scheduling
  console.log('💬 WEBCHAT #1: Appointment Scheduling');
  const { data: web1, error: webErr1 } = await supabase
    .from('conversations')
    .insert({
      channel: 'webchat',
      patient_ref: 'patient-TEST-WEB001',
      status: 'open',
      intent: 'appointment',
      ai_confidence: 0.95
    })
    .select()
    .single();

  if (!webErr1 && web1) {
    console.log(`   ✅ Created: ${web1.id}`);
    const messages = [
      { from_type: 'patient', body: 'Hi, I need to schedule an appointment for a general checkup' },
      { from_type: 'ai', body: 'Hello! I\'d be happy to help you schedule a general checkup. Can you please provide your preferred date and time?' },
      { from_type: 'patient', body: 'How about next Tuesday at 2 PM?' },
      { from_type: 'ai', body: 'Let me check availability for Tuesday at 2 PM... Great! I have that slot available. May I have your full name and contact information?' },
      { from_type: 'patient', body: 'Sarah Johnson, email: test.patient@example.com' },
      { from_type: 'ai', body: 'Thank you, Sarah. Your appointment is confirmed for Tuesday at 2:00 PM. You\'ll receive a confirmation email shortly. Is there anything specific you\'d like to discuss during your visit?' },
      { from_type: 'patient', body: 'Just a routine checkup and maybe discuss my blood pressure readings' },
      { from_type: 'ai', body: 'Noted. Please bring any recent blood pressure logs with you. See you on Tuesday!' }
    ];
    for (const msg of messages) {
      await supabase.from('messages').insert({ conversation_id: web1.id, ...msg });
    }
    console.log(`   ✅ Added ${messages.length} messages\n`);
  }

  // Webchat 2: Prescription Refill
  console.log('💬 WEBCHAT #2: Prescription Refill Request');
  const { data: web2, error: webErr2 } = await supabase
    .from('conversations')
    .insert({
      channel: 'webchat',
      patient_ref: 'patient-TEST-WEB002',
      status: 'open',
      intent: 'general',
      ai_confidence: 0.88
    })
    .select()
    .single();

  if (!webErr2 && web2) {
    console.log(`   ✅ Created: ${web2.id}`);
    const messages = [
      { from_type: 'patient', body: 'Hello, I need to refill my prescription' },
      { from_type: 'ai', body: 'I can help you with that. Can you tell me which medication you need refilled?' },
      { from_type: 'patient', body: 'My blood pressure medication - I think it\'s called Lisinopril' },
      { from_type: 'ai', body: 'Thank you. Let me transfer you to our pharmacy team to process your Lisinopril refill. They\'ll verify your prescription and arrange the refill. One moment please.' },
      { from_type: 'staff', body: 'Hi, I\'m here from the pharmacy team. I see you need a Lisinopril refill. Let me check your records.' },
      { from_type: 'patient', body: 'Thank you' },
      { from_type: 'staff', body: 'Your refill is approved and will be ready for pickup tomorrow after 2 PM. We\'ll send a text when it\'s ready.' }
    ];
    for (const msg of messages) {
      await supabase.from('messages').insert({ conversation_id: web2.id, ...msg });
    }
    console.log(`   ✅ Added ${messages.length} messages\n`);
  }

  // Webchat 3: Headache Consultation
  console.log('💬 WEBCHAT #3: Active Headache Consultation');
  const { data: web3, error: webErr3 } = await supabase
    .from('conversations')
    .insert({
      channel: 'webchat',
      patient_ref: 'patient-TEST-WEB003',
      status: 'open',
      intent: 'appointment',
      ai_confidence: 0.96
    })
    .select()
    .single();

  if (!webErr3 && web3) {
    console.log(`   ✅ Created: ${web3.id}`);
    const messages = [
      { from_type: 'patient', body: 'Good afternoon! I\'m looking to schedule a consultation for persistent headaches' },
      { from_type: 'ai', body: 'Good afternoon! I\'m sorry to hear about your headaches. I can help you schedule a consultation. How long have you been experiencing these headaches?' },
      { from_type: 'patient', body: 'About two weeks now. They\'re pretty frequent, almost daily' },
      { from_type: 'ai', body: 'I understand. Given the frequency, I\'d recommend seeing a doctor soon. I have availability this Thursday at 3:00 PM or Friday at 11:00 AM. Which works better for you?' },
      { from_type: 'patient', body: 'Friday at 11 AM would be perfect' },
      { from_type: 'ai', body: 'Excellent. May I have your name and contact information to complete the booking?' }
    ];
    for (const msg of messages) {
      await supabase.from('messages').insert({ conversation_id: web3.id, ...msg });
    }
    console.log(`   ✅ Added ${messages.length} messages\n`);
  }

  // ========================================
  // WHATSAPP CONVERSATIONS
  // ========================================

  // WhatsApp 1: Lab Results Inquiry
  console.log('📱 WHATSAPP #1: Lab Results Inquiry');
  const { data: wa1, error: waErr1 } = await supabase
    .from('conversations')
    .insert({
      channel: 'whatsapp',
      patient_ref: 'patient-TEST-WA001',
      status: 'open',
      intent: 'general',
      ai_confidence: 0.92
    })
    .select()
    .single();

  if (!waErr1 && wa1) {
    console.log(`   ✅ Created: ${wa1.id}`);
    const messages = [
      { from_type: 'patient', body: 'Hi, I\'m checking on my lab results from last week' },
      { from_type: 'ai', body: 'Hello! I can help you with that. Let me check the status of your lab results. Can you confirm your date of birth for verification?' },
      { from_type: 'patient', body: '05/15/1985' },
      { from_type: 'ai', body: 'Thank you. I can see your lab results are ready. I\'ll connect you with a nurse who can review them with you.' },
      { from_type: 'staff', body: 'Hello! This is Nurse Martinez. Your cholesterol and blood glucose levels look good. Everything is within normal range. Do you have any questions?' },
      { from_type: 'patient', body: 'That\'s great news! No questions, thank you!' },
      { from_type: 'staff', body: 'Wonderful! We\'ll send you a copy via email. Take care!' }
    ];
    for (const msg of messages) {
      await supabase.from('messages').insert({ conversation_id: wa1.id, ...msg });
    }
    console.log(`   ✅ Added ${messages.length} messages\n`);
  }

  // WhatsApp 2: Appointment Reminder Response
  console.log('📱 WHATSAPP #2: Appointment Reminder');
  const { data: wa2, error: waErr2 } = await supabase
    .from('conversations')
    .insert({
      channel: 'whatsapp',
      patient_ref: 'patient-TEST-WA002',
      status: 'open',
      intent: 'appointment',
      ai_confidence: 0.89
    })
    .select()
    .single();

  if (!waErr2 && wa2) {
    console.log(`   ✅ Created: ${wa2.id}`);
    const messages = [
      { from_type: 'ai', body: 'Hi! This is a reminder for your appointment tomorrow at 10:30 AM with Dr. Smith. Reply CONFIRM to confirm or RESCHEDULE if you need to change.' },
      { from_type: 'patient', body: 'CONFIRM' },
      { from_type: 'ai', body: 'Great! Your appointment is confirmed for tomorrow at 10:30 AM. Please arrive 15 minutes early for check-in. See you then!' },
      { from_type: 'patient', body: 'Perfect, thank you!' }
    ];
    for (const msg of messages) {
      await supabase.from('messages').insert({ conversation_id: wa2.id, ...msg });
    }
    console.log(`   ✅ Added ${messages.length} messages\n`);
  }

  // WhatsApp 3: Urgent Care Question
  console.log('📱 WHATSAPP #3: Urgent Care Question');
  const { data: wa3, error: waErr3 } = await supabase
    .from('conversations')
    .insert({
      channel: 'whatsapp',
      patient_ref: 'patient-TEST-WA003',
      status: 'taken_over',
      intent: 'general',
      ai_confidence: 0.75,
      taken_over_at: new Date().toISOString()
    })
    .select()
    .single();

  if (!waErr3 && wa3) {
    console.log(`   ✅ Created: ${wa3.id}`);
    const messages = [
      { from_type: 'patient', body: 'I have a fever of 102°F and severe sore throat for 3 days' },
      { from_type: 'ai', body: 'I understand you\'re not feeling well. Let me connect you with our triage nurse right away to assess your symptoms.' },
      { from_type: 'staff', body: 'Hello, this is Nurse Johnson. I\'m sorry you\'re feeling unwell. Based on your symptoms, I recommend you come to our urgent care clinic today. Can you come in within the next 2 hours?' },
      { from_type: 'patient', body: 'Yes, I can come now' },
      { from_type: 'staff', body: 'Perfect. I\'ve reserved a slot for you. Bring your insurance card and arrive at our urgent care entrance. We\'ll see you soon!' }
    ];
    for (const msg of messages) {
      await supabase.from('messages').insert({ conversation_id: wa3.id, ...msg });
    }
    console.log(`   ✅ Added ${messages.length} messages\n`);
  }

  // ========================================
  // VOICE CONVERSATIONS
  // ========================================

  // Voice 1: Follow-up Appointment
  console.log('📞 VOICE #1: Follow-up After Lab Work');
  const { data: voice1, error: voiceErr1 } = await supabase
    .from('conversations')
    .insert({
      channel: 'voice',
      patient_ref: 'patient-TEST-VOICE001',
      status: 'open',
      intent: 'appointment',
      ai_confidence: 0.92
    })
    .select()
    .single();

  if (!voiceErr1 && voice1) {
    console.log(`   ✅ Created: ${voice1.id}`);
    const messages = [
      { from_type: 'patient', body: 'I need a follow-up appointment after my recent lab work' },
      { from_type: 'ai', body: 'I understand you need a follow-up for your lab results. When would you like to come in?' },
      { from_type: 'patient', body: 'As soon as possible please' },
      { from_type: 'ai', body: 'I have an opening tomorrow at 10:30 AM. Would that work for you?' },
      { from_type: 'patient', body: 'Yes, perfect. Thank you!' },
      { from_type: 'ai', body: 'You\'re all set for tomorrow at 10:30 AM. The doctor will review your lab results with you then. Have a great day!' }
    ];
    for (const msg of messages) {
      await supabase.from('messages').insert({ conversation_id: voice1.id, ...msg });
    }
    console.log(`   ✅ Added ${messages.length} messages\n`);
  }

  // Voice 2: Billing Question
  console.log('📞 VOICE #2: Billing Inquiry');
  const { data: voice2, error: voiceErr2 } = await supabase
    .from('conversations')
    .insert({
      channel: 'voice',
      patient_ref: 'patient-TEST-VOICE002',
      status: 'taken_over',
      intent: 'general',
      ai_confidence: 0.85,
      taken_over_at: new Date().toISOString()
    })
    .select()
    .single();

  if (!voiceErr2 && voice2) {
    console.log(`   ✅ Created: ${voice2.id}`);
    const messages = [
      { from_type: 'patient', body: 'I have a question about my recent bill' },
      { from_type: 'ai', body: 'I understand you have a billing question. Let me connect you with our billing specialist who can help you.' },
      { from_type: 'staff', body: 'Hello, I\'m Sarah from billing. How can I help you today?' },
      { from_type: 'patient', body: 'I received a bill for $250 but I thought my insurance covered everything' },
      { from_type: 'staff', body: 'Let me look into that for you. Can you provide your account number or date of service?' },
      { from_type: 'patient', body: 'The service was on October 15th' },
      { from_type: 'staff', body: 'I see the charge. It looks like there\'s a $250 deductible on your plan. However, I\'ll submit a review to make sure everything was billed correctly. You should hear back within 3-5 business days.' },
      { from_type: 'patient', body: 'Thank you so much for your help!' },
      { from_type: 'staff', body: 'You\'re welcome! We\'ll be in touch soon. Have a great day!' }
    ];
    for (const msg of messages) {
      await supabase.from('messages').insert({ conversation_id: voice2.id, ...msg });
    }
    console.log(`   ✅ Added ${messages.length} messages\n`);
  }

  // Voice 3: New Patient Registration
  console.log('📞 VOICE #3: New Patient Registration');
  const { data: voice3, error: voiceErr3 } = await supabase
    .from('conversations')
    .insert({
      channel: 'voice',
      patient_ref: 'patient-TEST-VOICE003',
      status: 'open',
      intent: 'appointment',
      ai_confidence: 0.94
    })
    .select()
    .single();

  if (!voiceErr3 && voice3) {
    console.log(`   ✅ Created: ${voice3.id}`);
    const messages = [
      { from_type: 'patient', body: 'Hi, I\'m a new patient and would like to schedule my first appointment' },
      { from_type: 'ai', body: 'Welcome! We\'re happy to have you as a new patient. I can help you schedule your first appointment. What type of visit do you need?' },
      { from_type: 'patient', body: 'Just a general physical exam' },
      { from_type: 'ai', body: 'Perfect. For new patients, we recommend scheduling a comprehensive physical. I have availability next week on Wednesday at 2:00 PM or Thursday at 9:00 AM. Which works better for you?' },
      { from_type: 'patient', body: 'Thursday at 9 AM works great' },
      { from_type: 'ai', body: 'Excellent! You\'re scheduled for Thursday at 9:00 AM. We\'ll send you new patient forms via email to fill out before your visit. Is there anything else I can help you with?' },
      { from_type: 'patient', body: 'No, that\'s all. Thank you!' },
      { from_type: 'ai', body: 'You\'re welcome! We look forward to seeing you on Thursday. Have a wonderful day!' }
    ];
    for (const msg of messages) {
      await supabase.from('messages').insert({ conversation_id: voice3.id, ...msg });
    }
    console.log(`   ✅ Added ${messages.length} messages\n`);
  }

  // Verify all conversations
  console.log('🔍 Verifying all test conversations...\n');
  const { data: allConvs } = await supabase
    .from('conversations')
    .select('id, channel, patient_ref')
    .like('patient_ref', 'patient-TEST%')
    .order('channel');

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║  📊 VERIFICATION RESULTS                  ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  const channelCounts = { webchat: 0, whatsapp: 0, voice: 0 };
  let totalMessages = 0;

  for (const conv of allConvs) {
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conv.id);

    const msgCount = messages?.length || 0;
    totalMessages += msgCount;
    channelCounts[conv.channel]++;

    const icon = conv.channel === 'webchat' ? '💬' : conv.channel === 'whatsapp' ? '📱' : '📞';
    console.log(`   ${icon} ${conv.channel.toUpperCase().padEnd(10)} | ${conv.patient_ref.padEnd(25)} | ${msgCount} messages`);
  }

  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║  ✅ TEST DATA CREATED SUCCESSFULLY!       ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  console.log('📊 Summary:');
  console.log(`   💬 WebChat conversations: ${channelCounts.webchat}`);
  console.log(`   📱 WhatsApp conversations: ${channelCounts.whatsapp}`);
  console.log(`   📞 Voice conversations: ${channelCounts.voice}`);
  console.log(`   💬 Total conversations: ${allConvs.length}`);
  console.log(`   ✉️  Total messages: ${totalMessages}`);
  console.log('   ✅ All data is HIPAA-compliant (fictional)');
  console.log('\n🔍 Refresh your dashboard to see all conversations across all channels!');
}

createAllChannelsTestData().catch(console.error);
