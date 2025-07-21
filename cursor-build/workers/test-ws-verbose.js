// Verbose WebSocket test
const WebSocket = require('ws');

console.log('🔌 Starting WebSocket connection test...');
console.log('Target: wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts');
console.log('');

const ws = new WebSocket('wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts');

// Set up all event handlers with detailed logging
ws.on('open', function() {
    console.log('✅ WebSocket CONNECTED successfully!');
    
    // Send ping message
    const pingMessage = JSON.stringify({type: 'ping', timestamp: Date.now()});
    console.log('📤 Sending ping:', pingMessage);
    ws.send(pingMessage);
    
    // Send data request
    setTimeout(() => {
        const dataMessage = JSON.stringify({type: 'request_data'});
        console.log('📤 Sending data request:', dataMessage);
        ws.send(dataMessage);
    }, 1000);
    
    // Close connection after 5 seconds
    setTimeout(() => {
        console.log('🔌 Closing connection...');
        ws.close();
    }, 5000);
});

ws.on('message', function(data) {
    console.log('📨 RECEIVED MESSAGE:', data.toString());
    
    try {
        const parsed = JSON.parse(data.toString());
        if (parsed.version) {
            console.log('✅ DEBUG VERSION DETECTED:', parsed.version);
        }
        if (parsed.debug) {
            console.log('✅ DEBUG INFO:', parsed.debug);
        }
    } catch (e) {
        console.log('📨 (Raw message, not JSON)');
    }
});

ws.on('error', function(error) {
    console.error('❌ WebSocket ERROR:', error.message);
    if (error.code) {
        console.error('Error code:', error.code);
    }
});

ws.on('close', function(code, reason) {
    console.log('🔌 Connection CLOSED');
    console.log('Close code:', code);
    console.log('Close reason:', reason.toString() || 'No reason provided');
    
    if (code === 1000) {
        console.log('✅ Clean closure');
    } else {
        console.log('❌ Unexpected closure');
    }
});

// Exit after 10 seconds max
setTimeout(() => {
    console.log('⏰ Test timeout reached');
    process.exit(0);
}, 10000);
