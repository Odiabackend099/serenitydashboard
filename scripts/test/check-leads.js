// Check if leads are in Supabase database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y'
);

async function checkLeads() {
  console.log('🔍 Checking leads in Supabase database...\n');

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.log('❌ Error:', error.message);
    console.log('\nThis might mean:');
    console.log('1. The leads table does not exist yet');
    console.log('2. You need to run the migrations in Supabase SQL Editor');
    console.log('3. RLS policies are blocking access\n');
    console.log('Run the migrations from: supabase_n8n_migrations.sql');
  } else if (leads.length === 0) {
    console.log('⚠️  No leads found in database');
    console.log('\nPossible reasons:');
    console.log('1. Workflow is not active in n8n');
    console.log('2. Supabase credentials not configured in n8n');
    console.log('3. Workflow has errors - check n8n executions');
  } else {
    console.log(`✅ Found ${leads.length} lead(s) in database!\n`);
    console.log('📋 Recent Leads:');
    console.log('='.repeat(80));

    leads.forEach((lead, i) => {
      console.log(`\n${i + 1}. Patient: ${lead.patient_ref}`);
      console.log(`   Intent: ${lead.intent || 'N/A'}`);
      console.log(`   Sentiment: ${lead.sentiment}`);
      console.log(`   Priority: ${lead.priority}`);
      console.log(`   Status: ${lead.status}`);
      console.log(`   Channel: ${lead.channel}`);
      console.log(`   Keywords: ${lead.keywords?.join(', ') || 'None'}`);
      console.log(`   Created: ${new Date(lead.created_at).toLocaleString()}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ Your n8n workflow is working perfectly!');
    console.log('\n📊 View analytics dashboard: http://localhost:5174/analytics');
  }
}

checkLeads().catch(console.error);
