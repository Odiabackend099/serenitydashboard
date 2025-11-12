#!/bin/bash

# Test Complete n8n Workflow
# Tests all actions: send_whatsapp, send_sms, send_email, send_message, book_appointment

N8N_WEBHOOK="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"

echo "=========================================="
echo "Testing Serenity n8n Workflow"
echo "=========================================="
echo ""

# Test 1: Send WhatsApp
echo "Test 1: Send WhatsApp Message"
echo "----------------------------------------"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_whatsapp",
    "phone": "+1234567890",
    "message": "Test WhatsApp from n8n workflow"
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

sleep 2

# Test 2: Send SMS
echo "Test 2: Send SMS Message"
echo "----------------------------------------"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_sms",
    "phone": "+1234567890",
    "message": "Test SMS from n8n workflow"
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

sleep 2

# Test 3: Send Email
echo "Test 3: Send Email"
echo "----------------------------------------"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_email",
    "email": "test@example.com",
    "subject": "Test Email from n8n",
    "message": "This is a test email sent through the n8n workflow"
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

sleep 2

# Test 4: Send Message (with database save)
echo "Test 4: Send Message with Database Save - WhatsApp Channel"
echo "----------------------------------------"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "test-conv-whatsapp-001",
    "channel": "whatsapp",
    "phone": "+1234567890",
    "message": "Testing message save to database (WhatsApp)"
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

sleep 2

# Test 5: Send Message - SMS Channel
echo "Test 5: Send Message with Database Save - SMS Channel"
echo "----------------------------------------"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "test-conv-sms-001",
    "channel": "sms",
    "phone": "+1234567890",
    "message": "Testing message save to database (SMS)"
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

sleep 2

# Test 6: Book Appointment
echo "Test 6: Book Appointment"
echo "----------------------------------------"
curl -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "conversation_id": "test-conv-appointment-001",
    "patient_ref": "+1234567890",
    "patient_name": "Jane Smith",
    "patient_email": "jane.smith@example.com",
    "patient_phone": "+1234567890",
    "appointment_date": "2025-11-20",
    "appointment_time": "10:00:00",
    "appointment_type": "consultation",
    "reason": "Annual checkup and consultation"
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "=========================================="
echo "All tests completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check n8n Executions tab to see if all workflows ran successfully"
echo "2. Check Supabase messages table for the 2 saved messages"
echo "3. Check Supabase appointments table for the appointment"
echo "4. Check if SMS/Email were sent (if credentials are configured)"
echo ""
