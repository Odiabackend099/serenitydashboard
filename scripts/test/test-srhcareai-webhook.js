#!/usr/bin/env node

/**
 * Test script for SRHCareAI n8n webhook
 * Usage: node test-srhcareai-webhook.js
 */

const WEBHOOK_URL = 'https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook';

async function testWebhook() {
  console.log('🧪 Testing SRHCareAI Webhook...\n');
  console.log(`📍 URL: ${WEBHOOK_URL}\n`);

  const testPayload = {
    conversationId: `test-${Date.now()}`,
    patientRef: 'patient-001',
    channel: 'web',
    messages: [
      { role: 'user', content: 'Hello, I need help with an appointment' },
      { role: 'assistant', content: 'I can help you schedule an appointment. What date works for you?' }
    ],
    intent: 'appointment',
    sentiment: 'neutral',
    timestamp: new Date().toISOString()
  };

  console.log('📤 Sending payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`📥 Response Status: ${status} ${statusText}\n`);

    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    console.log('📥 Response Body:');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('\n');

    if (status === 200 || status === 201) {
      console.log('✅ SUCCESS: Webhook triggered successfully!\n');
      return true;
    } else {
      console.log('❌ FAILED: Webhook returned error status\n');
      
      if (responseData.message) {
        console.log(`⚠️  Error Message: ${responseData.message}\n`);
        if (responseData.message.includes('Unused Respond to Webhook')) {
          console.log('💡 Fix: The n8n workflow has an unused "Respond to Webhook" node.');
          console.log('   Make sure the Respond to Webhook node is properly connected in your workflow.\n');
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n');
    return false;
  }
}

// Run test
testWebhook().then(success => {
  process.exit(success ? 0 : 1);
});

