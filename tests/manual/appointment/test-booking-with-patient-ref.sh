#!/bin/bash

echo "Testing appointment booking with patient_ref fix..."
echo ""
echo "This test verifies:"
echo "1. Edge Function sends patient_ref field to n8n"
echo "2. n8n workflow creates appointment in Supabase"
echo "3. Email is sent to egualesamuel@gmail.com"
echo ""
echo "---"
echo ""

curl -X POST https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.ycMjyuqlTcQkB2VGCd5p1w4kIJ0Zjo0uqjFRj-JiFcg" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Book appointment for tomorrow at 2 PM. Name: Samuel Eguale, Email: egualesamuel@gmail.com, Phone: +1234567890"
      }
    ],
    "model": "llama-3.1-70b-versatile",
    "stream": false
  }'

echo ""
echo ""
echo "---"
echo ""
echo "✅ If successful, you should:"
echo "1. See a success response above"
echo "2. Check n8n executions at https://cwai97.app.n8n.cloud/executions"
echo "3. Receive email at egualesamuel@gmail.com"
echo "4. See appointment in Supabase appointments table"
echo ""
