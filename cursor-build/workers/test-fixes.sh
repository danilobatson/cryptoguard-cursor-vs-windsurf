#!/bin/bash

echo "🧪 CryptoGuard AlertEngine Fix Verification"
echo "==========================================="

echo -e "\n1. ✅ API Health Check:"
health=$(curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/health | jq -r '.status // "error"')
echo "Status: $health"

echo -e "\n2. 🔑 API Key Check:"
curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/health | jq '.api_key_configured'

echo -e "\n3. 📊 Stats Check:"
curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/stats | jq '.alert_engine.api_configured'

echo -e "\n4. 🟠 Bitcoin Data Test:"
btc_result=$(curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/crypto/bitcoin)
echo "$btc_result" | jq 'if .data then "✅ Success: " + (.data.close // "No price") else "❌ Error: " + (.error // "Unknown") end'

echo -e "\n5. 🔷 Ethereum Data Test:"
eth_result=$(curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/crypto/ethereum)
echo "$eth_result" | jq 'if .data then "✅ Success: " + (.data.close // "No price") else "❌ Error: " + (.error // "Unknown") end'

echo -e "\n6. 🔌 WebSocket Test (5 second timeout):"
if timeout 5s wscat -c wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts 2>/dev/null | head -1; then
    echo "✅ WebSocket connection successful"
else
    echo "❌ WebSocket connection failed or timed out"
fi

echo -e "\n============================================"
echo "🎯 Fix Status Summary:"
echo "- API Health: $health"
echo "- Ready for real-time testing!"
echo ""
echo "🧪 Open test-alert-engine-v2.html to test the full system"
