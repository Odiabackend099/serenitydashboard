#!/bin/bash

# Diagnose N8N Webhook Errors

WEBHOOK_URL="https://cwai97.app.n8n.cloud/webhook/srhcareai-webhook"

echo "=========================================="
echo "Diagnosing N8N Webhook Errors"
echo "=========================================="
echo ""

# Test 1: Simple General Inquiry
echo "Test 1: GENERAL INQUIRY (Simple)"
echo "----------------------------------------"
curl -v -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "patientRef": "patient-001",
    "channel": "web",
    "message": "Hello",
    "intent": "general"
  }' 2>&1 | tee /tmp/test1-output.txt

echo ""
echo ""
echo "Full response saved to: /tmp/test1-output.txt"
echo ""

# Extract just the response body
echo "Response Body:"
grep -A 100 "^{" /tmp/test1-output.txt || echo "No JSON response found"

echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Check N8N execution logs at:"
echo "   https://cwai97.app.n8n.cloud/workflow/executions"
echo ""
echo "2. Look for the most recent execution"
echo ""
echo "3. Common HTTP 500 causes:"
echo "   - Supabase credential issue"
echo "   - Missing table/column in database"
echo "   - Code node error"
echo "   - Gmail OAuth not configured"
echo ""
echo "4. Check specific error in N8N logs"

