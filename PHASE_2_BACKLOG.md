# Serenity Hospital AI - Phase 2 Feature Backlog

**MVP Version:** 2.0.3
**Phase 2 Target:** Q1-Q3 2026
**Last Updated:** 2025-11-13

---

## OVERVIEW

This document contains all features that were **deferred from MVP** to maintain focus on core appointment booking functionality. Features are prioritized by business value and technical feasibility.

---

## PRIORITY FRAMEWORK

**P0 (Critical)** - Blocks core workflows, high user demand
**P1 (High)** - Significant value add, moderate effort
**P2 (Medium)** - Nice-to-have, improves experience
**P3 (Low)** - Future vision, low urgency

**Effort:**
- 🟢 Small (1-3 days)
- 🟡 Medium (1-2 weeks)
- 🔴 Large (3-8 weeks)

---

## PHASE 2A: APPOINTMENT MANAGEMENT (Q1 2026)

### Feature 1: Self-Service Appointment Rescheduling
**Priority:** P0 (Critical)
**Effort:** 🟡 Medium (1 week)
**Business Value:** High - Reduces admin workload by 40%

**Description:**
Allow patients to reschedule their own appointments through the chat widget without calling the hospital.

**Requirements:**
- ✅ Tool definition exists (`reschedule_appointment`)
- ❌ n8n workflow for rescheduling (needs build)
- ❌ Email notification template (needs design)
- ❌ Conflict detection logic (optional)

**User Story:**
```
As a patient,
I want to reschedule my appointment via chat,
So that I don't have to call during business hours.
```

**Acceptance Criteria:**
- Patient provides appointment_id and email for verification
- System validates patient owns the appointment
- Patient selects new date/time
- System checks availability (optional)
- Confirmation email sent to patient
- Old slot freed up for other patients
- Calendar updates automatically

**Technical Tasks:**
1. Build n8n workflow: "Reschedule Appointment"
   - Nodes: Webhook → Supabase Update → Gmail Send
2. Design email template for reschedule confirmation
3. Update ChatWidget to show appointment_id in confirmation
4. Add "Want to reschedule?" quick action in chat
5. Test edge cases (past appointments, invalid IDs)

**Dependencies:** None

---

### Feature 2: Self-Service Appointment Cancellation
**Priority:** P0 (Critical)
**Effort:** 🟢 Small (3 days)
**Business Value:** High - Reduces no-shows by 25%

**Description:**
Allow patients to cancel appointments with confirmation step to prevent accidental cancellations.

**Requirements:**
- ✅ Tool definition exists (`cancel_appointment`)
- ❌ n8n workflow for cancellation (needs build)
- ❌ Confirmation UX (needs design)
- ❌ Cancellation email template

**User Story:**
```
As a patient,
I want to cancel my appointment if I can't make it,
So that the slot becomes available for other patients.
```

**Acceptance Criteria:**
- Patient provides appointment_id and email
- System shows appointment details for confirmation
- Patient explicitly confirms cancellation
- Appointment marked as "cancelled" in database
- Cancellation email sent to patient
- Admin notified of cancellation (optional)
- Slot freed up in calendar

**Technical Tasks:**
1. Build n8n workflow: "Cancel Appointment"
2. Add confirmation dialog in ChatWidget
3. Design cancellation email template
4. Update analytics to track cancellation rate
5. Add "Cancel Appointment" quick action

**Dependencies:** None

---

### Feature 3: Appointment Conflict Detection
**Priority:** P1 (High)
**Effort:** 🟡 Medium (1 week)
**Business Value:** Medium - Prevents double-bookings

**Description:**
Check availability before confirming booking to prevent two patients booking the same slot.

**Requirements:**
- ✅ Tool partially implemented (`check_availability`)
- ❌ Complete availability logic
- ❌ Doctor-specific availability
- ❌ Time slot configuration

**User Story:**
```
As a hospital administrator,
I want the system to prevent double-bookings,
So that doctors don't have scheduling conflicts.
```

**Acceptance Criteria:**
- System checks database for existing appointments at requested time
- If conflict exists, suggest alternative times
- Support multiple doctors with separate schedules (optional)
- Handle buffer times between appointments
- Real-time availability updates

**Technical Tasks:**
1. Complete `check_availability` function logic
2. Query appointments table for conflicts
3. Add business rules (buffer time, max per slot)
4. Implement alternative time suggestion algorithm
5. Update booking flow to check before confirming
6. Add override for admin bookings (optional)

