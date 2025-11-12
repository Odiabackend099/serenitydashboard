# 🚀 Serenity Care AI - Quick Start Card

**For:** New developers joining the project
**Time to productive:** < 5 minutes

---

## ⚡ Super Quick Start (3 Commands)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your credentials
# (Supabase, Groq, n8n, VAPI, Twilio)

# 3. Install and run
npm install && npm run dev
```

**Done!** Open [http://localhost:5173](http://localhost:5173)

---

## 📚 Where to Find Things

| What you need | Where to look |
|---------------|---------------|
| **Getting started** | [START_HERE_NEW_DEVELOPER.md](START_HERE_NEW_DEVELOPER.md) |
| **Architecture** | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| **File structure** | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) |
| **Code quality** | [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md) |
| **Feature guides** | [/docs/guides/](docs/guides/) |
| **Deployment** | [/docs/deployment/](docs/deployment/) |
| **Tests** | [/tests/](tests/) |

---

## 🔑 Required Credentials

1. **Supabase** → [supabase.com/dashboard](https://supabase.com/dashboard)
   - Project URL
   - Anon Key
   - Service Role Key

2. **Groq AI** → [console.groq.com/keys](https://console.groq.com/keys)
   - API Key

3. **n8n** → Your n8n instance
   - Webhook Base URL
   - Webhook Secret

4. **Optional:** VAPI, Twilio

See [.env.example](.env.example) for all variables.

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests

# Deployment
vercel --prod            # Deploy frontend
supabase functions deploy groq-chat  # Deploy Edge Functions
supabase db push         # Run migrations

# Testing
cd tests/manual && bash test-all-endpoints.sh
```

---

## 📁 Project Structure (Simplified)

```
/
├── apps/web/            # Frontend (React + TypeScript)
├── supabase/            # Database & Edge Functions
├── n8n/                 # Workflow automation
├── docs/                # Documentation
├── tests/               # Test scripts
└── [core docs]          # README, etc.
```

---

## 🚨 Troubleshooting

**Port 5173 in use?**
```bash
lsof -i :5173
# Or use different port:
PORT=3000 npm run dev
```

**npm install fails?**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Environment errors?**
- Check all required variables in `.env`
- Compare with `.env.example`

---

## ✅ Quick Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account created
- [ ] Groq API key obtained
- [ ] n8n instance set up
- [ ] `.env` configured
- [ ] `npm install` completed
- [ ] `npm run dev` running

---

## 📞 Get Help

- **Docs:** [README.md](README.md)
- **Architecture:** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **Issues:** GitHub Issues

---

**Quick Start Card v1.0** | Last updated: Nov 12, 2025
