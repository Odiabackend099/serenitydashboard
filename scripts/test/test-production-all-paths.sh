#!/bin/bash

# Test Production Webhook - All Intent Paths
# Tests: General, Appointment, Emergency

WEBHOOK_URL="https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook"
TEST_EMAIL="test@example.com"

echo "=========================================="
echo "Testing SRHCareAI Production Webhook"
echo "=========================================="
echo ""

# Test 1: General Inquiry
echo "Test 1: GENERAL INQUIRY"
echo "----------------------------------------"
response1=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-general-'$(date +%s)'",
    "patientRef": "patient-001",
    "channel": "web",
    "message": "Hello, I would like to know your operating hours",
    "intent": "general"
  }')

http_code1=$(echo "$response1" | tail -n1)
body1=$(echo "$response1" | head -n-1)

echo "HTTP Status: $http_code1"
echo "Response: $body1"
echo ""
sleep 2

# Test 2: Appointment Booking
echo "Test 2: APPOINTMENT BOOKING"
echo "----------------------------------------"
response2=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-appointment-'$(date +%s)'",
    "patientRef": "patient-002",
    "channel": "web",
    "message": "I need to book an appointment with a doctor",
    "intent": "appointment",
    "patientEmail": "'"$TEST_EMAIL"'",
    "patientName": "Test Patient",
    "patientPhone": "+234800000000",
    "appointmentDate": "2025-11-20",
    "appointmentTime": "14:00",
    "appointmentReason": "General checkup"
  }')

http_code2=$(echo "$response2" | tail -n1)
body2=$(echo "$response2" | head -n-1)

echo "HTTP Status: $http_code2"
echo "Response: $body2"
echo ""
sleep 2

# Test 3: Emergency Alert
echo "Test 3: EMERGENCY ALERT"
echo "----------------------------------------"
response3=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-emergency-'$(date +%s)'",
    "patientRef": "patient-003",
    "channel": "voice",
    "message": "Emergency! Patient has severe chest pain and difficulty breathing",
    "intent": "emergency",
    "patientName": "Emergency Test Patient"
  }')

http_code3=$(echo "$response3" | tail -n1)
body3=$(echo "$response3" | head -n-1)

echo "HTTP Status: $http_code3"
echo "Response: $body3"
echo ""

# Summary
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo "General Inquiry:      HTTP $http_code1"
echo "Appointment Booking:  HTTP $http_code2"
echo "Emergency Alert:      HTTP $http_code3"
echo ""

# Check if all tests passed
if [ "$http_code1" = "200" ] && [ "$http_code2" = "200" ] && [ "$http_code3" = "200" ]; then
    echo "✅ All tests PASSED"
else
    echo "❌ Some tests FAILED"
fi

echo ""
echo "Next steps:"
echo "1. Check N8N execution logs for details"
echo "2. Verify database entries in Supabase"
echo "3. Check email inbox for confirmations"

