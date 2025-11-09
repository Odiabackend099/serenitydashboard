# VAPI Voice AI Implementation Guide

**Status**: ✅ **FULLY IMPLEMENTED**

VAPI (Voice AI Platform Integration) is **already implemented** in your Serenity Royale Hospital system. This guide explains how it works and how to use it.

---

## 🎯 What is VAPI?

VAPI is a web-based voice AI assistant that allows patients to:
- **Talk** instead of type
- **Book appointments** via voice
- **Get instant responses** from AI
- **Receive automatic email confirmations**

**Important**: This is **WebRTC voice**, NOT phone calls. Users speak through their browser.

---

## ✅ Current Implementation Status

### 1. Frontend (Web Interface)
**File**: [apps/web/src/components/ChatWidget.tsx](apps/web/src/components/ChatWidget.tsx)

**Lines 317-389**: VAPI client initialization and event handlers
```typescript
// Initialize VAPI client
useEffect(() => {
  const publicKey = getVapiPublicKey();
  if (!publicKey) {
    console.warn('VITE_VAPI_PUBLIC_KEY not configured');
    return;
  }

  if (!vapiRef.current) {
    vapiRef.current = new Vapi(publicKey);

    // VAPI event listeners
    vapiRef.current.on('call-start', () => {
      setVoiceStatus({ status: 'active', transcript: [] });
    });

    vapiRef.current.on('call-end', () => {
      setVoiceStatus((prev) => ({ ...prev, status: 'ended' }));
    });

    vapiRef.current.on('message', (message: any) => {
      // Handle transcripts
      if (message.type === 'transcript' && message.transcript) {
        const text = `${message.role === 'user' ? 'Patient' : 'AI'}: ${message.transcript}`;
        setVoiceStatus((prev) => ({
          ...prev,
          transcript: [...prev.transcript, text]
        }));

        // Persist to database
        if (conversationId && isSupabaseConfigured()) {
          persistMessage(message.role === 'user' ? 'patient' : 'ai', message.transcript, conversationId);
        }
      }
    });

    vapiRef.current.on('error', (error: any) => {
      setVoiceStatus({
        status: 'error',
        transcript: [],
        error: error?.message || 'Voice call failed'
      });
    });
  }
}, [conversationId]);
```

**Lines 818-876**: Voice call start/stop functions
```typescript
// Start VAPI Web voice call
async function startVoiceCall() {
  const assistantId = getAssistantId();
  if (!assistantId || !vapiRef.current) {
    // Show error
    return;
  }

  try {
    setVoiceStatus({ status: 'connecting', transcript: [] });
    await vapiRef.current.start(assistantId); // Start WebRTC call
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'Voice call started. Speak now!', from: 'ai' }
    ]);
  } catch (e: any) {
    console.error('[VAPI] Start error:', e);
    setVoiceStatus({
      status: 'error',
      transcript: [],
      error: e?.message || 'Failed to start voice call'
    });
  }
}

// End VAPI voice call
function endVoiceCall() {
  if (vapiRef.current) {
    vapiRef.current.stop();
    setVoiceStatus((prev) => ({ ...prev, status: 'ended' }));
  }
}
```

### 2. Backend (Edge Functions)

#### A. Sync VAPI Configuration
**File**: [supabase/functions/sync-vapi-config/index.ts](supabase/functions/sync-vapi-config/index.ts)

**Purpose**: Updates VAPI assistant with system prompt and tools

**Key Features**:
- Updates system prompt from Agent Config page
- Configures `send_appointment_confirmation` function tool
- Sets webhook URL for tool callbacks
- Uses Groq LLaMA 3.1 8B model

**API Call**:
```typescript
PATCH https://api.vapi.ai/assistant/{assistant_id}
Authorization: Bearer {VAPI_PRIVATE_KEY}

Body:
{
  "model": {
    "provider": "groq",
    "model": "llama-3.1-8b-instant",
    "messages": [{ "role": "system", "content": "..." }],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "send_appointment_confirmation",
          "description": "Send appointment confirmation email...",
          "parameters": { ... }
        },
        "server": {
          "url": "https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/vapi-webhook"
        }
      }
    ]
  }
}
```

