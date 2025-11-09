#!/bin/bash

# Test Appointment Booking Webhook

echo "🧪 Testing Appointment Booking Webhook"
echo "======================================"
echo ""

# Test webhook-test endpoint
echo "📍 Testing: webhook-test endpoint"
echo "----------------------------------------"
response1=$(curl -s -w "\n%{http_code}" -X POST https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-appointment-123",
    "userId": "patient-001",
    "patientRef": "patient-001",
    "channel": "web",
    "message": "I want to book an appointment for a general checkup",
    "intent": "appointment",
    "patientName": "John Doe",
    "patientEmail": "john.doe@example.com",
    "patientPhone": "+2348012345678",
    "appointmentDate": "2025-11-15",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "General checkup",
    "appointmentType": "consultation"
  }')

http_code1=$(echo "$response1" | tail -n1)
body1=$(echo "$response1" | sed '$d')

echo "HTTP Status: $http_code1"
echo "Response:"
echo "$body1" | jq . 2>/dev/null || echo "$body1"
echo ""

# Test production endpoint
echo "📍 Testing: Production webhook endpoint"
echo "----------------------------------------"
response2=$(curl -s -w "\n%{http_code}" -X POST https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-appointment-'$(date +%s)'",
    "userId": "patient-001",
    "patientRef": "patient-001",
    "channel": "web",
    "message": "I want to book an appointment for a general checkup",
    "intent": "appointment",
    "patientName": "John Doe",
    "patientEmail": "john.doe@example.com",
    "patientPhone": "+2348012345678",
    "appointmentDate": "2025-11-15",
    "appointmentTime": "10:00",
    "appointmentReason": "General checkup",
    "appointmentType": "consultation"
  }')

http_code2=$(echo "$response2" | tail -n1)
body2=$(echo "$response2" | sed '$d')

echo "HTTP Status: $http_code2"
echo "Response:"
echo "$body2" | jq . 2>/dev/null || echo "$body2"
echo ""

# Summary
echo "======================================"
echo "SUMMARY"
echo "======================================"
echo "Test Endpoint:    HTTP $http_code1"
echo "Production:       HTTP $http_code2"
echo ""

if [ "$http_code1" = "200" ] || [ "$http_code2" = "200" ]; then
  echo "✅ SUCCESS: At least one endpoint returned 200"
else
  echo "❌ FAILED: Both endpoints returned errors"
  echo ""
  echo "💡 Next Steps:"
  echo "   1. For test endpoint: Click 'Execute Workflow' in n8n"
  echo "   2. For production: Check N8N execution logs"
  echo "   3. Verify Supabase credentials and tables"
fi

