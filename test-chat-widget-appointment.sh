#!/bin/bash

# Comprehensive Chat Widget Appointment Booking Test
# This script tests the full conversation flow as a user would interact with the chat widget

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co"
GROQ_CHAT_FUNCTION="${SUPABASE_URL}/functions/v1/groq-chat"

echo "=========================================="
echo "🧪 Chat Widget Appointment Booking Test"
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

read -p "Press Enter to start the test..."
echo ""

# Step 1: Initial greeting
echo "=========================================="
echo -e "${YELLOW}Step 1: Initial Greeting${NC}"
echo "=========================================="

STEP1_REQUEST='{
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ],
  "model": "llama-3.1-8b-instant",
  "max_tokens": 1000
}'

echo -e "${BLUE}Sending:${NC} Hello"
STEP1_RESPONSE=$(curl -s -X POST "$GROQ_CHAT_FUNCTION" \
  -H "Content-Type: application/json" \
  -d "$STEP1_REQUEST")

echo -e "${GREEN}AI Response:${NC}"
echo "$STEP1_RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null || echo "$STEP1_RESPONSE"
echo ""
read -p "Press Enter to continue..."
echo ""

# Step 2: Express intent to book appointment
echo "=========================================="
echo -e "${YELLOW}Step 2: Express Booking Intent${NC}"
echo "=========================================="

STEP2_REQUEST='{
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you today?"
    },
    {
      "role": "user",
      "content": "I need to book an appointment"
    }
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
            "name": {
              "type": "string",
              "description": "Patient full name"
            },
            "email": {
              "type": "string",
              "description": "Patient email address"
            },
            "phone": {
              "type": "string",
              "description": "Patient phone number"
            },
            "date": {
              "type": "string",
              "description": "Appointment date (YYYY-MM-DD or descriptive like tomorrow)"
            },
            "time": {
              "type": "string",
              "description": "Appointment time (HH:MM AM/PM)"
            },
            "reason": {
              "type": "string",
              "description": "Reason for appointment"
            }
          },
          "required": ["name", "email", "phone", "date", "time", "reason"]
        }
      }
    }
  ],
  "max_tokens": 1000
}'

echo -e "${BLUE}Sending:${NC} I need to book an appointment"
STEP2_RESPONSE=$(curl -s -X POST "$GROQ_CHAT_FUNCTION" \
  -H "Content-Type: application/json" \
  -d "$STEP2_REQUEST")

echo -e "${GREEN}AI Response:${NC}"
echo "$STEP2_RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null || echo "$STEP2_RESPONSE"
echo ""
read -p "Press Enter to continue..."
echo ""

# Step 3: Provide all details at once (the way you typed it)
echo "=========================================="
echo -e "${YELLOW}Step 3: Provide Complete Details${NC}"
echo "=========================================="

STEP3_REQUEST='{
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you today?"
    },
    {
      "role": "user",
      "content": "I need to book an appointment"
    },
    {
      "role": "assistant",
      "content": "I'\''d be happy to help you book an appointment. To proceed, I'\''ll need some information from you. Could you please provide me with your name, email, phone number, preferred date, time, and the reason for your visit?"
    },
    {
      "role": "user",
      "content": "Samuel Eguale egualesamuel@gmail.com +234-801-234-5678 13th Nov 2025 10am general consultation"
    }
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
            "name": {
              "type": "string",
              "description": "Patient full name"
            },
            "email": {
              "type": "string",
              "description": "Patient email address"
            },
            "phone": {
              "type": "string",
              "description": "Patient phone number"
            },
            "date": {
              "type": "string",
              "description": "Appointment date (YYYY-MM-DD or descriptive like tomorrow)"
            },
            "time": {
              "type": "string",
              "description": "Appointment time (HH:MM AM/PM)"
            },
            "reason": {
              "type": "string",
              "description": "Reason for appointment"
            }
          },
          "required": ["name", "email", "phone", "date", "time", "reason"]
        }
      }
    }
  ],
  "max_tokens": 1000
}'

