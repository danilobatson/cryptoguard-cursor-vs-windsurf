import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import webSocketService from '../services/WebSocketService.js'

const useCryptoStore = create(
  persist(
    (set, get) => ({
      // Existing state
      cryptoData: {},
      loading: {},
      errors: {},
      notifications: [],
      
      // Real-time control
      isRealTimeActive: false,
      refreshInterval: 30000,
      
      // WebSocket state
      wsConnection: null,
      connectionStatus: 'disconnected',
      lastUpdate: null,
      wsErrors: [],
      reconnectAttempts: 0,
      
      // NEW: Data freshness tracking
      dataFreshness: {},
      
      // Existing actions
      setCryptoData: (symbol, data) =>
        set((state) => ({
          cryptoData: {
            ...state.cryptoData,
            [symbol]: {
              ...data,
              lastUpdated: new Date().toISOString(),
              source: data.source || 'api'
            }
          },
          // Track data freshness
          dataFreshness: {
            ...state.dataFreshness,
            [symbol]: {
              lastUpdated: new Date().toISOString(),
              source: data.source || 'api',
              isStale: data.source === 'api' && state.isRealTimeActive
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
              shown: false,
              ...notification
            },
            ...state.notifications.slice(0, 9)
          ]
        })),

      clearNotifications: () => set({ notifications: [] }),

      // Enhanced real-time actions with better error messaging
      startRealTime: async () => {
        const state = get()
        
        try {
          console.log('🚀 Starting WebSocket real-time updates...')
          
          await webSocketService.connect(['bitcoin', 'ethereum'])
          
          set({
            isRealTimeActive: true,
            connectionStatus: 'connected',
            wsErrors: []
          })
          
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
            type: 'warning',
            title: 'Using API Data',
            message: 'WebSocket unavailable. Showing latest API data (may be 1-2 minutes old)'
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
          title: '⏸️ PAUSED: Showing API Data',
          message: 'Real-time stopped. Data from last API call (may be 1-2 minutes old)'
        })
      },

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
        
        Object.entries(cryptoData).forEach(([symbol, data]) => {
          state.setCryptoData(symbol, {
            ...data,
            source: 'websocket',
            realtimeUpdate: true
          })
          
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
        
        if (statusData.status === 'error') {
          const state = get()
          set({
            reconnectAttempts: state.reconnectAttempts + 1
          })
        }
      },

      // NEW: Get data freshness info
      getDataFreshness: () => {
        const state = get()
        const freshness = {}
        
        Object.entries(state.cryptoData).forEach(([symbol, data]) => {
          if (data) {
            const lastUpdated = new Date(data.lastUpdated || Date.now())
            const ageMinutes = (Date.now() - lastUpdated.getTime()) / 60000
            const isStale = ageMinutes > 2 // Consider stale if > 2 minutes
            
            freshness[symbol] = {
              lastUpdated: data.lastUpdated,
              source: data.source || 'unknown',
              ageMinutes: ageMinutes,
              isStale: isStale,
              status: isStale ? 'stale' : ageMinutes < 0.5 ? 'fresh' : 'recent'
            }
          }
        })
        
        return freshness
      },

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

      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
    }),
    {
      name: 'crypto-store',
      partialize: (state) => ({
        cryptoData: state.cryptoData,
        refreshInterval: state.refreshInterval,
      })
    }
  )
)

// Expose store to window for testing
if (typeof window !== 'undefined') {
  window.useCryptoStore = useCryptoStore
}

export default useCryptoStore
