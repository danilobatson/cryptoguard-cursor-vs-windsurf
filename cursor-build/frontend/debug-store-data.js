// Debug script to check crypto store data
console.log('🔍 Debugging CryptoGuard Store Data...');

if (typeof window !== 'undefined' && window.useCryptoStore) {
  const store = window.useCryptoStore.getState();
  
  console.log('📊 Current Store State:', {
    cryptoData: store.cryptoData,
    connectionStatus: store.connectionStatus,
    isRealTimeActive: store.isRealTimeActive,
    lastUpdate: store.lastUpdate
  });
  
  console.log('🔍 Crypto Data Details:');
  Object.entries(store.cryptoData || {}).forEach(([symbol, data]) => {
    console.log(`  ${symbol.toUpperCase()}:`, {
      price: data?.price,
      close: data?.close,
      current_price: data?.current_price,
      source: data?.source,
      lastUpdated: data?.lastUpdated,
      allKeys: Object.keys(data || {})
    });
  });
  
  console.log('✅ Debug complete! Check the data above.');
} else {
  console.log('❌ useCryptoStore not found on window object');
}
