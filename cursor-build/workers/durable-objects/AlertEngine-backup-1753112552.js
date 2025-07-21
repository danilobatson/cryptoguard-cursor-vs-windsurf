/**
 * AlertEngine v2.2 - Fixed with LunarCrush API v4 integration
 * Real-time crypto alerts with correct API endpoints
 */
export class AlertEngine {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.alerts = new Map();
    this.cryptoData = new Map();
    this.sessions = new Map();
    this.lastBroadcast = 0;
    this.broadcastInterval = 30000; // 30 seconds
    this.lastAPICall = 0;
    this.apiCallCooldown = 5000; // 5 seconds between API calls
    
    // Enhanced alert thresholds based on current market conditions
    this.defaultThresholds = {
      bitcoin: {
        price_above: 125000,     // $125K (stretch goal)
        price_below: 95000,      // $95K (support level)
        sentiment_spike: 85,     // 85% sentiment (more realistic)
        sentiment_drop: 40,      // 40% sentiment (bearish)
        volume_surge: 2.0,       // 2x normal volume
        interaction_spike: 1.5   // 50% more social activity
      },
      ethereum: {
        price_above: 4500,       // $4.5K (next resistance)
        price_below: 2800,       // $2.8K (support level)
        sentiment_spike: 80,     // 80% sentiment
        sentiment_drop: 35,      // 35% sentiment (bearish)
        volume_surge: 2.0,       // 2x normal volume
        interaction_spike: 1.5   // 50% more social activity
      }
    };

    // Track baseline metrics for surge detection
    this.baselines = {
      bitcoin: { interactions: 140000000, volume: 50000000000 },
      ethereum: { interactions: 75000000, volume: 20000000000 }
    };
    
