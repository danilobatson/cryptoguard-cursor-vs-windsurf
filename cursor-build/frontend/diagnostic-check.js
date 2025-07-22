// Browser Console Diagnostic Script
// Copy and paste this into browser console for quick checks

console.log('🔍 CryptoGuard Diagnostic Check');
console.log('===============================');

// Check if stores are available
try {
  const cryptoStore = window.__ZUSTAND_STORES__ || 'Stores not exposed';
  console.log('✅ Store status:', typeof cryptoStore);
} catch (e) {
  console.log('ℹ️ Store check skipped');
}

// Check localStorage
const alertsStored = localStorage.getItem('cryptoguard-alerts');
const alertCount = alertsStored ? JSON.parse(alertsStored).alerts?.length || 0 : 0;
console.log('💾 Stored alerts:', alertCount);

// Check if main components exist
const alertModal = document.querySelector('[data-mantine-modal]');
console.log('🎨 Alert modal available:', !!alertModal);

const alertsTab = document.querySelector('[role="tab"][aria-selected]');
console.log('📱 Navigation tabs:', !!alertsTab);

// Check for error messages
const errors = document.querySelectorAll('[role="alert"]');
console.log('⚠️ Visible errors:', errors.length);

console.log('===============================');
console.log('Diagnostic complete! 🎯');