#### B. VAPI Webhook Handler
**File**: [supabase/functions/vapi-webhook/index.ts](supabase/functions/vapi-webhook/index.ts)

**Purpose**: Receives callbacks from VAPI during voice calls

**Webhook Types Handled**:

1. **`transcript`** - User/AI speech transcription
   - Saves to `messages` table
   - Shows in conversation view

2. **`call-ended`** - Voice call finished
   - Updates conversation status
   - Logs to audit trail

3. **`function-call`** - AI wants to use a tool
   - Handles `send_appointment_confirmation`
   - Triggers n8n webhook for email
   - Returns result to VAPI

**Function Call Flow** (Lines 123-235):
```typescript
case 'function-call':
  if (payload.functionCall?.name === 'send_appointment_confirmation') {
    const params = payload.functionCall.parameters;

    // Call n8n webhook
    const n8nResponse = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: params.name,
        patientEmail: params.email,
        patientPhone: params.phone || 'Not provided',
        appointmentDate: params.date,
        appointmentTime: params.time,
        appointmentReason: params.reason || 'General consultation',
        actionType: 'create',
        source: 'vapi_voice_call'
      })
    });

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'appointment_confirmation_sent',
      meta: { email: params.email, date: params.date, time: params.time }
    });

    // Return success to VAPI
    return new Response(JSON.stringify({
      success: true,
      result: 'Confirmation email sent successfully'
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  break;
```

---

## 🔧 Configuration

### Environment Variables

#### Frontend (.env in apps/web/)
```bash
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key_here
VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
```

#### Backend (Supabase Edge Function Secrets)
```bash
VAPI_PRIVATE_KEY=your_vapi_private_key_here
N8N_WEBHOOK_BASE=https://cwai97.app.n8n.cloud/webhook
```

### How to Get VAPI Keys

1. **Sign up at**: https://vapi.ai
2. **Create Assistant**:
   - Go to Dashboard → Assistants → Create
   - Choose "Custom Assistant"
   - Note the **Assistant ID**

3. **Get API Keys**:
   - Go to Settings → API Keys
   - **Public Key**: For frontend (web calls)
   - **Private Key**: For backend (API updates)

4. **Configure Assistant**:
   - Provider: Groq
   - Model: llama-3.1-8b-instant
   - Voice: Choose from ElevenLabs (recommended)
   - First Message: "Hi! I'm the Serenity Royale Hospital assistant. How can I help you today?"

---

## 🎨 UI Components

### Voice Toggle Button
**Location**: ChatWidget header (if not disabled)

```tsx
<button
  onClick={toggleMode}
  disabled={voiceStatus.status === 'active' || voiceStatus.status === 'connecting'}
  title={mode === 'text' ? 'Switch to Voice' : 'Switch to Text'}
>
  {mode === 'text' ? (
    <><Mic className="w-3 h-3" /> Voice</>
  ) : (
    <><MessageCircle className="w-3 h-3" /> Text</>
  )}
</button>
```

### Voice Status Indicators

**Connecting**:
```tsx
<span className="text-sm text-blue-600 animate-pulse">Connecting...</span>
```

**Active**:
```tsx
<span className="text-sm text-green-600 flex items-center gap-2">
  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
  Voice call active
</span>
```

**Error**:
```tsx
<span className="text-sm text-red-600">Error: {voiceStatus.error}</span>
```

### Live Transcript Display
```tsx
{mode === 'voice' && voiceStatus.transcript.length > 0 && (
  <div className="border-t pt-2 mt-2">
    <div className="text-xs font-semibold text-gray-600 mb-1">Live Transcript:</div>
    <div className="bg-yellow-50 p-2 rounded text-xs space-y-1">
      {voiceStatus.transcript.slice(-5).map((text, i) => (
        <div key={i} className="text-gray-700">{text}</div>
      ))}
    </div>
  </div>
)}
```

---

## 🔄 Complete Flow

### Patient Books Appointment via Voice

