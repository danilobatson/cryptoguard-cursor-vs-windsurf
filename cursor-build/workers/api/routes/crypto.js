/**
 * Crypto data routes - LunarCrush API v4 integration
 * Fixed to use correct endpoints and data structure
 */

export async function handleCryptoRequest(request, env, corsHeaders) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  try {
    // /crypto/list - List top cryptocurrencies
    if (pathParts[2] === 'list') {
      const response = await fetch('https://lunarcrush.com/api4/public/coins/list/v1?limit=20&sort=market_cap_rank', {
        headers: {
          'Authorization': `Bearer ${env.LUNARCRUSH_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`LunarCrush API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return new Response(JSON.stringify({
        source: "LunarCrush API v4",
        endpoint: "/public/coins/list/v1",
        count: data.data?.length || 0,
        data: data.data || []
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // /crypto/{symbol} - Get specific crypto data
    if (pathParts[2]) {
      const symbol = pathParts[2].toLowerCase();
      
      // Map common symbols to LunarCrush format
      const symbolMap = {
        'bitcoin': 'bitcoin', // Try as topic first, fallback to coin ID
        'ethereum': 'ethereum',
        'btc': 'bitcoin', 
        'eth': 'ethereum'
      };
      
      const mappedSymbol = symbolMap[symbol] || symbol;
      
      // Try the coins endpoint first (has price data)
      let response = await fetch(`https://lunarcrush.com/api4/public/coins/${mappedSymbol}/v1`, {
        headers: {
          'Authorization': `Bearer ${env.LUNARCRUSH_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // If coins endpoint fails, try topic endpoint (has social data)
      if (!response.ok && response.status === 404) {
        response = await fetch(`https://lunarcrush.com/api4/public/topic/${mappedSymbol}/v1`, {
          headers: {
            'Authorization': `Bearer ${env.LUNARCRUSH_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (!response.ok) {
        return new Response(JSON.stringify({
          error: `No data found for symbol: ${symbol}`,
          status: response.status,
          available_symbols: ["bitcoin", "ethereum", "btc", "eth"],
          suggestion: `Try: /crypto/bitcoin or /crypto/ethereum`,
          api_version: "v4"
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const data = await response.json();
      
      // Check if we got valid data
      if (!data.data) {
        return new Response(JSON.stringify({
          error: `Invalid response format for symbol: ${symbol}`,
          response_keys: Object.keys(data),
          suggestion: `The API returned data but not in expected format`
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      return new Response(JSON.stringify({
        source: "LunarCrush API v4",
        symbol: symbol,
        endpoint: response.url.includes('/coins/') ? 'coins' : 'topic',
        data: data.data,
        config: data.config,
        last_updated: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Default response
    return new Response(JSON.stringify({
      error: "Invalid crypto endpoint",
      available_endpoints: [
        "/crypto/list - List top 20 cryptocurrencies",
        "/crypto/bitcoin - Bitcoin data",
        "/crypto/ethereum - Ethereum data",
        "/crypto/btc - Bitcoin (alias)",
        "/crypto/eth - Ethereum (alias)"
      ],
      api_version: "v4"
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Crypto route error:', error);
    
    return new Response(JSON.stringify({
      error: "Failed to fetch crypto data",
      message: error.message,
      api_version: "v4",
      suggestion: "Check API key configuration and network connectivity"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
