# 🎤 Sync VAPI for Web-Based Voice Assistant

## ✅ Good News!
The public client website **already has voice mode enabled**! You just need to sync VAPI configuration.

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Sync VAPI Configuration

**Option A: Via Admin Dashboard (Easiest)**
1. Go to: https://web-83xc1wtub-odia-backends-projects.vercel.app
2. Log in as admin
3. Navigate to **Agent Config** page
4. Click **"Sync to VAPI"** button
5. Wait for success message

**Option B: Via API Call**
```bash
curl -X POST https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1/sync-vapi-config \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjkzNywiZXhwIjoyMDc3ODU4OTM3fQ.p-iTMEooHf9AlaWZPklBjZq-fV0aiYBY9fq633KQ1vU"
```

### Step 2: Test the Voice Assistant

1. Go to: **https://web-83xc1wtub-odia-backends-projects.vercel.app**
2. You'll see a beautiful landing page with the chat interface
3. Click the **microphone icon** 🎤 to switch to voice mode
4. Click the microphone button and speak!

---

## 🎯 How to Test Voice Assistant

### Visual Guide

```
┌─────────────────────────────────────┐
│     SRH Care AI                     │
│  Your 24/7 Healthcare Assistant     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Chat Window                   │ │
│  │                               │ │
│  │ [Text] [🎤 Voice] ← Click!   │ │
│  │                               │ │
│  │ Messages appear here...       │ │
│  │                               │ │
│  │ ┌─────────────────────────┐  │ │
│  │ │  🎤  Click to speak     │  │ │
│  │ └─────────────────────────┘  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Testing Steps

1. **Open the public website**
   ```
   https://web-83xc1wtub-odia-backends-projects.vercel.app
   ```

2. **Switch to Voice Mode**
   - Look for the toggle at the top: `[Text] [🎤 Voice]`
   - Click on **🎤 Voice**

3. **Start Speaking**
   - Click the microphone button
   - Say: **"Hi! I'd like to book an appointment"**
   - The AI will respond via voice

4. **Provide Appointment Details**
   - **Name**: "Samuel Eguale"
   - **Email**: "egualesamuel@gmail.com"
   - **Phone**: "+1234567890"
   - **Date**: "January 15th, 2025"
   - **Time**: "10:00 AM"
   - **Reason**: "Annual checkup"

5. **Wait for Confirmation**
   - The AI will say: "I've sent a confirmation email to egualesamuel@gmail.com"
   - Check your email inbox!

---

## 🎤 Example Voice Conversation

```
🎤 You: "Hi! I'd like to book an appointment"

🤖 AI: "I'd be happy to help you book an appointment!
       May I have your full name please?"

🎤 You: "Samuel Eguale"

🤖 AI: "Thank you, Samuel. What email address should
       I use for your confirmation?"

🎤 You: "egualesamuel@gmail.com"

🤖 AI: "Perfect! And your phone number?"

🎤 You: "+1234567890"

🤖 AI: "Great! When would you like to schedule your appointment?"

🎤 You: "January 15th, 2025 at 10:00 AM"

🤖 AI: "And what's the reason for your visit?"

🎤 You: "Annual checkup"

🤖 AI: [Calls book_appointment_with_confirmation tool]
       "Perfect! Your appointment is booked for January 15th
       at 10:00 AM for an annual checkup. I've sent a
       confirmation email to egualesamuel@gmail.com.
       Is there anything else I can help you with?"
```

---

## 📧 Email Confirmation

Within 1-2 minutes, you should receive:

**Subject**: Appointment Confirmed - Serenity Royale Hospital

**Content**:
```
Dear Samuel Eguale,

✓ Your Appointment Details
Date: January 15th, 2025
Time: 10:00 AM
Reason: Annual checkup

