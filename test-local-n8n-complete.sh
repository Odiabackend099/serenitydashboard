#!/bin/bash

set -e

echo "=========================================="
echo "Automated n8n Workflow Test - Local"
echo "=========================================="
echo ""

# Configuration
N8N_URL="http://localhost:5678"
WEBHOOK_PATH="/webhook-test/serenity-webhook-v2"
SUPABASE_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y"

# Check if n8n is running
echo "1. Checking if local n8n is running..."
if curl -s "$N8N_URL" > /dev/null; then
    echo "   ✅ n8n is running at $N8N_URL"
else
    echo "   ❌ n8n is not running at $N8N_URL"
    echo "   Please start n8n with: n8n start"
    exit 1
fi
echo ""

# Test 1: Send Message (WhatsApp)
echo "2. Testing send_message action (WhatsApp + DB save)..."
CONV_ID="test-local-wa-$(date +%s)"
RESPONSE=$(curl -s -X POST "$N8N_URL$WEBHOOK_PATH" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "'"$CONV_ID"'",
    "channel": "whatsapp",
    "phone": "+2348128772405",
    "message": "Local n8n test - WhatsApp message"
  }' \
  -w "\n%{http_code}" \
  --max-time 30)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ HTTP 200 - Request successful"
    echo "   Response: $BODY"
else
    echo "   ❌ HTTP $HTTP_CODE - Request failed"
    echo "   Response: $BODY"
fi
echo ""

sleep 2

# Test 2: Send Message (SMS)
echo "3. Testing send_message action (SMS + DB save)..."
CONV_ID="test-local-sms-$(date +%s)"
RESPONSE=$(curl -s -X POST "$N8N_URL$WEBHOOK_PATH" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "'"$CONV_ID"'",
    "channel": "sms",
    "phone": "+18777804236",
    "message": "Local n8n test - SMS message"
  }' \
  -w "\n%{http_code}" \
  --max-time 30)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ HTTP 200 - Request successful"
    echo "   Response: $BODY"
else
    echo "   ❌ HTTP $HTTP_CODE - Request failed"
    echo "   Response: $BODY"
fi
echo ""

sleep 2

# Test 3: Book Appointment
echo "4. Testing book_appointment action..."
CONV_ID="test-local-apt-$(date +%s)"
RESPONSE=$(curl -s -X POST "$N8N_URL$WEBHOOK_PATH" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "conversation_id": "'"$CONV_ID"'",
    "patient_ref": "+18777804236",
    "patient_name": "Local Test Patient",
    "patient_email": "localtest@example.com",
    "patient_phone": "+18777804236",
    "appointment_date": "2025-11-30",
    "appointment_time": "16:00:00",
    "appointment_type": "consultation",
    "reason": "Local n8n workflow test"
  }' \
  -w "\n%{http_code}" \
  --max-time 30)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ HTTP 200 - Request successful"
    echo "   Response: $BODY"
else
    echo "   ❌ HTTP $HTTP_CODE - Request failed"
    echo "   Response: $BODY"
fi
echo ""

sleep 3

# Verify database records
echo "5. Verifying database records..."
echo ""

# Check messages
echo "   Checking messages table..."
MESSAGES=$(curl -s "$SUPABASE_URL/rest/v1/messages?order=created_at.desc&limit=5&select=conversation_id,body,from_type,created_at" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

MESSAGE_COUNT=$(echo "$MESSAGES" | grep -o "test-local" | wc -l | tr -d ' ')

if [ "$MESSAGE_COUNT" -gt "0" ]; then
    echo "   ✅ Found $MESSAGE_COUNT test message(s) in database"
    echo "$MESSAGES" | jq -r '.[] | select(.conversation_id | contains("test-local")) | "      - \(.conversation_id): \(.body[0:50])..."' 2>/dev/null || echo "$MESSAGES"
else
    echo "   ❌ No test messages found in database"
    echo "   Recent messages:"
    echo "$MESSAGES" | jq -r '.[] | "      - \(.conversation_id): \(.body[0:50])..."' 2>/dev/null || echo "$MESSAGES"
fi
echo ""

# Check appointments
echo "   Checking appointments table..."
APPOINTMENTS=$(curl -s "$SUPABASE_URL/rest/v1/appointments?order=created_at.desc&limit=5&select=conversation_id,patient_name,appointment_date,appointment_time,reason,created_at" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

APT_COUNT=$(echo "$APPOINTMENTS" | grep -o "test-local" | wc -l | tr -d ' ')

if [ "$APT_COUNT" -gt "0" ]; then
    echo "   ✅ Found $APT_COUNT test appointment(s) in database"
    echo "$APPOINTMENTS" | jq -r '.[] | select(.conversation_id | contains("test-local")) | "      - \(.patient_name) on \(.appointment_date) at \(.appointment_time)"' 2>/dev/null || echo "$APPOINTMENTS"
else
    echo "   ❌ No test appointments found in database"
    echo "   Recent appointments:"
    echo "$APPOINTMENTS" | jq -r '.[] | "      - \(.patient_name) on \(.appointment_date) at \(.appointment_time)"' 2>/dev/null || echo "$APPOINTMENTS"
fi
echo ""

echo "=========================================="
echo "Test Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Tests sent to: $N8N_URL$WEBHOOK_PATH"
echo "- Database checked: $SUPABASE_URL"
echo ""
echo "If you see ❌ for database records:"
echo "1. Check n8n executions at: $N8N_URL/executions"
echo "2. Look for red error nodes"
echo "3. Verify Supabase credentials are configured"
echo ""
