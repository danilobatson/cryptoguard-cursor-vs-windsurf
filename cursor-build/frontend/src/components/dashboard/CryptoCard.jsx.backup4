import {
  Card,
  Group,
  Text,
  Badge,
  Button,
  Box,
  Stack,
  NumberFormatter,
  Tooltip,
  ActionIcon
} from '@mantine/core'
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconBell,
  IconRefresh,
  IconWifi,
  IconCloudDownload
} from '@tabler/icons-react'
import useAlertStore from '../../stores/useAlertStore'
import useCryptoStore from '../../stores/useCryptoStore'
import RealTimeIndicator from '../ui/RealTimeIndicator'

const CryptoCard = ({ 
  symbol, 
  data, 
  isRealTime = false, 
  showRealTimeIndicator = true 
}) => {
  const { openAlertModal, addNotification } = useAlertStore()
  const { forceWebSocketRefresh } = useCryptoStore()

  if (!data) {
    return (
      <Card
        padding="lg"
        radius="md"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: 200
        }}
      >
        <Stack justify="center" align="center" h={150}>
          <Text c="dimmed">Loading {symbol}...</Text>
        </Stack>
      </Card>
    )
  }

  const price = data.price || data.close || 0
  const change24h = data.percent_change_24h || 0
  const volume = data.volume_24h || data.volume || 0
  const marketCap = data.market_cap || 0
  const galaxyScore = data.galaxy_score || 0

  const isPositive = change24h > 0
  const isNegative = change24h < 0
  const changeColor = isPositive ? 'green' : isNegative ? 'red' : 'gray'
  const TrendIcon = isPositive ? IconTrendingUp : isNegative ? IconTrendingDown : IconMinus

  const handleCreateAlert = () => {
    openAlertModal(symbol, price)
    addNotification({
      type: 'info',
      title: 'Alert Setup',
      message: `Setting up price alert for ${symbol.toUpperCase()}`
    })
  }

  const handleForceRefresh = () => {
    if (isRealTime) {
      forceWebSocketRefresh()
    }
  }

  const formatCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const getDataSourceIcon = () => {
    if (isRealTime) {
      return <IconWifi size={14} color="green" />
    }
    return <IconCloudDownload size={14} color="gray" />
  }

  const getDataSourceText = () => {
    if (isRealTime) return 'WebSocket'
    return 'API'
  }

  return (
    <Card
      padding="lg"
      radius="md"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative'
      }}
    >
      {/* Header with Symbol and Real-time Indicator */}
      <Group justify="space-between" align="center" mb="md">
        <Group gap="md">
          <Box>
            <Text fw={700} size="lg" c="white" tt="uppercase">
              {symbol}
            </Text>
            <Group gap="xs" mt={2}>
              <Tooltip label={`Data source: ${getDataSourceText()}`}>
                <Group gap={4}>
                  {getDataSourceIcon()}
                  <Text size="xs" c="dimmed">
                    {getDataSourceText()}
                  </Text>
                </Group>
              </Tooltip>
              
              {showRealTimeIndicator && isRealTime && (
                <RealTimeIndicator 
                  isActive={true}
                  label="LIVE"
                  size="xs"
                  showIcon={false}
                />
              )}
            </Group>
          </Box>
        </Group>

        <Group gap="xs">
          {/* Force Refresh for WebSocket */}
          {isRealTime && (
            <Tooltip label="Force WebSocket refresh">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={handleForceRefresh}
              >
                <IconRefresh size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {/* Create Alert */}
          <Tooltip label="Create price alert">
            <ActionIcon
              variant="subtle"
              color="orange"
              size="sm"
              onClick={handleCreateAlert}
            >
              <IconBell size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Price Display */}
      <Stack gap="xs" mb="lg">
        <Group align="baseline" gap="md">
          <NumberFormatter
            value={price}
            prefix="$"
            thousandSeparator
            decimalScale={2}
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'white'
            }}
          />
          
          {showRealTimeIndicator && isRealTime && (
            <Badge 
              size="xs" 
              color="green" 
              variant="light"
              style={{ animation: 'pulse 2s infinite' }}
            >
              LIVE
            </Badge>
          )}
        </Group>

        {/* 24h Change */}
        <Group gap="xs">
          <TrendIcon size={16} color={changeColor} />
          <Text 
            fw={600} 
            c={changeColor}
            style={{ fontSize: '0.9rem' }}
          >
            {change24h > 0 ? '+' : ''}{change24h.toFixed(2)}%
          </Text>
          <Text size="sm" c="dimmed">
            24h
          </Text>
        </Group>
      </Stack>

      {/* Additional Metrics */}
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Volume (24h)</Text>
          <Text size="sm" c="white" fw={500}>
            {formatCurrency(volume)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Market Cap</Text>
          <Text size="sm" c="white" fw={500}>
            {formatCurrency(marketCap)}
          </Text>
        </Group>

        {galaxyScore > 0 && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Galaxy Score</Text>
            <Badge 
              size="sm" 
              color={galaxyScore > 70 ? 'green' : galaxyScore > 40 ? 'orange' : 'red'}
              variant="light"
            >
              {galaxyScore.toFixed(1)}
            </Badge>
          </Group>
        )}

        {/* Last Update */}
        {data.lastUpdated && (
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Last Updated</Text>
            <Text size="xs" c="dimmed">
              {new Date(data.lastUpdated).toLocaleTimeString()}
            </Text>
          </Group>
        )}
      </Stack>

      {/* Quick Alert Button */}
      <Button
        fullWidth
        variant="light"
        color="orange"
        mt="md"
        leftSection={<IconBell size={16} />}
        onClick={handleCreateAlert}
      >
        Set Alert
      </Button>
    </Card>
  )
}

export default CryptoCard