    // Start auto-broadcasting when first session connects
    this.autoBroadcastActive = false;
    this.initialized = false;
    this.lastSuccessfulFetch = 0;
  }

  /**
   * Handle HTTP requests to this Durable Object
   */
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/stats') {
        return new Response(JSON.stringify(await this.getStats()), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (path === '/check-alerts' && request.method === 'POST') {
        await this.checkAndBroadcast();
        return new Response(JSON.stringify({ 
          status: 'completed',
          last_broadcast: this.lastBroadcast,
          active_sessions: this.sessions.size
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('AlertEngine fetch error:', error);
      return new Response(JSON.stringify({
        error: 'Internal error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Handle WebSocket connections for real-time alerts
   */
  async handleWebSocket(request) {
    try {
      const [client, server] = Object.values(new WebSocketPair());
      server.accept();
      
      const sessionId = crypto.randomUUID();
      const session = {
        id: sessionId,
        socket: server,
        subscriptions: new Set(['bitcoin', 'ethereum']), // Default subscriptions
        alerts: new Map(),
        connected: Date.now(),
        lastPing: Date.now()
      };
      
      this.sessions.set(sessionId, session);
      
      // Initialize data if first connection
      if (!this.initialized) {
        await this.initializeData();
      }
      
      // Start auto-broadcasting if this is the first session
      if (!this.autoBroadcastActive) {
        this.startAutoBroadcast();
      }
      
      // Send welcome message
      server.send(JSON.stringify({
        type: 'connected',
        sessionId: sessionId,
        message: 'AlertEngine v2.2 connected - LunarCrush API v4 integration',
        subscriptions: Array.from(session.subscriptions),
        thresholds: this.defaultThresholds,
        api_status: this.env.LUNARCRUSH_API_KEY ? 'configured' : 'missing',
        api_version: 'v4',
        timestamp: Date.now()
      }));

      // Send immediate data update if we have cached data
      if (this.cryptoData.size > 0) {
        await this.sendDataUpdate(session);
      }

      // Handle incoming messages
      server.addEventListener('message', async (event) => {
        try {
          const data = JSON.parse(event.data);
          await this.handleClientMessage(sessionId, data);
        } catch (error) {
          console.error('Error handling client message:', error);
          server.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      // Handle connection close
      server.addEventListener('close', () => {
        this.sessions.delete(sessionId);
        console.log(`Session ${sessionId} disconnected. Active sessions: ${this.sessions.size}`);
        
        // Stop auto-broadcasting if no sessions remain
        if (this.sessions.size === 0) {
          this.autoBroadcastActive = false;
        }
      });

      return new Response(null, { status: 101, webSocket: client });
      
    } catch (error) {
      console.error('WebSocket setup error:', error);
      return new Response(`WebSocket error: ${error.message}`, { status: 500 });
    }
  }

  /**
   * Initialize data on first connection
   */
  async initializeData() {
    try {
      console.log('🔄 Initializing AlertEngine data with LunarCrush API v4...');
      await this.checkAndBroadcast();
      this.initialized = true;
      console.log('✅ AlertEngine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AlertEngine:', error);
      // Continue anyway - we'll retry on next broadcast
    }
  }

  /**
   * Start automatic broadcasting loop
   */
  startAutoBroadcast() {
    if (this.autoBroadcastActive) return;
    
    this.autoBroadcastActive = true;
    console.log('🔄 Auto-broadcast started - 30-second intervals with API v4');
    
    // Don't await this - let it run in background
    this.autoBroadcastLoop();
  }

  /**
   * Auto-broadcast loop - runs every 30 seconds
   */
  async autoBroadcastLoop() {
    while (this.autoBroadcastActive && this.sessions.size > 0) {
      try {
        await this.checkAndBroadcast();
        
        // Wait 30 seconds before next broadcast
        await new Promise(resolve => setTimeout(resolve, this.broadcastInterval));
      } catch (error) {
        console.error('Auto-broadcast error:', error);
        // Continue the loop even on errors
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds on error
      }
    }
    
    console.log('🛑 Auto-broadcast stopped');
  }

  /**
   * Main function - check alerts and broadcast updates
   */
  async checkAndBroadcast() {
    try {
      // Rate limiting for API calls
      const now = Date.now();
      if (now - this.lastAPICall < this.apiCallCooldown) {
        console.log('⏳ API call rate limited, using cached data');
        return;
      }

      console.log('📡 Fetching crypto data from LunarCrush API v4...');
      
      // Fetch latest crypto data from LunarCrush API v4
      const btcData = await this.fetchCryptoData('bitcoin');
      const ethData = await this.fetchCryptoData('ethereum');
      
      this.lastAPICall = now;
      
      if (btcData || ethData) {
        this.lastSuccessfulFetch = now;
      }
      
      if (!btcData && !ethData) {
        console.error('❌ Failed to fetch both crypto data sources');
        // Send error update to sessions
        this.broadcastError('Failed to fetch crypto data from API v4 - API may be down');
        return;
      }

      // Store any data we successfully fetched
      if (btcData?.data) {
        this.cryptoData.set('bitcoin', btcData);
        console.log('✅ Bitcoin data updated:', btcData.data.price ? `$${btcData.data.price.toFixed(2)}` : 'No price');
      }
      
      if (ethData?.data) {
        this.cryptoData.set('ethereum', ethData);
        console.log('✅ Ethereum data updated:', ethData.data.price ? `$${ethData.data.price.toFixed(2)}` : 'No price');
      }

      // Only proceed with alerts if we have data
      if ((btcData?.data) || (ethData?.data)) {
        // Update baselines for surge detection
        this.updateBaselines(btcData, ethData);

        // Check all types of alerts
        await this.checkPriceAlerts(btcData, ethData);
        await this.checkSentimentAlerts(btcData, ethData);
        await this.checkVolumeAlerts(btcData, ethData);
        await this.checkCustomAlerts(btcData, ethData);
        
        // Broadcast data updates to all sessions
        await this.broadcastToAllSessions(btcData, ethData);
        
        this.lastBroadcast = Date.now();
        console.log(`📡 Broadcast completed - ${this.sessions.size} sessions updated`);
      }

    } catch (error) {
      console.error('Error in checkAndBroadcast:', error);
      this.broadcastError(`Alert system error: ${error.message}`);
    }
  }

  /**
   * Broadcast error message to all sessions
   */
  broadcastError(message) {
    for (const [sessionId, session] of this.sessions) {
      try {
        session.socket.send(JSON.stringify({
          type: 'system_error',
          message: message,
          timestamp: Date.now()
        }));
      } catch (error) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Update baseline metrics for surge detection
   */
  updateBaselines(btcData, ethData) {
    if (btcData?.data?.interactions_24h) {
      const btcInteractions = parseFloat(btcData.data.interactions_24h);
      if (btcInteractions > 0) {
        this.baselines.bitcoin.interactions = 
          (this.baselines.bitcoin.interactions * 0.9) + (btcInteractions * 0.1);
      }
    }
    
    if (ethData?.data?.interactions_24h) {
      const ethInteractions = parseFloat(ethData.data.interactions_24h);
      if (ethInteractions > 0) {
        this.baselines.ethereum.interactions = 
          (this.baselines.ethereum.interactions * 0.9) + (ethInteractions * 0.1);
      }
    }
  }

  /**
   * Check price-based alerts
   */
  async checkPriceAlerts(btcData, ethData) {
    const cryptos = {};
    if (btcData?.data) cryptos.bitcoin = btcData;
    if (ethData?.data) cryptos.ethereum = ethData;
    
    for (const [symbol, data] of Object.entries(cryptos)) {
      if (!data?.data?.price) continue;
      
      const thresholds = this.defaultThresholds[symbol];
      const currentPrice = parseFloat(data.data.price);
      
      // Price above threshold alert
      if (currentPrice > thresholds.price_above) {
        await this.triggerAlert({
          type: 'price_breakout',
          level: 'high',
          symbol: symbol,
          threshold: thresholds.price_above,
          currentPrice: currentPrice,
          message: `🚀 ${symbol.toUpperCase()} BREAKOUT! Broke $${thresholds.price_above.toLocaleString()} → $${currentPrice.toLocaleString()}`,
          emoji: '🚀'
        });
      }

      // Price below support alert
      if (currentPrice < thresholds.price_below) {
        await this.triggerAlert({
          type: 'price_breakdown',
          level: 'warning',
          symbol: symbol,
          threshold: thresholds.price_below,
          currentPrice: currentPrice,
          message: `⚠️ ${symbol.toUpperCase()} broke support at $${thresholds.price_below.toLocaleString()} → $${currentPrice.toLocaleString()}`,
          emoji: '⚠️'
        });
      }
    }
  }

  /**
   * Check sentiment-based alerts
   */
  async checkSentimentAlerts(btcData, ethData) {
    const cryptos = {};
    if (btcData?.data) cryptos.bitcoin = btcData;
    if (ethData?.data) cryptos.ethereum = ethData;
    
    for (const [symbol, data] of Object.entries(cryptos)) {
      if (!data?.data?.sentiment) continue;
      
      const thresholds = this.defaultThresholds[symbol];
      const sentiment = parseFloat(data.data.sentiment);
      
      // Bullish sentiment spike
      if (sentiment > thresholds.sentiment_spike) {
        await this.triggerAlert({
          type: 'sentiment_bullish',
          level: 'info',
          symbol: symbol,
          threshold: thresholds.sentiment_spike,
          currentSentiment: sentiment,
          message: `🔥 ${symbol.toUpperCase()} sentiment explosion! ${sentiment}% bullish - Community is HYPED!`,
          emoji: '🔥'
        });
      }

      // Bearish sentiment drop
      if (sentiment < thresholds.sentiment_drop) {
        await this.triggerAlert({
          type: 'sentiment_bearish',
          level: 'warning',
          symbol: symbol,
          threshold: thresholds.sentiment_drop,
          currentSentiment: sentiment,
          message: `😰 ${symbol.toUpperCase()} sentiment crash: ${sentiment}% - Fear in the market`,
          emoji: '😰'
        });
      }
    }
  }

  /**
   * Check social volume and interaction alerts
   */
  async checkVolumeAlerts(btcData, ethData) {
    const cryptos = {};
    if (btcData?.data) cryptos.bitcoin = btcData;
    if (ethData?.data) cryptos.ethereum = ethData;
    
    for (const [symbol, data] of Object.entries(cryptos)) {
      if (!data?.data?.interactions_24h) continue;
      
      const thresholds = this.defaultThresholds[symbol];
      const baseline = this.baselines[symbol];
      const currentInteractions = parseFloat(data.data.interactions_24h);
      
      // Social activity surge
      if (currentInteractions > baseline.interactions * thresholds.interaction_spike) {
        const surgePercent = Math.round(((currentInteractions / baseline.interactions) - 1) * 100);
        await this.triggerAlert({
          type: 'social_surge',
          level: 'info',
          symbol: symbol,
          currentInteractions: currentInteractions,
          baseline: baseline.interactions,
          surgePercent: surgePercent,
          message: `📈 ${symbol.toUpperCase()} social surge! +${surgePercent}% activity (${(currentInteractions/1000000).toFixed(1)}M interactions)`,
          emoji: '📈'
        });
      }
    }
  }

  /**
   * Check custom session alerts
   */
  async checkCustomAlerts(btcData, ethData) {
    const cryptos = {};
    if (btcData?.data) cryptos.bitcoin = btcData;
    if (ethData?.data) cryptos.ethereum = ethData;
    
    for (const [sessionId, session] of this.sessions) {
      for (const [alertId, alert] of session.alerts) {
        if (alert.triggered) continue;
        
        const cryptoData = cryptos[alert.symbol];
        if (!cryptoData?.data) continue;
        
        const currentPrice = parseFloat(cryptoData.data.price || 0);
        const sentiment = parseFloat(cryptoData.data.sentiment || 0);
        
        let triggered = false;
        let message = '';
        
        switch (alert.type) {
          case 'price_above':
            triggered = currentPrice > alert.threshold;
            message = `🎯 Custom Alert: ${alert.symbol.toUpperCase()} hit $${alert.threshold.toLocaleString()}! Current: $${currentPrice.toLocaleString()}`;
            break;
          case 'price_below':
            triggered = currentPrice < alert.threshold;
            message = `🎯 Custom Alert: ${alert.symbol.toUpperCase()} fell below $${alert.threshold.toLocaleString()}! Current: $${currentPrice.toLocaleString()}`;
            break;
          case 'sentiment_spike':
            triggered = sentiment > alert.threshold;
            message = `🎯 Custom Alert: ${alert.symbol.toUpperCase()} sentiment hit ${alert.threshold}%! Current: ${sentiment}%`;
            break;
        }
        
        if (triggered) {
          alert.triggered = true;
          alert.triggeredAt = Date.now();
          
          try {
            session.socket.send(JSON.stringify({
              type: 'custom_alert_triggered',
              alertId: alertId,
              alert: alert,
              currentData: {
                price: currentPrice,
                sentiment: sentiment
              },
              message: message,
              timestamp: Date.now()
            }));
          } catch (error) {
            // Remove broken connections
            this.sessions.delete(sessionId);
          }
        }
      }
    }
  }

  /**
   * Trigger default alert to all relevant sessions
   */
  async triggerAlert(alertData) {
    for (const [sessionId, session] of this.sessions) {
      if (session.subscriptions.has(alertData.symbol)) {
        try {
          session.socket.send(JSON.stringify({
            type: 'default_alert',
            alert: alertData,
            timestamp: Date.now()
          }));
        } catch (error) {
          // Remove broken connections
          this.sessions.delete(sessionId);
        }
      }
    }
  }

  /**
   * Broadcast live data updates to all sessions
   */
  async broadcastToAllSessions(btcData, ethData) {
    const update = {
      type: 'realtime_update',
      timestamp: Date.now(),
      broadcast_id: crypto.randomUUID().substring(0, 8),
      data: {},
      market_summary: {},
      api_version: 'v4'
    };

    // Add Bitcoin data if available
    if (btcData?.data) {
      update.data.bitcoin = this.formatCryptoData(btcData);
    }

    // Add Ethereum data if available
    if (ethData?.data) {
      update.data.ethereum = this.formatCryptoData(ethData);
    }

    // Calculate market summary if we have data
    if (btcData?.data || ethData?.data) {
      update.market_summary = {
        total_market_cap: this.calculateTotalMarketCap(btcData, ethData),
        btc_dominance: this.calculateBtcDominance(btcData, ethData),
        fear_greed_index: this.calculateFearGreedIndex(btcData, ethData),
        data_status: {
          bitcoin: btcData?.data ? 'available' : 'unavailable',
          ethereum: ethData?.data ? 'available' : 'unavailable'
        }
      };
    }

    let successCount = 0;
    for (const [sessionId, session] of this.sessions) {
      try {
        session.socket.send(JSON.stringify(update));
        successCount++;
      } catch (error) {
        // Remove broken connections
        this.sessions.delete(sessionId);
        console.log(`Removed broken session: ${sessionId}`);
      }
    }
    
    console.log(`📡 Data update sent to ${successCount}/${this.sessions.size + (successCount - this.sessions.size)} sessions`);
  }

  /**
   * Format crypto data for frontend consumption
   */
  formatCryptoData(data) {
    if (!data?.data) return null;
    
    const cryptoData = data.data;
    
    return {
      price: parseFloat(cryptoData.price || 0),
      price_formatted: `$${parseFloat(cryptoData.price || 0).toLocaleString()}`,
      change_24h: parseFloat(cryptoData.percent_change_24h || 0),
      sentiment: parseFloat(cryptoData.sentiment || 0),
      volume: parseFloat(cryptoData.volume_24h || 0),
      volume_formatted: this.formatVolume(cryptoData.volume_24h),
      market_cap: parseFloat(cryptoData.market_cap || 0),
      interactions_24h: parseFloat(cryptoData.interactions_24h || 0),
      social_volume: parseFloat(cryptoData.social_volume_24h || 0),
      social_dominance: parseFloat(cryptoData.social_dominance || 0),
      galaxy_score: parseFloat(cryptoData.galaxy_score || 0),
      alt_rank: parseFloat(cryptoData.alt_rank || 0)
    };
  }

  /**
   * Format large numbers for display
   */
  formatVolume(volume) {
    const num = parseFloat(volume || 0);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  }

  /**
   * Calculate total market cap of monitored cryptos
   */
  calculateTotalMarketCap(btcData, ethData) {
    const btcCap = parseFloat(btcData?.data?.market_cap || 0);
    const ethCap = parseFloat(ethData?.data?.market_cap || 0);
    return btcCap + ethCap;
  }

  /**
   * Calculate Bitcoin dominance
   */
  calculateBtcDominance(btcData, ethData) {
    const totalCap = this.calculateTotalMarketCap(btcData, ethData);
    const btcCap = parseFloat(btcData?.data?.market_cap || 0);
    return totalCap > 0 ? (btcCap / totalCap) * 100 : 0;
  }

  /**
   * Calculate simplified fear & greed index based on sentiment
   */
  calculateFearGreedIndex(btcData, ethData) {
    const btcSentiment = parseFloat(btcData?.data?.sentiment || 50);
    const ethSentiment = parseFloat(ethData?.data?.sentiment || 50);
    return (btcSentiment + ethSentiment) / 2;
  }

  /**
   * Send current data to a specific session
   */
  async sendDataUpdate(session) {
    const btcData = this.cryptoData.get('bitcoin');
    const ethData = this.cryptoData.get('ethereum');
    
    if (!btcData && !ethData) return;

    try {
      const update = {
        type: 'data_snapshot',
        timestamp: Date.now(),
        data: {},
        api_version: 'v4'
      };

      if (btcData?.data) {
        update.data.bitcoin = this.formatCryptoData(btcData);
      }

      if (ethData?.data) {
        update.data.ethereum = this.formatCryptoData(ethData);
      }

      session.socket.send(JSON.stringify(update));
    } catch (error) {
      // Session will be cleaned up by the broadcast function
    }
  }

  /**
   * Get current data without API calls
   */
  async getCurrentData() {
    const btcData = this.cryptoData.get('bitcoin');
    const ethData = this.cryptoData.get('ethereum');
    
    if (btcData || ethData) {
      const result = {};
      if (btcData?.data) result.bitcoin = this.formatCryptoData(btcData);
      if (ethData?.data) result.ethereum = this.formatCryptoData(ethData);
      return result;
    }
    
    return null;
  }

  /**
   * Handle client messages (subscribe, unsubscribe, set alerts)
   */
  async handleClientMessage(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.lastPing = Date.now();

    switch (data.type) {
      case 'subscribe':
        if (data.symbol) {
          session.subscriptions.add(data.symbol.toLowerCase());
          session.socket.send(JSON.stringify({
            type: 'subscribed',
            symbol: data.symbol,
            message: `📡 Now monitoring ${data.symbol.toUpperCase()} - real-time updates active`
          }));
        }
        break;

      case 'unsubscribe':
        if (data.symbol) {
          session.subscriptions.delete(data.symbol.toLowerCase());
          session.socket.send(JSON.stringify({
            type: 'unsubscribed',
            symbol: data.symbol,
            message: `🔇 Stopped monitoring ${data.symbol.toUpperCase()}`
          }));
        }
        break;

      case 'set_alert':
        await this.setCustomAlert(sessionId, data);
        break;

      case 'get_status':
        await this.sendStatusUpdate(sessionId);
        break;

      case 'force_update':
        await this.checkAndBroadcast();
        session.socket.send(JSON.stringify({
          type: 'update_forced',
          message: 'Manual update triggered - API v4',
          timestamp: Date.now()
        }));
        break;

      case 'ping':
        session.socket.send(JSON.stringify({ 
          type: 'pong', 
          timestamp: Date.now(),
          auto_broadcast: this.autoBroadcastActive,
          api_status: this.env.LUNARCRUSH_API_KEY ? 'configured' : 'missing',
          api_version: 'v4'
        }));
        break;
    }
  }

  /**
   * Set custom alert for a session
   */
  async setCustomAlert(sessionId, alertData) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const alertId = crypto.randomUUID();
    const alert = {
      id: alertId,
      symbol: alertData.symbol.toLowerCase(),
      type: alertData.alertType,
      threshold: alertData.threshold,
      created: Date.now(),
      triggered: false
    };

    session.alerts.set(alertId, alert);
    
    session.socket.send(JSON.stringify({
      type: 'alert_created',
      alertId: alertId,
      alert: alert,
      message: `🔔 Alert created: ${alertData.symbol.toUpperCase()} ${alertData.alertType.replace('_', ' ')} ${alertData.threshold}`
    }));
  }

  /**
   * Fetch crypto data from LunarCrush API v4
   */
  async fetchCryptoData(symbol) {
    try {
      if (!this.env.LUNARCRUSH_API_KEY) {
        throw new Error('LunarCrush API key not configured');
      }

      // Try coins endpoint first (has price data)
      let response = await fetch(`https://lunarcrush.com/api4/public/coins/${symbol}/v1`, {
        headers: {
          'Authorization': `Bearer ${this.env.LUNARCRUSH_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      // If coins endpoint fails, try topic endpoint (has social data)
      if (!response.ok && response.status === 404) {
        console.log(`Coins endpoint failed for ${symbol}, trying topic endpoint...`);
        response = await fetch(`https://lunarcrush.com/api4/public/topic/${symbol}/v1`, {
          headers: {
            'Authorization': `Bearer ${this.env.LUNARCRUSH_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.data) {
        throw new Error(`No data returned for ${symbol}`);
      }
      
      console.log(`✅ Successfully fetched ${symbol} data from API v4`);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${symbol} data:`, error);
      return null;
    }
  }

  /**
   * Send status update to a specific session
   */
  async sendStatusUpdate(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const currentData = await this.getCurrentData();

    session.socket.send(JSON.stringify({
      type: 'status_update',
      sessionId: sessionId,
      subscriptions: Array.from(session.subscriptions),
      activeAlerts: session.alerts.size,
      lastUpdate: this.lastBroadcast,
      autoBroadcast: this.autoBroadcastActive,
      nextBroadcast: this.autoBroadcastActive ? this.lastBroadcast + this.broadcastInterval : null,
      currentData: currentData,
      api_configured: !!this.env.LUNARCRUSH_API_KEY,
      api_version: 'v4',
      last_successful_fetch: this.lastSuccessfulFetch
    }));
  }

  /**
   * Get connection statistics
   */
  async getStats() {
    return {
      active_connections: this.sessions.size,
      total_alerts: Array.from(this.sessions.values())
        .reduce((total, session) => total + session.alerts.size, 0),
      last_broadcast: this.lastBroadcast,
      auto_broadcast_active: this.autoBroadcastActive,
      uptime: Date.now(),
      crypto_data_status: {
        bitcoin: this.cryptoData.has('bitcoin') && this.cryptoData.get('bitcoin')?.data ? 'available' : 'pending',
        ethereum: this.cryptoData.has('ethereum') && this.cryptoData.get('ethereum')?.data ? 'available' : 'pending'
      },
      thresholds: this.defaultThresholds,
      baselines: this.baselines,
      api_configured: !!this.env.LUNARCRUSH_API_KEY,
      api_version: 'v4',
      initialized: this.initialized,
      last_successful_fetch: this.lastSuccessfulFetch
    };
  }
}
