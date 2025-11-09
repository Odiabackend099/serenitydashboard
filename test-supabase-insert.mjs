// Test if Supabase credentials allow inserting leads
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

console.log('🧪 Testing Supabase Insert Permissions...\n');

// Test with ANON key (what n8n might be using if misconfigured)
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('1️⃣ Testing with ANON key (should fail due to RLS)...');

const testLead = {
  conversation_id: '550e8400-e29b-41d4-a716-446655440099',
  patient_ref: 'test-patient-direct',
  channel: 'webchat',
  intent: 'test',
  sentiment: 'neutral',
  keywords: ['test'],
  priority: 'normal',
  status: 'new'
};

try {
  const { data, error } = await supabaseAnon
    .from('leads')
    .insert(testLead)
    .select();

  if (error) {
    console.log('   ❌ Insert failed (expected)');
    console.log('   Error:', error.message);
    console.log('   Details:', error.details);
    console.log('\n   This is WHY n8n needs the SERVICE_ROLE key!');
    console.log('   The anon key cannot bypass RLS policies.');
  } else {
    console.log('   ✅ Unexpectedly succeeded!');
    console.log('   Data:', data);
  }
} catch (err) {
  console.log('   ❌ Error:', err.message);
}

console.log('\n' + '='.repeat(60));
console.log('📋 What this means for n8n:');
console.log('='.repeat(60));
console.log('\nYour n8n workflow MUST use the SERVICE_ROLE key, not anon key.');
console.log('\nTo get your service_role key:');
console.log('1. Go to: https://supabase.com/dashboard/project/yfrpxqvjshwaaomgcaoq/settings/api');
console.log('2. Find "service_role" under "Project API keys"');
console.log('3. Copy the key (starts with eyJ...)');
console.log('4. Add it to n8n credentials');
console.log('\nThe service_role key bypasses RLS and can insert directly.');
console.log('\n');
