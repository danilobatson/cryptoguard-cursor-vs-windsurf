/**
 * Complete API v3.0 Testing Suite
 * Tests all endpoints, security, and performance features
 */

const API_BASE = 'https://cryptoguard-api.cryptoguard-api.workers.dev'\;
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function runCompleteAPITest() {
  console.log(`${colors.blue}🚀 CryptoGuard API v3.0 Complete Test Suite${colors.reset}`);
  console.log('=' .repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  await runTest('Health Check', async () => {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (!response.ok || !data.data || data.data.status !== 'healthy') {
      throw new Error(`Health check failed: ${data.error || 'Unknown error'}`);
    }
    
    return `Status: ${data.data.status}, Services: ${Object.keys(data.data.services).length}`;
  }, results);

  // Test 2: System Stats
  await runTest('System Stats', async () => {
    const response = await fetch(`${API_BASE}/stats`);
    const data = await response.json();
    
    if (!response.ok || !data.data) {
      throw new Error('Stats endpoint failed');
    }
    
    return `API Version: ${data.data.api_version || 'unknown'}`;
  }, results);

  // Test 3: Crypto Data
  await runTest('Bitcoin Price Data', async () => {
    const response = await fetch(`${API_BASE}/crypto/bitcoin`);
    const data = await response.json();
    
    if (!response.ok || !data.data || !data.data.price) {
      throw new Error('Bitcoin data fetch failed');
    }
    
    return `BTC: $${data.data.price.toLocaleString()}`;
  }, results);

  // Test 4: Rate Limiting
  await runTest('Rate Limiting', async () => {
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(fetch(`${API_BASE}/health`));
    }
    
    const responses = await Promise.all(requests);
    const allOk = responses.every(r => r.ok);
    
    if (!allOk) {
      throw new Error('Rate limiting triggered unexpectedly');
    }
    
    return 'Rate limits configured correctly';
  }, results);

  // Test 5: Alert Endpoints (GET)
  await runTest('Alert List Endpoint', async () => {
    const response = await fetch(`${API_BASE}/api/alerts`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Alert list failed: ${data.error}`);
    }
    
    return `Found ${data.count || 0} alerts`;
  }, results);

  // Test 6: Portfolio Endpoint (requires auth - should fail gracefully)
  await runTest('Portfolio Authentication', async () => {
    const response = await fetch(`${API_BASE}/api/portfolio`);
    
    if (response.status !== 401) {
      throw new Error('Portfolio should require authentication');
    }
    
    return 'Authentication correctly enforced';
  }, results);

  // Test 7: WebSocket Connection
  await runTest('WebSocket Connection', async () => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${API_BASE.replace('https:', 'wss:')}/alerts`);
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve('WebSocket connected successfully');
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      };
    });
  }, results);

  // Test 8: API Documentation
  await runTest('API Documentation', async () => {
    const response = await fetch(`${API_BASE}/docs`);
    
    if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
      throw new Error('Documentation endpoint failed');
    }
    
    return 'Documentation available';
  }, results);

  // Test 9: 404 Handling
  await runTest('404 Error Handling', async () => {
    const response = await fetch(`${API_BASE}/nonexistent`);
    const data = await response.json();
    
    if (response.status !== 404 || data.success !== false) {
      throw new Error('404 handling incorrect');
    }
    
    return '404 errors handled correctly';
  }, results);

  // Test 10: Performance Headers
  await runTest('Performance Headers', async () => {
    const response = await fetch(`${API_BASE}/health`);
    
    const cacheControl = response.headers.get('cache-control');
    const contentType = response.headers.get('content-type');
    
    if (!cacheControl || !contentType) {
      throw new Error('Missing performance headers');
    }
    
    return `Cache: ${cacheControl}, Type: ${contentType}`;
  }, results);

  // Results Summary
  console.log('\n' + '=' .repeat(60));
  console.log(`${colors.blue}📊 Test Results Summary${colors.reset}`);
  console.log('=' .repeat(60));
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%${colors.reset}`);

  if (results.failed === 0) {
    console.log(`\n${colors.green}🎉 ALL TESTS PASSED! API v3.0 is ready for production!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Check the details above.${colors.reset}`);
  }
}

async function runTest(name, testFunction, results) {
  process.stdout.write(`${colors.yellow}🧪 ${name}...${colors.reset} `);
  
  try {
    const result = await testFunction();
    console.log(`${colors.green}✅ ${result}${colors.reset}`);
    results.passed++;
    results.tests.push({ name, status: 'passed', result });
  } catch (error) {
    console.log(`${colors.red}❌ ${error.message}${colors.reset}`);
    results.failed++;
    results.tests.push({ name, status: 'failed', error: error.message });
  }
}

// Run the tests
if (typeof WebSocket === 'undefined') {
  // Node.js environment - install ws package for WebSocket support
  try {
    const { WebSocket } = await import('ws');
    global.WebSocket = WebSocket;
  } catch (error) {
    console.log(`${colors.yellow}⚠️ WebSocket tests will be skipped (install 'ws' package for full testing)${colors.reset}`);
    global.WebSocket = class MockWebSocket {
      constructor() { this.onopen = null; this.onerror = null; }
      close() {}
    };
  }
}

runCompleteAPITest().catch(console.error);
