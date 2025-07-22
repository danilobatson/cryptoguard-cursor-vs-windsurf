import { useState, useEffect } from 'react'

// Simplified connection status for backend API usage
export const useConnectionStatus = () => {
  // Since we're using backend API directly, assume always connected
  return {
    isConnected: true,
    status: 'connected',
    healthScore: 100,
    reconnectAttempts: 0
  }
}

// Legacy WebSocket service - disabled
class WebSocketService {
  constructor() {
    console.log('🚫 WebSocketService: Disabled - using backend API instead')
  }
  
  connect() {
    return Promise.resolve()
  }
  
  disconnect() {}
  addEventListener() {}
  removeEventListener() {}
}

export default WebSocketService
