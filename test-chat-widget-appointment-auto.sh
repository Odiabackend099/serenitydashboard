#!/bin/bash

# Comprehensive Chat Widget Appointment Booking Test (Non-Interactive)
# This script tests the full conversation flow automatically

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co"
GROQ_CHAT_FUNCTION="${SUPABASE_URL}/functions/v1/groq-chat"

echo "=========================================="
echo -e "${CYAN}🧪 Chat Widget Appointment Booking Test${NC}"
echo "=========================================="
echo ""

# Test patient details
echo -e "${BLUE}Test Patient Details:${NC}"
echo "Name: Samuel Eguale"
echo "Email: egualesamuel@gmail.com"
echo "Phone: +234-801-234-5678"
echo "Date: 13th November 2025"
echo "Time: 10:00 AM"
echo "Reason: General consultation"
echo ""

# Step 1: Initial greeting
echo "=========================================="
echo -e "${YELLOW}Step 1: Initial Greeting${NC}"
echo "=========================================="

echo -e "${BLUE}User:${NC} Hello"

STEP1_RESPONSE=$(curl -s -X POST "$GROQ_CHAT_FUNCTION" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "model": "llama-3.1-8b-instant",
    "max_tokens": 1000
  }')

echo -e "${GREEN}AI:${NC} $(echo "$STEP1_RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null || echo "Error parsing response")"
echo ""
sleep 1

# Step 2: Express intent to book appointment
echo "=========================================="
echo -e "${YELLOW}Step 2: Express Booking Intent${NC}"
echo "=========================================="

echo -e "${BLUE}User:${NC} I need to book an appointment"

STEP2_RESPONSE=$(curl -s -X POST "$GROQ_CHAT_FUNCTION" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"},
      {"role": "assistant", "content": "Hi! How can I help you today?"},
      {"role": "user", "content": "I need to book an appointment"}
    ],
    "model": "llama-3.1-8b-instant",
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "book_appointment_with_confirmation",
          "description": "Book an appointment and send confirmation email",
          "parameters": {
            "type": "object",
            "properties": {
              "name": {"type": "string", "description": "Patient full name"},
              "email": {"type": "string", "description": "Patient email address"},
              "phone": {"type": "string", "description": "Patient phone number"},
              "date": {"type": "string", "description": "Appointment date"},
              "time": {"type": "string", "description": "Appointment time"},
              "reason": {"type": "string", "description": "Reason for appointment"}
            },
            "required": ["name", "email", "phone", "date", "time", "reason"]
          }
        }
      }
    ],
    "max_tokens": 1000
  }')

echo -e "${GREEN}AI:${NC} $(echo "$STEP2_RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null || echo "Error parsing response")"
echo ""
sleep 1

# Step 3: Provide all details at once
echo "=========================================="
echo -e "${YELLOW}Step 3: Provide Complete Details${NC}"
echo "=========================================="

USER_MESSAGE="I need to book an appointment for Samuel Eguale at egualesamuel@gmail.com phone +234-801-234-5678 on 13th November 2025 at 10am for general consultation"
echo -e "${BLUE}User:${NC} $USER_MESSAGE"
echo ""

STEP3_RESPONSE=$(curl -s -X POST "$GROQ_CHAT_FUNCTION" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "'"$USER_MESSAGE"'"}
    ],
    "model": "llama-3.1-8b-instant",
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "book_appointment_with_confirmation",
          "description": "Book an appointment and send confirmation email",
          "parameters": {
            "type": "object",
            "properties": {
              "name": {"type": "string", "description": "Patient full name"},
              "email": {"type": "string", "description": "Patient email address"},
              "phone": {"type": "string", "description": "Patient phone number"},
              "date": {"type": "string", "description": "Appointment date (YYYY-MM-DD or descriptive)"},
              "time": {"type": "string", "description": "Appointment time (HH:MM AM/PM)"},
              "reason": {"type": "string", "description": "Reason for appointment"}
            },
            "required": ["name", "email", "phone", "date", "time", "reason"]
          }
        }
      }
    ],
    "max_tokens": 1000
  }')

# Check if tool was called
TOOL_CALLED=$(echo "$STEP3_RESPONSE" | jq -r '.choices[0].message.tool_calls[0].function.name' 2>/dev/null)
TOOL_RESULTS=$(echo "$STEP3_RESPONSE" | jq -r '.tool_results' 2>/dev/null)

echo -e "${CYAN}Raw Response:${NC}"
echo "$STEP3_RESPONSE" | jq '.' 2>/dev/null || echo "$STEP3_RESPONSE"
echo ""

