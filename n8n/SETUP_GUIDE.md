# n8n Workflow Setup Guide

## Overview
This guide will help you import and configure the Enhanced Serenity Dashboard Workflow in your n8n instance.

---

## Step 1: Import Workflow into n8n

1. **Login to n8n**
   - Visit: https://cwai97.app.n8n.cloud
   - Login with your credentials

2. **Import the Workflow**
   - Click **"Add Workflow"** (+ button in top right)
   - Select **"Import from File"** or **"Import from URL"**
   - Upload: `ENHANCED_SERENITY_WORKFLOW.json`
   - The workflow will open in the editor

---

## Step 2: Configure Twilio Credentials

Your Twilio WhatsApp/SMS number: **+12526453035**

### Option A: If Twilio Credentials Already Exist

1. In n8n, click **"Credentials"** in the left sidebar
2. Find "Twilio Account" credential
3. Verify it contains:
   - **Account SID**: Your Twilio Account SID
   - **Auth Token**: Your Twilio Auth Token
4. The workflow will automatically use this credential (ID: "1")

### Option B: Create New Twilio Credentials

1. In n8n, click **"Credentials"** → **"Add Credential"**
2. Search for **"Twilio"**
3. Fill in:
   - **Credential Name**: "Twilio Account"
   - **Account SID**: [Your Twilio SID from dashboard]
   - **Auth Token**: [Your Twilio Token from dashboard]
4. Click **"Save"**

**Note:** All Twilio nodes in the workflow are already configured to use `+12526453035` as the default number!

---

## Step 3: Configure Gmail Credentials

### Enable Gmail API

1. In n8n, click **"Credentials"** → **"Add Credential"**
2. Search for **"Gmail OAuth2"**
3. Fill in:
   - **Credential Name**: "Gmail Account"
   - **Client ID**: [From Google Cloud Console]
   - **Client Secret**: [From Google Cloud Console]
4. Click **"Sign in with Google"**
5. Authorize n8n to send emails

**Need Google OAuth credentials?**
- Visit: https://console.cloud.google.com
- Enable Gmail API
- Create OAuth 2.0 Client ID
- Add redirect URI: Your n8n OAuth callback URL

---

## Step 4: Configure Supabase Credentials

### Connect to Supabase

1. In n8n, click **"Credentials"** → **"Add Credential"**
2. Search for **"Supabase"**
3. Fill in:
   - **Credential Name**: "Supabase Connection"
   - **Host**: `https://yfrpxqvjshwaaomgcaoq.supabase.co`
   - **Service Role Secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.Gq3vNhC8bZWqGHECwOyQpXZGHKW8x-RZX0sqNwx_YjQ`
4. Click **"Save"**

---

## Step 5: Fix Node Configurations

### Fix "Save Message to Database" Node (Currently Showing Error)

The node in your screenshot shows it needs configuration. Here's how to fix it:

1. **Click on the "Save Message to Database" node**
2. **Configure parameters:**
   - **Authentication**: Service Account (use the Supabase credential)
   - **Resource**: Database
   - **Operation**: Insert
   - **Table Name**: `messages`

3. **Add Fields to Send:**
   Click **"Add Field"** for each:

   | Field Name | Value |
   |------------|-------|
   | `conversation_id` | `={{$json.body.conversation_id}}` |
   | `content` | `={{$json.body.message}}` |
   | `sender` | `assistant` |
   | `channel` | `={{$json.body.channel}}` |

4. Click **"Save"**

### Fix "Create Appointment (Supabase)" Node

1. **Click on the node**
2. **Configure:**
   - **Authentication**: Service Account
   - **Resource**: Database
   - **Operation**: Insert
   - **Table Name**: `appointments`

3. **Add Fields:**

   | Field Name | Value |
   |------------|-------|
   | `patient_name` | `={{$json.body.patient_name \|\| $json.body.patientName}}` |
   | `patient_email` | `={{$json.body.patient_email \|\| $json.body.patientEmail}}` |
   | `patient_phone` | `={{$json.body.patient_phone \|\| $json.body.patientPhone \|\| $json.body.phone}}` |
   | `appointment_date` | `={{$json.body.appointment_date \|\| $json.body.appointmentDate \|\| $json.body.date}}` |
   | `appointment_time` | `={{$json.body.appointment_time \|\| $json.body.appointmentTime \|\| $json.body.time}}` |
   | `reason` | `={{$json.body.reason \|\| $json.body.appointmentReason \|\| 'General consultation'}}` |
   | `status` | `confirmed` |

---

## Step 6: Activate the Workflow

1. **Test the Webhook**
   - Click on the **"Webhook Trigger"** node
   - Copy the **Production URL** (will look like: `https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2`)
   - Click **"Listen for Test Event"**

2. **Activate the Workflow**
   - Toggle the **"Active"** switch in top right
   - The workflow is now live!

---

## Step 7: Update Frontend to Use n8n Webhook

Update your `.env` file with the n8n webhook URL:

```bash
# In .env.production or .env
VITE_N8N_WEBHOOK_BASE=https://cwai97.app.n8n.cloud/webhook
```

Then redeploy to Vercel.

---

## Workflow Actions Supported

The workflow handles these actions from the AI assistant:

### 1. `send_whatsapp`
```json
{
  "action": "send_whatsapp",
  "phone": "+2348012345678",
  "message": "Hello from Serenity Hospital!"
}
```

### 2. `send_sms`
```json
{
  "action": "send_sms",
  "phone": "+2348012345678",
  "message": "Appointment reminder: Tomorrow at 2pm"
}
```

### 3. `send_email`
```json
{
  "action": "send_email",
  "email": "patient@example.com",
  "subject": "Appointment Confirmation",
  "message": "Your appointment is confirmed..."
}
```

### 4. `send_message` (Auto-routes to WhatsApp or SMS)
```json
{
  "action": "send_message",
  "channel": "whatsapp",
  "phone": "+2348012345678",
  "message": "Your test results are ready",
  "conversation_id": "uuid-here"
}
```

### 5. `book_appointment`
```json
{
  "action": "book_appointment",
  "patient_name": "John Doe",
  "patient_email": "john@example.com",
  "patient_phone": "+2348012345678",
  "appointment_date": "2025-01-15",
  "appointment_time": "14:00",
  "reason": "General checkup"
}
```

---

## Testing the Workflow

### Test 1: Send WhatsApp Message

```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_whatsapp",
    "phone": "+2348012345678",
    "message": "Test message from n8n workflow!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Action completed successfully",
  "action": "send_whatsapp",
  "timestamp": "2025-01-09T..."
}
```

### Test 2: Book Appointment

```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "patient_name": "Jane Smith",
    "patient_email": "jane@example.com",
    "patient_phone": "+2348012345678",
    "appointment_date": "2025-01-20",
    "appointment_time": "10:00",
    "reason": "Follow-up consultation"
  }'
