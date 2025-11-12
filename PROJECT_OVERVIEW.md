# 🏥 Serenity Care AI - Project Overview

**Version**: 3.0
**Status**: ✅ Production Ready
**Deployment Date**: November 2025
**Repository**: https://github.com/Odiabackend099/serenitydashboard.git

---

## 📖 Table of Contents

1. [Application Purpose](#application-purpose)
2. [Key Features](#key-features)
3. [Architecture Diagram](#architecture-diagram)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Current vs Desired State](#current-vs-desired-state)
7. [Integration Points](#integration-points)

---

## 🎯 Application Purpose

**Serenity Care AI** is an enterprise-grade, HIPAA-compliant healthcare appointment booking and patient communication management system. It serves as a **Digital AI Assistant for Business Owners** in the healthcare industry, automating:

- Multi-channel patient communication (Web, WhatsApp, Voice)
- Intelligent appointment scheduling via AI
- Automated email/SMS confirmations
- Real-time conversation management
- Business analytics and reporting

**Target Users:**
- Hospital administrators
- Medical receptionists
- Call center handlers
- Patients (public interface)

---

## ✨ Key Features

### 1. Multi-Channel Communication
- **Web Chat**: AI-powered chat widget (text + voice)
- **WhatsApp**: Twilio Business API integration
- **Voice Calls**: VAPI voice AI assistant
- **Real-time Updates**: WebSocket + Supabase Realtime

### 2. Intelligent Appointment Booking
- **AI-Powered**: Groq LLM with 54 specialized tools
- **Natural Language**: "Book appointment tomorrow at 2 PM"
- **Auto-Confirmation**: Email + SMS + WhatsApp notifications
- **Calendar Integration**: FullCalendar with availability management

### 3. Workflow Automation
- **n8n Integration**: Visual workflow builder
- **Email Automation**: Gmail API integration
- **SMS/WhatsApp**: Twilio automated messaging
- **Database Sync**: Automatic Supabase updates

### 4. Analytics & Reporting
- **Conversation Metrics**: Channel-wise analytics
- **Appointment Trends**: Booking patterns and insights
- **Real-time Dashboard**: Live statistics with Recharts

### 5. Security & Compliance
- **HIPAA Compliant**: Audit logging for PHI
- **Row-Level Security**: Database-level access control
- **JWT Authentication**: Supabase Auth
- **Role-Based Access**: Admin, Receptionist, Call Handler

### 6. Progressive Web App (PWA)
- **Offline Support**: Service worker caching
- **Installable**: Add to homescreen
- **Push Notifications**: (Future feature)

---

## 🏗️ Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                             │
├─────────────────┬───────────────────┬────────────────────────────┤
│   Web Chat      │    WhatsApp       │      Voice (VAPI)          │
│  (React PWA)    │  (Twilio API)     │   (Voice Assistant)        │
└────────┬────────┴─────────┬─────────┴─────────┬──────────────────┘
         │                  │                   │
         ▼                  ▼                   ▼
┌───────────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (Deno Runtime)               │
├─────────────────┬───────────────────┬────────────────────────────┤
│  groq-chat      │  vapi-webhook     │  twilio-whatsapp-webhook   │
│  (AI Proxy)     │  (Voice Events)   │  (WhatsApp Handler)        │
└────────┬────────┴─────────┬─────────┴─────────┬──────────────────┘
         │                  │                   │
         ▼                  ▼                   ▼
┌───────────────────────────────────────────────────────────────────┐
│                     GROQ AI (LLM Engine)                          │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Tool Registry (54 admin + 1 public tools)               │    │
│  │  - book_appointment_with_confirmation                    │    │
│  │  - schedule_appointment, update_appointment              │    │
│  │  - send_message, get_conversation_history                │    │
│  │  - create_profile, search_patients                       │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────┬──────────────────────────────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────────────────────────────┐
│                     N8N WORKFLOW ENGINE                           │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Serenity Workflow - Ready to Import.json               │    │
│  │  ├── Webhook Trigger (serenity-webhook-v2)              │    │
│  │  ├── Route by Action (Switch node)                      │    │
│  │  ├── Create Appointment (Supabase insert)               │    │
│  │  ├── Send Email (Gmail API)                             │    │
│  │  ├── Send SMS (Twilio)                                  │    │
│  │  └── Send WhatsApp (Twilio Business API)                │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────┬──────────────────────────────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────────────────────────────┐
│              SUPABASE DATABASE (PostgreSQL 15)                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Tables:                                                 │    │
│  │  - profiles (users with roles)                           │    │
│  │  - conversations (multi-channel threads)                 │    │
│  │  - messages (chat history)                               │    │
│  │  - appointments (booking records)                        │    │
│  │  - appointment_audit_log (HIPAA compliance)              │    │
│  │  - agent_config (AI settings)                            │    │
│  │  - scheduled_followups (reminders)                       │    │
│  └──────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────┘

DEPLOYMENT:
- Frontend: Vercel (https://web-12yu46m6q-odia-backends-projects.vercel.app)
- Backend: Supabase Cloud (yfrpxqvjshwaaomgcaoq.supabase.co)
- Workflows: n8n Cloud (cwai97.app.n8n.cloud)
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.3 | Type safety |
| Vite | 5.4.10 | Build tool |
| Tailwind CSS | 3.4.13 | Styling |
| React Router | 6.26.2 | Routing |
| TanStack Query | 5.56.2 | State management |
| Lucide React | 0.552.0 | Icons |
| Recharts | 3.3.0 | Analytics charts |
| FullCalendar | 6.1.11 | Calendar UI |
| vite-plugin-pwa | 1.1.0 | PWA support |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | PostgreSQL 15 | Database + Auth |
| Deno | Latest | Edge Functions runtime |
| Express | 4.19.2 | API server (apps/api) |
| Prisma | 5.18.0 | ORM |
| Socket.io | 4.7.5 | WebSockets |

### AI & Automation
| Service | Purpose |
|---------|---------|
| Groq (llama-3.1-8b-instant) | Text AI processing |
| Groq (llama-3.1-70b-versatile) | Complex AI tasks |
| VAPI | Voice AI assistant |
| n8n Cloud | Workflow automation |

### Communication
| Service | Purpose | Credentials |
|---------|---------|-------------|
| Gmail API | Email automation | OAuth2 via n8n |
| Twilio SMS | Text messaging | Set in .env |
| Twilio WhatsApp | WhatsApp messaging | Set in .env |

### Deployment
| Service | Purpose | URL |
|---------|---------|-----|
| Vercel | Frontend hosting | web-12yu46m6q-odia-backends-projects.vercel.app |
| Supabase Cloud | Backend + Database | yfrpxqvjshwaaomgcaoq.supabase.co |
| n8n Cloud | Workflow engine | cwai97.app.n8n.cloud |

---

## 📁 Project Structure

```
serenity-dashboard/
├── .github/                      # GitHub Actions workflows
├── .vercel/                      # Vercel deployment config
├── apps/
│   ├── web/                      # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/       # Reusable React components
│   │   │   │   ├── ChatWidget.tsx         (41KB - Main chat interface)
│   │   │   │   ├── AnalyticsDashboard.tsx (19KB - Metrics)
│   │   │   │   ├── ProtectedRoute.tsx     (Auth guard)
│   │   │   │   └── ThemeToggle.tsx        (Dark mode)
│   │   │   ├── pages/            # Main application pages
│   │   │   │   ├── Conversations.tsx      (29KB - Multi-channel chat)
│   │   │   │   ├── Calendar.tsx           (Appointment booking)
│   │   │   │   ├── Analytics.tsx          (Dashboard)
│   │   │   │   ├── AgentConfig.tsx        (AI settings)
│   │   │   │   ├── Settings.tsx           (User prefs)
│   │   │   │   └── Login.tsx              (Auth)
│   │   │   ├── lib/              # Core utilities
│   │   │   │   ├── groqTools.ts           (65KB - AI tools registry)
│   │   │   │   ├── n8nWebhooks.ts         (Workflow integration)
│   │   │   │   ├── supabase.ts            (DB client)
│   │   │   │   └── database.types.ts      (Generated types)
│   │   │   ├── contexts/         # React Context providers
│   │   │   ├── services/         # API service layer
│   │   │   ├── utils/            # Helper functions
│   │   │   ├── App.tsx           # Root component
│   │   │   └── main.tsx          # Entry point
│   │   ├── public/               # Static assets
│   │   ├── dist/                 # Build output (gitignored)
│   │   ├── .env.local            # Environment variables
│   │   ├── vite.config.ts        # Vite configuration
│   │   ├── tailwind.config.js    # Tailwind config
│   │   ├── tsconfig.json         # TypeScript config
│   │   └── package.json          # Dependencies
│   └── api/                      # Backend API (Express)
│       ├── src/                  # API source code
│       ├── prisma/               # Prisma schema
│       └── package.json          # API dependencies
├── supabase/
│   ├── functions/                # Edge Functions (Deno)
│   │   ├── groq-chat/            # AI proxy (27KB)
│   │   ├── vapi-webhook/         # Voice AI events
│   │   ├── twilio-whatsapp-webhook/  # WhatsApp handler
│   │   ├── assistant-call/       # Tool execution
│   │   ├── google-calendar-sync/ # Calendar integration
│   │   └── _shared/              # Shared utilities
│   │       ├── cors.ts
│   │       ├── rate-limiter.ts
│   │       └── hipaa.ts          # HIPAA audit logging
│   ├── migrations/               # Database migrations (13 files)
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00007_create_appointments_table_v2.sql
│   │   └── 00020_appointment_management_enhancements.sql
│   └── README.md
├── n8n/                          # Workflow automation
│   ├── Serenity Workflow - Ready to Import.json  # Main workflow
│   ├── README.md
│   └── SETUP_GUIDE.md
├── packages/
│   └── shared/                   # Shared TypeScript types
├── scripts/                      # Automation scripts
│   ├── setup/
│   ├── test/
│   └── diagnostics/
├── docs/                         # Documentation (100+ files)
│   ├── START_HERE.md
│   ├── ARCHITECTURE_DIAGRAM.md
│   ├── N8N_WORKFLOW_IMPORT.md
│   └── ...
├── node_modules/                 # Dependencies (gitignored)
├── package.json                  # Root package.json (workspaces)
├── package-lock.json             # Dependency lock file
├── vercel.json                   # Vercel deployment config
├── .gitignore                    # Git ignore rules
└── README.md                     # Main documentation
```

---

## 🔄 Current vs Desired State

### ✅ Current State (Production Ready)

**Strengths:**
- ✅ Fully deployed and operational
- ✅ Multi-channel support (Web, WhatsApp, Voice)
- ✅ AI-powered appointment booking
- ✅ Automated workflows (n8n)
- ✅ HIPAA-compliant audit logging
- ✅ PWA support with offline capabilities
- ✅ Comprehensive documentation (100+ files)
- ✅ Role-based access control
- ✅ Real-time updates

**Areas for Improvement:**
- ⚠️ 100+ markdown documentation files (needs consolidation)
- ⚠️ Multiple .env files (needs standardization)
- ⚠️ Some debug code/console.logs still present
- ⚠️ Missing automated setup script
- ⚠️ Test files scattered across root directory
- ⚠️ Missing comprehensive .gitignore
- ⚠️ Package.json scripts could be more intuitive

### 🎯 Desired State (Plug-and-Play)

**Goal**: A developer should be able to:

```bash
git clone https://github.com/Odiabackend099/serenitydashboard.git
cd serenitydashboard
cp .env.example .env
# Add Supabase, Vercel, n8n credentials to .env
npm install
npm run dev
# ✅ Application runs successfully
```

**Required Changes:**
1. ✅ Create single `.env.example` with all variables documented
2. ✅ Create automated `setup.sh` script
3. ✅ Consolidate documentation into key files
4. ✅ Clean up debug code and console.logs
5. ✅ Standardize package.json scripts
6. ✅ Enhance .gitignore for modern workflows
7. ✅ Move test files to organized directory
8. ✅ Create comprehensive README.md
9. ✅ Add health check endpoints
10. ✅ Optimize dependency tree

---

## 🔗 Integration Points

### 1. Supabase (yfrpxqvjshwaaomgcaoq.supabase.co)

**Services Used:**
- PostgreSQL database (7 main tables)
- Realtime subscriptions (WebSocket)
- Edge Functions (8 Deno functions)
- Authentication (JWT-based)
- Storage (for attachments)

**Configuration:**
- URL: `https://yfrpxqvjshwaaomgcaoq.supabase.co`
- Anon Key: Required in `.env`
- Service Role Key: Required for Edge Functions

**RLS Policies:**
- Profiles: Users can read own profile
- Conversations: Based on user role
- Messages: Based on conversation access
- Appointments: Admin + receptionist access

### 2. Vercel (web-12yu46m6q-odia-backends-projects.vercel.app)

**Configuration:**
- Framework: Vite
- Build Command: `npm run build -w apps/web`
- Output Directory: `apps/web/dist`
- Auto-deployment: GitHub integration

**Environment Variables:**
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_GROQ_MODEL
- VITE_VAPI_ASSISTANT_ID
- VITE_VAPI_PUBLIC_KEY

### 3. n8n (cwai97.app.n8n.cloud)

**Workflow:** Serenity Workflow - Ready to Import.json

**Triggers:**
- Webhook: `/webhook/serenity-webhook-v2`
- Actions: book_appointment, send_email, send_sms, send_whatsapp

**Integrations:**
- Gmail API (OAuth2)
- Twilio SMS
- Twilio WhatsApp Business API
- Supabase (database inserts)

**Configuration Required:**
- Gmail credentials
- Twilio credentials
- Supabase connection
- Webhook secret

### 4. Groq AI (api.groq.com)

**Models:**
- llama-3.1-8b-instant (fast responses)
- llama-3.1-70b-versatile (complex tasks)

**Features:**
- Tool calling (54 admin tools + 1 public)
- Streaming responses
- Function execution

**Proxy:** Edge Function `groq-chat` (hides API key)

### 5. VAPI Voice AI

**Assistant ID:** 6702f8c3-9f95-47ba-afc1-698cc822c274
**Public Key:** 47e779d9-8beb-4a02-826b-efa15f13f24a

**Features:**
- Voice appointment booking
- Natural language processing
- Call transcription

**Webhook:** `/supabase/functions/vapi-webhook`

### 6. Twilio

**Account SID:** Set in .env (TWILIO_ACCOUNT_SID)
**WhatsApp Number:** Set in .env (TWILIO_WHATSAPP_NUMBER)

**Services:**
- SMS messaging
- WhatsApp Business API
- Voice (future feature)

**Webhook:** `/supabase/functions/twilio-whatsapp-webhook`

---

## 📊 Database Schema

### Main Tables

#### profiles
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- role (TEXT: admin | receptionist | call_handler)
- avatar_url (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### conversations
```sql
- id (UUID, PK)
- channel (TEXT: whatsapp | voice | webchat)
- patient_ref (TEXT) -- phone or email
- status (TEXT: active | closed)
- metadata (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### messages
```sql
- id (UUID, PK)
- conversation_id (UUID, FK)
- from (TEXT: patient | ai | staff)
- content (TEXT)
- metadata (JSONB)
- created_at (TIMESTAMP)
```

#### appointments
```sql
- id (UUID, PK)
- conversation_id (UUID, FK, nullable)
- patient_ref (TEXT, NOT NULL)
- patient_name (TEXT)
- patient_email (TEXT)
- patient_phone (TEXT)
- appointment_date (DATE)
- appointment_time (TIME)
- appointment_type (TEXT)
- reason (TEXT)
- status (TEXT: pending | confirmed | cancelled)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### appointment_audit_log
```sql
- id (UUID, PK)
- appointment_id (UUID, FK)
- action (TEXT)
- changed_by (UUID, FK)
- changes (JSONB)
- timestamp (TIMESTAMP)
```

---

## 🔐 Security Features

1. **HIPAA Compliance**
   - Audit logging for all PHI access
   - Encrypted data at rest
   - Secure data transmission (HTTPS)
   - Role-based access control

2. **Authentication**
   - JWT-based authentication (Supabase Auth)
   - Session management
   - Role-based route protection

3. **API Security**
   - Rate limiting (10 req/min per IP)
   - CORS protection
   - Input validation (Zod schemas)
   - Helmet.js security headers

4. **Database Security**
   - Row-level security (RLS) policies
   - Prepared statements (SQL injection prevention)
   - Service role key for admin operations

---

## 📈 Performance Optimizations

1. **Frontend**
   - Code splitting with React.lazy
   - PWA caching (Supabase + Groq responses)
   - Image optimization
   - Tailwind CSS purging

2. **Backend**
   - Database indexes on frequently queried fields
   - Edge Functions for low latency
   - Connection pooling (Supabase)

3. **AI**
   - Response streaming
   - Model selection based on complexity
   - Edge Function proxy (reduced latency)

---

## 🧪 Testing Infrastructure

**Test Files:** 30+ scripts in root directory

**Categories:**
- Email verification tests
- Appointment booking tests
- n8n workflow tests
- Chat widget connection tests
- End-to-end workflow tests

**Testing Tools:**
- Node.js test scripts
- Curl-based API tests
- Browser connection tests

---

## 📝 Documentation

**Total:** 100+ markdown files

**Key Documents:**
- START_HERE.md - Quick start guide
- ARCHITECTURE_DIAGRAM.md - System design
- N8N_WORKFLOW_IMPORT.md - Workflow setup
- DEPLOYMENT_GUIDE.md - Production deployment
- QUICK_REFERENCE.md - Command reference

**Categories:**
- Feature documentation (AI tools, appointments, chat)
- Deployment guides (Vercel, Supabase, n8n)
- Testing documentation (results, scripts)
- Security guides (OAuth, secrets management)
- Troubleshooting guides

---

## 🚀 Production Deployment

**Current Deployment:**
- ✅ Frontend: Vercel (auto-deploy from GitHub)
- ✅ Backend: Supabase Cloud
- ✅ Workflows: n8n Cloud
- ✅ Status: Fully operational

**Recent Updates:**
- Nov 12, 2025: Fixed n8n routing and field mapping
- Nov 12, 2025: Email delivery verification completed
- Nov 12, 2025: Chat widget booking flow tested

---

## 📞 Support & Maintenance

**Repository:** https://github.com/Odiabackend099/serenitydashboard.git
**Issues:** GitHub Issues
**Documentation:** See `/docs` directory

**Monitoring:**
- Supabase Dashboard (database metrics)
- Vercel Analytics (frontend performance)
- n8n Execution Logs (workflow status)

---

**Last Updated:** November 12, 2025
**Project Status:** ✅ Production Ready
**Version:** 3.0
