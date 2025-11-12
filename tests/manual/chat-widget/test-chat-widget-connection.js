// Test script to simulate chat widget connection issues
// This simulates the exact same calls the chat widget makes

const WEBHOOK_URL = 'https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2';

// Simulate the exact payload the chat widget sends
const appointmentPayload = {
  conversationId: 'test-conv-123',
  sessionId: 'test-conv-123',
  patientRef: 'patient-test123',
  userId: 'patient-test123',
  intent: 'appointment',
  appointmentDate: '2024-12-21',
  appointmentTime: '10:00 AM',
  appointmentReason: 'Test appointment from chat widget simulation',
  appointmentType: 'consultation',
  patientEmail: 'test@example.com',
  patientPhone: '+1234567890',
  patientName: 'Test User',
  message: 'Appointment booking request for 2024-12-21 at 10:00 AM. Reason: Test appointment from chat widget simulation',
  channel: 'webchat',
  timestamp: new Date().toISOString()
};

console.log('🧪 Testing chat widget connection...');
console.log('📡 Webhook URL:', WEBHOOK_URL);
console.log('📤 Payload:', JSON.stringify(appointmentPayload, null, 2));

// Test the connection
fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(appointmentPayload)
})
.then(response => {
  console.log('📊 Response Status:', response.status);
  console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.text();
})
.then(data => {
  console.log('✅ SUCCESS! Webhook responded with:', data);
  console.log('📧 Check your email for the appointment confirmation!');
})
.catch(error => {
  console.error('❌ ERROR! Chat widget connection failed:', error.message);
  
  // Check if it's a CORS error
  if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
    console.error('🔍 This appears to be a CORS issue!');
    console.error('🔧 The n8n webhook needs to be configured to allow requests from your domain.');
    console.error('🔧 Check the n8n workflow settings and add CORS headers.');
  }
});