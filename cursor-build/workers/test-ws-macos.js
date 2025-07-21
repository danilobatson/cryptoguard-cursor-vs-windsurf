// WebSocket test for macOS (no timeout command)
const WebSocket = require('ws');

console.log('🔌 Testing WebSocket connection...');

const ws = new WebSocket('wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts');

let connected = false;
const testTimeout = setTimeout(() => {
    if (!connected) {
        console.log('❌ Connection timeout after 5 seconds');
        process.exit(1);
    }
}, 5000);

ws.on('open', function() {
    connected = true;
    clearTimeout(testTimeout);
    console.log('✅ WebSocket connected!');
    
    // Send ping
    ws.send(JSON.stringify({type: 'ping'}));
    console.log('📤 Sent ping');
    
    // Close after 2 seconds
    setTimeout(() => {
        ws.close();
    }, 2000);
});

ws.on('message', function(data) {
    console.log('📨 Received:', data.toString());
});

ws.on('error', function(error) {
    console.error('❌ WebSocket error:', error.message);
    process.exit(1);
});

ws.on('close', function(code, reason) {
    console.log('🔌 Connection closed:', code, reason.toString());
    process.exit(0);
});