**Dependencies:** None

---

### Feature 4: Doctor Selection & Availability
**Priority:** P1 (High)
**Effort:** 🔴 Large (3 weeks)
**Business Value:** High - Enables multi-provider scheduling

**Description:**
Allow patients to select specific doctors and view their individual availability.

**Requirements:**
- ❌ Doctor profiles table (needs creation)
- ❌ Doctor availability schedule
- ❌ Doctor specialties
- ❌ UI for doctor selection

**User Story:**
```
As a patient,
I want to book with my preferred doctor,
So that I see the same provider each visit.
```

**Acceptance Criteria:**
- List of available doctors with specialties
- Each doctor has individual schedule
- Show only available time slots per doctor
- Support recurring schedules (Mon-Fri 9-5, etc.)
- Support doctor time-off/vacation blocks
- Default to any available doctor if no preference

**Technical Tasks:**
1. Create `doctors` table (schema design)
2. Create `doctor_availability` table
3. Build admin UI for managing doctor schedules
4. Update chat flow to ask "Any doctor preference?"
5. Filter availability by selected doctor
6. Update calendar view to show per-doctor schedules
7. Add doctor info to confirmation emails

**Dependencies:** Database migration, Admin UI updates

---

## PHASE 2B: COMMUNICATION CHANNELS (Q1-Q2 2026)

### Feature 5: WhatsApp Business Integration
**Priority:** P1 (High)
**Effort:** 🟡 Medium (2 weeks)
**Business Value:** High - 60% of patients prefer WhatsApp

**Description:**
Enable patients to book appointments via WhatsApp messages.

**Requirements:**
- ✅ Database tables exist (`whatsapp_conversations`, `whatsapp_messages`)
- ✅ Edge function exists (`twilio-whatsapp-webhook`)
- ✅ WhatsApp components exist (UI ready)
- ❌ Twilio WhatsApp Business account
- ❌ Meta WhatsApp Business API approval
- ❌ End-to-end testing

**User Story:**
```
As a patient,
I want to book appointments via WhatsApp,
So that I can use my preferred messaging app.
```

**Acceptance Criteria:**
- Patient messages WhatsApp business number
- AI responds with appointment booking flow
- Full conversation logged to database
- Confirmation sent via WhatsApp (no email required)
- Admin can view WhatsApp conversations in dashboard
- Analytics track WhatsApp bookings separately

**Technical Tasks:**
1. Apply for WhatsApp Business API access
2. Configure Twilio WhatsApp number
3. Connect webhook to existing edge function
4. Test end-to-end booking flow
5. Load test with 100+ concurrent messages
6. Train AI on WhatsApp-specific language patterns
7. Enable WhatsApp analytics in dashboard

**Dependencies:** Twilio account, Meta approval (can take 2-4 weeks)

---

### Feature 6: Voice AI Appointment Booking (VAPI)
**Priority:** P2 (Medium)
**Effort:** 🔴 Large (4 weeks)
**Business Value:** Medium - 20% of patients prefer phone

**Description:**
Enable patients to book appointments via phone call to AI voice assistant.

**Requirements:**
- ✅ VAPI client integrated
- ✅ Voice call UI exists
- ✅ Edge function webhook exists
- ❌ Voice-to-appointment flow mapping
- ❌ Phone number provisioning
- ❌ End-to-end testing

**User Story:**
```
As a patient (especially elderly),
I want to call and speak to book an appointment,
So that I don't need to use a computer.
```

**Acceptance Criteria:**
- Patient calls designated phone number
- VAPI answers with friendly greeting
- AI collects all booking information via voice
- Appointment created in database
- Confirmation sent via SMS + email
- Call recording stored for quality assurance
- Conversation transcribed and logged

**Technical Tasks:**
1. Map VAPI webhook events to appointment flow
2. Configure VAPI assistant with booking persona
3. Provision Twilio phone number for inbound calls
4. Build SMS confirmation workflow
5. Test voice recognition accuracy (multiple accents)
6. Handle edge cases (background noise, unclear speech)
7. Add voice analytics to dashboard
8. Train staff on handling VAPI escalations

**Dependencies:** VAPI subscription, Twilio phone number

---

### Feature 7: SMS Appointment Reminders
**Priority:** P1 (High)
**Effort:** 🟢 Small (3 days)
**Business Value:** High - Reduces no-shows by 30%

**Description:**
Automatically send SMS reminders 24 hours before appointments.

