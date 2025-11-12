// Simple test to check what's happening with the chat widget connection
console.log('🔍 Chat Widget Connection Debug Test');

// Check environment variables (these won't be accessible directly in browser)
console.log('📍 Current URL:', window.location.href);
console.log('🔧 Environment variables are not directly accessible from browser for security reasons');

// Test if we can access the chat widget
setTimeout(() => {
    const chatWidget = document.getElementById('chat-widget');
    console.log('💬 Chat widget element:', chatWidget);
    
    if (chatWidget) {
        console.log('✅ Chat widget found in DOM');
        
        // Try to find the chat input and send a test message
        const chatInput = document.querySelector('input[type="text"], textarea');
        console.log('📝 Chat input found:', chatInput);
        
        if (chatInput) {
            console.log('✅ Chat input found');
            
            // Simulate typing a message
            chatInput.value = 'I want to book an appointment for tomorrow at 2pm';
            chatInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Find and click send button
            const sendButton = document.querySelector('button[type="submit"], button:contains("Send")');
            console.log('📤 Send button found:', sendButton);
            
            if (sendButton) {
                console.log('✅ Send button found, clicking...');
                sendButton.click();
            }
        }
    } else {
        console.log('❌ Chat widget not found in DOM');
        console.log('🔍 Available elements:', document.querySelectorAll('*').length, 'elements');
    }
}, 2000);

// Monitor network requests
console.log('🌐 Monitoring network requests...');
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('📡 Fetch request:', args[0], args[1]);
    return originalFetch.apply(this, args).then(response => {
        console.log('📊 Response:', response.status, response.url);
        return response;
    }).catch(error => {
        console.error('❌ Fetch error:', error);
        throw error;
    });
};

// Monitor console errors
window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
});

console.log('🧪 Test script loaded. Waiting for chat widget to load...');