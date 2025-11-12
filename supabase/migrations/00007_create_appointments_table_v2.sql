-- Migration 00007 v2: Create Appointments Table (CLEAN VERSION)
-- Purpose: Store patient appointment bookings from chat widget with email notifications
-- Date: 2025-11-07

-- Drop existing objects if they exist (for clean reinstall)
DROP VIEW IF EXISTS todays_appointments CASCADE;
DROP VIEW IF EXISTS upcoming_appointments CASCADE;
DROP TRIGGER IF EXISTS trigger_set_confirmation_sent ON appointments CASCADE;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT,
  patient_ref TEXT NOT NULL,
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  appointment_date DATE,
  appointment_time TIME,
  appointment_type TEXT CHECK (appointment_type IN ('consultation', 'follow-up', 'emergency', 'specialist', 'checkup')),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled')),
  google_calendar_event_id TEXT,
  notes TEXT,
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_appointments_patient_ref ON appointments(patient_ref);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_conversation_id ON appointments(conversation_id);
CREATE INDEX idx_appointments_email ON appointments(patient_email);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX idx_appointments_status_date ON appointments(status, appointment_date);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "service_role_full_access"
  ON appointments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_read"
  ON appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update"
  ON appointments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create confirmation timestamp function
CREATE OR REPLACE FUNCTION set_confirmation_sent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.confirmation_sent_at IS NULL OR OLD.status != 'confirmed') THEN
    NEW.confirmation_sent_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for confirmation sent
CREATE TRIGGER trigger_set_confirmation_sent
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION set_confirmation_sent_timestamp();

-- Comments
COMMENT ON TABLE appointments IS 'Patient appointment bookings from chat widget';
COMMENT ON COLUMN appointments.id IS 'Unique appointment identifier';
COMMENT ON COLUMN appointments.conversation_id IS 'Reference to conversation where booked';
COMMENT ON COLUMN appointments.patient_ref IS 'Patient identifier';
COMMENT ON COLUMN appointments.patient_email IS 'Patient email for confirmations';
COMMENT ON COLUMN appointments.patient_phone IS 'Patient phone for SMS';
COMMENT ON COLUMN appointments.appointment_date IS 'Scheduled date';
COMMENT ON COLUMN appointments.appointment_time IS 'Scheduled time';
COMMENT ON COLUMN appointments.status IS 'Appointment status';
COMMENT ON COLUMN appointments.confirmation_sent_at IS 'When confirmation email sent';

-- Create views
CREATE VIEW upcoming_appointments AS
SELECT
  a.*,
  c.channel,
  c.status as conversation_status,
  c.ai_confidence
FROM appointments a
LEFT JOIN conversations c ON a.conversation_id = c.id
WHERE
  a.appointment_date >= CURRENT_DATE
  AND a.status IN ('pending', 'confirmed')
ORDER BY a.appointment_date, a.appointment_time;

COMMENT ON VIEW upcoming_appointments IS 'Upcoming appointments with conversation details';

CREATE VIEW todays_appointments AS
SELECT
  a.*,
  c.channel,
  c.status as conversation_status
FROM appointments a
LEFT JOIN conversations c ON a.conversation_id = c.id
WHERE
  a.appointment_date = CURRENT_DATE
  AND a.status IN ('pending', 'confirmed')
ORDER BY a.appointment_time;

COMMENT ON VIEW todays_appointments IS 'Today appointments';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON appointments TO authenticated;
GRANT SELECT ON upcoming_appointments TO authenticated;
GRANT SELECT ON todays_appointments TO authenticated;

-- Verify table was created
SELECT 'Appointments table created successfully!' as status,
       COUNT(*) as initial_count
FROM appointments;
