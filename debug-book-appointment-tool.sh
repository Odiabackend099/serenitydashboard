#!/bin/bash

echo "Testing book_appointment_with_confirmation tool..."

curl -s -X POST "https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  --data-binary @- <<'EOF'
{
  "messages": [
    {
      "role": "user",
      "content": "Book appointment tomorrow 2pm for Samuel, email: egualesamuel@gmail.com"
    }
  ],
  "model": "llama-3.1-8b-instant",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "book_appointment_with_confirmation",
        "description": "Book an appointment",
        "parameters": {
          "type": "object",
          "properties": {
            "name": {"type": "string"},
            "email": {"type": "string"},
            "date": {"type": "string"},
            "time": {"type": "string"}
          },
          "required": ["name", "email"]
        }
      }
    }
  ],
  "max_tokens": 500
}
EOF
