const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testN8NFieldMapping() {
  console.log('🧪 Testing N8N Field Mapping...\n');
  
  try {
    // Test 1: Check if we can query the messages table
    console.log('1️⃣ Testing basic table access...');
    const { data: existingMessages, error: queryError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (queryError) {
      console.error('❌ Cannot access messages table:', queryError.message);
      return;
    }
    console.log('✅ Messages table accessible');

    // Test 2: Insert test data using the correct field mapping
    console.log('\n2️⃣ Testing field mapping insert...');
    
    // Simulate n8n data structure
    const n8nSimulatedData = {
      body: {
        conversation_id: 'test-conv-n8n-123',
        message: 'This is a test message from n8n field mapping!'
      }
    };

    // Map to your table's actual field names
    const mappedData = {
      conversation_id: n8nSimulatedData.body.conversation_id,
      body: n8nSimulatedData.body.message,
      from_type: 'assistant'
    };

    console.log('📋 Mapped data:', mappedData);

    const { data: insertData, error: insertError } = await supabase
      .from('messages')
      .insert([mappedData])
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.log('\n💡 Common issues:');
      console.log('- Check if conversation_id exists in conversations table');
      console.log('- Verify field names match your table schema');
      console.log('- Check RLS policies');
      return;
    }

    console.log('✅ Insert successful!');
    console.log('📊 Inserted data:', insertData);

    // Test 3: Verify the data was stored correctly
    console.log('\n3️⃣ Verifying stored data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', insertData[0].id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Data verification successful!');
      console.log('🔍 Stored message:', {
        id: verifyData.id,
        conversation_id: verifyData.conversation_id,
        body: verifyData.body,
        from_type: verifyData.from_type,
        created_at: verifyData.created_at
      });
    }

    // Clean up test data
    console.log('\n4️⃣ Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', insertData[0].id);

    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 Field mapping test completed successfully!');
    console.log('\n📋 For your n8n workflow, use these mappings:');
    console.log('conversation_id: {{$json.body.conversation_id}}');
    console.log('body: {{$json.body.message}}');
    console.log('from_type: assistant');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testN8NFieldMapping();