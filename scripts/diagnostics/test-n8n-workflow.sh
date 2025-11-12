#!/bin/bash

# Test N8N Workflow - All Intents
# This script tests all three intent paths

N8N_WEBHOOK_URL="http://localhost:5678/webhook/srhcareai-webhook"

echo "=========================================="
echo "Testing N8N Workflow - All Intent Paths"
echo "=========================================="
echo ""

# Test 1: Appointment Intent
echo "Test 1: Appointment Intent"
echo "-------------------------------------------"
curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-appointment-'$(date +%s)'",
    "patientRef": "patient-001",
    "channel": "web",
    "message": "Hello, I need to book an appointment with Dr. Johnson",
    "sentiment": "neutral"
  }'
echo -e "\n✓ Appointment test sent\n"
sleep 2

# Test 2: Emergency Intent
echo "Test 2: Emergency Intent"
echo "-------------------------------------------"
curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-emergency-'$(date +%s)'",
    "patientRef": "patient-002",
    "channel": "voice",
    "message": "This is an emergency! I have severe chest pain and need help immediately",
    "sentiment": "negative"
  }'
echo -e "\n✓ Emergency test sent\n"
sleep 2

# Test 3: General Inquiry Intent
echo "Test 3: General Inquiry Intent"
echo "-------------------------------------------"
curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-general-'$(date +%s)'",
    "patientRef": "patient-003",
    "channel": "web",
    "message": "What are your office hours? I would like to know more about your services.",
    "sentiment": "neutral"
  }'
echo -e "\n✓ General inquiry test sent\n"

echo "=========================================="
echo "All Tests Completed!"
echo "=========================================="
echo ""
echo "Check your N8N dashboard to verify:"
echo "1. All three workflows executed successfully"
echo "2. Each intent routed to the correct path"
echo "3. Data was inserted into Supabase tables"
echo ""
echo "Supabase verification:"
echo "  conversations table: Should have 3 new rows"
echo "  leads table: Should have 3 new rows"
echo ""
