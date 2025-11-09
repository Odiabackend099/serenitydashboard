-- Migration 00007: Create Appointments Table
-- Purpose: Store patient appointment bookings from chat widget with email notifications
-- Date: 2025-11-07

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
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
CREATE INDEX IF NOT EXISTS idx_appointments_patient_ref ON appointments(patient_ref);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_conversation_id ON appointments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

-- Create composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_appointments_status_date
  ON appointments(status, appointment_date);

-- Add RLS policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "service_role_appointments_all"
  ON appointments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read all appointments (for staff dashboard)
CREATE POLICY "authenticated_appointments_read"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert appointments (for booking system)
CREATE POLICY "authenticated_appointments_insert"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update appointments (for status changes)
CREATE POLICY "authenticated_appointments_update"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create or replace the update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to set confirmation_sent_at when email is sent
CREATE OR REPLACE FUNCTION set_confirmation_sent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changes to 'confirmed' and confirmation_sent_at is NULL
  IF NEW.status = 'confirmed' AND OLD.confirmation_sent_at IS NULL THEN
    NEW.confirmation_sent_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_confirmation_sent
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION set_confirmation_sent_timestamp();

-- Comments for documentation
COMMENT ON TABLE appointments IS 'Patient appointment bookings from chat widget with email confirmation tracking';
COMMENT ON COLUMN appointments.id IS 'Unique appointment identifier';
COMMENT ON COLUMN appointments.conversation_id IS 'Reference to the conversation where appointment was booked';
COMMENT ON COLUMN appointments.patient_ref IS 'Patient identifier (phone number or ID)';
COMMENT ON COLUMN appointments.patient_email IS 'Patient email for confirmation and reminders';
COMMENT ON COLUMN appointments.patient_phone IS 'Patient phone number for SMS notifications';
COMMENT ON COLUMN appointments.appointment_date IS 'Scheduled appointment date';
COMMENT ON COLUMN appointments.appointment_time IS 'Scheduled appointment time';
COMMENT ON COLUMN appointments.appointment_type IS 'Type of appointment: consultation, follow-up, emergency, specialist, checkup';
COMMENT ON COLUMN appointments.status IS 'Appointment status: pending, confirmed, cancelled, completed, no-show, rescheduled';
COMMENT ON COLUMN appointments.google_calendar_event_id IS 'Google Calendar event ID for sync';
COMMENT ON COLUMN appointments.confirmation_sent_at IS 'Timestamp when confirmation email was sent';
COMMENT ON COLUMN appointments.reminder_sent_at IS 'Timestamp when reminder was sent';

-- Create view for upcoming appointments
CREATE OR REPLACE VIEW upcoming_appointments AS
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

COMMENT ON VIEW upcoming_appointments IS 'All upcoming appointments (today and future) with conversation details';

-- Create view for today's appointments
CREATE OR REPLACE VIEW todays_appointments AS
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

COMMENT ON VIEW todays_appointments IS 'Appointments scheduled for today';

-- Insert sample data for testing (optional - comment out for production)
-- INSERT INTO appointments (
--   patient_ref,
--   patient_name,
--   patient_email,
--   patient_phone,
--   appointment_date,
--   appointment_time,
--   appointment_type,
--   reason,
--   status
-- ) VALUES (
--   'patient-test-001',
--   'John Doe',
--   'john.doe@example.com',
--   '+2348012345678',
--   CURRENT_DATE + INTERVAL '3 days',
--   '14:00:00',
--   'consultation',
--   'General checkup',
--   'pending'
-- );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON appointments TO authenticated;
GRANT SELECT ON upcoming_appointments TO authenticated;
GRANT SELECT ON todays_appointments TO authenticated;
