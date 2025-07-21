#!/bin/bash
echo "🔧 Fixing AlertEngine deployment..."

# Step 1: Verify file exists and has content
echo "✅ Checking AlertEngine file:"
if [ -f "durable-objects/AlertEngine.js" ]; then
    echo "File exists: $(wc -l < durable-objects/AlertEngine.js) lines"
    echo "Has debug version: $(grep -c "debug-v2.3" durable-objects/AlertEngine.js || echo '0')"
else
    echo "❌ AlertEngine.js not found!"
    exit 1
fi

# Step 2: Check wrangler config
echo ""
echo "✅ Checking wrangler config:"
grep -A 5 "durable_objects" wrangler.toml || echo "No durable_objects found in wrangler.toml"

# Step 3: Clear any potential caches and redeploy
echo ""
echo "�� Redeploying with cache clear..."
wrangler deploy --compatibility-date 2024-07-01 --minify false

# Step 4: Wait and test
echo ""
echo "⏳ Waiting 15 seconds for deployment..."
sleep 15

echo ""
echo "🔍 Testing deployment:"
curl -s https://cryptoguard-api.cryptoguard-api.workers.dev/stats | jq '.alert_engine'

echo ""
echo "✅ Fix deployment complete!"
