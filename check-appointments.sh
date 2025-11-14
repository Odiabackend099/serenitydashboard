#!/bin/bash

SUPABASE_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.yZSXZr3MvRMnhRlIwb_kZYE8UDq-Kl6khL0MFTRUlRw"

echo "Checking appointments for egualesamuel@gmail.com..."
echo ""

curl -s "${SUPABASE_URL}/rest/v1/appointments?patient_email=eq.egualesamuel@gmail.com&order=created_at.desc&limit=5" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" | jq '.'
