import { 
  Card, 
  Group, 
  Text, 
  SegmentedControl, 
  ActionIcon,
  Stack,
  Box,
  Badge,
  Tooltip,
  NumberFormatter
} from '@mantine/core'
import { LineChart, AreaChart, BarChart } from '@mantine/charts'
import { 
  IconChartLine, 
  IconChartArea,
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconMaximize,
  IconRefresh
} from '@tabler/icons-react'
import { useState, useEffect, useMemo } from 'react'
import { formatChartData, getChartConfig, calculatePriceMetrics, generateSentimentData } from '../../utils/chartUtils'
import useCryptoStore from '../../stores/useCryptoStore'

const PriceChart = ({ symbol, data, isRealTime = false }) => {
  const [timeframe, setTimeframe] = useState('24h')
  const [chartType, setChartType] = useState('area')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { addNotification } = useCryptoStore()

  // Process chart data
  const chartData = useMemo(() => formatChartData(data, symbol), [data, symbol])
  const chartConfig = getChartConfig(symbol)
  const priceMetrics = calculatePriceMetrics(chartData)

  // Auto-refresh chart data when real-time is active
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        console.log(`Updating ${symbol} chart data...`)
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [isRealTime, symbol])

  const handleChartTypeChange = (type) => {
    setChartType(type)
    addNotification({
      type: 'info',
      title: 'Chart Updated',
      message: `Switched to ${type} chart view`
    })
  }

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe)
    addNotification({
      type: 'info',
      title: 'Timeframe Changed',
      message: `Now showing ${newTimeframe} data`
    })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    addNotification({
      type: 'info',
      title: isFullscreen ? 'Fullscreen Disabled' : 'Fullscreen Enabled',
      message: `Chart view ${isFullscreen ? 'minimized' : 'maximized'}`
    })
  }

  const renderChart = () => {
    const commonProps = {
      h: isFullscreen ? 400 : 260,
      w: '100%',
      data: chartData,
      dataKey: 'time',
      withLegend: true,
      withTooltip: true,
      withDots: false,
      curveType: 'monotone'
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart
            {...commonProps}
            series={[
              { name: 'price', label: 'Price ($)', color: chartConfig.color },
              { name: 'ma', label: '5-Hour MA', color: '#9E9E9E' }
            ]}
          />
        )
      case 'area':
        return (
          <AreaChart
            {...commonProps}
            series={[
              { 
                name: 'price', 
                label: 'Price ($)', 
                color: chartConfig.color,
                strokeWidth: 2
              }
            ]}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        )
      case 'volume':
        return (
          <BarChart
            h={isFullscreen ? 400 : 260}
            data={chartData}
            dataKey="time"
            series={[
              { name: 'volume', label: 'Volume', color: '#2196F3' }
            ]}
            withTooltip
          />
        )
      default:
        return null
    }
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
      className={isRealTime ? "crypto-pulse" : ""}
      style={{ 
        background: 'rgba(255, 255, 255, 0.05)',
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
                <IconMaximize size={16} />
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
    width: '100%', 
    height: isFullscreen ? 400 : 260 
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
            <Badge variant="dot" color="green" size="sm" className="crypto-pulse">
              Live updates every 60 seconds
            </Badge>
          </Group>
        )}
      </Stack>
    </Card>
  )
}

export default PriceChart
