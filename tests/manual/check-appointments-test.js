#!/usr/bin/env node

const SUPABASE_URL = 'https://yfrpxqvjshwaaomgcaoq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnB4cXZqc2h3YWFvbWdjYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI5MzcsImV4cCI6MjA3Nzg1ODkzN30.Y_YcL75ZIWKsb2SIfa1OKPXC3FN4kGiWrDfASYjkJ1Y';

async function check() {
  // Check for appointments with patient_name containing "Automated"
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/appointments?patient_name=like.*Automated*&order=created_at.desc&select=*`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  );

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
