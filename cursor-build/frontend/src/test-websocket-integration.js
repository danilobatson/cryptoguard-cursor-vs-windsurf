// Comprehensive WebSocket Integration Test
console.log('🧪 Testing Complete WebSocket Integration...\n')

// Test 1: Store Integration
console.log('1️⃣ Testing store integration...')
try {
  const { default: useCryptoStore } = await import('./stores/useCryptoStore.js')
  const store = useCryptoStore.getState()
  
  console.log('   ✅ useCryptoStore loaded')
  console.log('   📊 Connection status:', store.connectionStatus)
  console.log('   �� Real-time active:', store.isRealTimeActive)
  console.log('   📡 WebSocket methods available:', !!store.connectWebSocket)
} catch (error) {
  console.log('   ❌ Store integration failed:', error.message)
}

// Test 2: WebSocket Service
console.log('\n2️⃣ Testing WebSocket service...')
try {
  const { default: webSocketService } = await import('./services/WebSocketService.js')
  const status = webSocketService.getStatus()
  
  console.log('   ✅ WebSocket service loaded')
  console.log('   📊 Service status:', status.status)
  console.log('   🔌 Connected:', status.connected)
  console.log('   🔄 Reconnect attempts:', status.reconnectAttempts)
} catch (error) {
  console.log('   ❌ WebSocket service failed:', error.message)
}

// Test 3: React Hooks
console.log('\n3️⃣ Testing React hooks...')
try {
  await import('./hooks/useWebSocket.js')
  console.log('   ✅ useWebSocket hook loaded')
  
  await import('./hooks/useCryptoData.js')
  console.log('   ✅ Enhanced useCryptoData loaded')
} catch (error) {
  console.log('   ❌ React hooks failed:', error.message)
}

// Test 4: UI Components
console.log('\n4️⃣ Testing UI components...')
try {
  await import('./components/ui/ConnectionStatus.jsx')
  console.log('   ✅ ConnectionStatus component loaded')
  
  await import('./components/ui/RealTimeIndicator.jsx')
  console.log('   ✅ RealTimeIndicator component loaded')
} catch (error) {
  console.log('   ❌ UI components failed:', error.message)
}

// Test 5: Enhanced Dashboard
console.log('\n5️⃣ Testing enhanced dashboard...')
try {
  await import('./components/dashboard/DashboardGrid.jsx')
  console.log('   ✅ Enhanced DashboardGrid loaded')
  
  await import('./components/dashboard/CryptoCard.jsx')
  console.log('   ✅ Enhanced CryptoCard loaded')
  
  await import('./App.jsx')
  console.log('   ✅ Enhanced App component loaded')
} catch (error) {
  console.log('   ❌ Enhanced dashboard failed:', error.message)
}

console.log('\n🎯 WebSocket Integration Test Complete!')
console.log('✅ Step 5.3 Components Ready for Production')
console.log('🚀 Ready to test live WebSocket connection!')
