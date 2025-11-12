#!/bin/bash

# Simple workflow test - Tests database save only (no Twilio trial limits)

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"

echo "=========================================="
echo "Testing n8n Workflow - Database Operations"
echo "=========================================="
echo ""

# Test: Send Message with Database Save
echo "Test: Send Message (will save to database)"
echo "----------------------------------------"
echo "Sending request..."

response=$(curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{"action":"send_message","conversation_id":"test-conv-'$(date +%s)'","channel":"whatsapp","phone":"+12526453035","message":"Test message from workflow - '$(date)'"}' \
  --max-time 30 \
  -w "\n%{http_code}" \
  -s)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo "HTTP Status: $http_code"
echo "Response: $body"
echo ""

if [ "$http_code" = "200" ]; then
  echo "✅ Workflow executed successfully!"
else
  echo "❌ Workflow failed with status $http_code"
fi

echo ""
echo "Next: Check n8n Executions tab to see detailed logs"
