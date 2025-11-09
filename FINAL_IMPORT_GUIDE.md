# FINAL Import Guide - Fix Email Routing NOW

## The Problem

Your current n8n workflow sends emails to the wrong address:
- **Current**: `patientEmail: noreply@serenityroyalehospital.com` (fallback)
- **Should be**: `patientEmail: egualesamuel@gmail.com` (actual patient)

## The Solution

Import **ENHANCED_N8N_WORKFLOW.json** - it has the correct data parser.

---

## Quick Import (10 Minutes)

### Step 1: Import Workflow
1. Go to: https://cwai97.app.n8n.cloud
2. Click **"+ Add workflow"**
3. Click **3-dot menu** (⋮) → **"Import from File"**
4. Select: `ENHANCED_N8N_WORKFLOW.json`
5. Click **"Import"**

### Step 2: Change Webhook Path (IMPORTANT!)
1. Click **"Webhook Trigger"** node in the imported workflow
2. Change path from `serenity-webhook-v2` to `serenity-webhook-v3`
3. Save the workflow
4. This creates a NEW endpoint so you can test without affecting the old one

### Step 3: Configure Gmail OAuth
For **each** of the 4 Gmail nodes:
1. Click the node
2. **Credentials** → **"Create New Credential"**
3. Select **"Gmail OAuth2"**
4. Click **"Connect my account"**
5. Follow Google OAuth flow
6. **Tip**: Once you create the first credential, reuse it for all 4 nodes

The 4 Gmail nodes are:
- Send Confirmation Email
- Send Reschedule Email
- Send Cancellation Email
- Send Follow-up Email

### Step 4: Activate Workflow
1. Toggle workflow to **ON** (top right)
2. Make sure it shows "Active" with green indicator

### Step 5: Test the New Workflow
Run the test script:
```bash
./test-enhanced-v3.sh
```

Or manual curl:
```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v3 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+1234567890",
    "appointmentDate": "2025-02-20",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "Testing ENHANCED workflow",
    "actionType": "create"
  }'
```

### Step 6: Verify Success
1. Check HTTP response: Should be `200`
2. Go to n8n → **Executions** tab
3. Click latest execution
4. Check **INPUT** section shows:
   ```
   ✅ patientEmail: egualesamuel@gmail.com
   ✅ patientName: Samuel Eguale
   ✅ appointmentDate: 2025-02-20
   ✅ appointmentTime: 10:00 AM
   ```

**NOT**:
   ```
   ❌ patientEmail: noreply@serenityroyalehospital.com
   ❌ patientName: Unknown
   ```

4. Check your email at: **egualesamuel@gmail.com**

---

## After Successful Test

### Update Your AI Assistants (Optional)

Once you confirm the new workflow works, update the webhook endpoint in your code:

**File**: `apps/web/src/lib/groqTools.ts`
**Line 213**: Change from `/serenity-webhook-v2` to `/serenity-webhook-v3`

**File**: `supabase/functions/vapi-webhook/index.ts`
**Line 148**: Change from `/serenity-webhook-v2` to `/serenity-webhook-v3`

Then deploy:
```bash
cd apps/web
npm run build
export VERCEL_TOKEN=<your-vercel-token>
vercel --prod
```

### Deactivate Old Workflow

1. Go to n8n dashboard
2. Find: "Serenity AI - Simplified Working Workflow"
3. Toggle to **OFF**
4. Or delete it entirely

---

## Why This Fixes the Problem

### Old Workflow (What you have now)
**Parser Output** (nested structure):
```json
{
  "intent": "appointment",
  "patient": {
    "name": "Samuel",
    "email": "egualesamuel@gmail.com"
  },
  "appointment": {
    "date": "2025-01-15",
    "time": "10:00 AM"
  }
}
```

**Gmail Node Expects** (flat structure):
```
sendTo: {{ $json.patientEmail }}
```

**Result**: `patientEmail` is undefined → Falls back to `noreply@serenityroyalehospital.com`

### New Workflow (ENHANCED_N8N_WORKFLOW.json)
**Parser Output** (flat structure):
```json
{
  "patientEmail": "egualesamuel@gmail.com",
  "patientName": "Samuel Eguale",
  "appointmentDate": "2025-01-15",
  "appointmentTime": "10:00 AM",
  "appointmentReason": "General consultation",
  "actionType": "create"
}
```

**Gmail Node Expects** (flat structure):
```
sendTo: {{ $json.patientEmail }}
```

**Result**: ✅ Email sent to **egualesamuel@gmail.com**

---

## Troubleshooting

### HTTP 404 - Webhook Not Found
- Check workflow is **ACTIVE** (toggle ON)
- Verify webhook path is exactly `serenity-webhook-v3`
- Wait 30 seconds after activating, then try again

### HTTP 200 but No Email
- Go to n8n → **Executions** → Latest execution
- Check if Gmail node ran
- Check Gmail OAuth is connected (green checkmark)
- Check spam/junk folder

### Gmail Node Shows "Credentials Error"
- Re-authenticate Gmail OAuth
- Make sure you're using a Gmail account (not other email)
- Try creating new credential from scratch

### Still Shows Wrong Email in Execution
- You imported the wrong workflow file
- Make sure you imported **ENHANCED_N8N_WORKFLOW.json**
- Check the workflow name is: "Serenity AI - FIXED Email Routing (Import This One)"

---

## Quick Summary

✅ **File to import**: `ENHANCED_N8N_WORKFLOW.json`
✅ **Change webhook path to**: `serenity-webhook-v3`
✅ **Configure**: Gmail OAuth on all 4 email nodes
✅ **Activate**: Toggle ON
✅ **Test**: Run `./test-enhanced-v3.sh`
✅ **Verify**: Check email at egualesamuel@gmail.com

**This WILL fix your email routing!** 🚀

---

## Files in This Repository

- **ENHANCED_N8N_WORKFLOW.json** - Import this workflow
- **ENHANCED_WORKFLOW_GUIDE.md** - Detailed import guide
- **test-enhanced-v3.sh** - Test script for new workflow
- **FINAL_IMPORT_GUIDE.md** - This file (comprehensive guide)

---

**Ready?** Import the workflow now and finally get those emails! 📧✨
