#!/bin/bash
# Set environment variables in Vercel

echo "Setting Vercel environment variables..."

# Read from .env.local
source apps/web/.env.local

# Set variables
vercel env add VITE_SUPABASE_URL production <<< "$VITE_SUPABASE_URL"
vercel env add VITE_SUPABASE_ANON_KEY production <<< "$VITE_SUPABASE_ANON_KEY"
vercel env add VITE_GROQ_API_KEY production <<< "$VITE_GROQ_API_KEY"
vercel env add VITE_GROQ_MODEL production <<< "$VITE_GROQ_MODEL"
vercel env add VITE_VAPI_ASSISTANT_ID production <<< "$VITE_VAPI_ASSISTANT_ID"
vercel env add VITE_VAPI_PUBLIC_KEY production <<< "$VITE_VAPI_PUBLIC_KEY"
vercel env add VITE_N8N_WEBHOOK_BASE production <<< "$VITE_N8N_WEBHOOK_BASE"

echo "Environment variables set!"
