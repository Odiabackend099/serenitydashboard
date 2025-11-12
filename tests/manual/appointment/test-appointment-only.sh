#!/bin/bash

# Test appointment booking (database only, no Twilio)

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"

echo "=========================================="
echo "Testing Appointment Booking"
echo "=========================================="
echo ""
echo "This test creates an appointment in the database."
echo "It will SKIP sending SMS/Email to avoid Twilio trial limits."
echo ""

# Create a unique conversation ID
CONV_ID="test-apt-$(date +%s)"

echo "Sending appointment booking request..."
echo "Conversation ID: $CONV_ID"
echo ""

curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "conversation_id": "'"$CONV_ID"'",
    "patient_ref": "+12526453035",
    "patient_name": "Test Patient",
    "patient_email": "test@example.com",
    "patient_phone": "+12526453035",
    "appointment_date": "2025-11-20",
    "appointment_time": "14:30:00",
    "appointment_type": "consultation",
    "reason": "Test appointment from workflow"
  }' \
  --max-time 45 \
  -v 2>&1

echo ""
echo ""
echo "=========================================="
echo "Check the n8n Executions tab for details!"
echo "=========================================="
