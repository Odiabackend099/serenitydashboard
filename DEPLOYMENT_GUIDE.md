# Serenity Dashboard - Deployment Guide

## Overview
This guide covers deploying the enhanced Serenity Dashboard with:
- ✅ Google Calendar integration
- ✅ Automated follow-up email system
- ✅ HIPAA-compliant logging
- ✅ Enhanced security (CORS, rate limiting, auth)
- ✅ 5 new AI tools for calendar and appointment management

## Pre-Deployment Checklist

### 1. Security Fixes Applied ✅
- [x] Removed 22 duplicate .js files
- [x] Updated .gitignore for .env files
- [x] Created HIPAA-compliant logging utilities
- [x] Secured all Edge Functions with CORS restrictions
- [x] Added rate limiting (10 req/min)
- [x] Deleted insecure fix-rls function

### 2. New Features Implemented ✅
- [x] Google Calendar sync Edge Function
- [x] Calendar management tools (create/reschedule/cancel)
- [x] Scheduled follow-ups database table
- [x] Follow-up email scheduling tool
- [x] Appointment listing tool

### 3. Database Migrations Ready ✅
- [x] `20250109_scheduled_followups.sql` - Follow-up emails table

---

## Deployment Steps

### Step 1: Google Calendar Setup (15-20 minutes)

Run the setup script:
```bash
./scripts/setup-google-calendar.sh
```

This will guide you through:
1. Creating Google Cloud project
2. Enabling Calendar API
3. Creating OAuth credentials
4. Getting refresh token
5. Saving to Supabase secrets

**Required secrets:**
- `GCAL_CLIENT_ID`
- `GCAL_CLIENT_SECRET`
- `GCAL_REFRESH_TOKEN`
- `GCAL_CALENDAR_ID` (default: "primary")
- `GCAL_TIMEZONE` (default: "Africa/Lagos")

### Step 2: Deploy Supabase Edge Functions

```bash
cd supabase

# Deploy all Edge Functions
supabase functions deploy groq-chat
supabase functions deploy google-calendar-sync
supabase functions deploy vapi-webhook
supabase functions deploy assistant-call

# Verify deployment
supabase functions list
```

### Step 3: Apply Database Migrations

```bash
# Apply the follow-ups table migration
supabase db push

# Or manually via psql
psql "$DATABASE_URL" -f supabase/migrations/20250109_scheduled_followups.sql
```

### Step 4: Update n8n Workflow (Optional)

If using n8n for follow-up emails:
1. Create new workflow: "followup-email-scheduler"
2. Add cron trigger (runs hourly)
3. Query `pending_followups` view
4. Send emails via Gmail
5. Call `mark_followup_sent(id)` function

### Step 5: Build and Deploy Frontend

