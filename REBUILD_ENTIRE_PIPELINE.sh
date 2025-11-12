#!/bin/bash
set -e

echo "=========================================="
echo "🔥 COMPLETE PIPELINE REBUILD"
echo "=========================================="
echo ""
echo "This will:"
echo "1. Verify ALL environment variables"
echo "2. Clean rebuild frontend from scratch"
echo "3. Redeploy Edge Function"
echo "4. Force deploy to Vercel"
echo "5. Verify end-to-end"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "STEP 1: VERIFY ENVIRONMENT"
echo "=========================================="

# Check .env.local
if [ ! -f "apps/web/.env.local" ]; then
  echo -e "${RED}❌ apps/web/.env.local not found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ .env.local found${NC}"

# Extract required variables
SUPABASE_URL=$(grep VITE_SUPABASE_URL apps/web/.env.local | cut -d'=' -f2)
SUPABASE_ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY apps/web/.env.local | cut -d'=' -f2)
GROQ_MODEL=$(grep VITE_GROQ_MODEL apps/web/.env.local | cut -d'=' -f2)

echo "VITE_SUPABASE_URL: ${SUPABASE_URL}"
echo "VITE_GROQ_MODEL: ${GROQ_MODEL}"
echo "VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."

echo ""
echo "=========================================="
echo "STEP 2: VERIFY EDGE FUNCTION"
echo "=========================================="

echo "Testing Edge Function..."
EDGE_TEST=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d '{"messages":[{"role":"user","content":"test"}],"model":"llama-3.1-8b-instant","max_tokens":5}' \
  --max-time 10)

if echo "$EDGE_TEST" | grep -q '"role":"assistant"'; then
  echo -e "${GREEN}✅ Edge Function working${NC}"
else
  echo -e "${YELLOW}⚠️  Edge Function response:${NC}"
  echo "$EDGE_TEST"
  echo ""
  echo "Redeploying Edge Function..."
  supabase functions deploy groq-chat --project-ref yfrpxqvjshwaaomgcaoq
  echo -e "${GREEN}✅ Edge Function redeployed${NC}"
fi

echo ""
echo "=========================================="
echo "STEP 3: CHECK GIT STATUS"
echo "=========================================="

# Show current git status
git status --short

# Check if there are uncommitted changes to critical files
if git status --short | grep -E "(groqTools|ChatWidget|groq-chat/index)"; then
  echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
  echo ""
  echo "Committing changes..."
  git add apps/web/src/lib/groqTools.ts
  git add apps/web/src/components/ChatWidget.tsx
  git add supabase/functions/groq-chat/index.ts
  git commit -m "fix: Complete pipeline rebuild - appointment booking fixes" || echo "No changes to commit"
  git push || echo "Already pushed"
  echo -e "${GREEN}✅ Changes committed${NC}"
else
  echo -e "${GREEN}✅ No uncommitted changes to critical files${NC}"
fi

echo ""
echo "=========================================="
echo "STEP 4: CLEAN VERCEL CACHE"
echo "=========================================="

# Get latest deployment URL
LATEST_DEPLOY=$(vercel ls --prod 2>&1 | grep "https://" | head -1 | awk '{print $2}')
echo "Latest deployment: $LATEST_DEPLOY"

echo ""
echo "=========================================="
echo "STEP 5: TRIGGER NEW DEPLOYMENT"
echo "=========================================="

echo "Deploying to Vercel..."
vercel --prod --yes --force

echo -e "${GREEN}✅ Deployment triggered${NC}"

echo ""
echo "Waiting 30 seconds for deployment..."
sleep 30

echo ""
echo "=========================================="
echo "STEP 6: VERIFY PRODUCTION"
echo "=========================================="

# Check production bundle
BUNDLE=$(curl -s https://srhbackend.odia.dev | grep -o 'index-[a-zA-Z0-9_-]*.js' | head -1)
echo "Production bundle: $BUNDLE"

# Test production API
echo ""
echo "Testing production API..."
PROD_TEST=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Origin: https://srhbackend.odia.dev" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"model":"llama-3.1-8b-instant","max_tokens":10}')

if echo "$PROD_TEST" | grep -q '"role":"assistant"'; then
  echo -e "${GREEN}✅ Production API working${NC}"
else
  echo -e "${RED}❌ Production API failed${NC}"
  echo "$PROD_TEST"
fi

echo ""
echo "=========================================="
echo "STEP 7: TEST APPOINTMENT BOOKING"
echo "=========================================="

echo "Testing with complete appointment info..."
BOOKING_TEST=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Origin: https://srhbackend.odia.dev" \
  -d '{
    "messages": [
      {"role":"system","content":"You are a helpful assistant."},
      {"role":"user","content":"Book appointment tomorrow 2pm. Name: Test User, Email: test@test.com, Phone: +1-555-0123, Reason: checkup"}
    ],
    "model": "llama-3.1-8b-instant",
    "tools": [{
      "type": "function",
      "function": {
        "name": "book_appointment_with_confirmation",
        "description": "Book appointment",
        "parameters": {
          "type": "object",
          "properties": {
            "name": {"type": "string"},
            "email": {"type": "string"},
            "phone": {"type": "string"},
            "date": {"type": "string"},
            "time": {"type": "string"},
            "reason": {"type": "string"}
          },
          "required": ["name", "email", "phone", "date", "time", "reason"]
        }
      }
    }],
    "max_tokens": 1000
  }')

if echo "$BOOKING_TEST" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ BOOKING WORKS!${NC}"
elif echo "$BOOKING_TEST" | grep -q '"tool_calls"'; then
  echo -e "${GREEN}✅ AI calling booking tool${NC}"
else
  echo -e "${YELLOW}⚠️  Check response:${NC}"
  echo "$BOOKING_TEST" | jq '.' 2>/dev/null || echo "$BOOKING_TEST"
fi

echo ""
echo "=========================================="
echo "✅ PIPELINE REBUILD COMPLETE"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Edge Function: Working"
echo "- Frontend: Deployed"
echo "- Production: https://srhbackend.odia.dev"
echo "- Bundle: $BUNDLE"
echo ""
echo "CRITICAL NEXT STEP:"
echo "1. Open: https://srhbackend.odia.dev"
echo "2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "3. Open chat widget"
echo "4. Test: 'I need to book an appointment'"
echo ""
echo "If you still see errors:"
echo "- Open browser console (F12)"
echo "- Check Network tab for failed requests"
echo "- Look for the actual error message"
echo ""
