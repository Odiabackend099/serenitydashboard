# Final Setup Steps - Send Test Email to odiabackend@gmail.com

## ✅ What's Already Done

1. **Frontend Code** - Fully integrated and deployed to Vercel
2. **n8n Workflow JSON** - Ready to import (`n8n-srhcareai-enhanced.json`)
3. **Database Schema** - SQL file ready (`CREATE_APPOINTMENTS_TABLE_FINAL.sql`)

## 🎯 3 Simple Steps to Complete

### Step 1: Create Appointments Table in Supabase (2 minutes)

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/sql
   ```

2. Click **"New Query"**

3. Copy the ENTIRE contents of this file:
   ```
   CREATE_APPOINTMENTS_TABLE_FINAL.sql
   ```

4. Paste into the SQL editor

5. Click **"Run"**

6. You should see: ✅ "SUCCESS: Appointments table created!"

### Step 2: Import and Configure n8n Workflow (5 minutes)

#### A. Import Workflow

1. Go to your n8n instance:
   ```
   https://cwai97.app.n8n.cloud
   ```

2. Click **"Workflows"** → **"Add Workflow"** → **"Import from File"**

3. Select the file:
   ```
   n8n-srhcareai-enhanced.json
   ```

4. Click **"Import"**

#### B. Configure Supabase Credential

1. In the imported workflow, you'll see red credential warnings

2. Click on any Supabase node (e.g., "Save Appointment to Supabase")

3. Click the **"Credentials"** dropdown

4. Click **"Create New"**

5. Fill in:
   ```
   Name: srh
   Host: https://yfrpxqvjshwaaomgcaoq.supabase.co
   Service Role Key: `${SUPABASE_SERVICE_ROLE_KEY}` (Get from Supabase Settings > API)
   ```

6. Click **"Save"**

#### C. Configure Gmail OAuth Credential

1. Click on the **"Send Appointment Confirmation Email"** node

2. Click the **"Credentials"** dropdown

3. Click **"Create New"**

4. Select **"Gmail OAuth2"**

5. Fill in:
   ```
   Name: Gmail account
   ```

6. Click **"Connect my account"**

7. **Sign in with the Gmail account** you want to send emails from
   - Recommended: Use a hospital/business email
   - For testing: You can use your personal Gmail

8. **Authorize** n8n to send emails

9. Click **"Save"**

#### D. Activate Workflow

1. Click the **"Inactive"** toggle in the top right

2. It should turn to **"Active"** (green)

3. ✅ Done!

### Step 3: Test and Send Email (1 minute)

Run the test script:

```bash
node test-fixed-payload.js
```

**Expected Output:**
```
✅ SUCCESS!
📧 Email should be sent to: odiabackend@gmail.com
✉️  CHECK YOUR EMAIL INBOX!
```

**Check odiabackend@gmail.com inbox for:**
- Subject: "Appointment Confirmation - Serenity Royale Hospital"
- From: Your Gmail account
- Beautiful HTML email with appointment details

## Alternative: Test from Chat Widget

1. Open: https://web-m6rynf4v3-odia-backends-projects.vercel.app

2. Click the chat button

3. Type these messages:
   ```
   1. "I need to book an appointment"
   2. "My email is odiabackend@gmail.com"
   3. "My phone is +234 806 219 7384"
   4. "I need a consultation next Monday at 2pm"
   ```

4. You should see a confirmation message

5. Check odiabackend@gmail.com for the email

## Troubleshooting

### Issue: n8n returns 500 error

**Solution:** The workflow is not active
- Go to n8n and click the "Active" toggle

### Issue: No email received

**Solutions:**
1. Check spam folder
2. Verify Gmail OAuth is connected (green checkmark)
3. Check n8n execution logs for errors
4. Ensure you authorized "Send email" permission

### Issue: "Appointments table does not exist"

**Solution:** Run Step 1 above to create the table

### Issue: "Invalid API key" in Supabase

**Solution:**
1. Double-check the Service Role Key is correct
2. Make sure you're using the **Service Role Key**, not the Anon Key
3. Verify in: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/settings/api

## Quick Reference

### Supabase URLs
- **Dashboard:** https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq
- **SQL Editor:** https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/sql
- **Table Editor:** https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/editor
- **API Settings:** https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/settings/api

### n8n URL
- **Workflows:** https://cwai97.app.n8n.cloud

### Deployed App
- **Production:** https://web-m6rynf4v3-odia-backends-projects.vercel.app

## Email Preview

When successful, the email will look like this:

```
┌───────────────────────────────────────┐
│   Serenity Royale Hospital            │
│   Appointment Confirmation            │
└───────────────────────────────────────┘

Hello Test Patient,

Your appointment has been successfully booked.

Date: November 14, 2025
Time: 2:00 PM
Type: Consultation
Reason: General checkup

Please arrive 15 minutes early
Bring ID and insurance card
Call +234 806 219 7384 to reschedule

Contact: info@serenityroyalehospital.com
```

## Files Reference

All necessary files are in your project root:

- ✅ `n8n-srhcareai-enhanced.json` - Import this into n8n
- ✅ `CREATE_APPOINTMENTS_TABLE_FINAL.sql` - Run this in Supabase
- ✅ `test-fixed-payload.js` - Run this to test
- ✅ `COMPLETE_SOLUTION.md` - Full technical documentation
- ✅ `APPOINTMENT_BOOKING_SETUP.md` - Detailed setup guide

## Success Checklist

- [ ] SQL executed in Supabase ✓ Table created
- [ ] n8n workflow imported
- [ ] Supabase credential configured in n8n
- [ ] Gmail OAuth configured in n8n
- [ ] Workflow activated (green toggle)
- [ ] Test script executed
- [ ] Email received at odiabackend@gmail.com

---

**You're almost there! Just 3 steps and the email will be sent to odiabackend@gmail.com** 🚀
