// Mock WebSocket service - DISABLED FOR REAL DATA ONLY
class MockWebSocketService {
  constructor() {
    this.isConnected = false
    this.listeners = new Map()
    // REMOVED: All mock data - using real API only
    console.log('🚫 MockWebSocketService: DISABLED - Using real data only')
  }

  // Disabled - no mock connections
  connect(symbols = []) {
    console.log('🚫 MockWebSocket: Service disabled - using real API data only')
    return Promise.resolve()
  }

  // Disabled - no mock updates
  startMockUpdates() {
    console.log('🚫 MockWebSocket: Mock updates disabled')
  }

  // Disabled
  disconnect() {
    console.log('🚫 MockWebSocket: Already disabled')
  }

  // Disabled
  addEventListener() {
    console.log('🚫 MockWebSocket: Event listeners disabled')
  }

  // Disabled
  removeEventListener() {}

  // Disabled
  notifyListeners() {}
}

export default MockWebSocketService;
