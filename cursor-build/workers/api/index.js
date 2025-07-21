/**
 * CryptoGuard API - Cloudflare Worker
 * Real-time crypto alert system backend with WebSocket support
 */

import { handleCryptoRoutes } from './routes/crypto.js';
import { handleWebSocketRoute, getWebSocketStats } from './routes/websocket.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS for development
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }
    
    try {
      // WebSocket connection handling
      if (url.pathname === '/realtime' && request.headers.get('Upgrade') === 'websocket') {
        return handleWebSocketRoute(request, env);
      }
      
      // WebSocket stats endpoint
      if (url.pathname === '/realtime/stats') {
        return getWebSocketStats(env);
      }
      
      // Route handling
      if (url.pathname === '/') {
        return new Response(JSON.stringify({
          message: 'CryptoGuard API v1.1 - Now with WebSocket support!',
          status: 'operational',
          environment: env.ENVIRONMENT || 'development',
          timestamp: new Date().toISOString(),
          lunarcrush_connected: env.LUNARCRUSH_API_KEY ? 'Yes' : 'Mock data only',
          websocket_enabled: env.WEBSOCKET_MANAGER ? 'Yes' : 'No',
          endpoints: [
            'GET /health - Health check',
            'GET /crypto/list - Get crypto list', 
            'GET /crypto/:symbol - Get crypto details (try /crypto/bitcoin)',
            'WS /realtime - WebSocket connection for live updates',
            'GET /realtime/stats - WebSocket connection stats'
          ]
        }), {
          headers: getCORSHeaders()
        });
      }
      
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: env.ENVIRONMENT,
          api_key_configured: env.LUNARCRUSH_API_KEY ? 'Yes' : 'No',
          websocket_ready: env.WEBSOCKET_MANAGER ? 'Yes' : 'No'
        }), {
          headers: getCORSHeaders()
        });
      }
      
      // Handle crypto routes
      if (url.pathname.startsWith('/crypto')) {
        return handleCryptoRoutes(request, env);
      }
      
      // 404 for unmatched routes
      return new Response(JSON.stringify({
        error: 'Not Found',
        path: url.pathname,
        available_routes: [
          '/', '/health', '/crypto/list', '/crypto/bitcoin', '/crypto/ethereum',
          'WS /realtime', '/realtime/stats'
        ]
      }), {
        status: 404,
        headers: getCORSHeaders()
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
  }
};

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}

function getCORSHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

// Export Durable Object classes
export { WebSocketManager } from '../durable-objects/WebSocketManager.js';
