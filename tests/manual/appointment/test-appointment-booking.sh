#!/bin/bash

# Test Appointment Booking - Direct n8n Webhook Call
# This bypasses the AI and tests the n8n workflow directly

echo "🧪 Testing Appointment Booking Email Confirmation"
echo "================================================"
echo ""
echo "Sending test appointment booking to n8n webhook..."
echo ""

# Get n8n webhook URL from environment or use default
N8N_WEBHOOK_URL="${N8N_WEBHOOK_BASE:-https://cwai97.app.n8n.cloud/webhook}/serenity-webhook-v2"

echo "Webhook URL: $N8N_WEBHOOK_URL"
echo ""

# Send test request
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+1234567890",
    "appointmentDate": "January 15th, 2025",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "Annual checkup",
    "actionType": "create",
    "source": "test_script",
    "message": "Test appointment booking from script"
  }')

# Extract HTTP status
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "Response Status: $http_status"
echo ""

if [ "$http_status" = "200" ] || [ "$http_status" = "201" ]; then
    echo "✅ SUCCESS! Webhook accepted the request"
    echo ""
    echo "📧 Check your email at: egualesamuel@gmail.com"
    echo ""
    echo "Expected:"
    echo "- Subject: Appointment Confirmed - Serenity Royale Hospital"
    echo "- Date: January 15th, 2025"
    echo "- Time: 10:00 AM"
    echo "- Reason: Annual checkup"
    echo ""
    echo "If email doesn't arrive within 2 minutes:"
    echo "1. Check spam/junk folder"
    echo "2. Go to n8n dashboard: https://cwai97.app.n8n.cloud"
    echo "3. Click 'Executions' to see if workflow ran"
    echo "4. Check Gmail node authentication in workflow"
else
    echo "❌ ERROR! Webhook returned status: $http_status"
    echo ""
    echo "Response body:"
    echo "$response_body"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if n8n workflow is active"
    echo "2. Verify webhook path is: serenity-webhook-v2"
    echo "3. Check n8n dashboard: https://cwai97.app.n8n.cloud"
fi

echo ""
echo "================================================"
