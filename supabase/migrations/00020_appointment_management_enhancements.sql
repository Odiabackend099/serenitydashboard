-- Migration: Appointment Management Enhancements
-- Add reschedule tracking, cancellation management, audit trail, and provider availability

-- ============================================
-- 1. ENHANCE APPOINTMENTS TABLE
-- ============================================

-- Add missing fields to appointments table
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES appointments(id),
  ADD COLUMN IF NOT EXISTS cancelled_by UUID,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS no_show_reason TEXT,
  ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_name ON appointments(doctor_name);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_rescheduled_from ON appointments(rescheduled_from);

-- Add comment for documentation
COMMENT ON COLUMN appointments.rescheduled_from IS 'Reference to the original appointment if this is a rescheduled appointment';
COMMENT ON COLUMN appointments.reschedule_count IS 'Number of times this appointment has been rescheduled';

-- ============================================
-- 2. APPOINTMENT AUDIT TRAIL
-- ============================================

CREATE TABLE IF NOT EXISTS appointment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  changed_by UUID,
  changed_by_name VARCHAR(255),
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
    'created', 'updated', 'rescheduled', 'cancelled',
    'confirmed', 'completed', 'no_show', 'checked_in'
  )),
  previous_data JSONB,
  new_data JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying audit log
CREATE INDEX IF NOT EXISTS idx_audit_appointment_id ON appointment_audit_log(appointment_id);
CREATE INDEX IF NOT EXISTS idx_audit_change_type ON appointment_audit_log(change_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON appointment_audit_log(created_at DESC);

COMMENT ON TABLE appointment_audit_log IS 'Tracks all changes made to appointments for compliance and history';

-- ============================================
-- 3. PROVIDER AVAILABILITY
-- ============================================

CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  appointment_duration_minutes INTEGER DEFAULT 30,
  is_available BOOLEAN DEFAULT true,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure end time is after start time
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  -- Unique constraint to prevent overlapping schedules
  CONSTRAINT unique_provider_schedule UNIQUE (provider_name, day_of_week, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_provider_name ON provider_availability(provider_name);
CREATE INDEX IF NOT EXISTS idx_provider_day ON provider_availability(day_of_week);

COMMENT ON TABLE provider_availability IS 'Weekly availability schedule for healthcare providers';
COMMENT ON COLUMN provider_availability.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';

-- ============================================
-- 4. BLOCKED TIMES (Holidays, Meetings, etc.)
-- ============================================

CREATE TABLE IF NOT EXISTS blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(255),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason VARCHAR(100) NOT NULL CHECK (reason IN (
    'holiday', 'vacation', 'meeting', 'training',
    'lunch_break', 'emergency', 'maintenance', 'other'
  )),
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_datetime_range CHECK (end_datetime > start_datetime)
);

CREATE INDEX IF NOT EXISTS idx_blocked_times_provider ON blocked_times(provider_name);
CREATE INDEX IF NOT EXISTS idx_blocked_times_dates ON blocked_times(start_datetime, end_datetime);

COMMENT ON TABLE blocked_times IS 'Specific dates/times when providers are unavailable';

-- ============================================
-- 5. APPOINTMENT WAITLIST
-- ============================================

CREATE TABLE IF NOT EXISTS appointment_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_ref TEXT NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255),
  patient_phone VARCHAR(50),
  preferred_date DATE,
  preferred_time_range VARCHAR(50) CHECK (preferred_time_range IN ('morning', 'afternoon', 'evening', 'any')),
  appointment_type VARCHAR(50) CHECK (appointment_type IN ('consultation', 'follow-up', 'emergency', 'specialist', 'checkup')),
  reason TEXT,
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'offered', 'booked', 'expired', 'cancelled')),
  offered_appointment_id UUID REFERENCES appointments(id),
  offered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_status ON appointment_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON appointment_waitlist(priority DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_date ON appointment_waitlist(preferred_date);

COMMENT ON TABLE appointment_waitlist IS 'Patients waiting for available appointment slots';
COMMENT ON COLUMN appointment_waitlist.priority IS '1=Low, 5=High priority';

-- ============================================
-- 6. APPOINTMENT REMINDERS LOG
-- ============================================

CREATE TABLE IF NOT EXISTS appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('sms', 'email', 'whatsapp', 'voice')),
  reminder_timing VARCHAR(50) NOT NULL CHECK (reminder_timing IN ('24_hours', '2_hours', '1_hour', 'custom')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_appointment ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON appointment_reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON appointment_reminders(scheduled_for);

COMMENT ON TABLE appointment_reminders IS 'Track all appointment reminders and their delivery status';

-- ============================================
-- 7. TRIGGERS FOR AUTO-UPDATING
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to provider_availability
DROP TRIGGER IF EXISTS update_provider_availability_updated_at ON provider_availability;
CREATE TRIGGER update_provider_availability_updated_at
  BEFORE UPDATE ON provider_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to waitlist
DROP TRIGGER IF EXISTS update_waitlist_updated_at ON appointment_waitlist;
CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON appointment_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. AUDIT LOG TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION log_appointment_changes()
RETURNS TRIGGER AS $$
DECLARE
  change_type_val VARCHAR(50);
BEGIN
  -- Determine change type
  IF TG_OP = 'INSERT' THEN
    change_type_val := 'created';
  ELSIF OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'cancelled' THEN change_type_val := 'cancelled';
      WHEN 'confirmed' THEN change_type_val := 'confirmed';
      WHEN 'completed' THEN change_type_val := 'completed';
      WHEN 'no-show' THEN change_type_val := 'no_show';
      WHEN 'rescheduled' THEN change_type_val := 'rescheduled';
      ELSE change_type_val := 'updated';
    END CASE;
  ELSIF (OLD.appointment_date != NEW.appointment_date OR OLD.appointment_time != NEW.appointment_time) THEN
    change_type_val := 'rescheduled';
  ELSE
    change_type_val := 'updated';
  END IF;

  -- Insert audit log
  INSERT INTO appointment_audit_log (
    appointment_id,
    change_type,
    previous_data,
    new_data,
    reason,
    created_at
  ) VALUES (
    NEW.id,
    change_type_val,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END,
    row_to_json(NEW),
    NEW.notes,
    NOW()
  );

  -- Update reschedule count if date/time changed
  IF TG_OP = 'UPDATE' AND change_type_val = 'rescheduled' THEN
    NEW.reschedule_count := COALESCE(OLD.reschedule_count, 0) + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to appointments
DROP TRIGGER IF EXISTS appointments_audit_trigger ON appointments;
CREATE TRIGGER appointments_audit_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_changes();

-- ============================================
-- 9. USEFUL VIEWS
-- ============================================

-- View for appointment analytics
CREATE OR REPLACE VIEW appointment_analytics AS
SELECT
  DATE(appointment_date) as date,
  COUNT(*) as total_appointments,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
  COUNT(*) FILTER (WHERE status = 'no-show') as no_shows,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  AVG(duration_minutes) as avg_duration,
  AVG(reschedule_count) as avg_reschedules
FROM appointments
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(appointment_date)
ORDER BY date DESC;

-- View for provider schedule
CREATE OR REPLACE VIEW provider_schedule AS
SELECT
  pa.provider_name,
  pa.day_of_week,
  CASE pa.day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day_name,
  pa.start_time,
  pa.end_time,
  pa.appointment_duration_minutes,
  pa.is_available,
  COUNT(bt.id) as blocked_times_count
FROM provider_availability pa
LEFT JOIN blocked_times bt ON bt.provider_name = pa.provider_name
  AND EXTRACT(DOW FROM bt.start_datetime) = pa.day_of_week
GROUP BY pa.id, pa.provider_name, pa.day_of_week, pa.start_time, pa.end_time,
         pa.appointment_duration_minutes, pa.is_available
ORDER BY pa.provider_name, pa.day_of_week, pa.start_time;

-- View for active waitlist
CREATE OR REPLACE VIEW active_waitlist AS
SELECT
  w.*,
  CASE
    WHEN w.expires_at IS NOT NULL AND w.expires_at < NOW() THEN 'expired'
    ELSE w.status
  END as actual_status
FROM appointment_waitlist w
WHERE w.status IN ('active', 'offered')
ORDER BY w.priority DESC, w.created_at ASC;

-- ============================================
-- 10. RPC FUNCTIONS FOR COMMON OPERATIONS
-- ============================================

-- Function to reschedule appointment
CREATE OR REPLACE FUNCTION reschedule_appointment(
  p_appointment_id UUID,
  p_new_date DATE,
  p_new_time TIME,
  p_reason TEXT DEFAULT NULL,
  p_notify_patient BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
  v_old_appointment appointments%ROWTYPE;
  v_result JSON;
BEGIN
  -- Get current appointment
  SELECT * INTO v_old_appointment
  FROM appointments
  WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Appointment not found');
  END IF;

  -- Update appointment
  UPDATE appointments
  SET
    appointment_date = p_new_date,
    appointment_time = p_new_time,
    status = 'confirmed',
    notes = COALESCE(notes || E'\n', '') || 'Rescheduled: ' || COALESCE(p_reason, 'No reason provided'),
    updated_at = NOW()
  WHERE id = p_appointment_id;

  -- Create audit log entry is handled by trigger

  v_result := json_build_object(
    'success', true,
    'appointment_id', p_appointment_id,
    'old_date', v_old_appointment.appointment_date,
    'old_time', v_old_appointment.appointment_time,
    'new_date', p_new_date,
    'new_time', p_new_time,
    'notify_patient', p_notify_patient
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to cancel appointment
CREATE OR REPLACE FUNCTION cancel_appointment(
  p_appointment_id UUID,
  p_cancelled_by UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_notify_patient BOOLEAN DEFAULT true,
  p_offer_to_waitlist BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
  v_appointment appointments%ROWTYPE;
  v_waitlist_count INTEGER;
  v_result JSON;
BEGIN
  -- Get appointment
  SELECT * INTO v_appointment
  FROM appointments
  WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Appointment not found');
  END IF;

  -- Update appointment status
  UPDATE appointments
  SET
    status = 'cancelled',
    cancelled_by = p_cancelled_by,
    cancellation_reason = p_reason,
    cancellation_timestamp = NOW(),
    updated_at = NOW()
  WHERE id = p_appointment_id;

  -- If offering to waitlist, count eligible patients
  IF p_offer_to_waitlist THEN
    SELECT COUNT(*) INTO v_waitlist_count
    FROM appointment_waitlist
    WHERE status = 'active'
      AND (preferred_date IS NULL OR preferred_date = v_appointment.appointment_date)
      AND (appointment_type IS NULL OR appointment_type = v_appointment.appointment_type);
  ELSE
    v_waitlist_count := 0;
  END IF;

  v_result := json_build_object(
    'success', true,
    'appointment_id', p_appointment_id,
    'cancelled_at', NOW(),
    'notify_patient', p_notify_patient,
    'waitlist_candidates', v_waitlist_count
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to check availability
CREATE OR REPLACE FUNCTION check_provider_availability(
  p_provider_name VARCHAR(255),
  p_date DATE,
  p_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week INTEGER;
  v_is_available BOOLEAN;
  v_is_blocked BOOLEAN;
  v_has_conflict BOOLEAN;
BEGIN
  -- Get day of week (0=Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Check if provider has availability for this day/time
  SELECT EXISTS (
    SELECT 1
    FROM provider_availability
    WHERE provider_name = p_provider_name
      AND day_of_week = v_day_of_week
      AND start_time <= p_time
      AND end_time > p_time
      AND is_available = true
  ) INTO v_is_available;

  IF NOT v_is_available THEN
    RETURN false;
  END IF;

  -- Check for blocked times
  SELECT EXISTS (
    SELECT 1
    FROM blocked_times
    WHERE provider_name = p_provider_name
      AND (p_date + p_time::TIME) >= start_datetime
      AND (p_date + p_time::TIME) < end_datetime
  ) INTO v_is_blocked;

  IF v_is_blocked THEN
    RETURN false;
  END IF;

  -- Check for existing appointments
  SELECT EXISTS (
    SELECT 1
    FROM appointments
    WHERE doctor_name = p_provider_name
      AND appointment_date = p_date
      AND appointment_time = p_time
      AND status NOT IN ('cancelled', 'no-show')
  ) INTO v_has_conflict;

  RETURN NOT v_has_conflict;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. SEED DEFAULT PROVIDER AVAILABILITY
-- ============================================

-- Insert default availability for Serenity Hospital providers
INSERT INTO provider_availability (provider_name, day_of_week, start_time, end_time, appointment_duration_minutes, is_available)
VALUES
  -- Dr. Sarah Johnson - General Practice (Mon-Fri, 9 AM - 5 PM)
  ('Dr. Sarah Johnson', 1, '09:00', '17:00', 30, true),
  ('Dr. Sarah Johnson', 2, '09:00', '17:00', 30, true),
  ('Dr. Sarah Johnson', 3, '09:00', '17:00', 30, true),
  ('Dr. Sarah Johnson', 4, '09:00', '17:00', 30, true),
  ('Dr. Sarah Johnson', 5, '09:00', '17:00', 30, true),

  -- Dr. Michael Chen - Specialist (Mon, Wed, Fri)
  ('Dr. Michael Chen', 1, '10:00', '16:00', 45, true),
  ('Dr. Michael Chen', 3, '10:00', '16:00', 45, true),
  ('Dr. Michael Chen', 5, '10:00', '16:00', 45, true),

  -- Dr. Emily Rodriguez - Emergency (7 days, extended hours)
  ('Dr. Emily Rodriguez', 0, '08:00', '20:00', 30, true),
  ('Dr. Emily Rodriguez', 1, '08:00', '20:00', 30, true),
  ('Dr. Emily Rodriguez', 2, '08:00', '20:00', 30, true),
  ('Dr. Emily Rodriguez', 3, '08:00', '20:00', 30, true),
  ('Dr. Emily Rodriguez', 4, '08:00', '20:00', 30, true),
  ('Dr. Emily Rodriguez', 5, '08:00', '20:00', 30, true),
  ('Dr. Emily Rodriguez', 6, '08:00', '20:00', 30, true)
ON CONFLICT (provider_name, day_of_week, start_time, end_time) DO NOTHING;

-- ============================================
-- 12. GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON appointment_audit_log TO authenticated;
GRANT SELECT ON provider_availability TO authenticated;
GRANT SELECT ON blocked_times TO authenticated;
GRANT SELECT, INSERT, UPDATE ON appointment_waitlist TO authenticated;
GRANT SELECT, INSERT, UPDATE ON appointment_reminders TO authenticated;

-- Grant access to views
GRANT SELECT ON appointment_analytics TO authenticated;
GRANT SELECT ON provider_schedule TO authenticated;
GRANT SELECT ON active_waitlist TO authenticated;

-- Grant execute on RPC functions
GRANT EXECUTE ON FUNCTION reschedule_appointment TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_appointment TO authenticated;
GRANT EXECUTE ON FUNCTION check_provider_availability TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON SCHEMA public IS 'Enhanced appointment management system with rescheduling, cancellation tracking, audit trail, provider availability, and waitlist management';
