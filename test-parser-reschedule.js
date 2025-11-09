// Test what the parser sees for reschedule request
const payload = {
  "message": "Reschedule appointment from November 8 to November 15",
  "patientName": "Samuel Eguale",
  "patientEmail": "egualesamuel@gmail.com",
  "patientPhone": "+1234567890",
  "appointmentDate": "2025-11-15",
  "appointmentTime": "3:00 PM",
  "appointmentReason": "General checkup - Rescheduled via workflow test",
  "previousDate": "2025-11-08",
  "previousTime": "2:30 PM",
  "actionType": "reschedule",
  "source": "workflow_test"
};

console.log('Input payload:');
console.log('actionType:', payload.actionType);
console.log('message:', payload.message);
console.log('');

// Parser logic from workflow
const userMessage = payload.message || '';
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

console.log('Parser output:');
console.log('intentType:', intentType);
console.log('actionType:', actionType);
console.log('');
console.log('Should route to: Reschedule');
console.log('Actual route: intentType="' + intentType + '" AND actionType="' + actionType + '"');
