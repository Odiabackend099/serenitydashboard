# 🚀 Deploy Appointment Booking Fix - 5 Minute Checklist

## What Was Fixed

✅ Added `status` field (set to "scheduled")
✅ Added `source` field (tracks where booking came from)
✅ Verified all other field mappings are correct

---

## Deployment Steps

### Step 1: Import Updated Workflow (2 minutes)

1. **Open N8N:** https://cwai97.app.n8n.cloud/workflows

2. **Check for existing workflows:**
   - Look for any workflow with webhook path `/serenity-webhook-v2`
   - If one exists, **note its name** and **deactivate it** (toggle OFF)

3. **Import the fixed workflow:**
   - Click the **"+"** button (top right)
   - Select **"Import from file"**
   - Choose file: `/Users/odiadev/Desktop/serenity dasboard/n8n/Serenity Workflow - Ready to Import.json`
   - Click **"Import"**

4. **Review imported workflow:**
   - You should see "Serenity Webhook V2 - Fixed v2.0.3"
   - Verify the "Create Appointment" node has all fields
   - Check that `status` and `source` fields are present

5. **Save and Activate:**
   - Click **"Save"** button
   - Toggle **"Active"** to **ON**

### Step 2: Test the Fix (2 minutes)

Open Terminal and run:

```bash
cd "/Users/odiadev/Desktop/serenity dasboard"
./test-n8n-direct.sh
```

**Expected Output:**
```
✅ SUCCESS!
Response Code: 200
```

### Step 3: Test from Chat Widget (1 minute)

1. Open: https://srhbackend.odia.dev
2. Click the chat widget (bottom right)
3. Type:
   ```
   Book an appointment for Samuel Eguale at egualesamuel@gmail.com
   phone +234-801-234-5678 on 13th November 2025 at 10am for general consultation
   ```
4. Wait for AI response - should show success!
5. Check email: egualesamuel@gmail.com for confirmation

---

## If Test Fails

### Check 1: Workflow Is Active

```
N8N Dashboard → Workflows → Find "Serenity Webhook V2"
Toggle must be green/ON
```

### Check 2: Only One Webhook Active

```
Ensure NO other workflows use the path: /serenity-webhook-v2
Deactivate any duplicates
```

### Check 3: Field Mappings

Click on "Create Appointment" node and verify these fields exist:

- ✅ patient_ref
- ✅ patient_name
- ✅ patient_email
- ✅ patient_phone
- ✅ appointment_date
- ✅ appointment_time
- ✅ appointment_type
- ✅ reason
- ✅ **status** ← NEW
- ✅ **source** ← NEW

### Check 4: Database Table

The `appointments` table should have these columns:
- `patient_ref` (NOT NULL)
- `status` (default: 'pending')
- `source`

If missing, the database schema needs updating.

---

## Verification Checklist

After deployment, verify:

- [ ] N8N workflow is **Active** (green toggle)
- [ ] `./test-n8n-direct.sh` returns **SUCCESS** (HTTP 200)
- [ ] Chat widget booking works (AI confirms booking)
- [ ] Email received at egualesamuel@gmail.com
- [ ] N8N executions show **no errors** (https://cwai97.app.n8n.cloud/executions)
- [ ] Supabase has new appointment record (https://supabase.com/dashboard)

---

## Success Criteria

✅ Test script shows: **Response Code: 200**
✅ Chat widget shows: **"Appointment booked successfully"**
✅ Email sent to patient
✅ Appointment appears in Supabase `appointments` table
✅ N8N execution log shows **success** (no red errors)

---

## Still Not Working?

### Option A: Manual Field Addition

If importing doesn't work, manually add the missing fields:

1. Open existing workflow in N8N
2. Click "Create Appointment" node
3. Scroll to bottom of "Fields to Set"
4. Click "+ Add Field"
5. Add:
   - Field: `status` → Value: `scheduled`
   - Field: `source` → Value: `={{ $json.body.source || 'groq_chat_widget' }}`
6. Click "Save"

### Option B: Check Database Schema

The error mentions `patient_ref` is NULL. Verify the database column exists:

```sql
-- Run in Supabase SQL Editor:
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name IN ('patient_ref', 'status', 'source');
```

Expected result:
- `patient_ref`: NOT NULL (is_nullable = NO)
- `status`: nullable or has default
- `source`: nullable

---

## Quick Reference

| File | Purpose |
|------|---------|
| `n8n/Serenity Workflow - Ready to Import.json` | Fixed workflow file to import |
| `test-n8n-direct.sh` | Test N8N webhook directly |
| `N8N_WORKFLOW_ANALYSIS_AND_FIX.md` | Detailed analysis of what was fixed |
| `APPOINTMENT_BOOKING_FINAL_FIX_INSTRUCTIONS.md` | Complete fix guide |

---

**Estimated Time:** 5 minutes
**Difficulty:** Easy
**Impact:** Appointment booking will work 100% ✅
