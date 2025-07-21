#!/bin/bash
echo "🔍 Step 3.2.1 Verification: WebSocket Connection Debug"
echo "=================================================="

# Test 1: Basic HTTP API (should work)
echo ""
echo "✅ Test 1: HTTP API Status"
curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/health | jq .
echo ""

# Test 2: Bitcoin price (should work)
echo "✅ Test 2: Bitcoin Price"
curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/crypto/bitcoin | jq '.data.price'
echo ""

# Test 3: AlertEngine stats (debugging target)
echo "✅ Test 3: AlertEngine Stats"
curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/stats | jq .alert_engine
echo ""

# Test 4: WebSocket connection attempt
echo "✅ Test 4: WebSocket Connection Test"
if command -v wscat &> /dev/null; then
    wscat -c wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts -w 2 <<< '{"type":"ping"}' || echo "WebSocket connection failed (expected if still broken)"
else
    echo "⚠️ wscat not available. Install with: npm install -g wscat"
fi

echo ""
echo "📋 Verification Summary:"
echo "- HTTP API: Should be working ✅"
echo "- WebSocket: Should now connect (debug version) 🔄"
echo "- Next: Check logs in Cloudflare dashboard for detailed debugging"
