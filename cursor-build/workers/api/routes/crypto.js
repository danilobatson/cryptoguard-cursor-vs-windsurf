/**
 * Crypto API Routes - LunarCrush Integration
 */

const LUNARCRUSH_BASE_URL = 'https://lunarcrush.com/api4/public';

export async function handleCryptoRoutes(request, env) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');

  // GET /crypto/list - Get list of cryptocurrencies
  if (pathParts[2] === 'list') {
    return getCryptoList(env);
  }

  // GET /crypto/:symbol - Get specific crypto details
  if (pathParts[2] && pathParts[2] !== 'list') {
    const symbol = pathParts[2].toLowerCase();
    return getCryptoDetails(symbol, env);
  }

  return new Response(JSON.stringify({
    error: 'Invalid crypto endpoint'
  }), { status: 400 });
}

async function getCryptoList(env) {
  try {
    // For development, return mock data if no API key
    if (!env.LUNARCRUSH_API_KEY || env.LUNARCRUSH_API_KEY === 'placeholder-key-for-development') {
      return new Response(JSON.stringify({
        message: 'Mock crypto data - add real LunarCrush API key for live data',
        data: [
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 120389.10,
            sentiment: 82,
            social_volume_24h: 219768,
            percent_change_24h: 1.65
          },
          {
            symbol: 'ETH',
            name: 'Ethereum',
            price: 3608.45,
            sentiment: 83,
            social_volume_24h: 140523,
            percent_change_24h: 2.31
          }
        ]
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Make request to LunarCrush API
    const response = await fetch(`${LUNARCRUSH_BASE_URL}/coins/list/v2?limit=20`, {
      headers: {
        'Authorization': `Bearer ${env.LUNARCRUSH_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`LunarCrush API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      source: 'LunarCrush API',
      data: data.data || []
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch crypto data',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function getCryptoDetails(symbol, env) {
  try {
    // Mock data for development
    if (!env.LUNARCRUSH_API_KEY || env.LUNARCRUSH_API_KEY === 'placeholder-key-for-development') {
      const mockData = {
        bitcoin: {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 120389.10,
          sentiment: 82,
          social_volume_24h: 219768,
          interactions_24h: 141789582,
          percent_change_24h: 1.65,
          market_cap: 2395001813211
        },
        ethereum: {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 3608.45,
          sentiment: 83,
          social_volume_24h: 140523,
          interactions_24h: 89456321,
          percent_change_24h: 2.31,
          market_cap: 433891234567
        }
      };

      return new Response(JSON.stringify({
        message: 'Mock crypto data - add real LunarCrush API key for live data',
        data: mockData[symbol] || { error: 'Symbol not found in mock data' }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Real LunarCrush API call
    const response = await fetch(`${LUNARCRUSH_BASE_URL}/topic/${symbol}/v1`, {
      headers: {
        'Authorization': `Bearer ${env.LUNARCRUSH_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`LunarCrush API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      source: 'LunarCrush API',
      data: data.data || {}
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch crypto details',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
