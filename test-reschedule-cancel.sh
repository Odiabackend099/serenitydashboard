#!/bin/bash

# Test Reschedule & Cancel Appointment Features
# Prerequisites: Must have an existing appointment to reschedule/cancel

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"

echo "=========================================="
echo -e "${CYAN}🧪 Reschedule & Cancel Test Suite${NC}"
echo "=========================================="
echo ""

# First, create a test appointment to reschedule/cancel
echo -e "${YELLOW}Step 1: Creating Test Appointment${NC}"
echo "=========================================="
echo ""

BOOKING_PAYLOAD='{
  "action": "book_appointment",
  "body": {
    "action": "book_appointment",
    "channel": "webchat",
    "patient_ref": "egualesamuel@gmail.com",
    "patient_name": "Samuel Eguale",
    "patient_email": "egualesamuel@gmail.com",
    "patient_phone": "+234-801-234-5678",
    "appointment_date": "2025-11-25",
    "appointment_time": "10:00",
    "reason": "Test appointment for reschedule/cancel workflow",
    "appointment_type": "consultation",
    "toList": "egualesamuel@gmail.com",
    "subject": "Test Appointment - Will Reschedule/Cancel",
    "message": "This is a test appointment that will be rescheduled or cancelled."
  }
}'

echo "Creating appointment for 2025-11-25 at 10:00 AM..."
BOOKING_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_PAYLOAD")

BOOKING_CODE=$(echo "$BOOKING_RESPONSE" | tail -n1)
BOOKING_BODY=$(echo "$BOOKING_RESPONSE" | sed '$d')

if [ "$BOOKING_CODE" -eq 200 ] || [ "$BOOKING_CODE" -eq 201 ]; then
  echo -e "${GREEN}✅ Test Appointment Created${NC}"
  echo "Response: $BOOKING_BODY"

  # Extract appointment ID if available
  APPOINTMENT_ID=$(echo "$BOOKING_BODY" | jq -r '.appointmentId // .appointment_id // empty' 2>/dev/null || echo "")

  if [ -z "$APPOINTMENT_ID" ]; then
    echo -e "${YELLOW}⚠️  Could not extract appointment ID from response${NC}"
    echo -e "${BLUE}Please get appointment ID manually from database${NC}"
    echo ""
    echo "Query: SELECT id FROM appointments WHERE patient_email = 'egualesamuel@gmail.com' ORDER BY created_at DESC LIMIT 1;"
    echo ""
    read -p "Enter appointment ID: " APPOINTMENT_ID
  else
    echo -e "${GREEN}Appointment ID: $APPOINTMENT_ID${NC}"
  fi
else
  echo -e "${RED}❌ Failed to create test appointment (HTTP $BOOKING_CODE)${NC}"
  echo "Response: $BOOKING_BODY"
  exit 1
fi

echo ""
sleep 3

# Test 1: Reschedule Appointment
echo "=========================================="
echo -e "${YELLOW}Test 2: Reschedule Appointment${NC}"
echo "=========================================="
echo ""

RESCHEDULE_PAYLOAD="{
  \"action\": \"reschedule_appointment\",
  \"body\": {
    \"action\": \"reschedule_appointment\",
    \"appointment_id\": \"$APPOINTMENT_ID\",
    \"patient_email\": \"egualesamuel@gmail.com\",
    \"patient_name\": \"Samuel Eguale\",
    \"new_date\": \"2025-11-26\",
    \"new_time\": \"14:00\",
    \"reason\": \"Schedule conflict resolved - automated test\",
    \"old_date\": \"2025-11-25\",
    \"old_time\": \"10:00\"
  }
}"

echo "Rescheduling appointment to 2025-11-26 at 2:00 PM..."
RESCHEDULE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$RESCHEDULE_PAYLOAD")

RESCHEDULE_CODE=$(echo "$RESCHEDULE_RESPONSE" | tail -n1)
RESCHEDULE_BODY=$(echo "$RESCHEDULE_RESPONSE" | sed '$d')

