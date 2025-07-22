import {
  Card,
  Group,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Box,
  Stack,
  SegmentedControl,
  NumberFormatter
} from '@mantine/core'
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconChartLine,
  IconChartArea,
  IconChartBar,
  IconRefresh,
  IconMaximize,
  IconMinimize
} from '@tabler/icons-react'
import { useState } from 'react'

const PriceChart = ({ symbol, data, isRealTime = false }) => {
  const [chartType, setChartType] = useState('area')
  const [timeframe, setTimeframe] = useState('24h')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Process data for chart metrics
  const priceMetrics = data ? {
    current: data.price || data.close || 0,
    changePercent: data.percent_change_24h || 0,
    high24h: data.price ? data.price * 1.05 : 0, // Mock high
    low24h: data.price ? data.price * 0.95 : 0,  // Mock low
    volume24h: data.volume_24h || data.volume || 0
  } : null

  // Generate mock chart data based on current price
  const generateChartData = () => {
    if (!priceMetrics) return []
    
    const points = 24
    const basePrice = priceMetrics.current
    const data = []
    
    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
      const price = basePrice * (1 + variation)
      data.push({
        time: new Date(Date.now() - (points - i) * 60 * 60 * 1000).toISOString(),
        price: price,
        volume: priceMetrics.volume24h * (0.8 + Math.random() * 0.4)
      })
    }
    return data
  }

  const chartData = generateChartData()

  const handleChartTypeChange = (value) => {
    setChartType(value)
  }

  const handleTimeframeChange = (value) => {
    setTimeframe(value)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div style={{ 
          height: isFullscreen ? 400 : 260, 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Text c="dimmed">Chart will render here</Text>
        </div>
      )
    }

    return (
      <div style={{ 
        height: isFullscreen ? 400 : 260, 
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text c="white" size="sm">
          {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart - {symbol}
        </Text>
      </div>
    )
  }

  const getPriceChangeIcon = () => {
    if (!priceMetrics) return <IconMinus size={16} />
    const { changePercent } = priceMetrics
    return changePercent > 0 ? <IconTrendingUp size={16} /> : 
           changePercent < 0 ? <IconTrendingDown size={16} /> : <IconMinus size={16} />
  }

  const getPriceChangeColor = () => {
    if (!priceMetrics) return 'gray'
    const { changePercent } = priceMetrics
    return changePercent > 0 ? 'green' : changePercent < 0 ? 'red' : 'gray'
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card withBorder>
        <Stack align="center" gap="md" style={{ minHeight: 260 }}>
          <IconChartLine size={48} color="var(--mantine-color-dimmed)" />
          <Text c="dimmed">No chart data available</Text>
        </Stack>
      </Card>
    )
  }

  return (
    <Card 
      withBorder
      className={isRealTime ? "pulse-live" : ""}
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Stack gap="md">
        {/* Chart Header */}
        <Group justify="space-between" align="center">
          <Box>
            <Group gap="sm">
              <Text size="lg" fw={700} c="white">
                {symbol.charAt(0).toUpperCase() + symbol.slice(1)} Chart
              </Text>
              {priceMetrics && (
                <Badge 
                  color={getPriceChangeColor()} 
                  variant="light" 
                  leftSection={getPriceChangeIcon()}
                >
                  {priceMetrics.changePercent > 0 ? '+' : ''}
                  {priceMetrics.changePercent.toFixed(2)}%
                </Badge>
              )}
            </Group>
          </Box>

          {/* Chart Controls */}
          <Group gap="xs">
            <Tooltip label="Refresh chart">
              <ActionIcon variant="light" color="gray" size="sm">
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={isFullscreen ? 'Minimize' : 'Fullscreen'}>
              <ActionIcon 
                variant="light" 
                color="blue" 
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Chart Type Controls */}
        <Group justify="space-between">
          <SegmentedControl
            value={chartType}
            onChange={handleChartTypeChange}
            data={[
              { 
                value: 'area', 
                label: (
                  <Group gap={4}>
                    <IconChartArea size={16} />
                    <span>Area</span>
                  </Group>
                )
              },
              { 
                value: 'line', 
                label: (
                  <Group gap={4}>
                    <IconChartLine size={16} />
                    <span>Line</span>
                  </Group>
                )
              },
              { 
                value: 'volume', 
                label: (
                  <Group gap={4}>
                    <IconChartBar size={16} />
                    <span>Volume</span>
                  </Group>
                )
              }
            ]}
            size="xs"
          />

          <SegmentedControl
            value={timeframe}
            onChange={handleTimeframeChange}
            data={[
              { value: '1h', label: '1H' },
              { value: '4h', label: '4H' },
              { value: '24h', label: '24H' },
              { value: '7d', label: '7D' }
            ]}
            size="xs"
          />
        </Group>

        {/* Chart Display */}
        <Box style={{ 
          minHeight: isFullscreen ? 400 : 260, 
          width: '100%'
        }}>
          {renderChart()}
        </Box>

        {/* Chart Statistics */}
        <Group grow>
          <Box ta="center">
            <Text size="xs" c="dimmed">Current</Text>
            <Text fw={600} c="white" size="sm">
              <NumberFormatter 
                value={priceMetrics?.current || 0} 
                prefix="$" 
                thousandSeparator 
                decimalScale={2}
              />
            </Text>
          </Box>
          <Box ta="center">
            <Text size="xs" c="dimmed">24h High</Text>
            <Text fw={600} c="green" size="sm">
              <NumberFormatter 
                value={priceMetrics?.high24h || 0} 
                prefix="$" 
                thousandSeparator 
                decimalScale={2}
              />
            </Text>
          </Box>
          <Box ta="center">
            <Text size="xs" c="dimmed">24h Low</Text>
            <Text fw={600} c="red" size="sm">
              <NumberFormatter 
                value={priceMetrics?.low24h || 0} 
                prefix="$" 
                thousandSeparator 
                decimalScale={2}
              />
            </Text>
          </Box>
          <Box ta="center">
            <Text size="xs" c="dimmed">Volume</Text>
            <Text fw={600} c="blue" size="sm">
              <NumberFormatter 
                value={priceMetrics?.volume24h || 0} 
                prefix="$" 
                thousandSeparator 
                decimalScale={0}
              />
            </Text>
          </Box>
        </Group>

        {/* Real-time Indicator */}
        {isRealTime && (
          <Group justify="center">
            <Badge variant="dot" color="green" size="sm" className="pulse-live">
              Live updates every 3 seconds
            </Badge>
          </Group>
        )}
      </Stack>
    </Card>
  )
}

export default PriceChart
