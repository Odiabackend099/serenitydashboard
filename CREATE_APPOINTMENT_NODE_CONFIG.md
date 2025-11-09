# Create Appointment Node - Copy/Paste Configuration

## Step 1: Open the Node
1. Go to: https://cwai97.app.n8n.cloud/workflow/UZvAy2tTj8fPWcDZ
2. Click on the **"Create Appointment"** node
3. You'll see a panel on the right

## Step 2: Configure Each Field (30 seconds)

For EACH field below, do this:
1. Find the field name in the left column
2. Click the **`fx`** button next to the field (looks like a function icon)
3. **DELETE** everything in the field
4. **COPY** the exact text from the right column
5. **PASTE** it into the field

---

### Field 1: conversation_id
```
Click fx, then paste this EXACTLY:
$json.body.conversation_id
```

---

### Field 2: patient_ref
```
Click fx, then paste this EXACTLY:
$json.body.patient_ref || $json.body.phone
```

---

### Field 3: patient_name
```
Click fx, then paste this EXACTLY:
$json.body.patient_name || $json.body.patientName
```

---

### Field 4: patient_email
```
Click fx, then paste this EXACTLY:
$json.body.patient_email || $json.body.patientEmail
```

---

### Field 5: patient_phone
```
Click fx, then paste this EXACTLY:
$json.body.patient_phone || $json.body.patientPhone || $json.body.phone
```

---

### Field 6: appointment_date
```
Click fx, then paste this EXACTLY:
$json.body.appointment_date || $json.body.appointmentDate || $json.body.date
```

---

### Field 7: appointment_time
```
Click fx, then paste this EXACTLY:
$json.body.appointment_time || $json.body.appointmentTime || $json.body.time
```

---

### Field 8: appointment_type
```
Click fx, then paste this EXACTLY:
$json.body.appointment_type || 'consultation'
```

---

### Field 9: reason
```
Click fx, then paste this EXACTLY:
$json.body.reason || $json.body.appointmentReason || 'General consultation'
```

---

## Step 3: Save & Test

1. Click **"Save"** (top right)
2. Close the node panel
3. The workflow should auto-save

4. Run this in terminal:
```bash
./auto-fix-and-test.sh
```

5. You should see:
```
✅ Found X test appointment(s) in database!
✅ SUCCESS! Workflow is working perfectly!
```

---

## Visual Checklist

After configuring, each field should look like this:

✅ **conversation_id**: `= $json.body.conversation_id` (with `=` prefix visible)
✅ **patient_ref**: `= $json.body.patient_ref || $json.body.phone`
✅ **patient_name**: `= $json.body.patient_name || $json.body.patientName`
✅ **patient_email**: `= $json.body.patient_email || $json.body.patientEmail`
✅ **patient_phone**: `= $json.body.patient_phone || $json.body.patientPhone || $json.body.phone`
✅ **appointment_date**: `= $json.body.appointment_date || $json.body.appointmentDate || $json.body.date`
✅ **appointment_time**: `= $json.body.appointment_time || $json.body.appointmentTime || $json.body.time`
✅ **appointment_type**: `= $json.body.appointment_type || 'consultation'`
✅ **reason**: `= $json.body.reason || $json.body.appointmentReason || 'General consultation'`

**The `=` prefix should be visible** - that means Expression mode is ON!

---

## Total Time: 30 seconds
## Clicks Required: 18 (9 fx toggles + 9 fields)
## Copy/Pastes Required: 9

---

Then run `./auto-fix-and-test.sh` and you're done! 🎉