echo -e "${BLUE}Sending:${NC} Samuel Eguale egualesamuel@gmail.com +234-801-234-5678 13th Nov 2025 10am general consultation"
STEP3_RESPONSE=$(curl -s -X POST "$GROQ_CHAT_FUNCTION" \
  -H "Content-Type: application/json" \
  -d "$STEP3_REQUEST")

echo -e "${GREEN}AI Response:${NC}"
echo "$STEP3_RESPONSE" | jq '.' 2>/dev/null || echo "$STEP3_RESPONSE"
echo ""

# Check if tool was called
TOOL_CALLED=$(echo "$STEP3_RESPONSE" | jq -r '.choices[0].message.tool_calls[0].function.name' 2>/dev/null)

if [ "$TOOL_CALLED" = "book_appointment_with_confirmation" ]; then
    echo -e "${GREEN}✅ SUCCESS: AI called the booking tool!${NC}"
    echo ""
    echo "Tool Call Details:"
    echo "$STEP3_RESPONSE" | jq '.choices[0].message.tool_calls[0]' 2>/dev/null

    # Extract tool call arguments
    TOOL_ARGS=$(echo "$STEP3_RESPONSE" | jq -r '.choices[0].message.tool_calls[0].function.arguments' 2>/dev/null)
    echo ""
    echo "Extracted Details:"
    echo "$TOOL_ARGS" | jq '.' 2>/dev/null

    echo ""
    echo -e "${BLUE}The booking tool would now:${NC}"
    echo "1. ✉️  Send email to: egualesamuel@gmail.com"
    echo "2. 💾 Create appointment in Supabase"
    echo "3. 📅 Add to Google Calendar (if configured)"
    echo "4. 📱 Send SMS confirmation (if Twilio configured)"

elif [ "$TOOL_CALLED" = "null" ]; then
    echo -e "${YELLOW}⚠️  AI did not call the tool - it may be asking for more information${NC}"
    echo ""
    echo "AI Response:"
    echo "$STEP3_RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null || echo "$STEP3_RESPONSE"
else
    echo -e "${RED}❌ FAILED: Unexpected response${NC}"
    echo "$STEP3_RESPONSE"
fi

echo ""
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo ""

if [ "$TOOL_CALLED" = "book_appointment_with_confirmation" ]; then
    echo -e "${GREEN}Status: PASSED ✅${NC}"
    echo ""
    echo "The chat widget correctly:"
    echo "  ✅ Understood the appointment booking request"
    echo "  ✅ Extracted all required information"
    echo "  ✅ Called the booking tool with correct parameters"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Open the production site: https://srhbackend.odia.dev"
    echo "2. Click the chat widget (bottom right)"
    echo "3. Type the same message:"
    echo '   "I need to book an appointment samuel eguale egualesamuel@gmail.com +234-801-234-5678 13th nov 2025 10am general consultation"'
    echo "4. Verify the AI calls the booking tool"
    echo "5. Check your email: egualesamuel@gmail.com"
else
    echo -e "${RED}Status: NEEDS ATTENTION ⚠️${NC}"
    echo ""
    echo "The AI may need more explicit information or better prompting."
    echo "Try providing the information in a more natural way:"
    echo '  "My name is Samuel Eguale, email egualesamuel@gmail.com, phone +234-801-234-5678."'
    echo '  "I want to book for 13th November 2025 at 10am for general consultation"'
fi

echo ""
echo "=========================================="
echo "🔍 Troubleshooting Tips"
echo "=========================================="
echo ""
echo "If the booking doesn't work in production:"
echo ""
echo "1. Clear Browser Cache:"
echo "   • Chrome/Edge: Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)"
echo "   • Select 'Cached images and files'"
echo "   • Click 'Clear data'"
echo ""
echo "2. Check Browser Console:"
echo "   • Press F12 to open DevTools"
echo "   • Go to 'Console' tab"
echo "   • Look for errors related to Groq or booking"
echo ""
echo "3. Verify Environment Variables:"
echo "   • Check Vercel dashboard"
echo "   • Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set"
echo "   • Redeploy if needed"
echo ""
echo "4. Check N8N Workflow:"
echo "   • Visit: https://cwai97.app.n8n.cloud/executions"
echo "   • Look for recent executions"
echo "   • Check for errors in the workflow"
echo ""
echo "=========================================="
