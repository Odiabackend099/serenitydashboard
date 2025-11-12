#!/usr/bin/env node

/**
 * Test script for chat widget and core functionalities
 * Tests: appointment booking, email sending, rescheduling, cancellation
 */

const https = require('https');
const http = require('http');

// Test configuration
const TEST_EMAIL = 'negualesamuel@gmail.com';
const WEBHOOK_BASE = process.env.VITE_N8N_WEBHOOK_BASE || 'https://cwai97.app.n8n.cloud/webhook';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Test data
const testAppointment = {
  patientName: 'Test Patient',
  patientEmail: TEST_EMAIL,
  patientPhone: '+1234567890',
  appointmentDate: '2024-12-20',
  appointmentTime: '14:00',
  doctor: 'Dr. Smith',
  service: 'General Consultation',
  notes: 'Test appointment from chat widget'
};

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (SUPABASE_ANON_KEY) {
      options.headers['apikey'] = SUPABASE_ANON_KEY;
    }

    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testWebhookEndpoint(endpoint, payload, description) {
  console.log(`\n🧪 Testing: ${description}`);
  try {
    const url = `${WEBHOOK_BASE}/${endpoint}`;
    const result = await makeRequest(url, 'POST', payload);
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`✅ SUCCESS: ${description}`);
      console.log(`   Status: ${result.status}`);
      return true;
    } else {
      console.log(`❌ FAILED: ${description}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response:`, result.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${description}`);
    console.log(`   Error:`, error.message);
    return false;
  }
}

async function testSupabaseConnection() {
  console.log(`\n🧪 Testing: Supabase Connection`);
  try {
    const url = `${SUPABASE_URL}/rest/v1/appointments?select=*&limit=1`;
    const result = await makeRequest(url, 'GET', null);
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`✅ SUCCESS: Supabase Connection`);
      return true;
    } else {
      console.log(`❌ FAILED: Supabase Connection`);
      console.log(`   Status: ${result.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: Supabase Connection`);
    console.log(`   Error:`, error.message);
    return false;
  }
}

async function testAllFunctionalities() {
  console.log('🚀 Starting Chat Widget Functionality Tests...\n');
  console.log('📧 Test Email:', TEST_EMAIL);
  console.log('🔗 Webhook Base:', WEBHOOK_BASE);
  console.log('📊 Supabase URL:', SUPABASE_URL);
  
  const results = {
    supabase: false,
    appointmentBooking: false,
    emailSending: false,
    whatsappSending: false,
    smsSending: false,
    appointmentReschedule: false,
    appointmentCancel: false
  };

  // Test 1: Supabase Connection
  results.supabase = await testSupabaseConnection();

  // Test 2: Appointment Booking
  const bookingPayload = {
    action: 'book_appointment',
    patientName: testAppointment.patientName,
    patientEmail: testAppointment.patientEmail,
    patientPhone: testAppointment.patientPhone,
    appointmentDate: testAppointment.appointmentDate,
    appointmentTime: testAppointment.appointmentTime,
    doctor: testAppointment.doctor,
    service: testAppointment.service,
    notes: testAppointment.notes
  };
  
  results.appointmentBooking = await testWebhookEndpoint('serenity-webhook-v2', bookingPayload, 'Appointment Booking');

  // Test 3: Email Sending
  const emailPayload = {
    action: 'send_email',
    to: TEST_EMAIL,
    subject: 'Test Appointment Confirmation',
    body: `Dear ${testAppointment.patientName}, your appointment with ${testAppointment.doctor} is confirmed for ${testAppointment.appointmentDate} at ${testAppointment.appointmentTime}.`
  };
  
  results.emailSending = await testWebhookEndpoint('serenity-webhook-v2', emailPayload, 'Email Sending');

  // Test 4: WhatsApp Message
  const whatsappPayload = {
    action: 'send_whatsapp',
    to: testAppointment.patientPhone,
    message: `Hello ${testAppointment.patientName}, your appointment with ${testAppointment.doctor} is confirmed for ${testAppointment.appointmentDate} at ${testAppointment.appointmentTime}.`
  };
  
  results.whatsappSending = await testWebhookEndpoint('serenity-webhook-v2', whatsappPayload, 'WhatsApp Sending');

  // Test 5: SMS Sending
  const smsPayload = {
    action: 'send_sms',
    to: testAppointment.patientPhone,
    message: `Reminder: Your appointment with ${testAppointment.doctor} is on ${testAppointment.appointmentDate} at ${testAppointment.appointmentTime}.`
  };
  
  results.smsSending = await testWebhookEndpoint('serenity-webhook-v2', smsPayload, 'SMS Sending');

  // Test 6: Appointment Reschedule
  const reschedulePayload = {
    action: 'reschedule_appointment',
    patientEmail: TEST_EMAIL,
    oldDate: testAppointment.appointmentDate,
    oldTime: testAppointment.appointmentTime,
    newDate: '2024-12-21',
    newTime: '15:00',
    reason: 'Patient request'
  };
  
  results.appointmentReschedule = await testWebhookEndpoint('serenity-webhook-v2', reschedulePayload, 'Appointment Reschedule');

  // Test 7: Appointment Cancellation
  const cancelPayload = {
    action: 'cancel_appointment',
    patientEmail: TEST_EMAIL,
    appointmentDate: testAppointment.appointmentDate,
    appointmentTime: testAppointment.appointmentTime,
    reason: 'Patient unable to attend'
  };
  
  results.appointmentCancel = await testWebhookEndpoint('serenity-webhook-v2', cancelPayload, 'Appointment Cancellation');

  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('========================');
  
  let allPassed = true;
  for (const [testName, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    if (!passed) allPassed = false;
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Chat widget is fully functional.');
  } else {
    console.log('⚠️  Some tests failed. Check the details above.');
  }
  console.log('='.repeat(50));

  return { results, allPassed };
}

// Run tests
if (require.main === module) {
  testAllFunctionalities()
    .then(({ results, allPassed }) => {
      process.exit(allPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testAllFunctionalities };