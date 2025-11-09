#!/bin/bash

# Test with verified Twilio number (trial account safe)

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"
YOUR_VERIFIED_NUMBER="+12526453035"  # Your Twilio number (verified)

echo "=========================================="
echo "Testing with Verified Number"
echo "=========================================="
echo ""
echo "Using YOUR verified Twilio number: $YOUR_VERIFIED_NUMBER"
echo "Note: On trial accounts, you can only send to verified numbers."
echo ""

# Test 1: Send WhatsApp to yourself
echo "Test 1: Sending WhatsApp to your verified number..."
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_whatsapp",
    "phone": "'"$YOUR_VERIFIED_NUMBER"'",
    "message": "✅ Test from n8n workflow - WhatsApp working!"
  }' \
  --max-time 30 \
  -w "\nHTTP: %{http_code}\n\n" \
  -s

sleep 3

# Test 2: Send SMS to yourself
echo "Test 2: Sending SMS to your verified number..."
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_sms",
    "phone": "'"$YOUR_VERIFIED_NUMBER"'",
    "message": "✅ Test from n8n workflow - SMS working!"
  }' \
  --max-time 30 \
  -w "\nHTTP: %{http_code}\n\n" \
  -s

sleep 3

# Test 3: Send message with database save
echo "Test 3: Sending message (with database save)..."
CONV_ID="test-verified-$(date +%s)"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "'"$CONV_ID"'",
    "channel": "sms",
    "phone": "'"$YOUR_VERIFIED_NUMBER"'",
    "message": "✅ Test message saved to database!"
  }' \
  --max-time 30 \
  -w "\nHTTP: %{http_code}\n\n" \
  -s

echo ""
echo "=========================================="
echo "Tests Complete!"
echo "=========================================="
echo ""
echo "Check:"
echo "1. Your phone for SMS/WhatsApp messages"
echo "2. n8n Executions tab for workflow logs"
echo "3. Supabase messages table for saved message"