📋 What to bring:
• Valid ID
• Insurance card
• Medical records (if applicable)
```

---

## 🔍 What Happens Behind the Scenes

```
┌─────────────────────────────────────────────────────────┐
│  1. User clicks microphone in web browser               │
│                  ↓                                      │
│  2. VAPI SDK captures voice input                       │
│                  ↓                                      │
│  3. VAPI converts speech to text                        │
│                  ↓                                      │
│  4. AI processes appointment request                    │
│                  ↓                                      │
│  5. AI calls book_appointment_with_confirmation tool    │
│                  ↓                                      │
│  6. Tool triggers n8n webhook                           │
│                  ↓                                      │
│  7. n8n sends Gmail confirmation                        │
│                  ↓                                      │
│  8. User receives email at egualesamuel@gmail.com      │
│                  ↓                                      │
│  9. VAPI converts AI response to speech                 │
│                  ↓                                      │
│  10. User hears confirmation via browser audio          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

After sync and test:

- [ ] VAPI synced successfully via Agent Config page
- [ ] Public website shows voice toggle (🎤 Voice)
- [ ] Click voice toggle switches to voice mode
- [ ] Microphone button appears and works
- [ ] AI responds with voice (not just text)
- [ ] Appointment booking conversation flows naturally
- [ ] Email confirmation arrives at egualesamuel@gmail.com
- [ ] Email contains correct appointment details

---

## 🐛 Troubleshooting

### Voice Toggle Doesn't Appear
- **Check**: Browser console for errors
- **Fix**: Clear cache and reload page
- **Verify**: You're on the public site, not admin dashboard

### Microphone Permission Denied
- **Check**: Browser microphone permissions
- **Fix**: Allow microphone access when prompted
- **Chrome**: Settings → Privacy → Microphone → Allow

### No Voice Response (Only Text)
- **Check**: VAPI assistant ID is configured
- **Fix**: Sync VAPI via Agent Config page
- **Verify**: Check browser audio settings

### Email Not Received
- **Check**: Spam/junk folder
- **Verify**: n8n workflow is active
- **Check**: Supabase function logs for errors

### AI Doesn't Call Appointment Tool
- **Check**: You synced VAPI config with latest tools
- **Fix**: Re-sync via Agent Config page
- **Try**: Be more explicit: "Book an appointment for me"

---

## 📊 Where to Check Logs

### 1. Browser Console
- Right-click → Inspect → Console tab
- Look for VAPI SDK logs

### 2. Supabase Function Logs
- https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/logs
- Filter by: `groq-chat` or `vapi-webhook`

### 3. n8n Execution Logs
- n8n dashboard → Executions
- Look for `/appointment-confirmation` workflow

### 4. VAPI Dashboard
- https://dashboard.vapi.ai
- Check assistant logs for function calls
- View conversation transcripts

---

## 🎯 Expected Result

If everything works:

1. ✅ Voice toggle appears on public website
2. ✅ Click microphone and speak naturally
3. ✅ AI responds with voice (you can hear it!)
4. ✅ AI collects appointment details through conversation
5. ✅ AI confirms appointment booking
6. ✅ Email arrives at egualesamuel@gmail.com
7. ✅ Professional branded email with appointment details

---

## 🚀 Quick Test Commands

### For Voice (Say this):
```
"Hi! I want to book an appointment for Samuel Eguale
at egualesamuel@gmail.com for January 15th at 10 AM
for an annual checkup"
```

### For Text Chat (Type this):
```
Hi! I'd like to book an appointment for Samuel Eguale.
Email: egualesamuel@gmail.com
Phone: +1234567890
Date: January 15th, 2025
Time: 10:00 AM
Reason: Annual checkup
```

---

## 🎉 Ready to Test!

1. **First**: Sync VAPI via Admin Dashboard → Agent Config → "Sync to VAPI"
2. **Then**: Visit https://web-83xc1wtub-odia-backends-projects.vercel.app
3. **Click**: 🎤 Voice toggle
4. **Speak**: Your appointment request
5. **Check**: egualesamuel@gmail.com for confirmation email

**The voice assistant is ready to go!** 🎤🚀
