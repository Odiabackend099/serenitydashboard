# Appointment Management System - Complete Implementation Guide

## Overview
This document provides the complete implementation for making the Serenity Hospital AI assistant "irresistible and easy to use" with comprehensive appointment management features.

---

## Phase 1: Database Layer ✅ COMPLETE

### Migration File: `supabase/migrations/00020_appointment_management_enhancements.sql`

**Features Added:**
1. **Enhanced Appointments Table**
   - `doctor_name`, `duration_minutes`, `rescheduled_from`
   - `cancelled_by`, `cancellation_reason`, `cancellation_timestamp`
   - `check_in_time`, `no_show_reason`, `reschedule_count`

2. **Appointment Audit Log**
   - Tracks all changes (created, updated, rescheduled, cancelled, completed, no_show)
   - Stores previous_data and new_data as JSONB
   - Automatic tracking via trigger

3. **Provider Availability**
   - Weekly schedule for each doctor
   - Configurable appointment duration
   - Blocked times for holidays/meetings

4. **Appointment Waitlist**
   - Priority-based waitlist management
   - Automatic slot offering when appointments cancelled

5. **Appointment Reminders Log**
   - Track all reminders (SMS, Email, WhatsApp)
   - Delivery status tracking

6. **RPC Functions**
   - `reschedule_appointment()`
   - `cancel_appointment()`
   - `check_provider_availability()`

**To Apply:**
```bash
cd "/Users/odiadev/Desktop/serenity dasboard"
supabase db push
```

---

## Phase 2: AI Tools Enhancement

### File: `apps/web/src/lib/groqTools.ts`

### New Tools to Add:

#### 1. Reschedule Appointment Tool

Add this after `create_appointment_enhanced` (around line 500):

```typescript
{
  type: 'function' as const,
  function: {
    name: 'reschedule_appointment',
    description: 'Reschedule an existing appointment to a new date and time. ALWAYS suggest 2-3 alternative time slots before rescheduling.',
    parameters: {
      type: 'object',
      properties: {
        appointment_id: {
          type: 'string',
          description: 'The UUID of the appointment to reschedule',
        },
        current_date: {
          type: 'string',
          description: 'Current appointment date (YYYY-MM-DD) for verification',
        },
        current_time: {
          type: 'string',
          description: 'Current appointment time (HH:MM) for verification',
        },
        new_date: {
          type: 'string',
          description: 'New appointment date (YYYY-MM-DD)',
        },
        new_time: {
          type: 'string',
          description: 'New appointment time (HH:MM 24-hour format)',
        },
        reason: {
          type: 'string',
          description: 'Optional reason for rescheduling',
        },
        notify_patient: {
          type: 'boolean',
          description: 'Whether to send confirmation email/SMS to patient (default: true)',
        },
      },
      required: ['appointment_id', 'new_date', 'new_time'],
    },
  },
},
```

#### 2. Cancel Appointment Tool

```typescript
{
  type: 'function' as const,
  function: {
    name: 'cancel_appointment',
    description: 'Cancel an appointment. IMPORTANT: Always ask patient for cancellation reason before executing.',
    parameters: {
      type: 'object',
      properties: {
        appointment_id: {
          type: 'string',
          description: 'The UUID of the appointment to cancel',
        },
        reason: {
          type: 'string',
          enum: ['schedule_conflict', 'feeling_better', 'emergency', 'financial', 'relocating', 'other'],
          description: 'Reason for cancellation - helps improve service',
        },
        reason_details: {
          type: 'string',
          description: 'Additional details about the cancellation',
        },
        cancelled_by: {
          type: 'string',
          enum: ['patient', 'staff', 'system'],
          description: 'Who initiated the cancellation',
        },
        notify_patient: {
          type: 'boolean',
          description: 'Whether to send cancellation confirmation (default: true)',
        },
        offer_reschedule: {
          type: 'boolean',
          description: 'Whether to offer alternative times (default: true)',
        },
      },
      required: ['appointment_id', 'reason'],
    },
  },
},
```

#### 3. Find Patient Appointments Tool

