# Quick Fix for Email & SMS Nodes

## Issue
The "Send Appointment SMS" and "Send Appointment Email" nodes are failing because they're looking for data in the wrong place after the Supabase "Create Appointment" node.

---

## Fix 1: Send Appointment SMS

**Click the node** and update:

### To (phone number):
**Change to:**
```
={{ $json.patient_phone }}
```

### Message:
**Change to:**
```
=Appointment confirmed for {{ $json.appointment_date }} at {{ $json.appointment_time }}. Serenity Hospital.
```

---

## Fix 2: Send Appointment Email

**Click the node** and update:

### Send To (email):
**Change to:**
```
={{ $json.patient_email || 'test@example.com' }}
```
*(The `|| 'test@example.com'` provides a fallback if email is missing)*

### Message:
**Change to:**
```
=Dear {{ $json.patient_name || 'Patient' }},

Your appointment has been confirmed:

Date: {{ $json.appointment_date }}
Time: {{ $json.appointment_time }}
Reason: {{ $json.reason || 'General consultation' }}

Please arrive 10 minutes early.

Best regards,
Serenity Royale Hospital
```

---

## Why This Fix Works

After the "Create Appointment" node inserts data into Supabase:
- **Before:** Data is in `$json.body.patient_phone`
- **After:** Data is in `$json.patient_phone` (the Supabase response)

The SMS and Email nodes run AFTER the database insert, so they need to use the Supabase response format.

---

## Save & Test

1. **Save the workflow** (Ctrl+S or Cmd+S)
2. **Run the test:**
```bash
./auto-fix-and-test.sh
```

3. **Expected result:**
```
✅ Found X test message(s) in database!
✅ Found X test appointment(s) in database!
✅ SUCCESS! Workflow is working perfectly!
```

And **NO errors** in the n8n executions!

---

## Alternative: Re-import Fixed Workflow

If you prefer, you can also:
1. Delete the current workflow
2. Re-import `n8n/IMPORT_THIS_WORKFLOW.json` (I just fixed it)
3. Link credentials again
4. Activate

The file now has the correct configuration for both nodes.
