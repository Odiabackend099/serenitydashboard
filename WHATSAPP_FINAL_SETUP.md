# WhatsApp Integration - Final Setup Guide

**n8n Instance:** https://cwai97.app.n8n.cloud/
**Status:** ✅ Database tables created
**Time to Complete:** 30 minutes

---

## WORKFLOW ARCHITECTURE

You have **2 n8n workflows** that work together:

### Workflow 1: WhatsApp Serenity Hospital Bot - FIXED
**Purpose:** Receives WhatsApp messages, processes with AI, sends responses
**Webhook URL:** `https://cwai97.app.n8n.cloud/webhook/whatsapp-serenity-trigger`

**Flow:**
```
WhatsApp Message
  ↓
WhatsApp Trigger (Meta webhook)
  ↓
Process Text/Voice Input
  ↓
Call Groq Edge Function (https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat)
  ↓
Send Response to WhatsApp
```

### Workflow 2: Serenity Workflow - Ready to Import (v2.0.3)
**Purpose:** Handles appointments (book/reschedule/cancel) + Email/SMS notifications
**Webhook URL:** `https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2`

**Flow:**
```
Groq Edge Function triggers webhook
  ↓
Route by Action (book/reschedule/cancel)
  ↓
Database Update
  ↓
Send Email Confirmation (Gmail)
  ↓
Send SMS (Twilio - optional)
```

---

## STEP-BY-STEP CONFIGURATION

### ✅ Step 1: Import Workflows to n8n (5 minutes)

**If workflows are not already imported:**

1. Go to: https://cwai97.app.n8n.cloud/
2. Click **"Workflows"** in sidebar
3. Click **"+ Add workflow"** → **"Import from file"**

**Import these files:**
- `/Users/odiadev/Desktop/serenity dasboard/n8n/WhatsApp Serenity Hospital Bot - FIXED.json`
- `/Users/odiadev/Desktop/serenity dasboard/n8n/Serenity Workflow - Ready to Import.json`

**Expected result:** 2 workflows in your workspace

---

### ✅ Step 2: Add Meta WhatsApp Credentials (10 minutes)

#### A. Create WhatsApp API Credential

1. Open workflow: **"WhatsApp Serenity Hospital Bot - FIXED"**
2. Click on node: **"WhatsApp Trigger"**
3. You'll see "Credential to connect with" dropdown
4. Click **"+ Create New Credential"**
5. Select: **"WhatsApp Trigger API"**

**Fill in these values:**

| Field | Your Value | Notes |
|-------|------------|-------|
| **Credential Name** | `Meta WhatsApp Production` | Any name you like |
| **App Secret** | `[Your Meta App Secret]` | From Meta Developer Portal → Settings → Basic |
| **Verify Token** | `serenity_2025` | Create your own (remember this!) |

6. Click **"Create"**

#### B. Create WhatsApp API Credential (for sending messages)

1. Still in same workflow
2. Click on node: **"Send Text Response"**
3. Click **"+ Create New Credential"**
4. Select: **"WhatsApp API"**

**Fill in these values:**

| Field | Your Value | Where to Find It |
|-------|------------|------------------|
| **Credential Name** | `Meta WhatsApp Send` | Any name |
| **Access Token** | `EAAG...` (your token) | Meta Developer Portal → WhatsApp → Getting Started → Temporary/Permanent access token |
| **Business Account ID** | `[15-digit number]` | Meta Developer Portal → WhatsApp → Configuration → Business Account ID |

5. Click **"Create"**

#### C. Apply Credentials to All WhatsApp Nodes

**Nodes that need "WhatsApp Trigger API" credential:**
- ✅ "WhatsApp Trigger" (already done)

**Nodes that need "WhatsApp API" credential:**
1. "Get Audio URL"
2. "Send Text Response"
3. "Send Audio Response"
4. "Send Error Message to User"
5. "Send Unsupported Type Message"

**For each node:**
1. Click the node
2. Find "Credential to connect with" dropdown
3. Select **"Meta WhatsApp Send"**
4. Click away to save

---

### ✅ Step 3: Update Groq Edge Function Call (CRITICAL - 5 minutes)

This is the **most important change** to enable WhatsApp booking.

1. In workflow: **"WhatsApp Serenity Hospital Bot - FIXED"**
2. Click on node: **"Call Groq Edge Function"**
3. Look for **"Body Content Type"**: Should be `JSON`
4. Look for **"Specify Body"**: Should show a JSON editor
5. Find this section in the JSON:

