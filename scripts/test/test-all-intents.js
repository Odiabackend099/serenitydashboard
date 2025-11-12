#!/usr/bin/env node

/**
 * Comprehensive test for SRHCareAI n8n webhook - All Intent Paths
 * Tests: Appointment, Emergency, General Inquiry
 */

const WEBHOOK_URL = 'https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook';
const TEST_WEBHOOK_URL = 'https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook';

const testCases = [
  {
    name: 'Appointment Intent',
    intent: 'appointment',
    patientRef: 'patient-001',
    channel: 'web',
    payload: {
      conversationId: `test-appt-${Date.now()}`,
      patientRef: 'patient-001',
      channel: 'web',
      messages: [
        { role: 'user', content: 'I need to book an appointment for next week' },
        { role: 'assistant', content: 'I can help you schedule an appointment. What date works for you?' }
      ],
      intent: 'appointment',
      sentiment: 'neutral',
      timestamp: new Date().toISOString()
    }
  },
  {
    name: 'Emergency Intent',
    intent: 'emergency',
    patientRef: 'patient-002',
    channel: 'voice',
    payload: {
      conversationId: `test-emergency-${Date.now()}`,
      patientRef: 'patient-002',
      channel: 'voice',
      messages: [
        { role: 'user', content: 'I have severe chest pain and need immediate help!' },
        { role: 'assistant', content: 'This sounds urgent. Let me connect you with emergency services.' }
      ],
      intent: 'emergency',
      sentiment: 'negative',
      priority: 'urgent',
      timestamp: new Date().toISOString()
    }
  },
  {
    name: 'General Inquiry Intent',
    intent: 'inquiry',
    patientRef: 'patient-003',
    channel: 'web',
    payload: {
      conversationId: `test-general-${Date.now()}`,
      patientRef: 'patient-003',
      channel: 'web',
      messages: [
        { role: 'user', content: 'What are your visiting hours?' },
        { role: 'assistant', content: 'Our visiting hours are Monday to Friday, 9 AM to 5 PM.' }
      ],
      intent: 'inquiry',
      sentiment: 'neutral',
      timestamp: new Date().toISOString()
    }
  }
];

async function testWebhook(url, payload, testName) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log('─'.repeat(60));
  console.log(`📍 URL: ${url}`);
  console.log(`📤 Intent: ${payload.intent || 'N/A'}`);
  console.log(`👤 Patient: ${payload.patientRef}`);
  console.log(`📱 Channel: ${payload.channel}`);
  console.log('');

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const duration = Date.now() - startTime;
    const status = response.status;
    const statusText = response.statusText;

    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = { text: await response.text() };
    }

    const success = status >= 200 && status < 300;
    const icon = success ? '✅' : '❌';

    console.log(`${icon} Status: ${status} ${statusText}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    if (responseData && Object.keys(responseData).length > 0) {
      console.log('📥 Response:');
      console.log(JSON.stringify(responseData, null, 2));
    }

    return {
      success,
      status,
      duration,
      response: responseData,
      testName,
      intent: payload.intent,
      patientRef: payload.patientRef,
      channel: payload.channel
    };
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return {
      success: false,
      error: error.message,
      testName,
      intent: payload.intent,
      patientRef: payload.patientRef,
      channel: payload.channel
    };
  }
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('SRHCareAI Webhook - Comprehensive Intent Testing');
  console.log('='.repeat(60));
  console.log(`\n📍 Production URL: ${WEBHOOK_URL}`);
  console.log(`📍 Test URL: ${TEST_WEBHOOK_URL}\n`);

  const results = [];

  // Test all intents on production webhook
  console.log('\n🚀 Testing Production Webhook (Active Workflow)');
  console.log('='.repeat(60));

  for (const testCase of testCases) {
    const result = await testWebhook(WEBHOOK_URL, testCase.payload, testCase.name);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('\n| Test | Intent | Patient | Channel | Status |');
  console.log('|------|--------|---------|---------|--------|');

  results.forEach((result, index) => {
    const status = result.success ? '✅ Sent' : `❌ Failed (${result.status || 'Error'})`;
    const testNum = index + 1;
    console.log(`| ${testNum} | ${result.intent || 'N/A'} | ${result.patientRef || 'N/A'} | ${result.channel || 'N/A'} | ${status} |`);
  });

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log('\n' + '─'.repeat(60));
  console.log(`✅ Passed: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);

  if (successCount === totalCount) {
    console.log('\n🎉 All tests passed! Webhook is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
  }

  return results;
}

// Run tests
runAllTests().then(results => {
  const allPassed = results.every(r => r.success);
  process.exit(allPassed ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

