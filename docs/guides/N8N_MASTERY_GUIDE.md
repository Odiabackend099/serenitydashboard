# 🚀 n8n Automation Mastery Guide
## Complete Guide for Serenity Royale Hospital

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Workflow Architecture](#workflow-architecture)
4. [Best Practices](#best-practices)
5. [Serenity Workflow Explained](#serenity-workflow-explained)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Techniques](#advanced-techniques)

---

## 1. Introduction

### What is n8n?
n8n is a fair-code workflow automation tool that allows you to connect different services and automate tasks. Think of it as "IFTTT on steroids" - if THIS happens, then do THAT.

### Why n8n for Healthcare?
- **HIPAA Compliance**: Self-hosted option for sensitive data
- **Flexibility**: Connect any service with webhooks
- **Visual Workflow**: Easy to understand and maintain
- **No Code/Low Code**: Accessible to non-developers
- **Error Handling**: Built-in retry and error recovery

---

## 2. Core Concepts

### Nodes
**Nodes** are the building blocks of n8n workflows. Each node performs one specific task.

#### Node Types:

**1. Trigger Nodes** - Start the workflow
```
Examples:
- Webhook (HTTP endpoint)
- Schedule (Cron job)
- Email Trigger
- Database Trigger
```

**2. Action Nodes** - Do something
```
Examples:
- Gmail (Send email)
- Supabase (Database operations)
- HTTP Request (API calls)
- Code (Custom JavaScript)
```

**3. Logic Nodes** - Make decisions
```
Examples:
- IF (Conditional branching)
- Switch (Multiple branches)
- Merge (Combine data)
- Set (Transform data)
```

### Connections
Connections are the **arrows** between nodes that define the flow of data.

```
[Trigger] → [Process] → [Send Email] → [Log]
```

### Data Flow
Each node receives data from the previous node and passes data to the next node.

**Data Format:**
```javascript
{
  json: {
    patientName: "John Doe",
    email: "john@example.com"
  }
}
```

---

## 3. Workflow Architecture

### The Perfect Workflow Structure

```
┌─────────────────┐
│  Webhook        │ ← Entry point (HTTP POST)
│  Trigger        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse &        │ ← Extract & validate data
│  Validate       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Conditional    │ ← Route based on action
│  Logic (IF)     │
└───┬─────────┬───┘
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Action │ │ Action │ ← Execute operations
│   A    │ │   B    │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         ▼
┌─────────────────┐
│  Log Success    │ ← Record outcome
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Respond to     │ ← Send HTTP response
│  Webhook        │
└─────────────────┘
```

---

## 4. Best Practices

### ✅ DO's

#### 1. **Always Validate Input**
```javascript
// In Parse Payload node
const payload = $input.all()[0].json;

// Validate required fields
if (!payload.email || payload.email === '') {
  throw new Error('Email is required');
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(payload.email)) {
  throw new Error('Invalid email format');
}
```

#### 2. **Use Descriptive Node Names**
```
❌ Bad: "Code", "IF", "Email"
✅ Good: "Parse Payload", "Is Reschedule?", "Send Confirmation Email"
```

#### 3. **Handle Errors Gracefully**
```javascript
try {
  // Risky operation
  const result = await someOperation();
  return [{ json: { success: true, result } }];
} catch (error) {
  console.error('Operation failed:', error);
  return [{ json: { success: false, error: error.message } }];
}
```

#### 4. **Log Everything**
```javascript
console.log('===== WORKFLOW STARTED =====');
console.log(`Action: ${actionType}`);
console.log(`Patient: ${patientName}`);
console.log(`Email: ${patientEmail}`);
console.log('===========================');
```

#### 5. **Use Response Nodes**
Always respond to webhooks to acknowledge receipt:
```javascript
// Success response
{
  success: true,
  action: "appointment_created",
  message: "Email sent to patient@example.com"
}

// Error response
{
  success: false,
  error: "Invalid email address",
  details: "Email cannot be empty"
}
```

#### 6. **Normalize Data Early**
```javascript
// Extract with multiple fallbacks
const patientEmail =
  payload.patientEmail ||
  payload.patient_email ||
  payload.email ||
  '';

// Normalize strings
const actionType = (payload.actionType || 'create').toLowerCase().trim();
```

#### 7. **Use Environment Variables**
Store sensitive data as credentials:
```
- Gmail OAuth2
- Supabase API keys
- n8n webhook URLs
```

#### 8. **Test with Real Data**
Use the "Test workflow" button and "Execute node" to verify each step.

---

### ❌ DON'Ts

#### 1. **Don't Hardcode Values**
```javascript
❌ Bad:
const email = "admin@hospital.com";

✅ Good:
const email = $json.adminEmail || process.env.ADMIN_EMAIL;
```

#### 2. **Don't Trust Input**
```javascript
❌ Bad:
const email = payload.email; // What if undefined?

✅ Good:
const email = payload.email || '';
if (!email) throw new Error('Email required');
```

#### 3. **Don't Create Duplicate Logic**
Use "Merge" nodes or functions to avoid repeating code.

#### 4. **Don't Ignore Errors**
Always handle potential failures:
```javascript
❌ Bad:
await sendEmail(email);

✅ Good:
try {
  await sendEmail(email);
} catch (error) {
  console.error('Email send failed:', error);
  // Notify admin or retry
}
```

#### 5. **Don't Skip Testing**
Test every path:
- ✅ Normal flow
- ✅ Error cases
- ✅ Edge cases (empty data, special characters)

---

## 5. Serenity Workflow Explained

### Workflow Flow Diagram

```
           Webhook Trigger
                  │
                  ▼
           Parse Payload
        (Extract & Validate)
                  │
                  ▼
          Validate Email
         ┌────────┴────────┐
         │ Valid           │ Invalid
         ▼                 ▼
   Store Appointment   Respond Error
         │
         ▼
   Is Reschedule?
   ┌─────┴─────┐
   │ Yes       │ No
   ▼           ▼
Send         Is Cancel?
Reschedule   ┌────┴────┐
Email        │ Yes     │ No
             ▼         ▼
           Send      Send
           Cancel    Confirmation
           Email     Email
                │
                ▼
           Log Success
                │
                ▼
          Respond Success
```

---

### Node-by-Node Breakdown

#### **Node 1: Webhook Trigger**
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "serenity-webhook-v2",
    "options": {
      "responseMode": "responseNode"
    }
  }
}
```

**Purpose:** Receives HTTP POST requests from:
- VAPI voice AI
- Groq text chat
- Admin dashboard
- Public widget

**Output:** Raw payload from caller

---

#### **Node 2: Parse Payload**
```javascript
// Extract data with fallbacks
const patientEmail =
  payload.patientEmail ||
  payload.patient_email ||
  payload.email ||
  '';

// Normalize action type
const actionType = (
  payload.actionType ||
  payload.action ||
  'create'
).toLowerCase().trim();

// Validate email
if (!patientEmail || patientEmail === 'noreply@serenityroyalehospital.com') {
  throw new Error(`Invalid email: ${patientEmail}`);
}
```

**Purpose:**
- Extract data from various payload formats
- Normalize field names
- Validate required fields
- Provide fallback values

**Output:** Standardized data object

---

#### **Node 3: Validate Email**
```javascript
{
  "conditions": {
    "conditions": [
      {
        "leftValue": "={{ $json.patientEmail }}",
        "rightValue": "",
        "operator": "notEmpty"
      },
      {
        "leftValue": "={{ $json.patientEmail }}",
        "rightValue": "noreply@serenityroyalehospital.com",
        "operator": "notEquals"
      }
    ],
    "combinator": "and"
  }
}
```

**Purpose:**
- Ensure email exists
- Prevent sending to noreply addresses
- Early validation to fail fast

**Output:**
- TRUE path → Continue to appointment logic
- FALSE path → Respond with error

---

#### **Node 4: Store Appointment**
```javascript
// Store in Supabase appointments table
const appointmentData = {
  patient_name: $json.patientName,
  patient_email: $json.patientEmail,
  patient_phone: $json.patientPhone,
  appointment_date: $json.appointmentDate,
  appointment_time: $json.appointmentTime,
  reason: $json.appointmentReason,
  status: 'confirmed',
  created_at: new Date().toISOString()
};

// Insert into database
// await supabase.from('appointments').insert(appointmentData);
```

**Purpose:**
- Persist appointment to database
- Create audit trail
- Enable future lookups

**Output:** Data passes through unchanged

---

#### **Node 5-7: Conditional Routing**

**Is Reschedule?**
```javascript
if (actionType === 'reschedule') {
  // Send reschedule email
} else {
  // Check if cancel
}
```

**Is Cancel?**
```javascript
if (actionType === 'cancel') {
  // Send cancellation email
} else {
  // Send confirmation email (default)
}
```

**Purpose:** Route to appropriate email template

---

#### **Node 8-10: Email Nodes**

**Professional Email Template Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial; background-color: #f4f4f4;">
  <!-- Responsive container -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066CC 0%, #004C99 100%);">
              <h1 style="color: #ffffff;">✓ Appointment Confirmed</h1>
            </td>
          </tr>

          <!-- Body with appointment details -->
          <tr>
            <td style="padding: 40px;">
              <p>Dear <strong>{{ $json.patientName }}</strong>,</p>

              <!-- Green card with appointment info -->
              <table style="background-color: #d4edda; border-left: 4px solid #28a745;">
                <tr>
                  <td>
                    <p><strong>Date:</strong> {{ $json.appointmentDate }}</p>
                    <p><strong>Time:</strong> {{ $json.appointmentTime }}</p>
                    <p><strong>Reason:</strong> {{ $json.appointmentReason }}</p>
                  </td>
                </tr>
              </table>

              <!-- What to bring list -->
              <ul>
                <li>Valid ID</li>
                <li>Insurance card</li>
                <li>Medical records</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; text-align: center;">
              <p>Serenity Royale Hospital</p>
              <p>info.serenityroyalehospital@gmail.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Email Best Practices:**
- ✅ Use responsive table layout (not divs)
- ✅ Inline styles (email clients strip <style> tags)
- ✅ 600px max width for desktop compatibility
- ✅ Clear visual hierarchy with colors
- ✅ Mobile-friendly font sizes (14px+)
- ✅ Include contact information
- ✅ Use emoji sparingly for visual appeal

---

#### **Node 11: Log Success**
```javascript
{
  success: true,
  action: $json.actionType,
  email: $json.patientEmail,
  patient: $json.patientName,
  timestamp: new Date().toISOString(),
  message: `Email sent successfully to ${$json.patientEmail}`
}
```

**Purpose:**
- Create execution log
- Track successful operations
- Enable debugging

---

#### **Node 12: Respond Success**
```javascript
{
  success: true,
  action: "appointment_confirmed",
  email: "patient@example.com",
  message: "Email sent successfully"
}
```

**Purpose:**
- Acknowledge webhook receipt
- Provide execution feedback
- Close HTTP request

---

## 6. Common Patterns

### Pattern 1: Multi-Source Webhook Handler
```javascript
// Handle data from multiple sources
const email =
  payload.patientEmail ||      // From admin dashboard
  payload.patient_email ||     // From database export
  payload.email ||             // From public widget
  payload.userEmail ||         // From VAPI
  '';
```

### Pattern 2: Conditional Branching
```
         IF Node
      ┌────┴────┐
      │ True    │ False
      ▼         ▼
   Action A   Action B
      │         │
      └────┬────┘
           ▼
      Continue
```

### Pattern 3: Error Recovery
```javascript
try {
  await primaryService();
} catch (error) {
  console.log('Primary failed, trying backup');
  await backupService();
}
```

### Pattern 4: Data Transformation
```javascript
// Transform date formats
const dateString = "2025-01-15";
const formatted = new Date(dateString).toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
// "Wednesday, January 15, 2025"
```

### Pattern 5: Parallel Processing
```
        Split
    ┌────┼────┐
    ▼    ▼    ▼
  Task1 Task2 Task3
    │    │    │
    └──Merge──┘
        │
        ▼
    Continue
```

---

## 7. Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Email not received"

**Symptoms:** Workflow executes successfully but no email arrives

**Debugging Steps:**
1. Check execution log in n8n
2. Verify email node shows success
3. Check spam/junk folder
4. Verify Gmail OAuth2 credentials
5. Check Gmail API quotas

**Solution:**
```javascript
// Add explicit logging
console.log(`Sending email to: ${patientEmail}`);
console.log(`Gmail node result:`, $node["Send Email"].json);
```

#### Issue 2: "Webhook not triggering"

**Symptoms:** POST requests return 404 or don't execute workflow

**Debugging Steps:**
1. Activate workflow (switch must be ON)
2. Verify webhook URL matches exactly
3. Check HTTP method (must be POST)
4. Test with curl or Postman

**Solution:**
```bash
# Test webhook with curl
curl -X POST https://n8n.odia.dev/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Test Patient",
    "patientEmail": "test@example.com",
    "appointmentDate": "2025-01-15",
    "appointmentTime": "10:00 AM",
    "actionType": "create"
  }'
