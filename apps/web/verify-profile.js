import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y'
);

const { data: profiles } = await supabase.from('profiles').select('*');
console.log(profiles.length > 0 ? '✅ Profile exists! You can now login.' : '❌ No profile found. Please create one.');
if (profiles.length > 0) {
  console.log('Profile:', profiles[0].name, '-', profiles[0].role);
}
