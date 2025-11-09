# Serenity Dashboard Monorepo

PWA dashboard for hospital staff to manage an AI-powered voice + chat assistant across WhatsApp and voice calls (VAPI), book appointments, and integrate calendar and workflow automation.

## 🎯 Current Status: Live in Production
**Latest Update**: 2025-11-07
✅ **Supabase Backend**: Database + Auth + Realtime (replaces Express + PostgreSQL)
✅ Chat widget with Groq AI (text) + VAPI Web SDK (voice)
✅ Real-time subscriptions (replaces Socket.io)
✅ Security hardened: API keys secured in Edge Functions
✅ Project structure cleaned and organized
🌐 **Live URLs**:
   - Admin Dashboard: https://srhbackend.odia.dev/analytics
   - Public Interface: https://srhcareai.odia.dev
📋 See [docs/START_HERE.md](docs/START_HERE.md) for getting started
📋 See [docs/guides/planning.md](docs/guides/planning.md) for full implementation roadmap

## Monorepo Structure
- `apps/web` — React + Vite PWA (TypeScript only, .js duplicates removed)
- `docs/` — All documentation (guides, deployment, archive)
- `scripts/` — Test scripts and setup utilities
- `n8n/` — n8n workflow files (production + archive)
- `supabase/` — Database migrations and Edge Functions
- `docker-compose.yml` — n8n only (PostgreSQL removed)

## Quick Start

### 1. Install Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Supabase Account ([Sign up](https://supabase.com))

### 2. Clone and Install Dependencies
```bash
cd "serenity dasboard"
npm install
```

### 3. Setup Supabase Backend (15 minutes)

**Important**: Follow [docs/guides/SUPABASE_SETUP.md](docs/guides/SUPABASE_SETUP.md) for detailed step-by-step instructions.

**Quick Summary**:
1. Create Supabase project at https://supabase.com
2. Run database schema in SQL Editor (copy from [docs/guides/SUPABASE_SETUP.md](docs/guides/SUPABASE_SETUP.md))
3. Enable Realtime on tables
4. Configure Row Level Security policies
5. Get API credentials from Settings → API

### 4. Configure Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in your values:

```bash
cp apps/web/.env.example apps/web/.env.local
```

**IMPORTANT SECURITY NOTES**:
- NEVER commit .env.local to git
- All VITE_ variables are PUBLIC and exposed to the browser
- NEVER put API secrets in VITE_ variables
- Use Supabase Edge Functions for any sensitive API calls
- See [docs/guides/SECURITY_GUIDE.md](docs/guides/SECURITY_GUIDE.md) for details

### 5. Start n8n (Optional)
```bash
docker compose up -d
```

n8n runs on http://localhost:5678/ (for workflow automation)

### 6. Start Development Server
```bash
npm run dev
```

Access:
- **Web App**: http://localhost:5173/
- **Supabase Dashboard**: https://supabase.com/dashboard
- **n8n**: http://localhost:5678/

### 7. Test Chat Widget
1. Open http://localhost:5173/
2. Click **"Chat"** button (bottom-right)
3. Footer should show: **"✓ Supabase Connected"**
4. Try text chat: Type "What are your hours?"
5. Try voice mode: Click "🎤 Voice" → "Start Voice Call"
6. Check Supabase Dashboard → Table Editor → messages (your messages should appear!)

**Troubleshooting**: See [docs/guides/SUPABASE_SETUP.md](docs/guides/SUPABASE_SETUP.md)

---

## Key Features

| Feature | Status | Backend |
|---------|--------|---------|
| Text Chat (Groq AI) | ✅ | Supabase |
| Voice Calls (VAPI) | ✅ | Supabase |
| Message Persistence | ✅ | Supabase PostgreSQL |
| Real-time Updates | ✅ | Supabase Realtime |
| Authentication | ⏳ Phase 2 | Supabase Auth |
| Staff Dashboard | ⏳ Phase 2 | Supabase |
| WhatsApp Integration | ⏳ Phase 4 | Twilio + Edge Functions |
| Appointment Booking | ⏳ Phase 5 | Supabase + Google Calendar |

---

## Architecture

### Before (Phase 1)
```
React → Express API → PostgreSQL (Docker) → Socket.io
```

### After (Current - Supabase)
```
React → Supabase Client → Supabase Cloud
                          ├─ PostgreSQL (managed)
                          ├─ Auth (managed)
                          ├─ Realtime (managed)
                          └─ Storage (future)
```

