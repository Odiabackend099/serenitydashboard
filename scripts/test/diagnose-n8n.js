// Diagnose n8n webhook issues

console.log('🔍 Diagnosing n8n webhook...\n');

// Test 1: Check if n8n is running
console.log('1️⃣ Testing if n8n is accessible...');
fetch('http://localhost:5678')
  .then(response => {
    console.log(`   ✅ n8n is running (Status: ${response.status})`);
    return testWebhook();
  })
  .catch(error => {
    console.log('   ❌ n8n is not accessible');
    console.log('   Error:', error.message);
    console.log('\n   Fix: Make sure n8n is running with: docker compose ps');
  });

// Test 2: Try webhook WITHOUT auth
async function testWebhook() {
  console.log('\n2️⃣ Testing webhook WITHOUT authentication...');

  try {
    const response = await fetch('http://localhost:5678/webhook/lead-capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversationId: 'test-123',
        patientRef: 'test-patient',
        channel: 'webchat',
        intent: 'test',
        sentiment: 'neutral',
        keywords: ['test']
      })
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.status === 403) {
      console.log('   ❌ 403 Forbidden - Possible reasons:');
      console.log('      • Workflow is NOT active (toggle is OFF in n8n)');
      console.log('      • Workflow requires authentication');
      console.log('\n   Fix:');
      console.log('      1. Open n8n: http://localhost:5678');
      console.log('      2. Go to Workflows');
      console.log('      3. Open "Lead Capture" workflow');
      console.log('      4. Toggle "Active" ON (top right - must be green)');
      console.log('      5. Try again');

      testWithAuth();
    } else if (response.status === 404) {
      console.log('   ❌ 404 Not Found - Webhook path does not exist');
      console.log('\n   Fix:');
      console.log('      1. Import the workflow: 1-lead-capture-SIMPLE.json');
      console.log('      2. Make sure path is: lead-capture');
      console.log('      3. Activate the workflow');
    } else if (response.ok) {
      console.log('   ✅ Webhook is accessible!');

      const text = await response.text();
      if (text) {
        try {
          const data = JSON.parse(text);
          console.log('   📊 Response:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('   Response:', text);
        }
      }

      console.log('\n✅ Webhook is working! Now check if data is in Supabase.');
      console.log('   Run: node check-leads.js');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
}

// Test 3: Try webhook WITH auth
async function testWithAuth() {
  console.log('\n3️⃣ Testing webhook WITH authentication...');

  try {
    const response = await fetch('http://localhost:5678/webhook/lead-capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.WEBHOOK_SECRET || 'your-webhook-secret-here'
      },
      body: JSON.stringify({
        conversationId: 'test-123',
        patientRef: 'test-patient',
        channel: 'webchat',
        intent: 'test',
        sentiment: 'neutral',
        keywords: ['test']
      })
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log('   ✅ Authentication works!');
      console.log('\n   Your workflow requires authentication.');
      console.log('   The app will automatically send the secret header.');
    } else if (response.status === 403) {
      console.log('   ❌ Still 403 - Workflow is likely NOT active');
      console.log('\n   CRITICAL: Go to n8n and activate the workflow!');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
}