**Current (BEFORE):**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are the AI receptionist for Serenity Royale Hospital..."
    },
    {
      "role": "user",
      "content": "{{ $json.user_message }}"
    }
  ],
  "model": "llama-3.1-8b-instant",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Change to (AFTER):**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are the AI receptionist for Serenity Royale Hospital in Lagos, Nigeria. You help patients book appointments via WhatsApp.\\n\\nYour responsibilities:\\n- Book new appointments (collect: name, email, phone, date, time, reason)\\n- Show patient's existing appointments\\n- Check appointment availability\\n- Reschedule or cancel appointments\\n\\nCultural context:\\n- WhatsApp is Nigeria's primary communication channel\\n- Use emojis appropriately: ✅ 📅 🕐\\n- Be warm, professional, and concise\\n- Phone format: +234XXXXXXXXXX\\n\\nALWAYS:\\n- Check availability BEFORE booking\\n- Collect ALL required info before using tools\\n- Confirm actions with patient\\n- Mention: 'Please arrive 10 minutes early'\\n\\nFor emergencies: 'Call 112 or visit our ER immediately'\\n\\nToday's date: {{ new Date().toISOString().split('T')[0] }}"
    },
    {
      "role": "user",
      "content": "{{ $json.user_message }}"
    }
  ],
  "mode": "public",
  "patient_phone": "{{ $json.patient_phone }}",
  "message_type": "{{ $json.message_type }}",
  "model": "llama-3.1-8b-instant",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Key changes:**
- ✅ Added `"mode": "public"` - This enables WhatsApp tools in Groq
- ✅ Added `"patient_phone": "{{ $json.patient_phone }}"` - Passes phone number
- ✅ Added `"message_type": "{{ $json.message_type }}"` - Tracks text vs voice

6. Click **"Save"** (top-right corner)

---

### ✅ Step 4: Verify Environment Variables (5 minutes)

The Groq edge function needs to know your n8n webhook URL to trigger bookings.

1. Go to: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/settings/functions
2. Look for **"Edge Function Secrets"** or **"Environment Variables"**
3. Check if this exists:

```
Name: N8N_WEBHOOK_BASE
Value: https://cwai97.app.n8n.cloud/webhook
```

**If it doesn't exist:**
4. Click **"Add new secret"**
5. Enter:
   - **Name:** `N8N_WEBHOOK_BASE`
   - **Value:** `https://cwai97.app.n8n.cloud/webhook`
6. Click **"Add"**

**If it exists with a different value:**
7. Click **"Edit"**
8. Change to: `https://cwai97.app.n8n.cloud/webhook`
9. Click **"Save"**

---

### ✅ Step 5: Activate Workflows (2 minutes)

**IMPORTANT:** Workflows must be **ON** for webhooks to work.

1. Go to: https://cwai97.app.n8n.cloud/workflows
2. Find workflow: **"WhatsApp Serenity Hospital Bot - FIXED"**
3. Toggle switch to **ON** (should turn green)
4. Find workflow: **"Serenity Workflow - Ready to Import"** (or "Serenity Webhook V2")
5. Toggle switch to **ON**

**Both workflows should now show:** 🟢 **Active**

---

### ✅ Step 6: Register Webhook with Meta (5 minutes)

Now we tell Meta to send WhatsApp messages to your n8n instance.

1. Go to: https://developers.facebook.com/apps
2. **Login** with your Meta account
3. Select your **WhatsApp Business App**
4. In left sidebar, click: **WhatsApp → Configuration**
5. Scroll to **"Webhook"** section
6. Click **"Edit"**

**Enter these exact values:**

| Field | Value |
|-------|-------|
| **Callback URL** | `https://cwai97.app.n8n.cloud/webhook/whatsapp-serenity-trigger` |
| **Verify Token** | `serenity_2025` (or whatever you set in Step 2A) |

7. Click **"Verify and Save"**

**What happens:**
- Meta sends a GET request to your webhook
- n8n WhatsApp Trigger responds automatically
- If successful: ✅ "Webhook verified successfully"
- If fails: See troubleshooting below

8. **Subscribe to Webhook Fields:**
   - Scroll down to "Webhook fields"
   - Find **"messages"**
   - Check the ✅ box next to "messages"
   - Click **"Save"**

---

## TESTING CHECKLIST

### Test 1: WhatsApp Webhook Connection (2 minutes)

**Test:** Send a test message from Meta

1. In Meta Developer Portal → WhatsApp → API Setup
2. Look for **"Send and receive messages"** section
3. Find your test phone number (should be listed)
4. Send test message: "Hello"

