#!/usr/bin/env node

/**
 * Simple test for SRHCareAI n8n webhook with minimal payload
 */

const WEBHOOK_URL = 'https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook';

async function testWebhook(payload) {
  console.log('🧪 Testing with payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`📥 Status: ${status} ${statusText}\n`);

    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    console.log('📥 Response:');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('\n');

    return { success: status >= 200 && status < 300, status, data: responseData };
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('SRHCareAI Webhook Test Suite');
  console.log('='.repeat(60));
  console.log(`📍 URL: ${WEBHOOK_URL}\n`);

  // Test 1: Empty payload
  console.log('📋 Test 1: Empty payload');
  console.log('-'.repeat(60));
  await testWebhook({});
  console.log('\n');

  // Test 2: Minimal payload
  console.log('📋 Test 2: Minimal payload');
  console.log('-'.repeat(60));
  await testWebhook({
    test: true
  });
  console.log('\n');

  // Test 3: Full payload
  console.log('📋 Test 3: Full payload');
  console.log('-'.repeat(60));
  await testWebhook({
    conversationId: `test-${Date.now()}`,
    patientRef: 'patient-001',
    channel: 'web',
    messages: [
      { role: 'user', content: 'Hello' }
    ]
  });
  console.log('\n');

  // Test 4: Production webhook (without /webhook-test/)
  console.log('📋 Test 4: Production webhook URL');
  console.log('-'.repeat(60));
  const prodUrl = 'https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook';
  console.log(`📍 URL: ${prodUrl}\n`);
  
  try {
    const response = await fetch(prodUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversationId: `test-${Date.now()}`,
        patientRef: 'patient-001',
        channel: 'web'
      })
    });

    console.log(`📥 Status: ${response.status} ${response.statusText}\n`);
    let data;
    try {
      data = await response.json();
    } catch {
      data = { text: await response.text() };
    }
    console.log('📥 Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

runTests();

