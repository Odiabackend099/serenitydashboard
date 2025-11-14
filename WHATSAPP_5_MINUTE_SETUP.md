# ⚡ WhatsApp Setup - 5 Minute Guide

## Your Meta WhatsApp API Details

```
Access Token: EAAJaXqNZCT2sBP10xUw1ZCci6ZAolSXpg8dWZB5Y9CYF44lkQO6tDX1ZCOABvuktlTeNdZC2JjZBGa3h7cuzmj3jjTXYPSZAHqYf8mrhqWwQ1WcEfWHerk1AQ2s3wAZAuxuVBR3yKHorSFjyLxKC1mSOo24IzXMVAnyV0FzdFy04lv8inw6ditrgdkA6GSr2fZBUbC09hUExqcXGNZAF7DsYE7NZC7fjgrZACc2FtVeSLcHrt8MONF48ZD

Business Account ID: 1547229846265674
Phone Number ID: 825467040645950
```

---

## 3 Steps to Go Live

### Step 1: Create Credential (2 minutes)

**Go to:** https://cwai97.app.n8n.cloud → Credentials → New Credential

**Type:** HTTP Header Auth

**Fill in:**
```
Name: WhatsApp Token
Header Name: Authorization
Header Value: Bearer EAAJaXqNZCT2sBP10xUw1ZCci6ZAolSXpg8dWZB5Y9CYF44lkQO6tDX1ZCOABvuktlTeNdZC2JjZBGa3h7cuzmj3jjTXYPSZAHqYf8mrhqWwQ1WcEfWHerk1AQ2s3wAZAuxuVBR3yKHorSFjyLxKC1mSOo24IzXMVAnyV0FzdFy04lv8inw6ditrgdkA6GSr2fZBUbC09hUExqcXGNZAF7DsYE7NZC7fjgrZACc2FtVeSLcHrt8MONF48ZD
```

**Click:** Save

---

### Step 2: Assign to Workflow (2 minutes)

**Go to:** Workflows → "WhatsApp Serenity Hospital Bot - Edge Function Integration"

**Find:** "Send Text Response" node → Click it

**Scroll to:** "Credential to connect with" dropdown

**Select:** "WhatsApp Token"

**Click:** Save (node) → Save (workflow)

---

### Step 3: Add Your Number to Sandbox (1 minute)

**Go to:** https://business.facebook.com → Your App → WhatsApp → API Setup

**Find:** "To" field in test message section

**Add:** Your phone number (+234XXXXXXXXXX)

**Click:** "Add"

---

## ✅ Test It!

**Send WhatsApp message to your business number:**
```
Hi
```

**Expected Response:**
```
👋 Good day! Welcome to Serenity Royale Hospital in Lagos, Nigeria.
How may I assist you today? 🤔
```

**If you get this:** 🎉 **SUCCESS!** Your WhatsApp integration is live!

---

## Quick Troubleshooting

**"Credential not found"**
→ Check name is exactly: `WhatsApp Token`

**"401 Unauthorized"**
→ Verify token has `Bearer ` prefix

**"Recipient not in allowed list"**
→ Add your number in Meta Business Manager (Step 3)

---

## Next Steps

Once working:
- Test booking appointment
- Verify email confirmations sent
- Monitor N8N executions
- Ready for production!

---

## Full Guides

- **Visual Guide:** [N8N_SETUP_STEPS.md](N8N_SETUP_STEPS.md)
- **Meta Details:** [CONFIGURE_META_WHATSAPP_TOKEN.md](CONFIGURE_META_WHATSAPP_TOKEN.md)
- **Full Deployment:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
