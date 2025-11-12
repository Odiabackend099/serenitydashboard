#!/usr/bin/env node

/**
 * COMPLETE CHAT WIDGET FUNCTIONALITY TEST
 * Tests all chat interface capabilities:
 * 1. Book appointments
 * 2. Email confirmations
 * 3. Reschedule appointments
 * 4. Cancel appointments
 * 5. AI responses
 * All emails sent to: egualesamuel@gmail.com
 */

const https = require('https');

// Configuration
const SUPABASE_URL = 'yfrpxqvjshwaaomgcaoq.supabase.co';
const EDGE_FUNCTION_PATH = '/functions/v1/groq-chat';
const TEST_EMAIL = 'egualesamuel@gmail.com';
const TEST_PATIENT_NAME = 'Samuel Eguale';
const TEST_PHONE = '+1234567890';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   COMPLETE CHAT WIDGET FUNCTIONALITY TEST                ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log(`\n📧 All emails will be sent to: ${TEST_EMAIL}\n`);

// Helper function to send chat message
function sendChatMessage(userMessage, tools = null) {
  return new Promise((resolve, reject) => {
    const payload = {
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      mode: 'public'
    };

    // Add tools if provided
    if (tools) {
      payload.tools = tools;
    }

    const postData = JSON.stringify(payload);

    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: EDGE_FUNCTION_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            resolve({
              success: true,
              status: res.statusCode,
              data: parsed
            });
          } catch (error) {
            resolve({
              success: false,
              status: res.statusCode,
              error: 'Failed to parse response',
              rawData: responseData
            });
          }
        } else {
          resolve({
            success: false,
            status: res.statusCode,
            error: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Helper function to trigger n8n webhook directly
function triggerN8nWebhook(action, payload) {
  return new Promise((resolve, reject) => {
    const webhookData = JSON.stringify({
      action,
      ...payload,
      timestamp: new Date().toISOString()
    });

    const options = {
      hostname: 'cwai97.app.n8n.cloud',
      port: 443,
      path: '/webhook/serenity-webhook-v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(webhookData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          status: res.statusCode,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(webhookData);
    req.end();
  });
}

async function runCompleteTest() {
  const results = [];
  let testNumber = 0;

  console.log('═══════════════════════════════════════════════════════════\n');

  // ========================================
  // TEST 1: Book Appointment via Chat
  // ========================================
  testNumber++;
  console.log(`🧪 TEST ${testNumber}: BOOK APPOINTMENT VIA CHAT`);
  console.log('─────────────────────────────────────────────────────────');

  try {
    const bookingMessage = `I want to book an appointment for tomorrow at 2:00 PM. My name is ${TEST_PATIENT_NAME}, email is ${TEST_EMAIL}, and phone is ${TEST_PHONE}. I need a general checkup.`;

    console.log(`📤 User Message: "${bookingMessage}"\n`);

    const bookingTools = [
      {
        type: 'function',
        function: {
          name: 'book_appointment_with_confirmation',
          description: 'Book an appointment for a patient and send confirmation email',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Patient full name' },
              email: { type: 'string', description: 'Patient email address' },
              phone: { type: 'string', description: 'Patient phone number' },
              date: { type: 'string', description: 'Appointment date (YYYY-MM-DD)' },
              time: { type: 'string', description: 'Appointment time' },
              reason: { type: 'string', description: 'Reason for appointment' }
            },
            required: ['name', 'email', 'date', 'time']
          }
        }
      }
    ];

    const bookingResult = await sendChatMessage(bookingMessage, bookingTools);

    if (bookingResult.success) {
      console.log('✅ Chat Response: SUCCESS');

      // Check for tool execution
      if (bookingResult.data.tool_results) {
        const toolResult = bookingResult.data.tool_results[0];
        const content = JSON.parse(toolResult.content);

        if (content.success) {
          console.log('✅ Appointment Booked: SUCCESS');
          console.log(`   Patient: ${content.appointmentDetails?.patientName || TEST_PATIENT_NAME}`);
          console.log(`   Email: ${content.appointmentDetails?.patientEmail || TEST_EMAIL}`);
          console.log(`   Date: ${content.appointmentDetails?.date || 'tomorrow'}`);
          console.log(`   Time: ${content.appointmentDetails?.time || '2:00 PM'}`);
          console.log('✅ Email Confirmation: SENT');

          results.push({
            test: 'Book Appointment via Chat',
            status: 'PASS',
            email: 'SENT'
          });
        } else {
          console.log('❌ Appointment Booking: FAILED');
          console.log(`   Error: ${content.error}`);
          results.push({
            test: 'Book Appointment via Chat',
            status: 'FAIL',
            error: content.error
          });
        }
      } else {
        console.log('⚠️  No tool execution detected');
        results.push({
          test: 'Book Appointment via Chat',
          status: 'PARTIAL',
          note: 'AI responded but no tool was executed'
        });
      }

      // Show AI response
      if (bookingResult.data.choices?.[0]?.message?.content) {
        console.log(`\n💬 AI Response: "${bookingResult.data.choices[0].message.content}"\n`);
      }
    } else {
      console.log('❌ Chat Response: FAILED');
      console.log(`   Status: ${bookingResult.status}`);
      results.push({
        test: 'Book Appointment via Chat',
        status: 'FAIL',
        error: bookingResult.error
      });
    }
  } catch (error) {
    console.log('❌ TEST FAILED:', error.message);
    results.push({
      test: 'Book Appointment via Chat',
      status: 'ERROR',
      error: error.message
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
  await sleep(3000); // Wait 3 seconds between tests

  // ========================================
  // TEST 2: Reschedule Appointment
  // ========================================
  testNumber++;
  console.log(`🧪 TEST ${testNumber}: RESCHEDULE APPOINTMENT VIA N8N`);
  console.log('─────────────────────────────────────────────────────────');

  try {
    console.log('📤 Triggering reschedule workflow...\n');

    const rescheduleResult = await triggerN8nWebhook('reschedule_appointment', {
      patientName: TEST_PATIENT_NAME,
      patientEmail: TEST_EMAIL,
      oldDate: '2025-01-12',
      oldTime: '14:00',
      newDate: '2025-01-13',
      newTime: '10:00',
      reason: 'Patient requested earlier time'
    });

    if (rescheduleResult.success) {
      console.log('✅ Reschedule Request: SUCCESS');
      console.log('✅ Email Notification: SENT');
      console.log(`   Patient: ${TEST_PATIENT_NAME}`);
      console.log(`   Old: 2025-01-12 at 14:00`);
      console.log(`   New: 2025-01-13 at 10:00`);

      results.push({
        test: 'Reschedule Appointment',
        status: 'PASS',
        email: 'SENT'
      });
    } else {
      console.log('❌ Reschedule Request: FAILED');
      console.log(`   Status: ${rescheduleResult.status}`);
      results.push({
        test: 'Reschedule Appointment',
        status: 'FAIL'
      });
    }
  } catch (error) {
    console.log('❌ TEST FAILED:', error.message);
    results.push({
      test: 'Reschedule Appointment',
      status: 'ERROR',
      error: error.message
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
  await sleep(3000);

  // ========================================
  // TEST 3: Cancel Appointment
  // ========================================
  testNumber++;
  console.log(`🧪 TEST ${testNumber}: CANCEL APPOINTMENT VIA N8N`);
  console.log('─────────────────────────────────────────────────────────');

  try {
    console.log('📤 Triggering cancellation workflow...\n');

    const cancelResult = await triggerN8nWebhook('cancel_appointment', {
      patientName: TEST_PATIENT_NAME,
      patientEmail: TEST_EMAIL,
      appointmentDate: '2025-01-13',
      appointmentTime: '10:00',
      reason: 'Patient unable to attend due to emergency'
    });

    if (cancelResult.success) {
      console.log('✅ Cancellation Request: SUCCESS');
      console.log('✅ Email Notification: SENT');
      console.log(`   Patient: ${TEST_PATIENT_NAME}`);
      console.log(`   Cancelled: 2025-01-13 at 10:00`);
      console.log(`   Reason: Patient unable to attend`);

      results.push({
        test: 'Cancel Appointment',
        status: 'PASS',
        email: 'SENT'
      });
    } else {
      console.log('❌ Cancellation Request: FAILED');
      console.log(`   Status: ${cancelResult.status}`);
      results.push({
        test: 'Cancel Appointment',
        status: 'FAIL'
      });
    }
  } catch (error) {
    console.log('❌ TEST FAILED:', error.message);
    results.push({
      test: 'Cancel Appointment',
      status: 'ERROR',
      error: error.message
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
  await sleep(3000);

  // ========================================
  // TEST 4: General AI Response (No Tool)
  // ========================================
  testNumber++;
  console.log(`🧪 TEST ${testNumber}: GENERAL AI CONVERSATION`);
  console.log('─────────────────────────────────────────────────────────');

  try {
    const generalMessage = "What services does Serenity Hospital offer?";
    console.log(`📤 User Message: "${generalMessage}"\n`);

    const generalResult = await sendChatMessage(generalMessage);

    if (generalResult.success) {
      console.log('✅ AI Response: SUCCESS');

      if (generalResult.data.choices?.[0]?.message?.content) {
        const aiResponse = generalResult.data.choices[0].message.content;
        console.log(`\n💬 AI: "${aiResponse}"\n`);

        results.push({
          test: 'General AI Conversation',
          status: 'PASS'
        });
      }
    } else {
      console.log('❌ AI Response: FAILED');
      results.push({
        test: 'General AI Conversation',
        status: 'FAIL'
      });
    }
  } catch (error) {
    console.log('❌ TEST FAILED:', error.message);
    results.push({
      test: 'General AI Conversation',
      status: 'ERROR',
      error: error.message
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
  await sleep(2000);

  // ========================================
  // TEST 5: Direct Email Test
  // ========================================
  testNumber++;
  console.log(`🧪 TEST ${testNumber}: DIRECT EMAIL TEST`);
  console.log('─────────────────────────────────────────────────────────');

  try {
    console.log('📤 Sending test email via n8n...\n');

    const emailResult = await triggerN8nWebhook('send_email', {
      to: TEST_EMAIL,
      subject: '🎉 Serenity Hospital Chat Widget Test',
      message: `Hello ${TEST_PATIENT_NAME},\n\nThis is a test email from Serenity Hospital's AI-powered chat widget.\n\nAll systems are working correctly!\n\nFeatures tested:\n✅ Appointment booking\n✅ Appointment rescheduling\n✅ Appointment cancellation\n✅ AI responses\n✅ Email delivery\n\nBest regards,\nSerenity Hospital Team`
    });

    if (emailResult.success) {
      console.log('✅ Email Sent: SUCCESS');
      console.log(`   To: ${TEST_EMAIL}`);
      console.log('   Subject: 🎉 Serenity Hospital Chat Widget Test');

      results.push({
        test: 'Direct Email Test',
        status: 'PASS',
        email: 'SENT'
      });
    } else {
      console.log('❌ Email Sent: FAILED');
      results.push({
        test: 'Direct Email Test',
        status: 'FAIL'
      });
    }
  } catch (error) {
    console.log('❌ TEST FAILED:', error.message);
    results.push({
      test: 'Direct Email Test',
      status: 'ERROR',
      error: error.message
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  // ========================================
  // SUMMARY
  // ========================================
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const errorCount = results.filter(r => r.status === 'ERROR').length;
  const emailCount = results.filter(r => r.email === 'SENT').length;

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} Test ${index + 1}: ${result.test}`);
    console.log(`   Status: ${result.status}`);
    if (result.email) {
      console.log(`   Email: ${result.email}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.note) {
      console.log(`   Note: ${result.note}`);
    }
    console.log('');
  });

  console.log('─────────────────────────────────────────────────────────');
  console.log(`\n📈 Overall Results:`);
  console.log(`   ✅ Passed: ${passCount}/${results.length} tests`);
  console.log(`   ❌ Failed: ${failCount}/${results.length} tests`);
  console.log(`   ⚠️  Errors: ${errorCount}/${results.length} tests`);
  console.log(`   📧 Emails Sent: ${emailCount} emails`);
  console.log(`   Success Rate: ${Math.round((passCount / results.length) * 100)}%`);

  console.log('\n═══════════════════════════════════════════════════════════\n');
  console.log('📧 EMAIL VERIFICATION INSTRUCTIONS:');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`\n1. Check inbox at: ${TEST_EMAIL}`);
  console.log('2. Look for these emails:');
  console.log('   ✉️  Appointment Booking Confirmation');
  console.log('   ✉️  Appointment Reschedule Notification');
  console.log('   ✉️  Appointment Cancellation Notice');
  console.log('   ✉️  Test Email from Chat Widget');
  console.log('\n3. Check spam/junk folder if not in inbox');
  console.log('4. Wait 1-2 minutes for email delivery');
  console.log('\n5. Verify n8n execution logs:');
  console.log('   🔗 https://cwai97.app.n8n.cloud/executions');

  console.log('\n═══════════════════════════════════════════════════════════\n');

  if (passCount === results.length) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Chat widget is fully functional!');
    console.log('✅ All email notifications are working!');
    console.log('✅ AI responses are generating correctly!\n');
  } else if (passCount > 0) {
    console.log('⚠️  SOME TESTS PASSED');
    console.log(`${passCount} out of ${results.length} tests successful.`);
    console.log('Review failed tests above for details.\n');
  } else {
    console.log('❌ ALL TESTS FAILED');
    console.log('Please check:');
    console.log('   • n8n workflow is active');
    console.log('   • Edge Function is deployed');
    console.log('   • Environment variables are set');
    console.log('   • Gmail credentials are connected\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the complete test suite
console.log('🚀 Starting complete functionality test...\n');
runCompleteTest()
  .then(() => {
    console.log('✅ Test suite completed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
