# Configure Meta WhatsApp API Token - Quick Steps

## Your Meta WhatsApp Details

**Access Token:** `EAAJaXqNZCT2sBP10xUw1ZCci6ZAolSXpg8dWZB5Y9CYF44lkQO6tDX1ZCOABvuktlTeNdZC2JjZBGa3h7cuzmj3jjTXYPSZAHqYf8mrhqWwQ1WcEfWHerk1AQ2s3wAZAuxuVBR3yKHorSFjyLxKC1mSOo24IzXMVAnyV0FzdFy04lv8inw6ditrgdkA6GSr2fZBUbC09hUExqcXGNZAF7DsYE7NZC7fjgrZACc2FtVeSLcHrt8MONF48ZD`

**WhatsApp Business Account ID:** `1547229846265674`

**Phone Number ID (in workflow):** `825467040645950`

---

## Step 1: Create HTTP Header Auth Credential in N8N (2 minutes)

1. **Go to N8N:** https://cwai97.app.n8n.cloud

2. **Navigate to Credentials:**
   - Click **"Credentials"** in the left sidebar
   - Click **"New Credential"** (top-right)

3. **Search and Select:**
   - Type: `HTTP Header Auth`
   - Click on **"HTTP Header Auth"**

4. **Configure Credential:**
   ```
   Name: WhatsApp Token

   Header Name: Authorization

   Header Value: Bearer EAAJaXqNZCT2sBP10xUw1ZCci6ZAolSXpg8dWZB5Y9CYF44lkQO6tDX1ZCOABvuktlTeNdZC2JjZBGa3h7cuzmj3jjTXYPSZAHqYf8mrhqWwQ1WcEfWHerk1AQ2s3wAZAuxuVBR3yKHorSFjyLxKC1mSOo24IzXMVAnyV0FzdFy04lv8inw6ditrgdkA6GSr2fZBUbC09hUExqcXGNZAF7DsYE7NZC7fjgrZACc2FtVeSLcHrt8MONF48ZD
   ```

   **IMPORTANT:** Make sure to include `Bearer ` before the token!

5. **Save:**
   - Click **"Save"** button
   - The credential should appear in your list

---

## Step 2: Assign Credential to Workflow (2 minutes)

1. **Open Workflow:**
   - Go to **Workflows**
   - Open: **"WhatsApp Serenity Hospital Bot - Edge Function Integration"**

2. **Click on "Send Text Response" Node:**
   - Find the node in the workflow
   - Click to open it

3. **Assign Credential:**
   - Scroll to **"Authentication"** section
   - You should see: **Generic Credential Type** → **HTTP Header Auth**
   - In **"Credential to connect with"** dropdown:
     - Select: **"WhatsApp Token"** (the credential you just created)

4. **Save Node:**
   - Click **"Save"** on the node

5. **Save Workflow:**
   - Click **"Save"** on the workflow (top-right)

---

## Step 3: Verify Configuration (1 minute)

### Check Node Configuration

The "Send Text Response" node should have:

**URL:**
```
https://graph.facebook.com/v17.0/825467040645950/messages
```

**Method:** `POST`

**Authentication:** HTTP Header Auth → WhatsApp Token

**Headers:**
- Content-Type: `application/json`
- Authorization: `Bearer YOUR_TOKEN` (from credential)

**Body:**
```json
{
  "messaging_product": "whatsapp",
  "to": "{{ $('WhatsApp Trigger').item.json.messages[0].from }}",
  "type": "text",
  "text": {
    "body": "{{ $('Call Groq Edge Function').item.json.response || $('Call Groq Edge Function').item.json.message }}"
  }
}
```

### Verify in N8N

1. The "Send Text Response" node should show a **green checkmark** ✓
2. No red error indicators
3. Credential is assigned

---

## Step 4: Test the Configuration (5 minutes)

### Option A: Test with Mock Data (Quick)

1. **Add Mock Data to WhatsApp Trigger:**
   ```json
   {
     "contacts": [
       {
         "profile": {"name": "Samuel Eguale"},
         "wa_id": "2348012345678"
       }
     ],
     "messages": [
       {
         "from": "2348012345678",
         "id": "wamid.test123456789",
         "timestamp": "1699900800",
         "text": {"body": "Hi"},
         "type": "text"
       }
     ]
   }
   ```

2. **Execute Workflow:**
   - Click **"Test workflow"**
   - Check if all nodes turn green
   - **Note:** The "Send Text Response" will fail with "Recipient not in allowed list" - this is expected in sandbox mode

### Option B: Add Your Number to Sandbox (Recommended)

1. **Go to Meta Business Manager:**
   - URL: https://business.facebook.com
   - Select your app

2. **Navigate to WhatsApp API Setup:**
   - **WhatsApp** → **API Setup**

3. **Add Your Phone Number:**
   - Find the **"To"** field in the test message section
   - Add your phone number: `+2348012345678` (your actual number)
   - Click **"Add"**

4. **Send Test Message from Meta:**
   - Use Meta's test interface
   - Send a test message to verify your number is in the allowed list

5. **Test End-to-End:**
   - Send a real WhatsApp message to your business number
   - Expected: You receive a response!

---

## Troubleshooting

### Issue: "Credential not found"

**Solution:**
- Make sure the credential name is **exactly**: `WhatsApp Token`
- Check the credential exists in **Credentials** list
- Re-assign the credential to the node

### Issue: "401 Unauthorized"

**Solution:**
- Verify the token starts with `Bearer ` in the credential
- Check the token is not expired (Meta tokens expire)
- Get a fresh token from Meta Business Manager if needed

### Issue: "Recipient phone number not in allowed list"

**Solution:**
- This is **normal in sandbox mode**
- Add your phone number to Meta's allowed list (see Step 4, Option B)
- OR move to production WhatsApp API (no restrictions)

### Issue: "Invalid phone number ID"

**Solution:**
- Verify the URL has the correct Phone Number ID: `825467040645950`
- This should match your WhatsApp Business phone number

---

## Next Steps

Once configured:

1. ✅ **WhatsApp Token credential created**
2. ✅ **Credential assigned to "Send Text Response" node**
3. ⏳ **Add your number to sandbox** (Meta Business Manager)
4. ⏳ **Test with real WhatsApp message**

**After testing successfully:**
- Monitor N8N executions
- Check Edge Function logs
- Verify email confirmations sent
- Ready for production!

---

## Production Deployment

When ready to go live:

1. **Complete Meta Business Verification:**
   - Business profile
   - Display name approval
   - Payment method

2. **Get Production Access Token:**
   - Generate new token in Meta Business Manager
   - Update "WhatsApp Token" credential in N8N

3. **No Sandbox Restrictions:**
   - Can send to any phone number
   - Higher rate limits
   - More reliable delivery

---

## Meta WhatsApp API URLs

**For reference:**
- Meta Business Manager: https://business.facebook.com
- WhatsApp API Setup: https://business.facebook.com → Your App → WhatsApp → API Setup
- Account Settings: https://business.facebook.com → Business Settings → WhatsApp Business Accounts

**Your Account ID:** `1547229846265674`

---

## Summary

**What you just configured:**
- ✅ HTTP Header Auth credential with your Meta access token
- ✅ Authentication for sending WhatsApp messages
- ✅ Proper Meta API endpoint configuration

**What works now:**
- ✅ Receiving WhatsApp messages (already working)
- ✅ Processing with Edge Function (already working)
- ✅ AI responses (already working)
- ✅ Ready to send messages (with sandbox recipients added)

**Next:** Add your phone number to Meta's sandbox allowed list and test!
