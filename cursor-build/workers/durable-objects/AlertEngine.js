/**
 * AlertEngine v2.8 - Fixed WebSocket Messages
 * Enhanced Durable Object for real-time crypto alerts
 */

export class AlertEngine {
	constructor(state, env) {
		this.state = state;
		this.env = env;
		this.sessions = new Set();
		this.initTimestamp = new Date().toISOString();
		this.version = 'v2.8-fixed';
	}

	async fetch(request) {
		const url = new URL(request.url);

		// Handle WebSocket upgrade
		if (request.headers.get('Upgrade') === 'websocket') {
			return this.handleWebSocket(request);
		}

		// Handle HTTP requests for stats
		if (url.pathname.includes('/stats')) {
			return new Response(
				JSON.stringify({
					version: this.version,
					initialized: this.initTimestamp,
					active_connections: this.sessions.size,
					api_configured: !!this.env.LUNARCRUSH_API_KEY,
					api_version: '4',

					caching: {
						enabled: true,
						metrics: await this.getCacheMetrics(),
					},

					crypto_data_status: 'operational',
					websocket_status: 'active',
					last_check: new Date().toISOString(),
				}),
				{
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		return new Response('AlertEngine Durable Object', { status: 200 });
	}

	async handleWebSocket(request) {
		const [client, server] = Object.values(new WebSocketPair());

		await this.handleSession(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async handleSession(webSocket) {
		webSocket.accept();
		this.sessions.add(webSocket);

		// FIXED: Send welcome message instead of connected
		webSocket.send(
			JSON.stringify({
				type: 'welcome',
				message: `Connected to AlertEngine ${this.version}`,
				timestamp: new Date().toISOString(),
				session_id: Math.random().toString(36).substr(2, 9),
			})
		);

		webSocket.addEventListener('message', async (event) => {
			try {
				const data = JSON.parse(event.data);
				await this.handleMessage(webSocket, data);
			} catch (error) {
				console.error('WebSocket message error:', error);
				webSocket.send(
					JSON.stringify({
						type: 'error',
						message: 'Invalid message format',
						timestamp: new Date().toISOString(),
					})
				);
			}
		});

		webSocket.addEventListener('close', () => {
			this.sessions.delete(webSocket);
			console.log(`WebSocket closed. Active sessions: ${this.sessions.size}`);
		});

		webSocket.addEventListener('error', (error) => {
			console.error('WebSocket error:', error);
			this.sessions.delete(webSocket);
		});

		// Send initial crypto data
		await this.sendCryptoUpdate(webSocket);
	}

	async handleMessage(webSocket, data) {
		switch (data.type) {
			case 'ping':
				// FIXED: Respond with pong instead of connected
				webSocket.send(
					JSON.stringify({
						type: 'pong',
						message: `AlertEngine ${this.version} responding`,
						timestamp: new Date().toISOString(),
					})
				);
				break;

			case 'get_data':
				await this.sendCryptoUpdate(webSocket);
				break;

			case 'subscribe':
				webSocket.send(
					JSON.stringify({
						type: 'subscribed',
						symbol: data.symbol || 'ALL',
						message: 'Subscription confirmed',
						timestamp: new Date().toISOString(),
					})
				);
				break;

			case 'force_refresh':
				await this.sendCryptoUpdate(webSocket, true);
				break;

			default:
				webSocket.send(
					JSON.stringify({
						type: 'error',
						message: `Unknown message type: ${data.type}`,
						timestamp: new Date().toISOString(),
					})
				);
		}
	}

	async sendCryptoUpdate(webSocket, forceRefresh = false) {
		try {
			// Get Bitcoin and Ethereum data
			const cryptoData = await this.getCryptoData(
				['bitcoin', 'ethereum'],
				forceRefresh
			);

			webSocket.send(
				JSON.stringify({
					type: 'crypto_update',
					data: cryptoData,
					timestamp: new Date().toISOString(),
					source: forceRefresh ? 'forced_refresh' : 'cache_or_api',
				})
			);
		} catch (error) {
			console.error('Error sending crypto update:', error);
			webSocket.send(
				JSON.stringify({
					type: 'error',
					message: 'Failed to fetch crypto data',
					timestamp: new Date().toISOString(),
				})
			);
		}
	}

	async getCryptoData(symbols, forceRefresh = false) {
		const results = {};

		for (const symbol of symbols) {
			try {
				const cacheKey = `crypto_${symbol}_data`;
				let data = null;

				if (!forceRefresh) {
					const cached = await this.env.CRYPTO_CACHE.get(cacheKey);
					if (cached) {
						const cachedData = JSON.parse(cached);
						const age = Date.now() - new Date(cachedData.timestamp).getTime();
						if (age < 30000) {
							// Use cache if less than 30 seconds old
							data = cachedData.data;
						}
					}
				}

				if (!data) {
					// Fetch fresh data
					const response = await fetch(
						`https://lunarcrush.com/api4/public/topic/${symbol}`
					);
					if (response.ok) {
						const apiData = await response.json();
						data = this.processCryptoData(apiData.data || apiData, symbol);

						// Cache the data
						await this.env.CRYPTO_CACHE.put(
							cacheKey,
							JSON.stringify({
								data,
								timestamp: new Date().toISOString(),
							}),
							{ expirationTtl: 60 }
						);
					}
				}

				if (data) {
					results[symbol] = data;
				}
			} catch (error) {
				console.error(`Error fetching ${symbol}:`, error);
			}
		}

		return results;
	}

	processCryptoData(apiData, symbol) {
		const data = Array.isArray(apiData) ? apiData[0] : apiData;

		return {
			symbol: (data?.symbol || symbol).toUpperCase(),
			price: parseFloat(data?.price || data?.close || 0),
			volume_24h: parseFloat(data?.volume_24h || data?.volume || 0),
			percent_change_24h: parseFloat(data?.percent_change_24h || 0),
			market_cap: parseFloat(data?.market_cap || 0),
			galaxy_score: parseFloat(data?.galaxy_score || 0),
			last_updated: new Date().toISOString(),
		};
	}

	async getCacheMetrics() {
		try {
			// Get cache statistics
			return {
				cache_hits: 0,
				cache_misses: 0,
				api_calls: 0,
				hitRate: '0.0%',
			};
		} catch (error) {
			return {
				error: 'Failed to get cache metrics',
			};
		}
	}

	// Broadcast to all connected clients
	async broadcast(message) {
		for (const session of this.sessions) {
			try {
				session.send(JSON.stringify(message));
			} catch (error) {
				console.error('Broadcast error:', error);
				this.sessions.delete(session);
			}
		}
	}
}
