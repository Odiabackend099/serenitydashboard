#!/bin/bash

echo "Testing groq-chat Edge Function..."
echo ""

curl -X POST "https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello, just testing"}],
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.7,
    "max_tokens": 100
  }' \
  --max-time 30

echo ""
echo ""
echo "If you see a response above (not an error), the function is working!"
