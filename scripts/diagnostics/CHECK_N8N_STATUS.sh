#!/bin/bash

echo "🔍 Checking n8n webhook status..."
echo ""

URL="https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook"

echo "Testing webhook: $URL"
echo ""

# Test with curl
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"test":"ping"}')

echo "Response code: $RESPONSE"
echo ""

if [ "$RESPONSE" = "404" ]; then
  echo "❌ Webhook NOT active (404)"
  echo ""
  echo "The workflow is not active. To fix:"
  echo "1. Go to https://cwai97.app.n8n.cloud"
  echo "2. Open the workflow"
  echo "3. Click the 'Inactive' toggle to make it 'Active'"
  echo "4. Click 'Save'"
elif [ "$RESPONSE" = "200" ]; then
  echo "✅ Webhook IS active and working!"
  echo ""
  echo "Ready to test appointment booking:"
  echo "  node test-final.js"
elif [ "$RESPONSE" = "500" ]; then
  echo "⚠️  Webhook is active but has errors (500)"
  echo ""
  echo "Check the workflow for configuration issues"
else
  echo "⚠️  Unexpected response: $RESPONSE"
fi

echo ""
