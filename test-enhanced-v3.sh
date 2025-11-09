#!/bin/bash

# Test script for ENHANCED_N8N_WORKFLOW.json
# After importing, change the webhook path to serenity-webhook-v3
# This creates a separate endpoint for testing the new workflow

echo "========================================"
echo "ENHANCED Workflow Test (v3 endpoint)"
echo "========================================"
echo ""

WEBHOOK_URL="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v3"
TEST_EMAIL="egualesamuel@gmail.com"
TEST_NAME="Samuel Eguale"

echo "Testing NEW workflow endpoint: $WEBHOOK_URL"
echo "Target email: $TEST_EMAIL"
echo ""

# Test appointment booking
echo "Sending test appointment booking..."
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+1234567890",
    "appointmentDate": "2025-02-20",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "Testing ENHANCED workflow with v3 endpoint",
    "actionType": "create",
    "source": "enhanced_workflow_test"
  }')

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $http_status"
echo ""

if [ "$http_status" = "200" ]; then
    echo "✅ SUCCESS! Workflow triggered"
    echo ""
    echo "📧 Check email at: $TEST_EMAIL"
    echo ""
    echo "🔍 VERIFY IN N8N:"
    echo "1. Go to: https://cwai97.app.n8n.cloud"
    echo "2. Click 'Executions' tab"
    echo "3. Find latest execution"
    echo "4. Check the INPUT section shows:"
    echo "   - patientEmail: egualesamuel@gmail.com ✅"
    echo "   - patientName: Samuel Eguale ✅"
    echo ""
    echo "❌ If it shows:"
    echo "   - patientEmail: noreply@serenityroyalehospital.com"
    echo "   - patientName: Unknown"
    echo "   → You have the WRONG workflow!"
    echo ""
else
    echo "❌ ERROR! Status: $http_status"
    echo ""
    echo "Response:"
    echo "$response_body"
    echo ""
    echo "Troubleshooting:"
    echo "1. Did you import ENHANCED_N8N_WORKFLOW.json?"
    echo "2. Did you change webhook path to 'serenity-webhook-v3'?"
    echo "3. Did you configure Gmail OAuth on all email nodes?"
    echo "4. Is the workflow ACTIVE (toggle ON)?"
fi

echo ""
echo "========================================"
