# AI Chat Widget to n8n Workflow Integration

## Overview
The AI chat widget is fully integrated with the n8n workflow system and can trigger various actions through the approved `serenity-webhook-v2` endpoint.

## How It Works

### 1. Environment Configuration
The AI chat widget uses the following environment variable:
```bash
VITE_N8N_WEBHOOK_BASE=https://cwai97.app.n8n.cloud/webhook
```

### 2. Available Functions
The AI chat widget can trigger the following n8n workflow actions:

#### Appointment Booking with Confirmation
- **Function**: `bookAppointmentWithConfirmation()`
- **Trigger**: When user requests to book an appointment
- **Endpoint**: `serenity-webhook-v2`
- **Data Sent**:
  ```json
  {
    "action": "book_appointment_with_confirmation",
    "patientName": "John Doe",
    "patientEmail": "john@example.com",
    "patientPhone": "+1234567890",
    "appointmentDate": "2024-12-15",
    "appointmentTime": "14:30",
    "appointmentReason": "General consultation",
    "source": "groq_text_chat"
  }
  ```

#### WhatsApp Message Sending
- **Function**: `sendWhatsappMessage()`
- **Trigger**: When AI needs to send WhatsApp messages
- **Endpoint**: `serenity-webhook-v2`
- **Action**: `send_whatsapp`

#### SMS Reminder Sending
- **Function**: `sendSmsReminder()`
- **Trigger**: When AI needs to send SMS reminders
- **Endpoint**: `serenity-webhook-v2`
- **Action**: `send_sms`

### 3. Implementation Details

#### File: `apps/web/src/lib/groqTools.ts`
The main integration logic is located in this file. Key functions:

```typescript
// Lines 765-785: Appointment booking function
export async function bookAppointmentWithConfirmation(
  name: string,
  email: string,
  phone: string,
  date: string,
  time: string,
  reason?: string
): Promise<any> {
  const n8nWebhookBase = import.meta.env.VITE_N8N_WEBHOOK_BASE;
  if (!n8nWebhookBase) {
    throw new Error('N8N webhook not configured');
  }

  const response = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Appointment data...
    }),
  });
  
  // Handle response...
}
```

### 4. Testing the Integration

#### Manual Testing
1. Open the web application at `http://localhost:5174`
2. Use the AI chat widget
3. Ask to book an appointment: "I want to book an appointment for next Tuesday at 2 PM"
4. The AI will collect the necessary information and trigger the n8n workflow

#### Automated Testing
Run the integration test script:
```bash
node test-ai-chat-integration.js
```

### 5. Troubleshooting

#### Common Issues
1. **"N8N webhook not configured" error**
   - Ensure `VITE_N8N_WEBHOOK_BASE` is set in your `.env.local` file
   - Check that the environment variable is loaded properly

2. **Workflow not triggering**
   - Verify the n8n workflow is active and the webhook node is listening
   - Check the n8n logs for any errors
   - Ensure the webhook URL is accessible

3. **Environment variable mismatch**
   - The code expects `VITE_N8N_WEBHOOK_BASE`
   - The `.env.example` file has been updated to use the correct variable name

### 6. Verification Checklist

✅ **Environment Setup**
- [ ] `VITE_N8N_WEBHOOK_BASE` is set in `.env.local`
- [ ] Value matches your n8n instance webhook base URL

✅ **Code Integration**
- [ ] `bookAppointmentWithConfirmation()` uses `serenity-webhook-v2`
- [ ] `sendWhatsappMessage()` uses `serenity-webhook-v2`
- [ ] `sendSmsReminder()` uses `serenity-webhook-v2`

✅ **Workflow Configuration**
- [ ] n8n workflow is active and listening
- [ ] Webhook node is configured with the correct path
- [ ] Workflow can handle the data format sent by the AI

### 7. Next Steps
The AI chat widget is now fully integrated with the n8n workflow system. When users interact with the chat widget and request appointments or other actions, the AI will automatically trigger the appropriate n8n workflows through the `serenity-webhook-v2` endpoint.

The system is ready for production use and can handle:
- Appointment booking with email confirmation
- WhatsApp message sending
- SMS reminder sending
- Future workflow actions as they are added