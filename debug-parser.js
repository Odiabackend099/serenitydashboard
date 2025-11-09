// Simulate the n8n parser to see what it outputs
const payload = {
  "patientName": "Samuel Eguale",
  "patientEmail": "egualesamuel@gmail.com",
  "patientPhone": "+1234567890",
  "appointmentDate": "2025-11-25",
  "appointmentTime": "2:00 PM",
  "appointmentReason": "New test appointment",
  "actionType": "create",
  "source": "debug_test"
};

const userMessage = payload.message || payload.text || payload.userMessage || '';
const messageLower = userMessage.toLowerCase();

let intentType = 'conversation';
let actionType = 'create';

// Check explicit actionType first
if (payload.actionType) {
  actionType = payload.actionType;
  if (['create', 'reschedule', 'cancel'].includes(actionType)) {
    intentType = 'appointment';
  }
}

// Check explicit intentType
if (payload.intentType) {
  intentType = payload.intentType;
}

console.log('Parser Output:');
console.log('intentType:', intentType);
console.log('actionType:', actionType);
console.log('');
console.log('Routing Check:');
console.log('intentType === "appointment":', intentType === 'appointment');
console.log('actionType === "create":', actionType === 'create');
console.log('Both conditions met:', intentType === 'appointment' && actionType === 'create');
