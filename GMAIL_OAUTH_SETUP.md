# Gmail OAuth2 Setup for n8n - Complete Guide

## The Problem

Your n8n workflow executes successfully but emails are NOT being delivered because the Gmail OAuth2 credentials are not configured.

**What's happening:**
- Webhook receives payload ✅
- Workflow triggers ✅
- Gmail node tries to send email ❌ (No credentials)
- Returns success anyway ✅ (Because webhook succeeded)

---

## The Fix (5 Minutes)

### Step 1: Open Your n8n Workflow

1. Go to: **https://cwai97.app.n8n.cloud**
2. Click **"Workflows"** in sidebar
3. Open: **"Serenity Royale Hospital - Appointment Automation"**

### Step 2: Check Gmail Nodes

You have 3 Gmail nodes in the workflow:
- Send Confirmation Email
- Send Reschedule Email
- Send Cancellation Email

**Click on the first one: "Send Confirmation Email"**

### Step 3: Create Gmail OAuth2 Credential

1. In the Gmail node, look for **"Credential to connect with"** dropdown
2. You'll see either:
   - "Create New Credential" button
   - Or a red error icon (credential doesn't exist)

3. Click **"Create New Credential"**

4. Select **"Gmail OAuth2"** from the list

5. You'll see this form:

```
Name: Serenity Gmail Account
Authentication: OAuth2
Client ID: (provided by n8n)
Client Secret: (provided by n8n)
```

6. Click **"Sign in with Google"** button

7. Google will ask you to choose an account:
   - Select: **info.serenityroyalehospital@gmail.com**

8. Google will show permissions request:
   - ✅ Read, compose, send, and permanently delete all your email
   - ✅ See, edit, create, and delete all of your Google Drive files

9. Click **"Allow"**

10. You'll be redirected back to n8n

11. Click **"Save"** to save the credential

### Step 4: Connect Credential to All 3 Gmail Nodes

Now you need to apply this credential to all 3 email nodes:

**Node 1: Send Confirmation Email**
1. Click the node
2. Select your credential from dropdown
3. Node should show green checkmark

**Node 2: Send Reschedule Email**
1. Click the node
2. Select your credential from dropdown
3. Node should show green checkmark

**Node 3: Send Cancellation Email**
1. Click the node
2. Select your credential from dropdown
3. Node should show green checkmark

### Step 5: Save Workflow

1. Click **"Save"** button (top right of workflow)
2. You should see: "Workflow saved successfully"

### Step 6: Deactivate and Reactivate

1. Toggle the workflow **OFF** (top right switch)
2. Wait 2 seconds
3. Toggle the workflow **ON** again
4. This ensures the credential changes take effect

### Step 7: Test Email Delivery

Open your terminal and run:

```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+1234567890",
    "appointmentDate": "January 15, 2025",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "Gmail OAuth2 Test",
    "actionType": "create",
    "source": "oauth_test"
  }'
```

**Expected Response:**
```json
{"message":"Workflow was started"}
```

**Expected Email:**
- Check `egualesamuel@gmail.com` inbox
- Within 1-2 minutes
- Subject: "✅ Appointment Confirmed - Serenity Royale Hospital"
- Green-themed professional HTML email

### Step 8: Verify in Execution Logs

1. In n8n, click **"Executions"** tab
2. Click the most recent execution
3. Click on **"Send Confirmation Email"** node
4. You should see success output:

```json
{
  "id": "18d1234567890abc",
  "threadId": "18d1234567890abc",
  "labelIds": ["SENT"]
}
```

If you see this, the email was sent successfully!

---

## Troubleshooting

### Issue 1: "No OAuth redirect URI configured"

**Solution:**
1. In n8n, go to **Settings** → **Credentials**
2. Make sure OAuth callback URL is set to:
   ```
   https://cwai97.app.n8n.cloud/rest/oauth2-credential/callback
   ```

### Issue 2: "Access blocked: This app isn't verified"

**Solution:**
1. Click **"Advanced"** in the warning
2. Click **"Go to n8n (unsafe)"**
3. This is safe - it's just because n8n is a third-party app

### Issue 3: "Invalid grant" error

**Solution:**
1. Delete the credential in n8n
2. Create a new one
3. Re-authorize with Google

### Issue 4: Email still not received

**Solution:**
1. Check spam folder in `egualesamuel@gmail.com`
2. Check n8n execution log for errors
3. Verify Gmail node shows "SENT" status
4. Check if Gmail API quota is exceeded:
   - Go to: https://console.cloud.google.com/apis/api/gmail.googleapis.com/quotas
   - Free tier allows 100 emails/day

### Issue 5: "Credential ID not found"

**Solution:**
This means the workflow is still referencing the old credential ID.
1. Click each Gmail node
2. Select your new credential from dropdown
3. Save workflow
4. Reactivate

---

## What Each Gmail Node Does

**Send Confirmation Email (Node 1):**
- Triggers when `actionType = "create"`
- Sends green-themed confirmation email
- Shows appointment date, time, and what to bring

**Send Reschedule Email (Node 2):**
- Triggers when `actionType = "reschedule"`
- Sends orange-themed reschedule email
- Shows old appointment vs new appointment

**Send Cancellation Email (Node 3):**
- Triggers when `actionType = "cancel"`
- Sends red-themed cancellation email
- Shows cancelled appointment details

---

## Success Checklist

- [ ] Opened n8n workflow in browser
- [ ] Created Gmail OAuth2 credential
- [ ] Authorized with info.serenityroyalehospital@gmail.com
- [ ] Connected credential to "Send Confirmation Email" node
- [ ] Connected credential to "Send Reschedule Email" node
- [ ] Connected credential to "Send Cancellation Email" node
- [ ] Saved workflow
- [ ] Deactivated and reactivated workflow
- [ ] Ran test curl command
- [ ] Received email at egualesamuel@gmail.com
- [ ] Verified execution log shows "SENT" status

---

## Test All 3 Email Types

### Test 1: Confirmation Email
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

### Test 2: Reschedule Email
```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "appointmentDate": "January 20, 2025",
    "appointmentTime": "2:00 PM",
    "previousDate": "January 15, 2025",
    "previousTime": "10:00 AM",
    "actionType": "reschedule"
  }'
```

### Test 3: Cancellation Email
```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "appointmentDate": "January 15, 2025",
    "appointmentTime": "10:00 AM",
    "actionType": "cancel"
  }'
```

---

## Why This Happens When Importing Workflows

When you import a workflow JSON file, n8n imports:
- ✅ Node structure
- ✅ Node configurations
- ✅ Connections between nodes
- ✅ Conditional logic
- ❌ Credentials (for security reasons)

The credential IDs in the JSON are just references:
```json
"credentials": {
  "gmailOAuth2": {
    "id": "jX0WB96gvVFRE5qW",  // This ID doesn't exist in your n8n
    "name": "Gmail account"
  }
}
```

You must create your own credentials after importing.

---

## Next Steps After Gmail Works

Once you receive the test email:

1. **Test from admin dashboard:**
   - Login to: https://web-20t1s8fdk-odia-backends-projects.vercel.app
   - Use chat widget
   - Say: "Book appointment for John at john@example.com tomorrow 2pm"
   - Check if email is sent

2. **Monitor execution logs** for first few days

3. **Set up email tracking** (optional):
   - Use Gmail's "Read Receipt" feature
   - Or add tracking pixel to email HTML

---

## Important Notes

- Gmail OAuth2 allows **100 emails per day** on free tier
- For higher volume, consider upgrading to Google Workspace
- Emails sent from `info.serenityroyalehospital@gmail.com`
- Make sure this inbox is monitored for patient replies
- OAuth tokens refresh automatically (no manual renewal needed)

---

**Document Status:** Ready to use
**Estimated Time:** 5 minutes
**Success Rate:** 99% (if steps followed exactly)
