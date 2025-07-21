// Simple WebSocket connection test with detailed logging
const url = 'wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts';

console.log('🔌 Testing WebSocket connection...');
console.log('URL:', url);

try {
    const ws = new WebSocket(url);
    
    ws.onopen = function(event) {
        console.log('✅ WebSocket connected successfully!');
        console.log('Connection event:', event);
        
        // Test sending a message
        const testMessage = { type: 'ping', timestamp: Date.now() };
        ws.send(JSON.stringify(testMessage));
        console.log('📤 Sent test message:', testMessage);
    };
    
    ws.onmessage = function(event) {
        console.log('📨 Received message:', event.data);
    };
    
    ws.onerror = function(error) {
        console.log('❌ WebSocket error:', error);
    };
    
    ws.onclose = function(event) {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
    };
    
} catch (error) {
    console.error('💥 Failed to create WebSocket:', error);
}