**Benefits**:
- ✅ No Docker setup for database
- ✅ Automatic scaling
- ✅ Built-in authentication
- ✅ Real-time subscriptions out-of-the-box
- ✅ Auto-generated REST API
- ✅ Row Level Security (database-enforced auth)

---

## Environment Variables

### Frontend (`apps/web/.env.local`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_GROQ_MODEL=llama-3.1-8b-instant
VITE_VAPI_ASSISTANT_ID=your-vapi-assistant-id
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
```

### Backend (Edge Functions - Future)
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VAPI_PRIVATE_KEY=YOUR_VAPI_PRIVATE_KEY
GROQ_API_KEY=your_groq_api_key_here
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_auth_token_here
```

---

## Migration from Express to Supabase

See [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) for:
- Architecture comparison
- Database schema migration
- Code changes summary
- Benefits analysis
- Timeline estimate (~4.5 hours)

---

## Development Workflow

### Making Database Changes
1. Go to Supabase Dashboard → SQL Editor
2. Write migration SQL
3. Run query
4. Update `apps/web/src/lib/database.types.ts` if schema changed

### Adding Real-time Subscriptions
```typescript
import { supabase } from './lib/supabase';

// Subscribe to new messages
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

### Querying Data
```typescript
// Read
const { data, error } = await supabase
  .from('conversations')
  .select('*')
  .eq('status', 'active');

// Insert
const { data, error } = await supabase
  .from('messages')
  .insert({ conversation_id: 'xxx', body: 'Hello', from_type: 'patient' });

// Update
const { data, error } = await supabase
  .from('conversations')
  .update({ status: 'closed' })
  .eq('id', 'xxx');
```

---

## Testing

### Manual Testing
See [PHASE1_TESTING.md](PHASE1_TESTING.md) for comprehensive test cases:
- Chat widget functionality
- Voice call integration
- Database persistence
- Real-time updates
- Supabase connection

### Automated Testing (Future)
```bash
cd apps/web
npm run test
```

---

## Deployment (Future)

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy apps/web/dist
```

### Edge Functions (Supabase)
```bash
supabase functions deploy vapi-webhook
supabase functions deploy twilio-webhook
```

---

## Troubleshooting

### Chat widget shows "DB Not Configured"
1. Check `apps/web/.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Restart dev server: `npm run dev`
3. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Messages not appearing in Supabase
1. Check Supabase Dashboard → Logs → Postgres Logs for errors
2. Verify RLS policies: Table Editor → messages → RLS enabled ✅
3. Re-run RLS policies from [SUPABASE_SETUP.md](SUPABASE_SETUP.md#step-6-configure-row-level-security-5-min)

### Voice call fails to start
1. Check browser console for VAPI errors
2. Verify microphone permissions granted
3. Ensure `VITE_VAPI_PUBLIC_KEY` and `VITE_VAPI_ASSISTANT_ID` correct

---

## Documentation

### Getting Started
- [docs/START_HERE.md](docs/START_HERE.md) - Start here for quick setup
- [docs/guides/SUPABASE_SETUP.md](docs/guides/SUPABASE_SETUP.md) - 15-minute setup guide
- [docs/ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md) - System architecture

### Guides
- [docs/guides/planning.md](docs/guides/planning.md) - 8-phase implementation roadmap
- [docs/guides/SECURITY_GUIDE.md](docs/guides/SECURITY_GUIDE.md) - Security best practices
- [docs/guides/PHASE1_TESTING.md](docs/guides/PHASE1_TESTING.md) - Testing checklist
- [docs/guides/VAPI_VOICE_INTEGRATION_GUIDE.md](docs/guides/VAPI_VOICE_INTEGRATION_GUIDE.md) - Voice integration
- [docs/guides/N8N_WORKFLOW_IMPORT_GUIDE.md](docs/guides/N8N_WORKFLOW_IMPORT_GUIDE.md) - n8n setup

### Deployment
- [docs/deployment/DEPLOYMENT_GUIDE.md](docs/deployment/DEPLOYMENT_GUIDE.md) - Deployment instructions
- [docs/deployment/COMPLETE_DEPLOYMENT_STATUS.md](docs/deployment/COMPLETE_DEPLOYMENT_STATUS.md) - Current status

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **VAPI Docs**: https://docs.vapi.ai/
- **Groq Docs**: https://console.groq.com/docs/quickstart
- **Project Issues**: Create an issue in your repository

---

## License

MIT

---

**Built with**: React + Vite + Supabase + VAPI + Groq AI + n8n
