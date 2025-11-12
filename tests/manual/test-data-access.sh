#!/bin/bash

# SIMPLE WEBHOOK DATA ACCESS TEST
# Tests different data access patterns in n8n

echo "🔍 TESTING WEBHOOK DATA ACCESS PATTERNS"
echo "======================================="
echo ""

# Test 1: Simple payload with items[0].json access
echo "🎯 Test 1: Simple payload"
curl -s -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "patientEmail": "test@example.com", "patientName": "Test User"}' | jq .

echo ""
echo "🎯 Test 2: Alternative field names"
curl -s -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{"patient_email": "test@example.com", "patient_name": "Test User", "action": "create"}' | jq .

echo ""
echo "🎯 Test 3: Minimal valid payload"
curl -s -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}' | jq .

echo ""
echo "🎯 Test 4: Empty payload"
curl -s -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

echo ""
echo "✅ All tests completed"