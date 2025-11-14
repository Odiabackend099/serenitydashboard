# WhatsApp Meta Business API - 12-Hour Activation Guide

**Status:** Ready to Connect
**Platform:** Meta WhatsApp Business API (NOT Twilio)
**Target:** Fully functional WhatsApp appointment booking by tomorrow

---

## CURRENT SETUP STATUS

### ✅ What's Already Done:
1. **n8n WhatsApp workflow created** (`WhatsApp Serenity Hospital Bot - FIXED.json`)
2. **WhatsApp nodes configured** with Phone Number ID: `825467040645950`
3. **Groq AI integration** working in workflow
4. **Voice message support** (Whisper STT + OpenAI TTS)
5. **Error handling** for all message types

### ⚠️ What's Missing:
1. **Appointment booking integration** - WhatsApp not connected to booking workflow
2. **Meta webhook verification** - Needs to be registered with Meta
3. **Database conversation tracking** - WhatsApp messages not saved to `conversations` table

---

## STEP 1: GATHER YOUR META CREDENTIALS (5 minutes)

You mentioned you have Meta WhatsApp credentials. I need these exact values:

### Required Credentials:

1. **WhatsApp Phone Number ID**
   - Already in workflow: `825467040645950`
   - Location: Meta Business Manager → WhatsApp → Phone Numbers

2. **WhatsApp Business Account ID (WABA ID)**
   - Format: `123456789012345`
   - Location: Meta Business Manager → Settings → Business Info

3. **Access Token (Permanent)**
   - Format: `EAAG...` (very long string)
   - Location: Meta Business Manager → System Users → Generate Token
   - Permissions needed: `whatsapp_business_messaging`, `whatsapp_business_management`

4. **Webhook Verify Token** (you create this)
   - Can be any random string (e.g., `serenity_webhook_verify_2025`)
   - Used to verify webhook with Meta

5. **App Secret** (from Meta Developer Portal)
   - Format: `abc123def456...`
   - Location: Meta App Dashboard → Settings → Basic → App Secret

---

## STEP 2: UPDATE N8N WORKFLOW (15 minutes)

### Current Workflow Analysis:

**File:** `n8n/WhatsApp Serenity Hospital Bot - FIXED.json`

**Current Flow:**
```
WhatsApp Message → Groq AI → WhatsApp Response
```

**Needed Flow:**
```
WhatsApp Message → Groq AI (with booking tools) → Book Appointment → WhatsApp Response
```

### Changes Needed:

#### A. Update Groq Edge Function Call (Node: "Call Groq Edge Function")

**Current:** Calls Groq with basic system prompt
**Needed:** Add appointment booking tools to Groq call

**Modification:**
```json
{
  "messages": [...],
  "mode": "public",
  "tools_enabled": true,  // ADD THIS
  "patient_phone": "{{ $json.patient_phone }}",
  "channel": "whatsapp",  // ADD THIS
  "conversation_id": "{{ $json.conversation_id }}"  // ADD THIS
}
```

#### B. Add Conversation Tracking (New Node after "Debug Incoming Data")

**Node Name:** "Find or Create Conversation"
**Type:** HTTP Request
**Method:** POST
**URL:** `https://yfrpxqvjshwaaomgcaoq.supabase.co/rest/v1/rpc/find_or_create_conversation`

**Body:**
```json
{
  "p_channel": "whatsapp",
  "p_patient_ref": "{{ $json.contacts[0].wa_id }}",
  "p_metadata": {
    "whatsapp_name": "{{ $json.contacts[0].profile.name }}",
    "phone_number_id": "{{ $json.metadata.phone_number_id }}"
  }
}
```

#### C. Add Message Logging (New Node after Groq response)

**Node Name:** "Log Messages to Database"
**Type:** Supabase
**Operation:** Insert
**Table:** `messages`

**Fields:**
- `conversation_id`: `{{ $('Find or Create Conversation').item.json.id }}`
- `from_role`: `patient` (for incoming), `ai` (for outgoing)
- `body`: `{{ $json.user_message }}` or `{{ $json.response }}`
- `metadata`: `{"whatsapp_message_id": "{{ $json.messages[0].id }}"}`

---

## STEP 3: CONFIGURE META WEBHOOK (10 minutes)

### A. Get Your n8n Webhook URL

Your n8n WhatsApp workflow webhook URL should be:
```
https://[your-n8n-instance].app.n8n.cloud/webhook/whatsapp-serenity-trigger
```

### B. Register Webhook with Meta

1. Go to: https://developers.facebook.com/apps
2. Select your WhatsApp app
3. Navigate to: **WhatsApp → Configuration → Webhook**
4. Click **Edit**

**Callback URL:**
```
https://[your-n8n-instance].app.n8n.cloud/webhook/whatsapp-serenity-trigger
```

**Verify Token:**
```
serenity_webhook_verify_2025
```
(Or whatever token you chose in Step 1)

5. Click **Verify and Save**

6. **Subscribe to Fields:**
   - ✅ `messages` (required)
   - ✅ `message_status` (optional)
   - ✅ `messaging_postbacks` (optional)

### C. Test Webhook

Meta will send a test POST request. Your n8n workflow should automatically handle it.

**Check n8n execution logs** - you should see a successful execution.

---

## STEP 4: CONNECT WHATSAPP TO BOOKING SYSTEM (20 minutes)

### Option A: Modify Existing Groq Edge Function

**File:** `supabase/functions/groq-chat/index.ts`

**Current behavior:** Web chat only
**Needed:** Support WhatsApp channel

