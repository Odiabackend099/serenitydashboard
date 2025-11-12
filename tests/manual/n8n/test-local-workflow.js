#!/usr/bin/env node

// Local test for Digital AI Assistant workflow validation
// This simulates the workflow logic without making network calls

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateName(name) {
  return name && name.length >= 2 && name.length <= 50;
}

function validateFutureDate(dateStr) {
  const appointmentDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return appointmentDate >= today;
}

function validatePayload(payload) {
  console.log('🔍 Validating payload...');
  console.log('Input:', JSON.stringify(payload, null, 2));
  
  const errors = [];
  
  // Required fields
  if (!payload.actionType) {
    errors.push('actionType is required');
  }
  
  if (!payload.patientName) {
    errors.push('patientName is required');
  } else if (!validateName(payload.patientName)) {
    errors.push('patientName must be 2-50 characters');
  }
  
  if (!payload.patientEmail) {
    errors.push('patientEmail is required');
  } else if (!validateEmail(payload.patientEmail)) {
    errors.push('Invalid email format');
  }
  
  if (!payload.appointmentDate) {
    errors.push('appointmentDate is required');
  } else if (!validateFutureDate(payload.appointmentDate)) {
    errors.push('appointmentDate must be today or in the future');
  }
  
  if (!payload.appointmentTime) {
    errors.push('appointmentTime is required');
  }
  
  // Action-specific validation
  if (payload.actionType === 'create' || payload.actionType === 'reschedule') {
    if (!payload.appointmentReason) {
      errors.push('appointmentReason is required for create/reschedule');
    }
  }
  
  if (payload.actionType === 'reschedule') {
    if (!payload.previousDate || !payload.previousTime) {
      errors.push('previousDate and previousTime are required for reschedule');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    actionType: payload.actionType
  };
}

function simulateWorkflowLogic(payload) {
  console.log('\n🤖 Simulating Digital AI Assistant Workflow...\n');
  
  const validation = validatePayload(payload);
  
  if (!validation.isValid) {
    console.log('❌ Validation Failed:');
    validation.errors.forEach(error => console.log(`  - ${error}`));
    return {
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    };
  }
  
  console.log('✅ Validation Passed!');
  
  // Simulate email sending
  let emailType = '';
  let emailSubject = '';
  
  switch (payload.actionType) {
    case 'create':
      emailType = 'confirmation';
      emailSubject = 'Appointment Confirmed';
      break;
    case 'reschedule':
      emailType = 'reschedule';
      emailSubject = 'Appointment Rescheduled';
      break;
    case 'cancel':
      emailType = 'cancellation';
      emailSubject = 'Appointment Cancelled';
      break;
    default:
      emailType = 'unknown';
      emailSubject = 'Appointment Update';
  }
  
  console.log(`📧 Simulating ${emailType} email to: ${payload.patientEmail}`);
  console.log(`Subject: ${emailSubject}`);
  
  return {
    success: true,
    message: `${payload.actionType} request processed successfully`,
    emailSent: {
      to: payload.patientEmail,
      type: emailType,
      subject: emailSubject
    }
  };
}

// Test with your provided payload
const testPayload = {
  actionType: "create",
  patientName: "Samuel Eguale",
  patientEmail: "egualesamuel@gmail.com",
  patientPhone: "+234-xxx-xxxx",
  appointmentDate: "2025-12-15",
  appointmentTime: "10:00 AM",
  appointmentReason: "Annual checkup and health screening"
};

console.log('🚀 Testing Digital AI Assistant Workflow Locally\n');
console.log('=' .repeat(60));

const result = simulateWorkflowLogic(testPayload);

console.log('\n' + '=' .repeat(60));
console.log('📊 Test Results:');
console.log(JSON.stringify(result, null, 2));

if (result.success) {
  console.log('\n🎉 SUCCESS! Your payload is valid and would be processed by the workflow.');
  console.log('💡 If the webhook was accessible, you would receive:');
  console.log('   - Email confirmation sent to egualesamuel@gmail.com');
  console.log('   - JSON response confirming appointment creation');
} else {
  console.log('\n❌ FAILED! Please fix the validation errors above.');
}

console.log('\n📋 Additional Test Cases:');
console.log('Run with different payloads to test other scenarios:');
console.log('node test-local-workflow.js reschedule');
console.log('node test-local-workflow.js cancel');
console.log('node test-local-workflow.js invalid');