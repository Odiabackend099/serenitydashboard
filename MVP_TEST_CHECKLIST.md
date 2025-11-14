# Serenity Hospital AI - MVP Test Checklist

**Date:** 2025-11-13
**Version:** 2.0.3
**Production URL:** https://web-rb4xjj4md-odia-backends-projects.vercel.app
**Status:** Testing in Progress

---

## MVP CORE FEATURES

### 1. APPOINTMENT BOOKING (Patient-Facing)

#### 1.1 Happy Path - Basic Booking
- [ ] **Test:** Open chat widget on homepage
- [ ] **Test:** Say "I want to book an appointment"
- [ ] **Expected:** AI asks for patient information
- [ ] **Test:** Provide name: "John Doe"
- [ ] **Expected:** AI acknowledges and asks for email
- [ ] **Test:** Provide email: "john@example.com"
- [ ] **Expected:** AI acknowledges and asks for phone
- [ ] **Test:** Provide phone: "+2348012345678"
- [ ] **Expected:** AI acknowledges and asks for date
- [ ] **Test:** Provide date: "tomorrow"
- [ ] **Expected:** AI converts to YYYY-MM-DD format and asks for time
- [ ] **Test:** Provide time: "2:00 PM"
- [ ] **Expected:** AI asks for reason
- [ ] **Test:** Provide reason: "Regular checkup"
- [ ] **Expected:** AI calls booking tool and confirms
- [ ] **Test:** Check email inbox
- [ ] **Expected:** Confirmation email received within 2 minutes
- [ ] **Test:** Check database (appointments table)
- [ ] **Expected:** New appointment record exists

**Success Criteria:** Appointment created + Email sent + Database updated

---

#### 1.2 Input Validation Tests

##### Email Validation
- [ ] **Test:** Provide invalid email: "notanemail"
- [ ] **Expected:** Error message: "Please provide a valid email address"
- [ ] **Test:** Provide email with XSS: "test@example.com<script>alert('xss')</script>"
- [ ] **Expected:** Sanitized and rejected or cleaned
- [ ] **Test:** Provide very long email (300 characters)
- [ ] **Expected:** Rejected (max 254 characters)

##### Phone Validation
- [ ] **Test:** Provide invalid phone: "12345"
- [ ] **Expected:** Error: "Please provide a valid phone number"
- [ ] **Test:** Provide international phone: "+44 20 1234 5678"
- [ ] **Expected:** Accepted and cleaned
- [ ] **Test:** Provide US phone: "(555) 123-4567"
- [ ] **Expected:** Accepted and cleaned

##### Date Validation
- [ ] **Test:** Provide past date: "2020-01-01"
- [ ] **Expected:** Error: "Please provide a valid future date"
- [ ] **Test:** Provide invalid date: "99/99/9999"
- [ ] **Expected:** Error about invalid date format
- [ ] **Test:** Provide "today"
- [ ] **Expected:** Converted to today's date in YYYY-MM-DD
- [ ] **Test:** Provide "tomorrow"
- [ ] **Expected:** Converted to tomorrow's date

##### Name Sanitization
- [ ] **Test:** Provide name with HTML: "John <script>alert(1)</script> Doe"
- [ ] **Expected:** Sanitized to "John alert(1) Doe" or similar
- [ ] **Test:** Provide name with special characters: "O'Brien"
- [ ] **Expected:** Accepted (apostrophe is valid)
- [ ] **Test:** Provide very long name (600 characters)
- [ ] **Expected:** Truncated to 500 characters

---

#### 1.3 AI Behavior Tests

- [ ] **Test:** Say "I'd like to book an appointment" (immediate request)
- [ ] **Expected:** AI DOES NOT call tool immediately
- [ ] **Expected:** AI asks for required information first
- [ ] **Test:** Provide all info in one message: "Book appointment for John Doe, john@test.com, +2348012345678, tomorrow at 2 PM for checkup"
- [ ] **Expected:** AI extracts all info and confirms before booking
- [ ] **Test:** Change information mid-conversation: "Actually, make it 3 PM"
- [ ] **Expected:** AI updates time and confirms new details