**Requirements:**
- ✅ Tool defined (`send_sms_reminder`)
- ❌ Twilio SMS configuration
- ❌ Cron job scheduler
- ❌ Reminder template

**User Story:**
```
As a patient,
I want to receive an SMS reminder the day before,
So that I don't forget my appointment.
```

**Acceptance Criteria:**
- SMS sent 24 hours before appointment
- Contains: date, time, doctor, location
- HIPAA-compliant (minimal health info)
- Patient can reply CANCEL to cancel
- Failed SMS logged for manual follow-up
- Admin can disable for specific patients (opt-out)

**Technical Tasks:**
1. Configure Twilio SMS credentials
2. Create Supabase edge function cron job
3. Query upcoming appointments (tomorrow)
4. Send SMS via Twilio API
5. Design HIPAA-compliant SMS template
6. Handle SMS delivery failures
7. Log all SMS sends to audit trail

**Dependencies:** Twilio SMS account, Cron scheduler

---

## PHASE 2C: CALENDAR & SCHEDULING (Q2 2026)

### Feature 8: Google Calendar Sync
**Priority:** P1 (High)
**Effort:** 🟡 Medium (2 weeks)
**Business Value:** Medium - Improves admin workflow

**Description:**
Automatically sync appointments to Google Calendar for staff visibility.

**Requirements:**
- ✅ Edge function exists (`google-calendar-sync`)
- ❌ OAuth 2.0 configuration
- ❌ Google Workspace account
- ❌ Calendar selection UI

**User Story:**
```
As a hospital administrator,
I want appointments synced to Google Calendar,
So that I can view them alongside other commitments.
```

**Acceptance Criteria:**
- New appointments auto-create Google Calendar events
- Reschedules update Google Calendar events
- Cancellations delete Google Calendar events
- Each doctor has separate Google Calendar (optional)
- Two-way sync (changes in Google reflect in system)
- Admin can enable/disable per doctor

**Technical Tasks:**
1. Set up Google Cloud Project
2. Configure OAuth 2.0 credentials
3. Complete edge function calendar sync logic
4. Build OAuth flow in admin settings
5. Test create/update/delete operations
6. Handle API rate limits
7. Add sync status to admin dashboard

**Dependencies:** Google Workspace account, OAuth approval

---

### Feature 9: iCal Export
**Priority:** P2 (Medium)
**Effort:** 🟢 Small (2 days)
**Business Value:** Low - Alternative to Google sync

**Description:**
Export appointments to .ics file for import to any calendar app.

**User Story:**
```
As an administrator,
I want to export appointments to iCal format,
So that I can import them into Apple Calendar or Outlook.
```

**Acceptance Criteria:**
- Export single appointment as .ics file
- Export date range (week/month) as .ics
- Include all appointment details (name, time, reason)
- Compatible with Apple Calendar, Outlook, Thunderbird

**Technical Tasks:**
1. Create `/api/export/ical/:appointment_id` endpoint
2. Generate RFC 5545 compliant .ics file
3. Add "Export" button to calendar view
4. Support batch export for date ranges

**Dependencies:** None

---

### Feature 10: Drag-and-Drop Calendar Rescheduling
**Priority:** P2 (Medium)
**Effort:** 🟡 Medium (1 week)
**Business Value:** Medium - Improves admin UX

**Description:**
Allow admins to reschedule by dragging appointments to new time slots.

**User Story:**
```
As an administrator,
I want to drag appointments to reschedule them,
So that I can quickly adjust the schedule.
```

**Acceptance Criteria:**
- Click and drag appointment to new time slot
- Validation prevents conflicts
- Patient notified of reschedule via email
- Works on desktop (not mobile)
- Undo functionality

**Technical Tasks:**
1. Enable FullCalendar editable mode
2. Add onEventDrop handler
3. Call reschedule API on drop
4. Show confirmation dialog
5. Send reschedule notification email
6. Update appointment in database

**Dependencies:** Feature 1 (reschedule workflow) must exist

---

## PHASE 2D: PATIENT MANAGEMENT (Q2 2026)

### Feature 11: Patient Profiles
**Priority:** P1 (High)
**Effort:** 🔴 Large (4 weeks)
**Business Value:** High - Enables continuity of care

**Description:**
Create dedicated patient profiles with appointment history and contact info.

**Requirements:**
- ❌ `patients` table (needs creation)
- ❌ Patient profile UI
- ❌ Merge logic for duplicate patients

