/**
 * Security Middleware for API Protection
 */

// Rate limiting storage
const rateLimitStorage = new Map();

export class SecurityMiddleware {
	static async rateLimit(
		request,
		env,
		{ windowMs = 60000, maxRequests = 100 } = {}
	) {
		const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
		const now = Date.now();
		const windowStart = now - windowMs;

		// Clean old entries
		for (const [key, timestamps] of rateLimitStorage.entries()) {
			rateLimitStorage.set(
				key,
				timestamps.filter((time) => time > windowStart)
			);
			if (rateLimitStorage.get(key).length === 0) {
				rateLimitStorage.delete(key);
			}
		}

		// Check current client
		const clientRequests = rateLimitStorage.get(clientIP) || [];
		const recentRequests = clientRequests.filter((time) => time > windowStart);

		if (recentRequests.length >= maxRequests) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Rate limit exceeded',
					code: 'RATE_LIMIT_EXCEEDED',
					retry_after: Math.ceil(windowMs / 1000),
					limit: maxRequests,
					window: Math.ceil(windowMs / 1000),
				}),
				{
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						'Retry-After': Math.ceil(windowMs / 1000).toString(),
						'X-RateLimit-Limit': maxRequests.toString(),
						'X-RateLimit-Remaining': Math.max(
							0,
							maxRequests - recentRequests.length - 1
						).toString(),
						'X-RateLimit-Reset': Math.ceil((now + windowMs) / 1000).toString(),
					},
				}
			);
		}

		// Add current request
		recentRequests.push(now);
		rateLimitStorage.set(clientIP, recentRequests);

		return null; // No rate limit hit
	}

	static validateInput(data, schema) {
		const errors = [];

		for (const [field, rules] of Object.entries(schema)) {
			const value = data[field];

			if (
				rules.required &&
				(value === undefined || value === null || value === '')
			) {
				errors.push(`${field} is required`);
				continue;
			}

			if (value !== undefined && value !== null) {
				if (rules.type && typeof value !== rules.type) {
					errors.push(`${field} must be of type ${rules.type}`);
				}

				if (rules.minLength && value.length < rules.minLength) {
					errors.push(
						`${field} must be at least ${rules.minLength} characters`
					);
				}

				if (rules.maxLength && value.length > rules.maxLength) {
					errors.push(`${field} must be at most ${rules.maxLength} characters`);
				}

				if (rules.pattern && !rules.pattern.test(value)) {
					errors.push(`${field} format is invalid`);
				}

				if (rules.enum && !rules.enum.includes(value)) {
					errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
				}
			}
		}

		return errors;
	}

	static sanitizeInput(input) {
		if (typeof input === 'string') {
			return input
				.trim()
				.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
				.replace(/javascript:/gi, '') // Remove javascript: protocols
				.replace(/on\w+\s*=/gi, ''); // Remove event handlers
		}

		if (Array.isArray(input)) {
			return input.map((item) => SecurityMiddleware.sanitizeInput(item));
		}

		if (typeof input === 'object' && input !== null) {
			const sanitized = {};
			for (const [key, value] of Object.entries(input)) {
				sanitized[SecurityMiddleware.sanitizeInput(key)] =
					SecurityMiddleware.sanitizeInput(value);
			}
			return sanitized;
		}

		return input;
	}

	static async validateApiKey(request, env) {
		const authHeader = request.headers.get('Authorization');
		const apiKey = request.headers.get('X-API-Key');

		// For demo purposes, we'll use a simple API key check
		// In production, implement proper API key validation
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.slice(7);
			// Validate token here
			return { valid: true, user: 'demo_user' };
		}

		if (apiKey) {
			// Validate API key here
			return { valid: true, user: 'demo_user' };
		}

		// For demo, allow requests without auth
		return { valid: true, user: 'anonymous' };
	}

	static getCorsHeaders(origin = '*') {
		return {
			'Access-Control-Allow-Origin': origin,
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
			'Access-Control-Max-Age': '86400',
		};
	}

	static async handleOptions(request) {
		return new Response(null, {
			status: 200,
			headers: SecurityMiddleware.getCorsHeaders(),
		});
	}
}

// Validation schemas
export const schemas = {
	createAlert: {
		symbol: { required: true, type: 'string', minLength: 1, maxLength: 10 },
		type: {
			required: true,
			type: 'string',
			enum: ['price_above', 'price_below', 'sentiment_change'],
		},
		threshold: { required: true, type: 'number' },
	},

	addHolding: {
		symbol: { required: true, type: 'string', minLength: 1, maxLength: 10 },
		amount: { required: true, type: 'number' },
		purchase_price: { required: true, type: 'number' },
	},
};
