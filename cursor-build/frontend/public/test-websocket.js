// CryptoGuard WebSocket Integration Test
// Run this in browser console: copy and paste the entire script

console.log('🧪 CryptoGuard WebSocket Integration Test Starting...\n');

class CryptoGuardTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
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

  async testWebSocketConnection() {
    this.log('Testing WebSocket Connection...', 'info');
    
    try {
      // Access the global crypto store
      const cryptoStore = window.useCryptoStore?.getState?.();
      if (!cryptoStore) {
        this.log('Crypto store not found - app may not be loaded', 'fail');
        return false;
      }

      // Test connection status
      const connectionStatus = cryptoStore.connectionStatus;
      this.log(`Current connection status: ${connectionStatus}`, 'info');

      // Test real-time toggle
      if (!cryptoStore.isRealTimeActive) {
        this.log('Activating real-time mode...', 'info');
        await cryptoStore.startRealTime();
        
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const newStatus = cryptoStore.connectionStatus;
        this.log(`Connection status after activation: ${newStatus}`, 
                 newStatus === 'connected' ? 'pass' : 'warning');
      }

      return true;
    } catch (error) {
      this.log(`WebSocket test failed: ${error.message}`, 'fail');
      return false;
    }
  }

  async testDataFreshness() {
    this.log('Testing Data Freshness...', 'info');
    
    try {
      const cryptoStore = window.useCryptoStore?.getState?.();
      const cryptoData = cryptoStore?.cryptoData || {};
      
      Object.entries(cryptoData).forEach(([symbol, data]) => {
        if (data) {
          const lastUpdated = new Date(data.lastUpdated || data.last_updated || Date.now());
          const ageMinutes = (Date.now() - lastUpdated.getTime()) / 60000;
          const source = data.source || 'unknown';
          
          this.log(`${symbol.toUpperCase()}: ${source} data, ${ageMinutes.toFixed(1)} minutes old`, 
                   ageMinutes < 1 ? 'pass' : ageMinutes < 5 ? 'warning' : 'fail');
        }
      });

      return true;
    } catch (error) {
      this.log(`Data freshness test failed: ${error.message}`, 'fail');
      return false;
    }
  }

  async testRealTimeUpdates() {
    this.log('Testing Real-Time Updates (10 second test)...', 'info');
    
    return new Promise((resolve) => {
      const cryptoStore = window.useCryptoStore?.getState?.();
      let updateCount = 0;
      let initialPrices = {};
      
      // Capture initial prices
      Object.entries(cryptoStore?.cryptoData || {}).forEach(([symbol, data]) => {
        if (data?.price) {
          initialPrices[symbol] = data.price;
        }
      });

      // Monitor for updates
      const checkUpdates = () => {
        const currentData = window.useCryptoStore?.getState?.()?.cryptoData || {};
        
        Object.entries(currentData).forEach(([symbol, data]) => {
          if (data?.price && initialPrices[symbol] && 
              data.price !== initialPrices[symbol]) {
            updateCount++;
            this.log(`Price update detected: ${symbol} changed from $${initialPrices[symbol].toFixed(2)} to $${data.price.toFixed(2)}`, 'pass');
            initialPrices[symbol] = data.price;
          }
        });
      };

      const interval = setInterval(checkUpdates, 1000);
      
      setTimeout(() => {
        clearInterval(interval);
        this.log(`Real-time test complete: ${updateCount} updates detected`, 
                 updateCount > 0 ? 'pass' : 'warning');
        resolve(updateCount > 0);
      }, 10000);
    });
  }

  async testErrorHandling() {
    this.log('Testing Error Handling...', 'info');
    
    try {
      const cryptoStore = window.useCryptoStore?.getState?.();
      
      // Test disconnect and reconnect
      this.log('Testing disconnect/reconnect cycle...', 'info');
      cryptoStore.stopRealTime();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await cryptoStore.startRealTime();
      
      this.log('Error handling test completed', 'pass');
      return true;
    } catch (error) {
      this.log(`Error handling test failed: ${error.message}`, 'fail');
      return false;
    }
  }

  async runFullTest() {
    this.log('🚀 Starting Full CryptoGuard Test Suite...', 'info');
    
    const tests = [
      { name: 'WebSocket Connection', fn: () => this.testWebSocketConnection() },
      { name: 'Data Freshness', fn: () => this.testDataFreshness() },
      { name: 'Real-Time Updates', fn: () => this.testRealTimeUpdates() },
      { name: 'Error Handling', fn: () => this.testErrorHandling() }
    ];

    let passed = 0;
    
    for (const test of tests) {
      this.log(`\n--- Testing ${test.name} ---`, 'info');
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
    
    this.log(`\n🎯 Test Results: ${passed}/${tests.length} tests passed in ${duration}s`, 
             passed === tests.length ? 'pass' : 'warning');

    // Show summary
    console.table(this.results.map(r => ({
      Time: r.timestamp,
      Status: r.status,
      Message: r.message
    })));

    return { passed, total: tests.length, duration };
  }

  // Quick data source test
  async quickTest() {
    this.log('🔍 Quick Data Source Test...', 'info');
    
    const cryptoStore = window.useCryptoStore?.getState?.();
    const data = cryptoStore?.cryptoData || {};
    
    console.log('Current Crypto Data Sources:');
    console.table(Object.entries(data).map(([symbol, info]) => ({
      Symbol: symbol.toUpperCase(),
      Price: info?.price ? `$${info.price.toFixed(2)}` : 'N/A',
      Source: info?.source || 'unknown',
      'Last Updated': info?.lastUpdated ? 
        new Date(info.lastUpdated).toLocaleTimeString() : 'N/A',
      'Real-time': info?.realtimeUpdate ? '🔴 LIVE' : '📊 API'
    })));

    const connectionStatus = cryptoStore?.connectionStatus || 'unknown';
    const isRealTime = cryptoStore?.isRealTimeActive || false;
    
    this.log(`Connection: ${connectionStatus} | Real-time: ${isRealTime ? 'ON' : 'OFF'}`, 'info');
  }
}

// Create global tester instance
window.cryptoTester = new CryptoGuardTester();

// Export test functions for easy console access
window.testCrypto = {
  full: () => window.cryptoTester.runFullTest(),
  quick: () => window.cryptoTester.quickTest(),
  data: () => window.cryptoTester.testDataFreshness(),
  websocket: () => window.cryptoTester.testWebSocketConnection(),
  realtime: () => window.cryptoTester.testRealTimeUpdates()
};

console.log('✅ CryptoGuard Test Suite Loaded!');
console.log('📚 Available commands:');
console.log('  testCrypto.full()     - Run complete test suite');
console.log('  testCrypto.quick()    - Quick data source check'); 
console.log('  testCrypto.data()     - Test data freshness');
console.log('  testCrypto.websocket()- Test WebSocket connection');
console.log('  testCrypto.realtime() - Test real-time updates');
console.log('\n🚀 Start with: testCrypto.quick()');