**User Story:**
```
As a hospital administrator,
I want to view patient appointment history,
So that I can provide better continuity of care.
```

**Acceptance Criteria:**
- One profile per unique patient (by email or phone)
- Shows all past and upcoming appointments
- Contact information (name, email, phone)
- Preferred communication channel
- Appointment statistics (total, no-shows, cancellations)
- Notes field for staff comments
- HIPAA-compliant access controls

**Technical Tasks:**
1. Design `patients` table schema
2. Migrate existing appointment data to patients
3. Build patient profile view in admin dashboard
4. Create patient search/filter UI
5. Add "View Patient" link from appointments
6. Implement duplicate detection & merge tool
7. Add patient notes feature (optional)
8. Enforce RLS policies for patient data

**Dependencies:** Database migration, potential downtime

---

### Feature 12: Patient Appointment History (Self-Service)
**Priority:** P2 (Medium)
**Effort:** 🟡 Medium (2 weeks)
**Business Value:** Medium - Improves patient experience

**Description:**
Allow patients to view their own appointment history via chat.

**Requirements:**
- ✅ Tool exists (`get_my_appointments`)
- ❌ Patient authentication
- ❌ UI for displaying appointment list

**User Story:**
```
As a patient,
I want to see my past appointments,
So that I can track my medical visits.
```

**Acceptance Criteria:**
- Patient provides email or phone for verification
- System displays upcoming and past appointments
- Shows: date, time, doctor, reason, status
- Filtered by patient (secure, no data leaks)
- Works for authenticated and anonymous patients

**Technical Tasks:**
1. Test existing `get_my_appointments` tool
2. Design chat UI for displaying appointment list
3. Add verification step (email + DOB or appointment_id)
4. Format appointment data in user-friendly way
5. Add quick actions ("Reschedule", "Cancel")

**Dependencies:** None (tool already exists)

---

## PHASE 2E: ANALYTICS & REPORTING (Q1 2026)

### Feature 13: Custom Date Range Analytics
**Priority:** P1 (High)
**Effort:** 🟢 Small (3 days)
**Business Value:** High - Better business insights

**Description:**
Allow admins to view analytics for custom date ranges (not just "today").

**User Story:**
```
As an administrator,
I want to view analytics for any date range,
So that I can generate monthly/quarterly reports.
```

**Acceptance Criteria:**
- Date range picker in analytics dashboard
- Presets: Today, This Week, This Month, Last Month, Custom
- Metrics: Appointments, Conversations, No-shows
- Comparison with previous period (optional)

**Technical Tasks:**
1. Add date range picker component
2. Update analytics queries to accept date params
3. Modify `get_analytics` tool for custom ranges
4. Add "Compare to previous period" toggle
5. Display delta (increase/decrease)

**Dependencies:** None

---

### Feature 14: Export Reports (CSV/Excel)
**Priority:** P2 (Medium)
**Effort:** 🟢 Small (2 days)
**Business Value:** Medium - Offline analysis

**Description:**
Export analytics and appointment data to CSV or Excel.

**User Story:**
```
As an administrator,
I want to export reports to Excel,
So that I can analyze data offline or share with stakeholders.
```

**Acceptance Criteria:**
- Export appointments list as CSV
- Export analytics summary as Excel
- Include all relevant columns (name, date, status, etc.)
- PHI-protected (require admin auth)
- Export respects current filters

**Technical Tasks:**
1. Create `/api/export/appointments` endpoint
2. Generate CSV format with proper escaping
3. Add "Export" button to appointments page
4. Optional: Use library for .xlsx format
5. Log all exports for audit trail

**Dependencies:** None

---

### Feature 15: Advanced AI Analytics
**Priority:** P3 (Low)
**Effort:** 🔴 Large (3 weeks)
**Business Value:** Medium - Insights into AI performance

**Description:**
Track and analyze AI conversation quality, tool usage, and patient satisfaction.

**User Story:**
```
As a hospital administrator,
I want to see how well the AI is performing,
So that I can identify areas for improvement.
```

**Acceptance Criteria:**
- Track tool call success/failure rates
- Measure conversation completion rate
- Identify common failure patterns
- Sentiment analysis on patient messages
- AI confidence scores per interaction
- Average conversation length

**Technical Tasks:**
1. Add telemetry to groq-chat edge function
2. Create `ai_analytics` table
3. Build analytics dashboard view
4. Implement sentiment analysis (optional)
5. Track tool execution times
6. Add alerts for degraded performance

