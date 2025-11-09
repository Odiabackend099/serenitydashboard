-- Create agent_config table for versioned AI assistant configuration
CREATE TABLE IF NOT EXISTS public.agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL,
  system_prompt TEXT NOT NULL,
  voice_id TEXT NOT NULL DEFAULT 'jennifer',
  assistant_id TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_version UNIQUE (version)
);

-- Create index on version for faster lookups
CREATE INDEX IF NOT EXISTS idx_agent_config_version ON public.agent_config(version DESC);

-- Enable Row Level Security
ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read the latest config (for public widget)
CREATE POLICY "Anyone can read agent_config"
  ON public.agent_config
  FOR SELECT
  USING (true);

-- RLS Policy: Only authenticated users can insert new versions
CREATE POLICY "Authenticated users can insert agent_config"
  ON public.agent_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.agent_config IS 'Versioned AI assistant configuration with system prompts and voice settings';

-- Insert default configuration (version 1)
INSERT INTO public.agent_config (version, system_prompt, voice_id, assistant_id, updated_at)
VALUES (
  1,
  'You are a helpful hospital assistant for Serenity Royale Hospital. You help patients with appointment scheduling, answering questions, and providing information about our services. Be polite, professional, and empathetic.',
  'jennifer',
  'your-vapi-assistant-id',
  NOW()
)
ON CONFLICT (version) DO NOTHING;
