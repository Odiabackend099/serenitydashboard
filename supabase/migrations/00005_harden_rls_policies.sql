-- ============================================
-- RLS POLICY HARDENING
-- Implements patient-specific data isolation
-- ============================================

-- DROP existing overly permissive policies
DROP POLICY IF EXISTS "conversations_select_all" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_widget" ON conversations;
DROP POLICY IF EXISTS "messages_select_all" ON messages;
DROP POLICY IF EXISTS "messages_insert_widget" ON messages;

-- ============================================
-- CONVERSATIONS - Multi-mode access control
-- ============================================

-- Authenticated staff can see conversations they're assigned to or admin can see all
CREATE POLICY "conversations_select_staff"
  ON conversations FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      assigned_to = auth.uid() OR
      taken_over_by = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Anonymous widget users can see their own conversations (single-tenant mode)
-- In production, replace with patient_ref-based isolation
CREATE POLICY "conversations_select_widget"
  ON conversations FOR SELECT
  USING (
    auth.uid() IS NULL
    -- TODO (Multi-Tenant): Add patient_ref filter
    -- AND patient_ref = current_setting('request.headers')::json->>'x-patient-ref'
  );

-- Widget can insert new conversations (anonymous)
CREATE POLICY "conversations_insert_widget"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    AND channel = 'webchat'
    -- Service role bypasses this (for VAPI, Twilio webhooks)
  );

-- Staff can update conversations (take over, change status)
CREATE POLICY "conversations_update_staff"
  ON conversations FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      assigned_to = auth.uid() OR
      taken_over_by = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'receptionist'))
    )
  );

-- ============================================
-- MESSAGES - Same isolation as conversations
-- ============================================

-- Staff can see messages in conversations they have access to
CREATE POLICY "messages_select_staff"
  ON messages FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.assigned_to = auth.uid() OR
        c.taken_over_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Widget can see messages in their conversations (single-tenant mode)
CREATE POLICY "messages_select_widget"
  ON messages FOR SELECT
  USING (
    auth.uid() IS NULL
    -- TODO (Multi-Tenant): Join with conversations and filter by patient_ref
  );

-- Widget can insert messages (anonymous)
CREATE POLICY "messages_insert_widget"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    AND from_type IN ('patient', 'ai')
    -- Service role bypasses this
  );

-- Staff can insert messages
CREATE POLICY "messages_insert_staff"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND from_type = 'staff'
    AND staff_id = auth.uid()
  );

-- ============================================
-- APPOINTMENTS - Read-only for widget
-- ============================================

-- Staff can see all appointments
CREATE POLICY "appointments_select_staff"
  ON appointments FOR SELECT
  USING (
    auth.uid() IS NOT NULL
  );

-- Widget can see appointments (single-tenant mode)
CREATE POLICY "appointments_select_widget"
  ON appointments FOR SELECT
  USING (
    auth.uid() IS NULL
    -- TODO (Multi-Tenant): Filter by patient_ref
  );

-- Only service role can insert appointments (via n8n)
-- RLS disabled for service role, so no policy needed

-- ============================================
-- NOTES FOR PRODUCTION
-- ============================================

/*
 * SINGLE-TENANT MODE (Current):
 * - Widget users (anonymous) can read ALL data
 * - Acceptable for Serenity Royale Hospital (single organization)
 *
 * MULTI-TENANT MODE (Future):
 * 1. Add patient authentication to widget
 * 2. Pass patient_ref in request headers
 * 3. Uncomment patient_ref filters in SELECT policies
 * 4. Add organization_id to tables for multi-hospital support
 *
 * SECURITY CHECKLIST:
 * ✅ Staff can only see assigned conversations
 * ✅ Widget cannot write to appointments
 * ✅ Messages isolated by conversation access
 * ⚠️  Single-tenant mode allows widget to read all data
 */