```

#### Issue 3: "Undefined variable error"

**Symptoms:** `Cannot read property 'email' of undefined`

**Debugging Steps:**
1. Check previous node output
2. Verify data structure
3. Add null checks

**Solution:**
```javascript
// Safe access with optional chaining
const email = $json?.patientEmail || '';

// Or explicit check
const email = $json && $json.patientEmail ? $json.patientEmail : '';
```

#### Issue 4: "Wrong email sent"

**Symptoms:** Confirmation email sent when should reschedule

**Debugging Steps:**
1. Check IF node conditions
2. Verify actionType normalization
3. Log actionType value

**Solution:**
```javascript
// Normalize BEFORE checking
const actionType = (payload.actionType || 'create').toLowerCase().trim();
console.log(`Normalized actionType: "${actionType}"`);

// Strict equality check
if (actionType === 'reschedule') {
  // Send reschedule email
}
```

#### Issue 5: "Execution stuck"

**Symptoms:** Workflow never completes, no response

**Debugging Steps:**
1. Check for infinite loops
2. Verify all paths end with response node
3. Check for awaited promises

**Solution:**
```javascript
// Always return from code nodes
return [{ json: result }];

// Always respond to webhooks
// Add "Respond to Webhook" node at the end
```

---

## 8. Advanced Techniques

### Technique 1: Dynamic Email Templates

**Use Case:** Different email layouts based on appointment type

```javascript
// In Code node before email
const templates = {
  routine_checkup: 'template_checkup.html',
  emergency: 'template_emergency.html',
  followup: 'template_followup.html'
};

