# 🏥 Serenity Care AI - Healthcare Digital Assistant

[![Production Status](https://img.shields.io/badge/status-production-brightgreen)](https://web-12yu46m6q-odia-backends-projects.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.6.3-blue)](https://www.typescriptlang.org/)

A production-ready, HIPAA-compliant healthcare appointment booking and patient communication management system powered by AI.

## ✨ Features

- 🤖 **AI-Powered Booking** - Natural language appointment scheduling
- 💬 **Multi-Channel Support** - Web chat, WhatsApp, Voice calls
- 📧 **Automated Workflows** - Email/SMS confirmations via n8n
- 📊 **Real-time Analytics** - Business intelligence dashboard
- 🔒 **HIPAA Compliant** - Audit logging and data security
- 📱 **Progressive Web App** - Offline-capable, installable
- 🎨 **Modern UI** - Dark mode, responsive design

---

## 🚀 Quick Start (3 Simple Steps)

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- Git ([Download](https://git-scm.com))

### Step 1: Clone & Install

```bash
git clone https://github.com/Odiabackend099/serenitydashboard.git
cd serenitydashboard
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your credentials:
# - Supabase URL and keys
# - Groq API key
# - n8n webhook URL
# - Optional: VAPI, Twilio credentials
```

**Need help getting credentials?** See [Environment Setup Guide](#-environment-setup)

### Step 3: Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Environment Setup](#-environment-setup)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🔐 Environment Setup

### Required Credentials

#### 1. Supabase (Database & Auth)

Get from: [https://supabase.com/dashboard](https://supabase.com/dashboard)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find:**
- Dashboard → Settings → API → Project URL
- Dashboard → Settings → API → Project API keys

#### 2. Groq AI (Text AI)

Get from: [https://console.groq.com/keys](https://console.groq.com/keys)

```env
GROQ_API_KEY=gsk_your_key_here
VITE_GROQ_MODEL=llama-3.1-8b-instant
```

#### 3. n8n (Workflow Automation)

Your n8n instance URL:

```env
N8N_WEBHOOK_BASE=https://your-instance.app.n8n.cloud/webhook
N8N_WEBHOOK_SECRET=your_secret_here
```

**Setup:**
1. Import workflow: `n8n/Serenity Workflow - Ready to Import.json`
2. Activate workflow
3. Configure Gmail + Supabase credentials in n8n

### Optional Credentials

#### VAPI (Voice AI)

Get from: [https://vapi.ai/dashboard](https://vapi.ai/dashboard)

```env
VITE_VAPI_ASSISTANT_ID=your_assistant_id
VITE_VAPI_PUBLIC_KEY=your_public_key
```

#### Twilio (SMS/WhatsApp)

Get from: [https://console.twilio.com](https://console.twilio.com)

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📁 Project Structure

```
serenitydashboard/
├── apps/
│   ├── web/                    # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Page components
│   │   │   ├── lib/            # Utilities & integrations
│   │   │   └── App.tsx         # Root component
│   │   └── package.json
│   └── api/                    # Backend API (Express)
├── supabase/
│   ├── functions/              # Edge Functions (Deno)
│   │   ├── groq-chat/          # AI proxy
│   │   ├── vapi-webhook/       # Voice events
│   │   └── twilio-whatsapp-webhook/
│   └── migrations/             # Database migrations
├── n8n/
│   └── Serenity Workflow - Ready to Import.json
├── docs/                       # Documentation
├── .env.example                # Environment template
├── setup.sh                    # Automated setup script
├── package.json                # Root dependencies
└── README.md                   # This file
```

---

## 🛠️ Available Scripts

### Development

```bash
npm run dev         # Start dev server (http://localhost:5173)
npm run dev:api     # Start backend API only
npm run dev:web     # Start frontend only
```

### Building

```bash
npm run build       # Build for production
npm run build:web   # Build frontend only
npm run build:api   # Build backend only
```

### Testing

```bash
npm test                              # Run all tests
node send-test-appointment-email.js   # Test email delivery
node test-chat-widget-booking.js      # Test booking flow
```

### Deployment

```bash
# Deploy Edge Functions
supabase functions deploy groq-chat --project-ref YOUR_PROJECT_ID

# Deploy to Vercel
vercel --prod
```

---

## 🚀 Deployment

### Vercel (Frontend)

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Framework: Vite

2. **Configure Environment Variables**
   - Add all `VITE_*` variables from `.env`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Supabase (Backend)

1. **Deploy Edge Functions**
   ```bash
   supabase functions deploy groq-chat --project-ref YOUR_PROJECT_ID
   ```

2. **Run Migrations**
   ```bash
   supabase db push
   ```

### n8n (Workflows)

1. Go to your n8n instance
2. Import `n8n/Serenity Workflow - Ready to Import.json`
3. Configure credentials:
   - Gmail OAuth2
   - Supabase connection
   - Twilio (if using SMS/WhatsApp)
4. Activate workflow

**Detailed guides:**
- [Deployment Guide](QUICK_DEPLOYMENT_GUIDE.md)
- [n8n Setup](n8n/README.md)
- [Supabase Setup](supabase/README.md)

---

## 🧪 Testing

### Manual Testing

```bash
# Test appointment booking
node send-test-appointment-email.js

# Test chat widget
open apps/web/test-chat-widget-connection.html

# Test n8n webhook
bash test-all-endpoints.sh
```

### Verification

1. **Check n8n Executions:** [https://your-instance.app.n8n.cloud/executions](https://your-instance.app.n8n.cloud/executions)
2. **Check Email:** Look for confirmation at test email
3. **Check Database:** Verify appointment in Supabase dashboard

---

## 📚 Documentation

### Quick References
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Architecture & tech stack
- [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md) - Code quality report
- [QUICK_DEPLOYMENT_GUIDE.md](QUICK_DEPLOYMENT_GUIDE.md) - Deployment steps

### Detailed Guides
- [docs/START_HERE.md](docs/START_HERE.md) - Getting started guide
- [docs/ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md) - System architecture
- [n8n/README.md](n8n/README.md) - Workflow automation setup
- [supabase/README.md](supabase/README.md) - Database & Edge Functions

---

## 🐛 Troubleshooting

### Common Issues

#### "npm install" fails

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Frontend won't start

```bash
# Check if port 5173 is in use
lsof -i :5173

# Use different port
PORT=3000 npm run dev
```

#### Database connection errors

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Check Supabase project status in dashboard
- Ensure migrations are up to date: `supabase db push`

#### n8n webhook not working

1. Check webhook is active in n8n dashboard
2. Verify `N8N_WEBHOOK_BASE` in `.env`
3. Check n8n execution logs for errors
4. Re-import workflow if needed

### Getting Help

- 📖 Check [docs/](docs/) directory
- 🐛 [Open an issue](https://github.com/Odiabackend099/serenitydashboard/issues)
- 💬 Review existing documentation files

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18.3 + TypeScript 5.6
- **Build Tool:** Vite 5.4
- **UI:** Tailwind CSS 3.4
- **State:** TanStack Query 5.5
- **Icons:** Lucide React
- **Charts:** Recharts
- **Calendar:** FullCalendar

### Backend
- **Database:** Supabase (PostgreSQL 15)
- **Auth:** Supabase Auth (JWT)
- **Edge Functions:** Deno runtime
- **API:** Express 4.19
- **ORM:** Prisma 5.18

### AI & Automation
- **Text AI:** Groq (Llama 3.1)
- **Voice AI:** VAPI
- **Workflows:** n8n Cloud
- **Email:** Gmail API
- **SMS/WhatsApp:** Twilio

### Deployment
- **Frontend:** Vercel
- **Backend:** Supabase Cloud
- **Workflows:** n8n Cloud

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Please ensure:**
- Code follows existing style
- Tests pass
- Documentation is updated
- Commit messages are clear

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Groq](https://groq.com) - AI processing
- [n8n](https://n8n.io) - Workflow automation
- [Vercel](https://vercel.com) - Frontend hosting
- [VAPI](https://vapi.ai) - Voice AI
- [Twilio](https://twilio.com) - Communication APIs

---

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/Odiabackend099/serenitydashboard/issues)
- **Email:** support@example.com

---

## 🎯 Project Status

**Version:** 3.0
**Status:** ✅ Production Ready
**Last Updated:** November 12, 2025

**Recent Updates:**
- ✅ Fixed n8n workflow routing
- ✅ Completed email delivery system
- ✅ Enhanced chat widget functionality
- ✅ Improved TypeScript error handling

---

<div align="center">

**Made with ❤️ for Healthcare**

[Website](https://web-12yu46m6q-odia-backends-projects.vercel.app) · [Documentation](docs/) · [Report Bug](https://github.com/Odiabackend099/serenitydashboard/issues)

</div>
