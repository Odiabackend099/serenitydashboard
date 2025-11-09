import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y'
);

console.log('🔍 Checking profiles table...\n');

const { data: profiles, error } = await supabase
  .from('profiles')
  .select('*');

if (error) {
  console.log('❌ Error:', error.message);
} else {
  console.log(`✅ Found ${profiles.length} profile(s):\n`);
  profiles.forEach(p => {
    console.log(`📋 Profile:`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Name: ${p.name}`);
    console.log(`   Role: ${p.role}`);
    console.log(`   Active: ${p.active}`);
    console.log('');
  });
}

console.log('💡 To fix the login issue:');
console.log('1. Go to Supabase Dashboard → Authentication → Users');
console.log('2. Find the user with email: admin@example.com');
console.log('3. Copy that user\'s ID');
console.log('4. Check if the ID above matches the user ID from step 3');
console.log('5. If they don\'t match, update the profile with the correct user ID\n');
