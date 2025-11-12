#!/bin/bash

# Test script for Enhanced n8n Workflow
# Sends various test requests to verify all workflow paths

echo "========================================"
echo "Enhanced n8n Workflow Test Suite"
echo "========================================"
echo ""

# Configuration
WEBHOOK_URL="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"
TEST_EMAIL="egualesamuel@gmail.com"
TEST_NAME="Samuel Eguale"
TEST_PHONE="+1234567890"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🎯 Target Webhook: $WEBHOOK_URL"
echo "📧 Test Email: $TEST_EMAIL"
echo ""

# Test 1: New Appointment
echo "========================================"
echo "Test 1: New Appointment"
echo "========================================"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"I want to book an appointment\",
    \"patientName\": \"$TEST_NAME\",
    \"patientEmail\": \"$TEST_EMAIL\",
    \"patientPhone\": \"$TEST_PHONE\",
    \"appointmentDate\": \"2025-11-15\",
    \"appointmentTime\": \"2:00 PM\",
    \"appointmentReason\": \"General checkup\",
    \"appointmentType\": \"consultation\",
    \"source\": \"test_script\",
    \"actionType\": \"create\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC} - HTTP $http_code"
  echo "Response: $body"
else
  echo -e "${RED}❌ FAIL${NC} - HTTP $http_code"
  echo "Response: $body"
fi
echo ""
echo "Expected: Calendar event created + Confirmation email sent"
echo ""

# Test 2: Reschedule Appointment
echo "========================================"
echo "Test 2: Reschedule Appointment"
echo "========================================"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"I need to reschedule my appointment\",
    \"patientName\": \"$TEST_NAME\",
    \"patientEmail\": \"$TEST_EMAIL\",
    \"patientPhone\": \"$TEST_PHONE\",
    \"appointmentDate\": \"2025-11-20\",
    \"appointmentTime\": \"3:00 PM\",
    \"appointmentReason\": \"General checkup - Rescheduled\",
    \"previousDate\": \"2025-11-15\",
    \"previousTime\": \"2:00 PM\",
    \"source\": \"test_script\",
    \"actionType\": \"reschedule\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC} - HTTP $http_code"
  echo "Response: $body"
else
  echo -e "${RED}❌ FAIL${NC} - HTTP $http_code"
  echo "Response: $body"
fi
echo ""
echo "Expected: Calendar event updated + Reschedule email sent"
echo ""

# Test 3: Cancel Appointment
echo "========================================"
echo "Test 3: Cancel Appointment"
echo "========================================"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"I need to cancel my appointment\",
    \"patientName\": \"$TEST_NAME\",
    \"patientEmail\": \"$TEST_EMAIL\",
    \"patientPhone\": \"$TEST_PHONE\",
    \"appointmentDate\": \"2025-11-20\",
    \"appointmentTime\": \"3:00 PM\",
    \"source\": \"test_script\",
    \"actionType\": \"cancel\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC} - HTTP $http_code"
  echo "Response: $body"
else
  echo -e "${RED}❌ FAIL${NC} - HTTP $http_code"
  echo "Response: $body"
fi
echo ""
echo "Expected: Calendar event deleted + Cancellation email sent"
echo ""

# Test 4: Follow-up Email
echo "========================================"
echo "Test 4: Follow-up Email"
echo "========================================"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Send follow-up to patient\",
    \"patientName\": \"$TEST_NAME\",
    \"patientEmail\": \"$TEST_EMAIL\",
    \"patientPhone\": \"$TEST_PHONE\",
    \"notes\": \"Checking in after last visit. Please confirm if you need any assistance.\",
    \"source\": \"test_script\",
    \"intentType\": \"followup\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC} - HTTP $http_code"
  echo "Response: $body"
else
  echo -e "${RED}❌ FAIL${NC} - HTTP $http_code"
  echo "Response: $body"
fi
echo ""
echo "Expected: Follow-up email sent"
echo ""

# Test 5: Emergency Alert
echo "========================================"
echo "Test 5: Emergency Alert"
echo "========================================"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"URGENT: Patient needs immediate assistance\",
    \"patientName\": \"$TEST_NAME\",
    \"patientEmail\": \"$TEST_EMAIL\",
    \"patientPhone\": \"$TEST_PHONE\",
    \"urgency\": \"HIGH\",
    \"notes\": \"Patient reporting severe symptoms - TEST ONLY\",
    \"source\": \"test_script\",
    \"intentType\": \"escalation\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC} - HTTP $http_code"
  echo "Response: $body"
else
  echo -e "${RED}❌ FAIL${NC} - HTTP $http_code"
  echo "Response: $body"
fi
echo ""
echo "Expected: Emergency alert sent to Dr. K"
echo ""

# Test 6: Lead Capture
echo "========================================"
echo "Test 6: Lead Capture"
echo "========================================"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"I'm interested in learning more about your services\",
    \"patientName\": \"$TEST_NAME\",
    \"patientEmail\": \"$TEST_EMAIL\",
    \"patientPhone\": \"$TEST_PHONE\",
    \"source\": \"test_script\",
    \"intentType\": \"lead\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC} - HTTP $http_code"
  echo "Response: $body"
else
  echo -e "${RED}❌ FAIL${NC} - HTTP $http_code"
  echo "Response: $body"
fi
echo ""
echo "Expected: Lead captured in database"
echo ""

# Summary
echo "========================================"
echo "Test Suite Complete"
echo "========================================"
echo ""
echo "📬 Check your email: $TEST_EMAIL"
echo "📅 Check Google Calendar: info.serenityroyalehospital@gmail.com"
echo "📊 Check n8n Executions: https://cwai97.app.n8n.cloud"
echo ""
echo "If tests failed with 'Unused Respond to Webhook node' error:"
echo "1. Open n8n workflow editor"
echo "2. Ensure 'Send Success Response' node is connected to ALL action paths"
echo "3. Save and re-activate the workflow"
echo ""
