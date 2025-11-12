// Test script for Digital AI Assistant webhook payload validation
const testPayload = {
  actionType: "create",
  patientName: "Samuel Eguale",
  patientEmail: "egualesamuel@gmail.com",
  patientPhone: "+234-xxx-xxxx",
  appointmentDate: "2025-12-15",
  appointmentTime: "10:00 AM",
  appointmentReason: "Annual checkup and health screening"
};

console.log('🧪 Testing Digital AI Assistant Payload Validation');
console.log('==============================================');
console.log('📨 Input Payload:');
console.log(JSON.stringify(testPayload, null, 2));
console.log('');

// Simulate the validation logic from the workflow
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
  console.log('Patient Phone:', payload.patientPhone || 'Not provided');
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
      timestamp: new Date().toISOString(),
      validated: true
    }
  };
  
  console.log('');
  console.log('📤 Output Result:');
  console.log(JSON.stringify(result, null, 2));
  
  console.log('');
  console.log('🎯 Ready to send to webhook:');
  console.log('curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'' + JSON.stringify(testPayload) + '\'');
  
} catch (error) {
  console.log('❌ VALIDATION FAILED!');
  console.log('Error:', error.message);
  process.exit(1);
}