**Expected:**
- WhatsApp receives message
- n8n shows new execution (green checkmark)
- Go to: https://cwai97.app.n8n.cloud/executions
- Should see "WhatsApp Serenity Hospital Bot - FIXED" with status: ✅ Success

**If fails:**
- Check workflow is **Active** (toggle ON)
- Verify webhook URL in Meta matches exactly
- Check verify token matches
- See troubleshooting section

---

### Test 2: AI Response (3 minutes)

**Test:** Send WhatsApp message to your business number

**Your WhatsApp Business Number:** (from Meta portal - usually shown as "Display phone number")

**Send from your personal WhatsApp:**
```
Hi
```

**Expected AI Response (within 5 seconds):**
```
Hello! I'm the AI assistant for Serenity Royale Hospital.
How can I help you today?
```

**Check:**
- [ ] Response received on WhatsApp
- [ ] Response time < 5 seconds
- [ ] n8n execution shows success
- [ ] Supabase database has new rows:
  - Check: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/editor
  - Table: `whatsapp_conversations` (should have 1 row)
  - Table: `whatsapp_messages` (should have 2 rows: 1 inbound, 1 outbound)

---

### Test 3: Appointment Booking (10 minutes)

**Full conversation test:**

```
You: I want to book an appointment

AI: I'd be happy to help! May I have your full name?

You: Samuel Eguale

AI: Thank you, Samuel. What's your email address?

You: egiualesamuel@gmail.com

AI: Great! And your phone number?

You: +2348141995397

AI: Perfect! What date would you like?

You: tomorrow

AI: What time works best for you?

You: 2pm

AI: And what's the reason for your visit?

You: checkup

AI: ✅ Appointment booked successfully!

📅 Date: 2025-11-14
🕐 Time: 2:00 PM
📋 Reason: checkup

You'll receive an email confirmation shortly.
Please arrive 10 minutes early.
```

**Check these 6 things:**

1. **WhatsApp conversation flows naturally**
   - [ ] AI asks all 6 questions in order
   - [ ] AI understands your answers
   - [ ] AI confirms booking at the end

2. **Email confirmation sent**
   - [ ] Check inbox: egiualesamuel@gmail.com
   - [ ] Email subject: "Appointment Confirmation - Serenity Hospital"
   - [ ] Email contains date, time, reason
   - [ ] Check spam folder if not in inbox

3. **Database appointment created**
   - [ ] Go to: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/editor
   - [ ] Open table: `appointments`
   - [ ] Find row with email: egiualesamuel@gmail.com
   - [ ] Status should be: "confirmed"

4. **Admin dashboard shows appointment**
   - [ ] Go to: https://web-rb4xjj4md-odia-backends-projects.vercel.app
   - [ ] Login to admin dashboard
   - [ ] Navigate to Calendar tab
   - [ ] See appointment for tomorrow at 2pm

5. **n8n executions successful**
   - [ ] https://cwai97.app.n8n.cloud/executions
   - [ ] "WhatsApp Serenity Hospital Bot - FIXED": ✅ Success (multiple times)
   - [ ] "Serenity Webhook V2": ✅ Success (1 time for booking)

6. **Supabase function logs**
   - [ ] https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/functions
   - [ ] Click "groq-chat" function → Logs tab
   - [ ] Look for: "Tool executed: book_appointment_with_confirmation"

**If ANY of these fail:** See troubleshooting section below

---

### Test 4: Reschedule Appointment (5 minutes)

**Prerequisite:** Must have an existing appointment (from Test 3)

**Conversation:**

```
You: I want to reschedule my appointment

AI: I can help with that. What's your email address?

You: egiualesamuel@gmail.com

AI: I found your appointment for Nov 14 at 2:00 PM. What's the new date you'd like?

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
- [ ] Database updated (appointments table, status = "rescheduled")
- [ ] Reschedule email sent
- [ ] Admin dashboard shows new date/time

---

### Test 5: Cancel Appointment (3 minutes)

**Conversation:**

```
You: Cancel my appointment

AI: I can help with that. What's your email address?

You: egiualesamuel@gmail.com

AI: I found your appointment for Nov 20 at 3:00 PM. Are you sure you want to cancel?

You: Yes

AI: ❌ Appointment cancelled successfully.

