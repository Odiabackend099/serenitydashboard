#!/usr/bin/env node

/**
 * Direct test to send appointment confirmation email
 * This simulates what n8n would do
 */

const nodemailer = require('nodemailer');

async function sendTestEmail() {
  console.log('📧 Testing Direct Email Send (Simulating n8n workflow)');
  console.log('================================================\n');

  // For actual email sending, you would need SMTP credentials
  // For now, we'll create a test account
  console.log('Creating test email account...');

  try {
    // Create a test account on ethereal.email (for testing)
    const testAccount = await nodemailer.createTestAccount();

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Email content
    const mailOptions = {
      from: '"Serenity Royale Hospital" <noreply@serenityroyalehospital.com>',
      to: 'odiabackend@gmail.com',
      subject: 'Appointment Confirmation - Serenity Royale Hospital',
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
    <h1 style="margin: 0;">Serenity Royale Hospital</h1>
    <p style="margin: 10px 0 0 0;">Appointment Confirmation</p>
  </div>

  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937;">Hello Test Patient,</h2>

    <p style="color: #4b5563; line-height: 1.6;">
      Your appointment has been successfully booked. Here are the details:
    </p>

    <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 40%;">Date:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">November 14, 2025</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Time:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">2:00 PM</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Type:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">Consultation</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Reason:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">General checkup and consultation</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #1f2937; margin-top: 30px;">Important Information</h3>
    <ul style="color: #4b5563; line-height: 1.8;">
      <li>Please arrive 15 minutes before your scheduled time</li>
      <li>Bring your ID and insurance card</li>
      <li>If you need to reschedule, call us at +234 806 219 7384</li>
    </ul>

    <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; color: #92400e;">
        <strong>Note:</strong> This is a test email from the appointment booking system. In production, our staff will contact you within 24 hours to confirm the exact time slot.
      </p>
    </div>
  </div>

  <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
    <p style="margin: 0;">Serenity Royale Hospital</p>
    <p style="margin: 5px 0;">info@serenityroyalehospital.com | +234 806 219 7384</p>
    <p style="margin: 5px 0;">© 2025 All rights reserved</p>
  </div>
</div>
      `
    };

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('');
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('');
    console.log('Note: This is a test email. To send real emails, configure Gmail OAuth in n8n.');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('================================================');
}

sendTestEmail();