**Changes:**

1. **Accept `channel` parameter:**
```typescript
const { messages, mode, channel = 'webchat', conversation_id } = await req.json();
```

2. **Save responses to database** (for WhatsApp):
```typescript
if (channel === 'whatsapp' && conversation_id) {
  await supabase.from('messages').insert({
    conversation_id,
    from_role: 'ai',
    body: aiResponse,
    metadata: { channel: 'whatsapp', timestamp: new Date().toISOString() }
  });
}
```

3. **Trigger n8n webhook** when appointment is booked:
```typescript
if (toolName === 'book_appointment_with_confirmation') {
  await fetch('https://[your-n8n].app.n8n.cloud/webhook/serenity-webhook-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'book_appointment',
      body: {
        ...appointmentData,
        channel: 'whatsapp',
        patient_phone: patientPhone  // from WhatsApp
      }
    })
  });
}
```

### Option B: Use Existing n8n Booking Workflow (FASTER)

**Your existing workflow:** `Serenity Workflow - Ready to Import.json`

**Already supports:**
- ✅ `book_appointment` action
- ✅ `reschedule_appointment` action
- ✅ `cancel_appointment` action

**Just needs:** WhatsApp to call this webhook when Groq returns booking intent

**Add HTTP Request node in WhatsApp workflow:**

**Node Name:** "Trigger Booking Workflow"
**Type:** HTTP Request
**Conditions:** When `$json.response` contains appointment booking confirmation

**URL:** `https://[your-n8n].app.n8n.cloud/webhook/serenity-webhook-v2`
**Method:** POST
**Body:**
```json
{
  "action": "book_appointment",
  "body": {
    "patient_name": "{{ $json.patient_name }}",
    "patient_email": "{{ $json.patient_email }}",
    "patient_phone": "{{ $json.patient_phone }}",
    "appointment_date": "{{ $json.appointment_date }}",
    "appointment_time": "{{ $json.appointment_time }}",
    "reason": "{{ $json.reason }}",
    "channel": "whatsapp",
    "conversation_id": "{{ $json.conversation_id }}"
  }
}
```

---

## STEP 5: TEST END-TO-END (10 minutes)

### Test Script:

1. **Send WhatsApp message to your number:**
   ```
   Hi, I want to book an appointment
   ```

2. **AI should respond:**
   ```
   Hello! I'd be happy to help you book an appointment.
   May I have your full name?
   ```

3. **Continue conversation:**
   ```
   My name is John Doe
   ```
   ```
   Email: john@example.com
   ```
   ```
   Phone: +2348123456789
   ```
   ```
   Date: tomorrow
   ```
   ```
   Time: 2pm
   ```
   ```
   Reason: checkup
   ```

4. **AI should confirm booking:**
   ```
   ✅ Appointment booked successfully!

   📅 Date: [date]
   🕐 Time: 2:00 PM
   📋 Reason: checkup

   You'll receive an email confirmation shortly.
   Please arrive 10 minutes early.
   ```

5. **Check email inbox** - Should receive confirmation within 2 minutes

6. **Check admin dashboard** - Appointment should appear in calendar

---

## STEP 6: ENABLE RESCHEDULE/CANCEL (Already Built!)

**Good news:** Your n8n workflow **already has reschedule and cancel** flows!

**Workflow nodes:**
- `Update Rescheduled Appointment` (line 572)
- `Send Reschedule Email` (line 598)
- `Update Cancelled Appointment` (line 658)
- `Send Cancellation Email` (line 684)

**What's needed:**
1. Groq AI needs to extract `appointment_id` from patient
2. WhatsApp workflow calls n8n with `reschedule_appointment` or `cancel_appointment` action

**Example conversation:**
```
Patient: I want to reschedule my appointment
AI: I can help with that. What's your email address?
Patient: john@example.com
AI: I found your appointment for Nov 15 at 2pm. What's the new date and time?
Patient: Nov 20 at 3pm
AI: ✅ Rescheduled successfully! New appointment: Nov 20 at 3:00 PM
```

---

## QUICK START (Next 30 Minutes)

### Priority Tasks:

1. ✅ **Import WhatsApp workflow to your n8n instance** (if not already done)
2. ✅ **Add Meta credentials** to n8n WhatsApp nodes
3. ✅ **Register webhook with Meta**
4. ✅ **Test basic WhatsApp → AI response**
5. ⏳ **Add conversation tracking** (database logging)
6. ⏳ **Connect to booking workflow**
7. ⏳ **Test full booking flow**

---

## CREDENTIALS CHECKLIST

Before proceeding, confirm you have:

- [ ] WhatsApp Phone Number ID: `825467040645950` (already in workflow)
- [ ] WhatsApp Business Account ID (WABA)
- [ ] Permanent Access Token (starts with `EAAG...`)
- [ ] Webhook Verify Token (create your own)
- [ ] App Secret (from Meta Developer Portal)
- [ ] n8n instance URL
- [ ] Supabase project URL: `https://yfrpxqvjshwaaomgcaoq.supabase.co`
- [ ] Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## NEXT STEPS

**Reply with:**
1. Your n8n instance URL (e.g., `https://cwai97.app.n8n.cloud`)
2. Confirmation that Meta credentials are ready
3. Any errors you're seeing

I'll then provide the **exact node configurations** to paste into your n8n workflow.

---

**Estimated Time to WhatsApp Booking:** 1-2 hours (from this point)
**Difficulty:** Medium (mostly configuration, minimal coding)