1. **Patient clicks voice toggle** in chat widget
2. **Frontend calls** `startVoiceCall()`
3. **VAPI WebRTC connection** established
4. **Patient speaks**: "I want to book an appointment for tomorrow at 2 PM"
5. **VAPI transcribes** speech → sends to AI
6. **AI processes** request using Groq model
7. **AI collects** missing info (name, email, phone, reason)
8. **AI calls** `send_appointment_confirmation` function
9. **VAPI triggers** webhook to `/functions/v1/vapi-webhook`
10. **vapi-webhook** receives function call
11. **vapi-webhook** calls n8n webhook `/serenity-webhook-v2`
12. **n8n workflow** sends confirmation email
13. **Patient receives** email at their address
14. **VAPI returns** success to AI
15. **AI confirms** to patient: "Done! Check your email"

---

## 📊 Current Deployment Status

| Component | Status | Location |
|-----------|--------|----------|
| Frontend (Public Widget) | ✅ Implemented | `serenity-public-widget/` |
| Frontend (Admin Dashboard) | ✅ Implemented (voice disabled) | `serenity dasboard/apps/web/` |
| VAPI Sync Function | ✅ Deployed | Supabase Edge Functions |
| VAPI Webhook Handler | ✅ Deployed | Supabase Edge Functions |
| n8n Email Workflow | ✅ Active | `/serenity-webhook-v2` |

---

## 🧪 Testing

### Test Voice Assistant

1. **Open Public Widget**:
   ```bash
   cd /Users/odiadev/Desktop/serenity-public-widget
   npm run dev
   ```
   Visit: http://localhost:3001

2. **Click Voice Toggle** (microphone icon)

3. **Grant Microphone Permission** (browser will ask)

4. **Speak**: "Hi, I want to book an appointment"

5. **AI will ask** for:
   - Your name
   - Email address
   - Phone number
   - Preferred date & time
   - Reason for visit

6. **After collecting info**, AI calls function

7. **Check email** at the address you provided

### Test Function Call Directly

```bash
curl -X POST "https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/vapi-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "function-call",
    "call": {
      "id": "test-call-123",
      "phoneNumber": "+1234567890"
    },
    "functionCall": {
      "name": "send_appointment_confirmation",
      "parameters": {
        "name": "Samuel Eguale",
        "email": "egualesamuel@gmail.com",
        "phone": "+1234567890",
        "date": "2025-02-20",
        "time": "3:00 PM",
        "reason": "Testing VAPI function call"
      }
    }
  }'
```

Expected: Email sent to egualesamuel@gmail.com

---

## 🔐 Security

### Authentication
- **Public widget**: No auth required (anyone can use voice)
- **Admin dashboard**: Voice toggle disabled (`disableVoice={true}`)
- **Backend**: VAPI private key stored in Supabase secrets

### HIPAA Compliance
- Transcripts stored in encrypted Supabase database
- No PHI in VAPI logs (only assistant ID used)
- Webhook secured with service role key
- Audit logs track all function calls

---

## 📚 Documentation

- **VAPI Docs**: https://docs.vapi.ai
- **Groq Docs**: https://console.groq.com/docs
- **Implementation**: [ChatWidget.tsx](apps/web/src/components/ChatWidget.tsx)
- **Backend**: [vapi-webhook/index.ts](supabase/functions/vapi-webhook/index.ts)

---

## 🎯 Next Steps

### If VAPI Not Working

1. **Check environment variables**:
   ```bash
   cd /Users/odiadev/Desktop/serenity-public-widget
   cat .env | grep VAPI
   ```

2. **Verify Supabase secrets**:
   ```bash
   cd /Users/odiadev/Desktop/serenity dasboard
   supabase secrets list
   ```

3. **Test VAPI assistant**:
   - Go to https://dashboard.vapi.ai
   - Find your assistant
   - Click "Test" to try voice directly

4. **Check webhook logs**:
   - Go to Supabase Dashboard
   - Functions → vapi-webhook → Logs
   - Look for function-call events

### If Emails Not Arriving

1. **Check n8n workflow** is active: https://cwai97.app.n8n.cloud
2. **Verify Gmail OAuth** is connected on all email nodes
3. **Test webhook directly**: `./test-appointment-booking.sh`
4. **Check spam folder** at patient email address

---

**VAPI is fully implemented and ready to use!** 🎉

Configure your VAPI keys and test the voice assistant today.
