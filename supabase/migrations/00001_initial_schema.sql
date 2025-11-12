-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (User roles and metadata)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'receptionist', 'call_handler')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own name
CREATE POLICY "Users can update own name"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Only admins can update roles
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CONVERSATIONS TABLE (WhatsApp + Voice threads)
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'voice')),
  patient_ref TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'escalated')),
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast lookups
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_patient_ref ON conversations(patient_ref);

-- RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all conversations
CREATE POLICY "Authenticated can view conversations"
  ON conversations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert conversations
CREATE POLICY "Authenticated can insert conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update conversations
CREATE POLICY "Authenticated can update conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Only admins can delete
CREATE POLICY "Admins can delete conversations"
  ON conversations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- MESSAGES TABLE (Chat history)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  from_role TEXT NOT NULL CHECK (from_role IN ('patient', 'ai', 'staff')),
  body TEXT NOT NULL,
  media_url TEXT,
  ts TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  staff_id UUID REFERENCES profiles(id)
);

-- Index for fast conversation retrieval
CREATE INDEX idx_messages_conversation ON messages(conversation_id, ts DESC);

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Authenticated can view all messages
CREATE POLICY "Authenticated can view messages"
  ON messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated can insert messages
CREATE POLICY "Authenticated can insert messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can delete messages
CREATE POLICY "Admins can delete messages"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- APPOINTMENTS TABLE (Internal + optional GCal sync)
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_ref TEXT NOT NULL,
  start TIMESTAMPTZ NOT NULL,
  "end" TIMESTAMPTZ NOT NULL,
  provider TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  source TEXT NOT NULL CHECK (source IN ('ai', 'staff')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  gcal_event_id TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for calendar queries
CREATE INDEX idx_appointments_start ON appointments(start);
CREATE INDEX idx_appointments_patient ON appointments(patient_ref);

-- RLS for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Authenticated can view appointments
CREATE POLICY "Authenticated can view appointments"
  ON appointments FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated can insert appointments
CREATE POLICY "Authenticated can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated can update appointments
CREATE POLICY "Authenticated can update appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Only admins can delete
CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- AGENT_CONFIG TABLE (VAPI/Groq settings)
-- ============================================
CREATE TABLE agent_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_prompt TEXT NOT NULL,
  voice_id TEXT,
  assistant_id TEXT,
  groq_model TEXT DEFAULT 'llama-3.1-70b-versatile',
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Only one config row (singleton)
CREATE UNIQUE INDEX idx_agent_config_singleton ON agent_config ((id IS NOT NULL));

-- RLS for agent_config
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;

-- Authenticated can view config
CREATE POLICY "Authenticated can view agent config"
  ON agent_config FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can modify
CREATE POLICY "Admins can modify agent config"
  ON agent_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- AUDIT_LOGS TABLE (Compliance tracking)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  ts TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX idx_audit_logs_ts ON audit_logs(ts DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor);

-- RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert audit logs (via service role)
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log profile changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO audit_logs (actor, action, meta)
    VALUES (
      auth.uid(),
      'role_changed',
      jsonb_build_object(
        'user_id', NEW.id,
        'old_role', OLD.role,
        'new_role', NEW.role
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default agent config (will be updated via UI)
INSERT INTO agent_config (system_prompt, voice_id, groq_model)
VALUES (
  'You are a helpful medical assistant for Serenity Royale Hospital. You can view patient information, check appointments, and trigger workflows. Always be professional and HIPAA-compliant.',
  'default',
  'llama-3.1-70b-versatile'
);

-- ============================================
-- REALTIME PUBLICATION
-- ============================================

-- Enable realtime for conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
