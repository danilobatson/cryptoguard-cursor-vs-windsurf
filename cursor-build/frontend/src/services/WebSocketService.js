// WebSocket service for real-time crypto data
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.connectionStatus = 'disconnected'; // 'connecting', 'connected', 'error', 'disconnected'
    this.lastPing = null;
    this.pingInterval = null;
  }

  // Connect to WebSocket server
  connect(symbols = ['bitcoin', 'ethereum']) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionStatus = 'connecting';
        this.notifyStatusChange();

        // Connect to your Cloudflare Worker WebSocket endpoint
        const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'wss://cryptoguard-worker.your-subdomain.workers.dev/ws';
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          this.notifyStatusChange();
          
          // Subscribe to symbols
          symbols.forEach(symbol => this.subscribe(symbol));
          
          // Start ping/pong heartbeat
          this.startHeartbeat();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.connectionStatus = 'disconnected';
          this.stopHeartbeat();
          this.notifyStatusChange();
          
          // Attempt reconnection if not intentional
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(symbols);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connectionStatus = 'error';
          this.notifyStatusChange();
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (this.connectionStatus === 'connecting') {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.connectionStatus = 'error';
        this.notifyStatusChange();
        reject(error);
      }
    });
  }

  // Subscribe to specific crypto updates
  subscribe(symbol) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log(`📡 Subscribing to ${symbol} updates`);
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol.toLowerCase()
      }));
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    switch (data.type) {
      case 'crypto_update':
        this.notifyListeners('crypto_update', data.data);
        break;
      
      case 'alert':
        this.notifyListeners('alert', data.alert);
        break;
      
      case 'pong':
        this.lastPing = Date.now();
        break;
      
      case 'subscribed':
        console.log('✅ Subscribed to:', data.symbol);
        break;
      
      case 'error':
        console.error('WebSocket server error:', data.message);
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  // Remove event listener
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  // Notify all listeners of an event
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  // Notify status change listeners
  notifyStatusChange() {
    this.notifyListeners('status_change', {
      status: this.connectionStatus,
      timestamp: new Date().toISOString()
    });
  }

  // Start heartbeat ping/pong
  startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Attempt to reconnect
  attemptReconnect(symbols) {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
    
    setTimeout(() => {
      this.connect(symbols).catch(() => {
        console.error('Reconnection attempt failed');
      });
    }, delay);
  }

  // Force refresh data
  forceRefresh() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'force_refresh' }));
    }
  }

  // Get connection status
  getStatus() {
    return {
      status: this.connectionStatus,
      connected: this.ws && this.ws.readyState === WebSocket.OPEN,
      reconnectAttempts: this.reconnectAttempts,
      lastPing: this.lastPing
    };
  }

  // Disconnect WebSocket
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.connectionStatus = 'disconnected';
    this.notifyStatusChange();
  }

  // Cleanup
  destroy() {
    this.disconnect();
    this.listeners.clear();
  }
}

// Auto-switch to mock in development if WebSocket fails
class SmartWebSocketService {
  constructor() {
    this.realService = new WebSocketService()
    this.mockService = null
    this.currentService = this.realService
    this.isDevelopmentMode = import.meta.env.DEV
  }

  async connect(symbols) {
    if (this.isDevelopmentMode) {
      try {
        // Try real WebSocket first
        await this.realService.connect(symbols)
        this.currentService = this.realService
        console.log('🌐 Using real WebSocket service')
      } catch (error) {
        console.log('🧪 Real WebSocket failed, switching to mock service for development')
        
        // Import and use mock service
        const { default: mockWebSocketService } = await import('./MockWebSocketService.js')
        this.mockService = mockWebSocketService
        this.currentService = this.mockService
        
        await this.mockService.connect(symbols)
      }
    } else {
      // Production: only use real WebSocket
      await this.realService.connect(symbols)
      this.currentService = this.realService
    }
  }

  // Proxy all methods to current service
  subscribe(symbol) { return this.currentService.subscribe(symbol) }
  on(event, callback) { return this.currentService.on(event, callback) }
  off(event, callback) { return this.currentService.off(event, callback) }
  forceRefresh() { return this.currentService.forceRefresh() }
  getStatus() { return this.currentService.getStatus() }
  disconnect() { return this.currentService.disconnect() }
  destroy() { return this.currentService.destroy() }
}

// Create smart singleton instance that auto-switches
const webSocketService = new SmartWebSocketService()
export default webSocketService
