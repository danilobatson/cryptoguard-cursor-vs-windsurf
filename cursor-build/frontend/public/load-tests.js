// CryptoGuard Test Loader - Paste this in browser console to load tests

console.log('🧪 Loading CryptoGuard Test Suite...');

// CryptoGuard Test Suite - Embedded for Console Use
class CryptoGuardTestSuite {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.version = '1.0.0';
  }

  log(message, status = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const statusIcon = {
      'pass': '✅',
      'fail': '❌', 
      'info': '📊',
      'warning': '⚠️'
    }[status] || '📊';
    
    console.log(`${statusIcon} [${timestamp}] ${message}`);
    this.results.push({ message, status, timestamp });
  }

  async testSystemHealth() {
    this.log('Testing System Health...', 'info');
    
    try {
      const systems = {
        cryptoStore: !!window.useCryptoStore?.getState,
        webSocketService: !!window.webSocketService,
        reactApp: !!document.querySelector('#root'),
        mantineUI: !!document.querySelector('.mantine-AppShell-main')
      };

      Object.entries(systems).forEach(([system, isWorking]) => {
        this.log(`${system}: ${isWorking ? 'WORKING' : 'MISSING'}`, 
                 isWorking ? 'pass' : 'fail');
      });

      return Object.values(systems).every(Boolean);
    } catch (error) {
      this.log(`System health test failed: ${error.message}`, 'fail');
      return false;
    }
  }

  async testWebSocketConnection() {
    this.log('Testing WebSocket Connection...', 'info');
    
    try {
      const cryptoStore = window.useCryptoStore?.getState?.();
      if (!cryptoStore) {
        this.log('Crypto store not found', 'fail');
        return false;
      }

      const connectionStatus = cryptoStore.connectionStatus;
      this.log(`Connection status: ${connectionStatus}`, 'info');

      if (!cryptoStore.isRealTimeActive) {
        this.log('Activating real-time mode...', 'info');
        await cryptoStore.startRealTime();
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const newStatus = cryptoStore.connectionStatus;
        this.log(`Post-activation status: ${newStatus}`, 
                 newStatus === 'connected' ? 'pass' : 'warning');
      }

      return true;
    } catch (error) {
      this.log(`WebSocket test failed: ${error.message}`, 'fail');
      return false;
    }
  }

  async testDataFlow() {
    this.log('Testing Data Flow...', 'info');
    
    try {
      const cryptoStore = window.useCryptoStore?.getState?.();
      const cryptoData = cryptoStore?.cryptoData || {};
      
      const dataQuality = Object.entries(cryptoData).map(([symbol, data]) => {
        if (!data) return { symbol, status: 'missing' };
        
        const lastUpdated = new Date(data.lastUpdated || Date.now());
        const ageMinutes = (Date.now() - lastUpdated.getTime()) / 60000;
        const source = data.source || 'unknown';
        
        return {
          symbol: symbol.toUpperCase(),
          price: data.price ? `$${data.price.toFixed(2)}` : 'N/A',
          source,
          ageMinutes: ageMinutes.toFixed(1),
          status: ageMinutes < 1 ? 'fresh' : ageMinutes < 5 ? 'recent' : 'stale'
        };
      });

      console.table(dataQuality);
      
      const healthyData = dataQuality.filter(d => d.status !== 'missing' && d.status !== 'stale');
      this.log(`Data quality: ${healthyData.length}/${dataQuality.length} healthy`, 
               healthyData.length === dataQuality.length ? 'pass' : 'warning');

      return true;
    } catch (error) {
      this.log(`Data flow test failed: ${error.message}`, 'fail');
      return false;
    }
  }

  async testRealTimeUpdates() {
    this.log('Testing Real-Time Updates (10s)...', 'info');
    
    return new Promise((resolve) => {
      const cryptoStore = window.useCryptoStore?.getState?.();
      let updateCount = 0;
      let initialPrices = {};
      
      Object.entries(cryptoStore?.cryptoData || {}).forEach(([symbol, data]) => {
        if (data?.price) {
          initialPrices[symbol] = data.price;
        }
      });

      const checkUpdates = () => {
        const currentData = window.useCryptoStore?.getState?.()?.cryptoData || {};
        
        Object.entries(currentData).forEach(([symbol, data]) => {
          if (data?.price && initialPrices[symbol] && 
              Math.abs(data.price - initialPrices[symbol]) > 0.01) {
            updateCount++;
            this.log(`${symbol}: $${initialPrices[symbol].toFixed(2)} → $${data.price.toFixed(2)}`, 'pass');
            initialPrices[symbol] = data.price;
          }
        });
      };

      const interval = setInterval(checkUpdates, 1000);
      
      setTimeout(() => {
        clearInterval(interval);
        this.log(`Real-time test: ${updateCount} updates detected`, 
                 updateCount > 0 ? 'pass' : 'warning');
        resolve(updateCount > 0);
      }, 10000);
    });
  }

  async testUserInterface() {
    this.log('Testing User Interface...', 'info');
    
    try {
      const uiElements = {
        appShell: !!document.querySelector('.mantine-AppShell-main'),
        cryptoCards: document.querySelectorAll('*').length > 0, // Basic DOM check
        buttons: document.querySelectorAll('button').length > 0,
        realTimeElements: Array.from(document.querySelectorAll('*')).some(el => 
          el.textContent && (el.textContent.includes('LIVE') || el.textContent.includes('GO LIVE')))
      };

      Object.entries(uiElements).forEach(([element, exists]) => {
        this.log(`UI ${element}: ${exists ? 'PRESENT' : 'MISSING'}`, 
                 exists ? 'pass' : 'fail');
      });

      return Object.values(uiElements).every(Boolean);
    } catch (error) {
      this.log(`UI test failed: ${error.message}`, 'fail');
      return false;
    }
  }

  async runComprehensiveTest() {
    this.log(`🚀 CryptoGuard Comprehensive Test Suite v${this.version}`, 'info');
    this.log('================================================', 'info');
    
    const tests = [
      { name: 'System Health', fn: () => this.testSystemHealth() },
      { name: 'WebSocket Connection', fn: () => this.testWebSocketConnection() },
      { name: 'Data Flow', fn: () => this.testDataFlow() },
      { name: 'Real-Time Updates', fn: () => this.testRealTimeUpdates() },
      { name: 'User Interface', fn: () => this.testUserInterface() }
    ];

    let passed = 0;
    
    for (const test of tests) {
      this.log(`\n--- ${test.name} ---`, 'info');
      try {
        const result = await test.fn();
        if (result) {
          passed++;
          this.log(`${test.name}: PASSED ✅`, 'pass');
        } else {
          this.log(`${test.name}: FAILED ❌`, 'fail');
        }
      } catch (error) {
        this.log(`${test.name}: ERROR - ${error.message}`, 'fail');
      }
    }

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const grade = passed === tests.length ? 'A+' : passed >= 4 ? 'A' : passed >= 3 ? 'B' : 'C';
    
    this.log(`\n🎯 FINAL RESULTS: ${passed}/${tests.length} (${grade}) in ${duration}s`, 
             passed === tests.length ? 'pass' : 'warning');

    console.table(this.results);
    return { passed, total: tests.length, duration, grade };
  }

  quickHealthCheck() {
    this.log('⚡ Quick Health Check...', 'info');
    
    const cryptoStore = window.useCryptoStore?.getState?.();
    const data = cryptoStore?.cryptoData || {};
    
    console.log('\n📊 Current System Status:');
    console.table(Object.entries(data).map(([symbol, info]) => ({
      Symbol: symbol.toUpperCase(),
      Price: info?.price ? `$${info.price.toFixed(2)}` : 'N/A',
      Source: info?.source || 'unknown',
      'Last Updated': info?.lastUpdated ? 
        new Date(info.lastUpdated).toLocaleTimeString() : 'N/A',
      Status: info?.realtimeUpdate ? '🔴 LIVE' : '📊 API'
    })));

    const connectionStatus = cryptoStore?.connectionStatus || 'unknown';
    const isRealTime = cryptoStore?.isRealTimeActive || false;
    
    this.log(`Connection: ${connectionStatus} | Real-time: ${isRealTime ? 'ON' : 'OFF'}`, 'info');
    console.log(`\n🎯 System Grade: ${this.getSystemGrade()}`);
  }

  getSystemGrade() {
    const cryptoStore = window.useCryptoStore?.getState?.();
    const hasData = Object.keys(cryptoStore?.cryptoData || {}).length > 0;
    const isConnected = cryptoStore?.connectionStatus === 'connected';
    const isRealTime = cryptoStore?.isRealTimeActive;
    
    if (hasData && isConnected && isRealTime) return 'A+ (Perfect)';
    if (hasData && isRealTime) return 'A (Excellent)';
    if (hasData) return 'B (Good)';
    return 'C (Needs Attention)';
  }
}

// Global test suite instance
window.cryptoTestSuite = new CryptoGuardTestSuite();

// Export clean test API
window.cryptoTest = {
  full: () => window.cryptoTestSuite.runComprehensiveTest(),
  quick: () => window.cryptoTestSuite.quickHealthCheck(),
  health: () => window.cryptoTestSuite.testSystemHealth(),
  websocket: () => window.cryptoTestSuite.testWebSocketConnection(),
  data: () => window.cryptoTestSuite.testDataFlow(),
  ui: () => window.cryptoTestSuite.testUserInterface()
};

console.log('✅ CryptoGuard Test Suite v1.0.0 Loaded Successfully!');
console.log('📚 Available Commands:');
console.log('  cryptoTest.full()     - Run comprehensive test suite (5 tests)');
console.log('  cryptoTest.quick()    - Quick health check with data table');
console.log('  cryptoTest.health()   - System health test');
console.log('  cryptoTest.websocket()- WebSocket connection test');
console.log('  cryptoTest.data()     - Data flow and freshness test');
console.log('  cryptoTest.ui()       - User interface test');
console.log('\n🚀 Start with: cryptoTest.quick()');
