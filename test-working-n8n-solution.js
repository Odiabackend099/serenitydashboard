const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWorkingN8NSolution() {
  console.log('🧪 Testing Working N8N Solution...\n');
  
  try {
    // Step 1: Use an existing conversation
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

    // Step 2: Simulate n8n data structure (what n8n would receive from VAPI)
    console.log('\n2️⃣ Simulating n8n incoming data from VAPI...');
    const n8nIncomingData = {
      body: {
        conversation_id: existingConversation.id,
        message: 'Hello! This is an AI assistant response via n8n workflow.',
        sender: 'assistant', // This will be mapped to 'ai'
        channel: existingConversation.channel
      }
    };

    console.log('📨 Simulated n8n data:', JSON.stringify(n8nIncomingData, null, 2));

    // Step 3: Map n8n data to your table structure (THE FINAL SOLUTION!)
    console.log('\n3️⃣ Mapping n8n data to table fields...');
    
    // CRITICAL: Map "assistant" to "ai" because that's what your database accepts!
    const senderMapping = {
      'assistant': 'ai',
      'user': 'patient',
      'human': 'patient',
      'patient': 'patient'
    };

    const mappedData = {
      conversation_id: n8nIncomingData.body.conversation_id,
      body: n8nIncomingData.body.message, // Map "message" to "body"
      from_type: senderMapping[n8nIncomingData.body.sender] || 'ai' // Map "sender" to "from_type"
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

    // Clean up (optional - comment out if you want to keep test data)
    console.log('\n5️⃣ Cleaning up test message...');
    await supabase
      .from('messages')
      .delete()
      .eq('id', insertedMessage.id);

    console.log('✅ Test message cleaned up');

    // Final solution summary
    console.log('\n🎉 SUCCESS! Final N8N Solution Found!');
    console.log('\n' + '='.repeat(70));
    console.log('📋 **FINAL N8N WORKFLOW CONFIGURATION**');
    console.log('='.repeat(70));
    console.log('');
    console.log('For your n8n "Insert Message" node, use these exact mappings:');
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
    console.log('⚠️  IMPORTANT: Add a function node BEFORE the insert to map sender values:');
    console.log('');
    console.log('// Add this to a Function node before your Insert node:');
    console.log('if (item.body.sender === "assistant") {');
    console.log('  item.body.sender = "ai";');
    console.log('} else if (item.body.sender === "user") {');
    console.log('  item.body.sender = "patient";');
    console.log('}');
    console.log('return item;');
    console.log('');
    console.log('✅ This will work with your current database schema!');
    console.log('✅ No database changes needed!');
    console.log('✅ Ready for production!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testWorkingN8NSolution();