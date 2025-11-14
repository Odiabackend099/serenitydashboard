#!/bin/bash

# Apply WhatsApp Tables to Supabase
echo "🚀 Creating WhatsApp conversation tracking tables..."

# Execute SQL using Supabase API
curl -X POST "https://yfrpxqvjshwaaomgcaoq.supabase.co/rest/v1/rpc/exec" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.p-iTMEooHf9AlaWZPklBjZq-fV0aiYBY9fq633KQ1vU" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.p-iTMEooHf9AlaWZPklBjZq-fV0aiYBY9fq633KQ1vU" \
  -H "Content-Type: application/json"

echo ""
echo "✅ Tables creation initiated"
echo ""
echo "⚠️  Note: The REST API method may not work for DDL statements."
echo "Please run the SQL manually in Supabase SQL Editor:"
echo "https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/sql"
echo ""
echo "Copy and paste the contents of: create-whatsapp-tables.sql"
