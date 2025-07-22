import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys, API_BASE } from '../lib/queryClient'
import useCryptoStore from '../stores/useCryptoStore.js'
import { useRealTimeData } from './useWebSocket.js'

// Enhanced crypto data hook with WebSocket integration
export const useCryptoData = (symbol) => {
  const queryClient = useQueryClient()
  const { 
    setCryptoData, 
    setLoading, 
    setError, 
    clearError,
    isRealTimeActive,
    connectionStatus 
  } = useCryptoStore()
  
  // Get real-time data from WebSocket
  const { data: realtimeData, hasRealtimeData } = useRealTimeData([symbol])
  
  const query = useQuery({
    queryKey: queryKeys.crypto[symbol] || ['crypto', symbol],
    queryFn: async () => {
      console.log(`Fetching ${symbol} data from API...`)
      
      const response = await fetch(`${API_BASE}/crypto/${symbol}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${symbol} data: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log(`${symbol} API data received:`, result)
      
      return result?.data || result
    },
    enabled: !!symbol,
    // Disable polling when WebSocket is active and providing data
    refetchInterval: (isRealTimeActive && connectionStatus === 'connected') 
      ? false  // No polling when WebSocket active
      : 120000, // 2 minutes when using API only
    staleTime: (isRealTimeActive && connectionStatus === 'connected')
      ? Infinity // WebSocket data never stale
      : 60000,   // 1 minute for API data
    onSuccess: (data) => {
      // Only update store if not using WebSocket or as fallback
      if (!isRealTimeActive || connectionStatus !== 'connected') {
        setCryptoData(symbol, {
          ...data,
          source: 'api',
          realtimeUpdate: false
        })
        clearError(symbol)
        console.log(`Updated ${symbol} from API:`, data)
      }
    },
    onError: (error) => {
      console.error(`Error fetching ${symbol}:`, error)
      setError(symbol, error.message)
    }
  })

  // Sync loading state with Zustand
  useEffect(() => {
    // Don't show loading when WebSocket is providing real-time data
    const shouldShowLoading = query.isLoading && 
      (!isRealTimeActive || !hasRealtimeData)
    setLoading(symbol, shouldShowLoading)
  }, [query.isLoading, symbol, setLoading, isRealTimeActive, hasRealtimeData])

  // Manual refresh function
  const refresh = () => {
    console.log(`Manually refreshing ${symbol} data...`)
    return queryClient.invalidateQueries({ queryKey: queryKeys.crypto[symbol] })
  }

  // Prefetch related data
  const prefetchRelated = () => {
    const relatedSymbols = symbol === 'bitcoin' ? ['ethereum'] : ['bitcoin']
    relatedSymbols.forEach(relatedSymbol => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.crypto[relatedSymbol],
        queryFn: () => fetch(`${API_BASE}/crypto/${relatedSymbol}`).then(res => res.json())
      })
    })
  }

  // Determine which data to return (WebSocket takes priority)
  const finalData = (isRealTimeActive && realtimeData[symbol]) 
    ? realtimeData[symbol]  // Use WebSocket data
    : query.data            // Fallback to API data

  return {
    data: finalData,
    isLoading: query.isLoading && (!isRealTimeActive || !hasRealtimeData),
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess || (isRealTimeActive && !!realtimeData[symbol]),
    isFetching: query.isFetching,
    refresh,
    prefetchRelated,
    // Additional metadata
    lastFetch: query.dataUpdatedAt,
    nextRefetch: query.dataUpdatedAt + (query.refetchInterval || 120000),
    // NEW: WebSocket integration info
    isRealTime: isRealTimeActive && connectionStatus === 'connected',
    dataSource: finalData?.source || 'api',
    hasWebSocketData: !!realtimeData[symbol]
  }
}

// Enhanced multiple crypto hook
export const useMultipleCrypto = (symbols = ['bitcoin', 'ethereum']) => {
  const queries = symbols.map(symbol => useCryptoData(symbol))
  const { isRealTimeActive, connectionStatus } = useCryptoStore()
  
  return {
    queries,
    isLoading: queries.some(q => q.isLoading),
    hasError: queries.some(q => q.isError),
    allSuccess: queries.every(q => q.isSuccess),
    refreshAll: () => queries.forEach(q => q.refresh()),
    data: symbols.reduce((acc, symbol, index) => {
      acc[symbol] = queries[index].data
      return acc
    }, {}),
    // NEW: Real-time integration info
    isRealTime: isRealTimeActive && connectionStatus === 'connected',
    realTimeCount: queries.filter(q => q.hasWebSocketData).length,
    allRealTime: queries.every(q => q.hasWebSocketData)
  }
}

// Enhanced real-time updates hook (now WebSocket-powered)
export const useRealTimeUpdates = () => {
  const { 
    isRealTimeActive, 
    connectionStatus,
    refreshInterval,
    forceWebSocketRefresh 
  } = useCryptoStore()
  
  const queryClient = useQueryClient()

  useEffect(() => {
    // Only use polling as fallback when WebSocket not available
    if (!isRealTimeActive || connectionStatus === 'connected') return

    console.log('Using polling fallback (WebSocket unavailable)...')
    
    const interval = setInterval(() => {
      // Invalidate all crypto queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.crypto.all })
    }, refreshInterval)

    return () => {
      console.log('Stopping polling fallback...')
      clearInterval(interval)
    }
  }, [isRealTimeActive, connectionStatus, refreshInterval, queryClient])

  return {
    isActive: isRealTimeActive,
    isWebSocket: connectionStatus === 'connected',
    interval: refreshInterval,
    forceRefresh: forceWebSocketRefresh
  }
}

// Keep existing API health hook
export const useApiHealth = () => {
  const query = useQuery({
    queryKey: queryKeys.crypto.health,
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/health`)
      if (!response.ok) {
        throw new Error('API health check failed')
      }
      return response.json()
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000
  })

  return {
    isHealthy: query.isSuccess && query.data?.success,
    healthData: query.data?.data || query.data,
    isChecking: query.isLoading,
    error: query.error,
    refresh: () => query.refetch()
  }
}
