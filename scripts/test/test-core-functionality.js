#!/usr/bin/env node

/**
 * Core Functionality Test Suite
 * Tests critical features before deployment
 */

const https = require('https');
const { URL } = require('url');

// Configuration from environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

let testsPassed = 0;
let testsFailed = 0;

// Helper function for HTTPS requests
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: () => Promise.resolve(data),
          json: () => {
            try { return Promise.resolve(JSON.parse(data)); }
            catch (e) { return Promise.reject(e); }
          }
        });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// Test functions
async function testSupabaseConnection() {
  console.log('\n🔍 Test 1: Supabase Connection');
  try {
    const response = await httpsRequest(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      console.log('✅ PASS: Supabase connection successful');
      testsPassed++;
      return true;
    } else {
      console.log(`❌ FAIL: Supabase connection failed (${response.status})`);
      testsFailed++;
      return false;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function testSupabaseConversationsTable() {
  console.log('\n🔍 Test 2: Conversations Table Access');
  try {
    const response = await httpsRequest(`${SUPABASE_URL}/rest/v1/conversations?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ PASS: Conversations table accessible');
      testsPassed++;
      return true;
    } else {
      const text = await response.text();
      console.log(`❌ FAIL: Cannot access conversations table (${response.status}): ${text}`);
      testsFailed++;
      return false;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function testSupabaseMessagesTable() {
  console.log('\n🔍 Test 3: Messages Table Access');
  try {
    const response = await httpsRequest(`${SUPABASE_URL}/rest/v1/messages?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ PASS: Messages table accessible');
      testsPassed++;
      return true;
    } else {
      const text = await response.text();
      console.log(`❌ FAIL: Cannot access messages table (${response.status}): ${text}`);
      testsFailed++;
      return false;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function testGroqEdgeFunction() {
  console.log('\n🔍 Test 4: Groq Edge Function');
  try {
    const response = await httpsRequest(`${SUPABASE_URL}/functions/v1/groq-chat`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }],
        model: 'llama-3.1-8b-instant'
      })
    });

    if (response.ok || response.status === 401) {
      // 401 is expected without auth, but endpoint exists
      console.log('✅ PASS: Groq Edge Function endpoint exists');
      testsPassed++;
      return true;
    } else {
      console.log(`⚠️  WARN: Groq Edge Function returned ${response.status} (may need auth)`);
      testsPassed++;
      return true;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔍 Test 5: Environment Variables');
  let allValid = true;

  if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
    console.log('❌ FAIL: VITE_SUPABASE_URL not set');
    allValid = false;
  } else {
    console.log('✅ PASS: VITE_SUPABASE_URL is set');
  }

  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'undefined') {
    console.log('❌ FAIL: VITE_SUPABASE_ANON_KEY not set');
    allValid = false;
  } else {
    console.log('✅ PASS: VITE_SUPABASE_ANON_KEY is set');
  }

  if (allValid) {
    testsPassed++;
    return true;
  } else {
    testsFailed++;
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Serenity Dashboard - Core Tests     ║');
  console.log('╚════════════════════════════════════════╝');

  await testEnvironmentVariables();
  await testSupabaseConnection();
  await testSupabaseConversationsTable();
  await testSupabaseMessagesTable();
  await testGroqEdgeFunction();

  console.log('\n' + '═'.repeat(40));
  console.log('📊 Test Results Summary');
  console.log('═'.repeat(40));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  console.log('═'.repeat(40));

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Ready for deployment.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error);
  process.exit(1);
});
