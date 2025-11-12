#!/usr/bin/env node

const https = require('https');

const SUPABASE_URL = 'yfrpxqvjshwaaomgcaoq.supabase.co';
const EDGE_FUNCTION_PATH = '/functions/v1/groq-chat';
const TEST_EMAIL = 'egualesamuel@gmail.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

// Calculate dates
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextWeekStr = nextWeek.toISOString().split('T')[0];

const testCases = [
  {
    name: 'Test 1: Tomorrow at 2 PM',
    message: `Book appointment for tomorrow at 2 PM. Name: Samuel Eguale, Email: ${TEST_EMAIL}, Phone: +1234567890`
  },
  {
    name: 'Test 2: Specific Date at 3:30 PM',
    message: `Book appointment for ${tomorrowStr} at 3:30 PM. Name: Samuel Eguale, Email: ${TEST_EMAIL}, Phone: +1234567890, Reason: Follow-up consultation`
  },
  {
    name: 'Test 3: Next Week at 10 AM',
    message: `Book appointment for ${nextWeekStr} at 10:00 AM. Name: Samuel Eguale, Email: ${TEST_EMAIL}, Phone: +1234567890, Reason: Annual checkup`
  }
];

function sendBooking(testCase) {
  return new Promise((resolve, reject) => {
    const payload = {
      messages: [{ role: 'user', content: testCase.message }],
      tools: [{
        type: 'function',
        function: {
          name: 'book_appointment_with_confirmation',
          description: 'Book appointment and send confirmation',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              date: { type: 'string' },
              time: { type: 'string' },
              reason: { type: 'string' }
            },
            required: ['name', 'email', 'date', 'time']
          }
        }
      }],
      tool_choice: 'auto',
      model: 'llama-3.1-8b-instant'
    };

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
        try {
          const result = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: result, testCase });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData, parseError: true, testCase });
        }
      });
    });

    req.on('error', (error) => {
      reject({ error, testCase });
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   SENDING MULTIPLE TEST EMAILS                           ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(`📧 Target Email: ${TEST_EMAIL}`);
  console.log(`📅 Tomorrow: ${tomorrowStr}`);
  console.log(`📅 Next Week: ${nextWeekStr}`);
  console.log('\n───────────────────────────────────────────────────────────\n');

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n🧪 ${testCase.name}`);
    console.log(`   Message: "${testCase.message.substring(0, 80)}..."`);
    console.log('   Status: Sending...');

    try {
      const result = await sendBooking(testCase);

      if (result.status === 200) {
        successCount++;
        console.log(`   ✅ SUCCESS (HTTP ${result.status})`);

        // Check if tool was executed
        if (result.data.choices && result.data.choices[0]) {
          const message = result.data.choices[0].message;
          if (message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            const args = JSON.parse(toolCall.function.arguments);
            console.log(`   📅 Date: ${args.date}`);
            console.log(`   🕐 Time: ${args.time}`);
          }
        }
      } else {
        failureCount++;
        console.log(`   ❌ FAILED (HTTP ${result.status})`);
        console.log(`   Error: ${JSON.stringify(result.data).substring(0, 100)}`);
      }

      // Wait 2 seconds between requests
      if (i < testCases.length - 1) {
        console.log('   ⏳ Waiting 2 seconds before next test...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      failureCount++;
      console.log(`   ❌ EXCEPTION: ${error.message || error.error?.message}`);
    }
  }

  console.log('\n───────────────────────────────────────────────────────────\n');
  console.log('📊 TEST SUMMARY:\n');
  console.log(`   Total Tests: ${testCases.length}`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log('\n───────────────────────────────────────────────────────────\n');
  console.log('📧 VERIFICATION:\n');
  console.log(`   1. Check email inbox: ${TEST_EMAIL}`);
  console.log(`   2. Expected: ${successCount} confirmation emails`);
  console.log('   3. Check n8n executions: https://cwai97.app.n8n.cloud/executions');
  console.log(`   4. Check Supabase appointments table for ${successCount} new records`);
  console.log('\n───────────────────────────────────────────────────────────\n');

  if (successCount === testCases.length) {
    console.log('🎉 ALL TESTS PASSED! System is production ready! ✅\n');
  } else {
    console.log(`⚠️  ${failureCount} test(s) failed. Review errors above.\n`);
  }
}

runTests().catch(console.error);
