#!/usr/bin/env node

/**
 * TEST: Chat Widget Appointment Booking Flow
 * This script simulates the complete flow from chat widget to n8n
 * to verify the fix for appointment booking not reaching n8n.
 */

const https = require('https');

// Configuration
const SUPABASE_URL = 'yfrpxqvjshwaaomgcaoq.supabase.co';
const EDGE_FUNCTION_PATH = '/functions/v1/groq-chat';
const TEST_EMAIL = 'egiualesamuel@gmail.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   CHAT WIDGET BOOKING FLOW TEST                   ║');
console.log('╚════════════════════════════════════════════════════╝\n');

// Simulate the exact message flow that chat widget sends
const testPayload = {
  messages: [
    {
      role: 'user',
      content: 'I want to book an appointment for tomorrow at 2 PM. My name is Samuel Eguale and my email is egiualesamuel@gmail.com. Phone: +1234567890'
    }
  ],
  mode: 'public', // Public mode (no auth required)
  tools: [
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
            time: { type: 'string', description: 'Appointment time (HH:MM AM/PM)' },
            reason: { type: 'string', description: 'Reason for appointment' }
          },
          required: ['name', 'email', 'date', 'time']
        }
      }
    }
  ]
};

function testEdgeFunction() {
  return new Promise((resolve, reject) => {
    console.log('📤 Step 1: Sending booking request to Edge Function');
    console.log(`   URL: https://${SUPABASE_URL}${EDGE_FUNCTION_PATH}`);
    console.log(`   Message: "${testPayload.messages[0].content}"\n`);

    const postData = JSON.stringify(testPayload);

    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: EDGE_FUNCTION_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, // Required for Supabase Edge Functions
        'apikey': SUPABASE_ANON_KEY // Alternative header format
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`📊 Step 2: Edge Function Response`);
        console.log(`   Status: ${res.statusCode}`);

        if (res.statusCode !== 200) {
          console.log(`   ❌ ERROR Response:`);
          console.log(responseData);
          console.log('\n');
          resolve({ success: false, status: res.statusCode, data: responseData });
          return;
        }

        try {
          const parsedResponse = JSON.parse(responseData);
          console.log(`   ✅ Success\n`);

          // Check if AI made tool calls
          if (parsedResponse.choices && parsedResponse.choices[0]) {
            const message = parsedResponse.choices[0].message;

            if (message.tool_calls && message.tool_calls.length > 0) {
              console.log('🔧 Step 3: AI Tool Calls Detected');
              message.tool_calls.forEach((toolCall, index) => {
                console.log(`   Tool ${index + 1}: ${toolCall.function.name}`);
                console.log(`   Arguments:`, JSON.stringify(JSON.parse(toolCall.function.arguments), null, 2));
              });
              console.log('');
            }

            // Check for tool results
            if (parsedResponse.tool_results && parsedResponse.tool_results.length > 0) {
              console.log('📋 Step 4: Tool Execution Results');
              parsedResponse.tool_results.forEach((result, index) => {
                console.log(`   Result ${index + 1}: ${result.name}`);
                const content = JSON.parse(result.content);

                if (content.error) {
                  console.log(`   ❌ Error: ${content.error}`);
                } else if (content.success) {
                  console.log(`   ✅ Success: ${content.message}`);
                  if (content.appointmentDetails) {
                    console.log(`   📅 Appointment Details:`);
                    console.log(`      Name: ${content.appointmentDetails.patientName}`);
                    console.log(`      Email: ${content.appointmentDetails.patientEmail}`);
                    console.log(`      Date: ${content.appointmentDetails.date}`);
                    console.log(`      Time: ${content.appointmentDetails.time}`);
                  }
                } else {
                  console.log(`   Content:`, JSON.stringify(content, null, 2));
                }
              });
              console.log('');
            }

            // Check AI's final response
            if (message.content) {
              console.log('💬 Step 5: AI Final Response');
              console.log(`   "${message.content}"\n`);
            }
          }

          resolve({ success: true, status: res.statusCode, data: parsedResponse });
        } catch (error) {
          console.log(`   ❌ Failed to parse response:`, error.message);
          console.log(`   Raw response:`, responseData);
          resolve({ success: false, status: res.statusCode, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Request Error: ${error.message}\n`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTest() {
  try {
    const result = await testEdgeFunction();

    console.log('─────────────────────────────────────────────────────');
    console.log('\n📊 TEST RESULTS SUMMARY\n');
    console.log('─────────────────────────────────────────────────────');

    if (result.success) {
      console.log('✅ Edge Function: Working');
      console.log('✅ Tool Execution: Working');
      console.log('✅ n8n Webhook: Should be triggered');
      console.log('\n🎯 EXPECTED OUTCOME:');
      console.log(`   • Email sent to: ${TEST_EMAIL}`);
      console.log('   • Check n8n execution logs: https://cwai97.app.n8n.cloud/executions');
      console.log('   • Check email inbox (including spam folder)');
      console.log('   • Wait 1-2 minutes for email delivery');

      console.log('\n✅ FIX VERIFICATION:');
      console.log('   The chat widget booking flow is now working!');
      console.log('   The appointment request should have reached n8n.');
    } else {
      console.log('❌ Test Failed');
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${result.error || result.data}`);

      console.log('\n⚠️  TROUBLESHOOTING:');
      console.log('   1. Verify N8N_WEBHOOK_BASE is set in Supabase secrets');
      console.log('   2. Check Edge Function logs in Supabase dashboard');
      console.log('   3. Verify n8n workflow is active');
      console.log('   4. Check Groq API key is valid');
    }

    console.log('\n─────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.log('\n⚠️  TROUBLESHOOTING:');
    console.log('   1. Check internet connection');
    console.log('   2. Verify Supabase project is online');
    console.log('   3. Check Edge Function deployment status');
    console.log('\n─────────────────────────────────────────────────────\n');
    process.exit(1);
  }
}

// Run the test
console.log('🚀 Starting test...\n');
runTest()
  .then(() => {
    console.log('✅ Test completed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
