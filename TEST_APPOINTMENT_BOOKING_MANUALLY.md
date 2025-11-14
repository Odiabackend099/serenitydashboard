# Manual Test: Appointment Booking

**Follow these steps to test the appointment booking system**

---

## Step 1: Clear Browser Cache ⚠️ CRITICAL

**You MUST do this first or you'll still see errors!**

### Option A: Hard Refresh
- **Mac:** Press `Cmd + Shift + R`
- **Windows:** Press `Ctrl + Shift + F5`

### Option B: Incognito Window
- Open a new Incognito/Private browsing window
- This guarantees fresh cache

### Option C: Clear Cache Manually
1. Open Developer Tools (F12)
2. Right-click the Reload button
3. Select "Empty Cache and Hard Reload"

---

## Step 2: Login to Admin Dashboard

1. Go to: https://srhbackend.odia.dev
2. You should see the login page
3. Enter credentials:
   - **Email:** admin@example.com
   - **Password:** admin123
4. Click "Sign In"

**Expected:** You should be redirected to the dashboard

**If login fails:**
- These credentials might not exist in the database
- You may need to create an admin user in Supabase first

---

## Step 3: Open Chat Widget

1. Once logged in, look for the **chat widget icon** (usually bottom-right corner)
2. Click to open the chat interface
3. You should see a chat window open

**Expected:** Chat widget opens with greeting or empty state

---

## Step 4: Test Appointment Booking

### Test A: Complete Information at Once

**Type this message:**
```
I need to book an appointment for Samuel Eguale.
Email: egualesamuel@gmail.com
Phone: +1-555-0123
Date: November 15, 2025
Time: 2:00 PM
Reason: Annual physical exam
```

**Expected:**
1. AI should acknowledge the request
2. AI should confirm it has all the information
3. AI should book the appointment
4. You should get a success confirmation
5. Email should be sent to egualesamuel@gmail.com

---

### Test B: Step-by-Step Collection

**Message 1:**
```
I need to book an appointment
```

**Expected:** AI asks for your name

**Message 2:**
```
Samuel Eguale
```

**Expected:** AI asks for email

**Message 3:**
```
egualesamuel@gmail.com
```

**Expected:** AI asks for phone

**Message 4:**
```
+1-555-0123
```

**Expected:** AI asks for date

**Message 5:**
```
November 15, 2025
```

**Expected:** AI asks for time

**Message 6:**
```
2:00 PM
```

**Expected:** AI asks for reason

**Message 7:**
```
Annual physical exam
```

**Expected:** AI books the appointment and confirms

---

## Step 5: Verify Success

### Check Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for:
   - ✅ Version 2.0.2
   - ✅ Build 20251112-1950
   - ✅ "API Key Fixed"
   - ✅ No errors with "Server error" or "500"

### Check Network Tab
1. In Developer Tools, go to Network tab
2. Look for request to: `groq-chat`
3. Click on it to see details
4. Check Response:
   - ✅ Should return 200 OK
   - ✅ Should have AI response
   - ❌ Should NOT say "Groq API error: 400"

### Check Email
1. Go to inbox: egualesamuel@gmail.com
2. Look for appointment confirmation email
3. Should arrive within 30 seconds

---

## What to Look For

### ✅ SUCCESS Indicators
- Chat widget responds to messages
- AI collects all required information
- AI confirms appointment booking
- No error messages in console
- Email confirmation received
- Console shows version 2.0.2

### ❌ FAILURE Indicators
- "Server error" appears in chat
- Console shows "Groq API error: 400"
- Console shows old bundle (index-rLhKJaOP.js)
- No response from AI
- Error messages in red

---

## Troubleshooting

### Problem: Still Seeing "Server error"

**Cause:** Browser cache not cleared

**Solution:**
1. Close ALL browser tabs for srhbackend.odia.dev
2. Clear browser cache completely:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
   - Safari: Safari → Clear History
3. Restart browser
4. Try again in incognito window

---

### Problem: "Invalid login credentials"

**Cause:** admin@example.com user doesn't exist in Supabase

**Solution:**
1. Go to Supabase dashboard: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq
2. Go to Authentication → Users
3. Create a new user:
   - Email: admin@example.com
   - Password: admin123
4. Go to Table Editor → profiles
5. Create a profile for this user:
   - id: (user ID from auth)
   - role: admin
   - active: true

---

### Problem: Chat widget not visible

**Cause:** Not logged in or widget not loaded

**Solution:**
1. Ensure you're logged in
2. Look for chat icon in bottom-right corner
3. Check console for JavaScript errors
4. Try refreshing the page

---

### Problem: AI not responding

**Cause:** Groq API error or network issue

**Solution:**
1. Check browser console for errors
2. Check Network tab for failed requests
3. Look for "Groq API error: 400" in response
4. If you see this, the Groq API key may need updating

---

## Expected Results

### Console Output
```
Serenity Care AI - Version 2.0.2 - Build 20251112-1950 - API Key Fixed
[ChatWidget] Sending message to AI...
[ChatWidget] Calling Groq Edge Function
[ChatWidget] Tool call successful: book_appointment_with_confirmation
[ChatWidget] Message persisted: assistant
```

### Network Response (groq-chat)
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Great! I have all the information I need. Let me book your appointment...",
      "tool_calls": [{
        "function": {
          "name": "book_appointment_with_confirmation",
          "arguments": "{\"name\":\"Samuel Eguale\",\"email\":\"egualesamuel@gmail.com\",...}"
        }
      }]
    }
  }]
}
```

### Email Confirmation
```
Subject: Appointment Confirmation - Serenity Royale Hospital

Dear Samuel Eguale,

Your appointment has been confirmed:

Date: November 15, 2025
Time: 2:00 PM
Reason: Annual physical exam

...
```

---

## Report Results

After testing, please report:

1. **Browser cache cleared?** Yes/No
2. **Login successful?** Yes/No
3. **Chat widget opened?** Yes/No
4. **AI responded?** Yes/No
5. **Appointment booked?** Yes/No
6. **Email received?** Yes/No
7. **Console version:** (e.g., 2.0.2)
8. **Any errors?** (copy from console)

---

## Additional Tests

### Test Other AI Functions

Once appointment booking works, test these:

1. **Get Statistics:**
   ```
   Show me today's statistics
   ```

2. **Search Patient:**
   ```
   Find patient with email egualesamuel@gmail.com
   ```

3. **Check Availability:**
   ```
   What time slots are available on November 15?
   ```

4. **Get Appointments:**
   ```
   Show me all appointments for next week
   ```

---

**Remember:** The #1 most important step is **clearing your browser cache** before testing!

Without clearing cache, you'll still be using the old bundle with the wrong API key.
