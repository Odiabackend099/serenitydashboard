import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y'
);

console.log('Creating admin profile...\n');

const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: '20ccbfc3-5bd0-4c8c-bb03-84ba93c5f3e8',
    name: 'Admin User',
    role: 'admin',
    active: true
  })
  .select();

if (error) {
  console.log('❌ Error:', error.message);
  console.log('\nThis might be because:');
  console.log('1. The profile already exists');
  console.log('2. RLS policy is blocking the insert\n');
  console.log('Please run this SQL in Supabase SQL Editor instead:');
  console.log('\nINSERT INTO public.profiles (id, name, role, active)');
  console.log("VALUES ('20ccbfc3-5bd0-4c8c-bb03-84ba93c5f3e8', 'Admin User', 'admin', true);\n");
} else {
  console.log('✅ Profile created successfully!');
  console.log('Details:', data[0]);
  console.log('\n🎉 You can now login with admin@example.com\n');
}
