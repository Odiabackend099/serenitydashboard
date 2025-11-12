-- Create scheduled_followups table for automated follow-up emails
-- This enables the AI assistant to schedule follow-up emails after appointments

CREATE TABLE IF NOT EXISTS scheduled_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to appointment
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,

  -- Patient contact info (denormalized for reliability)
  patient_email text NOT NULL,
  patient_name text,

  -- Follow-up details
  followup_type text NOT NULL CHECK (followup_type IN ('reminder', 'feedback', 'followup', 'manual')),
  scheduled_for timestamp with time zone NOT NULL,

  -- Status tracking
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamp with time zone,
  error_message text,

  -- Email content (optional custom message)
  custom_subject text,
  custom_body text,

  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),

  -- Audit trail
  meta jsonb DEFAULT '{}'::jsonb
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_scheduled_followups_status_scheduled
  ON scheduled_followups(status, scheduled_for)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_scheduled_followups_appointment
  ON scheduled_followups(appointment_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_followups_email
  ON scheduled_followups(patient_email);

-- Enable Row Level Security
ALTER TABLE scheduled_followups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to scheduled_followups"
  ON scheduled_followups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view scheduled_followups"
  ON scheduled_followups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert scheduled_followups"
  ON scheduled_followups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create view for pending follow-ups (for n8n workflow)
CREATE OR REPLACE VIEW pending_followups AS
SELECT
  id,
  appointment_id,
  patient_email,
  patient_name,
  followup_type,
  scheduled_for,
  custom_subject,
  custom_body,
  created_at
FROM scheduled_followups
WHERE status = 'pending'
  AND scheduled_for <= now()
ORDER BY scheduled_for ASC;

-- Grant access to view
GRANT SELECT ON pending_followups TO service_role;
GRANT SELECT ON pending_followups TO authenticated;

-- Function to automatically schedule follow-ups when appointment is created
CREATE OR REPLACE FUNCTION auto_schedule_followups()
RETURNS TRIGGER AS $$
BEGIN
  -- Only schedule for confirmed appointments with valid email
  IF NEW.status = 'confirmed' AND NEW.patient_email IS NOT NULL AND NEW.patient_email != '' THEN

    -- Schedule reminder email 24 hours before appointment
    IF NEW.appointment_date IS NOT NULL AND NEW.appointment_time IS NOT NULL THEN
      INSERT INTO scheduled_followups (
        appointment_id,
        patient_email,
        patient_name,
        followup_type,
        scheduled_for
      )
      VALUES (
        NEW.id,
        NEW.patient_email,
        NEW.patient_name,
        'reminder',
        (NEW.appointment_date || ' ' || NEW.appointment_time)::timestamp - interval '24 hours'
      )
      ON CONFLICT DO NOTHING;  -- Prevent duplicates
    END IF;

    -- Schedule feedback request 24 hours after appointment
    IF NEW.appointment_date IS NOT NULL AND NEW.appointment_time IS NOT NULL THEN
      INSERT INTO scheduled_followups (
        appointment_id,
        patient_email,
        patient_name,
        followup_type,
        scheduled_for
      )
      VALUES (
        NEW.id,
        NEW.patient_email,
        NEW.patient_name,
        'feedback',
        (NEW.appointment_date || ' ' || NEW.appointment_time)::timestamp + interval '24 hours'
      )
      ON CONFLICT DO NOTHING;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-schedule follow-ups
DROP TRIGGER IF EXISTS trigger_auto_schedule_followups ON appointments;
CREATE TRIGGER trigger_auto_schedule_followups
  AFTER INSERT OR UPDATE OF status, patient_email
  ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION auto_schedule_followups();

-- Function to mark follow-up as sent
CREATE OR REPLACE FUNCTION mark_followup_sent(followup_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE scheduled_followups
  SET
    status = 'sent',
    sent_at = now()
  WHERE id = followup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark follow-up as failed
CREATE OR REPLACE FUNCTION mark_followup_failed(followup_id uuid, error_msg text)
RETURNS void AS $$
BEGIN
  UPDATE scheduled_followups
  SET
    status = 'failed',
    error_message = error_msg
  WHERE id = followup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION mark_followup_sent(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION mark_followup_failed(uuid, text) TO service_role;

-- Add comment for documentation
COMMENT ON TABLE scheduled_followups IS 'Scheduled follow-up emails for appointments (reminders, feedback requests, etc.)';
COMMENT ON COLUMN scheduled_followups.followup_type IS 'Types: reminder (24h before), feedback (24h after), followup (7 days after), manual (ad-hoc)';
COMMENT ON FUNCTION auto_schedule_followups() IS 'Automatically schedules reminder and feedback emails when appointment is created/confirmed';
