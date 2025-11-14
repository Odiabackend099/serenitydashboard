# 🔧 N8N Manual Node Setup Guide
## Adding Reschedule & Cancel Appointment Processing

**Date:** 2025-11-12
**Version:** 2.0.3
**Workflow:** Serenity Webhook v2

---

## 📋 Overview

The AI tools and Edge Function routing are complete. Now we need to add the actual processing nodes in N8N for:
1. **Reschedule Appointment** - Update appointment + send notification
2. **Cancel Appointment** - Update status + send notification

---

## ✅ Prerequisites

- [x] Edge Function deployed with reschedule/cancel tool handlers
- [x] N8N workflow routing added (switch cases configured)
- [x] Supabase credentials configured in N8N
- [x] Email/SMS nodes already working from appointment booking

---

## 🔄 Node 1: Reschedule Appointment Processing

### Step 1: Add Supabase Update Node

**Location:** After the "reschedule_appointment" output from Switch node

**Node Configuration:**
```
Node Type: Supabase
Operation: Update
Table: appointments
```

**Update Filters:**
```
Filter Type: Manual
Column: id
Value: {{ $json.body.appointment_id }}

AND

Column: patient_email
Value: {{ $json.body.patient_email }}
```

**Fields to Update:**
```json
{
  "appointment_date": "={{ $json.body.new_date }}",
  "appointment_time": "={{ $json.body.new_time }}",
  "status": "rescheduled",
  "notes": "={{ 'Rescheduled from ' + $json.body.old_date + ' at ' + $json.body.old_time + '. Reason: ' + ($json.body.reason || 'Patient requested') }}"
}
```

**Settings:**
- Return All: ON
- Continue on Fail: OFF

---

### Step 2: Add Reschedule Confirmation Email

**Location:** After Supabase Update node

**Node Configuration:**
```
Node Type: Gmail / SMTP
Operation: Send Email
```

**Email Configuration:**
```
To: {{ $json.body.patient_email || $('Supabase').item.json.patient_email }}
From: noreply@serenityhospital.com
Subject: ✅ Appointment Rescheduled - Serenity Hospital
```

**Email Body (HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4F46E5;">✅ Appointment Rescheduled</h2>

  <p>Dear {{ $json.body.patient_name }},</p>

  <p>Your appointment has been successfully rescheduled.</p>

  <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Previous Appointment:</h3>
    <p><strong>Date:</strong> {{ $json.body.old_date }}<br>
    <strong>Time:</strong> {{ $json.body.old_time }}</p>

    <h3>New Appointment:</h3>
    <p><strong>Date:</strong> {{ $json.body.new_date }}<br>
    <strong>Time:</strong> {{ $json.body.new_time }}<br>
    <strong>Doctor:</strong> Dr. Sarah Johnson<br>
    <strong>Status:</strong> Confirmed</p>
  </div>

  <p><strong>Reason for Change:</strong><br>
  {{ $json.body.reason || 'Patient requested reschedule' }}</p>

  <p style="margin-top: 30px;">If you need to make any changes, please contact us at <a href="mailto:appointments@serenityhospital.com">appointments@serenityhospital.com</a></p>

  <p>Best regards,<br>
  <strong>Serenity Hospital Team</strong></p>
</div>
```

---

### Step 3: Add Reschedule Response Node

**Location:** After Email node

**Node Configuration:**
```
Node Type: Respond to Webhook
Operation: Respond
```

**Response Configuration:**
```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "appointmentId": "={{ $json.body.appointment_id }}",
  "oldDate": "={{ $json.body.old_date }}",
  "oldTime": "={{ $json.body.old_time }}",
  "newDate": "={{ $json.body.new_date }}",
  "newTime": "={{ $json.body.new_time }}",
  "confirmationSent": true
}
```

---

## ❌ Node 2: Cancel Appointment Processing

### Step 1: Add Supabase Update Node (Cancel)

**Location:** After the "cancel_appointment" output from Switch node

**Node Configuration:**
```
Node Type: Supabase
Operation: Update
Table: appointments
```

**Update Filters:**
```
Filter Type: Manual
Column: id
Value: {{ $json.body.appointment_id }}

AND

Column: patient_email
Value: {{ $json.body.patient_email }}
```

**Fields to Update:**
```json
{
  "status": "cancelled",
  "notes": "={{ 'Cancelled by patient. Reason: ' + ($json.body.reason || 'Not specified') }}"
}
```

**Settings:**
- Return All: ON
- Continue on Fail: OFF

---

### Step 2: Add Cancellation Confirmation Email

**Location:** After Supabase Update node

**Node Configuration:**
```
Node Type: Gmail / SMTP
Operation: Send Email
```

**Email Configuration:**
```
To: {{ $json.body.patient_email || $('Supabase').item.json.patient_email }}
From: noreply@serenityhospital.com
Subject: ❌ Appointment Cancelled - Serenity Hospital
```

**Email Body (HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #EF4444;">❌ Appointment Cancelled</h2>

  <p>Dear {{ $json.body.patient_name }},</p>

  <p>Your appointment has been cancelled as requested.</p>

  <div style="background: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Cancelled Appointment:</h3>
    <p><strong>Date:</strong> {{ $('Supabase').item.json.appointment_date }}<br>
    <strong>Time:</strong> {{ $('Supabase').item.json.appointment_time }}<br>
    <strong>Doctor:</strong> Dr. Sarah Johnson<br>
    <strong>Status:</strong> Cancelled</p>
  </div>

  <p><strong>Cancellation Reason:</strong><br>
  {{ $json.body.reason || 'Not specified' }}</p>

  <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;">💡 <strong>Need to reschedule?</strong><br>
    Chat with our AI assistant or call us at (555) 123-4567</p>
  </div>

  <p>We hope to see you again soon!</p>

  <p>Best regards,<br>
  <strong>Serenity Hospital Team</strong></p>
</div>
```