---

#### 1.4 Speech-to-Text (STT) Feature

- [ ] **Test:** Click microphone button in chat widget
- [ ] **Expected:** Button turns red, "Recording..." indicator appears
- [ ] **Test:** Speak: "I want to book an appointment"
- [ ] **Expected:** Text appears in input field after speaking
- [ ] **Test:** Browser without STT support (Firefox)
- [ ] **Expected:** Alert: "Speech recognition not supported in your browser"
- [ ] **Test:** Deny microphone permissions
- [ ] **Expected:** Alert: "Microphone access denied"
- [ ] **Test:** Speak with background noise
- [ ] **Expected:** Handles noise gracefully or shows "No speech detected"

---

### 2. ADMIN DASHBOARD

#### 2.1 Authentication

- [ ] **Test:** Navigate to dashboard without logging in
- [ ] **Expected:** Redirected to /login page
- [ ] **Test:** Login with valid credentials
- [ ] **Expected:** Redirected to /conversations page
- [ ] **Test:** Login with invalid credentials
- [ ] **Expected:** Error message displayed
- [ ] **Test:** Access protected route with expired session
- [ ] **Expected:** Redirected to login

---

#### 2.2 Conversations Page

- [ ] **Test:** View conversations list
- [ ] **Expected:** All conversations displayed with timestamps
- [ ] **Test:** Filter by channel (webchat/voice/whatsapp)
- [ ] **Expected:** Only matching conversations shown
- [ ] **Test:** Click on a conversation
- [ ] **Expected:** Message thread expands with full history
- [ ] **Test:** Send message in conversation (if feature enabled)
- [ ] **Expected:** Message appears in thread immediately
- [ ] **Test:** Real-time update (have assistant create appointment in another window)
- [ ] **Expected:** New conversation appears without refresh

---

#### 2.3 Calendar Page

- [ ] **Test:** Navigate to /calendar
- [ ] **Expected:** FullCalendar view loads with appointments
- [ ] **Test:** View appointment details (click on event)
- [ ] **Expected:** Appointment information modal/popup appears
- [ ] **Test:** Navigate to next month
- [ ] **Expected:** Future appointments load
- [ ] **Test:** Create new appointment while viewing calendar
- [ ] **Expected:** Appointment appears on calendar immediately

---

#### 2.4 Analytics Dashboard

- [ ] **Test:** Navigate to /analytics
- [ ] **Expected:** Dashboard loads with metrics
- [ ] **Test:** View "Conversations Today" metric
- [ ] **Expected:** Shows accurate count
- [ ] **Test:** View "Messages Today" metric
- [ ] **Expected:** Shows accurate count
- [ ] **Test:** View "Upcoming Appointments" metric
- [ ] **Expected:** Shows list of next 5 appointments
- [ ] **Test:** Check real-time updates (create appointment)
- [ ] **Expected:** Metrics update within 5 seconds

---

#### 2.5 Admin AI Assistant

- [ ] **Test:** Click chat widget icon (bottom-right)
- [ ] **Expected:** Admin chat widget opens
- [ ] **Test:** Ask "Show me today's stats"
- [ ] **Expected:** AI calls get_stats tool and returns metrics
- [ ] **Test:** Ask "How many appointments do we have today?"
- [ ] **Expected:** AI queries database and responds with count
- [ ] **Test:** Say "Book appointment for Sarah at sarah@test.com"
- [ ] **Expected:** AI collects all required info before booking

---

### 3. SECURITY & PERFORMANCE

#### 3.1 Input Sanitization (Recent Fixes)

