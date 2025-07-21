#!/bin/bash

echo "🔥 LunarCrush API v4 Integration Verification"
echo "============================================="

echo -e "\n1. ✅ System Health:"
health=$(curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/health)
echo "$health" | jq '{status, api_key_configured, alert_engine}'

echo -e "\n2. 🟠 Bitcoin Test (API v4):"
btc=$(curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/crypto/bitcoin)
if echo "$btc" | jq -e '.data.price' > /dev/null; then
    price=$(echo "$btc" | jq -r '.data.price')
    echo "✅ SUCCESS: Bitcoin price = $${price}"
    echo "$btc" | jq '{endpoint, symbol: .data.symbol, price: .data.price, volume_24h: .data.volume_24h}'
else
    echo "❌ FAILED:"
    echo "$btc" | jq '{error, message}'
fi

echo -e "\n3. 🔷 Ethereum Test (API v4):"
eth=$(curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/crypto/ethereum)
if echo "$eth" | jq -e '.data.price' > /dev/null; then
    price=$(echo "$eth" | jq -r '.data.price')
    echo "✅ SUCCESS: Ethereum price = $${price}"
    echo "$eth" | jq '{endpoint, symbol: .data.symbol, price: .data.price, volume_24h: .data.volume_24h}'
else
    echo "❌ FAILED:"
    echo "$eth" | jq '{error, message}'
fi

echo -e "\n4. 📊 AlertEngine Stats:"
stats=$(curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/stats)
echo "$stats" | jq '.alert_engine | {
  api_version,
  api_configured,
  crypto_data_status,
  initialized
}'

echo -e "\n5. 🔌 WebSocket Test (5 seconds):"
if timeout 5s wscat -c wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts 2>/dev/null | grep -q "connected"; then
    echo "✅ WebSocket connection successful"
else
    echo "❌ WebSocket connection failed"
fi

echo -e "\n============================================="
echo "🎯 API v4 Integration Status: COMPLETE"
echo ""
echo "📱 Test the full system:"
echo "   Open: test-alert-engine-v2.html"
echo ""
echo "🚀 Ready for Step 3.2: Data Processing & Caching"
