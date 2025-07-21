/**
 * Portfolio Tracking API Routes - Fixed Authentication
 * Handles portfolio management and tracking
 */

export async function handlePortfolioRequest(request, env, corsHeaders) {
	const url = new URL(request.url);
	const path = url.pathname.replace('/api/portfolio', '');
	const method = request.method;

	try {
		// FIXED: Always require authentication for portfolio endpoints
		const authHeader = request.headers.get('Authorization');
		const apiKey = request.headers.get('X-API-Key');

		if (!authHeader && !apiKey) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Authentication required',
					code: 'UNAUTHORIZED',
					message:
						'Please provide an API key via Authorization header or X-API-Key header',
				}),
				{
					status: 401,
					headers: {
						'Content-Type': 'application/json',
						'WWW-Authenticate': 'Bearer',
						...corsHeaders,
					},
				}
			);
		}

		// In a real app, validate the API key here
		// For demo purposes, we'll accept any non-empty key
		const providedKey = authHeader?.replace('Bearer ', '') || apiKey;
		if (!providedKey || providedKey.trim() === '') {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid API key',
					code: 'INVALID_AUTH',
					message: 'API key cannot be empty',
				}),
				{
					status: 401,
					headers: {
						'Content-Type': 'application/json',
						'WWW-Authenticate': 'Bearer',
						...corsHeaders,
					},
				}
			);
		}

		// GET /api/portfolio - Get portfolio summary
		if (method === 'GET' && path === '') {
			const portfolio = await getPortfolio(env);
			const summary = await calculatePortfolioSummary(portfolio, env);

			return new Response(
				JSON.stringify({
					success: true,
					data: {
						holdings: portfolio,
						summary: summary,
						last_updated: new Date().toISOString(),
					},
				}),
				{
					headers: { 'Content-Type': 'application/json', ...corsHeaders },
				}
			);
		}

		// POST /api/portfolio/holdings - Add holding
		if (method === 'POST' && path === '/holdings') {
			const holdingData = await request.json();
			const holding = await addHolding(holdingData, env);

			return new Response(
				JSON.stringify({
					success: true,
					data: holding,
					message: 'Holding added successfully',
				}),
				{
					status: 201,
					headers: { 'Content-Type': 'application/json', ...corsHeaders },
				}
			);
		}

		// GET /api/portfolio/performance - Portfolio performance
		if (method === 'GET' && path === '/performance') {
			const performance = await getPortfolioPerformance(env);

			return new Response(
				JSON.stringify({
					success: true,
					data: performance,
				}),
				{
					headers: { 'Content-Type': 'application/json', ...corsHeaders },
				}
			);
		}

		return new Response(
			JSON.stringify({
				success: false,
				error: 'Endpoint not found',
				code: 'NOT_FOUND',
			}),
			{
				status: 404,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			}
		);
	} catch (error) {
		console.error('Portfolio API Error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal server error',
				code: 'INTERNAL_ERROR',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			}
		);
	}
}

async function getPortfolio(env) {
	try {
		const portfolioData = await env.CRYPTO_CACHE.get('user_portfolio');
		return portfolioData ? JSON.parse(portfolioData) : [];
	} catch (error) {
		return [];
	}
}

async function addHolding(holdingData, env) {
	const holding = {
		id: generateId(),
		symbol: holdingData.symbol?.toUpperCase(),
		amount: parseFloat(holdingData.amount),
		purchase_price: parseFloat(holdingData.purchase_price),
		purchase_date: holdingData.purchase_date || new Date().toISOString(),
		created_at: new Date().toISOString(),
	};

	const portfolio = await getPortfolio(env);
	portfolio.push(holding);
	await env.CRYPTO_CACHE.put('user_portfolio', JSON.stringify(portfolio), {
		expirationTtl: 86400 * 365,
	});

	return holding;
}

async function calculatePortfolioSummary(portfolio, env) {
	let totalValue = 0;
	let totalCost = 0;

	for (const holding of portfolio) {
		try {
			// Get current price from crypto endpoints
			const priceResponse = await fetch(
				`https://cryptoguard-api.cryptoguard-api.workers.dev/crypto/${holding.symbol.toLowerCase()}`
			);
			const priceData = await priceResponse.json();

			if (priceData.success && priceData.data.price) {
				const currentValue = holding.amount * priceData.data.price;
				const costBasis = holding.amount * holding.purchase_price;

				totalValue += currentValue;
				totalCost += costBasis;
			}
		} catch (error) {
			console.error(`Error calculating value for ${holding.symbol}:`, error);
		}
	}

	return {
		total_value: totalValue,
		total_cost: totalCost,
		profit_loss: totalValue - totalCost,
		profit_loss_percentage:
			totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
	};
}

async function getPortfolioPerformance(env) {
	return {
		daily_change: 0,
		weekly_change: 0,
		monthly_change: 0,
		note: 'Historical performance tracking coming soon',
	};
}

function generateId() {
	return (
		'holding_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
	);
}