- [ ] **Test:** XSS attempt in name field: "<img src=x onerror=alert(1)>"
- [ ] **Expected:** Sanitized, no script execution
- [ ] **Test:** SQL injection attempt in email: "'; DROP TABLE appointments; --"
- [ ] **Expected:** Rejected by validation or escaped by Supabase
- [ ] **Test:** Javascript protocol in any field: "javascript:alert(1)"
- [ ] **Expected:** Removed by sanitization
- [ ] **Test:** Event handler injection: "onclick=alert(1)"
- [ ] **Expected:** Removed by sanitization

---

#### 3.2 PHI Protection (Recent Fixes)

- [ ] **Test:** Book appointment with real email/phone
- [ ] **Test:** Open browser console (F12)
- [ ] **Expected:** NO full email/phone visible in logs
- [ ] **Expected:** Only see "Email present=true" or similar
- [ ] **Test:** Use STT to provide personal info
- [ ] **Expected:** Transcript NOT logged to console, only length

---

#### 3.3 Request Timeout Protection (Recent Fixes)

- [ ] **Test:** Simulate slow network (Chrome DevTools → Network → Slow 3G)
- [ ] **Test:** Book appointment
- [ ] **Expected:** Request times out after 30 seconds with error message
- [ ] **Expected:** No infinite loading state
- [ ] **Test:** N8N webhook down (temporarily disable n8n)
- [ ] **Expected:** Error after 30 seconds, user-friendly message

---

#### 3.4 Memory Leak Prevention (Recent Fixes)

- [ ] **Test:** Open chat widget
- [ ] **Test:** Use STT multiple times
- [ ] **Test:** Close and reopen widget 10 times
- [ ] **Expected:** No memory leaks in Chrome Task Manager
- [ ] **Expected:** Event handlers properly cleaned up

---

#### 3.5 State Management (Recent Fixes)

- [ ] **Test:** Book appointment for Patient A
- [ ] **Test:** Provide email/phone for Patient A
- [ ] **Test:** Close chat widget
- [ ] **Test:** Reopen widget
- [ ] **Expected:** appointmentData cleared (no Patient A data)
- [ ] **Test:** Book appointment for Patient B
- [ ] **Expected:** No Patient A data leaked to Patient B

---

#### 3.6 Debouncing (Recent Fixes)

- [ ] **Test:** Type message in chat
- [ ] **Test:** Rapidly click Send button 5 times
- [ ] **Expected:** Message sent only ONCE
- [ ] **Expected:** No duplicate appointments created

---

### 4. ERROR HANDLING

#### 4.1 Network Errors

- [ ] **Test:** Disconnect internet
- [ ] **Test:** Try to book appointment
- [ ] **Expected:** User-friendly error: "Connection problem. Please check your internet."
- [ ] **Test:** Reconnect and retry
- [ ] **Expected:** Booking succeeds

---

#### 4.2 Backend Errors

- [ ] **Test:** Invalid n8n webhook URL (misconfiguration)
- [ ] **Expected:** Error: "Booking system temporarily unavailable"
- [ ] **Test:** Database connection failure (stop Supabase locally)
- [ ] **Expected:** Error: "Database connection issue"
- [ ] **Test:** Groq API rate limit exceeded
- [ ] **Expected:** Error: "AI service busy, please try again"

---

#### 4.3 User Errors

- [ ] **Test:** Leave all fields empty and try to submit
- [ ] **Expected:** Validation errors for each required field
- [ ] **Test:** Provide contradictory information: "Book for tomorrow... no wait, today"
- [ ] **Expected:** AI asks for clarification
- [ ] **Test:** Say gibberish: "asdf qwer zxcv"
- [ ] **Expected:** AI asks to rephrase or provides helpful prompt

---

### 5. EDGE CASES

#### 5.1 Concurrent Bookings

- [ ] **Test:** Open 2 browser windows
- [ ] **Test:** Book same time slot in both windows simultaneously
- [ ] **Expected:** One succeeds, one gets "Slot unavailable" (if conflict detection enabled)
- [ ] **OR Expected:** Both succeed (if no conflict detection)

---

#### 5.2 Special Characters & Internationalization

