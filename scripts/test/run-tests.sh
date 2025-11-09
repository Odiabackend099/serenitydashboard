#!/bin/bash

# Serenity Royale Hospital - Production Test Suite
# Date: November 6, 2025
#
# This script runs automated backend tests to verify deployment

echo "================================================"
echo "🧪 Serenity Royale Hospital - Production Tests"
echo "================================================"
echo ""

# Counter for passed/failed tests
PASSED=0
FAILED=0

# Test 1: Custom Domain - srhcareai.odia.dev
echo "Test 1: Custom Domain (srhcareai.odia.dev)"
if curl -sI https://srhcareai.odia.dev 2>/dev/null | grep -q "HTTP/2 200"; then
    echo "✅ PASS - srhcareai.odia.dev is live"
    ((PASSED++))
else
    echo "❌ FAIL - srhcareai.odia.dev not accessible"
    ((FAILED++))
fi
echo ""

# Test 2: Custom Domain - srhbackend.odia.dev
echo "Test 2: Custom Domain (srhbackend.odia.dev)"
if curl -sI https://srhbackend.odia.dev 2>/dev/null | grep -q "HTTP/2 200"; then
    echo "✅ PASS - srhbackend.odia.dev is live"
    ((PASSED++))
else
    echo "❌ FAIL - srhbackend.odia.dev not accessible"
    ((FAILED++))
fi
echo ""

# Test 3: Widget Config Endpoint
echo "Test 3: Widget Config Endpoint"
if curl -s https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/widget-config 2>/dev/null | jq -e '.supabase.url' > /dev/null 2>&1; then
    echo "✅ PASS - Widget config returns valid configuration"
    ((PASSED++))
else
    echo "❌ FAIL - Widget config endpoint error"
    ((FAILED++))
fi
echo ""

# Test 4: Twilio Webhook Security
echo "Test 4: Twilio Webhook Security"
RESPONSE=$(curl -s -X POST https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/twilio-whatsapp-webhook \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'From=whatsapp:+1234567890&Body=Test' 2>/dev/null)

if echo "$RESPONSE" | jq -e '.error == "Forbidden: Missing signature"' > /dev/null 2>&1; then
    echo "✅ PASS - Webhook rejects unsigned requests"
    ((PASSED++))
else
    echo "❌ FAIL - Webhook security not enforced"
    ((FAILED++))
fi
echo ""

# Test 5: DNS Configuration - srhcareai
echo "Test 5: DNS Configuration (srhcareai.odia.dev)"
if dig srhcareai.odia.dev CNAME +short 2>/dev/null | grep -q "cname.vercel-dns.com"; then
    echo "✅ PASS - DNS record configured correctly"
    ((PASSED++))
else
    echo "❌ FAIL - DNS record not found or incorrect"
    ((FAILED++))
fi
echo ""

# Test 6: DNS Configuration - srhbackend
echo "Test 6: DNS Configuration (srhbackend.odia.dev)"
if dig srhbackend.odia.dev CNAME +short 2>/dev/null | grep -q "cname.vercel-dns.com"; then
    echo "✅ PASS - DNS record configured correctly"
    ((PASSED++))
else
    echo "❌ FAIL - DNS record not found or incorrect"
    ((FAILED++))
fi
echo ""

# Test 7: SSL Certificate
echo "Test 7: SSL Certificate Validity"
if echo | openssl s_client -servername srhcareai.odia.dev -connect srhcareai.odia.dev:443 2>/dev/null | openssl x509 -noout -checkend 0 > /dev/null 2>&1; then
    echo "✅ PASS - SSL certificate is valid"
    ((PASSED++))
else
    echo "❌ FAIL - SSL certificate invalid or expired"
    ((FAILED++))
fi
echo ""

# Summary
echo "================================================"
echo "📊 Test Results Summary"
echo "================================================"
echo "Total Tests: $((PASSED + FAILED))"
echo "Passed: $PASSED ✅"
echo "Failed: $FAILED ❌"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 Result: ALL TESTS PASSED"
    echo ""
    echo "Production Status: ✅ FULLY OPERATIONAL"
    echo ""
    echo "Next Steps:"
    echo "1. Test frontend manually at https://srhcareai.odia.dev"
    echo "2. Import n8n workflow for appointment booking"
    echo "3. Run end-to-end tests with user interactions"
    exit 0
else
    echo "⚠️  Result: SOME TESTS FAILED"
    echo ""
    echo "Please review failed tests and check logs:"
    echo "- Supabase: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/functions"
    echo "- Vercel: https://vercel.com/odia-backends-projects/web"
    exit 1
fi
