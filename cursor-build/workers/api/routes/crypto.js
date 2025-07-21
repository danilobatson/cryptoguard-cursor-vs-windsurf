/**
 * Cryptocurrency Data API Routes - Correct LunarCrush API v4
 * Uses proper endpoints from LunarCrush documentation
 */

const LUNARCRUSH_API_BASE = 'https://lunarcrush.com/api4/public';

// Fallback data for when APIs fail (realistic Jan 2025 prices)
const FALLBACK_DATA = {
	bitcoin: {
		id: 1,
		name: 'Bitcoin',
		symbol: 'BTC',
		price: 117000,
		price_btc: 1,
		market_cap: 2300000000000,
		percent_change_24h: -0.5,
		percent_change_7d: 2.1,
		percent_change_30d: 15.2,
		volume_24h: 25000000000,
		circulating_supply: 19800000,
		close: 117000,
		galaxy_score: 75,
		alt_rank: 1,
		volatility: 0.045,
		market_cap_rank: 1,
	},
	ethereum: {
		id: 2,
		name: 'Ethereum',
		symbol: 'ETH',
		price: 3750,
		price_btc: 0.032,
		market_cap: 450000000000,
		percent_change_24h: -1.2,
		percent_change_7d: 1.8,
		percent_change_30d: 8.5,
		volume_24h: 15000000000,
		circulating_supply: 120000000,
		close: 3750,
		galaxy_score: 68,
		alt_rank: 2,
		volatility: 0.055,
		market_cap_rank: 2,
	},
};

