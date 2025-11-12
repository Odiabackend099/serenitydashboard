#!/bin/bash

echo "=========================================="
echo "Testing All n8n Webhook Endpoints"
echo "=========================================="
echo ""

BASE_URL="https://cwai97.app.n8n.cloud/webhook"
TEST_DATA='{
  "patientName": "Samuel Eguale",
  "patientEmail": "egualesamuel@gmail.com",
  "patientPhone": "+1234567890",
  "appointmentDate": "2025-02-20",
  "appointmentTime": "10:00 AM",
  "appointmentReason": "Testing endpoint",
  "actionType": "create"
}'

# Test v2 endpoint
echo "1. Testing /serenity-webhook-v2"
echo "--------------------------------------"
response=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$BASE_URL/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" 2>&1)

http_code=$(echo "$response" | grep "HTTP:" | cut -d: -f2)
if [ "$http_code" = "200" ]; then
    echo "✅ Status: 200 - Webhook is ACTIVE"
elif [ "$http_code" = "404" ]; then
    echo "❌ Status: 404 - Webhook NOT FOUND (workflow not active or doesn't exist)"
else
    echo "⚠️  Status: $http_code"
fi
echo ""

# Test v3 endpoint
echo "2. Testing /serenity-webhook-v2 (duplicate test for consistency)"
echo "--------------------------------------"
response=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$BASE_URL/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" 2>&1)

http_code=$(echo "$response" | grep "HTTP:" | cut -d: -f2)
if [ "$http_code" = "200" ]; then
    echo "✅ Status: 200 - Webhook is ACTIVE"
elif [ "$http_code" = "404" ]; then
    echo "❌ Status: 404 - Webhook NOT FOUND (workflow not active or doesn't exist)"
else
    echo "⚠️  Status: $http_code"
fi
echo ""

# Test old endpoint
echo "3. Testing /serenity-webhook (old)"
echo "--------------------------------------"
response=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$BASE_URL/serenity-webhook" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" 2>&1)

http_code=$(echo "$response" | grep "HTTP:" | cut -d: -f2)
if [ "$http_code" = "200" ]; then
    echo "✅ Status: 200 - Webhook is ACTIVE"
elif [ "$http_code" = "404" ]; then
    echo "❌ Status: 404 - Webhook NOT FOUND (workflow not active or doesn't exist)"
else
    echo "⚠️  Status: $http_code"
fi
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "1. Go to: https://cwai97.app.n8n.cloud"
echo "2. Check which workflows are ACTIVE (toggle should be ON/green)"
echo "3. Import ENHANCED_N8N_WORKFLOW.json if needed"
echo "4. Make sure at least one workflow is active"
echo ""
echo "Expected: At least one endpoint should return 200"
echo ""
