#!/bin/bash

# Test the sync-vapi-config Edge Function
# Replace with your actual VAPI assistant ID and system prompt

SUPABASE_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y"

curl -i -X POST \
  "${SUPABASE_URL}/functions/v1/sync-vapi-config" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "${VITE_VAPI_ASSISTANT_ID:-your-vapi-assistant-id}",
    "system_prompt": "Test prompt",
    "voice_id": "jennifer"
  }'
