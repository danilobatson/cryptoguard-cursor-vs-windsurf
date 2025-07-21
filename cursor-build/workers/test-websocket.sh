#!/bin/bash
echo "🔌 Testing WebSocket connection..."

# Use timeout to limit connection time
wscat -c wss://cryptoguard-api.cryptoguard-api.workers.dev/alerts << 'WSEOF'
{"type": "ping"}
{"type": "request_data"}
WSEOF

echo ""
echo "✅ WebSocket test completed"
