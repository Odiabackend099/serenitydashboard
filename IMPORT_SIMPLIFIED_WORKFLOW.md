# =å Import n8n Workflow - Quick Guide

##  What's Fixed

**Admin Dashboard AI can now book appointments!**

The admin can say:
- "Book an appointment for Samuel Eguale at egualesamuel@gmail.com for January 15th at 10 AM"
- "Reschedule John's appointment to next Friday at 2 PM"
- "Send a follow-up email to Sarah"

No VAPI needed in admin dashboard - just text commands!

---

## =å Import n8n Workflow

### File to Import
**`SIMPLIFIED_WORKING_WORKFLOW.json`** (in this repository)

### Steps

1. **Go to n8n**: https://cwai97.app.n8n.cloud
2. **Click**: "+ Add workflow" or "New"
3. **Click**: 3-dot menu (î) ’ "Import from File"
4. **Select**: `SIMPLIFIED_WORKING_WORKFLOW.json`
5. **Click**: "Import"

### Configure Gmail

For each email node:
1. Click the node
2. "Credentials" ’ "Create New Credential"
3. Choose "Gmail OAuth2"
4. Connect your Gmail account
5. Allow access

**=¡ Tip**: Reuse the same credential for all email nodes!

### Activate

Toggle workflow to **ON** (top right)

---

## >ê Test It

Run the test script:
```bash
./test-appointment-booking.sh
```

Or use curl:
```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+1234567890",
    "appointmentDate": "January 15th, 2025",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "Test",
    "actionType": "create"
  }'
```

Expected: `{"message":"Workflow was started"}`

Check: Your email inbox!

---

## > How It Works

### Admin Dashboard (NEW!)
- Log into admin dashboard
- Open chat widget
- Say: "Book an appointment for [name] at [email] for [date] at [time]"
- AI uses `trigger_automation` tool
- n8n sends confirmation email to patient

### Public Website
- Visit public site
- Chat or use voice (<¤ toggle)
- Book your own appointment
- AI uses `book_appointment_with_confirmation` tool
- n8n sends confirmation email

### VAPI Voice (After sync)
- Sync VAPI config in Agent Config page
- Call VAPI phone number
- Book appointment via voice
- AI uses `send_appointment_confirmation` function
- n8n sends confirmation email

---

## =ç Email Templates

The workflow sends:
1. **Confirmation** - New appointments (actionType: create)
2. **Reschedule** - Changed appointments (actionType: reschedule)
3. **Cancellation** - Cancelled appointments (actionType: cancel)
4. **Follow-up** - Custom messages (intentType: followup)

All emails are professionally branded with Serenity Royale Hospital styling!

---

## <¯ Quick Summary

 Admin can book appointments via chat (no VAPI in admin)
 Public users can book via text or voice
 n8n workflow handles all email confirmations
 Webhook endpoint: `/serenity-webhook-v2`
 All AI assistants use the same workflow

**Import the workflow and start testing!** =€

---

## =Ú Full Documentation

- **QUICK_START.md** - 2-minute quick start guide
- **SYNC_VAPI_INSTRUCTIONS.md** - Web-based VAPI setup
- **TEST_BOTH_AI_ASSISTANTS.md** - Complete testing guide
- **READY_TO_TEST.md** - Post-deployment testing

**n8n Dashboard**: https://cwai97.app.n8n.cloud
