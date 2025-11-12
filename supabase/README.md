# Supabase Setup for Serenity Royale Hospital

## Directory Structure
```
supabase/
├── migrations/          # SQL migration files
│   └── 00001_initial_schema.sql
└── functions/          # Edge Functions (Deno)
    ├── vapi-sync-agent/
    ├── vapi-webhook/
    └── twilio-whatsapp-webhook/
```

## Local Development

### Prerequisites
- Install Supabase CLI: `brew install supabase/tap/supabase`
- Docker Desktop running

### Start Local Supabase
```bash
supabase init
supabase start
```

### Apply Migrations
```bash
supabase db reset  # Reset and apply all migrations
```

### Set Secrets for Edge Functions
```bash
supabase secrets set GROQ_API_KEY=your_key
supabase secrets set VAPI_PRIVATE_KEY=your_key
supabase secrets set TWILIO_ACCOUNT_SID=your_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_token
supabase secrets set N8N_WEBHOOK_BASE=https://your-n8n.com/webhook
```

## Production Deployment

### Push to Production
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### Deploy Edge Functions
```bash
supabase functions deploy vapi-sync-agent
supabase functions deploy vapi-webhook
supabase functions deploy twilio-whatsapp-webhook
```

## Database Schema

### Tables
- **profiles**: Staff roles (admin, receptionist, call_handler)
- **conversations**: WhatsApp + Voice threads
- **messages**: Chat history with role tracking
- **appointments**: Internal calendar with optional GCal sync
- **agent_config**: Groq/VAPI settings (singleton)
- **audit_logs**: Compliance and security tracking

### RLS Policies
All tables have Row Level Security enabled:
- Single-tenant model: All authenticated users can view
- Role-based: Admins have full access
- Audit: All changes logged

## Edge Functions

### 1. vapi-sync-agent
**Endpoint**: `POST /functions/v1/vapi-sync-agent`
**Purpose**: Create/update VAPI assistant configuration
**Input**:
```json
{
  "system_prompt": "You are a medical assistant...",
  "voice_id": "en-US-Neural2-F"
}
```

### 2. vapi-webhook
**Endpoint**: `POST /functions/v1/vapi-webhook`
**Purpose**: Receive VAPI call events and transcripts
**Called by**: VAPI platform

### 3. twilio-whatsapp-webhook
**Endpoint**: `POST /functions/v1/twilio-whatsapp-webhook`
**Purpose**: Receive inbound WhatsApp messages
**Called by**: Twilio

## Testing

### Create First Admin User
After sign-up, manually set role:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-here';
```

### Test Edge Function Locally
```bash
supabase functions serve vapi-webhook
curl -X POST http://localhost:54321/functions/v1/vapi-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"transcript","message":"Hello"}'
```
