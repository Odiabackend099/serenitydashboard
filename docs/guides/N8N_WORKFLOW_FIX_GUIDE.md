# 🔧 N8N WORKFLOW EMAIL FIX GUIDE

**Issue**: n8n workflow fails at "Send Email" node with error:
```
Cannot read properties of undefined (reading 'split') (item 0)
```

**Date**: 2025-11-11
**Workflow**: Serenity Workflow - Ready to Import

---

## 🎯 ROOT CAUSE

The Gmail node (v2.1) in n8n is trying to access fields that don't exist in the webhook payload.

### What's Happening:
1. Webhook trigger receives data
2. "Route by Action" node correctly routes based on `action` field
3. **"Send Email" Gmail node tries to access `toList` field**
4. Field doesn't exist → `undefined.split()` → **ERROR**

---

## ✅ SOLUTION 1: FIX EDGE FUNCTION PAYLOAD (DONE)

I've updated the Edge Function to send the correct fields that n8n expects:

### Updated Payload Format:
```json
{
  "action": "book_appointment_with_confirmation",

  // Gmail node fields (n8n v2 compatibility)
  "toList": "patient@example.com",
  "subject": "Appointment Confirmation - 2025-01-15 at 10:00 AM",
  "emailBody": "Dear John,\n\nYour appointment has been confirmed...",

  // Legacy fields (backwards compatibility)
  "patientName": "John Doe",
  "patientEmail": "patient@example.com",
  "patientPhone": "+1234567890",
  "appointmentDate": "2025-01-15",
  "appointmentTime": "10:00 AM",
  "appointmentReason": "General consultation",
  // ... other fields
}
```

**Status**: ✅ Deployed

---

## ✅ SOLUTION 2: FIX N8N WORKFLOW (YOU NEED TO DO THIS)

The n8n workflow's Gmail node configuration needs to be updated to use the correct field mappings.

### Step-by-Step Fix:

#### 1. Open n8n Editor
- Go to: https://cwai97.app.n8n.cloud
- Navigate to: "Serenity Workflow - Ready to Import"
- Click: "Editor" tab

#### 2. Locate the "Send Email" Node
- Find the Gmail node (has red X icon if failing)
- It's after the "Route by Action" or "Route by Channel" nodes
- Click on it to open settings

#### 3. Update Field Mappings

**Current Configuration** (BROKEN):
```
To: {{ $json.toList }}  // This field is undefined!
Subject: {{ $json.subject }}
Message: {{ $json.message }}
```

**Fixed Configuration** (WORKING):
```
To: {{ $json.toList || $json.patientEmail }}
Subject: {{ $json.subject || 'Appointment Confirmation' }}
Message (HTML):
<h2>Appointment Confirmation</h2>
<p>Dear {{ $json.patientName || 'Patient' }},</p>
<p>Your appointment has been confirmed!</p>
<ul>
  <li><strong>Date:</strong> {{ $json.appointmentDate }}</li>
  <li><strong>Time:</strong> {{ $json.appointmentTime }}</li>
  <li><strong>Reason:</strong> {{ $json.appointmentReason || 'General consultation' }}</li>
</ul>
<p>Please arrive 10 minutes early.</p>
<p>Best regards,<br>Serenity Hospital Team</p>
```

#### 4. Alternative: Use Expression Mode

If the fields are still not working, use JavaScript expression mode:

```javascript
// To field
{{
  $json.toList
  || $json.patientEmail
  || $json.email
  || 'egualesamuel@gmail.com'
}}

// Subject field
{{
  $json.subject
  || `Appointment Confirmation - ${$json.appointmentDate} at ${$json.appointmentTime}`
}}

// Message field
{{
  $json.emailBody
  || `Dear ${$json.patientName},

Your appointment has been confirmed!

Date: ${$json.appointmentDate}
Time: ${$json.appointmentTime}
Reason: ${$json.appointmentReason || 'General consultation'}

Please arrive 10 minutes early.

Best regards,
Serenity Hospital Team`
}}
```

#### 5. Test the Node
- Click: "Execute Node" (play button)
- Use test data:
  ```json
  {
    "toList": "egualesamuel@gmail.com",
    "subject": "Test Email",
    "emailBody": "This is a test",
    "patientName": "Samuel Eguale"
  }
  ```
- Verify: Email sends successfully

#### 6. Save the Workflow
- Click: "Save" button (top right)
- Ensure workflow is "Active" (green toggle)

---

## ✅ SOLUTION 3: SIMPLIFY WORKFLOW (ALTERNATIVE)

If fixing field mappings is too complex, create a simpler workflow:

### Simplified Workflow Structure:
```
Webhook Trigger
    ↓
[IF] action === 'book_appointment_with_confirmation'
    ↓
Gmail: Send Message
    To: {{ $json.patientEmail }}
    Subject: Appointment Confirmation
    Message: (template with all fields)
```

### Benefits:
- No complex routing
- Direct field access
- Easier to debug
- Less prone to errors

---