```typescript
{
  type: 'function' as const,
  function: {
    name: 'find_patient_appointments',
    description: 'Find all appointments for a patient by phone number or email. Useful for rescheduling/cancellation when appointment_id is unknown.',
    parameters: {
      type: 'object',
      properties: {
        patient_phone: {
          type: 'string',
          description: 'Patient phone number',
        },
        patient_email: {
          type: 'string',
          description: 'Patient email address',
        },
        include_past: {
          type: 'boolean',
          description: 'Include past appointments in results (default: false)',
        },
        status_filter: {
          type: 'string',
          enum: ['all', 'upcoming', 'pending', 'confirmed', 'cancelled'],
          description: 'Filter by appointment status',
        },
      },
    },
  },
},
```

#### 4. Suggest Alternative Times Tool

```typescript
{
  type: 'function' as const,
  function: {
    name: 'suggest_alternative_times',
    description: 'Get AI-powered suggestions for alternative appointment times based on provider availability and patient history.',
    parameters: {
      type: 'object',
      properties: {
        original_date: {
          type: 'string',
          description: 'Original requested date (YYYY-MM-DD)',
        },
        original_time: {
          type: 'string',
          description: 'Original requested time (HH:MM)',
        },
        doctor_name: {
          type: 'string',
          description: 'Preferred doctor (optional)',
        },
        appointment_type: {
          type: 'string',
          enum: ['consultation', 'follow-up', 'emergency', 'specialist', 'checkup'],
          description: 'Type of appointment',
        },
        preferred_time_of_day: {
          type: 'string',
          enum: ['morning', 'afternoon', 'evening', 'any'],
          description: 'Patient\'s preferred time of day',
        },
        num_suggestions: {
          type: 'number',
          description: 'Number of alternatives to suggest (default: 3)',
        },
      },
      required: ['original_date'],
    },
  },
},
```

#### 5. Join Waitlist Tool

```typescript
{
  type: 'function' as const,
  function: {
    name: 'join_waitlist',
    description: 'Add patient to waitlist for cancelled/available slots. Patient will be notified when a slot opens up.',
    parameters: {
      type: 'object',
      properties: {
        patient_ref: {
          type: 'string',
          description: 'Patient identifier (phone number)',
        },
        patient_name: {
          type: 'string',
          description: 'Patient full name',
        },
        patient_email: {
          type: 'string',
          description: 'Patient email',
        },
        patient_phone: {
          type: 'string',
          description: 'Patient phone number',
        },
        preferred_date: {
          type: 'string',
          description: 'Preferred date (YYYY-MM-DD) or null for any date',
        },
        preferred_time_range: {
          type: 'string',
          enum: ['morning', 'afternoon', 'evening', 'any'],
          description: 'Preferred time of day',
        },
        appointment_type: {
          type: 'string',
          enum: ['consultation', 'follow-up', 'emergency', 'specialist', 'checkup'],
          description: 'Type of appointment needed',
        },
        reason: {
          type: 'string',
          description: 'Reason for appointment',
        },
        priority: {
          type: 'number',
          description: 'Priority level 1-5 (1=low, 5=high/urgent)',
        },
      },
      required: ['patient_ref', 'patient_name', 'patient_phone'],
    },
  },
},
```

### Implementation Functions

Add these handler functions to the groqTools.ts file (around line 1200):

