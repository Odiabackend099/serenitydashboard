#!/usr/bin/env node

/**
 * BUSINESS USER EMAIL TEST
 * Sends test emails to egiualesamuel@gmail.com
 *
 * Run: node send-test-emails.js
 */

const https = require('https');

// Configuration
const WEBHOOK_URL = 'cwai97.app.n8n.cloud';
const WEBHOOK_PATH = '/webhook/serenity-webhook-v2';
const TEST_EMAIL = 'egiualesamuel@gmail.com';

function sendEmail(emailData, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📧 ${description}`);
    console.log(`   Sending to: ${emailData.to || emailData.patientEmail}`);

    const postData = JSON.stringify(emailData);

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
        if (res.statusCode === 200) {
          console.log(`   ✅ SUCCESS - Email sent!`);
          resolve({ success: true, status: res.statusCode });
        } else {
          console.log(`   ❌ FAILED - Status ${res.statusCode}`);
          console.log(`   Response: ${responseData}`);
          resolve({ success: false, status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ ERROR: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function sendAllTestEmails() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   SERENITY HOSPITAL - EMAIL TEST SUITE            ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`\n📬 Recipient: ${TEST_EMAIL}`);
  console.log(`🔗 Webhook: https://${WEBHOOK_URL}${WEBHOOK_PATH}\n`);
  console.log('─────────────────────────────────────────────────────');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const emailTests = [
    {
      description: 'Test Email #1: Welcome Message',
      data: {
        action: 'send_email',
        to: TEST_EMAIL,
        subject: '👋 Welcome to Serenity Hospital',
        message: 'Hello! This is a test email from Serenity Hospital. Our AI assistant is now ready to help you with appointments, inquiries, and more.'
      }
    },
    {
      description: 'Test Email #2: Appointment Booking',
      data: {
        action: 'book_appointment_with_confirmation',
        patientName: 'Samuel Eguale',
        patientEmail: TEST_EMAIL,
        patientPhone: '+1234567890',
        appointmentDate: formatDate(nextWeek),
        appointmentTime: '10:00 AM',
        appointmentReason: 'Annual Health Checkup'
      }
    },
    {
      description: 'Test Email #3: Appointment Reminder',
      data: {
        action: 'send_email',
        to: TEST_EMAIL,
        subject: '⏰ Reminder: Your Appointment Tomorrow',
        message: `Dear Samuel,\n\nThis is a friendly reminder about your appointment tomorrow at 10:00 AM.\n\nPlease arrive 10 minutes early.\n\nBest regards,\nSerenity Hospital Team`
      }
    },
    {
      description: 'Test Email #4: Health Tips Newsletter',
      data: {
        action: 'send_email',
        to: TEST_EMAIL,
        subject: '💊 Weekly Health Tips from Serenity Hospital',
        message: 'Stay healthy this week! Remember to:\n• Drink 8 glasses of water daily\n• Get 7-8 hours of sleep\n• Exercise for 30 minutes\n• Eat fruits and vegetables\n\nYour health is our priority!'
      }
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < emailTests.length; i++) {
    const test = emailTests[i];

    try {
      const result = await sendEmail(test.data, test.description);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failCount++;
    }

    // Wait 3 seconds between emails to avoid rate limiting
    if (i < emailTests.length - 1) {
      console.log(`\n   ⏳ Waiting 3 seconds before next email...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n─────────────────────────────────────────────────────');
  console.log('\n📊 RESULTS SUMMARY');
  console.log('─────────────────────────────────────────────────────');
  console.log(`✅ Successful: ${successCount} emails`);
  console.log(`❌ Failed: ${failCount} emails`);
  console.log(`📈 Success Rate: ${Math.round((successCount / emailTests.length) * 100)}%`);

  if (successCount > 0) {
    console.log('\n✉️  NEXT STEPS:');
    console.log(`   1. Check inbox at ${TEST_EMAIL}`);
    console.log(`   2. Check spam/junk folder if not in inbox`);
    console.log(`   3. Monitor n8n executions: https://cwai97.app.n8n.cloud/executions`);
    console.log(`   4. Wait 1-2 minutes for email delivery`);
  }

  if (failCount > 0) {
    console.log('\n⚠️  TROUBLESHOOTING:');
    console.log('   • Check n8n workflow is active (green toggle)');
    console.log('   • Verify Gmail credentials in n8n');
    console.log('   • Check n8n execution logs for errors');
    console.log('   • Ensure Gmail API is not rate limited');
  }

  console.log('\n─────────────────────────────────────────────────────\n');
}

// Run the test
console.log('\n🚀 Starting email test...\n');
sendAllTestEmails()
  .then(() => {
    console.log('✅ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
