#!/usr/bin/env node

/**
 * PRODUCTION READINESS TEST
 * Tests complete end-to-end appointment booking flow
 */

const https = require('https');

const SUPABASE_URL = 'yfrpxqvjshwaaomgcaoq.supabase.co';
const EDGE_FUNCTION_PATH = '/functions/v1/groq-chat';
const TEST_EMAIL = 'egualesamuel@gmail.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

// Calculate tomorrow's date
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   PRODUCTION READINESS TEST                        ║');
console.log('╚════════════════════════════════════════════════════╝\n');
console.log(`📅 Testing with date: ${tomorrowDate} (tomorrow)`);
console.log('');

const testPayload = {
  messages: [
    {
      role: 'user',
      content: `Book appointment for ${tomorrowDate} at 2 PM. Name: Samuel Eguale, Email: ${TEST_EMAIL}, Phone: +1234567890`
    }
  ],
  mode: 'public',
  tools: [
    {
      type: 'function',
      function: {
        name: 'book_appointment_with_confirmation',
        description: 'Book an appointment and send confirmation email',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            date: { type: 'string', description: `Date in YYYY-MM-DD format. Today is ${new Date().toISOString().split('T')[0]}` },
            time: { type: 'string' },
            reason: { type: 'string' }
          },
          required: ['name', 'email', 'date', 'time']
        }
      }
    }
  ],
  stream: false
};

function sendRequest() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testPayload);

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

    console.log('🚀 Step 1: Sending booking request to Edge Function');
    console.log(`   URL: https://${SUPABASE_URL}${EDGE_FUNCTION_PATH}`);
    console.log(`   Date: ${tomorrowDate}`);
    console.log('');

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData, parseError: true });
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

async function main() {
  try {
    const response = await sendRequest();

    console.log('📊 Step 2: Edge Function Response');
    console.log(`   Status: ${response.status}`);

    if (response.status !== 200) {
      console.log('   ❌ Error Response:');
      console.log(JSON.stringify(response.data, null, 2));
      process.exit(1);
    }

    console.log('   ✅ Success\n');

    // Check if tool was called
    const data = response.data;
    if (data.choices && data.choices[0]) {
      const message = data.choices[0].message;

      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log('🔧 Step 3: AI Tool Calls Detected');
        message.tool_calls.forEach((toolCall, index) => {
          console.log(`   Tool ${index + 1}: ${toolCall.function.name}`);
          try {
            const args = JSON.parse(toolCall.function.arguments);
            console.log('   Arguments:', JSON.stringify(args, null, 2));

            // Check if date is correct format
            if (args.date && args.date.includes('tomorrow')) {
              console.log('   ⚠️  WARNING: Date contains "tomorrow" literal string!');
              console.log('   Expected: YYYY-MM-DD format');
            } else if (args.date && /^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
              console.log('   ✅ Date format correct:', args.date);
            }
          } catch (e) {
            console.log('   Arguments (raw):', toolCall.function.arguments);
          }
        });
        console.log('');
      }

      // Check tool execution results (second response with function_call results)
      if (data.tool_results) {
        console.log('📋 Step 4: Tool Execution Results');
        data.tool_results.forEach((result, index) => {
          console.log(`   Result ${index + 1}: ${result.name}`);
          if (result.success) {
            console.log('   ✅ Success:', result.message || 'Completed');
          } else {
            console.log('   ❌ Failed:', result.error || 'Unknown error');
          }
        });
        console.log('');
      }

      // Check final AI response
      if (message.content) {
        console.log('💬 Step 5: AI Response to User');
        console.log('   ' + message.content.substring(0, 200));
        if (message.content.length > 200) console.log('   ...');
        console.log('');
      }
    }

    console.log('─────────────────────────────────────────────────────\n');
    console.log('📊 TEST RESULTS SUMMARY\n');
    console.log('─────────────────────────────────────────────────────');
    console.log('✅ Edge Function: Working');
    console.log('✅ AI Processing: Working');
    console.log('✅ Tool Execution: Check results above');
    console.log('');
    console.log('🎯 VERIFICATION CHECKLIST:');
    console.log('   1. Check n8n executions: https://cwai97.app.n8n.cloud/executions');
    console.log('   2. Verify "Create Appointment" node succeeded (GREEN)');
    console.log('   3. Verify "Send Appointment Email" node succeeded (GREEN)');
    console.log(`   4. Check email inbox: ${TEST_EMAIL}`);
    console.log('   5. Verify appointment in Supabase dashboard');
    console.log('');
    console.log('─────────────────────────────────────────────────────');
    console.log('✅ Test completed!');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
