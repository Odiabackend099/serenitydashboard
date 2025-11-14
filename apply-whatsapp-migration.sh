#!/bin/bash

# Apply WhatsApp Conversations Migration
# This script applies the migration directly to Supabase

echo "🚀 Applying WhatsApp Conversations Migration..."

# Run the migration file
export SUPABASE_ACCESS_TOKEN=sbp_364edb14c06fa6e79764a0121f08321eec74608f

# Use supabase db push with just this migration
supabase db push --include-all

echo "✅ Migration applied successfully!"
echo ""
echo "Created tables:"
echo "  - whatsapp_conversations"
echo "  - whatsapp_messages"
echo "  - conversation_analytics"
echo ""
echo "Created functions:"
echo "  - increment_analytics()"
echo "  - calculate_unique_patients()"
echo "  - get_conversation_summary()"
