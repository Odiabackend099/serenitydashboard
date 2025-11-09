# Appointment Booking with Email Confirmation - Setup Guide

## Overview

The appointment booking feature has been successfully integrated into the chat widget. When a patient requests an appointment, the system will:

1. Detect appointment intent from the conversation
2. Collect patient contact information (email, phone, name)
3. Extract appointment details (date, time, reason)
4. Send data to n8n workflow
5. n8n saves to Supabase appointments table
6. n8n sends confirmation email via Gmail

## Files Modified

### Frontend Changes

1. **[ChatWidget.tsx](apps/web/src/components/ChatWidget.tsx)**
   - Added appointment intent detection
   - Added contact information extraction (email/phone)
   - Added appointment details extraction (date/time/reason)
   - Integrated `triggerAppointmentBooking()` function
   - Added state management for appointment data

2. **[n8nWebhooks.ts](apps/web/src/lib/n8nWebhooks.ts)**
   - Updated `triggerAppointmentBooking()` to send full payload
   - Sends to `srhcareai-webhook` endpoint
   - Includes patient email, phone, name for email confirmation

### Database

3. **[CREATE_APPOINTMENTS_TABLE_FINAL.sql](CREATE_APPOINTMENTS_TABLE_FINAL.sql)**
   - Complete appointments table schema
   - Triggers and functions
   - Views for upcoming/today's appointments
   - RLS policies configured

## n8n Workflow Setup

### Step 1: Import Workflow

1. Open your n8n instance: https://cwai97.app.n8n.cloud
2. Go to **Workflows** > **Import from File**
3. Import: `n8n-srhcareai-enhanced.json`
4. The workflow includes:
   - Webhook trigger
   - Intent routing (appointment/emergency/general)
   - Supabase integration
   - Gmail email sending

### Step 2: Configure Credentials

#### Supabase Credentials

1. Go to **Credentials** in n8n
2. Add **Supabase** credential named `srh`
3. Configure:
   - **Host**: `https://yfrpxqvjshwaaomgcaoq.supabase.co`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.Gq3vNhC8bZWqGHECwOyQpXZGHKW8x-RZX0sqNwx_YjQ`

#### Gmail OAuth Credentials

1. Go to **Credentials** in n8n
2. Add **Gmail OAuth2** credential named `Gmail account`
3. Follow n8n's OAuth flow to connect your Gmail account
4. **Important**: Use the Gmail account you want to send from (e.g., info@serenityroyalehospital.com)

### Step 3: Activate Workflow

1. Open the imported workflow
2. Click **Active** toggle in the top right
3. Verify webhook URL is: `https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook`

### Step 4: Create Appointments Table in Supabase

Run this SQL in Supabase SQL Editor:

\`\`\`sql
-- Copy contents from CREATE_APPOINTMENTS_TABLE_FINAL.sql
-- Or run the migration script:
-- node apply-appointments-migration.js
\`\`\`

## Testing the Integration

### Test 1: Direct Webhook Test

\`\`\`bash
node test-appointment-booking-email.js
\`\`\`

This sends a test payload to n8n with:
- Patient email: odiabackend@gmail.com
- Appointment date: November 14, 2025
- Appointment time: 2:00 PM
- Reason: General checkup

**Expected Result**: Email confirmation sent to odiabackend@gmail.com

### Test 2: Chat Widget Test (Production)

1. Open: https://web-m6rynf4v3-odia-backends-projects.vercel.app
2. Click the chat widget button
3. Type: "I need to book an appointment"
4. When asked for contact info, provide: "My email is odiabackend@gmail.com and phone is +234 806 219 7384"
5. Provide appointment details when asked

**Expected Result**:
- Confirmation message in chat
- Email sent to odiabackend@gmail.com
- Appointment saved to Supabase

### Test 3: Direct Chat Widget Flow

Try these messages in sequence:

1. "I want to book an appointment for next Monday at 2pm"
2. "My email is odiabackend@gmail.com"
3. "My phone is +234 806 219 7384"

## How It Works

### 1. Patient Initiates Booking

When patient types appointment-related keywords:
- "book appointment"
- "schedule a visit"
- "see a doctor"
- "consultation"

The system detects intent automatically.

### 2. Contact Information Collection

The system extracts:
- **Email**: Using regex pattern for email addresses
- **Phone**: Using regex pattern for phone numbers
- **Name**: From conversation context

### 3. Appointment Details Extraction

The system looks for:
- **Date patterns**: "tomorrow", "next Monday", "December 10", "12/15/2025"
- **Time patterns**: "2pm", "14:00", "2:00 PM"
- **Reason**: Keywords like "checkup", "consultation", "pain", etc.

### 4. n8n Workflow Processing

1. **Webhook receives** payload from chat widget
2. **Extract & Analyze** user data and intent
3. **Route by Intent**:
   - Appointment → Save to appointments table + Send email
   - Emergency → Alert staff
   - General → Generate AI response
4. **Send Confirmation Email** (if email provided)

### 5. Email Template

The confirmation email includes:
- Patient name
- Appointment date and time
- Appointment type
- Reason for visit
- Important instructions
- Contact information

## Troubleshooting

### Issue: Webhook returns 500 error

**Solutions**:
1. Check workflow is **Active** in n8n
2. Verify Supabase credentials are correct
3. Ensure Gmail OAuth is connected
4. Check n8n execution logs for specific error

### Issue: No email received

**Solutions**:
1. Check spam folder
2. Verify Gmail OAuth permissions include "send email"
3. Check n8n execution logs
4. Ensure `patientEmail` field is populated in payload

### Issue: Appointment not saved to database

**Solutions**:
1. Run `CREATE_APPOINTMENTS_TABLE_FINAL.sql` in Supabase
2. Verify Supabase credentials in n8n
3. Check RLS policies allow insert
4. Review n8n execution logs for Supabase errors

## Email Template Preview

Subject: **Appointment Confirmation - Serenity Royale Hospital**

```
┌─────────────────────────────────────┐
│  Serenity Royale Hospital           │
│  Appointment Confirmation           │
└─────────────────────────────────────┘

Hello [Patient Name],

Your appointment has been successfully booked.
Here are the details:

Date: [Appointment Date]
Time: [Appointment Time]
Type: Consultation
Reason: [Reason]

Important Information:
• Please arrive 15 minutes early
• Bring ID and insurance card
• Call +234 806 219 7384 to reschedule

Note: Our staff will contact you within 24 hours
to confirm the exact time slot.

Contact: info@serenityroyalehospital.com
Phone: +234 806 219 7384
```

## Next Steps

1. ✅ Import n8n workflow
2. ✅ Configure Supabase credentials
3. ⚠️  Configure Gmail OAuth (REQUIRED FOR EMAIL)
4. ✅ Activate workflow
5. ✅ Create appointments table
6. 🧪 Run test script
7. 📧 Verify email to odiabackend@gmail.com

## Production Deployment

The application has been deployed to: **https://web-m6rynf4v3-odia-backends-projects.vercel.app**

All environment variables are configured:
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY
- ✅ VITE_N8N_WEBHOOK_URL
- ✅ VITE_VAPI_ASSISTANT_ID
- ✅ VITE_VAPI_PUBLIC_KEY

## Support

For issues or questions:
1. Check n8n execution logs
2. Review browser console for frontend errors
3. Check Supabase logs
4. Verify all credentials are valid

---

**Status**: ✅ Ready for Testing (pending Gmail OAuth setup in n8n)
