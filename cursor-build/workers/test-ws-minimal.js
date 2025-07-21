// Minimal WebSocket test to isolate the issue
const WebSocket = require('ws');

console.log('🔌 Minimal WebSocket Test');
console.log('==========================');

const ws = new WebSocket('wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts');

ws.on('open', function() {
    console.log('✅ CONNECTION OPENED!');
    console.log('Waiting 2 seconds then closing...');
    setTimeout(() => ws.close(), 2000);
});

ws.on('message', function(data) {
    console.log('📨 RECEIVED:', data.toString());
});

ws.on('error', function(error) {
    console.error('❌ ERROR:', error.message);
    console.error('Error details:', {
        code: error.code,
        type: error.type,
        stack: error.stack?.substring(0, 200) + '...'
    });
});

ws.on('close', function(code, reason) {
    console.log('🔌 CLOSED:', code, reason.toString());
    process.exit(0);
});

setTimeout(() => {
    console.log('⏰ 5 second timeout - exiting');
    process.exit(1);
}, 5000);
