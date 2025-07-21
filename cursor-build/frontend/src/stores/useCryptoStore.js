import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Main crypto store with real-time data management
const useCryptoStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    selectedCrypto: 'bitcoin',
    cryptoData: {
      bitcoin: null,
      ethereum: null
    },
    alerts: [],
    isRealTimeActive: false,
    lastUpdate: null,
    refreshInterval: 60000, // 60 seconds
    
    // UI State
    isDarkMode: true,
    notifications: [],
    loading: {
      bitcoin: false,
      ethereum: false,
      alerts: false
    },
    errors: {
      bitcoin: null,
      ethereum: null,
      alerts: null
    },

    // Actions
    setSelectedCrypto: (crypto) => set({ selectedCrypto: crypto }),
    
    setCryptoData: (symbol, data) => set((state) => ({
      cryptoData: {
        ...state.cryptoData,
        [symbol]: data
      },
      lastUpdate: new Date().toISOString()
    })),
    
    setLoading: (key, isLoading) => set((state) => ({
      loading: {
        ...state.loading,
        [key]: isLoading
      }
    })),
    
    setError: (key, error) => set((state) => ({
      errors: {
        ...state.errors,
        [key]: error
      }
    })),
    
    clearError: (key) => set((state) => ({
      errors: {
        ...state.errors,
        [key]: null
      }
    })),

    // Alert Management
    addAlert: (alert) => set((state) => ({
      alerts: [...state.alerts, {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        isActive: true,
        ...alert
      }]
    })),
    
    removeAlert: (id) => set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== id)
    })),
    
    toggleAlert: (id) => set((state) => ({
      alerts: state.alerts.map(alert =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    })),

    // Notification System
    addNotification: (notification) => set((state) => ({
      notifications: [...state.notifications, {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...notification
      }]
    })),
    
    removeNotification: (id) => set((state) => ({
      notifications: state.notifications.filter(notif => notif.id !== id)
    })),
    
    clearAllNotifications: () => set({ notifications: [] }),

    // Real-time Controls
    startRealTime: () => set({ isRealTimeActive: true }),
    stopRealTime: () => set({ isRealTimeActive: false }),
    
    setRefreshInterval: (interval) => set({ refreshInterval: interval }),

    // Utility Actions
    toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    
    resetStore: () => set({
      cryptoData: { bitcoin: null, ethereum: null },
      alerts: [],
      notifications: [],
      errors: { bitcoin: null, ethereum: null, alerts: null },
      loading: { bitcoin: false, ethereum: false, alerts: false }
    }),

    // Computed Values
    getTotalAlerts: () => get().alerts.length,
    getActiveAlerts: () => get().alerts.filter(alert => alert.isActive),
    getUnreadNotifications: () => get().notifications.filter(notif => !notif.read),
    
    // Get crypto data with fallback
    getCryptoData: (symbol) => {
      const data = get().cryptoData[symbol];
      return data || {
        price: 0,
        percent_change_24h: 0,
        galaxy_score: 0,
        name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
        symbol: symbol.toUpperCase()
      };
    }
  }))
)

export default useCryptoStore
