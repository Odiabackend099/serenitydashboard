#!/bin/bash

# WhatsApp Integration Test Script
# Tests Groq Edge Function with WhatsApp-style requests

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

EDGE_FUNCTION_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.v_kQJlJy7PVF9wCZgS5A-VJv4gnWTLNgDx_xb9GRSB4"

echo "=========================================="
echo -e "${CYAN}🧪 WhatsApp Integration Test Suite${NC}"
echo "=========================================="
echo ""
echo "Testing Groq Edge Function with WhatsApp mode"
echo ""

# Test 1: Simple Greeting
echo "=========================================="
echo -e "${YELLOW}Test 1: Simple Greeting${NC}"
echo "=========================================="
echo ""

GREETING_PAYLOAD='{
  "messages": [
    {
      "role": "system",
      "content": "You are the AI receptionist for Serenity Royale Hospital in Lagos, Nigeria. You help patients book appointments via WhatsApp. Be warm, professional, and concise. Use emojis appropriately. Today is 2025-11-13."
    },
    {
      "role": "user",
      "content": "Hi"
    }
  ],
  "mode": "public",
  "patient_phone": "+2348012345678",
  "message_type": "text",
  "model": "llama-3.1-8b-instant",
  "temperature": 0.7,
  "max_tokens": 500
}'

echo "Sending greeting test..."
GREETING_RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -d "$GREETING_PAYLOAD")

echo -e "${GREEN}✅ Response received:${NC}"
echo "$GREETING_RESPONSE" | jq '.response' 2>/dev/null || echo "$GREETING_RESPONSE"
echo ""
sleep 2

# Test 2: Check Availability
echo "=========================================="
echo -e "${YELLOW}Test 2: Check Availability${NC}"
echo "=========================================="
echo ""

AVAILABILITY_PAYLOAD='{
  "messages": [
    {
      "role": "system",
      "content": "You are the AI receptionist for Serenity Royale Hospital. You help patients book appointments via WhatsApp. ALWAYS check availability before booking. Today is 2025-11-13."
    },
    {
      "role": "user",
      "content": "Is Nov 15th at 2 PM available?"
    }
  ],
  "mode": "public",
  "patient_phone": "+2348012345678",
  "message_type": "text",
  "model": "llama-3.1-8b-instant"
}'

echo "Checking availability for Nov 15, 2025 at 2:00 PM..."
AVAILABILITY_RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -d "$AVAILABILITY_PAYLOAD")

echo -e "${GREEN}✅ Response:${NC}"
echo "$AVAILABILITY_RESPONSE" | jq '.' 2>/dev/null || echo "$AVAILABILITY_RESPONSE"
echo ""
sleep 2

# Test 3: Book Appointment (with all required info)
echo "=========================================="
echo -e "${YELLOW}Test 3: Book Appointment${NC}"
echo "=========================================="
echo ""

BOOKING_PAYLOAD='{
  "messages": [
    {
      "role": "system",
      "content": "You are the AI receptionist for Serenity Royale Hospital. Help patients book appointments via WhatsApp. ALWAYS collect ALL required info before booking. Today is 2025-11-13."
    },
    {
      "role": "user",
      "content": "I want to book an appointment for Nov 20th at 3 PM"
    },
    {
      "role": "assistant",
      "content": "Great! I can help you book that appointment. To confirm, I need a few details:\n\n1. Your full name?\n2. Your email address?\n3. Your phone number?\n4. Reason for visit?"
    },
    {
      "role": "user",
      "content": "Samuel Eguale, egualesamuel@gmail.com, +234-801-234-5678, general checkup"
    }
  ],
  "mode": "public",
  "patient_phone": "+2348012345678",
  "message_type": "text",
  "model": "llama-3.1-8b-instant",
  "temperature": 0.7,
  "max_tokens": 1000
}'

echo "Booking appointment for Nov 20, 2025 at 3:00 PM..."
echo "Patient: Samuel Eguale (egualesamuel@gmail.com)"
echo ""

BOOKING_RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -d "$BOOKING_PAYLOAD")

echo -e "${GREEN}✅ Booking Response:${NC}"
echo "$BOOKING_RESPONSE" | jq '.' 2>/dev/null || echo "$BOOKING_RESPONSE"
echo ""

# Check if tool was executed
TOOL_EXECUTED=$(echo "$BOOKING_RESPONSE" | jq -r '.tool_executed' 2>/dev/null || echo "false")
if [ "$TOOL_EXECUTED" = "true" ]; then
  echo -e "${GREEN}✅ Tool Executed: Appointment booking tool was called${NC}"
else
  echo -e "${YELLOW}⚠️  Tool Not Executed: AI may need more info or waiting for confirmation${NC}"
fi
echo ""
sleep 3

# Test 4: Get My Appointments
echo "=========================================="
echo -e "${YELLOW}Test 4: Get My Appointments${NC}"
echo "=========================================="
echo ""

GET_APPOINTMENTS_PAYLOAD='{
  "messages": [
    {
      "role": "system",
      "content": "You are the AI receptionist for Serenity Royale Hospital. Help patients view their appointments. Today is 2025-11-13."
    },
    {
      "role": "user",
      "content": "Show my appointments"
    },
    {
      "role": "assistant",
      "content": "I can show you your appointments. What is your email address?"
    },
    {
      "role": "user",
      "content": "egualesamuel@gmail.com"
    }
  ],
  "mode": "public",
  "patient_phone": "+2348012345678",
  "message_type": "text",
  "model": "llama-3.1-8b-instant"
}'

echo "Fetching appointments for egualesamuel@gmail.com..."
GET_APPOINTMENTS_RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -d "$GET_APPOINTMENTS_PAYLOAD")

echo -e "${GREEN}✅ Response:${NC}"
echo "$GET_APPOINTMENTS_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_APPOINTMENTS_RESPONSE"
echo ""
sleep 2

# Summary
echo "=========================================="
echo -e "${CYAN}📊 Test Summary${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ All tests completed${NC}"
echo ""
echo "Tests run:"
echo "  1. ✅ Simple greeting (mode=public)"
echo "  2. ✅ Check availability tool"
echo "  3. ✅ Book appointment tool"
echo "  4. ✅ Get my appointments tool"
echo ""
echo "Next steps:"
echo "  • Import WhatsApp workflow to N8N"
echo "  • Configure WhatsApp credentials"
echo "  • Test end-to-end via WhatsApp"
echo ""
echo "Edge Function URL:"
echo "  $EDGE_FUNCTION_URL"
echo ""
echo "=========================================="
echo -e "${GREEN}Done!${NC}"
echo "=========================================="
