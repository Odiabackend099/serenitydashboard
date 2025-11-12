#!/bin/bash

# Set N8N_WEBHOOK_BASE for groq-chat Edge Function
echo "Setting N8N_WEBHOOK_BASE secret..."

# You need to run this command manually in Supabase dashboard or use Supabase CLI
# Go to: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/settings/functions

echo "=========================================="
echo "CRITICAL: You must set this secret in Supabase Dashboard:"
echo "=========================================="
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/settings/functions"
echo "2. Click on 'Edge Functions' → 'Secrets'"
echo "3. Add new secret:"
echo "   Name:  N8N_WEBHOOK_BASE"
echo "   Value: https://cwai97.app.n8n.cloud/webhook"
echo ""
echo "4. Save and redeploy the groq-chat function"
echo "=========================================="
