# 🔴 Production Errors Resolution Guide

**Date:** November 12, 2025
**Environment:** Production (srhbackend.odia.dev)
**Severity:** HIGH - Chat widget functionality impaired

---

## 🚨 Critical Errors Identified

### Error 1: CORS Policy Violation (n8n Webhook)

**Error Message:**
```
Access to fetch at 'https://cwai97.app.n8n.cloud/webhook/lead-capture'
from origin 'https://srhbackend.odia.dev' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Location:** `apps/web/src/lib/n8nWebhooks.ts:14`

**Root Cause:**
- n8n webhook `/webhook/lead-capture` doesn't have CORS headers configured
- The webhook is being called from browser (client-side)
- n8n needs to allow `https://srhbackend.odia.dev` origin

**Impact:** 🔴 HIGH
- Lead capture not working
- Patient information not being sent to n8n
- Marketing automation broken

---

### Error 2: Groq Edge Function 500 Errors

**Error Messages:**
```
[Error] Tool trigger_automation failed
[Error] Groq Edge Function error (500)
[Error] Max retries reached, throwing error
```

**Location:** `supabase/functions/groq-chat/index.ts`

**Root Cause:**
- `trigger_automation` tool is classified as admin-only (line 61-63)
- Chat widget is not authenticated (no Bearer token)
- When AI tries to call `trigger_automation`, it's blocked with 401
- The client retries, leading to 500 errors

**Code Analysis:**
```typescript
// Line 61-66: Admin tool blocking
const hasAdminTools = tools && tools.some((tool: any) =>
  ['get_stats', 'trigger_automation'].includes(tool.function?.name)
);

if (hasAdminTools && !isAuthenticated) {
  // Returns 401, but client sees this as 500 after retries
  return new Response(/* ... */, { status: 401 });
}
```

**Impact:** 🔴 HIGH
- Appointment booking workflow broken
- AI cannot trigger n8n automations
- Chat functionality severely limited

---

### Error 3: Appointment Booking Failure

**Chain of Events:**
1. ✅ User requests appointment
2. ✅ AI detects intent: "🗓️ Appointment intent detected!"
3. ❌ AI tries to call `trigger_automation` tool
4. ❌ Edge Function blocks (unauthenticated)
5. ❌ Client retries 3 times
6. ❌ Max retries → Error thrown
7. ❌ Appointment not booked

**Impact:** 🔴 CRITICAL
- Core functionality broken
- Users cannot book appointments
- Business operations impacted

---

## ✅ Solutions

### Solution 1: Fix n8n CORS (Immediate)

#### Option A: Configure CORS in n8n Workflow

**Steps:**
1. Open n8n workflow: "Serenity Workflow - Ready to Import"
2. Add "Respond to Webhook" node at the beginning
3. Configure CORS headers:
   ```json
   {
     "Access-Control-Allow-Origin": "https://srhbackend.odia.dev",
     "Access-Control-Allow-Methods": "POST, OPTIONS",
     "Access-Control-Allow-Headers": "Content-Type"
   }
   ```

#### Option B: Move Lead Capture to Edge Function (Recommended)

**Why:** Client-side webhook calls are problematic (CORS, security)

**Implementation:**
1. Create new Edge Function: `supabase/functions/lead-capture/index.ts`
2. Move logic from client to server-side
3. Update ChatWidget to call Edge Function instead

**Benefits:**
- ✅ No CORS issues
- ✅ Server-side execution (more secure)
- ✅ Better error handling
- ✅ Can add authentication

---

### Solution 2: Fix `trigger_automation` Tool Access

#### Option A: Make Tool Public for Appointments (Quick Fix)

**File:** `supabase/functions/groq-chat/index.ts`

**Change:**
```typescript
// Line 61-64: UPDATE
const hasAdminTools = tools && tools.some((tool: any) =>
  ['get_stats'].includes(tool.function?.name)  // Remove trigger_automation
);
```

**Reasoning:**
- `book_appointment_with_confirmation` is already public (line 216)
- `trigger_automation` for appointments should also be public
- Only `get_stats` needs authentication

**Risk:** ⚠️ Low
- Appointment automation is intended for public use
- n8n webhook handles validation
- No sensitive data exposed

#### Option B: Use `book_appointment_with_confirmation` Instead (Recommended)

**Why:** This tool already exists and is public (line 216)

**Implementation:**
1. Update groqTools.ts to use `book_appointment_with_confirmation`
2. Remove `trigger_automation` from appointment flow
3. Keep `trigger_automation` for admin-only actions

**Benefits:**
- ✅ No code changes to Edge Function
- ✅ Uses existing public tool
- ✅ More secure
- ✅ Better separation of concerns

**File to Update:** `apps/web/src/lib/groqTools.ts`

---

### Solution 3: Improve Error Handling

#### Add Fallback for Authentication Errors

**File:** `apps/web/src/components/ChatWidget.tsx`

