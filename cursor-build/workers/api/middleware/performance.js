/**
 * Performance Optimization Middleware
 */

export class PerformanceOptimizer {
  static async compressResponse(data, request) {
    const acceptEncoding = request.headers.get('Accept-Encoding') || '';
    const response = typeof data === 'string' ? data : JSON.stringify(data);

    // For Cloudflare Workers, we rely on edge compression
    // This is a placeholder for custom compression logic if needed
    return {
      body: response,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30', // 30 second cache for dynamic data
        'Content-Length': response.length.toString()
      }
    };
  }

  static async optimizeApiResponse(data, cacheKey, env, ttl = 30) {
    // Implement response optimization
    const optimized = {
      data,
      metadata: {
        cached: false,
        timestamp: new Date().toISOString(),
        cache_ttl: ttl
      }
    };

    // Cache the optimized response
    if (cacheKey) {
      try {
        await env.CRYPTO_CACHE.put(
          `optimized_${cacheKey}`,
          JSON.stringify(optimized),
          { expirationTtl: ttl }
        );
      } catch (error) {
        console.warn('Failed to cache optimized response:', error);
      }
    }

    return optimized;
  }

  static async getPerformanceMetrics(env) {
    try {
      const metrics = await env.CRYPTO_CACHE.get('performance_metrics');
      return metrics ? JSON.parse(metrics) : {
        avg_response_time: 0,
        cache_hit_rate: 0,
        requests_per_minute: 0,
        error_rate: 0
      };
    } catch (error) {
      return {
        error: 'Failed to fetch performance metrics'
      };
    }
  }

  static updateMetrics(responseTime, cacheHit, env) {
    // In production, implement proper metrics collection
    // For now, just log the metrics
    console.log('Performance Metrics:', {
      response_time: responseTime,
      cache_hit: cacheHit,
      timestamp: new Date().toISOString()
    });
  }
}

export class ResponseBuilder {
  constructor() {
    this.data = null;
    this.success = true;
    this.message = null;
    this.metadata = {};
    this.headers = {};
  }

  setData(data) {
    this.data = data;
    return this;
  }

  setSuccess(success) {
    this.success = success;
    return this;
  }

  setMessage(message) {
    this.message = message;
    return this;
  }

  setMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  setHeaders(headers) {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  setCaching(ttl) {
    this.headers['Cache-Control'] = `public, max-age=${ttl}`;
    return this;
  }

  build(status = 200) {
    const response = {
      success: this.success,
      ...(this.data !== null && { data: this.data }),
      ...(this.message && { message: this.message }),
      ...(Object.keys(this.metadata).length > 0 && { metadata: this.metadata })
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      }
    });
  }
}
