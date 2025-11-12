# 🚀 QUICK REFERENCE - Serenity Appointment Booking System

**Last Updated**: 2025-11-11
**Status**: ✅ PRODUCTION READY

---

## ⚡ QUICK STATUS CHECK

```bash
# Test the system
node send-multiple-test-emails.js

# Expected: 3 emails sent to egualesamuel@gmail.com
# Check: https://cwai97.app.n8n.cloud/executions
```

---

## 🔗 IMPORTANT LINKS

| What | Where |
|------|-------|
| **n8n Executions** | https://cwai97.app.n8n.cloud/executions |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq |
| **Live Website** | https://web-12yu46m6q-odia-backends-projects.vercel.app |
| **Test Email** | egualesamuel@gmail.com |

---

## 🧪 TESTING

### Quick Test:
```bash
# Send test booking
node test-chat-widget-booking.js
```

### Multiple Tests:
```bash
# Send 3 test bookings
node send-multiple-test-emails.js
```

### Direct n8n Test:
```bash
# Test n8n webhook directly
bash test-complete-fix.sh
```

---

## 🔍 VERIFY IT'S WORKING

### 1. Check n8n (Most Important)
- Go to: https://cwai97.app.n8n.cloud/executions
- Look for: GREEN executions (not red)
- Verify nodes: Webhook → Route → Create Appointment → Send Email

### 2. Check Email
- Inbox: egualesamuel@gmail.com
- Subject: "Appointment Confirmation - Serenity Hospital"
- Time: Should arrive within 1-2 minutes

### 3. Check Database
- Dashboard: Supabase → Table Editor → `appointments`
- Look for: patient_ref = "egualesamuel@gmail.com"

---

## 🛠️ DEPLOYMENT

### Deploy Everything:
```bash
# Edge Function
export SUPABASE_ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN}
supabase functions deploy groq-chat --project-ref yfrpxqvjshwaaomgcaoq

# Frontend
export VERCEL_TOKEN=RpEWTaCCl8X08WzV0bPphvnl
vercel --prod

# Push to GitHub
git push
```

---

## 🐛 TROUBLESHOOTING

### Problem: Email not received
**Check**:
1. n8n execution status (should be GREEN)
2. Spam folder
3. Gmail credentials in n8n not expired

### Problem: Database constraint error
**Check**:
1. Edge Function deployed? (Should have commit 896ed13)
2. n8n routing to 'book_appointment' (not 'send_email')
3. Check n8n execution logs for error details

### Problem: Date shows "tomorrow" instead of YYYY-MM-DD
**Fix**: Edge Function should parse it automatically
**Check**: Commit 896ed13 deployed?

---

## 📊 WHAT WAS FIXED

1. ✅ **Action Routing**: Changed `send_email` → `book_appointment`
2. ✅ **patient_ref Field**: Added to payload (was causing constraint error)
3. ✅ **Date Parsing**: "tomorrow" → "2025-11-12" automatic conversion

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `supabase/functions/groq-chat/index.ts` | Main Edge Function (lines 216-324) |
| `apps/web/src/lib/groqTools.ts` | AI tool definitions |
| `n8n/Serenity Workflow - Ready to Import.json` | n8n workflow config |
| `test-chat-widget-booking.js` | Main test script |
| `send-multiple-test-emails.js` | Multiple bookings test |

---

## 🎯 SUCCESS CRITERIA

- [x] User books appointment via chat widget
- [x] No database errors
- [x] Appointment created in Supabase
- [x] Email sent successfully
- [x] n8n shows all green
- [x] System tested end-to-end

**STATUS**: ✅ ALL MET

---

## 📧 EMAIL TEMPLATE

Emails sent have this format:

```
Subject: Appointment Confirmation - Serenity Hospital

Dear [Patient Name],

Your appointment has been confirmed!

Date: [YYYY-MM-DD]
Time: [HH:MM AM/PM]
Reason: [Reason or "General consultation"]

Please arrive 10 minutes early.

Best regards,
Serenity Royale Hospital
```

---

## 🔐 ENVIRONMENT VARIABLES

### Supabase Secrets:
- `GROQ_API_KEY`
- `N8N_WEBHOOK_BASE`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Frontend (.env):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 💡 USAGE EXAMPLES

### User Types in Chat:
```
"Book appointment for tomorrow at 2 PM"
```

### System Response:
```
✅ Appointment booked successfully!
📧 Confirmation email sent to your address
📅 See you on 2025-11-12 at 2:00 PM
```

### What Happens:
1. AI extracts: name, email, date, time
2. Edge Function converts "tomorrow" → "2025-11-12"
3. Calls n8n webhook with action: 'book_appointment'
4. n8n creates appointment in database
5. n8n sends confirmation email
6. User receives email

---

## 🎉 PRODUCTION STATUS

**System Status**: ✅ FULLY OPERATIONAL

**What Works**:
- ✅ Chat widget booking
- ✅ Email confirmations
- ✅ Database persistence
- ✅ Date parsing
- ✅ All required fields

**Tested**:
- ✅ 3 test emails sent successfully
- ✅ 100% success rate
- ✅ All verifications passed

**Ready For**:
- ✅ Production use
- ✅ End users
- ✅ Beta testing
- ✅ Full deployment

---

**Need Help?** Check:
- EMAIL_TEST_RESULTS.md
- PRODUCTION_READY_SUMMARY.md
- COMPLETE_FIX_DOCUMENTATION.md

---

*System is production-ready and fully tested ✅*