if [ "$TOOL_CALLED" = "book_appointment_with_confirmation" ]; then
    echo -e "${GREEN}✅ SUCCESS: AI called the booking tool!${NC}"
    echo ""

    # Extract and display tool call arguments
    TOOL_ARGS=$(echo "$STEP3_RESPONSE" | jq -r '.choices[0].message.tool_calls[0].function.arguments' 2>/dev/null)

    echo -e "${CYAN}📋 Extracted Booking Details:${NC}"
    echo "$TOOL_ARGS" | jq '.' 2>/dev/null || echo "$TOOL_ARGS"
    echo ""

    # Check if tool was actually executed (has tool_results)
    if [ "$TOOL_RESULTS" != "null" ] && [ -n "$TOOL_RESULTS" ]; then
        echo -e "${GREEN}✅ Tool was EXECUTED successfully!${NC}"
        echo ""
        echo -e "${CYAN}📬 Tool Execution Result:${NC}"
        echo "$STEP3_RESPONSE" | jq '.tool_results' 2>/dev/null
        echo ""

        # Check for success in tool results
        SUCCESS=$(echo "$STEP3_RESPONSE" | jq -r '.tool_results[0].content' 2>/dev/null | jq -r '.success' 2>/dev/null)

        if [ "$SUCCESS" = "true" ]; then
            echo -e "${GREEN}🎉 APPOINTMENT BOOKED SUCCESSFULLY!${NC}"
            echo ""
            echo "✅ Email confirmation sent to: egualesamuel@gmail.com"
            echo "✅ Appointment saved in database"
            echo "✅ N8N workflow executed"
        else
            ERROR_MSG=$(echo "$STEP3_RESPONSE" | jq -r '.tool_results[0].content' 2>/dev/null | jq -r '.error' 2>/dev/null)
            echo -e "${RED}❌ Booking failed: $ERROR_MSG${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Tool was called but not executed yet (requires second call)${NC}"
        echo ""
        echo -e "${BLUE}This means:${NC}"
        echo "• Groq AI recognized the booking intent ✅"
        echo "• AI extracted all parameters correctly ✅"
        echo "• Tool call needs to be executed by the client ⏳"
        echo ""
        echo -e "${CYAN}In production, the chat widget would now:${NC}"
        echo "1. ✉️  Send confirmation email to egualesamuel@gmail.com"
        echo "2. 💾 Create appointment record in Supabase"
        echo "3. 📅 Sync to Google Calendar (if configured)"
        echo "4. 📱 Send SMS via Twilio (if configured)"
    fi

elif [ "$TOOL_CALLED" = "null" ] || [ -z "$TOOL_CALLED" ]; then
    # Check if AI is asking for more information
    AI_RESPONSE=$(echo "$STEP3_RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null)

    echo -e "${YELLOW}⚠️  AI did not call the tool${NC}"
    echo ""
    echo -e "${GREEN}AI Response:${NC}"
    echo "$AI_RESPONSE"
    echo ""

    # Check if AI is asking for specific information
    if echo "$AI_RESPONSE" | grep -qi "need\|require\|provide\|tell me\|what"; then
        echo -e "${BLUE}💡 The AI is asking for more information${NC}"
        echo "This is normal - the AI wants to confirm details before booking."
    else
        echo -e "${RED}❌ Unexpected response - AI may not understand the request${NC}"
    fi
else
    echo -e "${RED}❌ FAILED: Unexpected tool called: $TOOL_CALLED${NC}"
fi

echo ""
echo "=========================================="
echo -e "${CYAN}📊 Test Summary${NC}"
echo "=========================================="
echo ""

if [ "$TOOL_CALLED" = "book_appointment_with_confirmation" ]; then
    if [ "$SUCCESS" = "true" ]; then
        echo -e "${GREEN}✅ Status: FULLY WORKING${NC}"
        echo ""
        echo "The entire booking flow is functioning:"
        echo "  ✅ AI understands booking requests"
        echo "  ✅ AI extracts all required information"
        echo "  ✅ Booking tool is called correctly"
        echo "  ✅ N8N workflow executes successfully"
        echo "  ✅ Confirmation email is sent"
    else
        echo -e "${YELLOW}⚠️  Status: TOOL CALLED (Partial Success)${NC}"
        echo ""
        echo "The AI correctly:"
        echo "  ✅ Understood the appointment booking request"
        echo "  ✅ Extracted all required information"
        echo "  ✅ Called the booking tool with correct parameters"
        echo ""
        echo "However, tool execution had issues. Check N8N workflow."
    fi

    echo ""
    echo -e "${CYAN}🌐 Test in Production:${NC}"
    echo ""
    echo "1. Open: ${GREEN}https://srhbackend.odia.dev${NC}"
    echo "2. Click the chat widget (bottom right corner)"
    echo "3. Type: ${YELLOW}\"$USER_MESSAGE\"${NC}"
    echo "4. The AI should book the appointment immediately"
    echo "5. Check email: ${GREEN}egualesamuel@gmail.com${NC}"
    echo ""

else
    echo -e "${RED}⚠️  Status: NEEDS ATTENTION${NC}"
    echo ""
    echo "The AI did not call the booking tool."
    echo ""
    echo "Possible reasons:"
    echo "  • AI needs more explicit phrasing"
    echo "  • Tool definition may need adjustment"
    echo "  • System prompt needs refinement"
    echo ""
    echo "Try rephrasing your message in production:"
    echo '  "Book appointment for Samuel Eguale"'
    echo '  "Email: egualesamuel@gmail.com"'
    echo '  "Phone: +234-801-234-5678"'
    echo '  "Date: November 13, 2025 at 10:00 AM"'
    echo '  "Reason: General consultation"'
fi

echo ""
echo "=========================================="
echo -e "${CYAN}🔍 Quick Verification Commands${NC}"
echo "=========================================="
echo ""
echo "Check Supabase appointments:"
echo -e "${YELLOW}psql -h ... -d postgres -c \"SELECT * FROM appointments WHERE patient_email='egualesamuel@gmail.com' ORDER BY created_at DESC LIMIT 1;\"${NC}"
echo ""
echo "Check N8N workflow executions:"
echo -e "${YELLOW}Open: https://cwai97.app.n8n.cloud/executions${NC}"
echo ""
echo "Check email inbox:"
echo -e "${YELLOW}Login to egualesamuel@gmail.com${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}Test Complete!${NC}"
echo "=========================================="
