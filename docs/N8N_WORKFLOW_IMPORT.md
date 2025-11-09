# n8n Workflow Import Instructions

## Overview
This guide walks you through importing the Serenity Royale Hospital automation workflow into your n8n cloud instance.

## Prerequisites
- n8n cloud account at: https://cwai97.app.n8n.cloud
- Workflow file location: `/Users/odiadev/Downloads/SRHCareAI Multi-Channel Patient Engagement and Triage Automation.json`

## Import Steps

### 1. Access n8n Dashboard
1. Open your browser and go to: https://cwai97.app.n8n.cloud
2. Log in with your credentials

### 2. Import the Workflow
1. Click on **Workflows** in the left sidebar
2. Click the **Import from File** button (or use the dropdown menu > Import from File)
3. Select the workflow file:
   ```
   /Users/odiadev/Downloads/SRHCareAI Multi-Channel Patient Engagement and Triage Automation.json
   ```
4. Click **Open** to import

### 3. Configure Webhook URL
After import, you need to verify the webhook configuration:

1. Open the imported workflow
2. Find the **Webhook** trigger node (should be the first node)
3. Verify the webhook path is set to: `serenity-assistant`
4. The full webhook URL should be:
   ```
   https://cwai97.app.n8n.cloud/webhook/serenity-assistant
   ```

### 4. Configure Supabase Connection
The workflow needs credentials to write back to Supabase:

1. Find the **Supabase** nodes in the workflow (for appointments, audit logs)
2. Click on each Supabase node
3. Set credentials:
   - **Supabase URL**: `https://yfrpxqvjshwaaomgcaoq.supabase.co`
   - **Service Role Key**: (Get from Supabase Dashboard > Project Settings > API > service_role key)

### 5. Configure Email/Calendar Integration
If using Google Calendar or SendGrid:

1. **Google Calendar** (for appointment booking):
   - Click on Google Calendar node
   - Connect your Google account via OAuth
   - Select the calendar to use for appointments

2. **SendGrid** (for email notifications):
   - Click on SendGrid node
   - Add your SendGrid API key
   - Verify sender email is configured

### 6. Activate the Workflow
1. Click the **Active** toggle in the top right
2. Verify status shows "Active"
3. The webhook is now ready to receive requests from the assistant-call Edge Function

## Testing the Webhook

Test that n8n can receive requests:

```bash
curl -X POST https://cwai97.app.n8n.cloud/webhook/serenity-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "action": "book_appointment",
    "payload": {
      "patient_name": "Test Patient",
      "phone": "+1234567890",
      "datetime": "2025-11-07T14:00:00Z",
      "reason": "Test appointment"
    },
    "conversation_id": "test-conv-123",
    "user_id": "test-user",
    "audit_id": "test-audit-123"
  }'
```

Expected response:
```json
{
  "success": true,
  "appointment_id": "...",
  "calendar_event_id": "..."
}
```

## Workflow Actions

The workflow handles these actions from the assistant:

1. **book_appointment**
   - Creates Google Calendar event
   - Inserts appointment into Supabase `appointments` table
   - Sends confirmation email to patient
   - Updates audit_logs with success/failure

2. **send_email**
   - Sends email via SendGrid
   - Logs to audit_logs

3. **send_whatsapp**
   - Sends WhatsApp message via Twilio
   - Logs to audit_logs

4. **daily_summary**
   - Queries Supabase for daily stats
   - Generates summary report
   - Emails to admin

## Troubleshooting

### Webhook returns 404
- Verify workflow is **Active**
- Check webhook path is exactly `serenity-assistant`

### Supabase writes fail
- Verify Service Role Key is correct
- Check RLS policies allow service role to INSERT

### Calendar events not created
- Verify Google account is connected
- Check calendar permissions

## Environment Variables Needed

Make sure these are set in n8n:
- `SUPABASE_URL`: https://yfrpxqvjshwaaomgcaoq.supabase.co
- `SUPABASE_SERVICE_KEY`: (from Supabase dashboard)
- `SENDGRID_API_KEY`: (if using email)
- `TWILIO_ACCOUNT_SID`: (if using WhatsApp)
- `TWILIO_AUTH_TOKEN`: (if using WhatsApp)

## Next Steps

After import and configuration:
1. Test the webhook endpoint directly (see Testing section above)
2. Test end-to-end from the widget (see main README for E2E test)
3. Monitor audit_logs table in Supabase to verify actions are being logged