If you'd like to rebook in the future, just let me know!
```

**Check:**
- [ ] Appointment status changed to "cancelled" in database
- [ ] Cancellation email sent
- [ ] Admin dashboard shows cancelled status

---

## TROUBLESHOOTING

### Issue: "Webhook verification failed" in Meta

**Error message:** "The callback URL or verify token couldn't be validated"

**Causes:**
1. Workflow not activated
2. Wrong verify token
3. Wrong webhook URL

**Fixes:**

1. **Check workflow is active:**
   - Go to: https://cwai97.app.n8n.cloud/workflows
   - Find "WhatsApp Serenity Hospital Bot - FIXED"
   - Toggle should be 🟢 green (ON)

2. **Verify token matches:**
   - In n8n: Click "WhatsApp Trigger" node → Credentials → Check "Verify Token"
   - In Meta: Configuration → Webhook → Check "Verify Token" field
   - **Must match exactly** (case-sensitive)

3. **Check webhook URL:**
   - Must be: `https://cwai97.app.n8n.cloud/webhook/whatsapp-serenity-trigger`
   - No extra slashes or characters

4. **Test webhook manually:**
   ```bash
   curl "https://cwai97.app.n8n.cloud/webhook/whatsapp-serenity-trigger"
   ```
   - Should return HTTP 200 or 405 (not connection error)

---

### Issue: "Messages not reaching WhatsApp workflow"

**Symptom:** Send WhatsApp message → No response, no n8n execution

**Fixes:**

1. **Check webhook subscription:**
   - Meta Portal → WhatsApp → Configuration
   - Webhook fields: Ensure ✅ "messages" is checked

2. **Check phone number status:**
   - Meta Portal → WhatsApp → Phone Numbers
   - Status should be: ✅ "Connected"

3. **Check message limits:**
   - Meta Portal → WhatsApp → Phone Numbers → Messaging Limits
   - Ensure you're not rate-limited

4. **Test with Meta test tools:**
   - Meta Portal → WhatsApp → API Setup
   - Use "Send and receive messages" test feature

---

### Issue: "AI responds but appointment not created"

**Symptom:** WhatsApp conversation works, AI confirms booking, but no email or database entry

**Diagnosis steps:**

1. **Check if Groq executed the booking tool:**
   - Go to: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/functions
   - Click "groq-chat" → Logs
   - Search for: "Tool executed: book_appointment_with_confirmation"
   - **If NOT found:** Groq didn't trigger the tool (see Fix A)
   - **If found:** Tool triggered but n8n webhook failed (see Fix B)

**Fix A: Groq not triggering tools**

**Cause:** `mode: "public"` not set in Groq API call

**Solution:**
1. Go to n8n workflow: "WhatsApp Serenity Hospital Bot - FIXED"
2. Click node: "Call Groq Edge Function"
3. Check JSON body has these lines:
   ```json
   "mode": "public",
   "patient_phone": "{{ $json.patient_phone }}",
   ```
4. If missing, add them (see Step 3 above)
5. Click Save
6. Test again

**Fix B: n8n booking webhook not receiving data**

**Cause:** `N8N_WEBHOOK_BASE` environment variable not set or wrong

**Solution:**
1. Check: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/settings/functions
2. Verify: `N8N_WEBHOOK_BASE` = `https://cwai97.app.n8n.cloud/webhook`
3. If wrong, update it
4. **Redeploy Groq function:**
   ```bash
   cd "/Users/odiadev/Desktop/serenity dasboard"
   supabase functions deploy groq-chat
   ```
5. Test again

---

### Issue: "Email confirmations not sending"

**Symptom:** Appointment created in database but no email

**Fixes:**

1. **Check Gmail OAuth:**
   - n8n → Workflows → "Serenity Webhook V2"
   - Click node: "Send Appointment Email"
   - Check credential: "Gmail account"
   - If expired, click "Reconnect" and re-authenticate

2. **Check n8n execution logs:**
   - https://cwai97.app.n8n.cloud/executions
   - Find "Serenity Webhook V2" execution
   - Look for errors on "Send Appointment Email" node
   - Common error: "Invalid grant" (re-authenticate Gmail)

3. **Test email node manually:**
   - Click "Send Appointment Email" node
   - Click "Execute node" button (test icon)
   - Check if email sends

---

### Issue: "Voice messages not transcribing"

**Symptom:** Send voice message → Error: "couldn't process your voice message"

**Fixes:**

1. **Check OpenAI credits:**
   - Go to: https://platform.openai.com/usage
   - Verify you have credits remaining
   - Whisper STT costs ~$0.006 per minute

