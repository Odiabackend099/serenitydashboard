# 🚀 START HERE - New Developer Guide

Welcome to the Serenity Care AI Dashboard! This guide will get you up and running in **less than 5 minutes**.

---

## 📖 Quick Navigation

### For Developers (Start Here!)
1. **[README.md](README.md)** - Main project documentation (3-step quick start)
2. **[setup.sh](setup.sh)** - Automated setup script (recommended)
3. **[.env.example](.env.example)** - Environment variables template

### For Understanding the Project
4. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Complete architecture overview
5. **[CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md)** - Code quality analysis
6. **[CLEANUP_REPORT.md](CLEANUP_REPORT.md)** - Maintenance recommendations

### For Deployment
7. **[QUICK_DEPLOYMENT_GUIDE.md](QUICK_DEPLOYMENT_GUIDE.md)** - Fast deployment
8. **[N8N_WORKFLOW_COMPLETE_FIX.md](N8N_WORKFLOW_COMPLETE_FIX.md)** - n8n setup
9. **[vercel.json](vercel.json)** - Vercel configuration

### Project Summary
10. **[DELIVERY_SUMMARY.md](DELIVERY_SUMMARY.md)** - Complete project analysis report

---

## ⚡ Ultra-Quick Start (2 Options)

### Option 1: Automated Setup (Recommended)

```bash
# Run the automated setup script
bash setup.sh
```

The script will:
- ✅ Check prerequisites (Node.js, npm, git)
- ✅ Help you configure environment variables
- ✅ Install dependencies
- ✅ Verify the installation
- ✅ Optional: Setup database and generate types

### Option 2: Manual Setup (3 Steps)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run the app
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🔑 Required Credentials

You'll need accounts and API keys from:

1. **Supabase** (Database & Auth) - [Get it here](https://supabase.com/dashboard)
   - Project URL
   - Anon Key
   - Service Role Key

2. **Groq** (AI) - [Get it here](https://console.groq.com/keys)
   - API Key

3. **n8n** (Workflows) - Your n8n instance
   - Webhook Base URL
   - Webhook Secret

4. **Optional:**
   - VAPI (Voice AI) - [vapi.ai](https://vapi.ai)
   - Twilio (SMS/WhatsApp) - [twilio.com](https://twilio.com)

**Detailed instructions:** See [.env.example](.env.example)

---

## 📁 Project Structure (Simplified)

```
serenitydashboard/
├── apps/
│   ├── web/         # Frontend (React + Vite)
│   └── api/         # Backend (Express)
├── supabase/
│   ├── functions/   # Edge Functions (AI proxy, webhooks)
│   └── migrations/  # Database schema
├── n8n/             # Workflow automation
├── docs/            # Additional documentation
├── README.md        # Main documentation
├── setup.sh         # Automated setup
└── .env.example     # Environment template
```

---

## 🛠️ Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests

# Deployment
vercel --prod        # Deploy frontend to Vercel
supabase functions deploy groq-chat  # Deploy Edge Functions
supabase db push     # Run database migrations

# Testing
node send-test-appointment-email.js  # Test email delivery
node test-chat-widget-booking.js     # Test booking flow
```

---

## 🎯 What This Application Does

**Serenity Care AI** is a HIPAA-compliant healthcare appointment booking system with:

- 🤖 **AI-Powered Booking** - Natural language appointment scheduling
- 💬 **Multi-Channel** - Web chat, WhatsApp, Voice calls
- 📧 **Automated Notifications** - Email/SMS confirmations
- 📊 **Analytics Dashboard** - Real-time business intelligence
- 🔒 **HIPAA Compliant** - Audit logging and security
- 📱 **Progressive Web App** - Works offline, installable

---

## 🚨 Troubleshooting

### "npm install" fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start
```bash
# Check if port 5173 is in use
lsof -i :5173
# Or use a different port
PORT=3000 npm run dev
```

### Environment variable errors
- Verify all required variables in `.env`
- Compare with `.env.example`
- Check for typos in variable names

**More help:** See [README.md](README.md#troubleshooting)

---

## 📚 Learning Path

### Day 1: Setup & Understanding
1. Run `bash setup.sh`
2. Read [README.md](README.md)
3. Read [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
4. Explore the code in `apps/web/src/`

### Day 2: Development
1. Make a small change
2. Test with `npm run dev`
3. Review [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md)
4. Run tests: `npm test`

### Day 3: Deployment
1. Read [QUICK_DEPLOYMENT_GUIDE.md](QUICK_DEPLOYMENT_GUIDE.md)
2. Set up n8n workflow
3. Deploy to Vercel
4. Test end-to-end

---

## 🎓 Key Concepts

### Architecture
- **Frontend:** React app (Vite build)
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI:** Groq (text) + VAPI (voice)
- **Automation:** n8n workflows

### Data Flow
```
User → Web Chat → Edge Function → AI → n8n → Email/SMS
                              ↓
                         Database
```

### Key Technologies
- React 18 + TypeScript
- Supabase (database + auth)
- Groq AI (Llama 3.1)
- n8n (workflow automation)
- Tailwind CSS (styling)

---

## ✅ Quick Checklist

Before you start developing:

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account created
- [ ] Groq API key obtained
- [ ] n8n instance set up
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured
- [ ] App runs (`npm run dev`)

---

## 💡 Pro Tips

1. **Use the automated setup:** `bash setup.sh` saves time
2. **Read the overview first:** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
3. **Check code quality guidelines:** [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md)
4. **Test frequently:** Use the test scripts in root directory
5. **Ask for help:** Check documentation or open an issue

---

## 📞 Get Help

- 📖 Read [README.md](README.md)
- 🏗️ Check [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- 🐛 Review [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md)
- 💬 Open a GitHub issue

---

## 🎉 Ready to Start!

You're all set! Here's your first command:

```bash
bash setup.sh
```

Or if you prefer manual setup:

```bash
npm install && npm run dev
```

**Happy coding! 🚀**

---

*For detailed information, see [README.md](README.md) or [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)*
