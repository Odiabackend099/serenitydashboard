#!/bin/bash

echo "=========================================="
echo "END-TO-END APPOINTMENT BOOKING TEST"
echo "=========================================="
echo ""
echo "Testing full appointment booking flow with trigger_automation tool..."
echo ""

curl -X POST "https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I need to book an appointment for tomorrow at 2pm. My name is Samuel Eguale, email: egualesamuel@gmail.com, phone: +1-555-0123, reason: General checkup"
      }
    ],
    "model": "llama-3.3-70b-versatile",
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "trigger_automation",
          "description": "Trigger an n8n automation workflow for booking appointments, sending emails, etc.",
          "parameters": {
            "type": "object",
            "properties": {
              "action": {
                "type": "string",
                "enum": ["book_appointment", "send_email", "send_sms", "update_patient"],
                "description": "The automation action to trigger"
              },
              "payload": {
                "type": "object",
                "description": "Data for the automation"
              }
            },
            "required": ["action", "payload"]
          }
        }
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }' \
  --max-time 60

echo ""
echo ""
echo "=========================================="
echo "Test complete!"
echo "Check above for:"
echo "1. AI should detect appointment booking intent"
echo "2. AI should call trigger_automation tool"
echo "3. n8n webhook should be triggered"
echo "4. Email should be sent to egualesamuel@gmail.com"
echo "=========================================="
