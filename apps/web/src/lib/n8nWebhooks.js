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
// Helper function to call n8n webhooks
// Note: Webhook secret should be configured in n8n workflow, not in frontend
// Frontend only sends the payload - n8n validates the request
async function callWebhook(url, payload) {
    try {
        // Webhook secret is optional - n8n workflows can validate requests independently
        const webhookSecret = import.meta.env.VITE_N8N_WEBHOOK_SECRET;
        const headers = {
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
            }
            catch (e) {
                // Ignore parse errors
            }
        }
        else {
            console.log('[n8n] Webhook triggered successfully:', url);
            // Log success response
            try {
                const successData = await response.json();
                console.log('[n8n] Response data:', successData);
            }
            catch (e) {
                // Ignore parse errors
            }
        }
    }
    catch (error) {
        // Fail silently if n8n is not running - don't break the app
        console.warn('[n8n] Webhook call failed (n8n may not be running):', error);
    }
}
// Extract intent from conversation messages
function extractIntent(messages) {
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
function extractSentiment(messages) {
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMsg = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';
    // Simple keyword-based sentiment analysis
    const negativeKeywords = ['angry', 'frustrated', 'terrible', 'worst', 'bad', 'upset', 'disappointed'];
    const positiveKeywords = ['thank', 'great', 'good', 'helpful', 'excellent', 'appreciate'];
    const hasNegative = negativeKeywords.some(kw => lastUserMsg.includes(kw));
    const hasPositive = positiveKeywords.some(kw => lastUserMsg.includes(kw));
    if (hasNegative)
        return 'negative';
    if (hasPositive)
        return 'positive';
    return 'neutral';
}
// Extract keywords from messages
function extractKeywords(messages) {
    const allText = messages.map(m => m.content.toLowerCase()).join(' ');
    const keywords = [];
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
export async function triggerLeadCapture(conversationId, patientRef, channel, messages) {
    const intent = extractIntent(messages);
    const sentiment = extractSentiment(messages);
    const keywords = extractKeywords(messages);
    const payload = {
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
export async function triggerAppointmentBooking(conversationId, patientRef, requestedDate, requestedTime, reason, patientEmail, patientPhone, patientName) {
    const payload = {
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
export async function triggerSentimentAlert(conversationId, patientRef, sentiment, messages) {
    const payload = {
        conversationId,
        patientRef,
        sentiment,
        messages: messages.slice(-5), // Last 5 messages for context
        priority: sentiment === 'angry' ? 'urgent' : 'high'
    };
    await callWebhook(WEBHOOKS.sentimentAlert, payload);
}
// Trigger conversation end workflow
export async function triggerConversationEnd(conversationId, patientRef, channel, totalMessages, duration, resolved) {
    const payload = {
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
export async function triggerSRHCareAIWebhook(payload) {
    await callWebhook(WEBHOOKS.srhcareaiWebhook, payload);
}
