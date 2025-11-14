# N8N Setup - Visual Step-by-Step Guide

## 🎯 Goal
Configure the "Send Text Response" node to send WhatsApp messages using your Meta access token.

**Time:** 5 minutes

---

## Step 1: Create WhatsApp Token Credential

### 1.1 Open N8N Credentials
```
URL: https://cwai97.app.n8n.cloud
→ Click "Credentials" (left sidebar)
→ Click "New Credential" (top-right button)
```

### 1.2 Search for HTTP Header Auth
```
In the search box, type: HTTP Header Auth
→ Click on "HTTP Header Auth" from the results
```

### 1.3 Fill in the Credential Details

**Copy and paste these EXACT values:**

```
┌─────────────────────────────────────────────────────────────────┐
│ HTTP Header Auth                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Name:                                                           │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ WhatsApp Token                                              ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Header Name:                                                    │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Authorization                                               ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Header Value:                                                   │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Bearer EAAJaXqNZCT2sBP10xUw1ZCci6ZAolSXpg8dWZB5Y9CYF44l... ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                           [Save]  [Cancel]                      │
└─────────────────────────────────────────────────────────────────┘
```

**IMPORTANT:** The Header Value must start with `Bearer ` (with a space after)

**Full Header Value to copy:**
```
Bearer EAAJaXqNZCT2sBP10xUw1ZCci6ZAolSXpg8dWZB5Y9CYF44lkQO6tDX1ZCOABvuktlTeNdZC2JjZBGa3h7cuzmj3jjTXYPSZAHqYf8mrhqWwQ1WcEfWHerk1AQ2s3wAZAuxuVBR3yKHorSFjyLxKC1mSOo24IzXMVAnyV0FzdFy04lv8inw6ditrgdkA6GSr2fZBUbC09hUExqcXGNZAF7DsYE7NZC7fjgrZACc2FtVeSLcHrt8MONF48ZD
```

### 1.4 Save Credential
```
→ Click "Save" button
→ You should see "WhatsApp Token" in your credentials list
```

---

## Step 2: Open Your Workflow

### 2.1 Navigate to Workflows
```
→ Click "Workflows" (left sidebar)
→ Find: "WhatsApp Serenity Hospital Bot - Edge Function Integration"
→ Click to open it
```

---

## Step 3: Configure Send Text Response Node

### 3.1 Find and Click the Node
```
→ Scroll to find the "Send Text Response" node
→ It should be at position [2600, 600] in the workflow
→ Click on the node to open its settings
```

### 3.2 Verify Node Configuration

The node should already have these settings (DO NOT CHANGE):

```
┌─────────────────────────────────────────────────────────────────┐
│ Send Text Response                                              │
├─────────────────────────────────────────────────────────────────┤
│ Method: POST                                                    │
│                                                                 │
│ URL:                                                            │
│ https://graph.facebook.com/v17.0/825467040645950/messages      │
│                                                                 │
│ Authentication: Generic Credential Type                         │
│   → HTTP Header Auth                                           │
│                                                                 │
│ Headers:                                                        │
│   Content-Type: application/json                               │
│                                                                 │
│ Body:                                                           │
│   JSON                                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Assign Credential

**THIS IS THE KEY STEP:**

```
Scroll down to:

┌─────────────────────────────────────────────────────────────────┐
│ Credential to connect with:                                     │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Select Credential...                    ▼                   ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘

→ Click on the dropdown
→ Select: "WhatsApp Token"

After selection:

┌─────────────────────────────────────────────────────────────────┐
│ Credential to connect with:                                     │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ WhatsApp Token                                          ✓   ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Save Node
```
→ Click "Save" button on the node
→ The node should now show a green checkmark ✓
```

---

## Step 4: Save and Activate Workflow

### 4.1 Save Workflow
```
→ Click "Save" button (top-right of workflow editor)
→ Wait for "Workflow saved" confirmation
```

### 4.2 Activate Workflow
```
→ Toggle the "Active" switch (top-right)
→ It should turn green/blue
→ Status should show: "Workflow is active"
```

---

## Step 5: Test Configuration

### 5.1 Add Mock Data to Test

1. **Click on "WhatsApp Trigger" node**

2. **Click "Add test data" or "Execute node"**

3. **Paste this mock data:**
```json
{
  "contacts": [
    {
      "profile": {"name": "Test User"},
      "wa_id": "2348012345678"
    }
  ],
  "messages": [
    {
      "from": "2348012345678",
      "id": "wamid.test123",
      "timestamp": "1699900800",
      "text": {"body": "Hi"},
      "type": "text"
    }
  ]
}
```

### 5.2 Execute Workflow
```
→ Click "Test workflow" button
→ Watch the nodes execute
```

### 5.3 Expected Results

**Nodes that SHOULD succeed (green):**
- ✅ WhatsApp Trigger
- ✅ Input Type Router
- ✅ Process Text Input
- ✅ Call Groq Edge Function
- ✅ Check If Voice Input

**Node that MAY fail (expected in sandbox):**
- ⚠️ Send Text Response - Error: "Recipient phone number not in allowed list"

**This is NORMAL!** It means:
- ✅ Authentication is working
- ✅ Node is configured correctly
- ⚠️ You need to add your phone number to Meta's sandbox

---

## Step 6: Add Your Number to Sandbox

### 6.1 Go to Meta Business Manager
```
URL: https://business.facebook.com
→ Select your app
→ Click "WhatsApp" → "API Setup"
```

### 6.2 Add Test Recipient
```
In the "To" field:
→ Enter your phone number: +234XXXXXXXXXX
→ Click "Add"
→ Your number is now in the allowed list
```

### 6.3 Test End-to-End
```
→ Send a real WhatsApp message to your business number
→ Type: "Hi"
→ Expected: You receive a response from the AI!
```

---

## ✅ Success Checklist

Verify these are all complete:

- [ ] HTTP Header Auth credential "WhatsApp Token" created
- [ ] Credential has `Bearer` + your Meta access token
- [ ] "Send Text Response" node has credential assigned
- [ ] Node shows green checkmark
- [ ] Workflow saved
- [ ] Workflow active
- [ ] Mock data test executed
- [ ] Your phone number added to Meta sandbox
- [ ] Real WhatsApp message test successful

---

## 🎉 You're Done!

Once all checkboxes are complete, your WhatsApp integration is fully working!

**What patients can now do:**
- Book appointments via WhatsApp
- Check availability
- View their appointments
- Reschedule or cancel
- Get confirmation emails

**Monitor:**
- N8N Executions: https://cwai97.app.n8n.cloud/executions
- Edge Function Logs: `supabase functions logs groq-chat --follow`

---

## Troubleshooting

### "Credential not found"
→ Make sure name is exactly: `WhatsApp Token`
→ Check it exists in Credentials list

### "401 Unauthorized"
→ Verify token includes `Bearer ` prefix
→ Get fresh token from Meta if expired

### "Recipient not in allowed list"
→ Add your number in Meta Business Manager
→ OR move to production (no restrictions)

### "Invalid phone number ID"
→ Check URL has correct ID: `825467040645950`

---

## Need Help?

- Full Guide: [CONFIGURE_META_WHATSAPP_TOKEN.md](CONFIGURE_META_WHATSAPP_TOKEN.md)
- Deployment: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- Success Report: [WHATSAPP_INTEGRATION_SUCCESS.md](WHATSAPP_INTEGRATION_SUCCESS.md)
