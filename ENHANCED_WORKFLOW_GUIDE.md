# 🎯 Import the FIXED Workflow - Different Name!

## ✅ New Workflow File Created!

**File**: `ENHANCED_N8N_WORKFLOW.json`

**Workflow Name**: "Serenity AI - FIXED Email Routing (Import This One)"

This is a **new file** with a different name so you can import it alongside your current workflow and compare!

---

## 📥 Import Instructions (5 Minutes)

### Step 1: Import
1. Go to: https://cwai97.app.n8n.cloud
2. Click **"+ Add workflow"**
3. Click **3-dot menu** (⋮) → **"Import from File"**
4. Select: `ENHANCED_N8N_WORKFLOW.json`
5. Click **"Import"**

### Step 2: Configure Gmail
For each of the 4 Gmail nodes:
- Click node → Credentials → "Create New"
- Select "Gmail OAuth2"
- Connect your Gmail account
- **Reuse** credential for all nodes

### Step 3: Change Webhook Path
1. Click **"Webhook Trigger"** node
2. Change path from `serenity-webhook-v2` to `serenity-webhook-v3`
3. This creates a NEW webhook URL

### Step 4: Activate
Toggle **ON** (top right)

### Step 5: Test
```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v3 \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+1234567890",
    "appointmentDate": "2025-02-20",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "Testing FIXED workflow",
    "actionType": "create"
  }'
```

**Expected**: Email arrives at egualesamuel@gmail.com!

---

## 🔍 Verify Success

Check the execution INPUT:

**✅ CORRECT**:
```
patientEmail: egualesamuel@gmail.com
patientName: Samuel Eguale
```

**❌ WRONG**:
```
patientEmail: noreply@serenityroyalehospital.com
patientName: Unknown
```

---

## 📊 After Import

**You'll have TWO workflows**:
1. Old: "Serenity AI - Simplified Working Workflow" (broken)
2. New: "Serenity AI - FIXED Email Routing" (works!)

**You'll have TWO webhooks**:
1. Old: `/serenity-webhook-v2` (wrong data)
2. New: `/serenity-webhook-v3` (correct data)

---

**File**: [ENHANCED_N8N_WORKFLOW.json](ENHANCED_N8N_WORKFLOW.json)

**Import this and emails will finally work!** 🚀