const templateName = templates[$json.appointmentType] || 'template_default.html';

return [{
  json: {
    ...$json,
    emailTemplate: templateName
  }
}];
```

### Technique 2: Rate Limiting

**Use Case:** Prevent email spam, limit requests per user

```javascript
// Track requests in memory (or use Redis)
const requestCounts = {};
const email = $json.patientEmail;
const now = Date.now();
const windowMs = 60000; // 1 minute

if (!requestCounts[email]) {
  requestCounts[email] = { count: 0, resetAt: now + windowMs };
}

const record = requestCounts[email];

if (now > record.resetAt) {
  // Reset window
  record.count = 0;
  record.resetAt = now + windowMs;
}

if (record.count >= 5) {
  throw new Error('Rate limit exceeded. Try again later.');
}

record.count++;
return [{ json: $json }];
```

### Technique 3: Retry Logic

**Use Case:** Retry failed email sends with exponential backoff

```javascript
async function sendWithRetry(emailData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await sendEmail(emailData);
      return { success: true };
    } catch (error) {
      console.log(`Attempt ${i + 1} failed: ${error.message}`);

      if (i === maxRetries - 1) {
        throw error; // Final attempt failed
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Technique 4: Batch Processing

**Use Case:** Send multiple emails in one workflow execution

```javascript
// Input: Array of patients
const patients = $json.patients; // [{ name, email, date, time }, ...]

const results = [];

for (const patient of patients) {
  try {
    // Send email to each patient
    const result = await sendEmail({
      to: patient.email,
      subject: 'Appointment Reminder',
      body: generateEmailBody(patient)
    });

    results.push({ email: patient.email, success: true });
  } catch (error) {
    results.push({ email: patient.email, success: false, error: error.message });
  }
}

return [{ json: { results } }];
```

### Technique 5: Webhook Security

**Use Case:** Verify webhook requests are from authorized sources

```javascript
// Verify signature or API key
const signature = $node["Webhook Trigger"].json.headers['x-signature'];
const expectedSignature = process.env.WEBHOOK_SECRET;

if (signature !== expectedSignature) {
  throw new Error('Unauthorized webhook request');
}

// Or verify HMAC signature
const crypto = require('crypto');
const payload = JSON.stringify($json);
const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
hmac.update(payload);
const computedSignature = hmac.digest('hex');

if (signature !== computedSignature) {
  throw new Error('Invalid signature');
}
```

### Technique 6: Database Integration

**Use Case:** Store appointments in Supabase

```javascript
// Supabase HTTP Request node
const supabaseUrl = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_KEY';

const appointmentData = {
  patient_name: $json.patientName,
  patient_email: $json.patientEmail,
  patient_phone: $json.patientPhone,
  appointment_date: $json.appointmentDate,
  appointment_time: $json.appointmentTime,
  reason: $json.appointmentReason,
  status: 'confirmed',
  created_at: new Date().toISOString()
};

// Use HTTP Request node
{
  method: 'POST',
  url: `${supabaseUrl}/rest/v1/appointments`,
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: appointmentData
}
```

---

## 🎓 Mastery Checklist

### Level 1: Beginner
- [ ] Understand nodes and connections
- [ ] Create a basic webhook workflow
- [ ] Send an email using Gmail node
- [ ] Use IF node for conditional logic
- [ ] Test workflow with manual execution

### Level 2: Intermediate
- [ ] Parse complex JSON payloads
- [ ] Handle errors with try-catch
- [ ] Use Code nodes for custom logic
- [ ] Create responsive email templates
- [ ] Log workflow execution

### Level 3: Advanced
- [ ] Implement retry logic
- [ ] Add rate limiting
- [ ] Secure webhooks with signatures
- [ ] Integrate with databases
- [ ] Batch process multiple items

### Level 4: Expert
- [ ] Build reusable sub-workflows
- [ ] Implement complex routing logic
- [ ] Optimize for performance
- [ ] Create monitoring and alerts
- [ ] Document workflows thoroughly

---

## 📚 Resources

### Official Documentation
- n8n Docs: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- n8n Templates: https://n8n.io/workflows

### Healthcare-Specific
- HIPAA Compliance: https://www.hhs.gov/hipaa
- Email Best Practices: https://www.litmus.com
- Healthcare Automation: Research FHIR integration

### Learning Platforms
- n8n YouTube Channel
- Udemy n8n Courses
- FreeCodeCamp Automation Tutorials

---

## 🎯 Next Steps

1. **Import the Serenity Workflow**
   - Copy `SERENITY_COMPLETE_WORKFLOW.json`
   - Import into n8n
   - Configure Gmail credentials

2. **Test Each Path**
   - Test confirmation email
   - Test reschedule email
   - Test cancellation email
   - Test error handling

3. **Customize for Your Needs**
   - Add your hospital branding
   - Customize email templates
   - Add additional fields
   - Integrate with your database

4. **Monitor and Optimize**
   - Set up execution logging
   - Monitor error rates
   - Track email delivery
   - Optimize performance

---

## 💡 Pro Tips

1. **Version Control**: Export workflows regularly and commit to Git
2. **Environment Variables**: Use n8n credentials for sensitive data
3. **Testing**: Always test with real data before going live
4. **Documentation**: Comment your code nodes
5. **Monitoring**: Set up alerts for workflow failures
6. **Backup**: Export workflows before major changes
7. **Performance**: Use webhooks instead of polling when possible
8. **Security**: Validate and sanitize all input data

---

## 🏆 Conclusion

You now have a comprehensive understanding of n8n automation for healthcare workflows. The Serenity Royale Hospital workflow demonstrates best practices for:

- ✅ Webhook handling
- ✅ Data validation
- ✅ Conditional routing
- ✅ Professional email templates
- ✅ Error handling
- ✅ Logging and monitoring
- ✅ Security practices

Use this guide as a reference whenever building or debugging n8n workflows. Happy automating! 🚀

---

**Document Version:** 1.0
**Last Updated:** January 8, 2025
**Author:** Serenity Royale Hospital DevOps Team
**License:** Internal Use Only