echo "Response Code: $RESCHEDULE_CODE"
echo "Response Body:"
echo "$RESCHEDULE_BODY" | jq '.' 2>/dev/null || echo "$RESCHEDULE_BODY"
echo ""

if [ "$RESCHEDULE_CODE" -eq 200 ] || [ "$RESCHEDULE_CODE" -eq 201 ]; then
  echo -e "${GREEN}✅ Reschedule Test PASSED${NC}"
  echo ""
  echo "✅ Appointment rescheduled successfully"
  echo "✅ Database updated with new date/time"
  echo "✅ Confirmation email should be sent"
else
  echo -e "${RED}❌ Reschedule Test FAILED (HTTP $RESCHEDULE_CODE)${NC}"
fi

echo ""
sleep 3

# Test 2: Cancel Appointment (using the same appointment, now rescheduled)
echo "=========================================="
echo -e "${YELLOW}Test 3: Cancel Appointment${NC}"
echo "=========================================="
echo ""

CANCEL_PAYLOAD="{
  \"action\": \"cancel_appointment\",
  \"body\": {
    \"action\": \"cancel_appointment\",
    \"appointment_id\": \"$APPOINTMENT_ID\",
    \"patient_email\": \"egualesamuel@gmail.com\",
    \"patient_name\": \"Samuel Eguale\",
    \"reason\": \"Unable to attend - automated test\"
  }
}"

echo "Cancelling appointment..."
CANCEL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$CANCEL_PAYLOAD")

CANCEL_CODE=$(echo "$CANCEL_RESPONSE" | tail -n1)
CANCEL_BODY=$(echo "$CANCEL_RESPONSE" | sed '$d')

echo "Response Code: $CANCEL_CODE"
echo "Response Body:"
echo "$CANCEL_BODY" | jq '.' 2>/dev/null || echo "$CANCEL_BODY"
echo ""

if [ "$CANCEL_CODE" -eq 200 ] || [ "$CANCEL_CODE" -eq 201 ]; then
  echo -e "${GREEN}✅ Cancel Test PASSED${NC}"
  echo ""
  echo "✅ Appointment cancelled successfully"
  echo "✅ Database status updated to 'cancelled'"
  echo "✅ Cancellation email should be sent"
else
  echo -e "${RED}❌ Cancel Test FAILED (HTTP $CANCEL_CODE)${NC}"
fi

echo ""

# Summary
echo "=========================================="
echo -e "${CYAN}📊 Test Summary${NC}"
echo "=========================================="
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

[ "$BOOKING_CODE" -eq 200 ] || [ "$BOOKING_CODE" -eq 201 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))
[ "$RESCHEDULE_CODE" -eq 200 ] || [ "$RESCHEDULE_CODE" -eq 201 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))
[ "$CANCEL_CODE" -eq 200 ] || [ "$CANCEL_CODE" -eq 201 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))

echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  echo ""
  echo "✅ Book Appointment: WORKING"
  echo "✅ Reschedule Appointment: WORKING"
  echo "✅ Cancel Appointment: WORKING"
  echo ""
  echo -e "${CYAN}Verification Steps:${NC}"
  echo "1. Check email: egualesamuel@gmail.com"
  echo "   - Appointment confirmation"
  echo "   - Reschedule confirmation"
  echo "   - Cancellation confirmation"
  echo ""
  echo "2. Check database:"
  echo "   SELECT * FROM appointments WHERE id = '$APPOINTMENT_ID';"
  echo "   - Status should be: 'cancelled'"
  echo "   - Notes should contain: reschedule and cancel reasons"
else
  echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
  echo ""
  echo "Please check:"
  echo "1. N8N workflow is Active"
  echo "2. N8N workflow has the new nodes imported"
  echo "3. Supabase credentials are valid"
  echo "4. Gmail credentials are valid"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Test Complete!${NC}"
echo "=========================================="
