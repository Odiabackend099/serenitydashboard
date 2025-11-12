#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   FINAL PRODUCTION TEST - Complete End-to-End Flow      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Calculate tomorrow's date
TOMORROW=$(date -v+1d '+%Y-%m-%d' 2>/dev/null || date -d '+1 day' '+%Y-%m-%d' 2>/dev/null || echo "2025-11-12")
TODAY=$(date '+%Y-%m-%d')

echo "📅 Today: $TODAY"
echo "📅 Tomorrow: $TOMORROW"
echo ""
echo "🧪 This test will:"
echo "   1. Send booking request to Edge Function WITH tools array"
echo "   2. Edge Function will call Groq AI with tools"
echo "   3. Groq AI will call book_appointment_with_confirmation tool"
echo "   4. Edge Function will execute tool → calls n8n webhook"
echo "   5. n8n creates appointment in Supabase"
echo "   6. n8n sends confirmation email"
echo ""
echo "───────────────────────────────────────────────────────────"
echo ""

curl -s -X POST https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Book appointment for '"$TOMORROW"' at 2 PM. Name: Samuel Eguale, Email: egualesamuel@gmail.com, Phone: +1234567890"
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "book_appointment_with_confirmation",
          "description": "Book an appointment for a patient and send confirmation email",
          "parameters": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "Patient full name"
              },
              "email": {
                "type": "string",
                "description": "Patient email address"
              },
              "phone": {
                "type": "string",
                "description": "Patient phone number"
              },
              "date": {
                "type": "string",
                "description": "Appointment date in YYYY-MM-DD format. Today is '"$TODAY"'"
              },
              "time": {
                "type": "string",
                "description": "Appointment time in 12-hour format with AM/PM"
              },
              "reason": {
                "type": "string",
                "description": "Reason for appointment"
              }
            },
            "required": ["name", "email", "date", "time"]
          }
        }
      }
    ],
    "tool_choice": "auto",
    "model": "llama-3.1-70b-versatile"
  }' | python3 -m json.tool

echo ""
echo ""
echo "───────────────────────────────────────────────────────────"
echo ""
echo "✅ VERIFICATION CHECKLIST:"
echo ""
echo "1. Check n8n Executions:"
echo "   👉 https://cwai97.app.n8n.cloud/executions"
echo "   Expected: Latest execution shows GREEN"
echo ""
echo "2. Verify Workflow Nodes:"
echo "   ✅ Webhook Trigger → received request"
echo "   ✅ Route by Action → routed to 'book_appointment'"
echo "   ✅ Create Appointment → inserted into Supabase"
echo "   ✅ Send Appointment Email → sent via Gmail"
echo ""
echo "3. Check Email:"
echo "   👉 egualesamuel@gmail.com"
echo "   Expected: Appointment confirmation with details"
echo ""
echo "4. Check Database:"
echo "   👉 Supabase → appointments table"
echo "   Expected: New record with patient_ref='egualesamuel@gmail.com'"
echo ""
echo "5. Response Above Should Show:"
echo "   ✅ tool_calls with book_appointment_with_confirmation"
echo "   ✅ Success message in AI response"
echo ""
echo "───────────────────────────────────────────────────────────"
echo ""
echo "🎯 If all green: SYSTEM IS PRODUCTION READY ✅"
echo ""
