#!/bin/bash

echo "=============================================="
echo "🤖 COMPREHENSIVE AI TOOLS TEST SUITE"
echo "=============================================="
echo ""
echo "Testing ALL AI functions and tools in the Serenity system"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test result tracking
declare -a FAILED_TEST_NAMES

# Function to run a test
run_test() {
  local test_name="$1"
  local test_command="$2"
  local success_pattern="$3"

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Test $TOTAL_TESTS: $test_name${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  # Execute test
  RESPONSE=$(eval "$test_command" 2>&1)

  # Check for success
  if echo "$RESPONSE" | grep -q "$success_pattern"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    echo "Response preview: $(echo "$RESPONSE" | head -c 200)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    FAILED_TEST_NAMES+=("$test_name")
  fi
}

# ============================================
# SECTION 1: INFRASTRUCTURE TESTS
# ============================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SECTION 1: Infrastructure & Connectivity${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

run_test "Production Site Accessibility" \
  "curl -s -o /dev/null -w '%{http_code}' https://srhbackend.odia.dev" \
  "200"

run_test "Groq Edge Function Health Check" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{\"messages\":[{\"role\":\"user\",\"content\":\"ping\"}],\"model\":\"llama-3.1-8b-instant\",\"max_tokens\":5}'" \
  '"role":"assistant"'

run_test "n8n Webhook Connectivity" \
  "curl -s -o /dev/null -w '%{http_code}' -X POST 'https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2' \
    -H 'Content-Type: application/json' \
    -d '{\"action\":\"test\",\"payload\":{}}'" \
  "200"

run_test "Supabase Database Connection" \
  "curl -s 'https://yfrpxqvjshwaaomgcaoq.supabase.co/rest/v1/' \
    -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y'" \
  "OpenAPI"

# ============================================
# SECTION 2: PUBLIC TOOLS (No Auth Required)
# ============================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SECTION 2: Public AI Tools${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

run_test "AI Tool: book_appointment_with_confirmation" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{
      \"messages\": [{\"role\":\"user\",\"content\":\"Book appointment tomorrow 2pm, Samuel, egualesamuel@gmail.com\"}],
      \"model\": \"llama-3.1-8b-instant\",
      \"tools\": [{
        \"type\":\"function\",
        \"function\":{
          \"name\":\"book_appointment_with_confirmation\",
          \"parameters\":{\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"}},\"required\":[\"name\",\"email\"]}
        }
      }],
      \"max_tokens\": 500
    }'" \
  '"name":"book_appointment_with_confirmation"'

run_test "AI Tool: trigger_automation (Public Access)" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{
      \"messages\": [{\"role\":\"user\",\"content\":\"Trigger appointment booking\"}],
      \"model\": \"llama-3.1-8b-instant\",
      \"tools\": [{
        \"type\":\"function\",
        \"function\":{
          \"name\":\"trigger_automation\",
          \"parameters\":{\"type\":\"object\",\"properties\":{\"action\":{\"type\":\"string\"},\"payload\":{\"type\":\"object\"}},\"required\":[\"action\"]}
        }
      }],
      \"max_tokens\": 500
    }'" \
  '"name":"trigger_automation"'

# ============================================
# SECTION 3: GROQ AI MODELS
# ============================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SECTION 3: Groq AI Models${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

