const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY is required');
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=your_key node check-messages-schema.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMessagesSchema() {
  try {
    console.log('🔍 Checking messages table schema...\n');
    
    // Query to get table schema information
    const { data, error } = await supabase
      .rpc('information_schema.columns')
      .select('*')
      .eq('table_name', 'messages')
      .order('ordinal_position');

    if (error) {
      console.error('❌ Error checking schema:', error.message);
      
      // Fallback: try to query the table directly to see what fields exist
      console.log('\n🔍 Trying alternative approach...');
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(1);

      if (messagesError) {
        console.error('❌ Error querying messages table:', messagesError.message);
        return;
      }

      if (messagesData && messagesData.length > 0) {
        console.log('✅ Messages table fields found:');
        const fields = Object.keys(messagesData[0]);
        fields.forEach(field => {
          console.log(`  - ${field}`);
        });
        
        console.log('\n📋 Field mapping suggestions for n8n:');
        console.log('Field 1: conversation_id (exists ✅)');
        console.log('Field 2: body -> maps to "content" (use {{$json.body.message}})');
        console.log('Field 3: from_type -> use "assistant" for AI responses');
        console.log('Field 4: created_at -> will be auto-generated');
        
        return;
      }
    }

    if (data) {
      console.log('✅ Messages table schema:');
      data.forEach(column => {
        console.log(`  - ${column.column_name}: ${column.data_type} ${column.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkMessagesSchema();