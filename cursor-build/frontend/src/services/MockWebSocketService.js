// Mock WebSocket service for development testing
class MockWebSocketService {
  constructor() {
    this.isConnected = false
    this.listeners = new Map()
    this.mockData = {
      bitcoin: {
        symbol: 'BITCOIN',
        price: 116894.74,
        volume_24h: 28500000000,
        percent_change_24h: -1.36,
        market_cap: 2395001813211,
        galaxy_score: 68.7,
        last_updated: new Date().toISOString()
      },
      ethereum: {
        symbol: 'ETHEREUM',
        price: 3723.29,
        volume_24h: 15200000000,
        percent_change_24h: -1.04,
        market_cap: 449800000000,
        galaxy_score: 72.3,
        last_updated: new Date().toISOString()
      }
    }
    this.interval = null
  }

  // Simulate connection
  connect(symbols = ['bitcoin', 'ethereum']) {
    return new Promise((resolve) => {
      console.log('🧪 MockWebSocket: Simulating connection...')
      
      this.notifyListeners('status_change', {
        status: 'connecting',
        timestamp: new Date().toISOString()
      })

      // Simulate connection delay
      setTimeout(() => {
        this.isConnected = true
        console.log('✅ MockWebSocket: Connected successfully')
        
        this.notifyListeners('status_change', {
          status: 'connected',
          timestamp: new Date().toISOString()
        })

        // Start sending mock data updates
        this.startMockUpdates()
        resolve()
      }, 2000)
    })
  }

  // Start sending mock crypto updates
  startMockUpdates() {
    this.interval = setInterval(() => {
      // Simulate price fluctuations
      this.mockData.bitcoin.price += (Math.random() - 0.5) * 1000
      this.mockData.ethereum.price += (Math.random() - 0.5) * 50
      
      // Update timestamps
      this.mockData.bitcoin.last_updated = new Date().toISOString()
      this.mockData.ethereum.last_updated = new Date().toISOString()
      
      // Send crypto update
      this.notifyListeners('crypto_update', {
        bitcoin: {
          ...this.mockData.bitcoin,
          source: 'websocket',
          realtimeUpdate: true
        },
        ethereum: {
          ...this.mockData.ethereum,
          source: 'websocket',
          realtimeUpdate: true
        }
      })

      console.log('📡 MockWebSocket: Sent crypto update', {
        bitcoin: this.mockData.bitcoin.price.toFixed(2),
        ethereum: this.mockData.ethereum.price.toFixed(2)
      })
    }, 3000) // Update every 3 seconds
  }

  // Subscribe to symbols (mock)
  subscribe(symbol) {
    console.log(`📡 MockWebSocket: Subscribed to ${symbol}`)
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  // Remove event listener
  off(event, callback) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  // Notify listeners
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('MockWebSocket listener error:', error)
        }
      })
    }
  }

  // Force refresh (mock)
  forceRefresh() {
    console.log('🔄 MockWebSocket: Force refresh triggered')
    // Trigger immediate update
    if (this.isConnected) {
      this.notifyListeners('crypto_update', {
        bitcoin: { ...this.mockData.bitcoin, source: 'websocket' },
        ethereum: { ...this.mockData.ethereum, source: 'websocket' }
      })
    }
  }

  // Get status
  getStatus() {
    return {
      status: this.isConnected ? 'connected' : 'disconnected',
      connected: this.isConnected,
      reconnectAttempts: 0,
      lastPing: this.isConnected ? Date.now() : null
    }
  }

  // Disconnect
  disconnect() {
    console.log('🔌 MockWebSocket: Disconnecting...')
    this.isConnected = false
    
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }

    this.notifyListeners('status_change', {
      status: 'disconnected',
      timestamp: new Date().toISOString()
    })
  }

  // Destroy
  destroy() {
    this.disconnect()
    this.listeners.clear()
  }
}

// Export mock service for development
const mockWebSocketService = new MockWebSocketService()
export default mockWebSocketService
