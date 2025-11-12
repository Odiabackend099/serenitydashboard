#!/bin/bash

# Direct test to the OLD working webhook (srhcareai-webhook)
# This one we KNOW works because it sent emails before

echo "Testing OLD webhook that previously worked..."

curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Book appointment for testing",
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+1234567890",
    "appointmentDate": "2025-11-25",
    "appointmentTime": "2:00 PM",
    "appointmentReason": "Testing old workflow",
    "source": "direct_test"
  }'

echo ""
echo ""
echo "Check egualesamuel@gmail.com for confirmation email"
