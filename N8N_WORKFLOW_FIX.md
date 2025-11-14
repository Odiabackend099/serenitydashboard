# 🔧 N8N Workflow Fix - Patient Ref Missing

## Problem Identified

The appointment booking is failing with this error:
```
null value in column "patient_ref" of relation "appointments" violates not-null constraint
```

**Root Cause:** The N8N workflow's "Create Appointment" node is not correctly mapping the `patient_ref` field from the webhook payload.

---

## Solution: Fix N8N Workflow

### Step 1: Open N8N Workflow
1. Go to: https://cwai97.app.n8n.cloud/workflows
2. Find workflow: **"Serenity Webhook V2"** or **"serenity-webhook-v2"**
3. Click to edit

### Step 2: Locate "Create Appointment" Node
- This is the Supabase node that creates the appointment record
- It should be connected after the "Switch" or "IF" node that checks for `action === 'book_appointment'`

### Step 3: Fix the Field Mappings

In the **Create Appointment** node, update these fields:

```
Table: appointments

Fields to Insert:
├── patient_ref: {{ $json.body.patient_ref || $json.body.patient_email || $json.body.patientEmail }}
├── patient_name: {{ $json.body.patient_name || $json.body.patientName }}
├── patient_email: {{ $json.body.patient_email || $json.body.patientEmail }}
├── patient_phone: {{ $json.body.patient_phone || $json.body.patientPhone }}
├── appointment_date: {{ $json.body.appointment_date || $json.body.appointmentDate }}
├── appointment_time: {{ $json.body.appointment_time || $json.body.appointmentTime }}
├── reason: {{ $json.body.reason || $json.body.appointmentReason || 'General consultation' }}
├── appointment_type: {{ $json.body.appointment_type || $json.body.appointmentType || 'consultation' }}
├── source: {{ $json.body.source || 'groq_chat_widget' }}
└── status: scheduled
```

### Critical Fields

**MUST HAVE (NOT NULL in database):**
- `patient_ref` - Use patient_email as fallback if not provided
- `patient_name` - Full name of patient
- `patient_phone` - Contact number

**Important Fields:**
- `appointment_date` - Date in YYYY-MM-DD format
- `appointment_time` - Time in HH:MM format
- `reason` - Why they're booking

---

## Step 4: Test the Workflow

### Option A: Test in N8N
1. Click "Execute Workflow" button in N8N
2. Use this test payload:

```json
{
  "action": "book_appointment",
  "body": {
    "action": "book_appointment",
    "channel": "webchat",
    "patient_ref": "egualesamuel@gmail.com",
    "patient_name": "Samuel Eguale",
    "patient_email": "egualesamuel@gmail.com",
    "patient_phone": "+234-801-234-5678",
    "appointment_date": "2025-11-13",
    "appointment_time": "10:00",
    "reason": "General consultation",
    "appointment_type": "consultation",
    "source": "groq_chat_widget"
  }
}
```

3. Check execution results - should see SUCCESS with no errors

### Option B: Test from Command Line

```bash
cd "/Users/odiadev/Desktop/serenity dasboard"
./test-chat-widget-appointment-auto.sh
```

This will test the full flow from Groq → Edge Function → N8N → Database

---

## Step 5: Save and Activate

1. Click **Save** in N8N workflow editor
2. Ensure workflow is **Active** (toggle should be ON)
3. The fix is now deployed!

---

## What Was Wrong?

The N8N workflow was trying to access fields like:
- `$json.patient_ref` ❌ (WRONG - data is nested in body)
- `$json.body.patient_ref` ✅ (CORRECT)

The webhook sends data as:
```json
{
  "action": "book_appointment",
  "body": {
    "patient_ref": "email@example.com",
    "patient_name": "John Doe",
    ...
  }
}
```

So we need `$json.body.patient_ref`, not just `$json.patient_ref`.

---

## Verification

After fixing, you should see in N8N execution logs:
- ✅ Webhook received
- ✅ Switch node routed to "Create Appointment"
- ✅ Supabase node created appointment
- ✅ Gmail node sent confirmation email

And in Supabase `appointments` table:
- New row with all fields populated
- `patient_ref` has the email address
- `status` = 'scheduled'

---

## Quick Test Command

After fixing N8N workflow, run this:

```bash
curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "body": {
      "action": "book_appointment",
      "patient_ref": "test@example.com",
      "patient_name": "Test User",
      "patient_email": "test@example.com",
      "patient_phone": "+1234567890",
      "appointment_date": "2025-11-15",
      "appointment_time": "14:00",
      "reason": "Test booking",
      "appointment_type": "consultation"
    }
  }'
```

Should return 200 OK with no errors.

---

## Summary

- **Problem:** `patient_ref` was NULL in database
- **Cause:** N8N not mapping `$json.body.patient_ref` correctly
- **Fix:** Update Create Appointment node field mappings
- **Test:** Use test script or manual curl command
- **Result:** Appointments will book successfully! ✅
