#!/bin/bash

# Test the sync-vapi-config Edge Function
# Replace with your actual VAPI assistant ID and system prompt

# Check if SUPABASE_ANON_KEY is set
if [ -z "$SUPABASE_ANON_KEY" ] || [ "$SUPABASE_ANON_KEY" = "your_anon_key_here" ]; then
  echo "❌ Error: SUPABASE_ANON_KEY environment variable is required"
  echo "Usage:"
  echo "  SUPABASE_ANON_KEY=your_anon_key_here ./test-vapi-sync.sh"
  exit 1
fi

SUPABASE_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co"

curl -i -X POST \
  "${SUPABASE_URL}/functions/v1/sync-vapi-config" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "${VITE_VAPI_ASSISTANT_ID:-your-vapi-assistant-id}",
    "system_prompt": "Test prompt",
    "voice_id": "jennifer"
  }'
