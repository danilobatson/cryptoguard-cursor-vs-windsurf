import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import webSocketService from '../services/WebSocketService'
import useCryptoStore from '../stores/useCryptoStore'
import useAlertStore from '../stores/useAlertStore'

// Main WebSocket integration hook
export const useWebSocket = (symbols = ['bitcoin', 'ethereum']) => {
  const {
    isRealTimeActive,
    updateFromWebSocket,
    handleConnectionStatus,
    addNotification
  } = useCryptoStore()
  
  const { checkAlerts } = useAlertStore()
  const queryClient = useQueryClient()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!isRealTimeActive || isInitialized.current) return

    console.log('🔌 Initializing WebSocket integration...')
    isInitialized.current = true

    // Set up WebSocket event listeners
    const setupListeners = () => {
      // Handle crypto data updates
      webSocketService.on('crypto_update', (cryptoData) => {
        console.log('📡 Real-time crypto update:', Object.keys(cryptoData))
        
        // Update Zustand store
        updateFromWebSocket(cryptoData)
        
        // Invalidate React Query cache to trigger UI updates
        queryClient.setQueriesData(
          { queryKey: ['crypto'] },
          (oldData) => cryptoData
        )
        
        // Check alerts with new data
        const triggeredAlerts = checkAlerts(cryptoData)
        if (triggeredAlerts && triggeredAlerts.length > 0) {
          triggeredAlerts.forEach(({ alert, currentPrice }) => {
            addNotification({
              type: 'warning',
              title: '🚨 Real-time Alert!',
              message: `${alert.title} - ${alert.symbol.toUpperCase()} is now $${currentPrice.toLocaleString()}`
            })
          })
        }
      })

      // Handle connection status changes
      webSocketService.on('status_change', (statusData) => {
        handleConnectionStatus(statusData)
        
        // Notify user of connection changes
        if (statusData.status === 'connected') {
          addNotification({
            type: 'success',
            title: '🟢 WebSocket Connected',
            message: 'Real-time updates active'
          })
        } else if (statusData.status === 'error') {
          addNotification({
            type: 'error',
            title: '🔴 WebSocket Error',
            message: 'Connection lost, attempting reconnection...'
          })
        }
      })

      // Handle real-time alerts
      webSocketService.on('alert', (alert) => {
        console.log('🚨 WebSocket alert received:', alert)
        addNotification({
          type: 'warning',
          title: '⚡ Instant Alert!',
          message: `${alert.title} - Real-time trigger detected`
        })
      })
    }

    setupListeners()

    // Cleanup on unmount or when real-time is disabled
    return () => {
      console.log('🔌 Cleaning up WebSocket listeners...')
      webSocketService.off('crypto_update')
      webSocketService.off('status_change')
      webSocketService.off('alert')
      isInitialized.current = false
    }
  }, [isRealTimeActive, updateFromWebSocket, handleConnectionStatus, checkAlerts, addNotification, queryClient])

  return {
    isConnected: webSocketService.getStatus().connected,
    status: webSocketService.getStatus().status
  }
}

// Hook for WebSocket connection status
export const useConnectionStatus = () => {
  const { getConnectionHealth } = useCryptoStore()
  
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['websocket-health'],
    queryFn: getConnectionHealth,
    refetchInterval: 5000, // Check every 5 seconds
    staleTime: 3000
  })

  return {
    health: healthData,
    isLoading,
    isConnected: healthData?.isConnected || false,
    status: healthData?.status || 'disconnected',
    lastUpdate: healthData?.lastUpdate,
    reconnectAttempts: healthData?.reconnectAttempts || 0,
    healthScore: healthData?.healthScore || 0
  }
}

// Hook for real-time data with WebSocket integration
export const useRealTimeData = (symbols = ['bitcoin', 'ethereum']) => {
  const {
    cryptoData,
    isRealTimeActive,
    connectionStatus,
    lastUpdate
  } = useCryptoStore()

  useWebSocket(symbols)

  return {
    data: cryptoData,
    isRealTime: isRealTimeActive && connectionStatus === 'connected',
    connectionStatus,
    lastUpdate,
    symbols: Object.keys(cryptoData),
    hasRealtimeData: Object.values(cryptoData).some(
      data => data?.source === 'websocket'
    )
  }
}
