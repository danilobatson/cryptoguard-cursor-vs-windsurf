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
