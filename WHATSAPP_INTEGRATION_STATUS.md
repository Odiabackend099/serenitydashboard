# WhatsApp Integration - Implementation Status

## ✅ Phase 1: System Prompt & AI Configuration (COMPLETED)

### What We've Done:

1. **✅ Updated WhatsApp AI Agent System Prompt**
   - Replaced generic assistant prompt with hospital-specific context
   - Added Nigerian cultural context (emojis, WhatsApp-first communication)
   - Added phone number (+234) as primary identifier
   - Added appointment booking conversation flows
   - Location: `n8n/WhatsApp-Serenity-Integrated.json` - AI Agent node

2. **✅ Added 5 Appointment Tools to AI Agent**
   - `book_appointment_with_confirmation`
   - `get_my_appointments`
   - `check_availability`
   - `reschedule_appointment`
   - `cancel_appointment`
   - Tool definitions match Groq tools from `groqTools.ts`

3. **✅ Added Phone Number Capture**
   - All input types (Text, Audio, Image, File) now capture patient phone
   - Phone number extracted from WhatsApp: `{{ $('WhatsApp Trigger').item.json.contacts[0].wa_id }}`
   - Field name: `patient_phone`

---

## ⚠️ CRITICAL ISSUE: N8N Tool Calling Architecture

### The Problem:

**N8N AI Agent nodes don't automatically execute tool calls like Groq does.**

In the current setup:
- ✅ AI Agent can **recognize** when to call tools
- ✅ AI Agent will **attempt** to call tools
- ❌ **BUT** there's no backend to **execute** the tool calls

### What's Missing:

When the AI Agent calls `book_appointment_with_confirmation`, it needs to:
1. Send the tool parameters to the **Serenity N8N Webhook**
2. The webhook creates the appointment in Supabase
3. The webhook sends email + SMS confirmations
4. The response comes back to WhatsApp workflow
5. AI Agent formats the response for the patient

**Currently:** The AI Agent has tool definitions but no execution pathway.

---

## 🔧 Solution: Add HTTP Request Node for Tool Execution

### Architecture:

```
WhatsApp Message
  ↓
Input Type Router (Text/Voice/Image/PDF)
  ↓
AI Agent (Hospital Receptionist) - Decides to call tool
  ↓
HTTP Request Node - Executes tool via Supabase Edge Function
  ↓
Supabase Edge Function (groq-chat) - Processes tool call
  ↓
N8N Serenity Webhook - Creates appointment + sends confirmations
  ↓
Response flows back to WhatsApp
  ↓
Send WhatsApp Message
```

---

## 🛠️ Implementation Plan - Phase 2

### Step 1: Understanding N8N Tool Calling

N8N's `@n8n/n8n-nodes-langchain.agent` node supports tools in two ways:

**Option A: Built-in Tool Nodes**
- Use N8N's pre-built tool nodes (Calculator, HTTP Request, etc.)
- Connect tools directly to AI Agent via tool connections
- **Limitation:** Our appointment tools aren't built-in

**Option B: Custom HTTP Tool Nodes**
- Create HTTP Request tool nodes
- Each tool = separate HTTP Request node
- Call Serenity N8N webhook for each action
- **This is what we need!**

### Step 2: Create Tool Execution Nodes

We need to add **5 HTTP Request Tool nodes** to the workflow:

#### Tool 1: Book Appointment Tool Node
```json
{
  "name": "Book Appointment Tool",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2",
    "method": "POST",
    "body": {
      "action": "book_appointment",
      "body": {
        "patient_name": "={{ $json.name }}",
        "patient_email": "={{ $json.email }}",
        "patient_phone": "={{ $json.phone }}",
        "appointment_date": "={{ $json.date }}",
        "appointment_time": "={{ $json.time }}",
        "reason": "={{ $json.reason }}",
        "channel": "whatsapp",
        "source": "whatsapp_bot"
      }
    }
  }
}
```

#### Tool 2: Get My Appointments Tool Node
```json
{
  "name": "Get Appointments Tool",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat",
    "method": "POST",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "supabaseApi",
    "body": {
      "tool_name": "get_my_appointments",
      "args": {
        "email": "={{ $json.email }}",
        "status": "={{ $json.status || 'upcoming' }}"
      }
    }
  }
}
```

#### Tool 3-5: Similar structure for:
- Check Availability Tool
- Reschedule Appointment Tool
- Cancel Appointment Tool

### Step 3: Connect Tools to AI Agent

In N8N, AI Agent tools are connected via **tool connections**, not in the parameters.

**Current workflow structure:**
```
AI Agent (Hospital Receptionist)
  - ai_languageModel: OpenAI Chat Model
  - ai_memory: Conversation Memory
  - tools: ⚠️ MISSING CONNECTIONS
```

