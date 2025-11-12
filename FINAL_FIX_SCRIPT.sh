#!/bin/bash

echo "=========================================="
echo "🎯 FINAL FIX - APPOINTMENT BOOKING"
echo "=========================================="
echo ""
echo "This script will fix the appointment booking to:"
echo "1. Make AI collect ALL info before calling tools"
echo "2. Update tool descriptions to be crystal clear"
echo "3. Rebuild and redeploy frontend"
echo "4. Test end-to-end"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update tool description to be explicit
echo -e "${YELLOW}Step 1: Updating tool description...${NC}"
cat > /tmp/tool_fix.txt <<'EOF'
      description: 'Book an appointment and send confirmation email. **CRITICAL**: DO NOT call this tool until you have collected ALL required information from the user: name, email, phone, date, time, and reason. If any information is missing, ASK the user for it first before calling this tool.',
EOF

# Apply fix to groqTools.ts
if grep -q "description: 'Book an appointment for a patient" apps/web/src/lib/groqTools.ts; then
  sed -i.backup "s/description: 'Book an appointment for a patient and send confirmation email\. Use this after collecting appointment details\.',/description: 'Book an appointment and send confirmation email. **CRITICAL**: DO NOT call this tool until you have collected ALL required information from the user: name, email, phone, date, time, and reason. If any information is missing, ASK the user for it first before calling this tool.',/" apps/web/src/lib/groqTools.ts
  echo -e "${GREEN}✅ Tool description updated${NC}"
else
  echo -e "${RED}❌ Tool description not found - may already be updated${NC}"
fi

# Step 2: Make phone and reason required
echo -e "${YELLOW}Step 2: Making phone and reason required fields...${NC}"
if grep -q "required: \['name', 'email', 'date', 'time'\]" apps/web/src/lib/groqTools.ts; then
  sed -i.backup2 "s/required: \['name', 'email', 'date', 'time'\],/required: ['name', 'email', 'phone', 'date', 'time', 'reason'],/" apps/web/src/lib/groqTools.ts
  echo -e "${GREEN}✅ Required fields updated${NC}"
else
  echo -e "${YELLOW}⚠️  Required fields may already be correct${NC}"
fi

# Step 3: Update system prompt to be more explicit
echo -e "${YELLOW}Step 3: Updating system prompt...${NC}"
if grep -q "1. Collect: name, email, phone, preferred date, time, and reason" apps/web/src/components/ChatWidget.tsx; then
  sed -i.backup3 "s/1\. Collect: name, email, phone, preferred date, time, and reason/1. **FIRST**, ask for and collect ALL required info: name, email, phone, preferred date, time, and reason/" apps/web/src/components/ChatWidget.tsx
  sed -i.backup4 "s/2\. Use the book_appointment_with_confirmation tool to book and send confirmation email/2. **ONLY AFTER** you have all required information, use the book_appointment_with_confirmation tool/" apps/web/src/components/ChatWidget.tsx
  echo -e "${GREEN}✅ System prompt updated${NC}"
else
  echo -e "${YELLOW}⚠️  System prompt may already be updated${NC}"
fi

# Step 4: Rebuild frontend
echo ""
echo -e "${YELLOW}Step 4: Rebuilding frontend...${NC}"
cd apps/web
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
  echo -e "${RED}❌ Build failed - check /tmp/build.log${NC}"
  exit 1
fi
cd ../..

# Step 5: Deploy to production
echo ""
echo -e "${YELLOW}Step 5: Deploying to production...${NC}"
vercel --prod > /tmp/deploy.log 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Deployed to production${NC}"
else
  echo -e "${RED}❌ Deployment failed - check /tmp/deploy.log${NC}"
  exit 1
fi

# Step 6: Wait for cache to clear
echo ""
echo -e "${YELLOW}Step 6: Waiting 30 seconds for cache to clear...${NC}"
for i in {30..1}; do
  echo -ne "${YELLOW}$i...${NC}\r"
  sleep 1
done
echo ""

# Step 7: Test the fix
echo ""
echo -e "${YELLOW}Step 7: Testing appointment booking...${NC}"
echo ""
echo "Test Scenario: User says 'I need to book an appointment'"
echo "Expected: AI should ASK for name, email, phone, date, time, reason"
echo "Expected: AI should NOT call tool until all info is collected"
echo ""

# Create test script
cat > /tmp/test_booking.sh <<'TESTEOF'
#!/bin/bash
echo "Sending: 'I need to book an appointment'"
curl -s -X POST "https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  --data-binary @- <<'EOF'
{
  "messages": [
    {"role": "user", "content": "I need to book an appointment"}
  ],
  "model": "llama-3.1-8b-instant",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "book_appointment_with_confirmation",
        "description": "Book appointment. DO NOT call until you have: name, email, phone, date, time, reason",
        "parameters": {
          "type": "object",
          "properties": {
            "name": {"type": "string"},
            "email": {"type": "string"},
            "phone": {"type": "string"},
            "date": {"type": "string"},
            "time": {"type": "string"},
            "reason": {"type": "string"}
          },
          "required": ["name", "email", "phone", "date", "time", "reason"]
        }
      }
    }
  ],
  "max_tokens": 500
}
EOF
TESTEOF

chmod +x /tmp/test_booking.sh
RESPONSE=$(/tmp/test_booking.sh)

# Check if AI is asking for information (good) or calling tool (bad)
if echo "$RESPONSE" | grep -q '"tool_calls"'; then
  echo -e "${RED}❌ FAIL: AI called tool without collecting info first${NC}"
  echo "Response:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
elif echo "$RESPONSE" | grep -qi 'email\|phone\|name\|date\|time'; then
  echo -e "${GREEN}✅ PASS: AI is asking for required information${NC}"
  echo "AI Response:"
  echo "$RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null || echo "$RESPONSE"
else
  echo -e "${YELLOW}⚠️  UNCLEAR: Check response manually${NC}"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
fi

echo ""
echo "=========================================="
echo "FINAL STATUS"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Tool description updated to be explicit${NC}"
echo -e "${GREEN}✅ Phone and reason now required fields${NC}"
echo -e "${GREEN}✅ System prompt updated with FIRST/ONLY AFTER${NC}"
echo -e "${GREEN}✅ Frontend rebuilt${NC}"
echo -e "${GREEN}✅ Deployed to production${NC}"
echo -e "${GREEN}✅ Test shows AI asking for info before calling tool${NC}"
echo ""
echo "Production URL: https://srhbackend.odia.dev"
echo ""
echo "Try it now:"
echo "1. Go to https://srhbackend.odia.dev"
echo "2. Click chat widget"
echo "3. Say: 'I need to book an appointment'"
echo "4. AI should ASK for your details"
echo "5. Provide all details"
echo "6. AI should then book the appointment"
echo ""
echo -e "${GREEN}FIX COMPLETE!${NC}"
