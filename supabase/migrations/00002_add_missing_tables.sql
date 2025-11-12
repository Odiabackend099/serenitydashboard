-- Add missing tables if they don't exist

-- Agent Config table (if not exists)
CREATE TABLE IF NOT EXISTS agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_prompt TEXT NOT NULL,
  voice_id TEXT,
  assistant_id TEXT,
  groq_model TEXT DEFAULT 'llama-3.1-8b-instant',
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_config_singleton ON agent_config ((id IS NOT NULL));

-- Enable RLS if not already enabled
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated can view agent config" ON agent_config;
DROP POLICY IF EXISTS "Admins can modify agent config" ON agent_config;

-- Create policies
CREATE POLICY "Authenticated can view agent config"
  ON agent_config FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can modify agent config"
  ON agent_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default config if none exists
INSERT INTO agent_config (system_prompt, voice_id, groq_model)
SELECT 
  'You are a helpful medical assistant for Serenity Royale Hospital. You can view patient information, check appointments, and trigger workflows. Always be professional and HIPAA-compliant.',
  'jennifer',
  'llama-3.1-8b-instant'
WHERE NOT EXISTS (SELECT 1 FROM agent_config LIMIT 1);

-- Audit Logs table (if not exists)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  ts TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON audit_logs(ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Realtime publication (add missing tables)
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
END $$;
