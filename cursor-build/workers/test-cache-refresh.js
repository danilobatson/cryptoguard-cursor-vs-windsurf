// Test cache force refresh functionality
const WebSocket = require('ws');

console.log('🔄 Cache Force Refresh Test');
console.log('=============================');

const ws = new WebSocket('wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts');

ws.on('open', function() {
    console.log('✅ CONNECTED for cache test');
    
    // Send force refresh command
    setTimeout(() => {
        console.log('🔄 Sending FORCE REFRESH command...');
        ws.send(JSON.stringify({type: 'force_refresh'}));
    }, 1000);
    
    // Request updated data
    setTimeout(() => {
        console.log('📊 Requesting data after force refresh...');
        ws.send(JSON.stringify({type: 'request_data'}));
    }, 3000);
    
    // Close connection
    setTimeout(() => {
        ws.close();
    }, 5000);
});

ws.on('message', function(data) {
    const message = JSON.parse(data.toString());
    
    if (message.type === 'connected') {
        console.log(`  ✅ Connected: ${message.version}`);
        console.log(`  📊 Cache enabled: ${message.cacheEnabled}`);
    } else if (message.type === 'crypto_data') {
        console.log(`  💰 Fresh data received:`);
        message.data.forEach(crypto => {
            console.log(`    ${crypto.symbol}: $${crypto.price} (${crypto.source})`);
        });
        console.log(`  📊 Cache metrics:`, message.cacheMetrics);
    } else if (message.type === 'pong') {
        console.log(`  🏓 Pong with metrics:`, message.metrics);
    }
});

ws.on('close', function() {
    console.log('✅ Force refresh test completed');
    process.exit(0);
});

setTimeout(() => process.exit(0), 8000);
