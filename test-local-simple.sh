#!/bin/bash

echo "=========================================="
echo "Testing Local n8n Workflow"
echo "=========================================="
echo ""

N8N_URL="http://localhost:5678"
WEBHOOK_PATH="/webhook-test/serenity-webhook-v2"

# Test 1
echo "Test 1: Send Message (WhatsApp)"
curl -X POST "$N8N_URL$WEBHOOK_PATH" \
  -H "Content-Type: application/json" \
  -d '{"action":"send_message","conversation_id":"test-wa-'$(date +%s)'","channel":"whatsapp","phone":"+2348128772405","message":"Test WhatsApp"}' \
  --max-time 10 \
  2>&1 | head -20
echo ""
echo ""

sleep 2

# Test 2
echo "Test 2: Send Message (SMS)"
curl -X POST "$N8N_URL$WEBHOOK_PATH" \
  -H "Content-Type: application/json" \
  -d '{"action":"send_message","conversation_id":"test-sms-'$(date +%s)'","channel":"sms","phone":"+18777804236","message":"Test SMS"}' \
  --max-time 10 \
  2>&1 | head -20
echo ""
echo ""

sleep 2

# Test 3
echo "Test 3: Book Appointment"
curl -X POST "$N8N_URL$WEBHOOK_PATH" \
  -H "Content-Type: application/json" \
  -d '{"action":"book_appointment","conversation_id":"test-apt-'$(date +%s)'","patient_ref":"+18777804236","patient_name":"Test","patient_email":"test@test.com","patient_phone":"+18777804236","appointment_date":"2025-11-30","appointment_time":"16:00:00","appointment_type":"consultation","reason":"Test"}' \
  --max-time 10 \
  2>&1 | head -20
echo ""
echo ""

echo "=========================================="
echo "Now checking database..."
echo "=========================================="

node "/Users/odiadev/Desktop/serenity dasboard/check-recent-records.js"