**Add:**
```typescript
// When 401 error from trigger_automation
catch (error) {
  if (error.status === 401 && toolCall.name === 'trigger_automation') {
    // Fallback: Try book_appointment_with_confirmation instead
    console.log('[ChatWidget] Retrying with public tool...');
    // Retry with alternative tool
  }
}
```

---

## 🔧 Immediate Action Plan

### Priority 1: Fix Appointment Booking (HIGH)

**Recommended Approach:** Use existing public tool

1. **Update groqTools.ts**
   ```typescript
   // Replace trigger_automation with book_appointment_with_confirmation
   {
     type: "function",
     function: {
       name: "book_appointment_with_confirmation",  // Change from trigger_automation
       description: "Book an appointment and send confirmation email",
       parameters: {
         type: "object",
         properties: {
           name: { type: "string", description: "Patient's full name" },
           email: { type: "string", description: "Patient's email" },
           phone: { type: "string", description: "Patient's phone number" },
           date: { type: "string", description: "Appointment date (YYYY-MM-DD or 'tomorrow')" },
           time: { type: "string", description: "Appointment time (HH:MM AM/PM)" },
           reason: { type: "string", description: "Reason for visit" }
         },
         required: ["name", "email", "date", "time", "reason"]
       }
     }
   }
   ```

2. **Test immediately**
   ```bash
   npm run dev
   # Test appointment booking flow
   ```

**Time:** 5 minutes
**Risk:** Low
**Impact:** Fixes critical functionality

---

### Priority 2: Fix CORS (MEDIUM)

**Recommended Approach:** Server-side lead capture

1. **Create Edge Function**
   ```bash
   mkdir -p supabase/functions/lead-capture
   ```

2. **Implement server-side logic**
   - Move n8n webhook call from client to server
   - Add proper error handling
   - Return success/failure to client

3. **Update ChatWidget**
   - Call Edge Function instead of direct n8n webhook
   - Handle responses properly

**Time:** 30 minutes
**Risk:** Low
**Impact:** Improves security and reliability

---

### Priority 3: Add Better Error Messages (LOW)

**Update ChatWidget to show user-friendly errors**

```typescript
if (error.message.includes('Authentication required')) {
  displayMessage('ai', 'I apologize, but I need admin access for that action. Let me try another way...');
  // Fallback to alternative approach
}
```

---

## 📊 Testing Checklist

### Before Deployment

- [ ] Test appointment booking (unauthenticated user)
- [ ] Test appointment booking (authenticated user)
- [ ] Verify n8n webhook receives data
- [ ] Check Supabase database for appointments
- [ ] Verify confirmation emails sent
- [ ] Test error scenarios

### After Deployment

- [ ] Monitor Edge Function logs
- [ ] Check for 500 errors
- [ ] Verify CORS errors resolved
- [ ] Test from production domain
- [ ] Monitor n8n executions

---

## 🔍 Debugging Commands

### Check Edge Function Logs
```bash
supabase functions logs groq-chat --project-ref yfrpxqvjshwaaomgcaoq
```

### Test Edge Function Locally
```bash
supabase functions serve groq-chat --env-file .env.local
```

### Test n8n Webhook
```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "body": {
      "patient_name": "Test User",
      "patient_email": "test@example.com",
      "appointment_date": "2025-11-15",
      "appointment_time": "2:00 PM",
      "reason": "Test booking"
    }
  }'
```

---

## 📝 Configuration Files to Update

### 1. groqTools.ts
**Change:** Use `book_appointment_with_confirmation` instead of `trigger_automation`

### 2. n8n Workflow (Optional)
**Add:** CORS headers to webhook response

### 3. ChatWidget.tsx (Optional)
**Add:** Better error handling and fallbacks

---

## 🚀 Recommended Immediate Fix

**Quick Win:** 5-minute fix to restore functionality

```bash
# 1. Edit groqTools.ts
# Replace trigger_automation tool with book_appointment_with_confirmation

# 2. Redeploy Edge Function (if needed)
supabase functions deploy groq-chat --project-ref yfrpxqvjshwaaomgcaoq

# 3. Test
# Visit: https://srhbackend.odia.dev
# Try booking an appointment
```

---

## 📞 Monitoring

### Check These After Fix:

1. **Browser Console**
   - Should see: "✅ Appointment booked successfully"
   - Should NOT see: CORS errors or 500 errors

2. **n8n Executions**
   - Visit: https://cwai97.app.n8n.cloud/executions
   - Should see successful executions
   - Check workflow output

3. **Supabase Database**
   - Check `appointments` table
   - Verify new appointments created

4. **Email**
   - Check patient email
   - Verify confirmation received

---

## ✅ Success Criteria

- [ ] No CORS errors in browser console
- [ ] No 500 errors from Edge Function
- [ ] Appointments successfully booked
- [ ] n8n workflow executes
- [ ] Confirmation emails sent
- [ ] Database updated correctly

---

**Status:** 🔴 CRITICAL ERRORS IDENTIFIED
**Recommended Action:** Apply Priority 1 fix immediately
**ETA to Resolution:** 5-30 minutes depending on approach

---

**Last Updated:** November 12, 2025
**Next Review:** After implementing fixes
