-- Final schema sync - only add missing elements

-- Ensure agent_config exists with proper structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_config') THEN
    CREATE TABLE agent_config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      system_prompt TEXT NOT NULL DEFAULT 'You are a helpful medical assistant.',
      voice_id TEXT,
      assistant_id TEXT,
      groq_model TEXT DEFAULT 'llama-3.1-8b-instant',
      updated_by UUID REFERENCES profiles(id),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb
    );
    
    CREATE UNIQUE INDEX idx_agent_config_singleton ON agent_config ((id IS NOT NULL));
    
    INSERT INTO agent_config (system_prompt, voice_id, groq_model)
    VALUES (
      'You are a helpful medical assistant for Serenity Royale Hospital. You can view patient information, check appointments, and trigger workflows. Always be professional and HIPAA-compliant.',
      'jennifer',
      'llama-3.1-8b-instant'
    );
  END IF;
END $$;

-- Enable RLS on agent_config
ALTER TABLE IF EXISTS agent_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent_config
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_config' AND policyname = 'Authenticated can view agent config'
  ) THEN
    CREATE POLICY "Authenticated can view agent config"
      ON agent_config FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_config' AND policyname = 'Admins can modify agent config'
  ) THEN
    CREATE POLICY "Admins can modify agent config"
      ON agent_config FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Add agent_config to realtime if not already there
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_config') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE agent_config;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END IF;
END $$;
