const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConversationsSchema() {
  console.log('🔍 Checking conversations table schema...\n');
  
  try {
    // Query conversations table to see what fields exist
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);

    if (conversationsError) {
      console.error('❌ Error querying conversations table:', conversationsError.message);
      return;
    }

    if (conversationsData && conversationsData.length > 0) {
      console.log('✅ Conversations table fields found:');
      const fields = Object.keys(conversationsData[0]);
      fields.forEach(field => {
        console.log(`  - ${field}`);
      });
      
      console.log('\n📋 Sample conversation data:');
      console.log(conversationsData[0]);
      
      return conversationsData[0];
    } else {
      console.log('ℹ️ No conversations found in table');
      
      // Try to get table structure even if empty
      const { data, error } = await supabase
        .from('conversations')
        .select('*');
      
      if (error) {
        console.error('❌ Cannot access conversations table:', error.message);
      } else {
        console.log('✅ Conversations table is accessible but empty');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkConversationsSchema();