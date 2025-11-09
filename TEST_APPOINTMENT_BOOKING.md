# 🧪 Testing Appointment Booking with Email Confirmation

## ✅ Deployment Status
- **Frontend:** Deployed to https://web-83xc1wtub-odia-backends-projects.vercel.app
- **Edge Functions:** Deployed to Supabase
- **Email:** Will be sent to `egualesamuel@gmail.com`

---

## 🤖 Option 1: Test Groq AI (Public Text Chat)

### Access
- **URL:** https://srhcareai.odia.dev (Public widget)
- **OR:** https://web-83xc1wtub-odia-backends-projects.vercel.app (Direct)

### Conversation Script

**You say:**
```
Hi! I'd like to book an appointment
```

**AI will respond asking for details. Provide:**
```
My name is Samuel Eguale
My email is egualesamuel@gmail.com
My phone is +1234567890
I'd like to book for tomorrow at 2:30 PM
Reason: General checkup
```

**Expected AI Response:**
- AI will call the `book_appointment_with_confirmation` tool
- You'll see: "✅ Appointment booked and confirmation email sent!"
- **Check your email:** egualesamuel@gmail.com

---

## 📞 Option 2: Test VAPI AI (Voice Call)

### Setup Required
1. **Get VAPI Phone Number:**
   - Go to VAPI dashboard: https://dashboard.vapi.ai
   - Find your assistant's phone number

2. **Sync VAPI Configuration First:**
   - Log into admin dashboard: https://srhbackend.odia.dev
   - Go to "Agent Config" page
   - Click "Sync to VAPI" button
   - Wait for success message

### Make Voice Call

**Call the VAPI number and say:**
```
"Hi, I'd like to book an appointment"
```

**VAPI AI will ask for:**
- Your name
- Your email address
- Phone number
- Preferred date
- Preferred time
- Reason for visit

**Provide:**
```
Name: Samuel Eguale
Email: egualesamuel@gmail.com
Phone: +1234567890
Date: Tomorrow
Time: 2:30 PM
Reason: General checkup
```

**Expected AI Response:**
- AI will say: "I'll send you a confirmation email"
- AI calls `send_appointment_confirmation` tool automatically
- **Check your email:** egualesamuel@gmail.com

---

## 📧 Email Confirmation Expected

After booking via either method, you should receive an email with:

**Subject:** Appointment Confirmation - Serenity Royale Hospital

**Contents:**
- Patient name: Samuel Eguale
- Date: [Your chosen date]
- Time: [Your chosen time]
- Reason: General checkup
- Confirmation number (if n8n provides)

---

## 🔍 Verify in Database

**Check Supabase Audit Logs:**
1. Go to: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq
2. Navigate to: Table Editor → `audit_logs`
3. Look for: `action = 'appointment_confirmation_sent'`
4. Verify: email field shows `egualesamuel@gmail.com`

---

## ⚠️ Prerequisites for Email to Work

**n8n Webhook Must Be Configured:**

The following n8n webhook must be set up and running:

**Webhook URL:** `${N8N_WEBHOOK_BASE}/appointment-confirmation`

**Expected Payload:**
```json
{
  "name": "Samuel Eguale",
  "email": "egualesamuel@gmail.com",
  "phone": "+1234567890",
  "date": "2025-11-08",
  "time": "2:30 PM",
  "reason": "General checkup",
  "conversation_id": "uuid",
  "call_id": "uuid",
  "source": "public_widget" or "vapi_voice"
}
```

**n8n Workflow Should:**
1. Receive webhook payload
2. Format email template with appointment details
3. Send email via Gmail/SendGrid/etc to `email` field
4. Return success response

---

## 🧪 Testing Checklist

### Groq AI (Text Chat) ✅
- [ ] Open public widget
- [ ] Start conversation about booking appointment
- [ ] Provide all details (name, email, phone, date, time, reason)
- [ ] AI calls `book_appointment_with_confirmation` tool
- [ ] See success message in chat
- [ ] Check email inbox for confirmation

### VAPI AI (Voice Call) ✅
- [ ] Sync VAPI config from admin dashboard
- [ ] Call VAPI phone number
- [ ] Tell AI you want to book appointment
- [ ] Provide all details verbally
- [ ] AI says it will send confirmation email
- [ ] AI calls `send_appointment_confirmation` tool
- [ ] Check email inbox for confirmation

### Email Verification ✅
- [ ] Email received at: egualesamuel@gmail.com
- [ ] Subject line is appropriate
- [ ] Email contains all appointment details
- [ ] Email is professionally formatted
- [ ] Email includes hospital contact info

### Database Verification ✅
- [ ] Check `audit_logs` table
- [ ] Find `appointment_confirmation_sent` action
- [ ] Verify email address is correct
- [ ] Check timestamp is recent

---

## 🚨 Troubleshooting

### If Email Doesn't Arrive

1. **Check n8n Webhook:**
   ```bash
   # Test n8n webhook directly
   curl -X POST ${N8N_WEBHOOK_BASE}/appointment-confirmation \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "egualesamuel@gmail.com",
       "date": "2025-11-08",
       "time": "2:30 PM",
       "reason": "Test appointment"
     }'
   ```

2. **Check Edge Function Logs:**
   - VAPI: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/functions/vapi-webhook/logs
   - Groq: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/functions/groq-chat/logs

3. **Check Environment Variables:**
   - `N8N_WEBHOOK_BASE` must be set in:
     - Supabase Edge Function secrets (for VAPI)
     - Frontend `.env.local` as `VITE_N8N_WEBHOOK_BASE` (for Groq)

4. **Check Spam Folder:**
   - Email might be in spam/junk folder

---

## 📝 Sample Conversation Flows

### Scenario 1: Quick Booking
```
User: I need an appointment
AI: I'd be happy to help! Could you provide:
    - Your full name
    - Email address
    - Phone number
    - Preferred date and time
    - Reason for visit

User: Samuel Eguale, egualesamuel@gmail.com, +1234567890,
      tomorrow at 2:30 PM, general checkup

AI: Perfect! I'm booking your appointment...
    ✅ Appointment booked for tomorrow at 2:30 PM!
    You'll receive a confirmation email at egualesamuel@gmail.com shortly.
```

### Scenario 2: Step by Step
```
User: Book appointment
AI: I'll help you book an appointment. What's your name?

User: Samuel Eguale
AI: Great! What's your email address?

User: egualesamuel@gmail.com
AI: And your phone number?

User: +1234567890
AI: When would you like to come in?

User: Tomorrow at 2:30 PM
AI: What's the reason for your visit?

User: General checkup
AI: Perfect! Booking your appointment...
    ✅ Done! Confirmation email sent to egualesamuel@gmail.com
```

---

## 🎯 Success Criteria

**Test is SUCCESSFUL when:**
1. ✅ AI successfully collects all appointment details
2. ✅ AI calls the correct tool (book_appointment_with_confirmation or send_appointment_confirmation)
3. ✅ Tool execution succeeds without errors
4. ✅ Email arrives at egualesamuel@gmail.com within 2 minutes
5. ✅ Email contains all correct appointment details
6. ✅ Audit log entry is created in Supabase

**Test is FAILED when:**
- ❌ AI doesn't call the tool
- ❌ Tool execution errors
- ❌ No email received after 5 minutes
- ❌ Email contains wrong/missing information
- ❌ No audit log entry created

---

## 🔗 Quick Links

- **Public Widget:** https://srhcareai.odia.dev
- **Admin Dashboard:** https://srhbackend.odia.dev
- **Supabase Dashboard:** https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq
- **VAPI Dashboard:** https://dashboard.vapi.ai
- **Email to Check:** egualesamuel@gmail.com

---

**Ready to test!** Choose either Groq AI (text) or VAPI AI (voice) and follow the conversation script above. 🚀
