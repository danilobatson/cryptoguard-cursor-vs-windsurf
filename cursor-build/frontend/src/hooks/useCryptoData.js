import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys, API_BASE } from '../lib/queryClient'
import useCryptoStore from '../stores/useCryptoStore'

// Custom hook for fetching and managing crypto data
export const useCryptoData = (symbol) => {
  const queryClient = useQueryClient()
  const { setCryptoData, setLoading, setError, clearError } = useCryptoStore()
  
  const query = useQuery({
    queryKey: queryKeys.crypto[symbol] || ['crypto', symbol],
    queryFn: async () => {
      console.log(`Fetching ${symbol} data from API...`)
      
      const response = await fetch(`${API_BASE}/crypto/${symbol}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${symbol} data: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log(`${symbol} data received:`, result)
      
      // Handle different API response structures
      return result?.data || result
    },
    enabled: !!symbol, // Only run if symbol is provided
    onSuccess: (data) => {
      // Update Zustand store with fresh data
      setCryptoData(symbol, data)
      clearError(symbol)
      console.log(`Updated ${symbol} in store:`, data)
    },
    onError: (error) => {
      console.error(`Error fetching ${symbol}:`, error)
      setError(symbol, error.message)
    }
  })

  // Sync loading state with Zustand
  useEffect(() => {
    setLoading(symbol, query.isLoading)
  }, [query.isLoading, symbol, setLoading])

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

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
    refresh,
    prefetchRelated,
    // Additional metadata
    lastFetch: query.dataUpdatedAt,
    nextRefetch: query.dataUpdatedAt + (query.refetchInterval || 120000)
  }
}

// Hook for API health monitoring
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
    // Check health less frequently
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  return {
    isHealthy: query.isSuccess && query.data?.success,
    healthData: query.data?.data || query.data,
    isChecking: query.isLoading,
    error: query.error,
    refresh: () => query.refetch()
  }
}

// Hook for multiple crypto assets
export const useMultipleCrypto = (symbols = ['bitcoin', 'ethereum']) => {
  const queries = symbols.map(symbol => useCryptoData(symbol))
  
  return {
    queries,
    isLoading: queries.some(q => q.isLoading),
    hasError: queries.some(q => q.isError),
    allSuccess: queries.every(q => q.isSuccess),
    refreshAll: () => queries.forEach(q => q.refresh()),
    data: symbols.reduce((acc, symbol, index) => {
      acc[symbol] = queries[index].data
      return acc
    }, {})
  }
}

// Hook for real-time updates
export const useRealTimeUpdates = () => {
  const { isRealTimeActive, refreshInterval } = useCryptoStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isRealTimeActive) return

    console.log('Starting real-time updates...')
    
    const interval = setInterval(() => {
      // Invalidate all crypto queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.crypto.all })
    }, refreshInterval)

    return () => {
      console.log('Stopping real-time updates...')
      clearInterval(interval)
    }
  }, [isRealTimeActive, refreshInterval, queryClient])

  return {
    isActive: isRealTimeActive,
    interval: refreshInterval
  }
}
