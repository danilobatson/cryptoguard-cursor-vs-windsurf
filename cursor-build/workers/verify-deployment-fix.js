/**
 * Quick deployment verification after fixing Durable Objects export
 */

const API_BASE = 'https://cryptoguard-api.cryptoguard-api.workers.dev';

async function verifyDeployment() {
  console.log('🔍 Verifying deployment fix...');

  try {
    // Test 1: Health check
    console.log('\n1. Health Check:');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthData.data?.status || 'unknown'}`);
    console.log(`   Version: ${healthData.metadata?.version || 'unknown'}`);

    // Test 2: Stats (tests Durable Object)
    console.log('\n2. Stats (AlertEngine Test):');
    const statsResponse = await fetch(`${API_BASE}/stats`);
    const statsData = await statsResponse.json();
    console.log(`   AlertEngine: ${statsData.data?.alert_engine?.version || 'unknown'}`);
    console.log(`   API Version: ${statsData.data?.api_version || 'unknown'}`);

    // Test 3: Crypto data
    console.log('\n3. Crypto Data:');
    const btcResponse = await fetch(`${API_BASE}/crypto/bitcoin`);
    const btcData = await btcResponse.json();
    console.log(`   Bitcoin: $${btcData.data?.price?.toLocaleString() || 'unknown'}`);

    // Test 4: Documentation
    console.log('\n4. Documentation:');
    const docsResponse = await fetch(`${API_BASE}/docs`);
    console.log(`   Docs Available: ${docsResponse.ok ? 'Yes' : 'No'}`);

    console.log('\n✅ Deployment verification complete!');
    console.log(`📖 Full API docs: ${API_BASE}/docs`);

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyDeployment();
