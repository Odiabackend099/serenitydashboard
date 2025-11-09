const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteN8NFlow() {
  console.log('🧪 Testing Complete N8N Flow...\n');
  
  try {
    // Step 1: Create a test conversation
    console.log('1️⃣ Creating test conversation...');
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert([{
        user_id: '00000000-0000-0000-0000-000000000000', // System user
        channel: 'web',
        status: 'active'
      }])
      .select()
      .single();

    if (convError) {
      console.error('❌ Failed to create conversation:', convError.message);
      return;
    }

    console.log('✅ Test conversation created:', conversation.id);

    // Step 2: Simulate n8n data structure (what n8n would receive)
    console.log('\n2️⃣ Simulating n8n incoming data...');
    const n8nIncomingData = {
      body: {
        conversation_id: conversation.id,
        message: 'Hello! This is a test message from the AI assistant.',
        sender: 'assistant',
        channel: 'web'
      }
    };

    console.log('📨 Incoming data:', n8nIncomingData);

    // Step 3: Map n8n data to your table structure
    console.log('\n3️⃣ Mapping n8n data to table fields...');
    const mappedData = {
      conversation_id: n8nIncomingData.body.conversation_id,
      body: n8nIncomingData.body.message, // Map "message" to "body"
      from_type: n8nIncomingData.body.sender // Map "sender" to "from_type"
    };

    console.log('🗺️ Mapped data:', mappedData);

    // Step 4: Insert the message
    console.log('\n4️⃣ Inserting message...');
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([mappedData])
      .select()
      .single();

    if (msgError) {
      console.error('❌ Failed to insert message:', msgError.message);
      return;
    }

    console.log('✅ Message inserted successfully!');
    console.log('💬 Message details:', {
      id: message.id,
      conversation_id: message.conversation_id,
      body: message.body,
      from_type: message.from_type,
      created_at: message.created_at
    });

    // Step 5: Verify the conversation flow
    console.log('\n5️⃣ Verifying complete conversation...');
    const { data: conversationWithMessages, error: verifyError } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          id,
          body,
          from_type,
          created_at
        )
      `)
      .eq('id', conversation.id)
      .single();

    if (verifyError) {
      console.error('❌ Failed to verify conversation:', verifyError.message);
    } else {
      console.log('✅ Complete conversation verified!');
      console.log('📋 Conversation with messages:', {
        conversation_id: conversationWithMessages.id,
        message_count: conversationWithMessages.messages.length,
        messages: conversationWithMessages.messages
      });
    }

    // Clean up (optional - comment out if you want to keep test data)
    console.log('\n6️⃣ Cleaning up test data...');
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversation.id);

    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversation.id);

    console.log('✅ Test data cleaned up');

    // Final summary
    console.log('\n🎉 N8N Field Mapping Test Complete!');
    console.log('\n📋 **N8N Configuration Summary:**');
    console.log('conversation_id: {{$json.body.conversation_id}}');
    console.log('body: {{$json.body.message}}');
    console.log('from_type: {{$json.body.sender}}');
    console.log('\n✨ Your n8n workflow should work with these mappings!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testCompleteN8NFlow();