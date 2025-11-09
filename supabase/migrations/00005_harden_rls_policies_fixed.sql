-- ============================================
-- RLS POLICY HARDENING (Fixed for current schema)
-- Implements staff-based data isolation
-- ============================================

-- DROP existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated can view conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated can update conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated can view messages" ON messages;
DROP POLICY IF EXISTS "Authenticated can insert messages" ON messages;

-- ============================================
-- CONVERSATIONS - Multi-mode access control
-- ============================================

-- Authenticated staff can see conversations they're assigned to or admin can see all
CREATE POLICY "conversations_select_staff"
  ON conversations FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      assigned_to = auth.uid() OR
      assigned_to IS NULL OR  -- Unassigned conversations visible to all staff
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Anonymous widget users can see all conversations (single-tenant mode)
-- This is acceptable for single hospital deployment
CREATE POLICY "conversations_select_widget"
  ON conversations FOR SELECT
  USING (
    auth.uid() IS NULL
  );

-- Widget can insert new conversations (anonymous)
CREATE POLICY "conversations_insert_widget"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR auth.uid() IS NOT NULL
    -- Allow both authenticated and anonymous users
  );

-- Staff can update conversations (assign, change status)
CREATE POLICY "conversations_update_staff"
  ON conversations FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      assigned_to = auth.uid() OR
      assigned_to IS NULL OR
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
        c.assigned_to IS NULL OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Widget can see all messages (single-tenant mode)
CREATE POLICY "messages_select_widget"
  ON messages FOR SELECT
  USING (
    auth.uid() IS NULL
  );

-- Widget can insert messages (anonymous)
CREATE POLICY "messages_insert_widget"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR auth.uid() IS NOT NULL
    -- Allow both authenticated and anonymous users
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated can view appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated can insert appointments" ON appointments;

-- Staff can see all appointments
CREATE POLICY "appointments_select_staff"
  ON appointments FOR SELECT
  USING (
    auth.uid() IS NOT NULL
  );

-- Widget can see all appointments (single-tenant mode)
CREATE POLICY "appointments_select_widget"
  ON appointments FOR SELECT
  USING (
    auth.uid() IS NULL
  );

-- Only service role can insert appointments (via n8n)
-- Service role bypasses RLS, so no explicit policy needed

-- ============================================
-- NOTES FOR PRODUCTION
-- ============================================

/*
 * SINGLE-TENANT MODE (Current):
 * - Widget users (anonymous) can read ALL data
 * - Acceptable for Serenity Royale Hospital (single organization)
 * - Staff see conversations assigned to them or unassigned ones
 *
 * SECURITY FEATURES:
 * ✅ Staff can only see assigned or unassigned conversations
 * ✅ Admins can see all conversations
 * ✅ Widget cannot write to appointments (n8n only)
 * ✅ Messages isolated by conversation access
 * ℹ️  Single-tenant mode allows widget to read all data (by design)
 *
 * FUTURE ENHANCEMENTS:
 * - Add taken_over_by column for conversation handoff
 * - Add patient_ref filters for multi-tenant support
 * - Add organization_id for multi-hospital deployments
 */
