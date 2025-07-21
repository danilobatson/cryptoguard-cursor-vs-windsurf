/**
 * WebSocket Route Handler
 * Manages WebSocket connections via Durable Objects
 */

export async function handleWebSocketRoute(request, env) {
  // Get or create Durable Object instance
  const id = env.WEBSOCKET_MANAGER.idFromName('websocket-manager');
  const obj = env.WEBSOCKET_MANAGER.get(id);
  
  // Forward request to Durable Object
  return obj.fetch(request);
}

export async function getWebSocketStats(env) {
  try {
    // Get Durable Object instance
    const id = env.WEBSOCKET_MANAGER.idFromName('websocket-manager');
    const obj = env.WEBSOCKET_MANAGER.get(id);
    
    // Get stats from Durable Object
    const response = await obj.fetch(new Request('https://dummy.com/stats'));
    return response;
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to get WebSocket stats',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
