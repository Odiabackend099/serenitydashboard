# 🚀 Serenity Care AI - Quick Deployment Guide

**Repository Location:** `/Users/odiadev/Desktop/serenity dasboard`

**Note:** ✅ Repository is already cloned to your local machine. Skip git clone step.

---

## 📦 Step 1: Install Dependencies

```bash
cd "/Users/odiadev/Desktop/serenity dasboard"
npm install
```

---

## 🔐 Step 2: Set Environment Variables

### Frontend (.env in apps/web/)

```bash
cd apps/web
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://yfrpxqvjshwaaomgcaoq.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF
```

### Supabase Secrets

```bash
export SUPABASE_ACCESS_TOKEN=your_supabase_access_token

supabase secrets set GROQ_API_KEY="your_groq_api_key_here" --project-ref yfrpxqvjshwaaomgcaoq
supabase secrets set N8N_WEBHOOK_BASE="https://cwai97.app.n8n.cloud/webhook" --project-ref yfrpxqvjshwaaomgcaoq
supabase secrets set SUPABASE_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co" --project-ref yfrpxqvjshwaaomgcaoq
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here" --project-ref yfrpxqvjshwaaomgcaoq
```

---

## ☁️ Step 3: Deploy Edge Function

```bash
cd "/Users/odiadev/Desktop/serenity dasboard"
supabase functions deploy groq-chat --project-ref yfrpxqvjshwaaomgcaoq
```

---

## 🔄 Step 4: Import n8n Workflow

1. Go to: https://cwai97.app.n8n.cloud
2. Click "Workflows" → "Import from File"
3. Select: `n8n/Serenity Workflow - Ready to Import.json`
4. Activate the workflow (toggle to green)
5. Configure credentials:
   - Gmail for emails
   - Supabase connection

---

## 🌐 Step 5: Deploy Frontend

```bash
cd "/Users/odiadev/Desktop/serenity dasboard"
export VERCEL_TOKEN=your_vercel_token_here
vercel --prod
```

---

## ✅ Step 6: Test Deployment

```bash
# Test appointment booking
node send-test-appointment-email.js
```

**Expected:**
- ✅ HTTP 200 response
- ✅ Email sent to egualesamuel@gmail.com
- ✅ Appointment in database

---

## 🔍 Verify

### Check n8n Executions:
https://cwai97.app.n8n.cloud/executions

**Expected:** All nodes GREEN (except SMS with fake phone)

### Check Email:
egualesamuel@gmail.com should receive confirmation email

---

## 🎯 Quick Links

| Service | URL |
|---------|-----|
| **n8n Dashboard** | https://cwai97.app.n8n.cloud |
| **Supabase** | https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq |
| **Edge Function** | https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat |

---

**Status:** ✅ Ready to Deploy

*Repository already cloned at: /Users/odiadev/Desktop/serenity dasboard*
