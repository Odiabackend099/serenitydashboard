#!/bin/bash

# Direct N8N Webhook Test - Verify patient_ref is passed correctly

echo "=========================================="
echo "🧪 N8N Direct Webhook Test"
echo "=========================================="
echo ""
echo "Testing appointment booking via N8N webhook"
echo "Email: egualesamuel@gmail.com"
echo ""

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"

echo "Sending request to N8N..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "body": {
      "action": "book_appointment",
      "channel": "webchat",
      "patient_ref": "egualesamuel@gmail.com",
      "patient_name": "Samuel Eguale",
      "patient_email": "egualesamuel@gmail.com",
      "patient_phone": "+234-801-234-5678",
      "appointment_date": "2025-11-13",
      "appointment_time": "10:00",
      "reason": "General consultation - Direct N8N test",
      "appointment_type": "consultation",
      "toList": "egualesamuel@gmail.com",
      "subject": "Appointment Confirmation - Test",
      "message": "Your appointment has been booked successfully!"
    }
  }')

# Extract HTTP code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo "✅ SUCCESS!"
  echo ""
  echo "Response:"
  echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
  echo ""
  echo "=========================================="
  echo "Next Steps:"
  echo "=========================================="
  echo "1. Check your email: egualesamuel@gmail.com"
  echo "2. Check N8N executions: https://cwai97.app.n8n.cloud/executions"
  echo "3. Verify in Supabase appointments table"
  echo ""
else
  echo "❌ FAILED!"
  echo ""
  echo "Response:"
  echo "$RESPONSE_BODY"
  echo ""
  echo "=========================================="
  echo "Troubleshooting:"
  echo "=========================================="
  echo "1. Check N8N workflow: https://cwai97.app.n8n.cloud/workflows"
  echo "2. Verify 'Create Appointment' node has correct field mappings:"
  echo "   patient_ref: \$json.body.patient_ref"
  echo "   patient_name: \$json.body.patient_name"
  echo "   patient_email: \$json.body.patient_email"
  echo "   etc."
  echo ""
  echo "3. See N8N_WORKFLOW_FIX.md for detailed instructions"
  echo ""
fi

echo "=========================================="
