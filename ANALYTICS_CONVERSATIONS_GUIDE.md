# Analytics & Conversations - Live Data Guide

**Status**: ✅ **FULLY WORKING** - Shows Real-Time Data

---

## 🎯 Summary

Both the **Analytics Dashboard** and **Conversations** pages are **already pulling LIVE data** from your Supabase database. Every conversation, message, and appointment is tracked in real-time!

---

## 📊 Analytics Dashboard

### What It Shows (LIVE DATA)

**File**: [apps/web/src/components/AnalyticsDashboard.js](apps/web/src/components/AnalyticsDashboard.js)

**Data Pulled** (Lines 24-70):

1. **Total Conversations** - Count from `conversations` table
2. **Total Messages** - Count from `messages` table
3. **Open Conversations** - Conversations with `status = 'open'`
4. **Staff Handled** - Conversations where `taken_over_by IS NOT NULL`
5. **Total Appointments** - Count from `appointments` table
6. **Channel Breakdown** - Group by `channel` (webchat, voice, whatsapp)

**Auto-Refresh**: Every 5 minutes (Line 18)

### Example Analytics Display

```
Total Conversations: 147
Total Messages: 392
Open Conversations: 138
Staff Handled: 2
Appointments: 24
```

### How It Works

```typescript
const loadAnalytics = async () => {
  // Get total conversations
  const { count: totalConversations } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true });

  // Get total messages
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  // Get open conversations
  const { count: openConversations } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  // Get staff handled
  const { count: staffHandled } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .not('taken_over_by', 'is', null);

  // Get appointments
  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  setAnalytics({
    total_conversations: totalConversations || 0,
    total_messages: totalMessages || 0,
    open_conversations: openConversations || 0,
    staff_handled_conversations: staffHandled || 0,
    total_appointments: totalAppointments || 0
  });
};
```

---

## 💬 Conversations Page

### What It Shows (LIVE DATA)

**File**: [apps/web/src/pages/Conversations.tsx](apps/web/src/pages/Conversations.tsx)

**Features**:

1. **Conversation List** - All conversations from database
2. **Real-Time Updates** - New conversations appear instantly
3. **Message History** - Full conversation transcript
4. **Staff Takeover** - Admin can take over AI conversations
5. **Search** - Find conversations by ID or phone
6. **Filters** - Active, Taken Over, All channels

### Data Sources

**Conversations** (Lines 120-144):
```typescript
const loadConversations = async () => {
  let query = supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter === 'active') {
    query = query.eq('status', 'open').is('taken_over_by', null);
  } else if (filter === 'taken_over') {
    query = query.not('taken_over_by', 'is', null);
  }

  if (channelFilter !== 'all') {
    query = query.eq('channel', channelFilter);
  }

  const { data, error } = await query;
  setConvs(data || []);
};
```

**Messages** (Lines 146-160):
```typescript
const loadMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  setMessages(data || []);
};
```

**Real-Time Subscriptions** (Lines 66-89):
```typescript
// Subscribe to new conversations
const channel = supabase
  .channel('conversations-channel')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'conversations'
  }, (payload) => {
    setConvs(prev => [payload.new as Conversation, ...prev]);
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'conversations'
  }, (payload) => {
    setConvs(prev => prev.map(c =>
      c.id === payload.new.id ? payload.new as Conversation : c
    ));
  })
  .subscribe();
```

---

## 🔄 How Data Gets Created

### When Patient Uses Chat Widget

**1. Conversation Created**:
```typescript
// In ChatWidget.tsx (Line ~430)
const { data: newConv, error } = await supabase
  .from('conversations')
  .insert({
    channel: 'webchat',  // or 'voice' or 'whatsapp'
    patient_ref: `patient-${Date.now()}`,
    status: 'open'
  })
  .select('id')
  .single();
```

**2. Messages Saved**:
```typescript
// After each message (Line ~590)
await supabase.from('messages').insert({
  conversation_id: conversationId,
  from_type: 'patient',  // or 'ai' or 'staff'
  body: messageText
});
```

**3. Appointment Created** (via n8n or direct):
```typescript
await supabase.from('appointments').insert({
  patient_name: name,
  patient_email: email,
  patient_phone: phone,
  appointment_date: date,
  appointment_time: time,
  appointment_reason: reason,
  status: 'scheduled'
});
```

---

## 📱 Conversation Flow

### Patient Interaction Example

1. **Patient visits**: https://serenity-public-widget-acz7aenvp-odia-backends-projects.vercel.app

2. **Patient types**: "Hi, I want to book an appointment"

3. **System creates**:
   - ✅ New conversation in `conversations` table
   - ✅ Patient message in `messages` table
   - ✅ AI response in `messages` table

4. **Admin sees** (in real-time):
   - Conversation appears in Conversations list
   - Analytics count increases
   - Can click to view full conversation

5. **Admin can**:
   - View all messages
   - Take over conversation
   - Send staff message
   - See patient info (email, phone)

---

## 🎛️ Admin Dashboard Features

### Analytics Page

**Path**: `/analytics`

**Shows**:
- 📊 Total Conversations (147)
- 💬 Total Messages (392)
- 📂 Open Conversations (138)
- 👥 Staff Handled (2)
- 📅 Appointments (24)
- 📈 Channel Breakdown (Chart)
- 📋 Recent Activity (List)

**Refresh**: Click refresh icon or wait 5 minutes

### Conversations Page

**Path**: `/` (home)