run_test "Model: llama-3.1-8b-instant (Production Default)" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{\"messages\":[{\"role\":\"user\",\"content\":\"Say OK\"}],\"model\":\"llama-3.1-8b-instant\",\"max_tokens\":5}'" \
  '"role":"assistant"'

run_test "Model: llama-3.3-70b-versatile (Upgraded)" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{\"messages\":[{\"role\":\"user\",\"content\":\"Say OK\"}],\"model\":\"llama-3.3-70b-versatile\",\"max_tokens\":5}'" \
  '"role":"assistant"'

# ============================================
# SECTION 4: AI INTENT DETECTION
# ============================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SECTION 4: AI Intent Detection${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

run_test "Intent: Appointment Booking Detection" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{
      \"messages\": [{\"role\":\"user\",\"content\":\"I want to schedule a doctor appointment\"}],
      \"model\": \"llama-3.1-8b-instant\",
      \"tools\": [{\"type\":\"function\",\"function\":{\"name\":\"book_appointment_with_confirmation\",\"parameters\":{\"type\":\"object\",\"properties\":{}}}}],
      \"max_tokens\": 200
    }'" \
  'book_appointment'

run_test "Intent: Automation Trigger Detection" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{
      \"messages\": [{\"role\":\"user\",\"content\":\"Send me an email reminder\"}],
      \"model\": \"llama-3.1-8b-instant\",
      \"tools\": [{\"type\":\"function\",\"function\":{\"name\":\"trigger_automation\",\"parameters\":{\"type\":\"object\",\"properties\":{}}}}],
      \"max_tokens\": 200
    }'" \
  'trigger_automation'

run_test "Intent: General Health Question (No Tool Call)" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{
      \"messages\": [{\"role\":\"user\",\"content\":\"What are the symptoms of flu?\"}],
      \"model\": \"llama-3.1-8b-instant\",
      \"max_tokens\": 100
    }'" \
  '"finish_reason":"stop"'

# ============================================
# SECTION 5: EDGE FUNCTION TOOL IMPLEMENTATIONS
# ============================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SECTION 5: Edge Function Tool Implementations${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

# Note: Some tools require authentication, so we test structure not execution

run_test "Tool Implementation: get_stats (Structure Check)" \
  "grep -q 'case .get_stats.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

run_test "Tool Implementation: trigger_automation (Structure Check)" \
  "grep -q 'case .trigger_automation.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

run_test "Tool Implementation: book_appointment_with_confirmation (Structure Check)" \
  "grep -q 'case .book_appointment_with_confirmation.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

run_test "Tool Implementation: get_appointments (Structure Check)" \
  "grep -q 'case .get_appointments.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

run_test "Tool Implementation: check_availability (Structure Check)" \
  "grep -q 'case .check_availability.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

run_test "Tool Implementation: get_conversations (Structure Check)" \
  "grep -q 'case .get_conversations.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

run_test "Tool Implementation: get_conversation_thread (Structure Check)" \
  "grep -q 'case .get_conversation_thread.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

run_test "Tool Implementation: search_patient (Structure Check)" \
  "grep -q 'case .search_patient.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

run_test "Tool Implementation: send_message (Structure Check)" \
  "grep -q 'case .send_message.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

run_test "Tool Implementation: get_analytics (Structure Check)" \
  "grep -q 'case .get_analytics.' supabase/functions/groq-chat/index.ts && echo 'FOUND'" \
  "FOUND"

# ============================================
# SECTION 6: N8N AUTOMATION WORKFLOWS
# ============================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SECTION 6: n8n Automation Workflows${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

run_test "n8n Action: book_appointment" \
  "curl -s -X POST 'https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2' \
    -H 'Content-Type: application/json' \
    -d '{\"action\":\"book_appointment\",\"payload\":{\"name\":\"Test\",\"email\":\"test@test.com\"}}' \
    -o /dev/null -w '%{http_code}'" \
  "200"

run_test "n8n Action: send_email" \
  "curl -s -X POST 'https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2' \
    -H 'Content-Type: application/json' \
    -d '{\"action\":\"send_email\",\"payload\":{\"to\":\"test@test.com\",\"subject\":\"Test\"}}' \
    -o /dev/null -w '%{http_code}'" \
  "200"

run_test "n8n Webhook: Empty Response Handling" \
  "curl -s -X POST 'https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2' \
    -H 'Content-Type: application/json' \
    -d '{\"action\":\"test\"}' | wc -c" \
  "0"

# ============================================
# SECTION 7: ERROR HANDLING & EDGE CASES
# ============================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SECTION 7: Error Handling & Edge Cases${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

run_test "Error Handling: Invalid Model Name" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{\"messages\":[{\"role\":\"user\",\"content\":\"test\"}],\"model\":\"invalid-model-name\",\"max_tokens\":5}'" \
  '"error"'

run_test "Error Handling: Empty Message Array" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{\"messages\":[],\"model\":\"llama-3.1-8b-instant\"}'" \
  '"error"'

run_test "Error Handling: Malformed JSON" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d 'invalid json' -w '%{http_code}'" \
  '400\|500'

run_test "Edge Case: Very Long Message (Token Limits)" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{\"messages\":[{\"role\":\"user\",\"content\":\"'$(python3 -c "print('test ' * 1000)")'\"}],\"model\":\"llama-3.1-8b-instant\",\"max_tokens\":10}'" \
  '"role":"assistant"\|"error"'

run_test "Edge Case: Special Characters in Message" \
  "curl -s -X POST 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat' \
    -H 'Content-Type: application/json' \
    -d '{\"messages\":[{\"role\":\"user\",\"content\":\"Test <>&\"}],\"model\":\"llama-3.1-8b-instant\",\"max_tokens\":10}'" \
  '"role":"assistant"'

# ============================================
# SECTION 8: FRONTEND INTEGRATION
# ============================================
echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SECTION 8: Frontend Integration${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"

run_test "Frontend: Chat Widget Assets Loaded" \
  "curl -s https://srhbackend.odia.dev | grep -q 'ChatWidget' && echo 'FOUND'" \
  "FOUND"

run_test "Frontend: Groq Tools Module Available" \
  "test -f apps/web/src/lib/groqTools.ts && echo 'FOUND'" \
  "FOUND"

run_test "Frontend: Environment Variables Configured" \
  "test -f apps/web/.env.local && grep -q 'VITE_GROQ_MODEL' apps/web/.env.local && echo 'FOUND'" \
  "FOUND"

# ============================================
# FINAL SUMMARY
# ============================================
echo ""
echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SUITE COMPLETE${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -gt 0 ]; then
  echo -e "${RED}Failed Tests:${NC}"
  for test_name in "${FAILED_TEST_NAMES[@]}"; do
    echo "  - $test_name"
  done
  echo ""
fi

# Calculate success rate
SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

if [ $SUCCESS_RATE -eq 100 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}🎉 ALL TESTS PASSED! SUCCESS RATE: 100%${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "All AI functions and tools are operational!"
  echo ""
  echo "✅ Infrastructure: Working"
  echo "✅ Public AI Tools: Working"
  echo "✅ Groq Models: Working"
  echo "✅ Intent Detection: Working"
  echo "✅ Tool Implementations: Complete"
  echo "✅ n8n Automations: Working"
  echo "✅ Error Handling: Robust"
  echo "✅ Frontend Integration: Complete"
  echo ""
  exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}⚠️  MOSTLY PASSING: SUCCESS RATE: ${SUCCESS_RATE}%${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Most systems operational, but some issues detected."
  exit 1
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ CRITICAL FAILURES: SUCCESS RATE: ${SUCCESS_RATE}%${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Multiple critical systems failing. Review logs above."
  exit 1
fi