```typescript
// ============================================
// RESCHEDULE APPOINTMENT
// ============================================
async function rescheduleAppointment(args: any): Promise<any> {
  const {
    appointment_id,
    new_date,
    new_time,
    reason,
    notify_patient = true
  } = args;

  try {
    // Call the RPC function from database
    const { data, error } = await supabase
      .rpc('reschedule_appointment', {
        p_appointment_id: appointment_id,
        p_new_date: new_date,
        p_new_time: new_time,
        p_reason: reason,
        p_notify_patient: notify_patient
      });

    if (error) throw error;

    // If notification requested, trigger n8n workflow
    if (notify_patient && data.success) {
      await triggerAutomation('reschedule_appointment', {
        appointment_id: appointment_id,
        patient_email: data.patient_email,
        patient_phone: data.patient_phone,
        patient_name: data.patient_name,
        old_date: data.old_date,
        old_time: data.old_time,
        new_date: new_date,
        new_time: new_time,
        reason: reason
      });
    }

    return {
      success: true,
      message: `Appointment successfully rescheduled from ${data.old_date} at ${data.old_time} to ${new_date} at ${new_time}`,
      appointment_id: appointment_id,
      notification_sent: notify_patient
    };
  } catch (error) {
    logger.error('Error rescheduling appointment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// CANCEL APPOINTMENT
// ============================================
async function cancelAppointment(args: any): Promise<any> {
  const {
    appointment_id,
    reason,
    reason_details,
    cancelled_by = 'patient',
    notify_patient = true,
    offer_reschedule = true
  } = args;

  try {
    // Call the RPC function
    const { data, error } = await supabase
      .rpc('cancel_appointment', {
        p_appointment_id: appointment_id,
        p_reason: `${reason}${reason_details ? ': ' + reason_details : ''}`,
        p_notify_patient: notify_patient,
        p_offer_to_waitlist: true
      });

    if (error) throw error;

    // Send cancellation notification
    if (notify_patient && data.success) {
      await triggerAutomation('cancel_appointment', {
        appointment_id: appointment_id,
        patient_email: data.patient_email,
        patient_phone: data.patient_phone,
        patient_name: data.patient_name,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        cancellation_reason: reason,
        offer_reschedule: offer_reschedule
      });
    }

    return {
      success: true,
      message: 'Appointment cancelled successfully',
      appointment_id: appointment_id,
      waitlist_notified: data.waitlist_candidates > 0,
      waitlist_count: data.waitlist_candidates,
      notification_sent: notify_patient
    };
  } catch (error) {
    logger.error('Error cancelling appointment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// FIND PATIENT APPOINTMENTS
// ============================================
async function findPatientAppointments(args: any): Promise<any> {
  const {
    patient_phone,
    patient_email,
    include_past = false,
    status_filter = 'upcoming'
  } = args;

  try {
    let query = supabase
      .from('appointments')
      .select('*');

    // Filter by patient contact
    if (patient_phone) {
      query = query.eq('patient_phone', patient_phone);
    } else if (patient_email) {
      query = query.eq('patient_email', patient_email);
    } else {
      throw new Error('Either patient_phone or patient_email is required');
    }

    // Filter by status
    if (status_filter === 'upcoming') {
      query = query
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .in('status', ['pending', 'confirmed']);
    } else if (status_filter !== 'all') {
      query = query.eq('status', status_filter);
    }

    // Exclude past if not requested
    if (!include_past && status_filter === 'all') {
      query = query.gte('appointment_date', new Date().toISOString().split('T')[0]);
    }

    query = query.order('appointment_date', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      appointments: data || [],
      count: data?.length || 0
    };
  } catch (error) {
    logger.error('Error finding patient appointments:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// SUGGEST ALTERNATIVE TIMES
// ============================================
async function suggestAlternativeTimes(args: any): Promise<any> {
  const {
    original_date,
    original_time,
    doctor_name,
    appointment_type = 'consultation',
    preferred_time_of_day = 'any',
    num_suggestions = 3
  } = args;

  try {
    const suggestions = [];
    const originalDateTime = new Date(`${original_date}T${original_time}`);

    // Get next 14 days
    for (let dayOffset = 0; dayOffset < 14 && suggestions.length < num_suggestions; dayOffset++) {
      const checkDate = new Date(originalDateTime);
      checkDate.setDate(checkDate.getDate() + dayOffset);

      const dateStr = checkDate.toISOString().split('T')[0];
      const dayOfWeek = checkDate.getDay();

      // Skip weekends for regular consultations
      if (appointment_type === 'consultation' && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }

      // Define time ranges
      const timeRanges = {
        morning: ['09:00', '10:00', '11:00'],
        afternoon: ['13:00', '14:00', '15:00', '16:00'],
        evening: ['17:00', '18:00'],
        any: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
      };

      const timesToCheck = timeRanges[preferred_time_of_day] || timeRanges.any;

      for (const time of timesToCheck) {
        if (suggestions.length >= num_suggestions) break;

        // Check if slot is available
        const { data: existing } = await supabase
          .from('appointments')
          .select('id')
          .eq('appointment_date', dateStr)
          .eq('appointment_time', time)
          .eq('doctor_name', doctor_name || 'Dr. Sarah Johnson')
          .in('status', ['pending', 'confirmed'])
          .single();

        if (!existing) {
          suggestions.push({
            date: dateStr,
            time: time,
            doctor: doctor_name || 'Dr. Sarah Johnson',
            day_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
            time_period: time < '12:00' ? 'Morning' : time < '17:00' ? 'Afternoon' : 'Evening'
          });
        }
      }
    }

    return {
      success: true,
      suggestions: suggestions,
      count: suggestions.length,
      message: suggestions.length > 0
        ? `Found ${suggestions.length} available time slots`
        : 'No available slots found in the next 14 days. Would you like to join the waitlist?'
    };
  } catch (error) {
    logger.error('Error suggesting alternative times:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// JOIN WAITLIST
// ============================================
async function joinWaitlist(args: any): Promise<any> {
  const {
    patient_ref,
    patient_name,
    patient_email,
    patient_phone,
    preferred_date,
    preferred_time_range = 'any',
    appointment_type = 'consultation',
    reason,
    priority = 1
  } = args;

  try {
    const { data, error } = await supabase
      .from('appointment_waitlist')
      .insert({
        patient_ref,
        patient_name,
        patient_email,
        patient_phone,
        preferred_date: preferred_date || null,
        preferred_time_range,
        appointment_type,
        reason,
        priority,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `${patient_name} has been added to the waitlist. You'll be notified when a slot becomes available.`,
      waitlist_id: data.id,
      position: 'We\'ll contact you as soon as a matching slot opens up'
    };
  } catch (error) {
    logger.error('Error joining waitlist:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Add to Tool Execution Switch Statement

Find the tool execution switch statement (around line 1700) and add these cases:

```typescript
case 'reschedule_appointment':
  const rescheduleResult = await rescheduleAppointment(parsedArgs);
  return JSON.stringify({
    success: rescheduleResult.success,
    data: rescheduleResult
  });

case 'cancel_appointment':
  const cancelResult = await cancelAppointment(parsedArgs);
  return JSON.stringify({
    success: cancelResult.success,
    data: cancelResult
  });

case 'find_patient_appointments':
  const findResult = await findPatientAppointments(parsedArgs);
  return JSON.stringify({
    success: findResult.success,
    data: findResult
  });

case 'suggest_alternative_times':
  const suggestResult = await suggestAlternativeTimes(parsedArgs);
  return JSON.stringify({
    success: suggestResult.success,
    data: suggestResult
  });

case 'join_waitlist':
  const waitlistResult = await joinWaitlist(parsedArgs);
  return JSON.stringify({
    success: waitlistResult.success,
    data: waitlistResult
  });
```

---

## Phase 3: n8n Workflow Enhancement

### Update: `n8n/IMPORT_THIS_WORKFLOW.json`

Add two new actions to the "Route by Action" Switch node:

1. **Reschedule Appointment Action**
2. **Cancel Appointment Action**

### New Nodes Needed:

#### 1. Reschedule Appointment Node
```json
{
  "parameters": {
    "resource": "row",
    "operation": "update",
    "tableId": "appointments",
    "filterType": "manual",
    "matchFields": {
      "fieldValues": [
        {
          "fieldId": "id",
          "fieldValue": "={{ $json.body.appointment_id }}"
        }
      ]
    },
    "fieldsUi": {
      "fieldValues": [
        {
          "fieldId": "appointment_date",
          "fieldValue": "={{ $json.body.new_date }}"
        },
        {
          "fieldId": "appointment_time",
          "fieldValue": "={{ $json.body.new_time }}"
        },
        {
          "fieldId": "status",
          "fieldValue": "confirmed"
        },
        {
          "fieldId": "notes",
          "fieldValue": "=Rescheduled: {{ $json.body.reason || 'No reason provided' }}"
        }
      ]
    }
  },
  "name": "Reschedule in Database",
  "type": "n8n-nodes-base.supabase"
}
```

#### 2. Send Reschedule Notification (SMS)
```json
{
  "parameters": {
    "resource": "message",
    "operation": "send",
    "from": "+12526453035",
    "to": "={{ $json.patient_phone }}",
    "message": "=Your appointment has been rescheduled to {{ $json.new_date }} at {{ $json.new_time }}. Serenity Hospital."
  },
  "name": "Send Reschedule SMS",
  "type": "n8n-nodes-base.twilio"
}
```

#### 3. Send Reschedule Notification (Email)
```json
{
  "parameters": {
    "resource": "message",
    "operation": "send",
    "sendTo": "={{ $json.patient_email }}",
    "subject": "Appointment Rescheduled - Serenity Hospital",
    "message": "=Dear {{ $json.patient_name }},\n\nYour appointment has been rescheduled.\n\nOld Time: {{ $json.old_date }} at {{ $json.old_time }}\nNew Time: {{ $json.new_date }} at {{ $json.new_time }}\n\nReason: {{ $json.reason || 'Schedule adjustment' }}\n\nIf you need to make changes, please contact us.\n\nBest regards,\nSerenity Royale Hospital"
  },
  "name": "Send Reschedule Email",
  "type": "n8n-nodes-base.gmail"
}
```

#### 4. Cancel Appointment Node
```json
{
  "parameters": {
    "resource": "row",
    "operation": "update",
    "tableId": "appointments",
    "filterType": "manual",
    "matchFields": {
      "fieldValues": [
        {
          "fieldId": "id",
          "fieldValue": "={{ $json.body.appointment_id }}"
        }
      ]
    },
    "fieldsUi": {
      "fieldValues": [
        {
          "fieldId": "status",
          "fieldValue": "cancelled"
        },
        {
          "fieldId": "cancellation_reason",
          "fieldValue": "={{ $json.body.cancellation_reason }}"
        },
        {
          "fieldId": "cancellation_timestamp",
          "fieldValue": "={{ new Date().toISOString() }}"
        }
      ]
    }
  },
  "name": "Cancel in Database",
  "type": "n8n-nodes-base.supabase"
}
```

#### 5. Send Cancellation Notification
```json
{
  "parameters": {
    "resource": "message",
    "operation": "send",
    "sendTo": "={{ $json.patient_email }}",
    "subject": "Appointment Cancelled - Serenity Hospital",
    "message": "=Dear {{ $json.patient_name }},\n\nYour appointment scheduled for {{ $json.appointment_date }} at {{ $json.appointment_time }} has been cancelled.\n\nReason: {{ $json.cancellation_reason }}\n\n{{ $json.offer_reschedule ? 'Would you like to reschedule? Please contact us or reply to this email.' : '' }}\n\nBest regards,\nSerenity Royale Hospital"
  },
  "name": "Send Cancellation Email",
  "type": "n8n-nodes-base.gmail"
}
```

---

## Phase 4: Frontend UI Components

### Component 1: AppointmentDetailModal

**File:** `apps/web/src/components/AppointmentDetailModal.tsx`

This modal will show when clicking a calendar event.

**Features:**
- View appointment details
- Quick actions: Reschedule, Cancel, Send Reminder
- Patient history sidebar
- Audit log/change history
- Notes section

### Component 2: Calendar Enhancement

**File:** `apps/web/src/pages/Calendar.tsx`

**Enhancements:**
- Click event to open AppointmentDetailModal
- Drag-and-drop to reschedule (FullCalendar's eventDrop)
- Color coding by status
- Filter by doctor, type, status

### Component 3: Follow-ups Page

**File:** `apps/web/src/pages/FollowUps.tsx`

**Features:**
- List all scheduled follow-ups
- Filter by status (pending, sent, failed)
- Edit/cancel scheduled follow-ups
- Send follow-up manually
- Template management

---

## Phase 5: Conversational Flows

### Enhanced System Prompts

Update the system prompt in `ChatWidget.tsx` to include reschedule/cancel capabilities:

```typescript
const ENHANCED_SYSTEM_PROMPT = `
You are the AI assistant for Serenity Royale Hospital. You help patients with:

1. **Booking Appointments**: Collect name, email, phone, date, time, reason
2. **Rescheduling Appointments**:
   - Ask for current appointment details or patient phone/email
   - Suggest 2-3 alternative times before confirming
   - Get confirmation before executing reschedule
3. **Cancelling Appointments**:
   - Always ask for cancellation reason (helps improve service)
   - Offer to reschedule instead of cancel
   - Confirm cancellation before executing
4. **Waitlist Management**:
   - If no slots available, offer waitlist
   - Explain waitlist process clearly

**Conversation Flow Examples:**

**Rescheduling:**
Patient: "I need to reschedule my appointment"
You: "I'd be happy to help reschedule. Can you provide your phone number or email so I can find your appointment?"
Patient: "+2348128772405"
You: "I found your appointment on November 20 at 10:00 AM. Would you like to reschedule to:
1. November 22 at 10:00 AM
2. November 23 at 2:00 PM
3. Or tell me your preferred date/time?"

**Cancellation:**
Patient: "I want to cancel my appointment"
You: "I understand. Before I cancel, may I ask the reason? This helps us improve our service. Also, would you prefer to reschedule instead?"
Patient: "I'm feeling better now"
You: "That's great to hear! I'll cancel your appointment on November 20 at 10:00 AM. You'll receive a confirmation email shortly. Feel free to book another appointment anytime you need."

**Be conversational, empathetic, and helpful. Always confirm before making changes.**
`;
```

---

## Phase 6: Testing Checklist

### Database Testing
- [ ] Run migration: `supabase db push`
- [ ] Verify all tables created
- [ ] Test RPC functions via SQL
- [ ] Check triggers are working

### AI Tools Testing
```bash
# Test reschedule
curl -X POST "https://your-supabase-url/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "reschedule_appointment",
    "args": {
      "appointment_id": "uuid-here",
      "new_date": "2025-11-25",
      "new_time": "14:00",
      "reason": "Schedule conflict"
    }
  }'

# Test cancel
curl -X POST "https://your-supabase-url/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "cancel_appointment",
    "args": {
      "appointment_id": "uuid-here",
      "reason": "feeling_better",
      "notify_patient": true
    }
  }'
```

### n8n Workflow Testing
- [ ] Import updated workflow
- [ ] Link credentials
- [ ] Test reschedule action via webhook
- [ ] Test cancel action via webhook
- [ ] Verify emails sent
- [ ] Check database updates

### Frontend Testing
- [ ] AppointmentDetailModal opens on click
- [ ] Reschedule button works
- [ ] Cancel button works
- [ ] Drag-and-drop rescheduling works
- [ ] Follow-ups page displays correctly

### Conversational Testing
- [ ] Test rescheduling via chat
- [ ] Test cancellation via chat
- [ ] Test waitlist joining via chat
- [ ] Test alternative time suggestions

---

## Success Metrics

### User Experience Metrics
1. **Time to reschedule**: < 30 seconds from request to confirmation
2. **Cancellation clarity**: 100% of cancellations should ask for reason
3. **Alternative suggestions**: Always provide 2-3 options
4. **Notification delivery**: 100% of changes trigger notifications

### System Metrics
1. **Audit trail**: 100% of changes logged
2. **Reschedule rate**: Track to identify patterns
3. **Cancellation reasons**: Categorized and reportable
4. **Waitlist conversion**: % of waitlist patients who book

---

## Next Steps Priority

1. ✅ **Apply Database Migration** (2 mins)
2. ⏳ **Update groqTools.ts** (30 mins)
3. ⏳ **Update n8n workflow** (15 mins)
4. ⏳ **Create AppointmentDetailModal** (2 hours)
5. ⏳ **Enhance Calendar** (1 hour)
6. ⏳ **Create FollowUps page** (1.5 hours)
7. ⏳ **Test end-to-end** (1 hour)

**Total Implementation Time: ~6 hours**

---

## File Checklist

- [x] `supabase/migrations/00020_appointment_management_enhancements.sql`
- [ ] `apps/web/src/lib/groqTools.ts` (update)
- [ ] `n8n/IMPORT_THIS_WORKFLOW.json` (update)
- [ ] `apps/web/src/components/AppointmentDetailModal.tsx` (new)
- [ ] `apps/web/src/pages/Calendar.tsx` (update)
- [ ] `apps/web/src/pages/FollowUps.tsx` (new)
- [ ] `apps/web/src/components/ChatWidget.tsx` (update system prompt)

---

**This comprehensive implementation will make the Serenity Hospital assistant truly "irresistible and easy to use" by providing:**
- ✅ One-click rescheduling
- ✅ Smart cancellation handling
- ✅ Intelligent time suggestions
- ✅ Complete audit trail
- ✅ Waitlist management
- ✅ Provider availability tracking
- ✅ Automated notifications
- ✅ Conversational interface for all operations
