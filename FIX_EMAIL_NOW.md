# FIX EMAIL DELIVERY - DO THIS NOW (5 Minutes)

## The Problem
Emails are NOT being sent because Gmail OAuth2 is NOT configured in your n8n.

## The Solution - Follow These Steps EXACTLY

### Step 1: Open n8n
Go to: **https://cwai97.app.n8n.cloud**

### Step 2: Open Your Workflow
- Click "Workflows" in left sidebar
- Find: **"Serenity Royale Hospital - Appointment Automation"**
- Click to open it

### Step 3: Click First Gmail Node
- You'll see 3 green nodes labeled:
  - "Send Confirmation"
  - "Send Reschedule"
  - "Send Cancellation"
- Click on **"Send Confirmation"**

### Step 4: Create Gmail Credential
- Look for dropdown: **"Credential to connect with"**
- Click **"Create New Credential"**
- Choose: **"Gmail OAuth2"**
- Click **"Sign in with Google"**
- Choose account: **info.serenityroyalehospital@gmail.com**
- Click **"Allow"** when Google asks for permissions
- Click **"Save"**

### Step 5: Connect to Other 2 Gmail Nodes
- Click **"Send Reschedule"** node
- Select your credential from dropdown
- Click **"Send Cancellation"** node
- Select your credential from dropdown

### Step 6: Save Workflow
- Click **"Save"** button (top right)
- Toggle workflow **OFF**
- Wait 2 seconds
- Toggle workflow **ON**

### Step 7: Test It
Run this in your terminal:

```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "appointmentDate": "January 15, 2025",
    "appointmentTime": "10:00 AM",
    "actionType": "create"
  }'
```

**Check your email:** egualesamuel@gmail.com

You should receive: "✅ Appointment Confirmed - Serenity Royale Hospital"

---

## That's It!

Once you do this, all emails will work:
- ✅ Confirmation emails
- ✅ Reschedule emails
- ✅ Cancellation emails

No code changes needed. Just configure the Gmail credential in n8n.