## 🧪 TESTING AFTER FIX

### Test 1: Direct Webhook Call
```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment_with_confirmation",
    "toList": "egualesamuel@gmail.com",
    "subject": "Test Booking",
    "emailBody": "This is a test appointment confirmation.",
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "appointmentDate": "2025-01-15",
    "appointmentTime": "10:00 AM"
  }'
```

**Expected**:
- HTTP 200 response
- n8n execution shows SUCCESS (green)
- Email received at egualesamuel@gmail.com

### Test 2: Via Chat Widget
```bash
node test-chat-widget-booking.js
```

**Expected**:
- All tests pass
- Email received at egualesamuel@gmail.com

---

## 🔍 DEBUGGING TIPS

### Check n8n Execution Logs

1. Go to: https://cwai97.app.n8n.cloud/executions
2. Click on the failed execution (red X)
3. Look at the error details
4. Check which node is failing

### Common Issues:

#### Issue 1: "toList is undefined"
**Cause**: Gmail node trying to access wrong field
**Fix**: Update field mapping to use `$json.patientEmail`

#### Issue 2: "Cannot read property 'split'"
**Cause**: Field exists but is not a string, or wrong field name
**Fix**: Ensure field is a string: `{{ String($json.patientEmail) }}`

#### Issue 3: Email sends but has no content
**Cause**: Message field is empty or undefined
**Fix**: Use fallback: `{{ $json.emailBody || 'Default message' }}`

#### Issue 4: Workflow doesn't trigger
**Cause**: Workflow is inactive or webhook URL is wrong
**Fix**:
- Check workflow toggle is GREEN
- Verify webhook URL matches: `/webhook/serenity-webhook-v2`

---

## 📋 FIELD MAPPING REFERENCE

### Gmail Node (n8n v2) Expected Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **toList** | String | Yes | Email addresses (comma-separated) |
| **subject** | String | Yes | Email subject line |
| **message** | String | Yes (if not HTML) | Plain text message |
| **htmlMessage** | String | No | HTML formatted message |
| **bcc** | String | No | BCC recipients |
| **cc** | String | No | CC recipients |
| **attachments** | Array | No | File attachments |

### Our Webhook Payload Fields:

| Field | Maps To | Description |
|-------|---------|-------------|
| **toList** | Gmail: To | Direct mapping |
| **patientEmail** | Gmail: To (fallback) | Patient email address |
| **subject** | Gmail: Subject | Email subject |
| **emailBody** | Gmail: Message | Email body content |
| **patientName** | Template variable | Used in message template |
| **appointmentDate** | Template variable | Used in message template |
| **appointmentTime** | Template variable | Used in message template |
| **appointmentReason** | Template variable | Used in message template |

---

## ✅ VERIFICATION CHECKLIST

After applying fixes:

- [ ] Edge Function deployed with updated payload
- [ ] n8n workflow Gmail node updated with correct field mappings
- [ ] Test webhook call returns HTTP 200
- [ ] n8n execution shows SUCCESS (green, not red)
- [ ] Email received at egualesamuel@gmail.com
- [ ] Email contains correct appointment details
- [ ] Chat widget booking test passes
- [ ] No errors in n8n execution logs

---

## 🚀 RECOMMENDED n8n WORKFLOW CONFIGURATION

### Option 1: Update Existing Workflow (Recommended)

1. Keep current workflow structure
2. Fix Gmail node field mappings (see Solution 2)
3. Test and save

### Option 2: Rebuild Workflow (If Problems Persist)

Create a new, simpler workflow:

```
1. Webhook Trigger
   URL: /webhook/serenity-webhook-v2
   Method: POST

2. Set Variables (optional, for clarity)
   email: {{ $json.patientEmail || $json.toList }}
   subject: {{ $json.subject || 'Appointment Confirmation' }}
   body: {{ $json.emailBody || (construct from fields) }}

3. Gmail: Send Email
   To: {{ $('Set Variables').item.json.email }}
   Subject: {{ $('Set Variables').item.json.subject }}
   Message: {{ $('Set Variables').item.json.body }}

4. Respond to Webhook
   Status: 200
   Body: { "success": true, "message": "Email sent" }
```

---

## 📞 SUPPORT

### If Issues Persist:

1. **Check Gmail Credentials**:
   - n8n → Credentials → Gmail OAuth2
   - Reconnect if expired

2. **Check Gmail API Quotas**:
   - Google Cloud Console
   - APIs & Services → Gmail API
   - Verify not rate limited

3. **Check n8n Logs**:
   - n8n dashboard → Executions
   - Click failed execution → View logs

4. **Export & Reimport Workflow**:
   - n8n → Export workflow JSON
   - Create new workflow
   - Import exported JSON
   - Update webhook URLs

---

**Last Updated**: 2025-11-11
**Status**: Edge Function fixed ✅ | n8n workflow needs manual fix ⚠️
**Test Email**: egualesamuel@gmail.com

---

*Generated following 3-Step Coding Methodology ✅*
