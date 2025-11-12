const fs = require('fs');
const path = '/Users/odiadev/Desktop/serenity dasboard/n8n/production/Digital AI Assistant.json';
const workflow = JSON.parse(fs.readFileSync(path, 'utf8'));

console.log('🧪 Testing Digital AI Assistant Workflow');
console.log('=====================================');

// Test payload from user
const testPayload = {
  actionType: 'create',
  patientName: 'John Doe',
  patientEmail: 'john@example.com',
  appointmentDate: '2025-12-01',
  appointmentTime: '10:00 AM',
  appointmentReason: 'Annual checkup'
};

console.log('📨 Input Payload:');
console.log(JSON.stringify(testPayload, null, 2));
console.log('');

// Simulate the validation logic
try {
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>]/g, '').trim();
  }
  
  const payload = testPayload;
  const actionType = (payload.actionType || payload.action || 'create').toLowerCase().trim();
  let patientName = payload.patientName || payload.patient_name || payload.name || '';
  let patientEmail = (payload.patientEmail || payload.patient_email || payload.email || '').trim();
  
  if (!patientEmail) {
    throw new Error('VALIDATION_ERROR: patientEmail is required');
  }
  
  if (patientEmail.length > 254) {
    throw new Error('VALIDATION_ERROR: Email exceeds maximum length of 254 characters');
  }
  
  if (!EMAIL_REGEX.test(patientEmail)) {
    throw new Error('VALIDATION_ERROR: Invalid email format');
  }
  
  if (!patientName) {
    throw new Error('VALIDATION_ERROR: patientName is required');
  }
  
  patientName = sanitizeInput(patientName);
  
  if (patientName.length > 100) {
    throw new Error('VALIDATION_ERROR: Name exceeds maximum length of 100 characters');
  }
  
  if (patientName.length < 2) {
    throw new Error('VALIDATION_ERROR: Name must be at least 2 characters long');
  }
  
  const appointmentDate = payload.appointmentDate || payload.appointment_date || payload.date || 'TBD';
  const appointmentTime = payload.appointmentTime || payload.appointment_time || payload.time || 'TBD';
  const appointmentReason = sanitizeInput(payload.appointmentReason || payload.appointment_reason || payload.reason || 'General consultation');
  const previousDate = payload.previousDate || payload.previous_date || 'N/A';
  const previousTime = payload.previousTime || payload.previous_time || 'N/A';
  
  if (appointmentDate !== 'TBD') {
    const appointmentDateObj = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(appointmentDateObj.getTime())) {
      throw new Error('VALIDATION_ERROR: Invalid appointment date format');
    } else if (appointmentDateObj < today) {
      throw new Error('VALIDATION_ERROR: Appointment date must be in the future');
    }
  }
  
  console.log('✅ VALIDATION PASSED!');
  console.log('Action Type:', actionType);
  console.log('Patient Name:', patientName);
  console.log('Patient Email:', patientEmail.toLowerCase());
  console.log('Appointment Date:', appointmentDate);
  console.log('Appointment Time:', appointmentTime);
  console.log('Appointment Reason:', appointmentReason.substring(0, 500));
  
  const result = {
    json: {
      actionType,
      patientName,
      patientEmail: patientEmail.toLowerCase(),
      patientPhone: payload.patientPhone || 'Not provided',
      appointmentDate,
      appointmentTime,
      appointmentReason: appointmentReason.substring(0, 500),
      previousDate,
      previousTime,
      timestamp: new Date().toISOString(),
      validated: true
    }
  };
  
  console.log('');
  console.log('📤 Output Result:');
  console.log(JSON.stringify(result, null, 2));
  
} catch (error) {
  console.log('❌ VALIDATION FAILED!');
  console.log('Error:', error.message);
}