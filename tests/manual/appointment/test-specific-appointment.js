#!/usr/bin/env node

/**
 * Test specific appointment booking for negualesamuel@gmail.com
 */

const https = require('https');

const WEBHOOK_BASE = 'https://cwai97.app.n8n.cloud/webhook';
const TEST_EMAIL = 'negualesamuel@gmail.com';

// Test appointment data
const appointmentData = {
  action: 'book_appointment',
  patientName: 'Samuel Neguale',
  patientEmail: TEST_EMAIL,
  patientPhone: '+1234567890',
  appointmentDate: '2024-12-20',
  appointmentTime: '14:00',
  doctor: 'Dr. Sarah Johnson',
  service: 'General Consultation',
  notes: 'Test appointment booking through AI chat widget'
};

function makeRequest(url, method = 'POST', data) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
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

async function testAppointmentBooking() {
  console.log('🚀 Testing Appointment Booking for negualesamuel@gmail.com...\n');
  console.log('📧 Email:', TEST_EMAIL);
  console.log('📅 Date:', appointmentData.appointmentDate);
  console.log('⏰ Time:', appointmentData.appointmentTime);
  console.log('👨‍⚕️ Doctor:', appointmentData.doctor);
  
  try {
    const url = `${WEBHOOK_BASE}/serenity-webhook-v2`;
    console.log('\n🔗 Sending request to:', url);
    
    const result = await makeRequest(url, 'POST', appointmentData);
    
    console.log('\n📊 Response Status:', result.status);
    console.log('📤 Response Data:', JSON.stringify(result.data, null, 2));
    
    if (result.status >= 200 && result.status < 300) {
      console.log('\n✅ SUCCESS: Appointment booking completed!');
      console.log('📧 Email confirmation should be sent to:', TEST_EMAIL);
      return true;
    } else {
      console.log('\n❌ FAILED: Appointment booking failed');
      return false;
    }
  } catch (error) {
    console.log('\n❌ ERROR: Appointment booking error');
    console.log('Error details:', error.message);
    return false;
  }
}

async function testEmailSending() {
  console.log('\n\n📧 Testing Email Sending to negualesamuel@gmail.com...\n');
  
  const emailData = {
    action: 'send_email',
    to: TEST_EMAIL,
    subject: 'Test Appointment Confirmation - Serenity Care AI',
    body: `Dear Samuel,

Your appointment has been successfully booked:

📅 Date: ${appointmentData.appointmentDate}
⏰ Time: ${appointmentData.appointmentTime}
👨‍⚕️ Doctor: ${appointmentData.doctor}
🏥 Service: ${appointmentData.service}

Please arrive 15 minutes early for your appointment.

Best regards,
Serenity Care AI Team`
  };
  
  try {
    const url = `${WEBHOOK_BASE}/serenity-webhook-v2`;
    console.log('🔗 Sending email request to:', url);
    
    const result = await makeRequest(url, 'POST', emailData);
    
    console.log('\n📊 Email Response Status:', result.status);
    console.log('📤 Email Response Data:', JSON.stringify(result.data, null, 2));
    
    if (result.status >= 200 && result.status < 300) {
      console.log('\n✅ SUCCESS: Email sent successfully!');
      console.log('📧 Check your inbox at:', TEST_EMAIL);
      return true;
    } else {
      console.log('\n❌ FAILED: Email sending failed');
      return false;
    }
  } catch (error) {
    console.log('\n❌ ERROR: Email sending error');
    console.log('Error details:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🎯 Testing Specific Functionalities for negualesamuel@gmail.com');
  console.log('=' .repeat(60));
  
  const appointmentResult = await testAppointmentBooking();
  const emailResult = await testEmailSending();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FINAL TEST RESULTS:');
  console.log(`Appointment Booking: ${appointmentResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Email Sending: ${emailResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (appointmentResult && emailResult) {
    console.log('\n🎉 ALL TESTS PASSED! Ready for deployment.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});