export async function handleCryptoRequest(request, env, corsHeaders) {
	const url = new URL(request.url);
	const pathParts = url.pathname.split('/');
	const symbol = pathParts[pathParts.length - 1]?.toLowerCase();

	try {
		// Validate symbol
		if (!symbol || symbol === 'crypto') {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Cryptocurrency symbol required',
					code: 'MISSING_SYMBOL',
					usage: 'GET /crypto/{symbol} (e.g., /crypto/bitcoin)',
					available: ['bitcoin', 'ethereum'],
					timestamp: new Date().toISOString(),
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json', ...corsHeaders },
				}
			);
		}

		// Check cache first
		const cacheKey = `crypto_${symbol}_v4`;
		let cachedData = null;

		try {
			const cached = await env.CRYPTO_CACHE.get(cacheKey);
			if (cached) {
				cachedData = JSON.parse(cached);
				const cacheAge = Date.now() - new Date(cachedData.timestamp).getTime();

				if (cacheAge < 60000) {
					// Use cache if less than 60 seconds old
					return new Response(
						JSON.stringify({
							success: true,
							data: cachedData.data,
							metadata: {
								cached: true,
								timestamp: cachedData.timestamp,
								cache_age_ms: cacheAge,
								source: 'Cache',
							},
						}),
						{
							headers: {
								'Content-Type': 'application/json',
								'X-Cache': 'HIT',
								'Cache-Control': 'public, max-age=60',
								...corsHeaders,
							},
						}
					);
				}
			}
		} catch (cacheError) {
			console.warn('Cache read error:', cacheError);
		}

		// Try LunarCrush API with correct endpoints
		let apiData = null;
		let dataSource = 'fallback';

		try {
			console.log(`Fetching ${symbol} from LunarCrush API v4...`);

			const apiKey = env.LUNARCRUSH_API_KEY;
			const headers = {
				'Content-Type': 'application/json',
				'User-Agent': 'CryptoGuard-API/3.0',
			};

			// Add Authorization header if API key is available
			if (apiKey) {
				headers['Authorization'] = `Bearer ${apiKey}`;
			}

			// Use the correct LunarCrush API endpoint from documentation
			const response = await fetch(
				`${LUNARCRUSH_API_BASE}/coins/${symbol}/v1`,
				{
					headers,
					cf: {
						cacheTtl: 60,
						cacheEverything: true,
					},
				}
			);

			if (response.ok) {
				const responseData = await response.json();
				console.log(
					`✅ LunarCrush API response for ${symbol}:`,
					!!responseData.data
				);

				if (responseData && responseData.data) {
					apiData = responseData;
					dataSource = 'LunarCrush API v4';
				}
			} else {
				console.warn(
					`LunarCrush API returned ${response.status} for ${symbol}`
				);

				// Try the topic endpoint as fallback (sometimes coins are indexed as topics)
				const topicResponse = await fetch(
					`${LUNARCRUSH_API_BASE}/topic/${symbol}/v1`,
					{
						headers,
						cf: { cacheTtl: 60, cacheEverything: true },
					}
				);

				if (topicResponse.ok) {
					const topicData = await topicResponse.json();
					if (topicData && topicData.data) {
						apiData = topicData;
						dataSource = 'LunarCrush API v4 (topic)';
						console.log(`✅ Found ${symbol} via topic endpoint`);
					}
				}
			}
		} catch (apiError) {
			console.warn(`LunarCrush API error for ${symbol}:`, apiError.message);
		}

		// Process the data
		let processedData;

		if (apiData && apiData.data) {
			processedData = processCryptoData(apiData.data, symbol, dataSource);
			console.log(
				`✅ Processed API data for ${symbol}:`,
				processedData.symbol,
				processedData.price
			);
		} else {
			// Use fallback data
			if (FALLBACK_DATA[symbol]) {
				processedData = {
					...FALLBACK_DATA[symbol],
					last_updated: new Date().toISOString(),
					source: 'Fallback data (API unavailable)',
				};
				dataSource = 'Fallback';
				console.log(`ℹ️ Using fallback data for ${symbol}`);
			} else {
				throw new Error(`No data available for cryptocurrency: ${symbol}`);
			}
		}

		// Cache the result
		const dataToCache = {
			data: processedData,
			timestamp: new Date().toISOString(),
			source: dataSource,
		};

		try {
			await env.CRYPTO_CACHE.put(cacheKey, JSON.stringify(dataToCache), {
				expirationTtl: dataSource === 'Fallback' ? 300 : 120, // 5min fallback, 2min API data
			});
		} catch (cacheError) {
			console.warn('Cache write error:', cacheError);
		}

		// Return successful response
		return new Response(
			JSON.stringify({
				success: true,
				data: processedData,
				metadata: {
					cached: false,
					timestamp: dataToCache.timestamp,
					source: dataSource,
					symbol: symbol,
				},
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					'X-Cache': 'MISS',
					'Cache-Control': 'public, max-age=60',
					...corsHeaders,
				},
			}
		);
	} catch (error) {
		console.error(`Crypto API Error for ${symbol}:`, error);

		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to fetch cryptocurrency data',
				code: 'API_ERROR',
				details: error.message,
				symbol: symbol,
				timestamp: new Date().toISOString(),
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			}
		);
	}
}

function processCryptoData(data, requestedSymbol, source) {
	try {
		// Process LunarCrush API v4 data structure (matches documentation)
		const processedData = {
			id: data.id || null,
			symbol: (data.symbol || requestedSymbol).toUpperCase(),
			name: data.name || `${requestedSymbol} Cryptocurrency`,
			price: parseFloat(data.price || data.close || 0),
			price_btc: parseFloat(data.price_btc || 0),
			market_cap: parseFloat(data.market_cap || 0),
			market_cap_rank: parseInt(data.market_cap_rank || 0),
			percent_change_24h: parseFloat(data.percent_change_24h || 0),
			percent_change_7d: parseFloat(data.percent_change_7d || 0),
			percent_change_30d: parseFloat(data.percent_change_30d || 0),
			volume_24h: parseFloat(data.volume_24h || 0),
			circulating_supply: parseFloat(data.circulating_supply || 0),
			max_supply: data.max_supply || null,

			// LunarCrush specific metrics
			galaxy_score: parseFloat(data.galaxy_score || 0),
			alt_rank: parseInt(data.alt_rank || 0),
			volatility: parseFloat(data.volatility || 0),

			// Metadata
			last_updated: data.last_updated || new Date().toISOString(),
			source: source,
		};

		return processedData;
	} catch (error) {
		console.error('Data processing error:', error);
		throw new Error(
			`Failed to process cryptocurrency data for ${requestedSymbol}`
		);
	}
}
