// Full WebSocket feature test
const WebSocket = require('ws');

console.log('🧪 Full WebSocket Feature Test');
console.log('===============================');

const ws = new WebSocket('wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts');
let messageCount = 0;

ws.on('open', function() {
    console.log('✅ CONNECTED successfully!');
    
    // Test 1: Send ping
    setTimeout(() => {
        console.log('🏓 Sending PING...');
        ws.send(JSON.stringify({type: 'ping', timestamp: Date.now()}));
    }, 500);
    
    // Test 2: Request current data
    setTimeout(() => {
        console.log('📊 Requesting current data...');
        ws.send(JSON.stringify({type: 'request_data'}));
    }, 1500);
    
    // Test 3: Send unknown message type
    setTimeout(() => {
        console.log('❓ Sending unknown message...');
        ws.send(JSON.stringify({type: 'test_unknown'}));
    }, 2500);
    
    // Close after tests
    setTimeout(() => {
        console.log('🔌 Closing connection...');
        ws.close();
    }, 4000);
});

ws.on('message', function(data) {
    messageCount++;
    const message = data.toString();
    console.log(`📨 MESSAGE ${messageCount}:`, message);
    
    try {
        const parsed = JSON.parse(message);
        
        switch(parsed.type) {
            case 'connected':
                console.log(`  ✅ Connected with session: ${parsed.sessionId}`);
                console.log(`  ✅ Version: ${parsed.version}`);
                console.log(`  ✅ Active sessions: ${parsed.activeSessions}`);
                console.log(`  ✅ Crypto data count: ${parsed.cryptoDataCount}`);
                break;
                
            case 'pong':
                console.log(`  🏓 PONG received! Version: ${parsed.version}`);
                break;
                
            case 'crypto_data':
                console.log(`  📊 Crypto data received: ${parsed.count} items`);
                if (parsed.data && parsed.data.length > 0) {
                    parsed.data.forEach(crypto => {
                        console.log(`    💰 ${crypto.symbol}: $${crypto.price} (${crypto.source})`);
                    });
                }
                break;
                
            case 'unknown':
                console.log(`  ❓ Unknown message type handled: ${parsed.originalType}`);
                break;
                
            default:
                console.log(`  ℹ️  Other message type: ${parsed.type}`);
        }
    } catch (e) {
        console.log('  📨 (Non-JSON message)');
    }
});

ws.on('error', function(error) {
    console.error('❌ ERROR:', error.message);
});

ws.on('close', function(code, reason) {
    console.log(`🔌 CLOSED: Code ${code}, Reason: ${reason.toString() || 'None'}`);
    console.log(`✅ Test completed! Received ${messageCount} messages`);
    process.exit(0);
});

setTimeout(() => {
    console.log('⏰ 8 second timeout reached');
    process.exit(1);
}, 8000);
