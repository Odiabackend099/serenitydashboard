#!/bin/bash

# Comprehensive Webhook Diagnostic Test
# Tests all three intent paths with detailed output

WEBHOOK_URL="https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook"
OUTPUT_DIR="/tmp/webhook-diagnostics"
mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "Comprehensive N8N Webhook Diagnostics"
echo "=========================================="
echo ""
echo "📍 URL: $WEBHOOK_URL"
echo "📁 Output directory: $OUTPUT_DIR"
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
    "message": "Hello, what are your hours?",
    "intent": "general"
  }')

http_code1=$(echo "$response1" | tail -n1)
body1=$(echo "$response1" | sed '$d')

echo "$body1" > "$OUTPUT_DIR/test1-general.json"
echo "HTTP Status: $http_code1"
echo "Response: $body1" | jq . 2>/dev/null || echo "$body1"
echo ""

# Test 2: Appointment
echo "Test 2: APPOINTMENT BOOKING"
echo "----------------------------------------"
response2=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-appointment-'$(date +%s)'",
    "patientRef": "patient-002",
    "channel": "web",
    "message": "I need to book an appointment",
    "intent": "appointment",
    "patientEmail": "test@example.com",
    "patientName": "Test Patient",
    "appointmentDate": "2025-11-20",
    "appointmentTime": "14:00"
  }')

http_code2=$(echo "$response2" | tail -n1)
body2=$(echo "$response2" | sed '$d')

echo "$body2" > "$OUTPUT_DIR/test2-appointment.json"
echo "HTTP Status: $http_code2"
echo "Response: $body2" | jq . 2>/dev/null || echo "$body2"
echo ""

# Test 3: Emergency
echo "Test 3: EMERGENCY ALERT"
echo "----------------------------------------"
response3=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-emergency-'$(date +%s)'",
    "patientRef": "patient-003",
    "channel": "voice",
    "message": "Emergency! Severe pain",
    "intent": "emergency"
  }')

http_code3=$(echo "$response3" | tail -n1)
body3=$(echo "$response3" | sed '$d')

echo "$body3" > "$OUTPUT_DIR/test3-emergency.json"
echo "HTTP Status: $http_code3"
echo "Response: $body3" | jq . 2>/dev/null || echo "$body3"
echo ""

# Summary
echo "=========================================="
echo "DIAGNOSTIC SUMMARY"
echo "=========================================="
echo "General Inquiry:      HTTP $http_code1"
echo "Appointment Booking:   HTTP $http_code2"
echo "Emergency Alert:      HTTP $http_code3"
echo ""

# Check for common error patterns
echo "Error Analysis:"
echo "----------------------------------------"

if echo "$body1" | grep -q "Error in workflow"; then
  echo "❌ Generic workflow error detected"
  echo "   → Check N8N execution logs for specific node failure"
fi

if echo "$body1" | grep -q "credential"; then
  echo "❌ Credential error detected"
  echo "   → Verify Supabase and Gmail credentials in N8N"
fi

if echo "$body1" | grep -q "table\|column"; then
  echo "❌ Database schema error detected"
  echo "   → Check if tables exist: appointments, leads, conversations"
fi

if echo "$body1" | grep -q "No item to return"; then
  echo "❌ Response node error"
  echo "   → Check 'Workflow Completion' node returns data"
fi

echo ""
echo "📁 Full responses saved to:"
echo "   - $OUTPUT_DIR/test1-general.json"
echo "   - $OUTPUT_DIR/test2-appointment.json"
echo "   - $OUTPUT_DIR/test3-emergency.json"
echo ""
echo "🔍 Next Steps:"
echo "1. Check N8N executions: https://cwai97.app.n8n.cloud/workflow/executions"
echo "2. Review saved JSON files for detailed error messages"
echo "3. Verify credentials and database schema"
echo ""

