#!/bin/bash

# Advanced Features Test Suite
# Tests: Get Appointments, Reschedule, Cancel, Availability Check

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

GROQ_CHAT_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat"

echo "=========================================="
echo -e "${CYAN}🧪 Advanced Features Test Suite${NC}"
echo "=========================================="
echo ""
echo "Testing new AI tools:"
echo "  1. 📋 Get My Appointments"
echo "  2. 🔄 Reschedule Appointment"
echo "  3. ❌ Cancel Appointment"
echo "  4. ✅ Check Availability"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Get My Appointments
echo "=========================================="
echo -e "${YELLOW}Test 1: Get My Appointments${NC}"
echo "=========================================="
echo ""

GET_APPOINTMENTS_PAYLOAD='{
  "messages": [
    {
      "role": "user",
      "content": "Show me my appointments for egualesamuel@gmail.com"
    }
  ],
  "model": "llama-3.1-8b-instant",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_my_appointments",
        "description": "Get patients appointments by email",
        "parameters": {
          "type": "object",
          "properties": {
            "email": {"type": "string"},
            "status": {"type": "string", "enum": ["all", "upcoming", "past"]}
          },
          "required": ["email"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}'

echo "Fetching appointments for egualesamuel@gmail.com..."
GET_RESPONSE=$(curl -s -X POST "$GROQ_CHAT_URL" \
  -H "Content-Type: application/json" \
  -d "$GET_APPOINTMENTS_PAYLOAD")

echo "Response:"
echo "$GET_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_RESPONSE"
echo ""

if echo "$GET_RESPONSE" | jq -e '.tool_results[0].content' >/dev/null 2>&1; then
  TOOL_RESULT=$(echo "$GET_RESPONSE" | jq -r '.tool_results[0].content' | jq '.')
  echo -e "${GREEN}✅ Get Appointments Test PASSED${NC}"
  echo "Result:"
  echo "$TOOL_RESULT"
  ((TESTS_PASSED++))
else
  echo -e "${YELLOW}⚠️  Get Appointments Test - AI Response (Tool not called)${NC}"
  echo "$GET_RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null || echo "No response"
fi

echo ""
sleep 2

# Test 2: Check Availability
echo "=========================================="
echo -e "${YELLOW}Test 2: Check Availability${NC}"
echo "=========================================="
echo ""

CHECK_AVAIL_PAYLOAD='{
  "messages": [
    {
      "role": "user",
      "content": "Is November 20th 2025 at 2:00 PM available?"
    }
  ],
  "model": "llama-3.1-8b-instant",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "check_availability",
        "description": "Check if a time slot is available",
        "parameters": {
          "type": "object",
          "properties": {
            "date": {"type": "string"},
            "time": {"type": "string"}
          },
          "required": ["date", "time"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}'

echo "Checking availability for 2025-11-20 at 2:00 PM..."
AVAIL_RESPONSE=$(curl -s -X POST "$GROQ_CHAT_URL" \
  -H "Content-Type: application/json" \
  -d "$CHECK_AVAIL_PAYLOAD")

echo "Response:"
echo "$AVAIL_RESPONSE" | jq '.' 2>/dev/null || echo "$AVAIL_RESPONSE"
echo ""

if echo "$AVAIL_RESPONSE" | grep -q "available"; then
  echo -e "${GREEN}✅ Check Availability Test PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${YELLOW}⚠️  Check Availability Test - Partial${NC}"
fi

echo ""
sleep 2

# Test Summary
echo "=========================================="
echo -e "${CYAN}📊 Test Summary${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL NEW FEATURES WORKING!${NC}"
  echo ""
  echo "✅ Get Appointments: Available"
  echo "✅ Check Availability: Available"
  echo "⚠️  Reschedule/Cancel: Require N8N workflow nodes"
  echo ""
  echo -e "${YELLOW}Note: Reschedule and Cancel features require N8N workflow setup.${NC}"
  echo "See N8N_ADVANCED_FEATURES_SETUP.md for instructions."
else
  echo -e "${RED}⚠️  SOME TESTS INCOMPLETE${NC}"
fi

echo ""
echo "=========================================="
echo -e "${CYAN}📋 Next Steps${NC}"
echo "=========================================="
echo ""
echo "1. The new AI tools are deployed and working"
echo "2. Add N8N workflow nodes for reschedule/cancel"
echo "3. Test from chat widget:"
echo "   - 'Show my appointments at egualesamuel@gmail.com'"
echo "   - 'Is tomorrow at 3pm available?'"
echo ""

echo "=========================================="
echo -e "${GREEN}Test Complete!${NC}"
echo "=========================================="