**Required connections:**
```
AI Agent (Hospital Receptionist)
  - ai_languageModel: OpenAI Chat Model
  - ai_memory: Conversation Memory
  - tools: [
      Book Appointment Tool,
      Get Appointments Tool,
      Check Availability Tool,
      Reschedule Tool,
      Cancel Tool
    ]
```

---

## 🚨 ALTERNATIVE APPROACH (RECOMMENDED)

### Use Supabase Edge Function Instead

Instead of complex tool nodes in N8N, we can:

1. **Remove tool definitions from N8N AI Agent**
2. **Let AI Agent generate natural language intent**
3. **Add HTTP Request node after AI Agent**
4. **Call Supabase Edge Function with full conversation**
5. **Edge Function handles tool calling via Groq**

### Why This is Better:

✅ **Simpler N8N workflow** (fewer nodes)
✅ **Centralized logic** in Edge Function
✅ **Reuses existing tool execution code** from groqTools.ts
✅ **Easier to debug** (one place for tool logic)
✅ **Better error handling**

### New Architecture:

```
WhatsApp Message
  ↓
Input Type Router
  ↓
Build Conversation Context (Set node)
  ↓
HTTP Request → Supabase Edge Function (groq-chat)
  - Payload: { messages: [...], mode: "public", patient_phone: "+234..." }
  ↓
Edge Function:
  - Uses Groq with tool calling
  - Executes tools via existing functions
  - Returns final response
  ↓
Send WhatsApp Message (text or audio)
```

### Benefits:

1. **No changes to N8N AI Agent node** - just use it for multi-modal processing
2. **All tool logic in Edge Function** - existing code from groqTools.ts
3. **Single HTTP call** instead of complex tool routing
4. **Conversation memory** handled by Edge Function
5. **Phone-first patient lookup** ready to implement

---

## 📋 Next Steps (In Order)

### Immediate (Today):

1. **Decide on approach:**
   - Option A: N8N tool nodes (complex, native N8N)
   - Option B: Edge Function routing (simple, reuses code) ← **RECOMMENDED**

2. **If Option B (Edge Function):**
   - Remove tool definitions from AI Agent (keep system prompt)
   - Add "Build Conversation Context" Set node
   - Add HTTP Request node calling `groq-chat` Edge Function
   - Update Edge Function to accept `patient_phone` parameter
   - Test end-to-end flow

3. **Database Changes (Phase 2):**
   - Add `source` column to appointments table (values: 'web', 'whatsapp', 'voice')
   - Add index on `patient_phone` for fast lookups
   - Create `patient_profiles` table for phone→email mapping

### This Week:

4. **Update Edge Function for Phone Lookup:**
   - Accept `patient_phone` in request
   - Look up patient by phone in appointments table
   - Return existing email if found
   - Allow booking with phone-only for first-time patients

5. **Add WhatsApp Confirmations to Serenity Webhook:**
   - When appointment booked via WhatsApp, send WhatsApp confirmation
   - Triple confirmation: Email + SMS + WhatsApp message
   - Format WhatsApp messages with Nigerian context

### Next Week:

6. **Implement Conversation Tracking:**
   - Create `whatsapp_conversations` table
   - Store full conversation history
   - Link to appointments
   - HIPAA-compliant logging

7. **Testing:**
   - Test all 5 tools via WhatsApp
   - Test multi-modal inputs (voice, image, PDF)
   - Test conversation memory
   - Test error handling

---

## 🎯 Current File Status

### Files Modified:
- ✅ `n8n/WhatsApp-Serenity-Integrated.json` - System prompt updated, tools added
- ⏳ Needs update: Remove tool definitions, add HTTP Request node

### Files to Create:
- ⏳ Database migration for WhatsApp support
- ⏳ Updated Edge Function with phone lookup
- ⏳ WhatsApp test scripts
- ⏳ Deployment documentation

### Files Ready to Use:
- ✅ `apps/web/src/lib/groqTools.ts` - Public tools defined
- ✅ `supabase/functions/groq-chat/index.ts` - Edge Function ready
- ✅ N8N Serenity Webhook - Appointment booking working

---

## ⚡ Quick Decision Needed

**Question:** Should we use **N8N tool nodes** or **Edge Function routing**?

**Recommendation:** Edge Function routing (Option B)

**Reason:**
1. Faster implementation (hours vs days)
2. Reuses 90% of existing code
3. Easier to maintain (one place for logic)
4. Better suited for Nigerian phone-first workflow
5. Already tested and working in web chat

**Your approval needed to proceed with Edge Function approach.**

---

## 📞 Support

If you approve Edge Function approach, I will:
1. Remove tool definitions from N8N AI Agent
2. Add HTTP Request node to call `groq-chat`
3. Update Edge Function for phone-based patient identification
4. Test the full flow with a sample WhatsApp conversation

**Estimated time:** 2-3 hours for working prototype

---

**Status:** Awaiting your decision on architecture approach.
