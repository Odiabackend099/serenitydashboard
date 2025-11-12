#!/bin/bash

# Test n8n workflow with VERIFIED Twilio numbers

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"
SMS_NUMBER="+18777804236"           # Verified for SMS
WHATSAPP_NUMBER="+2348128772405"    # Verified for WhatsApp Sandbox

echo "=========================================="
echo "Testing n8n Workflow with Verified Numbers"
echo "=========================================="
echo ""
echo "SMS Number: $SMS_NUMBER"
echo "WhatsApp Number: $WHATSAPP_NUMBER"
echo ""

# Test 1: Send WhatsApp
echo "Test 1: Send WhatsApp Message"
echo "----------------------------------------"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_whatsapp",
    "phone": "'"$WHATSAPP_NUMBER"'",
    "message": "✅ n8n Workflow Test - WhatsApp is working!"
  }' \
  --max-time 30 \
  -w "\nHTTP Status: %{http_code}\n\n" \
  -s

sleep 3

# Test 2: Send SMS
echo "Test 2: Send SMS Message"
echo "----------------------------------------"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_sms",
    "phone": "'"$SMS_NUMBER"'",
    "message": "✅ n8n Workflow Test - SMS is working!"
  }' \
  --max-time 30 \
  -w "\nHTTP Status: %{http_code}\n\n" \
  -s

sleep 3

# Test 3: Send Message via WhatsApp (with database save)
echo "Test 3: Send Message via WhatsApp (saves to DB)"
echo "----------------------------------------"
CONV_ID="test-wa-$(date +%s)"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "'"$CONV_ID"'",
    "channel": "whatsapp",
    "phone": "'"$WHATSAPP_NUMBER"'",
    "message": "Testing send_message action - this should be saved to database!"
  }' \
  --max-time 30 \
  -w "\nHTTP Status: %{http_code}\n\n" \
  -s

sleep 3

# Test 4: Send Message via SMS (with database save)
echo "Test 4: Send Message via SMS (saves to DB)"
echo "----------------------------------------"
CONV_ID="test-sms-$(date +%s)"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "'"$CONV_ID"'",
    "channel": "sms",
    "phone": "'"$SMS_NUMBER"'",
    "message": "Testing SMS message - this should be saved to database!"
  }' \
  --max-time 30 \
  -w "\nHTTP Status: %{http_code}\n\n" \
  -s

sleep 3

# Test 5: Book Appointment (creates DB record + sends SMS + Email)
echo "Test 5: Book Appointment"
echo "----------------------------------------"
CONV_ID="test-apt-$(date +%s)"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "conversation_id": "'"$CONV_ID"'",
    "patient_ref": "'"$SMS_NUMBER"'",
    "patient_name": "Test Patient",
    "patient_email": "test@example.com",
    "patient_phone": "'"$SMS_NUMBER"'",
    "appointment_date": "2025-11-25",
    "appointment_time": "15:00:00",
    "appointment_type": "consultation",
    "reason": "Workflow test appointment"
  }' \
  --max-time 45 \
  -w "\nHTTP Status: %{http_code}\n\n" \
  -s

echo ""
echo "=========================================="
echo "All Tests Complete!"
echo "=========================================="
echo ""
echo "Check:"
echo "1. WhatsApp messages on: $WHATSAPP_NUMBER"
echo "2. SMS messages on: $SMS_NUMBER"
echo "3. n8n Executions tab for detailed logs"
echo "4. Supabase messages table for saved messages"
echo "5. Supabase appointments table for the appointment"
echo ""
