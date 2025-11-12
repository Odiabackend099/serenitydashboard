// n8n Webhook Integration
// Webhook URLs are configured via environment variables
// For production: Use cloud n8n instance
// For development: Use local n8n instance

// Use cloud n8n in production, local in development
const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 
  (import.meta.env.PROD 
    ? 'https://cwai97.app.n8n.cloud/webhook'
    : 'http://localhost:5678/webhook');

// Webhook endpoints
const WEBHOOKS = {
  leadCapture: `${N8N_BASE_URL}/lead-capture`,
  serenityAssistant: `${N8N_BASE_URL}/serenity-assistant`,
  appointmentBooking: `${N8N_BASE_URL}/appointment-booking`,
  sentimentAlert: `${N8N_BASE_URL}/sentiment-alert`,
  conversationEnd: `${N8N_BASE_URL}/conversation-end`,
  // Production webhook endpoint (activated workflow)
  srhcareaiWebhook: `https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2`,
  // Legacy test endpoint (for manual testing only)
  testWebhook: `https://cwai97.app.n8n.cloud/webhook-test/srhcareai-webhook`
};

interface LeadCapturePayload {
  conversationId: string;
  patientRef: string;
  channel: string;
  messages: Array<{ role: string; content: string }>;
  intent?: string;
  sentiment?: string;
  keywords?: string[];
}

interface AppointmentBookingPayload {
  conversationId: string;
  patientRef: string;
  intent: 'appointment';
  requestedDate?: string;
  requestedTime?: string;
  reason?: string;
}

interface SentimentAlertPayload {
  conversationId: string;
  patientRef: string;
  sentiment: 'negative' | 'frustrated' | 'angry';
  messages: Array<{ role: string; content: string }>;
  priority: 'high' | 'urgent';
}

interface ConversationEndPayload {
  conversationId: string;
  patientRef: string;
  channel: string;
  totalMessages: number;
  duration: number;
  resolved: boolean;
}

// Helper function to call n8n webhooks
// Note: Webhook secret should be configured in n8n workflow, not in frontend
// Frontend only sends the payload - n8n validates the request
async function callWebhook(url: string, payload: any): Promise<void> {
  try {
    // Webhook secret is optional - n8n workflows can validate requests independently
    const webhookSecret = import.meta.env.VITE_N8N_WEBHOOK_SECRET;

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    // Only add secret header if configured (optional)
    if (webhookSecret) {
      headers['X-Webhook-Secret'] = webhookSecret;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`[n8n] Webhook failed: ${response.status} ${response.statusText}`);

      // Log response for debugging
      try {
        const errorData = await response.text();
        console.error('[n8n] Error response:', errorData);
      } catch (e) {
        // Ignore parse errors
      }
    } else {
      console.log('[n8n] Webhook triggered successfully:', url);

      // Log success response
      try {
        const successData = await response.json();
        console.log('[n8n] Response data:', successData);
      } catch (e) {
        // Ignore parse errors
      }
    }
  } catch (error) {
    // Fail silently if n8n is not running - don't break the app
    console.warn('[n8n] Webhook call failed (n8n may not be running):', error);
  }
}

// Extract intent from conversation messages
function extractIntent(messages: Array<{ role: string; content: string }>): string | undefined {
  const allText = messages.map(m => m.content.toLowerCase()).join(' ');

  if (allText.includes('appointment') || allText.includes('book') || allText.includes('schedule')) {
    return 'appointment';
  }
  if (allText.includes('emergency') || allText.includes('urgent') || allText.includes('pain')) {
    return 'emergency';
  }
  if (allText.includes('question') || allText.includes('ask') || allText.includes('info')) {
    return 'inquiry';
  }
  if (allText.includes('prescription') || allText.includes('medication') || allText.includes('refill')) {
    return 'prescription';
  }

  return undefined;
}

