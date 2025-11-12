#!/usr/bin/env node

/**
 * Detailed webhook test with error message capture
 */

const WEBHOOK_URL = 'https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook';

const testCases = [
  {
    name: 'General Inquiry',
    payload: {
      conversationId: `test-general-${Date.now()}`,
      patientRef: 'patient-001',
      channel: 'web',
      message: 'Hello, I would like to know your operating hours',
      intent: 'general'
    }
  },
  {
    name: 'Appointment Booking',
    payload: {
      conversationId: `test-appointment-${Date.now()}`,
      patientRef: 'patient-002',
      channel: 'web',
      message: 'I need to book an appointment with a doctor',
      intent: 'appointment',
      patientEmail: 'test@example.com',
      patientName: 'Test Patient',
      patientPhone: '+234800000000',
      appointmentDate: '2025-11-20',
      appointmentTime: '14:00',
      appointmentReason: 'General checkup'
    }
  },
  {
    name: 'Emergency Alert',
    payload: {
      conversationId: `test-emergency-${Date.now()}`,
      patientRef: 'patient-003',
      channel: 'voice',
      message: 'Emergency! Patient has severe chest pain and difficulty breathing',
      intent: 'emergency',
      patientName: 'Emergency Test Patient'
    }
  }
];

async function testWebhook(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCase.payload)
    });

    const status = response.status;
    const statusText = response.statusText;
    
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = { text: await response.text() };
    }

    console.log(`📥 Status: ${status} ${statusText}`);
    console.log(`📥 Response:`);
    console.log(JSON.stringify(responseData, null, 2));

    const success = status >= 200 && status < 300;
    return { success, status, data: responseData, name: testCase.name };
  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    return { success: false, error: error.message, name: testCase.name };
  }
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('SRHCareAI Webhook - Detailed Test');
  console.log('='.repeat(60));
  console.log(`📍 URL: ${WEBHOOK_URL}\n`);

  const results = [];

  for (const testCase of testCases) {
    const result = await testWebhook(testCase);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between tests
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${result.name}: ${result.status || 'ERROR'}`);
    if (result.data && result.data.message) {
      console.log(`   Message: ${result.data.message}`);
    }
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n✅ Passed: ${successCount}/${results.length}`);
  console.log(`❌ Failed: ${results.length - successCount}/${results.length}`);

  return results;
}

runAllTests().then(results => {
  const allPassed = results.every(r => r.success);
  process.exit(allPassed ? 0 : 1);
});

