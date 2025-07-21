// Chart data processing utilities for crypto price visualization

export const generatePriceHistory = (basePrice, dataPoints = 24) => {
  const history = []
  let currentPrice = basePrice
  const now = new Date()
  
  // Generate realistic price movement over 24 hours
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)) // hourly data
    
    // Simulate realistic price movement (random walk with slight trend)
    const volatility = 0.02 // 2% volatility per hour
    const trend = (Math.random() - 0.48) * 0.01 // Slight upward bias
    const change = (Math.random() - 0.5) * volatility + trend
    
    currentPrice *= (1 + change)
    
    history.push({
      timestamp: timestamp.toISOString(),
      time: timestamp.getHours() + ':00',
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.random() * 1000000000, // Random volume
      change: change * 100 // Percentage change
    })
  }
  
  return history
}

export const calculateMovingAverage = (data, window = 5) => {
  return data.map((item, index) => {
    if (index < window - 1) return { ...item, ma: null }
    
    const slice = data.slice(index - window + 1, index + 1)
    const average = slice.reduce((sum, point) => sum + point.price, 0) / window
    
    return { ...item, ma: parseFloat(average.toFixed(2)) }
  })
}

export const formatChartData = (cryptoData, symbol) => {
  const basePrice = cryptoData?.close || cryptoData?.price || 0
  if (!basePrice) return []
  
  const rawData = generatePriceHistory(basePrice)
  return calculateMovingAverage(rawData)
}

export const getChartConfig = (symbol) => {
  const configs = {
    bitcoin: {
      color: '#FFC107',
      gradient: ['#FFC107', '#FF8F00'],
      name: 'Bitcoin'
    },
    ethereum: {
      color: '#4CAF50', 
      gradient: ['#4CAF50', '#2E7D32'],
      name: 'Ethereum'
    }
  }
  
  return configs[symbol] || {
    color: '#2196F3',
    gradient: ['#2196F3', '#1976D2'],
    name: symbol.charAt(0).toUpperCase() + symbol.slice(1)
  }
}

export const calculatePriceMetrics = (chartData) => {
  if (!chartData || chartData.length === 0) return null
  
  const prices = chartData.map(d => d.price)
  const current = prices[prices.length - 1]
  const previous = prices[prices.length - 2] || current
  const high24h = Math.max(...prices)
  const low24h = Math.min(...prices)
  
  return {
    current,
    change: current - previous,
    changePercent: ((current - previous) / previous) * 100,
    high24h,
    low24h,
    range24h: high24h - low24h
  }
}

// Generate sample social sentiment data for charts
export const generateSentimentData = (dataPoints = 24) => {
  const data = []
  const now = new Date()
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000))
    
    data.push({
      timestamp: timestamp.toISOString(),
      time: timestamp.getHours() + ':00',
      sentiment: Math.max(0, Math.min(100, 50 + (Math.random() - 0.5) * 60)),
      mentions: Math.floor(Math.random() * 1000 + 100),
      engagement: Math.floor(Math.random() * 10000 + 1000)
    })
  }
  
  return data
}
