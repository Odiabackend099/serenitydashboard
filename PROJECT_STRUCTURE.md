# 📁 Serenity Care AI - Project Structure

**Last Updated:** November 12, 2025
**Status:** ✅ Clean & Organized

---

## 🎯 Quick Overview

This document provides a visual map of the cleaned and organized project structure.

---

## 📂 Root Directory (Clean!)

```
serenity-dashboard/
├── 📄 Core Documentation (6 files)
│   ├── README.md                      # Start here - Main docs
│   ├── START_HERE_NEW_DEVELOPER.md    # Quick start for new devs
│   ├── PROJECT_OVERVIEW.md            # Architecture overview
│   ├── CODE_REVIEW_FINDINGS.md        # Code quality report
│   ├── CLEANUP_REPORT.md              # Initial cleanup notes
│   ├── DELIVERY_SUMMARY.md            # Project delivery report
│   └── PHASE3_CLEANUP_COMPLETE.md     # Final cleanup report
│
├── ⚙️ Configuration Files (8 files)
│   ├── .env.example                   # Environment template
│   ├── .gitignore                     # Git ignore rules
│   ├── .eslintrc.json                 # ESLint configuration
│   ├── .prettierrc                    # Prettier config
│   ├── .prettierignore                # Prettier ignore
│   ├── .nvmrc                         # Node version (18.20.0)
│   ├── package.json                   # Dependencies
│   ├── package-lock.json              # Dependency lock
│   ├── docker-compose.yml             # Docker config
│   └── vercel.json                    # Vercel deployment
│
├── 🛠️ Setup Scripts (2 files)
│   ├── setup.sh                       # Automated setup
│   └── cleanup-project.sh             # Cleanup script
│
├── 📁 Application Code
│   └── apps/                          # See below ↓
│
├── 📁 Database & Backend
│   └── supabase/                      # See below ↓
│
├── 📁 Workflow Automation
│   └── n8n/                           # See below ↓
│
├── 📁 Documentation
│   └── docs/                          # See below ↓
│
├── 📁 Test Scripts
│   └── tests/                         # See below ↓
│
├── 📁 Utility Scripts
│   └── scripts/                       # See below ↓
│
├── 📁 Archived Files
│   └── archive/                       # Old docs & files
│
└── 📁 Shared Packages
    └── packages/                      # Shared code (if any)
```

---

## 🏗️ Application Code (`/apps`)

```
apps/
├── web/                               # Frontend Application
│   ├── src/
│   │   ├── components/                # ✅ React components (6 files)
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── ChatWidget.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── PublicWidget.tsx
│   │   │   └── ThemeToggle.tsx
│   │   │
│   │   ├── pages/                     # ✅ Page components (6 files)
│   │   │   ├── AgentConfig.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── Conversations.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Settings.tsx
│   │   │
│   │   ├── lib/                       # ✅ Core libraries (5 files)
│   │   │   ├── database.types.ts      # Supabase types
│   │   │   ├── groqTools.ts           # AI tools (64KB)
│   │   │   ├── logger.ts              # Logging utility
│   │   │   ├── n8nWebhooks.ts         # n8n integration
│   │   │   └── supabase.ts            # Supabase client
│   │   │
│   │   ├── contexts/                  # ✅ React contexts
│   │   │   └── (Context providers)
│   │   │
│   │   ├── services/                  # ✅ API services
│   │   │   └── (API integrations)
│   │   │
│   │   ├── utils/                     # ✅ Helper functions
│   │   │   └── (Utility functions)
│   │   │
│   │   ├── App.tsx                    # Root component
│   │   ├── main.tsx                   # Entry point
│   │   └── index.css                  # Global styles
│   │
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML template
│   ├── vite.config.ts                 # Vite configuration
│   ├── tsconfig.json                  # TypeScript config
│   └── package.json                   # Frontend dependencies
│
└── api/                               # Backend API (Express)
    ├── src/
    ├── package.json
    └── tsconfig.json
```

---

## 🗄️ Database & Backend (`/supabase`)

```
supabase/
├── functions/                         # Edge Functions (Deno)
│   ├── groq-chat/                     # AI chat proxy
│   │   └── index.ts
│   ├── vapi-webhook/                  # Voice AI events
│   │   └── index.ts
│   └── twilio-whatsapp-webhook/       # WhatsApp integration
│       └── index.ts
│
└── migrations/                        # Database migrations
    ├── 20231101000000_initial_schema.sql
    ├── 20231102000000_add_appointments.sql
    └── (other migrations)
```

---

## ⚡ Workflow Automation (`/n8n`)

```
n8n/
└── Serenity Workflow - Ready to Import.json  # Main workflow
```

**Features:**
- Appointment booking automation
- Email/SMS notifications
- Multi-channel routing
- Field mapping (fixed and optimized)

---

## 📚 Documentation (`/docs`)

```
docs/
├── guides/                            # Feature Guides (20+ files)
│   ├── AI_ASSISTANT_TOOLS_COMPLETE.md
│   ├── AI_CHAT_N8N_INTEGRATION.md
│   ├── AI_TOOLS_COMPLETE_ANALYSIS.md
│   ├── ANALYTICS_CONVERSATIONS_GUIDE.md
│   ├── APPOINTMENT_MANAGEMENT_IMPLEMENTATION.md
│   ├── CHAT_WIDGET_BOOKING_FIX.md
│   ├── N8N_MASTERY_GUIDE.md
│   ├── N8N_ACTIVATION_GUIDE.md
│   ├── N8N_FIELD_MAPPING_FIX.md
│   ├── MOBILE-OPTIMIZATION-SUMMARY.md
│   ├── QUICK_REFERENCE.md
│   └── (16 more guides)
│
├── deployment/                        # Deployment Guides (3 files)
│   ├── QUICK_DEPLOYMENT_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── DEPLOYMENT_INSTRUCTIONS.md
│
├── api/                               # API Documentation (future)
│   └── (API docs)
│
└── troubleshooting/                   # Troubleshooting (future)
    └── (Common issues & solutions)
```

