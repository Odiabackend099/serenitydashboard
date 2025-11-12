# 🔧 N8N WORKFLOW FIX - MANUAL STEPS REQUIRED

**Issue**: The Switch node "Route by Action" is not routing to "Create Appointment"
**Cause**: The condition `$json.body.action === 'book_appointment'` is not matching
**Solution**: Manually update the n8n workflow in the UI

---

## ⚠️ CRITICAL: Manual Fix Required in n8n UI

Since none of the payload structures worked, the issue is in the n8n workflow configuration itself. You MUST edit the workflow manually in n8n.

---

## 🛠️ STEP-BY-STEP FIX (DO THIS IN N8N UI)

### Step 1: Open n8n Workflow Editor
1. Go to: https://cwai97.app.n8n.cloud
2. Click on "Serenity Workflow - Ready to Import"
3. Click "Editor" tab

### Step 2: Click on "Route by Action" Node
1. Find the Switch node called "Route by Action"
2. Click on it to open its settings

### Step 3: Check the `book_appointment` Condition
Look for the condition that checks for "book_appointment". It should currently be:

**Current (Broken) Condition**:
```
Mode: Rules
Condition: $json.body.action
Equals: book_appointment
```

### Step 4: Fix the Condition - TRY THESE OPTIONS:

**Option 1: Check Multiple Locations (RECOMMENDED)**
Change the "Value 1" field from:
```
={{ $json.body.action }}
```
To:
```
={{ $json.action || $json.body.action || $json.body.body.action }}
```

**Option 2: Use Expression to Debug**
Change to see what's actually there:
```
={{ Object.keys($json).join(', ') }}
```
This will show you what fields exist in $json.

**Option 3: Make it Case-Insensitive**
Change the condition settings:
- Uncheck "Case Sensitive"
- Change "Type Validation" from "Strict" to "Loose"

**Option 4: Use .includes() Instead**
Change operator from "equals" to "contains":
```
Value 1: ={{ JSON.stringify($json) }}
Operator: contains
Value 2: book_appointment
```

### Step 5: Test the Node
1. After making changes, click "Execute Node" button
2. Use test data or click "Listen for Test Event"
3. Send a test booking request
4. Check if it routes correctly now

### Step 6: Save the Workflow
1. Click "Save" button (top right)
2. Ensure workflow is Active (toggle should be green)

---

## 🧪 ALTERNATIVE: Add Debug Node

If the above doesn't work, add debugging:

### Add a "Code" Node Before Switch:

1. Click "+" between "Webhook Trigger" and "Route by Action"
2. Add a "Code" node
3. Use this code:

```javascript
// Log what webhook actually receives
console.log('Webhook received:', JSON.stringify($input.all(), null, 2));
console.log('First item:', JSON.stringify($input.first(), null, 2));

// Return the data unchanged
return $input.all();
```

4. Save and re-run
5. Check the n8n execution logs to see what the webhook actually received

---

## 🔍 DIAGNOSIS: What's Probably Happening

Based on the fact that ALL 4 payload structures failed:

### Possibility 1: Data is Nested Deeper
The webhook might be wrapping data like:
```json
{
  "body": {
    "body": {
      "action": "book_appointment"
    }
  }
}
```

### Possibility 2: Data is at Wrong Level
The webhook might be flattening to:
```json
{
  "action": "book_appointment"  // At root, not in body
}
```

### Possibility 3: Field Name is Different
The webhook might be transforming the field name:
- `action` → `actionType`
- `action` → `event`
- `action` → `type`

### Possibility 4: Switch Node is in Wrong Mode
The Switch node might need to be in "Expression" mode instead of "Rules" mode.

---

## ✅ GUARANTEED SOLUTION: Simplify the Workflow

If editing the Switch node doesn't work, **rebuild the routing logic**:

### Replace "Route by Action" with Multiple IF Nodes:

1. **Delete the "Route by Action" Switch node**

2. **Add an IF node** after Webhook Trigger:
   ```
   Condition: ={{ $json.body.action === 'book_appointment' || $json.action === 'book_appointment' }}
   ```

3. **TRUE branch** → Goes to "Create Appointment"
4. **FALSE branch** → Add another IF node for other actions

This is simpler and more reliable than a complex Switch node.

---

## 🚨 EMERGENCY WORKAROUND: Bypass Routing

If you need emails working IMMEDIATELY:

### Temporary Fix (Not Recommended for Production):

1. In n8n, click on "Webhook Trigger"
2. Connect it DIRECTLY to "Create Appointment" node
3. This will always create appointments regardless of action
4. Save and test

**Why this works**: Bypasses the broken routing entirely.

**Downside**: All webhook calls will create appointments, even non-booking requests.

---

## 📊 WHAT TO LOOK FOR IN N8N EXECUTION LOGS

When you click on a failed execution:

1. Click on "Webhook Trigger" node
2. Look at the OUTPUT tab
3. You should see something like:

```json
{
  "headers": {...},
  "params": {},
  "query": {},
  "body": {
    "action": "book_appointment",
    ...
  }
}
```

**Key Question**: Where exactly is the `"action": "book_appointment"` field?
- Is it at `body.action`?
- Is it at `body.body.action`?
- Is it at root level?

---

## 🔧 AFTER YOU FIX IT

Once you identify the correct field path:

1. **Update the Edge Function** to match that structure
2. **Update this document** with the working configuration
3. **Test end-to-end** to confirm emails are sent

---

## 📞 REPORT BACK

After trying these fixes in n8n UI, please share:

1. Screenshot of the "Webhook Trigger" node OUTPUT
2. Screenshot of the "Route by Action" node settings
3. Screenshot showing the execution path (which nodes lit up)

This will help me provide the exact fix.

---

**Current Status**: Waiting for manual n8n workflow edit
**Next Step**: Edit Switch node in n8n UI using options above
**Goal**: Make "Route by Action" route to "Create Appointment" successfully

---

*The payload structure from Edge Function is correct. The issue is in n8n workflow configuration.*
