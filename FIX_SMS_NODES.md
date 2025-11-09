# Fix for "Send Appointment SMS" and "Send Appointment Email" Nodes

## Problem
After the "Create Appointment" node saves to Supabase, the original `$json.body.*` data is replaced with the Supabase response. The SMS and Email nodes can't find the phone number and email.

## Solution
The "Send Appointment SMS" and "Send Appointment Email" nodes need to reference the data from the **previous node** (the original webhook data), not from the Supabase response.

---

## Fix for "Send Appointment SMS" Node

1. **Click on "Send Appointment SMS" node**
2. **Find the "To" field**
3. **Change it to:**

**Current (WRONG):**
```
={{ $json.body.patient_phone || $json.body.patientPhone || $json.body.phone }}
```

**Should be (CORRECT):**
```
={{ $('Webhook Trigger').item.json.body.patient_phone || $('Webhook Trigger').item.json.body.patientPhone || $('Webhook Trigger').item.json.body.phone }}
```

Or simpler, reference the appointment data that was just created:
```
={{ $json.patient_phone }}
```

4. **For the Message field, change to:**

**Current:**
```
=Appointment confirmed for {{ $json.body.appointment_date || $json.body.appointmentDate }} at {{ $json.body.appointment_time || $json.body.appointmentTime }}. Serenity Hospital.
```

**Should be:**
```
=Appointment confirmed for {{ $json.appointment_date }} at {{ $json.appointment_time }}. Serenity Hospital.
```

---

## Fix for "Send Appointment Email" Node

1. **Click on "Send Appointment Email" node**
2. **Find the "To" field**
3. **Change it to:**

**Current (WRONG):**
```
={{ $json.body.patient_email || $json.body.patientEmail }}
```

**Should be (CORRECT):**
```
={{ $json.patient_email }}
```

4. **For the Message field, change to:**

**Current:**
```
=Dear {{ $json.body.patient_name || $json.body.patientName }},

Your appointment has been confirmed:

Date: {{ $json.body.appointment_date || $json.body.appointmentDate }}
Time: {{ $json.body.appointment_time || $json.body.appointmentTime }}
Reason: {{ $json.body.reason || 'General consultation' }}

Please arrive 10 minutes early.

Best regards,
Serenity Royale Hospital
```

**Should be:**
```
=Dear {{ $json.patient_name }},

Your appointment has been confirmed:

Date: {{ $json.appointment_date }}
Time: {{ $json.appointment_time }}
Reason: {{ $json.reason }}

Please arrive 10 minutes early.

Best regards,
Serenity Royale Hospital
```

---

## Why This Happens

When the "Create Appointment" node executes:
1. It receives data: `{ body: { patient_phone: "+123...", ... } }`
2. It inserts into Supabase
3. **Supabase returns**: `{ id: "uuid", patient_phone: "+123...", ... }` (the created row)
4. The next nodes receive this Supabase response, NOT the original `body` object

So the SMS/Email nodes need to reference `$json.patient_phone` (from Supabase response) instead of `$json.body.patient_phone` (from original webhook).

---

## Quick Fix Summary

### Send Appointment SMS:
- **To**: `={{ $json.patient_phone }}`
- **Message**: `=Appointment confirmed for {{ $json.appointment_date }} at {{ $json.appointment_time }}. Serenity Hospital.`

### Send Appointment Email:
- **To**: `={{ $json.patient_email }}`
- **Message**: Use `$json.patient_name`, `$json.appointment_date`, etc. (remove `.body`)

---

## After Fixing

1. **Save the workflow**
2. **Run the test again:**
```bash
./auto-fix-and-test.sh
```

3. You should see **no errors** and the appointment confirmation messages will be sent!