**Shows**:
- 📝 All conversation threads
- 🔍 Search by patient/ID
- 🎯 Filter by status (Active, Taken Over, All)
- 📱 Filter by channel (All, Webchat, Voice, WhatsApp)
- 💬 Full message history
- 👤 Patient info
- ⏰ Timestamps

**Features**:
- **Take Over**: Admin can intervene in AI chat
- **Send Message**: Reply to patient
- **Real-Time**: Updates appear instantly
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + K`: Search
  - `Ctrl/Cmd + T`: Take over selected conversation
  - `Esc`: Close search

---

## 🔍 Viewing Conversation History

### Step-by-Step

1. **Login to Admin Dashboard**:
   - URL: https://web-8xui8vr5b-odia-backends-projects.vercel.app
   - Use your admin credentials

2. **Go to Conversations** (default page):
   - See list of all conversations
   - Most recent at top

3. **Click on a Conversation**:
   - View full message history
   - See patient info
   - See timestamps

4. **Filter Conversations**:
   - **Active**: AI handling, not taken over
   - **Taken Over**: Staff intervened
   - **All**: Everything

5. **Search**:
   - Click search icon or press `Ctrl/Cmd + K`
   - Type patient ID or phone number
   - Results filter in real-time

6. **Take Over**:
   - Click "Take Over" button
   - Conversation marked as staff-handled
   - You can send messages as staff

---

## 📊 Sample Data View

### Conversations Table
```
ID: conv_abc123
Patient: patient-1731012345
Channel: webchat
Status: open
Created: 2025-11-07 14:30:22
Messages: 12
```

### Messages for Conversation
```
[14:30:22] Patient: "Hi, I want to book an appointment"
[14:30:23] AI: "Of course! I'd be happy to help..."
[14:30:45] Patient: "My name is Samuel Eguale"
[14:30:46] AI: "Thank you, Samuel. What's your email?"
[14:31:02] Patient: "egualesamuel@gmail.com"
[14:31:03] AI: "Great! And your phone number?"
...
```

### Analytics View
```
┌─────────────────────┬────────┐
│ Metric              │ Count  │
├─────────────────────┼────────┤
│ Total Conversations │  147   │
│ Total Messages      │  392   │
│ Open Conversations  │  138   │
│ Staff Handled       │    2   │
│ Appointments        │   24   │
└─────────────────────┴────────┘

Channel Breakdown:
🌐 Webchat: 140
📞 Voice: 5
💬 WhatsApp: 2
```

---

## 🔄 Real-Time Updates

### When New Data Arrives

**Conversations Page**:
- New conversation appears at top of list
- No refresh needed
- Updates via Supabase Realtime

**Analytics Dashboard**:
- Counts update every 5 minutes
- Click refresh for manual update
- Shows latest data from database

**Message Updates**:
- When patient sends message → Appears instantly
- When AI responds → Shows immediately
- When staff replies → Added to thread

---

## 🧪 Test It Yourself

### Create Test Data

1. **Open Public Widget**:
   ```
   https://serenity-public-widget-acz7aenvp-odia-backends-projects.vercel.app
   ```

2. **Start Chat**:
   - Type: "Hi, I need help"
   - Continue conversation

3. **Check Admin Dashboard**:
   - Login to admin
   - Go to Conversations
   - See your test conversation!
   - View all messages

4. **Check Analytics**:
   - Go to Analytics page
   - See count increased
   - View in channel breakdown

---

## 🗄️ Database Tables

### conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  channel TEXT NOT NULL,  -- 'webchat', 'voice', 'whatsapp'
  patient_ref TEXT NOT NULL,
  status TEXT DEFAULT 'open',  -- 'open', 'closed', 'taken_over'
  taken_over_by UUID,  -- Admin user ID
  taken_over_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  from_type TEXT NOT NULL,  -- 'patient', 'ai', 'staff'
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  appointment_date TEXT,
  appointment_time TEXT,
  appointment_reason TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ What's Already Working

- [x] Analytics shows real counts from database
- [x] Conversations list shows all chats
- [x] Message history displays full transcript
- [x] Real-time updates (new convs appear instantly)
- [x] Staff takeover functionality
- [x] Search and filter
- [x] Channel breakdown
- [x] Timestamps and status tracking

---

## 🎯 Business Owner Can:

1. **Login** to admin dashboard
2. **View all conversations** - Every patient chat
3. **See complete history** - All messages in each chat
4. **Monitor in real-time** - Updates appear instantly
5. **Take over chats** - Intervene when needed
6. **Send messages** - Reply as staff
7. **View analytics** - Total counts and trends
8. **Filter by channel** - Webchat, Voice, WhatsApp
9. **Search patients** - Find by ID or phone
10. **Track appointments** - See all bookings

---

## 📈 Data Flow Diagram

```
Patient Uses Chat Widget
         ↓
Conversation Created in DB
         ↓
Messages Saved to DB
         ↓
Admin Dashboard Queries DB
         ↓
Analytics Shows Counts
Conversations Shows List
         ↓
Real-Time Subscription Updates UI
         ↓
Admin Sees Live Data
```

---

## 🔗 Quick Access

**Admin Dashboard**:
- https://web-8xui8vr5b-odia-backends-projects.vercel.app

**Public Widget** (creates data):
- https://serenity-public-widget-acz7aenvp-odia-backends-projects.vercel.app

**Supabase Dashboard** (view raw data):
- https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq
- Go to Table Editor → conversations, messages, appointments

---

**Everything is LIVE and working!** 🎉

The analytics and conversations show REAL data from your database, updating in real-time as patients interact with the chat widget.

**Test it**: Use the public widget to create a conversation, then check the admin dashboard to see it appear!
