# 📧 Email Not Sending - Troubleshooting Guide

**Issue:** Workflow executes successfully but emails are not received

---

## 🔍 Quick Diagnosis

### Step 1: Check Gmail Credentials (MOST COMMON ISSUE)

**Problem:** Gmail OAuth2 token expires after some time

**Fix:**
1. Go to N8N workflow: https://cwai97.app.n8n.cloud/workflow/UZvAy2tTj8fPWcDZ
2. Click on any **Gmail node**:
   - Send Email
   - Send Appointment Email
   - Send Reschedule Email
   - Send Cancellation Email
3. Look for **Gmail OAuth2** credential
4. Click the credential dropdown
5. Click **"Reconnect"** or **"Test credential"**
6. If test fails, click **"Delete credential"** and create new:
   - Click **"+ Add Gmail OAuth2 API"**
   - Sign in with your Gmail account
   - Grant all permissions
   - Save
7. **Save the workflow** (Ctrl+S or Cmd+S)
8. Test again

---

### Step 2: Check Execution Logs

**What to look for:**

1. Go to: https://cwai97.app.n8n.cloud/workflow/UZvAy2tTj8fPWcDZ/executions
2. Click on the **most recent execution** (Nov 12, 23:08:42)
3. Check which nodes executed:
   - ✅ Green = Executed successfully
   - 🔴 Red = Error occurred
   - ⚪ Grey = Skipped (not executed)

**Expected Flow for "book_appointment":**
```
Webhook Trigger (green)
  ↓
Route by Action (green)
  ↓
Create Appointment (green)
  ↓
Send Appointment Email (green) ← Check this!
  ↓
Send Appointment SMS (green)
  ↓
Respond Success (green)
```

**If "Send Appointment Email" is:**
- 🔴 **Red (Error):** Click it to see error message
- ⚪ **Grey (Skipped):** The route didn't execute this path
- ✅ **Green:** Email sent successfully (check spam folder)

---

### Step 3: Test Email Directly

Run this test script:

```bash
cd "/Users/odiadev/Desktop/serenity dasboard"
./test-email-only.sh
```

**Expected Output:**
```
✅ Webhook executed successfully!

Check:
1. Email: egualesamuel@gmail.com (inbox & spam)
2. N8N Execution logs
```

Then check:
1. **Inbox:** egualesamuel@gmail.com
2. **Spam folder:** Sometimes Gmail filters automated emails
3. **N8N execution:** Should show green nodes

---

## 🔧 Common Issues & Fixes

### Issue 1: Gmail Credential Expired ⚠️ (90% of cases)

**Symptoms:**
- Workflow executes successfully
- No error in N8N UI
- But no email received

**Why it happens:**
- Gmail OAuth2 tokens expire after ~7 days of inactivity
- N8N shows success but Gmail API rejects the request silently

**Fix:**
1. Reconnect Gmail credential (see Step 1 above)
2. Test credential before saving
3. If test fails, delete and recreate credential

---

### Issue 2: Email in Spam Folder

**Symptoms:**
- N8N shows successful execution (all green)
- No email in inbox

**Check:**
1. Open Gmail: egualesamuel@gmail.com
2. Check **Spam** folder
3. If found, mark as "Not Spam"

**Why it happens:**
- Automated emails from N8N may be flagged
- Gmail sees high volume from same sender

**Fix:**
- Add noreply@n8n.cloud to contacts
- Mark previous emails as "Not Spam"
- Create Gmail filter to never send to spam

---

### Issue 3: Wrong Email Address

**Symptoms:**
- Execution successful
- No email received
- Checking wrong inbox

**Check:**
1. Look at execution logs
2. Find "Send Appointment Email" node
3. Check "sendTo" field value
4. Verify it matches your inbox

**Fix:**
- Update email in test scripts
- Check appointment data has correct email

---

### Issue 4: Gmail API Quota Exceeded

**Symptoms:**
- First few emails work
- Then stop working
- Error in logs: "Quota exceeded"

**Check:**
1. Go to: https://console.cloud.google.com/apis/api/gmail.googleapis.com/quotas
2. Check daily send limit (usually 500/day for free tier)

