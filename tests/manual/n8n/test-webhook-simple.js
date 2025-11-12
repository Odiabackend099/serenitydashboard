const testWebhook = async () => {
  try {
    const response = await fetch('https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientEmail: 'test@example.com',
        patientName: 'Test Patient',
        actionType: 'create',
        appointmentDate: '2024-01-15',
        appointmentTime: '14:00'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response Body:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.log('Could not parse as JSON');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testWebhook();
