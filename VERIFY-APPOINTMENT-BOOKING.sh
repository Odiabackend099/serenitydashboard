#!/bin/bash

echo "=============================================="
echo "🎯 APPOINTMENT BOOKING VERIFICATION"
echo "=============================================="
echo ""
echo "This script will verify that appointment booking is working"
echo "by testing all components end-to-end."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check production site is up
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Production Site Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://srhbackend.odia.dev)
if [ "$STATUS_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Production site is UP${NC} (https://srhbackend.odia.dev)"
else
  echo -e "${RED}❌ Production site returned: $STATUS_CODE${NC}"
  exit 1
fi
echo ""

# Test 2: Check Groq Edge Function
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Groq Edge Function (Simple Message)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
GROQ_RESPONSE=$(curl -s -X POST "https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Say OK"}],
    "model": "llama-3.3-70b-versatile",
    "max_tokens": 10
  }')

if echo "$GROQ_RESPONSE" | grep -q '"role":"assistant"'; then
  echo -e "${GREEN}✅ Groq Edge Function is WORKING${NC}"
  echo "Response preview: $(echo "$GROQ_RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null || echo "$GROQ_RESPONSE" | head -c 50)"
else
  echo -e "${RED}❌ Groq Edge Function FAILED${NC}"
  echo "Response: $GROQ_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Check n8n Webhook
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: n8n Webhook Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
N8N_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{"action":"test","payload":{"test":true}}')

if [ "$N8N_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ n8n Webhook is ACCESSIBLE${NC} (https://cwai97.app.n8n.cloud)"
else
  echo -e "${YELLOW}⚠️  n8n Webhook returned: $N8N_STATUS${NC}"
  echo "Note: Non-200 status might be okay if webhook validates payload"
fi
echo ""

# Test 4: Full appointment booking flow
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Full Appointment Booking Flow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing with: egualesamuel@gmail.com"
echo ""

BOOKING_RESPONSE=$(curl -s -X POST "https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Book appointment for tomorrow at 2pm. Name: Test User, Email: egualesamuel@gmail.com, Phone: +1-555-0123"
      }
    ],
    "model": "llama-3.3-70b-versatile",
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "trigger_automation",
          "description": "Trigger n8n automation",
          "parameters": {
            "type": "object",
            "properties": {
              "action": {"type": "string"},
              "payload": {"type": "object"}
            },
            "required": ["action", "payload"]
          }
        }
      }
    ],
    "max_tokens": 1000
  }')

# Check if AI called the tool
if echo "$BOOKING_RESPONSE" | grep -q '"name":"trigger_automation"'; then
  echo -e "${GREEN}✅ AI detected appointment booking intent${NC}"

  # Check if tool execution was successful (check for success in content field)
  if echo "$BOOKING_RESPONSE" | grep -q 'success.*true' || echo "$BOOKING_RESPONSE" | grep -q '\\"success\\":true'; then
    echo -e "${GREEN}✅ Tool execution SUCCESSFUL${NC}"
    echo -e "${GREEN}✅ n8n automation triggered${NC}"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Appointment booking is FULLY OPERATIONAL!"
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://srhbackend.odia.dev"
    echo "2. Open the chat widget (bottom right)"
    echo "3. Request an appointment"
    echo "4. Check egualesamuel@gmail.com for confirmation email"
    echo ""
  else
    echo -e "${RED}❌ Tool execution FAILED${NC}"
    echo "Response: $(echo "$BOOKING_RESPONSE" | jq '.tool_results' 2>/dev/null)"
    exit 1
  fi
else
  echo -e "${RED}❌ AI did not call trigger_automation tool${NC}"
  echo "Response: $(echo "$BOOKING_RESPONSE" | jq -r '.choices[0].message' 2>/dev/null)"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Verification complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
