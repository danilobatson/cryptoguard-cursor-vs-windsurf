// Quick WebSocket service test
import webSocketService from './WebSocketService.js';

console.log('🧪 Testing WebSocket Service...');

// Test 1: Basic connection
console.log('1️⃣ Testing WebSocket connection...');
console.log('Status:', webSocketService.getStatus());

// Test 2: Event listeners
console.log('2️⃣ Setting up event listeners...');
webSocketService.on('status_change', (data) => {
  console.log('   📡 Status changed:', data.status);
});

webSocketService.on('crypto_update', (data) => {
  console.log('   💰 Crypto update received:', Object.keys(data));
});

// Test 3: Connection attempt (will fail without backend, but should show proper error handling)
console.log('3️⃣ Attempting connection...');
webSocketService.connect(['bitcoin', 'ethereum'])
  .then(() => {
    console.log('   ✅ WebSocket connected successfully');
  })
  .catch((error) => {
    console.log('   ⚠️ Connection failed (expected without backend):', error.message);
  });

console.log('✅ WebSocket service test complete!');
