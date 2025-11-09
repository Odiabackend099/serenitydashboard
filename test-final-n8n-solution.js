const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalN8NSolution() {
  console.log('🧪 Testing Final N8N Solution...\n');
  
  try {
    // Step 1: Use an existing conversation (or create one if needed)
    console.log('1️⃣ Finding existing conversation...');
    const { data: existingConversation, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1)
      .single();

    if (findError || !existingConversation) {
      console.log('❌ No existing conversation found');
      return;
    }

    console.log('✅ Found conversation:', existingConversation.id);
    console.log('📋 Conversation details:', {
      id: existingConversation.id,
      channel: existingConversation.channel,
      status: existingConversation.status,
      patient_ref: existingConversation.patient_ref
    });

    // Step 2: Simulate n8n data structure (what n8n would receive from VAPI)
    console.log('\n2️⃣ Simulating n8n incoming data from VAPI...');
    const n8nIncomingData = {
      body: {
        conversation_id: existingConversation.id,
        message: 'Hello! This is an AI assistant response via n8n workflow.',
        sender: 'assistant',
        channel: existingConversation.channel
      }
    };

    console.log('📨 Simulated n8n data:', JSON.stringify(n8nIncomingData, null, 2));

    // Step 3: Map n8n data to your table structure (THIS IS THE SOLUTION!)
    console.log('\n3️⃣ Mapping n8n data to table fields...');
    const mappedData = {
      conversation_id: n8nIncomingData.body.conversation_id,
      body: n8nIncomingData.body.message, // Map "message" to "body"
      from_type: n8nIncomingData.body.sender // Map "sender" to "from_type"
    };

    console.log('🗺️ Final mapped data:', mappedData);

    // Step 4: Insert the message
    console.log('\n4️⃣ Inserting message...');
    const { data: insertedMessage, error: insertError } = await supabase
      .from('messages')
      .insert([mappedData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert message:', insertError.message);
      return;
    }

    console.log('✅ Message inserted successfully!');
    console.log('💬 Inserted message:', {
      id: insertedMessage.id,
      conversation_id: insertedMessage.conversation_id,
      body: insertedMessage.body,
      from_type: insertedMessage.from_type,
      created_at: insertedMessage.created_at
    });

    // Step 5: Show the complete conversation flow
    console.log('\n5️⃣ Complete conversation with new message:');
    const { data: completeConversation, error: convError } = await supabase
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
      .eq('id', existingConversation.id)
      .single();

    if (convError) {
      console.error('❌ Failed to fetch complete conversation:', convError.message);
    } else {
      console.log('✅ Complete conversation:');
      console.log(`   Conversation ID: ${completeConversation.id}`);
      console.log(`   Channel: ${completeConversation.channel}`);
      console.log(`   Status: ${completeConversation.status}`);
      console.log(`   Total messages: ${completeConversation.messages.length}`);
      console.log('   Messages:');
      completeConversation.messages.forEach((msg, index) => {
        console.log(`     ${index + 1}. [${msg.from_type}] ${msg.body} (${new Date(msg.created_at).toLocaleTimeString()})`);
      });
    }

    // Clean up (optional - comment out if you want to keep test data)
    console.log('\n6️⃣ Cleaning up test message...');
    await supabase
      .from('messages')
      .delete()
      .eq('id', insertedMessage.id);

    console.log('✅ Test message cleaned up');

    // Final solution summary
    console.log('\n🎉 SUCCESS! N8N Field Mapping Solution Found!');
    console.log('\n' + '='.repeat(60));
    console.log('📋 **N8N WORKFLOW CONFIGURATION**');
    console.log('='.repeat(60));
    console.log('For your n8n "Insert Message" node, use these mappings:');
    console.log('');
    console.log('Field 1: conversation_id');
    console.log('  Value: {{$json.body.conversation_id}}');
    console.log('');
    console.log('Field 2: body');
    console.log('  Value: {{$json.body.message}}');
    console.log('');
    console.log('Field 3: from_type');
    console.log('  Value: {{$json.body.sender}}');
    console.log('');
    console.log('✅ This will work with your current database schema!');
    console.log('✅ No database changes needed!');
    console.log('✅ Ready for production!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testFinalN8NSolution();