2. **Check OpenAI credentials:**
   - n8n → "WhatsApp Serenity Hospital Bot - FIXED"
   - Click node: "Transcribe Audio (Whisper)"
   - Verify credential is valid
   - If expired, add new OpenAI API key

3. **Check execution logs:**
   - https://cwai97.app.n8n.cloud/executions
   - Find failed execution
   - Click on "Transcribe Audio (Whisper)" node
   - Read error message

4. **Temporary workaround:**
   - Disable voice support
   - Tell users to send text only
   - You can re-enable after fixing OpenAI

---

## VERIFICATION URLS

**Quick access links for checking status:**

| System | URL | What to Check |
|--------|-----|---------------|
| **n8n Workflows** | https://cwai97.app.n8n.cloud/workflows | Both workflows 🟢 Active |
| **n8n Executions** | https://cwai97.app.n8n.cloud/executions | Recent executions ✅ Success |
| **Supabase Tables** | https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/editor | whatsapp_conversations, appointments |
| **Supabase Functions** | https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/functions | groq-chat logs |
| **Supabase Env Vars** | https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/settings/functions | N8N_WEBHOOK_BASE set |
| **Admin Dashboard** | https://web-rb4xjj4md-odia-backends-projects.vercel.app | Appointments visible |
| **Meta Developer** | https://developers.facebook.com/apps | Webhook verified |

---

## SUCCESS CRITERIA

✅ Your WhatsApp integration is **100% functional** when:

- [ ] Send "Hi" to WhatsApp → AI responds within 5 seconds
- [ ] Book appointment via WhatsApp → Email confirmation sent
- [ ] Appointment appears in admin dashboard calendar
- [ ] Database has entries in `whatsapp_conversations` and `appointments`
- [ ] Reschedule works via WhatsApp
- [ ] Cancel works via WhatsApp
- [ ] Voice messages transcribe (optional)
- [ ] All n8n executions show ✅ green
- [ ] All Supabase function logs show success

---

## NEXT STEPS AFTER WHATSAPP WORKS

### 1. Create Demo Data (15 minutes)

**Goal:** Have realistic data for sales demo

**Actions:**
1. Create 3 sample appointments via WhatsApp
2. Test reschedule flow
3. Test cancel flow
4. Take screenshots of WhatsApp conversation
5. Take screenshots of admin dashboard

---

### 2. Create Demo Script (15 minutes)

**File:** Create `DEMO_SCRIPT.md`

**Content:**
```markdown
# WhatsApp Demo Script (3 minutes)

## Scene 1: Patient Books Appointment (90 seconds)
- Open WhatsApp
- Send: "I want to book an appointment"
- Show AI collecting information
- Show confirmation message
- Switch to email → Show confirmation email

## Scene 2: Admin Views Appointment (30 seconds)
- Open admin dashboard
- Navigate to Calendar
- Show new appointment
- Click appointment → Show details

## Scene 3: Patient Reschedules (45 seconds)
- Back to WhatsApp
- Send: "Reschedule my appointment"
- Show AI processing
- Show confirmation
- Switch to dashboard → Show updated appointment

## Scene 4: Voice Message (15 seconds)
- Send voice message: "What are your hours?"
- Show AI responds with text
```

---

### 3. Record Demo Video (30 minutes)

**Tools needed:**
- Screen recorder (OBS Studio, QuickTime, or Loom)
- Video editor (optional)

**Recording plan:**
1. Record WhatsApp screen (60 seconds)
2. Record email inbox (15 seconds)
3. Record admin dashboard (45 seconds)
4. Edit together with title cards
5. Add voiceover explaining features
6. Export as MP4

---

### 4. Create Sales Collateral (30 minutes)

**One-Page Feature Sheet:**
- ✅ AI appointment booking (web + WhatsApp)
- ✅ Multi-channel support (text + voice)
- ✅ Automated email confirmations
- ✅ Real-time admin dashboard
- ✅ Self-service reschedule/cancel
- ✅ HIPAA-conscious security
- ✅ Nigerian market optimized (+234 numbers)

**Include:**
- Screenshots
- Feature list
- Pricing (if applicable)
- Contact information

---

## YOU'RE READY! 🚀

**Total setup time:** 30-40 minutes
**Demo prep time:** 1-2 hours
**Total to sales-ready:** 2-3 hours

**Your system is 90% done. Just configuration left!**

**Start with:** Step 2 (Add Meta credentials) →  Step 3 (Update Groq call) → Step 6 (Register webhook)

Let me know when you're ready to start, or if you hit any blockers! 💪
