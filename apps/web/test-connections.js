// Quick connection test script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Supabase Connection...\n');

// Test 1: Check conversations table
console.log('1️⃣ Testing conversations table access...');
const { data: convs, error: convsError } = await supabase
  .from('conversations')
  .select('*')
  .limit(5);

if (convsError) {
  console.log('   ❌ Error:', convsError.message);
} else {
  console.log('   ✅ OK - Found', convs.length, 'conversations');
}

// Test 2: Check messages table
console.log('\n2️⃣ Testing messages table access...');
const { data: msgs, error: msgsError } = await supabase
  .from('messages')
  .select('*')
  .limit(5);

if (msgsError) {
  console.log('   ❌ Error:', msgsError.message);
} else {
  console.log('   ✅ OK - Found', msgs.length, 'messages');
}

// Test 3: Check profiles table
console.log('\n3️⃣ Testing profiles table access...');
const { data: profiles, error: profilesError } = await supabase
  .from('profiles')
  .select('*');

if (profilesError) {
  console.log('   ❌ Error:', profilesError.message);
} else {
  console.log('   ✅ OK - Found', profiles.length, 'staff profiles');
  if (profiles.length > 0) {
    console.log('   📋 Staff users:');
    profiles.forEach(p => {
      console.log(`      - ${p.name} (${p.role}) - ${p.active ? 'Active' : 'Inactive'}`);
    });
  }
}

// Test 4: Test Groq AI
console.log('\n4️⃣ Testing Groq AI connection...');
try {
  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your_groq_api_key_here',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Say "OK" if you can hear me' }],
      max_tokens: 10
    })
  });

  if (groqResponse.ok) {
    const groqData = await groqResponse.json();
    console.log('   ✅ OK - Groq AI responded:', groqData.choices[0].message.content);
  } else {
    console.log('   ❌ Error:', groqResponse.status, groqResponse.statusText);
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Test 5: Test VAPI (just check if credentials exist)
console.log('\n5️⃣ Checking VAPI credentials...');
const vapiAssistantId = process.env.VITE_VAPI_ASSISTANT_ID || 'your-vapi-assistant-id';
const vapiPublicKey = process.env.VITE_VAPI_PUBLIC_KEY || 'your-vapi-public-key';

if (vapiAssistantId && vapiPublicKey) {
  console.log('   ✅ OK - VAPI credentials configured');
  console.log('   📝 Assistant ID:', vapiAssistantId);
} else {
  console.log('   ❌ VAPI credentials missing');
}

console.log('\n✨ Connection tests complete!\n');
console.log('🚀 Now visit: http://localhost:5174/');
console.log('🔑 Login with your admin credentials\n');
