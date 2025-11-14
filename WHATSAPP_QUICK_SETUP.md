# WhatsApp Integration - 30-Minute Quick Setup

**Status:** 90% Complete - Just needs configuration
**Time Required:** 30 minutes
**Result:** Fully functional WhatsApp appointment booking

---

## WHAT'S ALREADY BUILT ✅

### 1. Groq Edge Function (`supabase/functions/groq-chat/index.ts`)
- ✅ Accepts `mode: 'public'` for WhatsApp
- ✅ Accepts `patient_phone` parameter
- ✅ Logs to `whatsapp_conversations` table
- ✅ Logs to `whatsapp_messages` table
- ✅ Supports all booking tools (book, reschedule, cancel)
- ✅ Returns simple text responses for WhatsApp

### 2. n8n WhatsApp Workflow (`n8n/WhatsApp Serenity Hospital Bot - FIXED.json`)
- ✅ WhatsApp trigger configured
- ✅ Text message handling
- ✅ Voice message handling (Whisper STT + OpenAI TTS)
- ✅ Calls Groq edge function
- ✅ Sends responses back via WhatsApp

### 3. n8n Booking Workflow (`n8n/Serenity Workflow - Ready to Import.json`)
- ✅ `book_appointment` action
- ✅ `reschedule_appointment` action
- ✅ `cancel_appointment` action
- ✅ Email confirmations (Gmail)
- ✅ SMS notifications (Twilio - optional)

---

## WHAT NEEDS TO BE DONE ⏳

### 1. Set up database tables (5 minutes)

The `whatsapp_conversations` and `whatsapp_messages` tables need to exist.

**Check if they exist:**
```bash
# Run this SQL in Supabase dashboard → SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('whatsapp_conversations', 'whatsapp_messages');
```

**If they don't exist, create them:**

See file: `/Users/odiadev/Desktop/serenity dasboard/create-whatsapp-tables.sql` (already exists!)

Just run that SQL file in Supabase.

### 2. Configure n8n WhatsApp workflow (10 minutes)

**Current workflow node: "Call Groq Edge Function"**

**Needs this modification:**

