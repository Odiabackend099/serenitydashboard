-- WhatsApp Conversation Tracking Schema
-- Created: 2025-11-13
-- Purpose: Track all WhatsApp conversations, messages, and analytics

-- ============================================================================
-- Table 1: whatsapp_conversations
-- ============================================================================

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Patient identification
  patient_phone TEXT NOT NULL,
  patient_name TEXT,
  patient_email TEXT,

  -- Conversation status
  conversation_status TEXT DEFAULT 'active' CHECK (conversation_status IN ('active', 'resolved', 'archived')),

  -- Last message tracking
  last_message_at TIMESTAMP DEFAULT NOW(),
  last_message_from TEXT CHECK (last_message_from IN ('patient', 'business')),

  -- Conversation context (JSONB for flexibility)
  conversation_context JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_whatsapp_conv_patient_phone ON whatsapp_conversations(patient_phone);
CREATE INDEX idx_whatsapp_conv_status ON whatsapp_conversations(conversation_status);
CREATE INDEX idx_whatsapp_conv_last_message ON whatsapp_conversations(last_message_at DESC);
CREATE INDEX idx_whatsapp_conv_email ON whatsapp_conversations(patient_email) WHERE patient_email IS NOT NULL;

-- ============================================================================
-- Table 2: whatsapp_messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to conversation
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,

  -- WhatsApp message ID (unique from WhatsApp API)
  message_id TEXT UNIQUE,

  -- Message direction and type
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'voice', 'image', 'document', 'audio')),

  -- Message content
  message_content TEXT,
  media_url TEXT,

  -- Sender and receiver
  from_phone TEXT NOT NULL,
  to_phone TEXT NOT NULL,

  -- AI Processing metadata
  ai_response TEXT,
  tool_executed TEXT,
  tool_result JSONB,

  -- Timestamps
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_whatsapp_msg_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_msg_message_id ON whatsapp_messages(message_id) WHERE message_id IS NOT NULL;
CREATE INDEX idx_whatsapp_msg_timestamp ON whatsapp_messages(timestamp DESC);
CREATE INDEX idx_whatsapp_msg_direction ON whatsapp_messages(direction);

-- ============================================================================
-- Table 3: conversation_analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date for analytics (one record per day)
  date DATE NOT NULL UNIQUE,

  -- Volume metrics
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  unique_patients INTEGER DEFAULT 0,

  -- Engagement metrics
  avg_response_time_seconds INTEGER,
  avg_messages_per_conversation FLOAT,

  -- Topic/action breakdown
  appointments_booked INTEGER DEFAULT 0,
  appointments_rescheduled INTEGER DEFAULT 0,
  appointments_cancelled INTEGER DEFAULT 0,
  availability_checks INTEGER DEFAULT 0,
  general_inquiries INTEGER DEFAULT 0,

  -- Sentiment metrics (for future use)
  positive_sentiment INTEGER DEFAULT 0,
  negative_sentiment INTEGER DEFAULT 0,

  -- Peak hours (JSONB array of hours with counts)
  peak_hours JSONB DEFAULT '[]',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for date lookups
CREATE INDEX idx_conversation_analytics_date ON conversation_analytics(date DESC);

-- ============================================================================
-- Function: increment_analytics
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_analytics(
  p_date DATE,
  p_tool_executed TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Upsert daily analytics record
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
    1, -- increment conversations
    2, -- increment messages (inbound + outbound)
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

-- ============================================================================
-- Function: calculate_unique_patients (runs nightly)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_unique_patients(p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_unique_count INTEGER;
BEGIN
  -- Count unique patient phones for the day
  SELECT COUNT(DISTINCT patient_phone)
  INTO v_unique_count
  FROM whatsapp_conversations
  WHERE DATE(created_at) = p_date;

  -- Update analytics record
  UPDATE conversation_analytics
  SET unique_patients = v_unique_count,
      updated_at = NOW()
  WHERE date = p_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function: get_conversation_summary (for chat widget)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_conversation_summary(
  p_start_date DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  total_conversations BIGINT,
  total_messages BIGINT,
  appointments_booked INTEGER,
  appointments_rescheduled INTEGER,
  appointments_cancelled INTEGER,
  availability_checks INTEGER,
  general_inquiries INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.date,
    a.total_conversations,
    a.total_messages,
    a.appointments_booked,
    a.appointments_rescheduled,
    a.appointments_cancelled,
    a.availability_checks,
    a.general_inquiries
  FROM conversation_analytics a
  WHERE a.date BETWEEN p_start_date AND p_end_date
  ORDER BY a.date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything (for Edge Functions)
CREATE POLICY "Service role has full access to conversations"
  ON whatsapp_conversations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to messages"
  ON whatsapp_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to analytics"
  ON conversation_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users (business owners) can read their data
CREATE POLICY "Authenticated users can read conversations"
  ON whatsapp_conversations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read messages"
  ON whatsapp_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics"
  ON conversation_analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert/update (via Edge Functions with service role)
-- No direct insert/update policies for authenticated users (they must use Edge Functions)

-- ============================================================================
-- Triggers
-- ============================================================================

-- Trigger: Update conversation.updated_at on message insert
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE whatsapp_conversations
  SET
    updated_at = NOW(),
    last_message_at = NEW.timestamp,
    last_message_from = CASE
      WHEN NEW.direction = 'inbound' THEN 'patient'
      ELSE 'business'
    END
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- ============================================================================
-- Initial Data
-- ============================================================================

-- Create today's analytics record
INSERT INTO conversation_analytics (date)
VALUES (CURRENT_DATE)
ON CONFLICT (date) DO NOTHING;

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Grant execute on functions to service_role
GRANT EXECUTE ON FUNCTION increment_analytics(DATE, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION calculate_unique_patients(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION get_conversation_summary(DATE, DATE) TO service_role;

-- Grant execute on read-only functions to authenticated users
GRANT EXECUTE ON FUNCTION get_conversation_summary(DATE, DATE) TO authenticated;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE whatsapp_conversations IS 'Tracks all WhatsApp conversations with patients';
COMMENT ON TABLE whatsapp_messages IS 'Individual messages within WhatsApp conversations';
COMMENT ON TABLE conversation_analytics IS 'Daily aggregated analytics for WhatsApp conversations';

COMMENT ON FUNCTION increment_analytics IS 'Increments daily analytics counters (called by Edge Function)';
COMMENT ON FUNCTION calculate_unique_patients IS 'Calculates unique patient count for a date (run nightly)';
COMMENT ON FUNCTION get_conversation_summary IS 'Returns conversation summary for a date range (used by chat widget)';

-- ============================================================================
-- Success Message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ WhatsApp conversation tracking schema created successfully!';
  RAISE NOTICE '📊 Tables: whatsapp_conversations, whatsapp_messages, conversation_analytics';
  RAISE NOTICE '🔧 Functions: increment_analytics, calculate_unique_patients, get_conversation_summary';
  RAISE NOTICE '🔒 RLS policies enabled for security';
END $$;
