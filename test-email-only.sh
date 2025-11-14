#!/bin/bash

# Quick Email Test - Direct N8N

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"

echo "=========================================="
echo -e "${CYAN}📧 Quick Email Test${NC}"
echo "=========================================="
echo ""

# Test sending a simple email
EMAIL_PAYLOAD='{
  "action": "send_email",
  "body": {
    "action": "send_email",
    "email": "egualesamuel@gmail.com",
    "subject": "🧪 Test Email from N8N Workflow",
    "message": "This is a test email to verify Gmail integration is working.\n\nIf you receive this, the workflow is successfully sending emails!\n\nTimestamp: '"$(date)"'"
  }
}'

echo "Sending test email to: egualesamuel@gmail.com"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$EMAIL_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response Code: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo -e "${GREEN}✅ Webhook executed successfully!${NC}"
  echo ""
  echo "Now check:"
  echo "1. Email: egualesamuel@gmail.com (inbox & spam)"
  echo "2. N8N Execution logs: https://cwai97.app.n8n.cloud/workflow/UZvAy2tTj8fPWcDZ/executions"
  echo ""
  echo "If no email received:"
  echo "• Check Gmail credential in N8N (needs re-authentication?)"
  echo "• Check Gmail node execution logs for errors"
  echo "• Verify Gmail API quota not exceeded"
else
  echo -e "${RED}❌ Webhook failed (HTTP $HTTP_CODE)${NC}"
  echo ""
  echo "Check:"
  echo "• Workflow is Active (toggle ON)"
  echo "• Webhook path is correct: /serenity-webhook-v2"
fi

echo ""
echo "=========================================="
echo -e "${CYAN}Check N8N Execution:${NC}"
echo "https://cwai97.app.n8n.cloud/workflow/UZvAy2tTj8fPWcDZ/executions"
echo "=========================================="
