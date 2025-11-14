# Serenity Hospital AI - MVP User Guide

**Version:** 2.0.3
**Last Updated:** 2025-11-13
**Production URL:** https://web-rb4xjj4md-odia-backends-projects.vercel.app

---

## 📋 TABLE OF CONTENTS

1. [For Patients](#for-patients)
2. [For Hospital Administrators](#for-administrators)
3. [Troubleshooting](#troubleshooting)
4. [FAQ](#faq)

---

## FOR PATIENTS

### Booking an Appointment

#### Step 1: Open the Chat Widget
1. Visit the hospital website
2. Look for the blue chat icon in the bottom-right corner
3. Click to open the AI assistant

#### Step 2: Start the Conversation
**Type or say:**
- "I want to book an appointment"
- "Book an appointment for me"
- "Schedule a visit"
- "I need to see a doctor"

#### Step 3: Provide Your Information
The AI will ask for:

1. **Your Full Name**
   - Example: "John Doe"

2. **Your Email Address**
   - Example: "john.doe@gmail.com"
   - *You'll receive your confirmation here*

3. **Your Phone Number**
   - Example: "+234 801 234 5678" (Nigerian)
   - Example: "(555) 123-4567" (US)
   - *International formats accepted*

4. **Preferred Date**
   - Example: "Tomorrow"
   - Example: "November 15, 2025"
   - Example: "2025-11-15"
   - *Must be a future date*

5. **Preferred Time**
   - Example: "2:00 PM"
   - Example: "14:00"
   - Example: "Morning"

6. **Reason for Visit**
   - Example: "Regular checkup"
   - Example: "Follow-up consultation"
   - Example: "Flu symptoms"

#### Step 4: Confirm Your Booking
- The AI will summarize your information
- Confirm that everything is correct
- The AI will create your appointment

#### Step 5: Check Your Email
- You'll receive a confirmation email within 2 minutes
- Email contains:
  - Appointment date and time
  - Doctor information
  - What to bring
  - Contact information if you need to reschedule

---

### Using Voice Input

#### Enabling Voice
1. Click the **microphone icon** (🎤) in the chat
2. Allow microphone access when prompted
3. The button will turn **red** when recording
4. Speak clearly into your microphone
5. Your speech will be converted to text

#### Supported Browsers
- ✅ **Chrome** (Best support)
- ✅ **Edge** (Full support)
- ✅ **Safari** (Full support)
- ⚠️ **Firefox** (Limited support)

#### Voice Tips
- **Speak clearly** in a quiet environment
- **Say complete sentences**: "I want to book an appointment for tomorrow at 2 PM"
- **Pause between sentences** for better accuracy
- **Click the microphone again** to stop recording

---

### What Information Should I Prepare?

Before booking, have ready:
- ✅ Your full name
- ✅ Email address (for confirmation)
- ✅ Phone number
- ✅ Preferred date (at least 1 day in advance)
- ✅ Preferred time
- ✅ Brief description of why you need the appointment

---

### Can I Book for Someone Else?

Yes! You can book appointments for family members:
1. Start the conversation normally
2. Provide **their** name, not yours
3. Use **their** email and phone
4. Mention you're booking for someone else
   - Example: "I'm booking for my mother, Jane Doe"

---

### What If I Make a Mistake?

**During the conversation:**
- You can correct information anytime
- Say: "Actually, change the time to 3 PM"
- The AI will update your details

**After booking:**
- Check your confirmation email
- Contact the hospital to reschedule or cancel
- (Rescheduling via chat coming in Phase 2)

---

## FOR ADMINISTRATORS

### Logging In

1. Navigate to the dashboard URL
2. Enter your hospital email
3. Enter your password
4. Click "Sign In"

**First time?** Contact your IT administrator for credentials.

---

### Dashboard Overview

After logging in, you'll see 4 main sections:

#### 1. **Conversations** 📱
- View all patient interactions
- See messages in real-time
- Filter by channel (web, WhatsApp, voice)
- Monitor AI performance

#### 2. **Calendar** 📅
- View all appointments
- See daily/weekly/monthly schedule
- Click appointments for details
- Color-coded by status

#### 3. **Analytics** 📊
- Today's conversation count
- Message volume
- Upcoming appointments
- System usage metrics

#### 4. **Settings** ⚙️
- Configure hospital information
- Update business hours
- Manage notification preferences
- API configurations

---

### Using the Admin AI Assistant

The admin assistant helps you manage operations:

#### Common Admin Queries

**Get Statistics:**
```
"Show me today's stats"
"How many appointments do we have?"
"Show me this week's conversations"
```

**Find Appointments:**
```
"Show me appointments for tomorrow"
"Find Sarah Johnson's appointment"
"Show me all pending appointments"
```

**Search Patients:**
```
"Find patient John Doe"
"Search for email john@example.com"
"Show me patients with phone +234..."
```

**Quick Actions:**
```
"Create an appointment for [name]"
"Show me conversation history"
"Get analytics for this month"
```

---

### Managing Conversations

#### Viewing a Conversation
1. Go to **Conversations** page
2. Click on any conversation
3. View full message history
4. See patient details and intent

#### Filtering Conversations
- **By Channel**: webchat, WhatsApp, voice
- **By Status**: active, resolved, escalated
- **By Date**: today, this week, custom range

#### Real-Time Updates
- New conversations appear automatically
- No need to refresh the page
- Green indicator shows live updates

---

### Monitoring Appointments

#### Calendar View
1. Navigate to **Calendar** tab
2. Select date range (day/week/month)
3. Click any appointment for details

#### Appointment Details
- Patient name, email, phone
- Appointment date and time
- Reason for visit
- Status (pending/confirmed/cancelled)
- Created date and source (web/WhatsApp/voice)

---

### Understanding Analytics

#### Key Metrics

**Conversations Today**
- Number of patient interactions today
- Includes all channels

**Messages Today**
- Total message count (patient + AI)
- Indicates system activity level

**Upcoming Appointments**
- Next 5 scheduled appointments
- Quick view of immediate schedule

**Channel Breakdown**
- See which channels patients prefer
- Web chat vs WhatsApp vs Voice

---

### Admin Security Best Practices

✅ **DO:**
- Log out when finished
- Use strong passwords
- Limit admin access to authorized staff only
- Monitor unusual activity

❌ **DON'T:**
- Share login credentials
- Leave dashboard open on shared computers
- Access from public/unsecured Wi-Fi
- Share patient information externally

---

## TROUBLESHOOTING

### Patient Issues

#### "The chat widget won't open"
**Solutions:**
- Refresh the page (F5 or Cmd+R)
- Clear browser cache
- Try a different browser (Chrome recommended)
- Check if JavaScript is enabled

#### "My voice input doesn't work"
**Solutions:**
- Allow microphone permissions in browser
- Use Chrome, Edge, or Safari (not Firefox)
- Check if microphone is connected
- Test microphone in another app first

#### "I didn't receive confirmation email"
**Solutions:**
- Check spam/junk folder
- Wait 5 minutes (system may be busy)
- Verify email address was correct
- Contact hospital directly to confirm

#### "The AI says my email is invalid"
**Solutions:**
- Check for typos
- Don't include spaces
- Use format: name@domain.com
- Try a different email address

#### "I can't select a past date"
**Solutions:**
- The system only accepts future dates
- Use "today" for same-day appointments
- Use "tomorrow" for next day
- Provide date at least 1 day ahead

---

### Admin Issues

#### "I can't log in"
**Solutions:**
- Verify email is correct
- Check password (case-sensitive)
- Contact IT for password reset
- Ensure you have admin privileges

#### "Conversations aren't updating"
**Solutions:**
- Refresh the page
- Check internet connection
- Clear browser cache
- Try incognito/private window

#### "Analytics show zero"
**Solutions:**
- Check date range filter
- Verify database connection
- Wait 30 seconds for data to load
- Contact technical support

#### "Appointments not showing in calendar"
**Solutions:**
- Verify appointments exist in database
- Check calendar date range
- Refresh the page
- Check browser console for errors (F12)

---

## FAQ

### General Questions

**Q: Is my data secure?**
A: Yes. We use enterprise-grade encryption, HIPAA-compliant logging, and secure authentication. Your personal health information is protected.

**Q: Can I book appointments 24/7?**
A: Yes! The AI assistant is available 24/7. However, appointments are subject to hospital business hours.

**Q: How far in advance can I book?**
A: Currently, you can book appointments up to 30 days in advance.

**Q: What if I need to cancel or reschedule?**
A: Please contact the hospital directly using the phone number in your confirmation email. (Self-service rescheduling coming in Phase 2)

**Q: Do I need to create an account?**
A: No! Patients can book appointments without creating an account. Just provide your information when booking.

**Q: Can I book multiple appointments at once?**
A: Currently, you need to complete one booking before starting another. Book one, then start a new conversation for the next.

**Q: What languages are supported?**
A: Currently English only. Multi-language support coming in Phase 2.

---

### Technical Questions

**Q: Which browsers are supported?**
A: Chrome, Edge, Safari, and Firefox (latest versions). Chrome recommended for best performance.

**Q: Does it work on mobile?**
A: Yes! The system is fully responsive and works on iOS and Android devices.

**Q: Do I need to install anything?**
A: No. The system works entirely in your web browser.

**Q: What if the system is slow?**
A: The AI typically responds within 2-3 seconds. If slower, check your internet connection or try again in a few minutes.

**Q: Can I use keyboard shortcuts?**
A: Yes! Press **Enter** to send a message in the chat widget.

---

### Privacy Questions

**Q: What data do you collect?**
A: We collect only necessary appointment information: name, email, phone, appointment details. We do NOT store medical records through the chat system.

**Q: Is my conversation private?**
A: Yes. Conversations are encrypted and only accessible by authorized hospital staff.

**Q: Can I delete my data?**
A: Yes. Contact the hospital to request data deletion per GDPR/CCPA rights.

**Q: Do you use my data for AI training?**
A: No. Your personal information is never used to train AI models.

---

## GETTING HELP

### For Patients
**Email:** support@serenityhospital.com
**Phone:** [Hospital Phone Number]
**Hours:** Monday-Friday, 9 AM - 5 PM

### For Administrators
**Technical Support:** it-support@serenityhospital.com
**Emergency:** Call IT Help Desk
**Documentation:** See `/docs` folder for technical guides

---

## WHAT'S COMING IN PHASE 2

🚀 **Upcoming Features:**
- ✨ Self-service appointment rescheduling
- ✨ Self-service appointment cancellation
- ✨ WhatsApp Business integration
- ✨ Voice AI phone appointments
- ✨ Multi-language support
- ✨ Patient appointment history
- ✨ SMS appointment reminders
- ✨ Google Calendar sync

**Stay tuned for updates!**

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Feedback:** Contact technical team to suggest improvements
