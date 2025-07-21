/**
 * WebSocket Manager - Durable Object for real-time connections
 * Handles WebSocket connections and broadcasts crypto alerts
 */

export class WebSocketManager {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map(); // Active WebSocket connections
    this.lastBroadcast = 0;    // Timestamp of last broadcast
  }

  // Handle incoming WebSocket connections
  async fetch(request) {
    // Handle WebSocket upgrade requests
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }
    
    // Handle HTTP requests to this Durable Object
    const url = new URL(request.url);
    
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify({
        active_connections: this.sessions.size,
        last_broadcast: this.lastBroadcast,
        uptime: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('WebSocket Manager Durable Object', { status: 200 });
  }

  // Handle WebSocket connection setup
  async handleWebSocket(request) {
    // Create WebSocket pair
    const [client, server] = Object.values(new WebSocketPair());
    
    // Accept the WebSocket connection
    server.accept();
    
    // Generate unique session ID
    const sessionId = crypto.randomUUID();
    
    // Store the connection
    this.sessions.set(sessionId, {
      socket: server,
      connected: Date.now(),
      subscriptions: ['bitcoin', 'ethereum'] // Default subscriptions
    });
    
    console.log(`WebSocket connected: ${sessionId} (${this.sessions.size} total)`);
    
    // Send welcome message
    server.send(JSON.stringify({
      type: 'welcome',
      sessionId: sessionId,
      message: 'Connected to CryptoGuard real-time alerts',
      timestamp: new Date().toISOString(),
      subscriptions: ['bitcoin', 'ethereum']
    }));
    
    // Handle incoming messages from client
    server.addEventListener('message', event => {
      try {
        const data = JSON.parse(event.data);
        this.handleClientMessage(sessionId, data);
      } catch (error) {
        console.error('Invalid message format:', error);
        server.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    // Handle connection close
    server.addEventListener('close', event => {
      console.log(`WebSocket disconnected: ${sessionId}`);
      this.sessions.delete(sessionId);
    });
    
    // Handle connection errors
    server.addEventListener('error', event => {
      console.error(`WebSocket error for ${sessionId}:`, event);
      this.sessions.delete(sessionId);
    });
    
    // Return the client side of the WebSocket
    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  // Handle messages from WebSocket clients
  handleClientMessage(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    switch (data.type) {
      case 'subscribe':
        // Add crypto symbol to subscriptions
        if (data.symbol && !session.subscriptions.includes(data.symbol)) {
          session.subscriptions.push(data.symbol);
          session.socket.send(JSON.stringify({
            type: 'subscribed',
            symbol: data.symbol,
            message: `Subscribed to ${data.symbol} alerts`
          }));
        }
        break;
        
      case 'unsubscribe':
        // Remove crypto symbol from subscriptions
        if (data.symbol) {
          session.subscriptions = session.subscriptions.filter(s => s !== data.symbol);
          session.socket.send(JSON.stringify({
            type: 'unsubscribed', 
            symbol: data.symbol,
            message: `Unsubscribed from ${data.symbol} alerts`
          }));
        }
        break;
        
      case 'ping':
        // Respond to ping with pong
        session.socket.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
        break;
        
      default:
        session.socket.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }
  }

  // Broadcast crypto data updates to all connected clients
  async broadcastCryptoUpdate(cryptoData) {
    if (this.sessions.size === 0) return;
    
    const message = JSON.stringify({
      type: 'crypto_update',
      data: cryptoData,
      timestamp: new Date().toISOString()
    });
    
    // Send to all connected clients
    for (const [sessionId, session] of this.sessions) {
      try {
        // Only send if client is subscribed to this crypto
        if (session.subscriptions.includes(cryptoData.symbol?.toLowerCase())) {
          session.socket.send(message);
        }
      } catch (error) {
        console.error(`Failed to send to ${sessionId}:`, error);
        // Remove failed connection
        this.sessions.delete(sessionId);
      }
    }
    
    this.lastBroadcast = Date.now();
  }

  // Broadcast alert to subscribed clients
  async broadcastAlert(alert) {
    if (this.sessions.size === 0) return;
    
    const message = JSON.stringify({
      type: 'alert',
      alert: alert,
      timestamp: new Date().toISOString()
    });
    
    // Send alert to all connected clients
    for (const [sessionId, session] of this.sessions) {
      try {
        // Only send if client is subscribed to this crypto
        if (session.subscriptions.includes(alert.symbol?.toLowerCase())) {
          session.socket.send(message);
        }
      } catch (error) {
        console.error(`Failed to send alert to ${sessionId}:`, error);
        this.sessions.delete(sessionId);
      }
    }
  }
}
