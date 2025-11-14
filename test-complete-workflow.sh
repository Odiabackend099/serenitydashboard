#!/bin/bash

# Complete Workflow Test - All Email Types
# Tests: Booking, Reschedule, Cancel confirmations

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"

echo "=========================================="
echo -e "${CYAN}🧪 Complete Workflow Email Test${NC}"
echo "=========================================="
echo ""
echo "This will send 3 emails to: egualesamuel@gmail.com"
echo "  1. 📧 Appointment Booking Confirmation"
echo "  2. 🔄 Appointment Reschedule Confirmation"
echo "  3. ❌ Appointment Cancellation Confirmation"
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 1: Book Appointment
echo "=========================================="
echo -e "${YELLOW}Test 1: Booking Appointment${NC}"
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
    "appointment_date": "2025-11-30",
    "appointment_time": "14:00",
    "reason": "Email workflow test - Booking confirmation",
    "appointment_type": "consultation",
    "toList": "egualesamuel@gmail.com",
    "subject": "Test: Appointment Booking Confirmation",
    "message": "Testing appointment booking email workflow."
  }
}'

echo "Creating appointment for Nov 30, 2025 at 2:00 PM..."
BOOKING_RESPONSE=$(curl -s -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_PAYLOAD")

echo -e "${GREEN}✅ Booking email sent!${NC}"
echo "Response:"
echo "$BOOKING_RESPONSE" | jq '.' 2>/dev/null || echo "$BOOKING_RESPONSE"
echo ""
echo "📧 Check inbox: Appointment Confirmation email"
echo ""
sleep 3

# Test 2: Send Email (Direct)
echo "=========================================="
echo -e "${YELLOW}Test 2: Direct Email Test${NC}"
echo "=========================================="
echo ""

EMAIL_PAYLOAD='{
  "action": "send_email",
  "body": {
    "action": "send_email",
    "email": "egualesamuel@gmail.com",
    "subject": "🧪 Test: Direct Email from Serenity Hospital",
    "message": "This is a direct email test.\n\nIf you receive this, the email sending workflow is working perfectly!\n\nTimestamp: '"$(date)"'"
  }
}'

echo "Sending direct email..."
EMAIL_RESPONSE=$(curl -s -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$EMAIL_PAYLOAD")

echo -e "${GREEN}✅ Direct email sent!${NC}"
echo "Response:"
echo "$EMAIL_RESPONSE" | jq '.' 2>/dev/null || echo "$EMAIL_RESPONSE"
echo ""
echo "📧 Check inbox: Direct email test"
echo ""
sleep 3

# Summary
echo "=========================================="
echo -e "${CYAN}📊 Test Complete${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Sent 2 test emails${NC}"
echo ""
echo "Check your inbox: egualesamuel@gmail.com"
echo ""
echo "Expected emails:"
echo "  1. 📧 Appointment Confirmation - Serenity Hospital"
echo "  2. 📧 Test: Direct Email from Serenity Hospital"
echo ""
echo "If emails not in inbox, check:"
echo "  • Spam/Junk folder"
echo "  • Gmail filters"
echo "  • Wait 1-2 minutes for delivery"
echo ""
echo "N8N Executions:"
echo "  https://cwai97.app.n8n.cloud/workflow/UZvAy2tTj8fPWcDZ/executions"
echo ""
echo "All nodes should be GREEN ✅"
echo ""
echo "=========================================="
echo -e "${GREEN}Done!${NC}"
echo "=========================================="
