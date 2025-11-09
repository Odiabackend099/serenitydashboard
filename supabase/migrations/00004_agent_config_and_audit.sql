-- ============================================
-- AGENT CONFIG & AUDIT TABLES
-- For VAPI assistant sync and action tracking
-- ============================================

-- Agent Configuration Table
-- Stores VAPI assistant settings, allows version rollback
CREATE TABLE IF NOT EXISTS agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_prompt TEXT NOT NULL,
  voice_id VARCHAR(100) DEFAULT 'jennifer',
  assistant_id VARCHAR(100), -- VAPI assistant ID
  version INTEGER DEFAULT 1,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Audit Logs Table
-- Track all tool executions, n8n calls, and sensitive actions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    CREATE TABLE audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor UUID REFERENCES profiles(id), -- NULL for anonymous widget actions
      action VARCHAR(100) NOT NULL, -- 'tool_call', 'n8n_trigger', 'agent_config_updated', etc.
      intent VARCHAR(50), -- 'send_email', 'book_appointment', etc.
      status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
      meta JSONB DEFAULT '{}'::jsonb,
      error TEXT,
      ts TIMESTAMPTZ DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'intent') THEN
      ALTER TABLE audit_logs ADD COLUMN intent VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'status') THEN
      ALTER TABLE audit_logs ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'error') THEN
      ALTER TABLE audit_logs ADD COLUMN error TEXT;
    END IF;
  END IF;
END $$;

-- Transcripts Table (if not exists from previous migration)
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  confidence FLOAT, -- STT confidence score
  speaker VARCHAR(20), -- 'patient' or 'assistant'
  ts TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_config_updated_at ON agent_config(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_config_version ON agent_config(version DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON audit_logs(ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_transcripts_message_id ON transcripts(message_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_ts ON transcripts(ts DESC);

-- RLS Policies for agent_config (admin-only write, widget read)
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_config_select_all"
  ON agent_config FOR SELECT
  USING (true); -- Widget needs to read current config

CREATE POLICY "agent_config_insert_admin"
  ON agent_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "agent_config_update_admin"
  ON agent_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for audit_logs (read-only for admins, service role writes)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_admin"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "audit_logs_insert_all"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- Service role can insert

-- RLS Policies for transcripts (read-only for admins/widget)
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transcripts_select_all"
  ON transcripts FOR SELECT
  USING (true);

CREATE POLICY "transcripts_insert_all"
  ON transcripts FOR INSERT
  WITH CHECK (true);

-- Enable Realtime for agent_config (so widget gets updates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'agent_config'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE agent_config;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'transcripts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE transcripts;
  END IF;
END $$;

-- Insert default agent config (if none exists)
INSERT INTO agent_config (
  system_prompt,
  voice_id,
  version
)
SELECT
  'You are a helpful medical assistant for Serenity Royale Hospital. You help patients with appointment scheduling, general health information, hospital services, and billing questions. Always be professional, compassionate, and HIPAA-compliant. If unsure about medical advice, recommend consulting with a healthcare provider.',
  'jennifer',
  1
WHERE NOT EXISTS (SELECT 1 FROM agent_config LIMIT 1);
