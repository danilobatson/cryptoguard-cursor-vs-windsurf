/**
 * Comprehensive Error Handling Middleware
 */

export class ErrorHandler {
	static async handleError(error, request, env) {
		const errorId = generateErrorId();
		const timestamp = new Date().toISOString();

		// Log error details
		const errorDetails = {
			id: errorId,
			timestamp,
			url: request.url,
			method: request.method,
			message: error.message,
			stack: error.stack,
			userAgent: request.headers.get('User-Agent'),
			ip: request.headers.get('CF-Connecting-IP'),
		};

		console.error('Application Error:', errorDetails);

		// Store error for monitoring (in production, send to monitoring service)
		try {
			await env.CRYPTO_CACHE.put(
				`error_${errorId}`,
				JSON.stringify(errorDetails),
				{ expirationTtl: 86400 * 7 } // 7 days
			);
		} catch (storageError) {
			console.error('Failed to store error:', storageError);
		}

		// Return appropriate error response
		const response = ErrorHandler.getErrorResponse(error, errorId);
		return response;
	}

	static getErrorResponse(error, errorId) {
		// Default error response
		let status = 500;
		let code = 'INTERNAL_ERROR';
		let message = 'Internal server error';
		let details = null;

		// Map specific errors
		if (error.name === 'ValidationError') {
			status = 400;
			code = 'VALIDATION_ERROR';
			message = 'Invalid input data';
			details = error.details;
		} else if (error.name === 'NotFoundError') {
			status = 404;
			code = 'NOT_FOUND';
			message = 'Resource not found';
		} else if (error.name === 'UnauthorizedError') {
			status = 401;
			code = 'UNAUTHORIZED';
			message = 'Authentication required';
		} else if (error.name === 'ForbiddenError') {
			status = 403;
			code = 'FORBIDDEN';
			message = 'Access denied';
		} else if (error.message.includes('Rate limit')) {
			status = 429;
			code = 'RATE_LIMIT_EXCEEDED';
			message = 'Too many requests';
		} else if (error.message.includes('timeout')) {
			status = 504;
			code = 'TIMEOUT';
			message = 'Request timeout';
		}

		const errorResponse = {
			success: false,
			error: message,
			code,
			error_id: errorId,
			timestamp: new Date().toISOString(),
		};

		if (details) {
			errorResponse.details = details;
		}

		return new Response(JSON.stringify(errorResponse), {
			status,
			headers: {
				'Content-Type': 'application/json',
				'X-Error-ID': errorId,
			},
		});
	}

	static async getErrorStats(env, timeframe = 'hour') {
		try {
			// In a real implementation, you'd aggregate error data
			return {
				total_errors: 0,
				error_rate: '0%',
				common_errors: [],
				timeframe,
				note: 'Error monitoring active',
			};
		} catch (error) {
			return {
				error: 'Failed to fetch error stats',
			};
		}
	}
}

export class ValidationError extends Error {
	constructor(message, details = null) {
		super(message);
		this.name = 'ValidationError';
		this.details = details;
	}
}

export class NotFoundError extends Error {
	constructor(message = 'Resource not found') {
		super(message);
		this.name = 'NotFoundError';
	}
}

export class UnauthorizedError extends Error {
	constructor(message = 'Authentication required') {
		super(message);
		this.name = 'UnauthorizedError';
	}
}

function generateErrorId() {
	return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