---

## 🧪 Test Scripts (`/tests`)

```
tests/
├── manual/                            # Manual Test Scripts
│   ├── appointment/                   # Appointment Tests (7 files)
│   │   ├── test-appointment-booking.sh
│   │   ├── test-booking-with-patient-ref.sh
│   │   ├── send-test-appointment-email.js
│   │   └── (4 more)
│   │
│   ├── email/                         # Email Tests (2 files)
│   │   ├── COMPLETE_EMAIL_SYSTEM_TEST.js
│   │   └── verify-email-delivery.js
│   │
│   ├── workflow/                      # Workflow Tests (10 files)
│   │   ├── test-all-endpoints.sh
│   │   ├── test-bulletproof-workflow.sh
│   │   ├── test-complete-workflow.sh
│   │   └── (7 more)
│   │
│   ├── chat-widget/                   # Chat Widget Tests (7 files)
│   │   ├── test-chat-widget-booking.js
│   │   ├── test-chat-widget-connection.html
│   │   └── (5 more)
│   │
│   ├── n8n/                           # n8n Tests (11 files)
│   │   ├── test-n8n-field-mapping.js
│   │   ├── verify-n8n-field-mapping.js
│   │   ├── debug-n8n-structure.js
│   │   └── (8 more)
│   │
│   └── (Other manual tests)           # (13 files)
│       ├── test-digital-ai-assistant.sh
│       ├── test-vapi-sync.sh
│       └── (11 more)
│
├── integration/                       # Integration Tests (7 files)
│   ├── check-conversations-schema.js
│   ├── check-messages-schema.js
│   ├── create-test-data.js
│   └── (4 more)
│
└── e2e/                               # End-to-End Tests (8 files)
    ├── test-full-page-layout.js
    ├── test-mobile-responsive.js
    ├── test-auto-login.js
    └── (5 more)
```

**Total Tests:** 66 organized test scripts

---

## 🛠️ Utility Scripts (`/scripts`)

```
scripts/
├── auto-fix-and-test.sh               # Automated fix & test
├── fix-appointment-node-api.js        # Fix appointment API
├── deploy-secure.sh                   # Secure deployment
└── quick-validation-test.sh           # Quick validation
```

---

## 🗄️ Archive (`/archive`)

```
archive/
└── 2025-11/                           # November 2025 Archive
    ├── docs/                          # Old Documentation (50+ files)
    │   ├── COMPLETE_FIX_DOCUMENTATION.md
    │   ├── EMAIL_TEST_RESULTS.md
    │   ├── FINAL_DEPLOYMENT_SUMMARY.md
    │   └── (47 more archived docs)
    │
    └── tests/                         # Old Test Results
        └── (Screenshots, test outputs)
```

**Purpose:** Historical reference, not deleted

---

## 🔑 Key Files Reference

### For New Developers
1. **Start Here:** [START_HERE_NEW_DEVELOPER.md](START_HERE_NEW_DEVELOPER.md)
2. **Quick Setup:** Run `bash setup.sh`
3. **Main Docs:** [README.md](README.md)
4. **Architecture:** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

### For Development
- **Environment:** `.env.example` → copy to `.env`
- **Dependencies:** `npm install`
- **Dev Server:** `npm run dev`
- **Build:** `npm run build`

### For Deployment
- **Vercel:** `vercel --prod`
- **Supabase:** `supabase functions deploy`
- **n8n:** Import workflow from `/n8n`
- **Guides:** See `/docs/deployment/`

### For Testing
- **Manual Tests:** `/tests/manual/`
- **Integration:** `/tests/integration/`
- **E2E:** `/tests/e2e/`

---

## 📊 Project Statistics

| Category | Count |
|----------|-------|
| **Root Markdown Files** | 7 |
| **Configuration Files** | 8 |
| **Documentation Files** | 23+ |
| **Test Scripts** | 66 |
| **Utility Scripts** | 4 |
| **Archived Files** | 69+ |
| **Source Components** | 17 |

---

## ✅ Quality Indicators

- ✅ Clean root directory (no clutter)
- ✅ Organized documentation
- ✅ Structured test scripts
- ✅ Professional configuration
- ✅ Comprehensive .gitignore
- ✅ No build artifacts in source
- ✅ Historical files preserved
- ✅ Clear navigation paths

---

## 🚀 Quick Commands

```bash
# Setup
bash setup.sh

# Development
npm run dev

# Build
npm run build

# Deploy
vercel --prod

# Test
cd tests/manual && bash test-all-endpoints.sh
```

---

## 📞 Navigation

- **Getting Started:** [START_HERE_NEW_DEVELOPER.md](START_HERE_NEW_DEVELOPER.md)
- **Architecture:** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **Code Quality:** [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md)
- **Cleanup Details:** [PHASE3_CLEANUP_COMPLETE.md](PHASE3_CLEANUP_COMPLETE.md)

---

**Structure Last Updated:** November 12, 2025
**Status:** ✅ Production-Ready

*Clean. Organized. Professional.*
