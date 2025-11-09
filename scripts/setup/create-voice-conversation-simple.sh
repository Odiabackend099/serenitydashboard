#!/bin/bash

# Simple script to create voice conversation using Supabase REST API
# Phone: (510) 370-6279 | Conversation ID: 187f82c4-a104-444d-a4f0-4b6490939374

SUPABASE_URL="https://yfrpxqvjshwaomgcaoq.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.Gq3vNhC8bZWqGHECwOyQpXZGHKW8x-RZX0sqNwx_YjQ"

echo "Creating voice conversation..."
echo "Phone: (510) 370-6279"
echo "Conversation ID: 187f82c4-a104-444d-a4f0-4b6490939374"
echo ""

# Calculate timestamp (15 minutes ago)
TIMESTAMP=$(date -u -v-15M +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '15 minutes ago' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-11-07T10:00:00.000Z")

# 1. Create conversation
echo "Step 1: Creating conversation record..."
curl -X POST "${SUPABASE_URL}/rest/v1/conversations" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"channel\": \"voice\",
    \"patient_ref\": \"+15103706279\",
    \"status\": \"open\",
    \"ai_confidence\": 0.95,
    \"created_at\": \"${TIMESTAMP}\",
    \"updated_at\": \"${TIMESTAMP}\"
  }"

echo -e "\n✓ Conversation created\n"

# 2. Create messages
echo "Step 2: Creating voice call transcript messages..."

# Message 1: AI greeting
curl -X POST "${SUPABASE_URL}/rest/v1/messages" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"conversation_id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"from_type\": \"ai\",
    \"body\": \"Hello! Thank you for calling Serenity Royale Hospital. My name is Sarah, and I'm here to help you. How may I assist you today?\",
    \"created_at\": \"${TIMESTAMP}\"
  }"
echo " ✓ Message 1/9"

# Message 2: Patient response
TIMESTAMP2=$(date -u -v-14M -v-30S +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '14 minutes 30 seconds ago' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-11-07T10:00:30.000Z")
curl -X POST "${SUPABASE_URL}/rest/v1/messages" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"conversation_id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"from_type\": \"patient\",
    \"body\": \"Hi, I need to schedule an appointment with Dr. Johnson for a follow-up consultation.\",
    \"created_at\": \"${TIMESTAMP2}\"
  }"
echo " ✓ Message 2/9"

# Message 3: AI asking for details
TIMESTAMP3=$(date -u -v-14M +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '14 minutes ago' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-11-07T10:01:00.000Z")
curl -X POST "${SUPABASE_URL}/rest/v1/messages" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"conversation_id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"from_type\": \"ai\",
    \"body\": \"I'd be happy to help you schedule a follow-up appointment with Dr. Johnson. Could you please provide your date of birth and the reason for your follow-up visit?\",
    \"created_at\": \"${TIMESTAMP3}\"
  }"
echo " ✓ Message 3/9"

# Message 4: Patient provides information
TIMESTAMP4=$(date -u -v-13M -v-30S +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '13 minutes 30 seconds ago' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-11-07T10:01:30.000Z")
curl -X POST "${SUPABASE_URL}/rest/v1/messages" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"conversation_id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"from_type\": \"patient\",
    \"body\": \"My date of birth is March 15, 1985. It's for my post-surgery check-up from last month.\",
    \"created_at\": \"${TIMESTAMP4}\"
  }"
echo " ✓ Message 4/9"

# Message 5: AI confirms and schedules
TIMESTAMP5=$(date -u -v-13M +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '13 minutes ago' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-11-07T10:02:00.000Z")
curl -X POST "${SUPABASE_URL}/rest/v1/messages" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"conversation_id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"from_type\": \"ai\",
    \"body\": \"Thank you! I have Dr. Johnson's availability for next week. Would Tuesday, November 14th at 2:30 PM work for you?\",
    \"created_at\": \"${TIMESTAMP5}\"
  }"
echo " ✓ Message 5/9"

# Message 6: Patient confirms
TIMESTAMP6=$(date -u -v-12M -v-30S +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '12 minutes 30 seconds ago' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-11-07T10:02:30.000Z")
curl -X POST "${SUPABASE_URL}/rest/v1/messages" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"conversation_id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"from_type\": \"patient\",
    \"body\": \"Yes, that works perfectly. Tuesday at 2:30 PM is great.\",
    \"created_at\": \"${TIMESTAMP6}\"
  }"
echo " ✓ Message 6/9"

# Message 7: AI confirms booking
TIMESTAMP7=$(date -u -v-12M +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '12 minutes ago' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-11-07T10:03:00.000Z")
curl -X POST "${SUPABASE_URL}/rest/v1/messages" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"conversation_id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"from_type\": \"ai\",
    \"body\": \"Perfect! I've scheduled your appointment with Dr. Johnson for Tuesday, November 14th at 2:30 PM for your post-surgery follow-up. You'll receive a confirmation text message shortly. Is there anything else I can help you with today?\",
    \"created_at\": \"${TIMESTAMP7}\"
  }"
echo " ✓ Message 7/9"

# Message 8: Patient thanks and ends call
TIMESTAMP8=$(date -u -v-11M -v-30S +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '11 minutes 30 seconds ago' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-11-07T10:03:30.000Z")
curl -X POST "${SUPABASE_URL}/rest/v1/messages" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"conversation_id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"from_type\": \"patient\",
    \"body\": \"No, that's all. Thank you so much for your help!\",
    \"created_at\": \"${TIMESTAMP8}\"
  }"
echo " ✓ Message 8/9"

# Message 9: AI closing
TIMESTAMP9=$(date -u -v-11M +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '11 minutes ago' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-11-07T10:04:00.000Z")
curl -X POST "${SUPABASE_URL}/rest/v1/messages" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"conversation_id\": \"187f82c4-a104-444d-a4f0-4b6490939374\",
    \"from_type\": \"ai\",
    \"body\": \"You're very welcome! Have a wonderful day, and we look forward to seeing you on Tuesday. Goodbye!\",
    \"created_at\": \"${TIMESTAMP9}\"
  }"
echo " ✓ Message 9/9"

echo ""
echo "=========================================="
echo "✅ Voice conversation created successfully!"
echo "=========================================="
echo ""
echo "View in dashboard:"
echo "1. Click the 'Voice' filter button"
echo "2. Search for: (510) 370-6279"
echo "3. Or search by ID: 187f82c4"
echo ""
echo "Conversation details:"
echo "- Phone: +1 (510) 370-6279"
echo "- ID: 187f82c4-a104-444d-a4f0-4b6490939374"
echo "- Messages: 9 (AI + Patient transcript)"
echo "- Status: Open"
echo "- AI Confidence: 95%"
echo ""