```

**Expected:**
- Appointment created in Supabase
- Confirmation email sent via Gmail
- SMS sent via Twilio
- Success response returned

---

## Troubleshooting

### Issue: "Problem running workflow - Please resolve outstanding issues"

**Cause:** Missing credentials or incorrect table configuration

**Fix:**
1. Check all nodes have credentials assigned
2. Verify Supabase table names match your database:
   - `messages` table exists
   - `appointments` table exists
3. Test each credential individually

### Issue: WhatsApp Messages Not Sending

**Cause:** Twilio WhatsApp number not activated

**Fix:**
1. Visit Twilio Console → WhatsApp → Senders
2. Verify `+12526453035` is activated for WhatsApp
3. Check WhatsApp templates are approved
4. Ensure recipient opted in to receive WhatsApp messages

### Issue: "Table 'messages' does not exist"

**Cause:** Supabase database schema not applied

**Fix:**
```bash
cd /Users/odiadev/Desktop/serenity\ dasboard
supabase db push
```

### Issue: Credentials Not Found

**Cause:** Credential IDs don't match workflow

**Fix:**
1. After creating credentials, note their IDs
2. Update workflow nodes to reference correct credential IDs
3. Or manually reconnect credentials in each node

---

## Credential Summary

| Service | Name | Type | Used In Nodes |
|---------|------|------|---------------|
| **Twilio** | Twilio Account | API Credentials | 5 nodes (WhatsApp/SMS) |
| **Gmail** | Gmail Account | OAuth2 | 2 nodes (Email) |
| **Supabase** | Supabase Connection | Service Account | 2 nodes (Database) |

---

## Node Summary

| Node Name | Purpose | Requires |
|-----------|---------|----------|
| Webhook Trigger | Receives POST requests | None |
| IF Send WhatsApp | Routes WhatsApp actions | None |
| IF Send SMS | Routes SMS actions | None |
| IF Send Email | Routes Email actions | None |
| IF Send Message | Routes generic messages | None |
| IF Book Appointment | Routes appointment actions | None |
| Send WhatsApp (Twilio) | Sends WhatsApp via Twilio | Twilio Cred |
| Send SMS (Twilio) | Sends SMS via Twilio | Twilio Cred |
| Send Email (Gmail) | Sends email via Gmail | Gmail Cred |
| IF Channel WhatsApp | Checks message channel | None |
| IF Channel SMS | Checks message channel | None |
| Send Message WhatsApp | Sends in-thread WhatsApp | Twilio Cred |
| Send Message SMS | Sends in-thread SMS | Twilio Cred |
| Create Appointment (Supabase) | Creates appointment record | Supabase Cred |
| Send Appointment Email | Sends confirmation email | Gmail Cred |
| Send Appointment SMS | Sends confirmation SMS | Twilio Cred |
| Save Message to Database | Saves message to DB | Supabase Cred |
| Respond Success | Returns success response | None |
| Respond Error | Returns error response | None |

---

## Next Steps After Setup

1. ✅ Import workflow into n8n
2. ✅ Configure all 3 credentials (Twilio, Gmail, Supabase)
3. ✅ Fix any red error nodes
4. ✅ Activate the workflow
5. ✅ Update frontend `.env` with webhook URL
6. ✅ Test each action type
7. ✅ Monitor execution logs in n8n

---

## Support

If you encounter issues:

1. **Check n8n Execution Logs**
   - Click "Executions" in n8n sidebar
   - View failed executions
   - Check error messages

2. **Verify Credentials**
   - Test each credential individually
   - Ensure API quotas not exceeded
   - Check service status pages

3. **Review Supabase Logs**
   ```bash
   supabase functions logs groq-chat --follow
   ```

---

**Setup Date:** 2025-01-09
**Workflow Version:** 1.0
**Your Twilio Number:** +12526453035 (WhatsApp & SMS)
**n8n Instance:** https://cwai97.app.n8n.cloud