Change the JSON body from:
```json
{
  "messages": [...],
  "model": "llama-3.1-8b-instant",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

To:
```json
{
  "messages": [...],
  "mode": "public",
  "patient_phone": "{{ $json.patient_phone }}",
  "message_type": "{{ $json.message_type }}",
  "model": "llama-3.1-8b-instant",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**That's it!** The Groq function will:
1. Auto-load booking tools
2. Log conversations to database
3. Execute bookings when patient provides all info
4. Return confirmation messages

### 3. Configure Meta WhatsApp webhook (10 minutes)

**You need:**
1. Your n8n instance URL (e.g., `https://cwai97.app.n8n.cloud`)
2. Your Meta WhatsApp credentials (you mentioned you have these)

**Steps:**

#### A. Get Webhook URL from n8n

1. Open your n8n instance
2. Find the "WhatsApp Serenity Hospital Bot - FIXED" workflow
3. Click on the "WhatsApp Trigger" node
4. Copy the **Production Webhook URL**
   - Should look like: `https://[your-n8n].app.n8n.cloud/webhook/whatsapp-serenity-trigger`

#### B. Register with Meta

1. Go to: https://developers.facebook.com/apps
2. Select your WhatsApp Business app
3. Navigate to: **WhatsApp → Configuration**
4. Find the **Webhook** section
5. Click **Edit**

**Enter these values:**

| Field | Value |
|-------|-------|
| Callback URL | `https://[your-n8n].app.n8n.cloud/webhook/whatsapp-serenity-trigger` |
| Verify Token | `serenity_2025` (or any string you choose) |

6. Click **Verify and Save**

**Important:** Meta will send a GET request to verify. Your n8n WhatsApp Trigger should handle this automatically.

7. **Subscribe to Webhook Fields:**
   - ✅ `messages`
   - ✅ `message_status` (optional)

### 4. Add Meta credentials to n8n (5 minutes)

Your n8n workflow has several WhatsApp nodes. You need to add credentials to each:

**Nodes that need credentials:**
- "WhatsApp Trigger" (node: `cff6c529-0b06-4385-a69b-c868c106e8dd`)
- "Send Text Response" (node: `0369130e-7c74-4ae1-8cb0-29212754ab02`)
- "Send Audio Response" (node: `7a9708ac-b863-49ca-88de-8cf27ee74dd6`)
- "Get Audio URL" (node: `be0abbe6-5cef-448f-a42d-837980f02d6d`)
- "Send Error Message to User" (node: `a5f3dcff-13df-4ba8-ab81-3e840badd24d`)
- "Send Unsupported Type Message" (node: `e3b693f9-ba66-4df7-b9d3-42f04da38c49`)

**Credential values you need:**

```
Access Token: [Your Meta permanent token - starts with EAAG...]
Phone Number ID: 825467040645950
WhatsApp Business Account ID: [Your WABA ID]
```

**How to add in n8n:**
1. Click on a WhatsApp node
2. Click "Select Credential" dropdown
3. Click "+ Create New"
4. Enter:
   - **Credential Name:** `Meta WhatsApp Production`
   - **Access Token:** `[paste your token]`
   - **Business Account ID:** `[paste your WABA ID]`
5. Save
6. Repeat for all WhatsApp nodes (or reuse the same credential)

---

## TESTING CHECKLIST

### Test 1: Basic WhatsApp Response (2 minutes)

**Action:** Send "Hi" to your WhatsApp Business number

**Expected:**
```
Hello! I'm the AI assistant for Serenity Royale Hospital.
How can I help you today?
```

**Check:**
- [ ] Message received in WhatsApp
- [ ] Response sent back within 3 seconds
- [ ] n8n execution shows success (green checkmark)

**If fails:** Check n8n execution log for errors

---

### Test 2: Appointment Booking (5 minutes)

**Conversation flow:**

```
You: I want to book an appointment

AI: I'd be happy to help! May I have your full name?

You: John Doe

AI: Thank you, John. What's your email address?

You: john@example.com

AI: Great! And your phone number?

You: +2348123456789

AI: Perfect! What date would you like?

You: tomorrow

AI: What time works best for you?

You: 2pm

AI: And what's the reason for your visit?

You: Regular checkup

AI: ✅ Appointment booked successfully!

📅 Date: 2025-11-14
🕐 Time: 2:00 PM
📋 Reason: Regular checkup

You'll receive an email confirmation shortly.
Please arrive 10 minutes early.
```

**Check:**
- [ ] Conversation flows naturally
- [ ] AI collects all 6 fields
- [ ] Confirmation message received
- [ ] Email sent to john@example.com (check spam folder)
- [ ] Appointment appears in admin dashboard calendar
- [ ] Database entry in `appointments` table
- [ ] Conversation logged in `whatsapp_conversations` table

**If booking fails:**
- Check Groq edge function logs (Supabase Functions)
- Check n8n execution log
- Verify all credentials are correct

---

### Test 3: Voice Message (3 minutes)

**Action:** Send a voice message: "I want to book an appointment"

**Expected:**
1. WhatsApp shows "Recording..." while you speak
2. AI receives voice message
3. OpenAI Whisper transcribes it
4. Groq processes the transcript
5. AI responds with text OR voice (depending on workflow)

**Check:**
- [ ] Voice message transcribed correctly
- [ ] AI response matches the request
- [ ] n8n shows successful STT execution

**If fails:**
- Check OpenAI API credits
- Verify OpenAI credentials in n8n

---

### Test 4: Reschedule Appointment (5 minutes)

**Prerequisite:** You must have an existing appointment

**Conversation:**
```
You: I want to reschedule my appointment

AI: I can help with that. What's your email address?

You: john@example.com

AI: I found your appointment for Nov 14 at 2:00 PM.
    What's the new date you'd like?

You: Nov 20

AI: And what time?

You: 3pm

AI: ✅ Appointment rescheduled successfully!

Old: Nov 14 at 2:00 PM
New: Nov 20 at 3:00 PM

You'll receive a confirmation email.
```

**Check:**
- [ ] AI finds existing appointment
- [ ] Database updated with new date/time
- [ ] Status changed to "rescheduled"
- [ ] Reschedule email sent

---

### Test 5: Cancel Appointment (3 minutes)

**Conversation:**
```
You: Cancel my appointment

AI: I can help with that. What's your email address?

You: john@example.com

AI: I found your appointment for Nov 20 at 3:00 PM.
    Are you sure you want to cancel?

You: Yes, cancel it

AI: ❌ Appointment cancelled successfully.

If you'd like to rebook in the future, just let me know!
```

**Check:**
- [ ] Appointment status changed to "cancelled"
- [ ] Cancellation email sent
- [ ] Dashboard shows cancelled status

---

## TROUBLESHOOTING

### Issue: "Webhook verification failed"

**Cause:** Meta can't verify your webhook URL

**Fix:**
1. Ensure n8n workflow is **activated** (toggle in top-right)
2. Check n8n webhook URL is publicly accessible
3. Verify token matches in both places:
   - Meta Developer Portal: Verify Token field
   - n8n WhatsApp Trigger node: Verify Token parameter

---

### Issue: "Messages not sending from WhatsApp"

**Cause:** Meta webhook not configured or credentials invalid

**Fix:**
1. Check Meta Developer Portal → WhatsApp → Configuration
2. Verify webhook URL is correct
3. Check "Webhook fields" has ✅ `messages` subscribed
4. Verify Access Token hasn't expired
5. Check WhatsApp Business Account is approved

---

### Issue: "AI responds but appointment not created"

**Cause:** Groq edge function not triggering tools OR n8n booking workflow not receiving data

**Fix:**
1. Check Supabase Functions logs:
   - Go to Supabase Dashboard → Functions → groq-chat → Logs
   - Look for "Tool executed: book_appointment_with_confirmation"
2. If tool executed, check n8n booking workflow:
   - Go to n8n → Executions
   - Find "Serenity Webhook V2" workflow
   - Check if it received the `book_appointment` action
3. Verify all environment variables:
   - `N8N_WEBHOOK_BASE` in Supabase (for triggering n8n)
   - `GROQ_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

### Issue: "Voice messages not transcribing"

**Cause:** OpenAI API credentials missing or insufficient credits

**Fix:**
1. Check n8n OpenAI credentials:
   - Workflow: "WhatsApp Serenity Hospital Bot"
   - Node: "Transcribe Audio (Whisper)"
   - Verify OpenAI API key is valid
2. Check OpenAI account has credits:
   - https://platform.openai.com/usage
3. Alternative: Disable voice support temporarily and use text-only

---

### Issue: "Email confirmations not sending"

**Cause:** Gmail OAuth expired or n8n workflow not triggered

**Fix:**
1. Check n8n Gmail credentials:
   - Workflow: "Serenity Webhook V2"
   - Node: "Send Appointment Email"
   - Re-authenticate if needed
2. Check n8n execution logs for email node errors
3. Verify recipient email is valid (not a typo)

---

## ENVIRONMENT VARIABLES CHECKLIST

**Supabase Edge Functions (.env):**
```bash
GROQ_API_KEY=gsk_...
SUPABASE_URL=https://yfrpxqvjshwaaomgcaoq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...
N8N_WEBHOOK_BASE=https://[your-n8n].app.n8n.cloud/webhook
```

**n8n Credentials:**
- ✅ WhatsApp API (Meta Access Token + Phone Number ID + WABA ID)
- ✅ OpenAI API (for Whisper STT + TTS)
- ✅ Gmail OAuth2 (for email confirmations)
- ✅ Supabase API (for database operations)
- ✅ Twilio (optional - for SMS, can disable)

---

## SUCCESS CRITERIA

Your WhatsApp integration is fully working when:

- [x] Patient sends WhatsApp message → AI responds
- [x] Patient books appointment via WhatsApp → Email confirmation sent
- [x] Appointment appears in admin dashboard
- [x] Patient can reschedule via WhatsApp
- [x] Patient can cancel via WhatsApp
- [x] Voice messages work (STT transcription)
- [x] All conversations logged to database
- [x] No errors in n8n execution logs
- [x] No errors in Supabase function logs

---

## NEXT PHASE: DEMO PREPARATION

Once WhatsApp is working:

1. **Create demo data:**
   - 3 sample appointments
   - 2 sample conversations
   - Test patient profile

2. **Create demo script:**
   - Book appointment flow (2 minutes)
   - Reschedule flow (1 minute)
   - Cancel flow (1 minute)
   - Voice message demo (30 seconds)

3. **Record demo video:**
   - Screen recording of WhatsApp chat
   - Screen recording of admin dashboard
   - Combined 3-minute video

4. **Sales collateral:**
   - One-page feature list
   - Pricing tiers (if needed)
   - ROI calculations

---

**Estimated time to production:** 30-60 minutes (from this point)

**Difficulty:** Easy (just configuration, no coding)

**Blockers:** Only Meta credentials needed

---

## READY TO START?

**What I need from you:**

1. Your n8n instance URL (e.g., `https://cwai97.app.n8n.cloud`)
2. Confirmation that WhatsApp tables exist in Supabase (run the SQL check above)
3. Your Meta WhatsApp Access Token (starts with `EAAG...`)
4. Your WhatsApp Business Account ID (WABA)

Once you provide these, I can give you **exact step-by-step instructions with screenshots**.

Let's get WhatsApp live! 🚀
