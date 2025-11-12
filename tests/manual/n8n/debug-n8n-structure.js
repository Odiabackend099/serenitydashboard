#!/usr/bin/env node

const https = require('https');

// Test what n8n ACTUALLY receives and which structure routes correctly
const testCases = [
  {
    name: 'Test 1: Action at root only',
    payload: {
      action: 'book_appointment',
      patient_ref: 'egualesamuel@gmail.com',
      patient_name: 'Test 1',
      patient_email: 'egualesamuel@gmail.com',
      appointment_date: '2025-11-13',
      appointment_time: '2:00 PM'
    }
  },
  {
    name: 'Test 2: Action in body only',
    payload: {
      body: {
        action: 'book_appointment',
        patient_ref: 'egualesamuel@gmail.com',
        patient_name: 'Test 2',
        patient_email: 'egualesamuel@gmail.com',
        appointment_date: '2025-11-13',
        appointment_time: '3:00 PM'
      }
    }
  },
  {
    name: 'Test 3: Action at BOTH levels (current approach)',
    payload: {
      action: 'book_appointment',
      body: {
        action: 'book_appointment',
        patient_ref: 'egualesamuel@gmail.com',
        patient_name: 'Test 3',
        patient_email: 'egualesamuel@gmail.com',
        appointment_date: '2025-11-13',
        appointment_time: '4:00 PM'
      }
    }
  },
  {
    name: 'Test 4: All fields at root (no nesting)',
    payload: {
      action: 'book_appointment',
      channel: 'webchat',
      patient_ref: 'egualesamuel@gmail.com',
      patient_name: 'Test 4',
      patient_email: 'egualesamuel@gmail.com',
      patient_phone: '+1234567890',
      appointment_date: '2025-11-13',
      appointment_time: '5:00 PM',
      reason: 'Test 4'
    }
  }
];

function testWebhook(testCase) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(testCase.payload);

    const options = {
      hostname: 'cwai97.app.n8n.cloud',
      port: 443,
      path: '/webhook/serenity-webhook-v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🧪 ${testCase.name}`);
    console.log(`   Sending...`);

    const req = https.request(options, (res) => {
      console.log(`   ✅ Status: ${res.statusCode}`);

      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (responseData) {
          console.log(`   Response: ${responseData.substring(0, 100)}`);
        } else {
          console.log(`   Response: (empty - normal for n8n)`);
        }
        resolve(res.statusCode);
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  N8N PAYLOAD STRUCTURE DEBUG TEST                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\nTesting 4 different payload structures to find which one');
  console.log('successfully routes through the "Route by Action" node.\n');
  console.log('──────────────────────────────────────────────────────────');

  for (const testCase of testCases) {
    await testWebhook(testCase);
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n──────────────────────────────────────────────────────────');
  console.log('\n📊 ALL TESTS SENT!');
  console.log('\n🔍 NOW CHECK N8N EXECUTIONS:');
  console.log('   👉 https://cwai97.app.n8n.cloud/executions');
  console.log('\n Look for 4 new executions and check which one(s):');
  console.log('   ✅ Routes PAST "Route by Action"');
  console.log('   ✅ Executes "Create Appointment"');
  console.log('   ✅ Executes "Send Appointment Email"');
  console.log('\n The test that works will show the correct payload structure.');
  console.log('\n──────────────────────────────────────────────────────────\n');
}

runTests();
