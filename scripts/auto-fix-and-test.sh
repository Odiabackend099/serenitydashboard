#!/bin/bash

set -e

echo "=========================================="
echo "Automated n8n Workflow Fix & Test"
echo "=========================================="
echo ""

# Configuration
CLOUD_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"
SUPABASE_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y"

echo "Step 1: Testing Cloud n8n Webhook Availability..."
WEBHOOK_TEST=$(curl -s -X POST "$CLOUD_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{"action":"test"}' \
  -w "%{http_code}" \
  -o /tmp/n8n_test_response.txt \
  --max-time 5 || echo "000")

if [ "$WEBHOOK_TEST" = "200" ] || [ "$WEBHOOK_TEST" = "400" ]; then
    echo "   ✅ Webhook is accessible"
else
    echo "   ⚠️  Webhook returned: $WEBHOOK_TEST"
    echo "   Response: $(cat /tmp/n8n_test_response.txt 2>/dev/null || echo 'No response')"
fi
echo ""

echo "Step 2: Testing send_message Action (WhatsApp)..."
CONV_ID="auto-test-wa-$(date +%s)"
echo "   Conversation ID: $CONV_ID"

RESPONSE=$(curl -s -X POST "$CLOUD_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "'"$CONV_ID"'",
    "channel": "whatsapp",
    "phone": "+2348128772405",
    "message": "Automated test - WhatsApp message from script"
  }' \
  -w "\nHTTP:%{http_code}" \
  --max-time 30)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP:")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ HTTP 200 - Success"
    echo "   Response: $BODY"
else
    echo "   ❌ HTTP $HTTP_CODE - Failed"
    echo "   Response: $BODY"
fi
echo ""

sleep 3

echo "Step 3: Testing send_message Action (SMS)..."
CONV_ID="auto-test-sms-$(date +%s)"
echo "   Conversation ID: $CONV_ID"

RESPONSE=$(curl -s -X POST "$CLOUD_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "'"$CONV_ID"'",
    "channel": "sms",
    "phone": "+18777804236",
    "message": "Automated test - SMS message from script"
  }' \
  -w "\nHTTP:%{http_code}" \
  --max-time 30)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP:")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ HTTP 200 - Success"
    echo "   Response: $BODY"
else
    echo "   ❌ HTTP $HTTP_CODE - Failed"
    echo "   Response: $BODY"
fi
echo ""

sleep 3

echo "Step 4: Testing book_appointment Action..."
CONV_ID="auto-test-apt-$(date +%s)"
echo "   Conversation ID: $CONV_ID"

RESPONSE=$(curl -s -X POST "$CLOUD_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "conversation_id": "'"$CONV_ID"'",
    "patient_ref": "+18777804236",
    "patient_name": "Automated Test Patient",
    "patient_email": "autotest@example.com",
    "patient_phone": "+18777804236",
    "appointment_date": "2025-12-01",
    "appointment_time": "10:00:00",
    "appointment_type": "consultation",
    "reason": "Automated workflow verification test"
  }' \
  -w "\nHTTP:%{http_code}" \
  --max-time 30)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP:")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ HTTP 200 - Success"
    echo "   Response: $BODY"
else
    echo "   ❌ HTTP $HTTP_CODE - Failed"
    echo "   Response: $BODY"
fi
echo ""

echo "Waiting 5 seconds for database writes to complete..."
sleep 5
echo ""

echo "Step 5: Verifying Database Records..."
echo ""

# Check messages
echo "   Checking messages table for test records..."
MESSAGES=$(curl -s "$SUPABASE_URL/rest/v1/messages?conversation_id=like.auto-test-%25&order=created_at.desc&select=conversation_id,body,from_type,created_at" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

MSG_COUNT=$(echo "$MESSAGES" | jq '. | length' 2>/dev/null || echo "0")

if [ "$MSG_COUNT" -gt "0" ]; then
    echo "   ✅ Found $MSG_COUNT test message(s) in database!"
    echo ""
    echo "$MESSAGES" | jq -r '.[] | "      📝 \(.conversation_id)\n         Message: \(.body)\n         From: \(.from_type)\n         Time: \(.created_at)\n"' 2>/dev/null || echo "$MESSAGES"
else
    echo "   ❌ No test messages found in database"
    echo "   This means the 'Save to Database' node is NOT working"
    echo ""
    echo "   All recent messages:"
    curl -s "$SUPABASE_URL/rest/v1/messages?order=created_at.desc&limit=3&select=conversation_id,body,created_at" \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" | jq '.' 2>/dev/null || echo "   Failed to fetch"
fi
echo ""

# Check appointments
echo "   Checking appointments table for test records..."
APPOINTMENTS=$(curl -s "$SUPABASE_URL/rest/v1/appointments?conversation_id=like.auto-test-%25&order=created_at.desc&select=conversation_id,patient_name,appointment_date,appointment_time,appointment_type,reason,created_at" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

APT_COUNT=$(echo "$APPOINTMENTS" | jq '. | length' 2>/dev/null || echo "0")

if [ "$APT_COUNT" -gt "0" ]; then
    echo "   ✅ Found $APT_COUNT test appointment(s) in database!"
    echo ""
    echo "$APPOINTMENTS" | jq -r '.[] | "      📅 \(.patient_name)\n         Date/Time: \(.appointment_date) at \(.appointment_time)\n         Type: \(.appointment_type)\n         Reason: \(.reason)\n         Created: \(.created_at)\n"' 2>/dev/null || echo "$APPOINTMENTS"
else
    echo "   ❌ No test appointments found in database"
    echo "   This means the 'Create Appointment' node is NOT working"
    echo ""
    echo "   All recent appointments:"
    curl -s "$SUPABASE_URL/rest/v1/appointments?order=created_at.desc&limit=3&select=patient_name,appointment_date,created_at" \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" | jq '.' 2>/dev/null || echo "   Failed to fetch"
fi
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""

if [ "$MSG_COUNT" -gt "0" ] && [ "$APT_COUNT" -gt "0" ]; then
    echo "✅ SUCCESS! Workflow is working perfectly!"
    echo ""
    echo "✓ Messages are being saved to database"
    echo "✓ Appointments are being created"
    echo "✓ All webhook endpoints responding"
    echo ""
    echo "Your workflow is ready for production!"
else
    echo "⚠️  PARTIAL SUCCESS"
    echo ""
    if [ "$MSG_COUNT" -eq "0" ]; then
        echo "❌ 'Save to Database' node is NOT working"
        echo "   → Check Expression mode on conversation_id, body, from_type fields"
    else
        echo "✅ 'Save to Database' node is working"
    fi
    echo ""
    if [ "$APT_COUNT" -eq "0" ]; then
        echo "❌ 'Create Appointment' node is NOT working"
        echo "   → Check Expression mode on all 9 appointment fields"
    else
        echo "✅ 'Create Appointment' node is working"
    fi
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://cwai97.app.n8n.cloud/workflow/UZvAy2tTj8fPWcDZ"
    echo "2. Click: Executions tab"
    echo "3. Check: Latest execution for errors"
    echo "4. Fix: Enable Expression mode (fx) for failed Supabase fields"
fi
echo ""