// Extract sentiment from messages
function extractSentiment(messages: Array<{ role: string; content: string }>): string {
  const userMessages = messages.filter(m => m.role === 'user');
  const lastUserMsg = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';

  // Simple keyword-based sentiment analysis
  const negativeKeywords = ['angry', 'frustrated', 'terrible', 'worst', 'bad', 'upset', 'disappointed'];
  const positiveKeywords = ['thank', 'great', 'good', 'helpful', 'excellent', 'appreciate'];

  const hasNegative = negativeKeywords.some(kw => lastUserMsg.includes(kw));
  const hasPositive = positiveKeywords.some(kw => lastUserMsg.includes(kw));

  if (hasNegative) return 'negative';
  if (hasPositive) return 'positive';
  return 'neutral';
}

// Extract keywords from messages
function extractKeywords(messages: Array<{ role: string; content: string }>): string[] {
  const allText = messages.map(m => m.content.toLowerCase()).join(' ');
  const keywords: string[] = [];

  const importantTerms = [
    'appointment', 'emergency', 'prescription', 'refill', 'doctor',
    'pain', 'urgent', 'insurance', 'billing', 'test', 'results',
    'surgery', 'consultation', 'referral', 'specialist'
  ];

  importantTerms.forEach(term => {
    if (allText.includes(term)) {
      keywords.push(term);
    }
  });

  return keywords;
}

// Trigger lead capture workflow
export async function triggerLeadCapture(
  conversationId: string,
  patientRef: string,
  channel: string,
  messages: Array<{ role: string; content: string }>
): Promise<void> {
  const intent = extractIntent(messages);
  const sentiment = extractSentiment(messages);
  const keywords = extractKeywords(messages);

  const payload: LeadCapturePayload = {
    conversationId,
    patientRef,
    channel,
    messages,
    intent,
    sentiment,
    keywords
  };

  await callWebhook(WEBHOOKS.leadCapture, payload);
}

// Trigger appointment booking workflow
export async function triggerAppointmentBooking(
  conversationId: string,
  patientRef: string,
  requestedDate?: string,
  requestedTime?: string,
  reason?: string,
  patientEmail?: string,
  patientPhone?: string,
  patientName?: string
): Promise<void> {
  const payload: any = {
    conversationId,
    sessionId: conversationId,
    patientRef,
    userId: patientRef,
    intent: 'appointment',
    appointmentDate: requestedDate,
    appointmentTime: requestedTime,
    appointmentReason: reason,
    appointmentType: 'consultation',
    patientEmail,
    patientPhone,
    patientName: patientName || 'Patient',
    message: `Appointment booking request for ${requestedDate || 'TBD'} at ${requestedTime || 'TBD'}. Reason: ${reason || 'General consultation'}`,
    channel: 'webchat',
    timestamp: new Date().toISOString()
  };

  // Use the srhcareai-webhook endpoint which handles all intents
  await callWebhook(WEBHOOKS.srhcareaiWebhook, payload);
}

// Trigger sentiment alert workflow
export async function triggerSentimentAlert(
  conversationId: string,
  patientRef: string,
  sentiment: 'negative' | 'frustrated' | 'angry',
  messages: Array<{ role: string; content: string }>
): Promise<void> {
  const payload: SentimentAlertPayload = {
    conversationId,
    patientRef,
    sentiment,
    messages: messages.slice(-5), // Last 5 messages for context
    priority: sentiment === 'angry' ? 'urgent' : 'high'
  };

  await callWebhook(WEBHOOKS.sentimentAlert, payload);
}

// Trigger conversation end workflow
export async function triggerConversationEnd(
  conversationId: string,
  patientRef: string,
  channel: string,
  totalMessages: number,
  duration: number,
  resolved: boolean
): Promise<void> {
  const payload: ConversationEndPayload = {
    conversationId,
    patientRef,
    channel,
    totalMessages,
    duration,
    resolved
  };

  await callWebhook(WEBHOOKS.conversationEnd, payload);
}

// Trigger SRHCareAI webhook (test endpoint)
export async function triggerSRHCareAIWebhook(
  payload: any
): Promise<void> {
  await callWebhook(WEBHOOKS.srhcareaiWebhook, payload);
}
