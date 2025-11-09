# 🎯 Test Both AI Assistants - Email Confirmation

## 🎉 DEPLOYMENT COMPLETE!

Both AI assistants are now live and ready to send appointment confirmation emails to **egualesamuel@gmail.com**

---

## 🤖 OPTION 1: Test Groq AI (Public Text Chat Widget)

### Access Point
**URL**: https://web-83xc1wtub-odia-backends-projects.vercel.app (or srhcareai.odia.dev)

### Steps to Test

1. **Open the Website**
   - Go to the public URL above
   - You'll see the chat widget in the bottom-right corner
   - Click to open it

2. **Start the Conversation**

   **Say this**:
   ```
   Hi! I'd like to book an appointment
   ```

3. **The AI Will Ask For Details**

   Provide this information when asked:
   - **Name**: Samuel Eguale
   - **Email**: egualesamuel@gmail.com
   - **Phone**: +1234567890 (or your real number)
   - **Date**: 2025-01-15
   - **Time**: 10:00 AM
   - **Reason**: Annual checkup

4. **Example Full Conversation**
   ```
   You: Hi! I'd like to book an appointment

   AI: I'd be happy to help you book an appointment! I'll need some information:
       - Your full name
       - Email address
       - Phone number
       - Preferred date
       - Preferred time
       - Reason for visit

   You: My name is Samuel Eguale, email is egualesamuel@gmail.com,
        phone is +1234567890, I'd like to book for January 15th, 2025
        at 10:00 AM for an annual checkup

   AI: [Calls book_appointment_with_confirmation tool]
       Great! Your appointment has been booked and a confirmation
       email has been sent to egualesamuel@gmail.com
   ```

5. **Check Your Email**
   - Look in **egualesamuel@gmail.com** inbox
   - Subject: "Appointment Confirmed - Serenity Royale Hospital"
   - Should arrive within 1-2 minutes

---

## 🎤 OPTION 2: Test VAPI Voice AI (Phone Call)

### Access Point
You'll need the VAPI phone number from your VAPI dashboard

### Steps to Test

1. **Sync VAPI Configuration First**
   - Go to admin dashboard: https://web-83xc1wtub-odia-backends-projects.vercel.app
   - Log in as admin
   - Go to **Agent Config** page
   - Click **"Sync to VAPI"** button
   - Wait for success message

2. **Get VAPI Phone Number**
   - Go to https://dashboard.vapi.ai
   - Find your assistant's phone number
   - Or get the test call link

3. **Make the Call**
   - Call the VAPI number
   - Have a natural conversation

4. **Example Voice Conversation**
   ```
   AI: "Hello! I'm the AI assistant for Serenity Royale Hospital.
        How can I help you today?"

   You: "Hi, I'd like to book an appointment"

   AI: "I'd be happy to help you book an appointment. May I have your name?"

   You: "Samuel Eguale"

   AI: "Great! And what's your email address?"

   You: "egualesamuel@gmail.com"

   AI: "Perfect. What's your phone number?"

   You: "+1234567890"

   AI: "When would you like to schedule your appointment?"

   You: "January 15th, 2025 at 10:00 AM"

   AI: "And what's the reason for your visit?"

   You: "Annual checkup"

   AI: [Calls send_appointment_confirmation function]
       "Perfect! Your appointment is booked for January 15th at 10:00 AM
        for an annual checkup. I've sent a confirmation email to
        egualesamuel@gmail.com. Is there anything else I can help you with?"
   ```

5. **Check Your Email**
   - Look in **egualesamuel@gmail.com** inbox
   - Subject: "Appointment Confirmed - Serenity Royale Hospital"
   - Should arrive within 1-2 minutes

---

## 📧 What to Expect in the Email

The confirmation email will include:

```html
Appointment Confirmed

Dear Samuel Eguale,

✓ Your Appointment Details
Date: January 15th, 2025
Time: 10:00 AM
Reason: Annual checkup

📋 What to bring:
• Valid ID
• Insurance card
• Medical records (if applicable)

Need to reschedule? Reply to this email or call us.

---
Serenity Royale Hospital
📧 info.serenityroyalehospital@gmail.com
```

---

## 🔍 What's Happening Behind the Scenes

### Groq AI Text Chat Flow:
1. User requests appointment booking
2. AI collects all required information
3. AI calls `book_appointment_with_confirmation` tool
4. Tool triggers n8n webhook at `/appointment-confirmation`
5. n8n sends Gmail confirmation email
6. User receives email

### VAPI Voice AI Flow:
1. User calls VAPI phone number
2. AI has natural voice conversation
3. AI collects appointment details
4. AI calls `send_appointment_confirmation` function
5. Function triggers vapi-webhook Edge Function
6. Edge Function calls n8n webhook at `/appointment-confirmation`
7. n8n sends Gmail confirmation email
8. User receives email

---

## ✅ Verification Checklist

After testing, verify:

- [ ] Email received at egualesamuel@gmail.com
- [ ] Email contains correct appointment details
- [ ] Email has professional hospital branding
- [ ] AI responded naturally to booking request
- [ ] No errors in console (for Groq AI)
- [ ] Audit log entry created in Supabase

---

## 🐛 Troubleshooting

### If Email Doesn't Arrive:

1. **Check Spam/Junk Folder**
   - Gmail might filter it

2. **Verify n8n Workflow is Active**
   - Go to n8n dashboard
   - Check `/appointment-confirmation` webhook endpoint
   - Ensure workflow is activated

3. **Check n8n Execution Log**
   - See if webhook was triggered
   - Check for any errors

4. **Verify Gmail OAuth is Working**
   - n8n needs valid Gmail credentials
   - Re-authenticate if needed

5. **Check Supabase Function Logs**
   - For Groq: Check `groq-chat` function logs
   - For VAPI: Check `vapi-webhook` function logs

### If AI Doesn't Call the Tool:

1. **For Groq AI**:
   - Check browser console for errors
   - Verify you're on the public site (not logged in)
   - Try being more explicit: "I want to book an appointment"

2. **For VAPI**:
   - Ensure you synced VAPI config from Agent Config page
   - Check VAPI dashboard for function call logs
   - Try being more explicit in your request

---

## 🎯 Quick Test Commands

### For Groq AI (Copy-Paste into Chat):
```
Hi! I'd like to book an appointment for Samuel Eguale.
Email: egualesamuel@gmail.com
Phone: +1234567890
Date: January 15th, 2025
Time: 10:00 AM
Reason: Annual checkup
```

### For VAPI (Say this on phone):
```
"Hi, I want to book an appointment for Samuel Eguale at
egualesamuel@gmail.com for January 15th at 10 AM for an annual checkup"
```

---

## 📊 Where to Check Logs

1. **Supabase Function Logs**:
   - https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/logs
   - Filter by function: `groq-chat` or `vapi-webhook`

2. **n8n Execution Logs**:
   - n8n dashboard → Executions
   - Look for `/appointment-confirmation` workflow

3. **VAPI Logs**:
   - https://dashboard.vapi.ai
   - Check assistant logs for function calls

---

## 🎉 Expected Result

If everything works correctly, you should:

1. ✅ Have a smooth conversation with the AI
2. ✅ See the AI collect all appointment details
3. ✅ Get a confirmation message from the AI
4. ✅ Receive email at egualesamuel@gmail.com within 1-2 minutes
5. ✅ See a professional, branded email with appointment details

---

**Ready to test! Try both assistants and verify email confirmations arrive!** 🚀
