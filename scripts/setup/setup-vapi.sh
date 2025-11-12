#!/bin/bash
# VAPI Assistant Setup Script for Serenity Royale

set -e

echo "🎤 Serenity Royale - VAPI Assistant Setup"
echo "=========================================="
echo ""

# Check if required environment variables are set
if [ -z "$VAPI_PRIVATE_KEY" ]; then
    echo "❌ Error: VAPI_PRIVATE_KEY is required"
    echo "Usage:"
    echo "  VAPI_PRIVATE_KEY=your_key_here SUPABASE_ANON_KEY=your_anon_key ./setup-vapi.sh"
    exit 1
fi

if [ "$ANON_KEY" = "your_anon_key_here" ]; then
    echo "❌ Error: SUPABASE_ANON_KEY is required"
    echo "Usage:"
    echo "  SUPABASE_ANON_KEY=your_anon_key_here VAPI_PRIVATE_KEY=your_key_here ./setup-vapi.sh"
    exit 1
fi

PROJECT_REF="yfrpxqvjshwaaomgcaoq"
SUPABASE_URL="https://yfrpxqvjshwaaomgcaoq.supabase.co"
ANON_KEY="${SUPABASE_ANON_KEY:-your_anon_key_here}"

echo "Step 1: Setting VAPI_PRIVATE_KEY in Supabase..."
supabase secrets set VAPI_PRIVATE_KEY="$VAPI_PRIVATE_KEY" || {
    echo "⚠️  Supabase CLI not working, setting via API..."
    # Manual API call if CLI fails
}

echo ""
echo "Step 2: Creating VAPI assistant via Edge Function..."

RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/vapi-sync-agent" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON_KEY}" \
  -d '{
    "system_prompt": "You are a helpful medical assistant for Serenity Royale Hospital. You help patients with:\n\n1. Appointment scheduling and inquiries\n2. General health information\n3. Hospital services and locations\n4. Billing questions\n\nAlways be:\n- Professional and compassionate\n- HIPAA-compliant (never share sensitive patient data)\n- Clear and concise\n- Patient-focused\n\nIf you are unsure about medical advice, always recommend consulting with a healthcare provider.",
    "voice_id": "jennifer"
  }')

echo ""
echo "Response from Edge Function:"
echo "$RESPONSE"
echo ""

# Extract assistant_id from response
ASSISTANT_ID=$(echo "$RESPONSE" | grep -o '"assistant_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ASSISTANT_ID" ]; then
    echo "❌ Failed to create assistant. Check the response above for errors."
    echo ""
    echo "Common issues:"
    echo "  - Invalid VAPI_PRIVATE_KEY"
    echo "  - VAPI API rate limit"
    echo "  - Webhook URL not accessible"
    exit 1
fi

echo "✅ Assistant created successfully!"
echo ""
echo "📝 Add this to your .env.local:"
echo ""
echo "VITE_VAPI_ASSISTANT_ID=$ASSISTANT_ID"
echo ""
echo "Step 3: Updating .env.local..."

# Update .env.local if it exists
if [ -f "apps/web/.env.local" ]; then
    if grep -q "VITE_VAPI_ASSISTANT_ID=" apps/web/.env.local; then
        # Replace existing
        sed -i.bak "s/VITE_VAPI_ASSISTANT_ID=.*/VITE_VAPI_ASSISTANT_ID=$ASSISTANT_ID/" apps/web/.env.local
        echo "✅ Updated existing VITE_VAPI_ASSISTANT_ID in .env.local"
    else
        # Add new
        echo "VITE_VAPI_ASSISTANT_ID=$ASSISTANT_ID" >> apps/web/.env.local
        echo "✅ Added VITE_VAPI_ASSISTANT_ID to .env.local"
    fi
    rm -f apps/web/.env.local.bak
else
    echo "⚠️  .env.local not found, please add manually"
fi

echo ""
echo "Step 4: Rebuild and deploy..."
npm run build -w apps/web

echo ""
echo "Step 5: Deploy to Vercel..."
vercel --prod

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Test voice functionality at:"
echo "  https://web-aornzvwxc-odia-backends-projects.vercel.app"
echo ""
echo "Next steps:"
echo "  1. Open the chat widget"
echo "  2. Switch to Voice mode"
echo "  3. Click 'Start Call'"
echo "  4. Speak and verify transcription works"
echo ""
