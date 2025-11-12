#!/bin/bash

# Test Appointment Booking Flow
# Tests the enhanced N8N workflow with email notifications

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook"

echo "=========================================="
echo "Testing Appointment Booking with Email"
echo "=========================================="
echo ""

# Prompt for email
read -p "Enter your email address for testing: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
  echo "❌ Email required for testing"
  exit 1
fi

# Validate email format
if ! [[ "$TEST_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  echo "❌ Invalid email format"
  exit 1
fi

echo ""
echo "✅ Email validated: $TEST_EMAIL"
echo ""

# Calculate appointment date (7 days from now)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  APPT_DATE=$(date -v+7d '+%Y-%m-%d')
else
  # Linux
  APPT_DATE=$(date -d '+7 days' '+%Y-%m-%d')
fi

echo "-------------------------------------------"
echo "Test Details:"
echo "-------------------------------------------"
echo "Patient Email: $TEST_EMAIL"
echo "Appointment Date: $APPT_DATE"
echo "Appointment Time: 14:00"
echo "Reason: General checkup (automated test)"
echo "-------------------------------------------"
echo ""

read -p "Proceed with test? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Test cancelled"
  exit 0
fi

echo ""
echo "Sending request to N8N..."
echo ""

# Send request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-appt-'$(date +%s)'",
    "patientRef": "patient-test-001",
    "channel": "web",
    "message": "I need to book an appointment for a general checkup",
    "intent": "appointment",
    "sentiment": "neutral",
    "patientEmail": "'"$TEST_EMAIL"'",
    "patientName": "Test Patient",
    "patientPhone": "+2348012345678",
    "appointmentDate": "'"$APPT_DATE"'",
    "appointmentTime": "14:00",
    "appointmentReason": "General checkup (automated test)",
    "appointmentType": "consultation"
  }')

# Extract HTTP code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ SUCCESS"
  echo ""
  echo "Response:"
  echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
  echo ""
  echo "-------------------------------------------"
  echo "Next Steps:"
  echo "-------------------------------------------"
  echo "1. ✉️  Check your inbox: $TEST_EMAIL"
  echo "2. 📧 You should receive:"
  echo "    • Appointment confirmation email"
  echo "    • Branded HTML template"
  echo "    • Appointment details"
  echo ""
  echo "3. 🗄️  Verify in Supabase:"
  echo "    • appointments table"
  echo "    • conversations table"
  echo "    • leads table"
  echo ""
  echo "4. 📅 Check Google Calendar (if configured)"
  echo ""
  echo "5. 📱 Check SMS (if Twilio configured)"
  echo ""
  echo "-------------------------------------------"
  echo "SQL Verification Query:"
  echo "-------------------------------------------"
  echo "SELECT * FROM appointments"
  echo "WHERE patient_email = '$TEST_EMAIL'"
  echo "ORDER BY created_at DESC LIMIT 1;"
  echo "-------------------------------------------"
else
  echo "❌ FAILED"
  echo ""
  echo "HTTP Code: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
  echo ""
  echo "-------------------------------------------"
  echo "Troubleshooting:"
  echo "-------------------------------------------"
  echo "1. Check N8N workflow is activated"
  echo "2. Verify Gmail credentials configured"
  echo "3. Check N8N execution log:"
  echo "   https://cwai97.app.n8n.cloud/executions"
  echo "4. Verify Supabase connection"
  echo "5. Check appointments table exists"
  echo ""
fi

echo ""
echo "=========================================="
echo "Test Completed"
echo "=========================================="
