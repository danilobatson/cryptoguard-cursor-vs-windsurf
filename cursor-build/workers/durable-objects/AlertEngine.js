// AlertEngine v2.7 - Intelligent KV Caching + Real API Data
export class AlertEngine {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.cryptoData = new Map();
    this.alerts = new Map();
    this.broadcasting = false;
    this.initialized = false;
    this.initializationAttempted = false;
    this.initializationError = null;
    
    // Cache settings
    this.cacheSettings = {
      price_ttl: 30,        // 30 seconds for price data
      social_ttl: 300,      // 5 minutes for social/sentiment data
      fallback_ttl: 600     // 10 minutes for fallback data
    };
    
    // Performance metrics
    this.metrics = {
      cache_hits: 0,
      cache_misses: 0,
      api_calls: 0,
      api_errors: 0,
      last_reset: Date.now()
    };
    
    console.log('🏗️ AlertEngine v2.7 constructor - REAL API + INTELLIGENT CACHING');
    console.log('Environment details:', {
      hasApiKey: !!env.LUNARCRUSH_API_KEY,
      hasCacheBinding: !!env.CRYPTO_CACHE,
      cacheSettings: this.cacheSettings,
      timestamp: new Date().toISOString()
    });
  }

  // HTTP fetch handler
  async fetch(request) {
    console.log('🔍 AlertEngine fetch called:', request.url, request.method);
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      // Handle stats request
      if (path === '/stats' || url.toString().includes('internal/stats')) {
        console.log('📊 Handling stats request');
        
        if (!this.initialized && !this.initializationAttempted) {
          console.log('�� Attempting initialization for stats request...');
          await this.safeInitialize();
        }
        
        const stats = await this.getStats();
        return new Response(JSON.stringify(stats), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Handle alert check request
      if (path === '/check-alerts' || url.toString().includes('check-alerts')) {
        console.log('🔔 Handling alert check request with smart caching');
        await this.checkAlerts();
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Alert check completed',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Handle WebSocket upgrade
      if (request.headers.get('Upgrade') === 'websocket') {
        console.log('🔌 Handling WebSocket upgrade request');
        return await this.handleWebSocket(request);
      }
      
      // Default response
      return new Response(JSON.stringify({
        message: 'AlertEngine v2.7 active - REAL API + INTELLIGENT CACHING',
        availableEndpoints: ['/stats', '/check-alerts', 'WebSocket'],
        cacheEnabled: !!this.env.CRYPTO_CACHE,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('❌ AlertEngine fetch error:', error);
      return new Response(JSON.stringify({
        error: 'AlertEngine request failed',
        message: error.message,
        timestamp: new Date().toISOString(),
        version: 'v2.7'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Smart caching wrapper for API calls
  async getCachedData(symbol, forceRefresh = false) {
    const cacheKey = `crypto:${symbol}:v4`;
    const now = Date.now();
    
    try {
      // Check cache first (unless forced refresh)
      if (!forceRefresh && this.env.CRYPTO_CACHE) {
        console.log(`🔍 CACHE: Checking cache for ${symbol}`);
        const cached = await this.env.CRYPTO_CACHE.get(cacheKey, 'json');
        
        if (cached && cached.timestamp) {
          const age = (now - cached.timestamp) / 1000; // seconds
          const ttl = cached.dataType === 'price' ? this.cacheSettings.price_ttl : this.cacheSettings.social_ttl;
          
          if (age < ttl) {
            console.log(`✅ CACHE HIT: ${symbol} (${age.toFixed(1)}s old, TTL: ${ttl}s)`);
            this.metrics.cache_hits++;
            return cached.data;
          } else {
            console.log(`⏰ CACHE EXPIRED: ${symbol} (${age.toFixed(1)}s old, TTL: ${ttl}s)`);
          }
        } else {
          console.log(`❌ CACHE MISS: ${symbol} (no data)`);
        }
        this.metrics.cache_misses++;
      }
      
      // Fetch from API
      console.log(`🌐 API CALL: Fetching fresh data for ${symbol}`);
      this.metrics.api_calls++;
      
      const apiData = await this.fetchFromAPI(symbol);
      
      if (apiData) {
        // Cache the successful result
        if (this.env.CRYPTO_CACHE) {
          const cacheData = {
            data: apiData,
            timestamp: now,
            dataType: 'price', // Could be enhanced to differentiate data types
            source: 'LunarCrush API v4',
            ttl: this.cacheSettings.price_ttl
          };
          
          await this.env.CRYPTO_CACHE.put(cacheKey, JSON.stringify(cacheData));
          console.log(`✅ CACHED: ${symbol} data stored (TTL: ${this.cacheSettings.price_ttl}s)`);
        }
        
        return apiData;
      } else {
        this.metrics.api_errors++;
        throw new Error('API returned no data');
      }
      
    } catch (error) {
      console.error(`❌ CACHE ERROR for ${symbol}:`, error);
      this.metrics.api_errors++;
      
      // Try to return stale cache as fallback
      if (this.env.CRYPTO_CACHE) {
        console.log(`🔄 FALLBACK: Attempting to use stale cache for ${symbol}`);
        const staleCache = await this.env.CRYPTO_CACHE.get(cacheKey, 'json');
        if (staleCache && staleCache.data) {
          console.log(`⚠️ STALE CACHE: Using expired data for ${symbol}`);
          return staleCache.data;
        }
      }
      
      throw error;
    }
  }

  // Fetch from LunarCrush API
  async fetchFromAPI(symbol) {
    try {
      const url = `https://lunarcrush.com/api4/public/coins/${symbol}/v1`;
      console.log(`🌐 API: Fetching ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.env.LUNARCRUSH_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data?.data?.price) {
        console.log(`✅ API SUCCESS: ${symbol} - $${data.data.price}`);
        return data;
      } else {
        throw new Error('No price data in API response');
      }
      
    } catch (error) {
      console.error(`❌ API ERROR for ${symbol}:`, error.message);
      throw error;
    }
  }

  // Safe initialization with caching
  async safeInitialize() {
    console.log('🛡️ SAFE INITIALIZE: Starting with INTELLIGENT CACHING...');
    
    if (this.initializationAttempted) {
      console.log('⚠️ SAFE INITIALIZE: Already attempted');
      return;
    }
    
    this.initializationAttempted = true;
    
    try {
      await this.initializeData();
      console.log('✅ SAFE INITIALIZE: Success with CACHED data');
    } catch (error) {
      console.error('❌ SAFE INITIALIZE: Failed:', error);
      this.initializationError = error.message;
      
      // Set fallback state
      this.cryptoData.set('bitcoin', { 
        symbol: 'BTC', 
        price: 117767, 
        source: 'fallback',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      this.cryptoData.set('ethereum', { 
        symbol: 'ETH', 
        price: 3763, 
        source: 'fallback', 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    this.initialized = true;
    console.log('✅ SAFE INITIALIZE: Marked as initialized');
  }

  // Initialize data with intelligent caching
  async initializeData() {
    console.log('�� INIT: Starting with INTELLIGENT CACHING v2.7');
    
    try {
      if (!this.env.LUNARCRUSH_API_KEY) {
        throw new Error('No API key configured');
      }
      
      console.log('🔄 INIT: Loading crypto data with smart caching');
      await this.loadCryptoDataWithCache();
      
      console.log('✅ INIT: Initialization completed with cached data');
      
    } catch (error) {
      console.error('❌ INIT: Failed:', error);
      throw error;
    }
  }

  // Load crypto data with intelligent caching
  async loadCryptoDataWithCache(forceRefresh = false) {
    console.log('🔄 LOAD: Smart caching system v2.7');
    
    const symbols = ['bitcoin', 'ethereum'];
    let successCount = 0;
    
    for (const symbol of symbols) {
      try {
        console.log(`🔄 LOAD: Processing ${symbol} with cache intelligence`);
        
        const data = await this.getCachedData(symbol, forceRefresh);
        
        if (data?.data?.price) {
          this.cryptoData.set(symbol, {
            ...data.data,
            lastUpdated: new Date().toISOString(),
            source: 'LunarCrush API v4 CACHED',
            cacheUsed: !forceRefresh
          });
          console.log(`✅ LOAD: ${symbol} - $${data.data.price} (CACHED SYSTEM)`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ LOAD: Failed ${symbol}:`, error.message);
        // Keep fallback data
        if (!this.cryptoData.has(symbol)) {
          this.cryptoData.set(symbol, {
            symbol: symbol.toUpperCase(),
            price: symbol === 'bitcoin' ? 117767 : 3763,
            source: 'fallback',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    console.log(`✅ LOAD: Completed with CACHING - ${successCount}/${symbols.length} successful`);
  }

  // Enhanced WebSocket handler (unchanged)
  async handleWebSocket(request) {
    console.log('🔌 WEBSOCKET: Starting handleWebSocket v2.7');
    
    try {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);
      
      server.accept();
      const sessionId = crypto.randomUUID();
      this.sessions.set(sessionId, server);
      
      // Initialize with cached data
      try {
        await this.safeInitialize();
        console.log('✅ WEBSOCKET: Initialized with cached data');
      } catch (initError) {
        console.error('❌ WEBSOCKET: Init error:', initError);
      }
      
      // Setup message handling
      server.addEventListener('message', event => {
        try {
          const data = JSON.parse(event.data);
          this.handleClientMessage(sessionId, data);
        } catch (msgError) {
          console.error('❌ WEBSOCKET: Message error:', msgError);
        }
      });
      
      server.addEventListener('close', event => {
        console.log('🔌 WEBSOCKET: Connection closed:', sessionId);
        this.sessions.delete(sessionId);
        
        if (this.sessions.size === 0 && this.broadcasting) {
          this.broadcasting = false;
        }
      });
      
      // Send welcome message
      const welcomeMessage = {
        type: 'connected',
        sessionId: sessionId,
        message: 'AlertEngine v2.7 connected - INTELLIGENT CACHING ENABLED!',
        initialized: this.initialized,
        activeSessions: this.sessions.size,
        cryptoDataCount: this.cryptoData.size,
        cacheEnabled: !!this.env.CRYPTO_CACHE,
        timestamp: new Date().toISOString(),
        version: 'v2.7-cached'
      };
      
      server.send(JSON.stringify(welcomeMessage));
      
      // Start broadcasting
      if (this.sessions.size === 1 && !this.broadcasting) {
        console.log('🚀 WEBSOCKET: Starting cached auto-broadcast');
        this.startAutoBroadcast();
      }
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
      
    } catch (error) {
      console.error('�� WEBSOCKET: Fatal error:', error);
      return new Response(`WebSocket Error: ${error.message} (v2.7)`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }

  // Message handling (enhanced with cache info)
  handleClientMessage(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    switch (data.type) {
      case 'ping':
        session.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
          version: 'v2.7-cached',
          cacheEnabled: !!this.env.CRYPTO_CACHE,
          metrics: this.metrics,
          sessionId: sessionId
        }));
        break;
        
      case 'request_data':
        this.sendCurrentData(session);
        break;
        
      case 'force_refresh':
        console.log('🔄 FORCE REFRESH: Client requested fresh data');
        this.forceRefreshData();
        break;
        
      default:
        session.send(JSON.stringify({
          type: 'unknown',
          originalType: data.type,
          timestamp: new Date().toISOString()
        }));
    }
  }

  // Force refresh (bypass cache)
  async forceRefreshData() {
    console.log('🔄 FORCE REFRESH: Bypassing cache for fresh data');
    try {
      await this.loadCryptoDataWithCache(true); // force refresh
      this.broadcastToAllSessions();
    } catch (error) {
      console.error('❌ FORCE REFRESH: Failed:', error);
    }
  }

  // Send current data (enhanced with cache info)
  sendCurrentData(session) {
    const dataArray = Array.from(this.cryptoData.values());
    
    session.send(JSON.stringify({
      type: 'crypto_data',
      data: dataArray,
      timestamp: new Date().toISOString(),
      version: 'v2.7-cached',
      count: dataArray.length,
      cacheMetrics: this.metrics
    }));
  }

  // Check alerts (with caching)
  async checkAlerts() {
    console.log('🔍 ALERTS: Checking with cached data refresh');
    
    if (this.sessions.size > 0) {
      try {
        await this.loadCryptoDataWithCache();
        this.broadcastToAllSessions();
      } catch (error) {
        console.error('❌ ALERTS: Check failed:', error);
      }
    }
  }

  // Auto-broadcast (with caching)
  startAutoBroadcast() {
    if (this.broadcasting) return;
    
    this.broadcasting = true;
    console.log('🚀 BROADCAST: Auto-broadcast started with INTELLIGENT CACHING');
    
    const broadcastInterval = setInterval(async () => {
      if (this.sessions.size === 0 || !this.broadcasting) {
        console.log('🛑 BROADCAST: Stopping');
        clearInterval(broadcastInterval);
        this.broadcasting = false;
        return;
      }
      
      try {
        await this.loadCryptoDataWithCache();
        this.broadcastToAllSessions();
      } catch (error) {
        console.error('❌ BROADCAST: Update failed:', error);
      }
    }, 30000);
  }

  // Broadcast to all sessions (with cache metrics)
  broadcastToAllSessions() {
    const dataArray = Array.from(this.cryptoData.values());
    const message = JSON.stringify({
      type: 'live_update',
      data: dataArray,
      timestamp: new Date().toISOString(),
      sessionCount: this.sessions.size,
      version: 'v2.7-cached',
      cacheMetrics: this.metrics
    });
    
    let sentCount = 0;
    for (const [sessionId, session] of this.sessions) {
      try {
        session.send(message);
        sentCount++;
      } catch (error) {
        this.sessions.delete(sessionId);
      }
    }
    
    console.log(`📡 BROADCAST: Cached data sent to ${sentCount} sessions`);
  }

  // Enhanced stats with cache metrics
  async getStats() {
    // Calculate cache efficiency
    const totalRequests = this.metrics.cache_hits + this.metrics.cache_misses;
    const cacheHitRate = totalRequests > 0 ? ((this.metrics.cache_hits / totalRequests) * 100).toFixed(1) : 0;
    const uptime = (Date.now() - this.metrics.last_reset) / 1000;
    
    return {
      initialized: this.initialized,
      initializationAttempted: this.initializationAttempted,
      initializationError: this.initializationError,
      activeSessions: this.sessions.size,
      broadcasting: this.broadcasting,
      cryptoDataLoaded: this.cryptoData.size,
      cryptoData: Object.fromEntries(
        Array.from(this.cryptoData.entries()).map(([key, value]) => [
          key,
          { 
            symbol: value.symbol, 
            price: value.price, 
            source: value.source,
            lastUpdated: value.lastUpdated || value.timestamp
          }
        ])
      ),
      caching: {
        enabled: !!this.env.CRYPTO_CACHE,
        metrics: this.metrics,
        hitRate: `${cacheHitRate}%`,
        settings: this.cacheSettings,
        uptime: `${uptime.toFixed(0)}s`
      },
      apiKeyConfigured: !!this.env.LUNARCRUSH_API_KEY,
      lastUpdate: new Date().toISOString(),
      version: 'v2.7-cached',
      status: this.initialized ? 'active' : 'initializing'
    };
  }
}

export default AlertEngine;
// Export for main entry point
