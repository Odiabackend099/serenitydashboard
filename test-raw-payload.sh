#!/bin/bash

echo "Testing raw payload reception..."

# Test with a simple echo payload to see what the webhook receives
echo -e "\n🧪 Test: Raw payload debug"
curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "debug": true,
    "test": "raw payload",
    "patientEmail": "debug@example.com",
    "patientName": "Debug User"
  }' -s | jq .

echo -e "\n🧪 Test: Empty object"
curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{}' -s | jq .

echo -e "\n🧪 Test: Array payload"
curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '[{"patientEmail": "array@example.com", "patientName": "Array User"}]' -s | jq .