- [ ] **Test:** Book with name: "José María O'Brien-Smith"
- [ ] **Expected:** Accepted and stored correctly
- [ ] **Test:** Book with email: "test+alias@example.com"
- [ ] **Expected:** Accepted (+ is valid in email)
- [ ] **Test:** Book with international phone: "+44 20 7946 0958"
- [ ] **Expected:** Validated and accepted

---

#### 5.3 Browser Compatibility

- [ ] **Test:** Chrome (latest)
- [ ] **Expected:** All features work
- [ ] **Test:** Firefox (latest)
- [ ] **Expected:** All features work (STT may not be available)
- [ ] **Test:** Safari (latest)
- [ ] **Expected:** All features work
- [ ] **Test:** Mobile Chrome (Android)
- [ ] **Expected:** Responsive UI, all features work
- [ ] **Test:** Mobile Safari (iOS)
- [ ] **Expected:** Responsive UI, all features work

---

#### 5.4 Large Data Sets

- [ ] **Test:** View conversations with 100+ messages
- [ ] **Expected:** Scrolling works, performance acceptable
- [ ] **Test:** View calendar with 50+ appointments in one day
- [ ] **Expected:** Calendar renders correctly
- [ ] **Test:** Analytics with 1000+ conversations
- [ ] **Expected:** Metrics load within 3 seconds

---

### 6. INTEGRATION TESTS

#### 6.1 n8n Workflow

- [ ] **Test:** Book appointment through chat
- [ ] **Test:** Check n8n execution history
- [ ] **Expected:** Workflow triggered successfully
- [ ] **Expected:** Gmail node sent email
- [ ] **Expected:** Database node created record

---

#### 6.2 Supabase

- [ ] **Test:** Book appointment
- [ ] **Test:** Check Supabase dashboard → appointments table
- [ ] **Expected:** New row with correct data
- [ ] **Test:** Check appointment_audit_log table
- [ ] **Expected:** Audit entry created (if enabled)

---

#### 6.3 Email Delivery

- [ ] **Test:** Book appointment with real email
- [ ] **Test:** Check inbox (including spam folder)
- [ ] **Expected:** Email received within 2 minutes
- [ ] **Expected:** Email contains: name, date, time, reason
- [ ] **Test:** Check email formatting
- [ ] **Expected:** Professional HTML format with hospital branding

---

### 7. PERFORMANCE BENCHMARKS

- [ ] **Test:** Measure page load time (homepage)
- [ ] **Expected:** < 3 seconds on 3G network
- [ ] **Test:** Measure time to first interaction (chat widget)
- [ ] **Expected:** < 2 seconds
- [ ] **Test:** Measure AI response time (simple query)
- [ ] **Expected:** < 2 seconds
- [ ] **Test:** Measure appointment booking time (end-to-end)
- [ ] **Expected:** < 10 seconds total
- [ ] **Test:** Measure bundle size
- [ ] **Expected:** < 1.5 MB (currently 1.35 MB)

---

## TEST EXECUTION LOG

### Test Run #1: [DATE]
**Tester:** [NAME]
**Environment:** Production / Staging
**Browser:** Chrome 120 / Firefox 121 / Safari 17

| Test | Status | Notes |
|------|--------|-------|
| 1.1 Happy Path Booking | ⏳ Pending | |
| 1.2 Input Validation | ⏳ Pending | |
| ... | | |

---

## KNOWN ISSUES

_(To be filled during testing)_

| Issue # | Severity | Description | Workaround | Fix ETA |
|---------|----------|-------------|------------|---------|
| | | | | |

---

## TEST SUMMARY

**Total Tests:** TBD
**Passed:** 0
**Failed:** 0
**Blocked:** 0

**MVP Ready for Production:** ⏳ Testing in Progress

---

## NOTES

- Some tests require manual verification (email delivery, n8n workflows)
- Performance tests should be run on production environment
- Security tests should be verified by security team before production use with real PHI
- Tests marked with ⚠️ require external service configuration