**Fix:**
- Wait 24 hours for quota reset
- Or upgrade to paid Google Workspace

---

### Issue 5: Node Not Executing (Routing Issue)

**Symptoms:**
- Execution shows success
- But email nodes are grey (skipped)

**Check:**
1. Look at execution flow
2. Check "Route by Action" node
3. Verify it routes to correct output

**Fix:**
- Check action value matches: "book_appointment", "send_email", etc.
- Verify Switch node conditions are correct

---

## 🧪 Testing Steps

### Test 1: Simple Email Test

```bash
./test-email-only.sh
```

**Expected:**
- HTTP 200 response
- Email received in 1-2 minutes
- N8N execution shows all green

---

### Test 2: Appointment Booking Test

```bash
./test-n8n-direct.sh
```

**Expected:**
- Appointment created in database
- Confirmation email received
- SMS sent (if Twilio configured)

---

### Test 3: Full Workflow Test

```bash
./test-reschedule-cancel.sh
```

**Expected:**
- 3 emails total:
  1. Booking confirmation
  2. Reschedule confirmation
  3. Cancellation confirmation

---

## 🔍 Detailed Gmail Credential Check

### How to Verify Gmail Credential

1. **Open N8N Workflow:**
   https://cwai97.app.n8n.cloud/workflow/UZvAy2tTj8fPWcDZ

2. **Click any Gmail node** (e.g., "Send Appointment Email")

3. **Check credential section:**
   ```
   Credential for Gmail OAuth2: Gmail account
   ```

4. **Click the dropdown** where it says "Gmail account"

5. **You should see:**
   - ✅ Green checkmark = Connected
   - ⚠️ Warning icon = Needs reconnection
   - 🔴 Red X = Invalid/expired

6. **Click "Test" button**
   - If test passes ✅ → Credential working
   - If test fails ❌ → Need to reconnect

---

## 📧 Alternative: Check Gmail Sent Folder

Even if you don't receive the email, check if it was sent:

1. **Log into Gmail** used for N8N credential
2. Go to **"Sent"** folder
3. Look for emails sent around execution time
4. If emails are in Sent → They were sent successfully
5. If not in Sent → Gmail API didn't send (credential issue)

---

## 🆘 Still Not Working?

### Option 1: Check N8N Error Logs

1. Click on failed/successful execution
2. Click on each node
3. Look for detailed error messages
4. Common errors:
   - "Invalid credentials"
   - "Quota exceeded"
   - "Permission denied"

### Option 2: Re-import Workflow

If credential issues persist:

1. **Export current workflow** (backup)
2. **Delete workflow**
3. **Re-import** from JSON
4. **Add new Gmail credential** from scratch
5. **Test**

### Option 3: Use Different Email Provider

If Gmail issues persist, try:
- SMTP (generic email)
- SendGrid
- Mailgun
- AWS SES

---

## ✅ Success Checklist

After fixing, verify:

- [ ] Gmail credential shows green checkmark
- [ ] Test credential passes
- [ ] Workflow saved after credential update
- [ ] Test script runs successfully
- [ ] Email received in inbox (or spam)
- [ ] N8N execution shows all green nodes
- [ ] Appointment created in database

---

## 📊 Expected Results

### Successful Execution Should Show:

```
N8N Execution View:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Webhook Trigger
✅ Route by Action
✅ Create Appointment
✅ Send Appointment Email ← Must be green!
✅ Send Appointment SMS
✅ Respond Success
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gmail Inbox:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Appointment Confirmation - Serenity Hospital
   From: [Your Gmail]
   To: egualesamuel@gmail.com
   Time: ~30 seconds after execution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎯 Most Likely Solution

**90% of cases:** Gmail credential needs reconnection

**Quick Fix:**
1. Open workflow in N8N
2. Click any Gmail node
3. Click credential dropdown
4. Click "Reconnect" or "Test"
5. Re-authenticate if needed
6. Save workflow
7. Run test again

**Time to fix:** 2-3 minutes

---

**Need more help?** Share the N8N execution logs (screenshot) showing which nodes are green/red/grey.
