# 🔧 n8n Webhook Activation Guide

## ⚠️ Current Issue

The webhook `https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook` is returning:

```
404: The requested webhook "srhcareai-webhook" is not registered.
```

## ✅ Solution: Activate the Workflow in n8n

### Step 1: Open n8n Dashboard

1. Go to: `https://cwai97.app.n8n.cloud`
2. Log in to your n8n account
3. Find the workflow with webhook path: `srhcareai-webhook`

### Step 2: Activate the Workflow

**Option A: Production Mode (Recommended)**

1. Open the workflow in n8n editor
2. Click the **"Active"** toggle in the top-right corner
3. The workflow should show as **"Active"** (green indicator)
4. The webhook will now be available at:
   - `https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook` (production)
   - OR `https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook` (test mode)

**Option B: Test Mode (Temporary)**

1. Open the workflow in n8n editor
2. Click **"Execute Workflow"** button on the canvas
3. This activates the webhook for **one call only**
4. Use the test URL: `https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook`

### Step 3: Verify Webhook Path

1. In the workflow editor, find the **Webhook** node
2. Check the **Path** field - it should be: `srhcareai-webhook`
3. If different, update it to match

### Step 4: Check "Respond to Webhook" Node

If you see error: `"Unused Respond to Webhook node found in the workflow"`:

1. Find the **"Respond to Webhook"** node in your workflow
2. Make sure it's **connected** to the workflow execution path
3. The node should receive data from previous nodes
4. If not connected, connect it properly

### Step 5: Test the Webhook

After activating, test with:

```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "patientRef": "patient-001",
    "channel": "web",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**Expected Response**: `200 OK` with workflow execution result

---

## 📝 Webhook Configuration

### Production URL (Active Workflow)
```
https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook
```

### Test URL (Execute Workflow Button)
```
https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook
```

### Payload Format

```json
{
  "conversationId": "string",
  "patientRef": "string",
  "channel": "web|voice|whatsapp",
  "messages": [
    {
      "role": "user|assistant",
      "content": "string"
    }
  ],
  "intent": "appointment|inquiry|emergency",
  "sentiment": "positive|neutral|negative",
  "timestamp": "ISO 8601 date string"
}
```

---

## 🔍 Troubleshooting

### Error: "Webhook not registered"
- **Fix**: Activate the workflow (see Step 2)

### Error: "Unused Respond to Webhook node"
- **Fix**: Connect the "Respond to Webhook" node to the workflow execution path

### Error: 404 Not Found
- **Fix**: Check webhook path matches exactly: `srhcareai-webhook`
- **Fix**: Make sure workflow is Active (not just saved)

### Error: CORS issues
- **Fix**: n8n cloud should handle CORS automatically
- **Fix**: If issues persist, check n8n workflow settings

---

## ✅ Success Indicators

When the webhook is properly activated:

1. ✅ Workflow shows **"Active"** status in n8n
2. ✅ Webhook URL returns `200 OK` (not 404)
3. ✅ Workflow execution appears in n8n "Executions" tab
4. ✅ No "Unused Respond to Webhook" errors

---

## 📚 Related Files

- **Webhook Helper**: `apps/web/src/lib/n8nWebhooks.ts`
- **Test Script**: `test-srhcareai-webhook.js`
- **Workflow File**: Check n8n dashboard for workflow JSON export

---

**Last Updated**: 2025-11-07

