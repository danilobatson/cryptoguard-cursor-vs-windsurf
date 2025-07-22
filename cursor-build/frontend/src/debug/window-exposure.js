// Debug helper to expose services to window for testing
import webSocketService from '../services/WebSocketService.js'
import useCryptoStore from '../stores/useCryptoStore.js'

// Expose services to window for debugging and testing
if (typeof window !== 'undefined') {
  window.webSocketService = webSocketService
  window.cryptoStore = useCryptoStore
  window.useCryptoStore = useCryptoStore
  
  console.log('🔍 Debug services exposed to window:', {
    webSocketService: !!window.webSocketService,
    cryptoStore: !!window.cryptoStore,
    useCryptoStore: !!window.useCryptoStore
  })
}

export { webSocketService, useCryptoStore }

// Expose Alert Store for debugging
import useAlertStore from '../stores/useAlertStore';

// Add to existing window exposure
window.useAlertStore = useAlertStore;

// Test function to verify both stores work
window.testStores = () => {
  console.log('🔍 Testing Store Access...');
  console.log('Crypto Store State:', window.useCryptoStore?.getState?.());
  console.log('Alert Store State:', window.useAlertStore?.getState?.());
  
  // Test Alert Store functions
  const alertStore = window.useAlertStore?.getState?.();
  if (alertStore) {
    console.log('✅ Alert Store Functions:', {
      getActiveAlerts: typeof alertStore.getActiveAlerts,
      openAlertModal: typeof alertStore.openAlertModal,
      createAlert: typeof alertStore.createAlert,
      totalAlerts: alertStore.getTotalAlerts?.(),
    });
  }
  
  console.log('✅ Store testing complete!');
};

console.log('🔧 Alert Store debugging tools loaded');
console.log('💡 Run: testStores() to test both stores');
