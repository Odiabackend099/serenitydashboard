import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your_anon_key_here'
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
