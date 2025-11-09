# How to Import the Fixed Workflow

## File to Import
📁 **`n8n/IMPORT_THIS_WORKFLOW.json`**

This file contains a COMPLETE, READY-TO-USE workflow with:
- ✅ All nodes properly configured
- ✅ Expression mode enabled on all Supabase fields
- ✅ Correct field mappings
- ✅ All 5 workflow actions (send_whatsapp, send_sms, send_email, send_message, book_appointment)

---

## Import Steps (2 minutes)

### Step 1: Go to n8n Cloud
Open: https://cwai97.app.n8n.cloud

### Step 2: Import the Workflow
1. Click **"Workflows"** in the left sidebar
2. Click the **"+"** button (top right)
3. Select **"Import from File"** or **"Import from URL"**
4. Choose the file: **`n8n/IMPORT_THIS_WORKFLOW.json`**
5. Click **"Import"**

### Step 3: Configure Credentials
The workflow will import with placeholder credential IDs. You need to link them to your actual credentials:

#### A. Twilio Credentials (3 nodes)
Nodes that need Twilio:
- Send WhatsApp
- Send SMS
- Send via WhatsApp
- Send via SMS
- Send Appointment SMS

**For each node:**
1. Click the node
2. Find "Credential to connect with"
3. Select your existing **"serenity"** Twilio credential
4. Save

#### B. Gmail Credentials (2 nodes)
Nodes that need Gmail:
- Send Email
- Send Appointment Email

**For each node:**
1. Click the node
2. Find "Credential to connect with"
3. Select your existing **"Gmail account"** credential
4. Save

#### C. Supabase Credentials (2 nodes)
Nodes that need Supabase:
- Save to Database
- Create Appointment

**For each node:**
1. Click the node
2. Find "Credential to connect with"
3. Select your existing **"srh"** Supabase credential
4. Save

### Step 4: Activate the Workflow
1. Click the **toggle switch** at the top (should turn green)
2. The workflow is now ACTIVE ✅

### Step 5: Test the Workflow
Run the automated test:

```bash
cd "/Users/odiadev/Desktop/serenity dasboard"
./auto-fix-and-test.sh
```

**Expected Output:**
```
✅ Found X test message(s) in database!
✅ Found X test appointment(s) in database!

✅ SUCCESS! Workflow is working perfectly!
```

---

## What's Included in This Workflow

### Actions Supported:
1. **send_whatsapp** - Send WhatsApp via Twilio
2. **send_sms** - Send SMS via Twilio
3. **send_email** - Send email via Gmail
4. **send_message** - Send message + save to database (routes by channel)
5. **book_appointment** - Create appointment + send SMS + send email

### Nodes Configured:
- ✅ Webhook Trigger (`serenity-webhook-v2`)
- ✅ Route by Action (Switch node)
- ✅ Route by Channel (Switch node)
- ✅ Send WhatsApp (Twilio)
- ✅ Send SMS (Twilio)
- ✅ Send Email (Gmail)
- ✅ Send via WhatsApp (Twilio)
- ✅ Send via SMS (Twilio)
- ✅ **Save to Database (Supabase) - FIXED** ✅
- ✅ **Create Appointment (Supabase) - FIXED** ✅
- ✅ Send Appointment SMS (Twilio)
- ✅ Send Appointment Email (Gmail)
- ✅ Respond Success (Webhook Response)

### Database Fields (Properly Configured):

**messages table:**
```json
{
  "conversation_id": "={{ $json.body.conversation_id }}",
  "body": "={{ $json.body.message }}",
  "from_type": "ai"
}
```

**appointments table:**
```json
{
  "conversation_id": "={{ $json.body.conversation_id }}",
  "patient_ref": "={{ $json.body.patient_ref || $json.body.phone }}",
  "patient_name": "={{ $json.body.patient_name || $json.body.patientName }}",
  "patient_email": "={{ $json.body.patient_email || $json.body.patientEmail }}",
  "patient_phone": "={{ $json.body.patient_phone || $json.body.patientPhone || $json.body.phone }}",
  "appointment_date": "={{ $json.body.appointment_date || $json.body.appointmentDate || $json.body.date }}",
  "appointment_time": "={{ $json.body.appointment_time || $json.body.appointmentTime || $json.body.time }}",
  "appointment_type": "={{ $json.body.appointment_type || 'consultation' }}",
  "reason": "={{ $json.body.reason || $json.body.appointmentReason || 'General consultation' }}"
}
```

---

## Troubleshooting

### If credentials don't connect:
1. Make sure your credentials exist in n8n:
   - Twilio: Named "serenity"
   - Gmail: Named "Gmail account"
   - Supabase: Named "srh"

2. If they don't exist, create them:
   - Go to **Credentials** in left sidebar
   - Click **"Add Credential"**
   - Select the service type
   - Enter your credentials

### If the webhook path changes:
The webhook path is: `/webhook/serenity-webhook-v2`

If n8n changes it, update your frontend `.env`:
```
VITE_N8N_WEBHOOK_BASE=https://cwai97.app.n8n.cloud
```

---

## After Import Checklist

- [ ] Workflow imported successfully
- [ ] Twilio credentials linked (5 nodes)
- [ ] Gmail credentials linked (2 nodes)
- [ ] Supabase credentials linked (2 nodes)
- [ ] Workflow activated (toggle ON)
- [ ] Test script run: `./auto-fix-and-test.sh`
- [ ] Test messages created in database ✅
- [ ] Test appointments created in database ✅

---

## Success Criteria

When you run `./auto-fix-and-test.sh`, you should see:

```
Step 2: Testing send_message Action (WhatsApp)...
   ✅ HTTP 200 - Success

Step 3: Testing send_message Action (SMS)...
   ✅ HTTP 200 - Success

Step 4: Testing book_appointment Action...
   ✅ HTTP 200 - Success

Step 5: Verifying Database Records...
   ✅ Found 2 test message(s) in database!
   ✅ Found 1 test appointment(s) in database!

✅ SUCCESS! Workflow is working perfectly!
```

---

**Total Time to Import:** 2 minutes
**Configuration Required:** Link 3 credentials (Twilio, Gmail, Supabase)
**Testing Time:** 10 seconds (automated)

🎉 **You're done!**
