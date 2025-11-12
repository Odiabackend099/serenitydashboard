#!/bin/bash

echo "═══════════════════════════════════════════════════"
echo "  EDGE FUNCTION DIRECT TEST"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Testing Edge Function tool execution directly..."
echo ""

# Calculate tomorrow's date
TOMORROW=$(date -v+1d '+%Y-%m-%d' 2>/dev/null || date -d '+1 day' '+%Y-%m-%d' 2>/dev/null || echo "2025-11-12")

echo "📅 Using date: $TOMORROW"
echo ""

curl -v -X POST https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat \
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
    "mode": "public",
    "stream": false
  }'

echo ""
echo ""
echo "═══════════════════════════════════════════════════"
echo "  Check n8n executions for results:"
echo "  https://cwai97.app.n8n.cloud/executions"
echo "═══════════════════════════════════════════════════"
echo ""
