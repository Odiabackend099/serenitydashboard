-- Quick WhatsApp Tables Creation
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/sql

-- Table 1: whatsapp_conversations
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_phone TEXT NOT NULL,
  patient_name TEXT,
  patient_email TEXT,
  conversation_status TEXT DEFAULT 'active',
  last_message_at TIMESTAMP DEFAULT NOW(),
  last_message_from TEXT,
  conversation_context JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_patient_phone ON whatsapp_conversations(patient_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_last_message ON whatsapp_conversations(last_message_at DESC);

-- Table 2: whatsapp_messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  message_id TEXT UNIQUE,
  direction TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_content TEXT,
  media_url TEXT,
  from_phone TEXT NOT NULL,
  to_phone TEXT NOT NULL,
  ai_response TEXT,
  tool_executed TEXT,
  tool_result JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_timestamp ON whatsapp_messages(timestamp DESC);

-- Table 3: conversation_analytics
CREATE TABLE IF NOT EXISTS conversation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  unique_patients INTEGER DEFAULT 0,
  avg_response_time_seconds INTEGER,
  avg_messages_per_conversation FLOAT,
  appointments_booked INTEGER DEFAULT 0,
  appointments_rescheduled INTEGER DEFAULT 0,
  appointments_cancelled INTEGER DEFAULT 0,
  availability_checks INTEGER DEFAULT 0,
  general_inquiries INTEGER DEFAULT 0,
  positive_sentiment INTEGER DEFAULT 0,
  negative_sentiment INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_analytics_date ON conversation_analytics(date DESC);

-- Function: increment_analytics
CREATE OR REPLACE FUNCTION increment_analytics(
  p_date DATE,
  p_tool_executed TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO conversation_analytics (
    date,
    total_conversations,
    total_messages,
    appointments_booked,
    appointments_rescheduled,
    appointments_cancelled,
    availability_checks,
    general_inquiries
  )
  VALUES (
    p_date,
    1,
    2,
    CASE WHEN p_tool_executed = 'book_appointment_with_confirmation' THEN 1 ELSE 0 END,
    CASE WHEN p_tool_executed = 'reschedule_appointment' THEN 1 ELSE 0 END,
    CASE WHEN p_tool_executed = 'cancel_appointment' THEN 1 ELSE 0 END,
    CASE WHEN p_tool_executed = 'check_availability' THEN 1 ELSE 0 END,
    CASE WHEN p_tool_executed IS NULL THEN 1 ELSE 0 END
  )
  ON CONFLICT (date) DO UPDATE SET
    total_conversations = conversation_analytics.total_conversations + 1,
    total_messages = conversation_analytics.total_messages + 2,
    appointments_booked = conversation_analytics.appointments_booked +
      CASE WHEN p_tool_executed = 'book_appointment_with_confirmation' THEN 1 ELSE 0 END,
    appointments_rescheduled = conversation_analytics.appointments_rescheduled +
      CASE WHEN p_tool_executed = 'reschedule_appointment' THEN 1 ELSE 0 END,
    appointments_cancelled = conversation_analytics.appointments_cancelled +
      CASE WHEN p_tool_executed = 'cancel_appointment' THEN 1 ELSE 0 END,
    availability_checks = conversation_analytics.availability_checks +
      CASE WHEN p_tool_executed = 'check_availability' THEN 1 ELSE 0 END,
    general_inquiries = conversation_analytics.general_inquiries +
      CASE WHEN p_tool_executed IS NULL THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Service role has full access to conversations" ON whatsapp_conversations;
CREATE POLICY "Service role has full access to conversations"
  ON whatsapp_conversations FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to messages" ON whatsapp_messages;
CREATE POLICY "Service role has full access to messages"
  ON whatsapp_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to analytics" ON conversation_analytics;
CREATE POLICY "Service role has full access to analytics"
  ON conversation_analytics FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read conversations" ON whatsapp_conversations;
CREATE POLICY "Authenticated users can read conversations"
  ON whatsapp_conversations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read messages" ON whatsapp_messages;
CREATE POLICY "Authenticated users can read messages"
  ON whatsapp_messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read analytics" ON conversation_analytics;
CREATE POLICY "Authenticated users can read analytics"
  ON conversation_analytics FOR SELECT TO authenticated USING (true);

-- Create today's analytics record
INSERT INTO conversation_analytics (date)
VALUES (CURRENT_DATE)
ON CONFLICT (date) DO NOTHING;

-- Success message
SELECT '✅ WhatsApp conversation tracking tables created successfully!' as status;
