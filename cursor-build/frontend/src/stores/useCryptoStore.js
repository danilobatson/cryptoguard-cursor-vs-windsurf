import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import webSocketService from '../services/WebSocketService'

const useCryptoStore = create(
  persist(
    (set, get) => ({
      // Existing state
      cryptoData: {},
      loading: {},
      errors: {},
      notifications: [],
      
      // Real-time control (existing)
      isRealTimeActive: false,
      refreshInterval: 30000,
      
      // NEW: WebSocket state
      wsConnection: null,
      connectionStatus: 'disconnected', // 'connecting', 'connected', 'error', 'disconnected'
      lastUpdate: null,
      wsErrors: [],
      reconnectAttempts: 0,
      
      // Existing actions
      setCryptoData: (symbol, data) =>
        set((state) => ({
          cryptoData: {
            ...state.cryptoData,
            [symbol]: {
              ...data,
              lastUpdated: new Date().toISOString(),
              source: 'websocket' // NEW: Track data source
            }
          }
        })),

      setLoading: (symbol, isLoading) =>
        set((state) => ({
          loading: { ...state.loading, [symbol]: isLoading }
        })),

      setError: (symbol, error) =>
        set((state) => ({
          errors: { ...state.errors, [symbol]: error }
        })),

      clearError: (symbol) =>
        set((state) => {
          const newErrors = { ...state.errors }
          delete newErrors[symbol]
          return { errors: newErrors }
        }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              ...notification
            },
            ...state.notifications.slice(0, 9) // Keep last 10
          ]
        })),

      clearNotifications: () => set({ notifications: [] }),

      // Enhanced real-time actions with WebSocket support
      startRealTime: async () => {
        const state = get()
        
        try {
          console.log('🚀 Starting WebSocket real-time updates...')
          
          // Connect to WebSocket service
          await webSocketService.connect(['bitcoin', 'ethereum'])
          
          set({
            isRealTimeActive: true,
            connectionStatus: 'connected',
            wsErrors: []
          })
          
          // Add success notification
          state.addNotification({
            type: 'success',
            title: '🔴 LIVE: Real-time WebSocket Active',
            message: 'Receiving instant crypto updates via WebSocket'
          })
          
        } catch (error) {
          console.error('Failed to start WebSocket:', error)
          set({
            isRealTimeActive: false,
            connectionStatus: 'error',
            wsErrors: [...state.wsErrors, error.message]
          })
          
          state.addNotification({
            type: 'error',
            title: 'WebSocket Connection Failed',
            message: 'Falling back to polling mode. Check connection.'
          })
        }
      },

      stopRealTime: () => {
        console.log('⏸️ Stopping WebSocket real-time updates...')
        webSocketService.disconnect()
        
        set({
          isRealTimeActive: false,
          connectionStatus: 'disconnected'
        })
        
        get().addNotification({
          type: 'info',
          title: '⏸️ PAUSED: Real-time Updates Stopped',
          message: 'WebSocket disconnected. Click LIVE to resume.'
        })
      },

      // NEW: WebSocket-specific actions
      connectWebSocket: async (symbols = ['bitcoin', 'ethereum']) => {
        const state = get()
        
        try {
          set({ connectionStatus: 'connecting' })
          await webSocketService.connect(symbols)
          
          set({
            connectionStatus: 'connected',
            reconnectAttempts: 0,
            wsErrors: []
          })
          
        } catch (error) {
          set({
            connectionStatus: 'error',
            wsErrors: [...state.wsErrors, error.message]
          })
          throw error
        }
      },

      updateFromWebSocket: (cryptoData) => {
        const state = get()
        console.log('📡 WebSocket data received:', Object.keys(cryptoData))
        
        // Update each crypto symbol
        Object.entries(cryptoData).forEach(([symbol, data]) => {
          state.setCryptoData(symbol, {
            ...data,
            source: 'websocket',
            realtimeUpdate: true
          })
          
          // Clear any loading states
          state.setLoading(symbol, false)
          state.clearError(symbol)
        })
        
        set({
          lastUpdate: new Date().toISOString()
        })
      },

      handleConnectionStatus: (statusData) => {
        console.log('📊 WebSocket status change:', statusData.status)
        
        set({
          connectionStatus: statusData.status,
          lastUpdate: statusData.timestamp
        })
        
        // Handle reconnection attempts
        if (statusData.status === 'error') {
          const state = get()
          set({
            reconnectAttempts: state.reconnectAttempts + 1
          })
        }
      },

      // NEW: WebSocket connection health
      getConnectionHealth: () => {
        const state = get()
        const wsStatus = webSocketService.getStatus()
        
        return {
          isConnected: wsStatus.connected,
          status: state.connectionStatus,
          lastUpdate: state.lastUpdate,
          reconnectAttempts: state.reconnectAttempts,
          errors: state.wsErrors,
          healthScore: wsStatus.connected ? 100 : 0
        }
      },

      // NEW: Force WebSocket data refresh
      forceWebSocketRefresh: () => {
        if (webSocketService.getStatus().connected) {
          webSocketService.forceRefresh()
          
          get().addNotification({
            type: 'info',
            title: '🔄 Force Refresh',
            message: 'Requesting fresh data from WebSocket'
          })
        }
      },

      // Enhanced refresh with WebSocket fallback
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
    }),
    {
      name: 'crypto-store',
      partialize: (state) => ({
        cryptoData: state.cryptoData,
        refreshInterval: state.refreshInterval,
        // Don't persist WebSocket connection state
      })
    }
  )
)

export default useCryptoStore
