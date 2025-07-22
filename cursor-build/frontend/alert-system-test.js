// Comprehensive Alert System Test
console.log('🧪 Testing Alert System Components...\n')

// Test 1: Store Import and Basic Functions
console.log('1️⃣ Testing useAlertStore import...')
try {
  const { ALERT_TYPES, ALERT_STATUS } = await import('./src/stores/useAlertStore.js')
  console.log('   ✅ Alert types loaded:', Object.keys(ALERT_TYPES))
  console.log('   ✅ Alert status loaded:', Object.keys(ALERT_STATUS))
} catch (error) {
  console.log('   ❌ useAlertStore import failed:', error.message)
}

// Test 2: AlertModal Component
console.log('\n2️⃣ Testing AlertModal component...')
try {
  await import('./src/components/alerts/AlertModal.jsx')
  console.log('   ✅ AlertModal component loads successfully')
} catch (error) {
  console.log('   ❌ AlertModal import failed:', error.message)
}

// Test 3: AlertsList Component
console.log('\n3️⃣ Testing AlertsList component...')
try {
  await import('./src/components/alerts/AlertsList.jsx')
  console.log('   ✅ AlertsList component loads successfully')
} catch (error) {
  console.log('   ❌ AlertsList import failed:', error.message)
}

// Test 4: Alert Initialization Hook
console.log('\n4️⃣ Testing useAlertInitialization hook...')
try {
  await import('./src/hooks/useAlertInitialization.js')
  console.log('   ✅ useAlertInitialization hook loads successfully')
} catch (error) {
  console.log('   ❌ useAlertInitialization import failed:', error.message)
}

// Test 5: App.jsx Integration
console.log('\n5️⃣ Testing App.jsx integration...')
try {
  await import('./src/App.jsx')
  console.log('   ✅ App.jsx with alert integration loads successfully')
} catch (error) {
  console.log('   ❌ App.jsx import failed:', error.message)
}

console.log('\n🎯 Import Testing Complete!')
console.log('===============================')
