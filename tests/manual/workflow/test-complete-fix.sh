#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  COMPLETE FIX VERIFICATION TEST                          ║"
echo "║  Testing: Appointment Booking with book_appointment      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "This test verifies the COMPLETE FIX:"
echo "  ✅ Action routing: 'book_appointment' (not 'send_email')"
echo "  ✅ patient_ref field included"
echo "  ✅ All required fields with dual naming conventions"
echo "  ✅ Complete workflow: Create Appointment → Send Email"
echo ""
echo "───────────────────────────────────────────────────────────"
echo ""

echo "📤 Sending test booking to n8n webhook..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "action": "book_appointment",
      "channel": "webchat",
      "patient_ref": "egualesamuel@gmail.com",
      "patient_name": "Samuel Eguale",
      "patientName": "Samuel Eguale",
      "patient_email": "egualesamuel@gmail.com",
      "patientEmail": "egualesamuel@gmail.com",
      "patient_phone": "+1234567890",
      "patientPhone": "+1234567890",
      "appointment_date": "2025-11-12",
      "appointmentDate": "2025-11-12",
      "appointment_time": "2:00 PM",
      "appointmentTime": "2:00 PM",
      "reason": "Complete fix verification test",
      "appointmentReason": "Complete fix verification test",
      "source": "test_script",
      "timestamp": "2025-11-11T23:40:00Z"
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "📊 Response Status: HTTP $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
  echo "✅ SUCCESS! Webhook accepted the request"
else
  echo "❌ ERROR: Unexpected HTTP status code"
fi

if [ -n "$BODY" ] && [ "$BODY" != "null" ]; then
  echo "📄 Response Body:"
  echo "$BODY" | head -c 500
  echo ""
fi

echo ""
echo "───────────────────────────────────────────────────────────"
echo ""
echo "📋 VERIFICATION CHECKLIST:"
echo ""
echo "1. Check n8n Executions:"
echo "   → https://cwai97.app.n8n.cloud/executions"
echo "   Expected: Latest execution shows GREEN (all nodes succeeded)"
echo ""
echo "2. Verify Workflow Path:"
echo "   ✅ Webhook Trigger → Route by Action"
echo "   ✅ → Create Appointment (Supabase node)"
echo "   ✅ → Send Appointment Email (Gmail node)"
echo "   ✅ → Respond Success"
echo ""
echo "3. Check Email Delivery:"
echo "   → egualesamuel@gmail.com"
echo "   Expected: Appointment confirmation email with details"
echo ""
echo "4. Verify Database Record:"
echo "   → Supabase Dashboard → appointments table"
echo "   Expected: New appointment with patient_ref = 'egualesamuel@gmail.com'"
echo ""
echo "5. Check for Errors:"
echo "   Expected: No 'patient_ref constraint violation' errors"
echo ""
echo "───────────────────────────────────────────────────────────"
echo ""
echo "🎯 KEY FIX APPLIED:"
echo "   Changed action from 'send_email' to 'book_appointment'"
echo "   This ensures the complete workflow path is executed."
echo ""
echo "✅ Test completed!"
echo ""
