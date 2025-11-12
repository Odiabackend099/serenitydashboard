import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your_anon_key_here'
);

const { data: profiles } = await supabase.from('profiles').select('*');
console.log(profiles.length > 0 ? '✅ Profile exists! You can now login.' : '❌ No profile found. Please create one.');
if (profiles.length > 0) {
  console.log('Profile:', profiles[0].name, '-', profiles[0].role);
}