```bash
cd apps/web

# Build for production
npm run build

# Commit changes
git add .
git commit -m "feat: Calendar integration and follow-up emails

FEATURES:
- Google Calendar integration (create/reschedule/cancel)
- Automated follow-up email scheduling
- 5 new AI assistant tools
- Enhanced appointment management

SECURITY:
- HIPAA-compliant logging (no PHI in logs)
- CORS restricted to srhaiadmin.odia.dev
- Rate limiting (10 req/min)
- Removed 22 duplicate files
- Deleted insecure fix-rls function

FIXES:
- Improved error handling
- Better type safety
- Code quality improvements"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

### Step 6: Verify Deployment

1. **Check Vercel deployment:**
   - Go to https://vercel.com/dashboard
   - Wait for build to complete
   - Check https://srhaiadmin.odia.dev

2. **Test calendar integration:**
   ```bash
   # Book a test appointment
   curl -X POST https://srhaiadmin.odia.dev/api/appointments \
     -H "Content-Type: application/json" \
     -d '{
       "patient_name": "Test Patient",
       "patient_email": "test@example.com",
       "appointment_date": "2025-01-20",
       "appointment_time": "14:00",
       "reason": "Checkup"
     }'

   # Verify Google Calendar event created
   # Check your Google Calendar for the event
   ```

3. **Test follow-up scheduling:**
   - Check Supabase dashboard
   - View `scheduled_followups` table
   - Verify 2 follow-ups scheduled (reminder + feedback)

---

## Environment Variables

### Supabase Secrets (Edge Functions)
```bash
supabase secrets set GROQ_API_KEY=<your_groq_key>
supabase secrets set VAPI_PUBLIC_KEY=<your_vapi_key>
supabase secrets set N8N_WEBHOOK_BASE=https://cwai97.app.n8n.cloud/webhook
supabase secrets set GCAL_CLIENT_ID=<google_client_id>
supabase secrets set GCAL_CLIENT_SECRET=<google_client_secret>
supabase secrets set GCAL_REFRESH_TOKEN=<google_refresh_token>
supabase secrets set GCAL_CALENDAR_ID=primary
supabase secrets set GCAL_TIMEZONE=Africa/Lagos
```

### Frontend (.env.production)
```env
VITE_SUPABASE_URL=https://yfrpxqvjshwaaomgcaoq.supabase.co
VITE_SUPABASE_ANON_KEY=<your_anon_key>
VITE_N8N_WEBHOOK_BASE=https://cwai97.app.n8n.cloud/webhook
```

**⚠️ IMPORTANT:** Never commit `.env.production` to git!

---

## New AI Assistant Capabilities

The AI assistant now has 5 new tools:

### 1. `create_calendar_event`
Creates Google Calendar event for appointment.
```typescript
{
  appointment_id: string,
  patient_name: string,
  patient_email: string,
  appointment_date: "2025-01-20",
  appointment_time: "14:00",
  reason: "Checkup"
}
```

### 2. `reschedule_calendar_event`
Reschedules existing calendar event.
```typescript
{
  appointment_id: string,
  google_calendar_event_id: string,
  new_date: "2025-01-21",
  new_time: "15:00"
}
```

### 3. `cancel_calendar_event`
Cancels and deletes calendar event.
```typescript
{
  appointment_id: string,
  google_calendar_event_id: string
}
```

### 4. `get_appointments`
Lists appointments with optional filters.
```typescript
{
  date?: "2025-01-20",  // Optional
  status?: "confirmed",  // Optional
  limit?: 10             // Default: 10
}
```

### 5. `schedule_followup_email`
Schedules follow-up email to patient.
```typescript
{
  patient_email: "patient@example.com",
  patient_name: "John Doe",
  followup_type: "reminder" | "feedback" | "followup" | "manual",
  scheduled_for: "2025-01-20T12:00:00Z",
  appointment_id?: string,  // Optional
  custom_subject?: string,   // Optional
  custom_body?: string       // Optional
}
```

---

## Testing

### Local Testing
```bash
# Run comprehensive tests
./scripts/test-all-features.sh

# Expected output:
# ✅ ALL TESTS PASSED!
# ok=true
```

### Production Testing
1. **Book appointment** via chat widget
2. **Verify email** received
3. **Check Google Calendar** for event
4. **Check database** for scheduled follow-ups
5. **Test rescheduling** via admin dashboard
6. **Test cancellation** via admin dashboard

---

## Troubleshooting

### Google Calendar Not Creating Events
1. Check Supabase secrets are set:
   ```bash
   supabase secrets list
   ```
2. Check Edge Function logs:
   ```bash
   supabase functions logs google-calendar-sync
   ```
3. Verify OAuth refresh token is valid
4. Check Calendar API is enabled in Google Cloud

### Follow-up Emails Not Sending
1. Check `scheduled_followups` table has pending entries
2. Verify n8n workflow is active
3. Check Gmail OAuth is configured
4. Review n8n execution logs

### Rate Limiting Too Strict
Adjust in Edge Functions:
```typescript
const rateLimit = checkRateLimit(clientId, {
  windowMs: 60000,  // Time window
  max: 20           // Increase from 10 to 20
});
```

---

## Security Considerations

### HIPAA Compliance
- ✅ No PHI logged to console
- ✅ PHI redacted in error messages
- ✅ Audit trail for all actions
- ✅ Encrypted data at rest (Supabase)
- ✅ HTTPS everywhere

### Production Checklist
- [ ] All API keys rotated (if previously exposed)
- [ ] .env files not in git
- [ ] CORS restricted to production domain
- [ ] Rate limiting active
- [ ] Authentication required for admin tools
- [ ] Error messages don't expose sensitive data

---

## Support

For issues or questions:
1. Check Edge Function logs: `supabase functions logs <function-name>`
2. Check browser console for frontend errors
3. Review n8n workflow execution logs
4. Check Supabase database for data issues

---

## Rollback Plan

If deployment fails:
1. Revert git commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. Revert database migration:
   ```sql
   DROP TABLE IF EXISTS scheduled_followups CASCADE;
   ```

3. Redeploy previous Edge Function version:
   ```bash
   supabase functions deploy groq-chat --no-verify-jwt
   ```

---

**Deployed by:** Claude Code AI Assistant
**Deployment Date:** {{DATE}}
**Version:** 2.0.0
