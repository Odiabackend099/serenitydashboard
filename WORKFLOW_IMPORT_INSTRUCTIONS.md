# 🚀 How to Import the Serenity n8n Workflow

## Quick Start (5 minutes)

### Step 1: Access n8n
Go to your n8n instance: **https://n8n.odia.dev**

### Step 2: Import Workflow
1. Click **"Workflows"** in the left sidebar
2. Click the **"+"** button (top right)
3. Click **"Import from File"**
4. Select `SERENITY_COMPLETE_WORKFLOW.json`
5. Click **"Import"**

### Step 3: Configure Gmail Credentials
1. Click on any **Gmail node** (green node)
2. Click **"Credential to connect with"** dropdown
3. Select **"Gmail account"** (or create new)
4. Authorize with your Gmail:
   - Email: `info.serenityroyalehospital@gmail.com`
   - Follow OAuth2 flow

### Step 4: Activate Workflow
1. Click the **toggle switch** (top right) to **ON**
2. Workflow is now live!

### Step 5: Get Webhook URL
1. Click on **"Webhook Trigger"** node
2. Copy the **Production URL**
   - Example: `https://n8n.odia.dev/webhook/serenity-webhook-v2`
3. This is your endpoint for all appointment bookings

---

## Testing the Workflow

### Test 1: Appointment Confirmation
```bash
curl -X POST https://n8n.odia.dev/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "John Doe",
    "patientEmail": "your-email@example.com",
    "patientPhone": "+1234567890",
    "appointmentDate": "January 15, 2025",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "Annual checkup",
    "actionType": "create",
    "source": "test"
  }'
```

**Expected Result:**
- ✅ HTTP 200 response
- ✅ Email received with confirmation
- ✅ Green checkmarks in n8n execution log

### Test 2: Reschedule
```bash
curl -X POST https://n8n.odia.dev/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "John Doe",
    "patientEmail": "your-email@example.com",
    "appointmentDate": "January 20, 2025",
    "appointmentTime": "2:00 PM",
    "previousDate": "January 15, 2025",
    "previousTime": "10:00 AM",
    "actionType": "reschedule",
    "source": "test"
  }'
```

**Expected Result:**
- ✅ Reschedule email received
- ✅ Shows old and new appointment times

### Test 3: Cancellation
```bash
curl -X POST https://n8n.odia.dev/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "John Doe",
    "patientEmail": "your-email@example.com",
    "appointmentDate": "January 15, 2025",
    "appointmentTime": "10:00 AM",
    "actionType": "cancel",
    "source": "test"
  }'
```

**Expected Result:**
- ✅ Cancellation email received
- ✅ Shows cancelled appointment details

---

## Webhook URL Configuration

### Update in Serenity Codebase

**1. Update groqTools.ts**
```typescript
// Line ~213
const response = await fetch('https://n8n.odia.dev/webhook/serenity-webhook-v2', {
  method: 'POST',
  // ...
});
```

**2. Update VAPI webhook**
```typescript
// vapi-webhook/index.ts Line ~148
const n8nResponse = await fetch('https://n8n.odia.dev/webhook/serenity-webhook-v2', {
  method: 'POST',
  // ...
});
```

**3. Update environment variables (if using)**
```bash
# .env
N8N_WEBHOOK_URL=https://n8n.odia.dev/webhook/serenity-webhook-v2
```

---

## Troubleshooting

### Issue: "Workflow not found"
**Solution:** Make sure workflow is **activated** (toggle ON)

### Issue: "No email received"
**Solution:**
1. Check Gmail credentials are connected
2. Check spam folder
3. Verify email in n8n execution log
4. Check Gmail API quotas

### Issue: "Invalid email error"
**Solution:** Make sure `patientEmail` is provided and not "noreply@serenityroyalehospital.com"

### Issue: "Webhook returns 404"
**Solution:**
1. Workflow must be activated
2. Check webhook path matches exactly: `/webhook/serenity-webhook-v2`
3. Use POST method (not GET)

---

## Monitoring

### View Executions
1. Go to **"Executions"** tab in n8n
2. See all workflow runs
3. Click any execution to see detailed logs
4. Green = success, Red = error

### Check Email Delivery
1. Go to **"Executions"**
2. Click on execution
3. Click **"Send Confirmation Email"** node
4. See Gmail API response

---

## Customization

### Change Email Sender Name
In Gmail node settings:
```
From: Serenity Royale Hospital <info.serenityroyalehospital@gmail.com>
```

### Add Hospital Logo
In email template HTML:
```html
<img src="https://your-hospital.com/logo.png" alt="Logo" width="200">
```

### Add More Fields
In Parse Payload node, add:
```javascript
const insuranceProvider = payload.insuranceProvider || 'N/A';
```

Then use in email:
```html
<p><strong>Insurance:</strong> {{ $json.insuranceProvider }}</p>
```

---

## Best Practices

### ✅ DO:
- Test with your own email first
- Keep workflow activated
- Monitor execution logs
- Back up workflow JSON regularly

### ❌ DON'T:
- Don't deactivate workflow in production
- Don't change webhook path (breaks integrations)
- Don't delete nodes without testing
- Don't skip Gmail OAuth setup

---

## Support

### Need Help?
1. Check n8n execution logs
2. Review **N8N_MASTERY_GUIDE.md**
3. Test with curl commands above
4. Check n8n community forum

### Common Questions

**Q: Can I use a different email service?**
A: Yes! Replace Gmail nodes with SendGrid, Mailgun, or SMTP nodes.

**Q: How many emails can I send?**
A: Gmail OAuth allows ~100 emails per day for free accounts. Use SendGrid for higher volumes.

**Q: Can I add SMS notifications?**
A: Yes! Add Twilio node after email nodes.

**Q: How do I backup this workflow?**
A: Click **"⋮"** (three dots) → **"Export"** → Save JSON file.

---

## Success Checklist

- [ ] Workflow imported successfully
- [ ] Gmail credentials connected
- [ ] Workflow activated (toggle ON)
- [ ] Webhook URL copied
- [ ] Test confirmation email sent
- [ ] Test reschedule email sent
- [ ] Test cancellation email sent
- [ ] Webhook URL updated in codebase
- [ ] Production deployment tested
- [ ] Monitoring executions tab

---

**🎉 You're all set!** Your Serenity appointment automation is now live.

For detailed explanations, see **N8N_MASTERY_GUIDE.md**.
