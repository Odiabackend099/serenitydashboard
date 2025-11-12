const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFromTypeConstraint() {
  console.log('🔍 Checking from_type constraint and existing values...\n');
  
  try {
    // Check existing from_type values
    console.log('1️⃣ Checking existing from_type values...');
    const { data: existingMessages, error: queryError } = await supabase
      .from('messages')
      .select('from_type')
      .not('from_type', 'is', null);

    if (queryError) {
      console.error('❌ Error querying messages:', queryError.message);
      return;
    }

    if (existingMessages && existingMessages.length > 0) {
      console.log('✅ Found existing from_type values:');
      const uniqueValues = [...new Set(existingMessages.map(msg => msg.from_type))];
      uniqueValues.forEach(value => {
        console.log(`  - "${value}"`);
      });
    } else {
      console.log('ℹ️ No existing messages found');
    }

    // Try different values to see what works
    console.log('\n2️⃣ Testing different from_type values...');
    
    const testValues = ['ai', 'bot', 'system', 'agent', 'assistant', 'user', 'human', 'patient', 'client'];
    
    for (const testValue of testValues) {
      try {
        const { error } = await supabase
          .from('messages')
          .insert([{
            conversation_id: 'bbef49e6-2bf4-4e59-90df-0c51ba75b571', // Use existing conversation
            body: `Test message with from_type: ${testValue}`,
            from_type: testValue
          }]);

        if (error) {
          console.log(`❌ "${testValue}": ${error.message}`);
        } else {
          console.log(`✅ "${testValue}": WORKS!`);
          
          // Clean up the test message
          await supabase
            .from('messages')
            .delete()
            .eq('body', `Test message with from_type: ${testValue}`);
        }
      } catch (error) {
        console.log(`❌ "${testValue}": ${error.message}`);
      }
    }

    console.log('\n3️⃣ Checking table constraints...');
    // Try to get constraint information
    const { data: constraintData, error: constraintError } = await supabase
      .rpc('information_schema.check_constraints')
      .select('*')
      .like('constraint_name', '%messages%');

    if (constraintError) {
      console.log('ℹ️ Could not retrieve constraint details via information_schema');
    } else if (constraintData && constraintData.length > 0) {
      console.log('📋 Constraint information:', constraintData);
    }

    console.log('\n✅ Test complete! Use the working from_type values above.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkFromTypeConstraint();