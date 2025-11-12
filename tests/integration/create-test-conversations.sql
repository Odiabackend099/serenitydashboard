-- HIPAA-Compliant Test Conversations with Realistic Messages
-- Uses fictional patient data that mimics real scenarios

-- Test Conversation 1: General Consultation
INSERT INTO conversations (channel, patient_ref, status, intent, ai_confidence, created_at)
VALUES ('webchat', 'patient-1001', 'open', 'appointment', 0.95, NOW() - INTERVAL '2 hours')
RETURNING id AS conv1_id \gset

INSERT INTO messages (conversation_id, from_type, body, created_at) VALUES
(:conv1_id, 'patient', 'Hi, I need to schedule an appointment for a general checkup', NOW() - INTERVAL '2 hours'),
(:conv1_id, 'ai', 'Hello! I''d be happy to help you schedule a general checkup. Can you please provide your preferred date and time?', NOW() - INTERVAL '2 hours' + INTERVAL '30 seconds'),
(:conv1_id, 'patient', 'How about next Tuesday at 2 PM?', NOW() - INTERVAL '2 hours' + INTERVAL '1 minute'),
(:conv1_id, 'ai', 'Let me check availability for Tuesday at 2 PM... Great! I have that slot available. May I have your full name and contact information?', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes'),
(:conv1_id, 'patient', 'Sarah Johnson, email: test.patient@example.com, phone: 555-0123', NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes'),
(:conv1_id, 'ai', 'Thank you, Sarah. Your appointment is confirmed for Tuesday at 2:00 PM. You''ll receive a confirmation email shortly. Is there anything specific you''d like to discuss during your visit?', NOW() - INTERVAL '2 hours' + INTERVAL '4 minutes'),
(:conv1_id, 'patient', 'Just a routine checkup and maybe discuss my blood pressure readings', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes'),
(:conv1_id, 'ai', 'Noted. Please bring any recent blood pressure logs with you. See you on Tuesday!', NOW() - INTERVAL '2 hours' + INTERVAL '6 minutes');

-- Test Conversation 2: Follow-up Appointment
INSERT INTO conversations (channel, patient_ref, status, intent, ai_confidence, created_at)
VALUES ('voice', 'patient-1002', 'open', 'appointment', 0.92, NOW() - INTERVAL '5 hours')
RETURNING id AS conv2_id \gset

INSERT INTO messages (conversation_id, from_type, body, created_at) VALUES
(:conv2_id, 'patient', 'I need a follow-up appointment after my recent lab work', NOW() - INTERVAL '5 hours'),
(:conv2_id, 'ai', 'I understand you need a follow-up for your lab results. When would you like to come in?', NOW() - INTERVAL '5 hours' + INTERVAL '15 seconds'),
(:conv2_id, 'patient', 'As soon as possible please', NOW() - INTERVAL '5 hours' + INTERVAL '45 seconds'),
(:conv2_id, 'ai', 'I have an opening tomorrow at 10:30 AM. Would that work for you?', NOW() - INTERVAL '5 hours' + INTERVAL '1 minute'),
(:conv2_id, 'patient', 'Yes, perfect. Thank you!', NOW() - INTERVAL '5 hours' + INTERVAL '2 minutes'),
(:conv2_id, 'ai', 'You''re all set for tomorrow at 10:30 AM. The doctor will review your lab results with you then.', NOW() - INTERVAL '5 hours' + INTERVAL '3 minutes');

-- Test Conversation 3: Prescription Refill Inquiry
INSERT INTO conversations (channel, patient_ref, status, intent, ai_confidence, created_at)
VALUES ('whatsapp', 'patient-1003', 'open', 'general', 0.88, NOW() - INTERVAL '1 hour')
RETURNING id AS conv3_id \gset

INSERT INTO messages (conversation_id, from_type, body, created_at) VALUES
(:conv3_id, 'patient', 'Hello, I need to refill my prescription', NOW() - INTERVAL '1 hour'),
(:conv3_id, 'ai', 'I can help you with that. Can you tell me which medication you need refilled?', NOW() - INTERVAL '1 hour' + INTERVAL '20 seconds'),
(:conv3_id, 'patient', 'My blood pressure medication - I think it''s called Lisinopril', NOW() - INTERVAL '1 hour' + INTERVAL '1 minute'),
(:conv3_id, 'ai', 'Thank you. I''ll need to transfer you to our pharmacy team to process your Lisinopril refill. They''ll verify your prescription and arrange the refill. One moment please.', NOW() - INTERVAL '1 hour' + INTERVAL '2 minutes'),
(:conv3_id, 'staff', 'Hi, I''m here from the pharmacy team. I see you need a Lisinopril refill. Let me check your records.', NOW() - INTERVAL '1 hour' + INTERVAL '3 minutes'),
(:conv3_id, 'patient', 'Thank you', NOW() - INTERVAL '1 hour' + INTERVAL '4 minutes'),
(:conv3_id, 'staff', 'Your refill is approved and will be ready for pickup tomorrow after 2 PM. We''ll send a text when it''s ready.', NOW() - INTERVAL '1 hour' + INTERVAL '5 minutes');

-- Test Conversation 4: Staff Taken Over
INSERT INTO conversations (channel, patient_ref, status, taken_over_by, taken_over_at, intent, ai_confidence, created_at)
VALUES ('webchat', 'patient-1004', 'taken_over', (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1), NOW() - INTERVAL '30 minutes', 'appointment', 0.90, NOW() - INTERVAL '3 hours')
RETURNING id AS conv4_id \gset

INSERT INTO messages (conversation_id, from_type, body, created_at) VALUES
(:conv4_id, 'patient', 'I have a question about my recent bill', NOW() - INTERVAL '3 hours'),
(:conv4_id, 'ai', 'I understand you have a billing question. Let me connect you with our billing specialist.', NOW() - INTERVAL '3 hours' + INTERVAL '30 seconds'),
(:conv4_id, 'staff', 'Hello, I''m Sarah from billing. How can I help you today?', NOW() - INTERVAL '30 minutes'),
(:conv4_id, 'patient', 'I received a bill for $250 but I thought my insurance covered everything', NOW() - INTERVAL '30 minutes' + INTERVAL '1 minute'),
(:conv4_id, 'staff', 'Let me look into that for you. Can you provide your account number or date of service?', NOW() - INTERVAL '30 minutes' + INTERVAL '2 minutes'),
(:conv4_id, 'patient', 'The service was on October 15th', NOW() - INTERVAL '30 minutes' + INTERVAL '3 minutes'),
(:conv4_id, 'staff', 'I see the charge. It looks like there''s a $250 deductible on your plan. However, I''ll submit a review to make sure everything was billed correctly. You should hear back within 3-5 business days.', NOW() - INTERVAL '30 minutes' + INTERVAL '5 minutes'),
(:conv4_id, 'patient', 'Thank you so much!', NOW() - INTERVAL '30 minutes' + INTERVAL '6 minutes');

-- Test Conversation 5: Recent Active Conversation
INSERT INTO conversations (channel, patient_ref, status, intent, ai_confidence, created_at)
VALUES ('webchat', 'patient-1005', 'open', 'appointment', 0.96, NOW() - INTERVAL '15 minutes')
RETURNING id AS conv5_id \gset

INSERT INTO messages (conversation_id, from_type, body, created_at) VALUES
(:conv5_id, 'patient', 'Good afternoon! I''m looking to schedule a consultation for persistent headaches', NOW() - INTERVAL '15 minutes'),
(:conv5_id, 'ai', 'Good afternoon! I''m sorry to hear about your headaches. I can help you schedule a consultation with one of our doctors. How long have you been experiencing these headaches?', NOW() - INTERVAL '15 minutes' + INTERVAL '25 seconds'),
(:conv5_id, 'patient', 'About two weeks now. They''re pretty frequent, almost daily', NOW() - INTERVAL '15 minutes' + INTERVAL '1 minute'),
(:conv5_id, 'ai', 'I understand. Given the frequency, I''d recommend seeing a doctor soon. I have availability this Thursday at 3:00 PM or Friday at 11:00 AM. Which works better for you?', NOW() - INTERVAL '15 minutes' + INTERVAL '2 minutes'),
(:conv5_id, 'patient', 'Friday at 11 AM would be perfect', NOW() - INTERVAL '15 minutes' + INTERVAL '3 minutes'),
(:conv5_id, 'ai', 'Excellent. May I have your name and contact information to complete the booking?', NOW() - INTERVAL '15 minutes' + INTERVAL '4 minutes');

-- Print summary
SELECT
  'Test conversations created successfully!' as status,
  COUNT(*) as total_conversations,
  SUM(CASE WHEN created_at > NOW() - INTERVAL '6 hours' THEN 1 ELSE 0 END) as recent_conversations
FROM conversations
WHERE patient_ref LIKE 'patient-100%';

SELECT
  'Test messages created successfully!' as status,
  COUNT(*) as total_messages
FROM messages
WHERE conversation_id IN (
  SELECT id FROM conversations WHERE patient_ref LIKE 'patient-100%'
);
