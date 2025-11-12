#!/usr/bin/env node

/**
 * COMPLETE EMAIL SYSTEM TEST
 * Tests all email flows through the n8n webhook
 * Run this to verify the entire email system is working
 */

const https = require('https');

// Configuration
const WEBHOOK_URL = 'cwai97.app.n8n.cloud';
const WEBHOOK_PATH = '/webhook/serenity-webhook-v2';
const TEST_EMAIL = 'egualesamuel@gmail.com';

function makeRequest(data, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 ${description}`);
    console.log('📤 Sending:', JSON.stringify(data, null, 2));
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: WEBHOOK_URL,
      port: 443,
      path: WEBHOOK_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📧 Response: ${responseData}`);
        
        if (res.statusCode === 200) {
          console.log(`✅ SUCCESS: ${description}`);
          resolve({ status: res.statusCode, data: responseData });
        } else {
          console.log(`❌ FAILED: ${description}`);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ERROR: ${description}`);
      console.error('Request Error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runCompleteTest() {
  console.log('🚀 COMPLETE EMAIL SYSTEM TEST');
  console.log('=====================================');
  console.log(`Testing email: ${TEST_EMAIL}`);
  console.log(`Webhook: https://${WEBHOOK_URL}${WEBHOOK_PATH}`);
  console.log('=====================================\n');

  const tests = [
    {
      name: 'Direct Email Test',
      data: {
        action: 'send_email',
        to: TEST_EMAIL,
        subject: 'Test Email from Serenity System',
        message: 'This is a test email from the Serenity Hospital system to verify email delivery is working.'
      }
    },
    {
      name: 'Appointment Booking Test',
      data: {
        action: 'book_appointment_with_confirmation',
        patientName: 'Samuel Eguale',
        patientEmail: TEST_EMAIL,
        patientPhone: '+1234567890',
        appointmentDate: '2024-12-21',
        appointmentTime: '10:00 AM',
        appointmentReason: 'Annual checkup'
      }
    },
    {
      name: 'Appointment Reschedule Test',
      data: {
        action: 'reschedule_appointment',
        patientEmail: TEST_EMAIL,
        oldDate: '2024-12-21',
        oldTime: '10:00 AM',
        newDate: '2024-12-22',
        newTime: '2:30 PM',
        reason: 'Patient requested later time'
      }
    },
    {
      name: 'Appointment Cancellation Test',
      data: {
        action: 'cancel_appointment',
        patientEmail: TEST_EMAIL,
        appointmentDate: '2024-12-22',
        appointmentTime: '2:30 PM',
        reason: 'Patient unable to attend'
      }
    }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      const result = await makeRequest(test.data, test.name);
      results.push({
        test: test.name,
        status: result.status,
        success: result.status === 200
      });
    } catch (error) {
      results.push({
        test: test.name,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    }
    
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n\n📊 TEST RESULTS SUMMARY');
  console.log('=====================================');
  
  let successCount = 0;
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.status}`);
    if (result.success) successCount++;
  });
  
  console.log(`\n📈 Overall: ${successCount}/${results.length} tests passed`);
  
  if (successCount === results.length) {
    console.log('\n🎉 ALL TESTS PASSED! The email system is working correctly.');
    console.log(`\n📧 Please check ${TEST_EMAIL} for all test emails.`);
    console.log('📋 You should receive:');
    console.log('   • Test email');
    console.log('   • Appointment booking confirmation');
    console.log('   • Appointment reschedule confirmation');
    console.log('   • Appointment cancellation confirmation');
  } else {
    console.log('\n⚠️  Some tests failed. Check the n8n workflow status.');
  }
  
  console.log('\n=====================================');
  console.log('🔍 Next Steps:');
  console.log('1. Check your email inbox (including spam folder)');
  console.log('2. Check n8n execution logs at: https://cwai97.app.n8n.cloud/executions');
  console.log('3. Verify Gmail credentials are connected in n8n');
  console.log('4. Check if n8n workflow is active (green toggle)');
}

// Run the test
runCompleteTest().catch(console.error);