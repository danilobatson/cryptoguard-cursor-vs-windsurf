// WebSocket service for real-time crypto data
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.connectionStatus = 'disconnected';
    this.lastPing = null;
    this.pingInterval = null;
    this.isDestroyed = false; // NEW: Track if service is destroyed
  }

  // Connect to WebSocket server
  connect(symbols = ['bitcoin', 'ethereum']) {
    if (this.isDestroyed) {
      return Promise.reject(new Error('Service has been destroyed'));
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionStatus = 'connecting';
        this.notifyStatusChange();

        const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'wss://cryptoguard-worker.your-subdomain.workers.dev/ws';
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          this.notifyStatusChange();
          
          symbols.forEach(symbol => this.subscribe(symbol));
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
          
          // Only attempt reconnection if not destroyed and not intentional close
          if (!this.isDestroyed && event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(symbols);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connectionStatus = 'error';
          this.notifyStatusChange();
          reject(error);
        };

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

  subscribe(symbol) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log(`📡 Subscribing to ${symbol} updates`);
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol.toLowerCase()
      }));
    }
  }

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

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

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

  notifyStatusChange() {
    this.notifyListeners('status_change', {
      status: this.connectionStatus,
      timestamp: new Date().toISOString()
    });
  }

  startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  attemptReconnect(symbols) {
    if (this.isDestroyed) return; // Don't reconnect if destroyed

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
    
    setTimeout(() => {
      if (!this.isDestroyed) { // Check again before reconnecting
        this.connect(symbols).catch(() => {
          console.error('Reconnection attempt failed');
        });
      }
    }, delay);
  }

  forceRefresh() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'force_refresh' }));
    }
  }

  getStatus() {
    return {
      status: this.connectionStatus,
      connected: this.ws && this.ws.readyState === WebSocket.OPEN,
      reconnectAttempts: this.reconnectAttempts,
      lastPing: this.lastPing
    };
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.connectionStatus = 'disconnected';
    this.notifyStatusChange();
  }

  // NEW: Destroy method to completely stop the service
  destroy() {
    this.isDestroyed = true;
    this.disconnect();
    this.listeners.clear();
  }
}

// Smart service that switches to mock in development
class SmartWebSocketService {
  constructor() {
    this.realService = new WebSocketService()
    this.mockService = null
    this.currentService = this.realService
    this.isDevelopmentMode = import.meta.env.DEV
    this.hasTriedReal = false
  }

  async connect(symbols) {
    if (this.isDevelopmentMode && !this.hasTriedReal) {
      this.hasTriedReal = true
      
      try {
        await this.realService.connect(symbols)
        this.currentService = this.realService
        console.log('🌐 Using real WebSocket service')
      } catch (error) {
        console.log('🧪 Real WebSocket failed, switching to mock service for development')
        
        // Destroy the real service to stop reconnection attempts
        this.realService.destroy()
        
        // Import and use mock service
        const { default: mockWebSocketService } = await import('./MockWebSocketService.js')
        this.mockService = mockWebSocketService
        this.currentService = this.mockService
        
        await this.mockService.connect(symbols)
      }
    } else if (!this.isDevelopmentMode) {
      // Production: only use real WebSocket
      await this.realService.connect(symbols)
      this.currentService = this.realService
    }
    // If we've already tried and switched to mock, don't try again
  }

  // Proxy all methods to current service
  subscribe(symbol) { return this.currentService.subscribe(symbol) }
  on(event, callback) { return this.currentService.on(event, callback) }
  off(event, callback) { return this.currentService.off(event, callback) }
  forceRefresh() { return this.currentService.forceRefresh() }
  getStatus() { return this.currentService.getStatus() }
  disconnect() { return this.currentService.disconnect() }
  destroy() { 
    if (this.realService) this.realService.destroy()
    if (this.mockService) this.mockService.destroy()
  }
}

const webSocketService = new SmartWebSocketService()
export default webSocketService
