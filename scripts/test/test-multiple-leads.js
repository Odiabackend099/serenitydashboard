// Generate Multiple Test Leads for n8n Workflow Testing

const testLeads = [
  {
    conversationId: '550e8400-e29b-41d4-a716-446655440001',
    patientRef: 'patient-001',
    channel: 'webchat',
    messages: [
      { role: 'user', content: 'Hello, I need to schedule an appointment' },
      { role: 'assistant', content: 'Hi! I can help you schedule an appointment.' },
      { role: 'user', content: 'I need to see a doctor for my back pain.' }
    ],
    intent: 'appointment',
    sentiment: 'neutral',
    keywords: ['appointment', 'doctor', 'pain']
  },
  {
    conversationId: '550e8400-e29b-41d4-a716-446655440002',
    patientRef: 'patient-002',
    channel: 'webchat',
    messages: [
      { role: 'user', content: 'I am very frustrated with the wait time' },
      { role: 'assistant', content: 'I apologize for the inconvenience.' },
      { role: 'user', content: 'This is terrible service!' }
    ],
    intent: 'complaint',
    sentiment: 'negative',
    keywords: ['frustrated', 'wait', 'terrible']
  },
  {
    conversationId: '550e8400-e29b-41d4-a716-446655440003',
    patientRef: 'patient-003',
    channel: 'webchat',
    messages: [
      { role: 'user', content: 'Emergency! I need help urgently' },
      { role: 'assistant', content: 'I understand this is urgent. Let me help you.' },
      { role: 'user', content: 'I have severe chest pain' }
    ],
    intent: 'emergency',
    sentiment: 'urgent',
    keywords: ['emergency', 'urgent', 'pain', 'chest']
  },
  {
    conversationId: '550e8400-e29b-41d4-a716-446655440004',
    patientRef: 'patient-004',
    channel: 'whatsapp',
    messages: [
      { role: 'user', content: 'I need to refill my prescription' },
      { role: 'assistant', content: 'I can help with prescription refills.' },
      { role: 'user', content: 'It is for my blood pressure medication' }
    ],
    intent: 'prescription',
    sentiment: 'neutral',
    keywords: ['prescription', 'refill', 'medication']
  },
  {
    conversationId: '550e8400-e29b-41d4-a716-446655440005',
    patientRef: 'patient-005',
    channel: 'webchat',
    messages: [
      { role: 'user', content: 'Can I get my test results?' },
      { role: 'assistant', content: 'I can help you access your test results.' },
      { role: 'user', content: 'Thank you, this is very helpful!' }
    ],
    intent: 'inquiry',
    sentiment: 'positive',
    keywords: ['test', 'results']
  }
];

console.log('🚀 Testing n8n Lead Capture with Multiple Leads...\n');

let successCount = 0;
let failCount = 0;

async function sendLead(lead, index) {
  try {
    console.log(`\n📤 Sending Lead ${index + 1}/${testLeads.length}...`);
    console.log(`   Patient: ${lead.patientRef}`);
    console.log(`   Intent: ${lead.intent}`);
    console.log(`   Sentiment: ${lead.sentiment}`);
    console.log(`   Channel: ${lead.channel}`);

    const response = await fetch('http://localhost:5678/webhook/lead-capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.WEBHOOK_SECRET || 'your-webhook-secret-here'
      },
      body: JSON.stringify(lead)
    });

    if (response.ok) {
      console.log(`   ✅ Status: ${response.status} - Lead captured!`);
      successCount++;

      // Try to parse response, but don't fail if empty
      try {
        const data = await response.text();
        if (data) {
          const json = JSON.parse(data);
          console.log(`   📊 Response:`, json);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    } else {
      console.log(`   ❌ Status: ${response.status} - Failed`);
      failCount++;
    }

    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failCount++;
  }
}

async function runTests() {
  for (let i = 0; i < testLeads.length; i++) {
    await sendLead(testLeads[i], i);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successCount}/${testLeads.length}`);
  console.log(`❌ Failed: ${failCount}/${testLeads.length}`);
  console.log('\n📋 Next Steps:');
  console.log('1. Check n8n executions: http://localhost:5678/executions');
  console.log('2. View leads in Supabase:');
  console.log('   SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;');
  console.log('3. Check analytics dashboard: http://localhost:5174/analytics');
  console.log('\n✨ Your workflow is working!\n');
}

runTests().catch(console.error);
