#!/bin/bash

# Replace YOUR_N8N_URL with your actual n8n instance URL
# Example: `https://your-instance.n8n.cloud`  or http://localhost:5678
N8N_URL="YOUR_N8N_URL"

echo "=== Testing Digital AI Assistant Workflow ==="
echo ""

# Test 1: Create New Appointment
echo "Test 1: Creating new appointment..."
curl -X POST "${N8N_URL}/webhook/digital-ai-assistant" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "create",
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+234-xxx-xxxx",
    "appointmentDate": "2025-12-15",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "Annual checkup and health screening"
  }'
echo -e "\n\n"

# Test 2: Reschedule Appointment
echo "Test 2: Rescheduling appointment..."
curl -X POST "${N8N_URL}/webhook/digital-ai-assistant" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "reschedule",
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "previousDate": "2025-12-15",
    "previousTime": "10:00 AM",
    "appointmentDate": "2025-12-20",
    "appointmentTime": "2:00 PM",
    "appointmentReason": "Follow-up consultation"
  }'
echo -e "\n\n"

# Test 3: Cancel Appointment
echo "Test 3: Cancelling appointment..."
curl -X POST "${N8N_URL}/webhook/digital-ai-assistant" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "cancel",
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "appointmentDate": "2025-12-20",
    "appointmentTime": "2:00 PM"
  }'
echo -e "\n\n"

echo "=== Tests Complete ==="
echo "Check egualesamuel@gmail.com for the confirmation emails!"