---

### Step 3: Add Cancellation Response Node

**Location:** After Email node

**Node Configuration:**
```
Node Type: Respond to Webhook
Operation: Respond
```

**Response Configuration:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "appointmentId": "={{ $json.body.appointment_id }}",
  "cancelledDate": "={{ $('Supabase').item.json.appointment_date }}",
  "cancelledTime": "={{ $('Supabase').item.json.appointment_time }}",
  "confirmationSent": true
}
```

---

## 🎨 Visual Workflow Structure

```
Webhook (serenity-webhook-v2)
  ↓
Switch: Route by Action
  ├─→ book_appointment → [EXISTING NODES]
  ├─→ send_email → [EXISTING NODES]
  ├─→ send_sms → [EXISTING NODES]
  ├─→ send_whatsapp → [EXISTING NODES]
  ├─→ reschedule_appointment → [NEW NODES]
  │    ↓
  │    Supabase: Update Appointment
  │    ↓
  │    Gmail: Send Reschedule Confirmation
  │    ↓
  │    Respond: Success Response
  │
  └─→ cancel_appointment → [NEW NODES]
       ↓
       Supabase: Update Appointment Status
       ↓
       Gmail: Send Cancellation Confirmation
       ↓
       Respond: Success Response
```

---

## ✅ Testing Checklist

After adding these nodes, test with:

### Test 1: Reschedule Appointment
```bash
cd "/Users/odiadev/Desktop/serenity dasboard"

curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reschedule_appointment",
    "body": {
      "appointment_id": "YOUR_APPOINTMENT_ID",
      "patient_email": "egualesamuel@gmail.com",
      "patient_name": "Samuel Eguale",
      "new_date": "2025-11-20",
      "new_time": "3:00 PM",
      "reason": "Schedule conflict resolved",
      "old_date": "2025-11-15",
      "old_time": "10:00 AM"
    }
  }'
```

**Expected Result:**
- ✅ HTTP 200 response
- ✅ Appointment record updated in database
- ✅ Email sent to patient
- ✅ Status changed to "rescheduled"

### Test 2: Cancel Appointment
```bash
curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "cancel_appointment",
    "body": {
      "appointment_id": "YOUR_APPOINTMENT_ID",
      "patient_email": "egualesamuel@gmail.com",
      "patient_name": "Samuel Eguale",
      "reason": "Unable to attend"
    }
  }'
```

**Expected Result:**
- ✅ HTTP 200 response
- ✅ Appointment status changed to "cancelled"
- ✅ Cancellation email sent
- ✅ Notes updated with reason

### Test 3: From Chat Widget
```
User: "I need to reschedule my appointment to November 20th at 3pm"
AI: [Should call reschedule_appointment tool with proper parameters]

User: "Cancel my appointment for November 15th"
AI: [Should call cancel_appointment tool after getting appointment ID]
```

---

## 🔐 Security Notes

1. **Ownership Verification**: Both reschedule and cancel operations verify `patient_email` matches the appointment owner (done in Edge Function before calling N8N)

2. **Audit Trail**: All changes are logged in the `notes` field with reason and timestamp

3. **Email Confirmation**: Always send confirmation emails for transparency

4. **No Cascading Deletes**: Status changes to "cancelled" rather than deleting records (preserves history)

---

## 🚀 Deployment Steps

1. **Import Updated Workflow**:
   - Go to https://cwai97.app.n8n.cloud/workflows
   - Deactivate old workflow
   - Import: `n8n/Serenity Workflow - Ready to Import.json`

2. **Add Manual Nodes** (follow this guide):
   - Add reschedule nodes
   - Add cancel nodes
   - Test each path

3. **Activate Workflow**:
   - Save all changes
   - Toggle "Active" to ON

4. **Test End-to-End**:
   - Run test scripts
   - Test from chat widget
   - Verify emails sent
   - Check database updates

---

## 📊 Success Metrics

After implementation, verify:

- ✅ Reschedule workflow: 100% success rate
- ✅ Cancel workflow: 100% success rate
- ✅ Email delivery: 100%
- ✅ Database consistency: No orphaned records
- ✅ Response time: < 2 seconds per operation

---

## 🆘 Troubleshooting

### Issue: Supabase Update Fails
**Solution**: Check that `id` and `patient_email` filters match exactly

### Issue: Email Not Sending
**Solution**: Verify Gmail node credentials are valid and not expired

### Issue: Wrong Appointment Updated
**Solution**: Ensure both `id` AND `patient_email` filters are applied (prevents unauthorized updates)

---

**Status**: Ready for manual implementation in N8N UI
**Estimated Time**: 15-20 minutes for both nodes
**Complexity**: Medium (requires understanding of N8N node connections)