**Dependencies:** Analytics infrastructure

---

## PHASE 3: ADVANCED FEATURES (Q3 2026)

### Feature 16: Multi-Language Support
**Priority:** P2 (Medium)
**Effort:** 🔴 Large (6 weeks)
**Business Value:** High (for international hospitals)

**Description:**
Support multiple languages (Spanish, French, Arabic, Chinese, etc.)

**Technical Tasks:**
- Internationalization (i18n) framework
- Translate UI strings
- Multi-language AI prompts
- Language detection in chat
- Translation API integration (optional)

**Estimated Effort:** 6 weeks

---

### Feature 17: Payment Integration
**Priority:** P3 (Low)
**Effort:** 🔴 Large (8 weeks)
**Business Value:** High (revenue-generating)

**Description:**
Accept payments for appointment deposits or co-pays.

**Technical Tasks:**
- Stripe/PayPal integration
- PCI compliance
- Payment flow in chat
- Refund handling
- Billing reports

**Estimated Effort:** 8 weeks

---

### Feature 18: Telemedicine Integration
**Priority:** P3 (Low)
**Effort:** 🔴 Large (8 weeks)
**Business Value:** High (post-COVID demand)

**Description:**
Enable virtual video appointments via integrated telemedicine platform.

**Technical Tasks:**
- Video platform integration (Zoom API, Twilio Video)
- Virtual appointment type
- Waiting room UI
- Provider video dashboard

**Estimated Effort:** 8 weeks

---

### Feature 19: Mobile Apps (iOS/Android)
**Priority:** P3 (Low)
**Effort:** 🔴 Large (12 weeks)
**Business Value:** Medium (web app works on mobile)

**Description:**
Native iOS and Android apps for better mobile experience.

**Technical Tasks:**
- React Native setup
- Push notifications
- App store submission
- Deep linking

**Estimated Effort:** 12 weeks

---

### Feature 20: Medical Records Integration
**Priority:** P3 (Low)
**Effort:** 🔴 Large (12 weeks)
**Business Value:** High (but out of MVP scope)

**Description:**
Integrate with existing EHR/EMR systems (Epic, Cerner, etc.)

**Technical Tasks:**
- HL7/FHIR API integration
- Patient record sync
- Consent management
- Compliance verification

**Estimated Effort:** 12 weeks

---

## SUMMARY & ROADMAP

### Phase 2A (Q1 2026) - 8 weeks
**Focus:** Complete Core Appointment Features
- ✅ Self-service reschedule
- ✅ Self-service cancel
- ✅ Conflict detection
- ✅ Doctor selection

**Estimated Team:** 2 engineers

---

### Phase 2B (Q1-Q2 2026) - 8 weeks
**Focus:** Multi-Channel Communication
- ✅ WhatsApp activation
- ✅ Voice AI completion
- ✅ SMS reminders

**Estimated Team:** 2 engineers + 1 DevOps

---

### Phase 2C (Q2 2026) - 4 weeks
**Focus:** Calendar & Scheduling Enhancements
- ✅ Google Calendar sync
- ✅ iCal export
- ✅ Drag-and-drop scheduling

**Estimated Team:** 1 engineer

---

### Phase 2D (Q2 2026) - 6 weeks
**Focus:** Patient Management
- ✅ Patient profiles
- ✅ Appointment history

**Estimated Team:** 2 engineers

---

### Phase 2E (Q1 2026) - 2 weeks
**Focus:** Analytics & Reporting
- ✅ Custom date ranges
- ✅ Report exports
- ✅ AI analytics

**Estimated Team:** 1 engineer

---

### Phase 3 (Q3 2026+) - 40+ weeks
**Focus:** Advanced Features
- Multi-language
- Payments
- Telemedicine
- Mobile apps
- EHR integration

**Estimated Team:** 4-6 engineers

---

## TOTAL ESTIMATED EFFORT

**Phase 2 Total:** ~28 engineering weeks
**Phase 3 Total:** ~40+ engineering weeks
**Grand Total:** ~68+ engineering weeks (~17 months with 1 engineer, or ~5 months with 4 engineers)

---

## FEEDBACK & PRIORITIZATION

**Want to reprioritize?**
Contact: product-team@serenityhospital.com

**Have a new feature idea?**
Submit via: admin dashboard → Settings → Feature Requests

---

**Document Version:** 1.0
**Next Review:** 2025-12-13
**Owner:** Product Team
