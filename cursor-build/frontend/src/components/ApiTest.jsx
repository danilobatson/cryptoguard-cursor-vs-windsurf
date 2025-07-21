import { useState, useEffect } from 'react'
import { 
  Button, 
  Group, 
  Text, 
  Card, 
  Stack,
  Badge,
  Loader,
  Alert,
  Grid,
  NumberFormatter,
  Progress,
  Divider,
  Box,
  Switch,
  ActionIcon,
  Tooltip
} from '@mantine/core'
import { 
  IconRefresh, 
  IconCheck, 
  IconX, 
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconApi,
  IconPlayerPlay,
  IconPlayerPause,
  IconSettings
} from '@tabler/icons-react'
import { useCryptoData, useApiHealth, useMultipleCrypto, useRealTimeUpdates } from '../hooks/useCryptoData'
import useCryptoStore from '../stores/useCryptoStore'

const ApiTest = () => {
  const [manualRefresh, setManualRefresh] = useState(false)
  
  // Zustand store state
  const { 
    isRealTimeActive, 
    startRealTime, 
    stopRealTime,
    refreshInterval,
    setRefreshInterval,
    notifications,
    addNotification
  } = useCryptoStore()

  // React Query hooks
  const { isHealthy, healthData, isChecking, error: healthError, refresh: refreshHealth } = useApiHealth()
  const { data: cryptoData, isLoading, hasError, refreshAll } = useMultipleCrypto(['bitcoin', 'ethereum'])
  
  // Real-time updates hook
  useRealTimeUpdates()

  const getPriceChangeIcon = (change) => {
    if (!change) return <IconMinus size={16} />
    return change > 0 ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />
  }

  const getPriceChangeColor = (change) => {
    if (!change) return 'gray'
    return change > 0 ? 'green' : 'red'
  }

  const handleManualRefresh = async () => {
    setManualRefresh(true)
    try {
      await Promise.all([refreshHealth(), refreshAll()])
      addNotification({
        type: 'success',
        title: 'Data Refreshed',
        message: 'All crypto data has been updated'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: error.message
      })
    } finally {
      setManualRefresh(false)
    }
  }

  const toggleRealTime = () => {
    if (isRealTimeActive) {
      stopRealTime()
      addNotification({
        type: 'info',
        title: 'Real-time Stopped',
        message: 'Manual refresh only'
      })
    } else {
      startRealTime()
      addNotification({
        type: 'success',
        title: 'Real-time Started',
        message: `Updates every ${refreshInterval / 1000}s`
      })
    }
  }

  if (isLoading) {
    return (
      <Card 
        withBorder 
        className="crypto-pulse" 
        style={{ 
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <Stack align="center" gap="lg">
          <Loader color="bitcoin" size="lg" type="dots" />
          <Box>
            <Text size="lg" fw={600} c="white">Loading Market Data...</Text>
            <Text size="md" style={{ color: '#C1C2C5' }}>
              Fetching live prices from backend API
            </Text>
          </Box>
          <Progress 
            value={75} 
            color="bitcoin" 
            size="md" 
            radius="xl" 
            striped 
            animated 
            style={{ width: '100%' }}
          />
        </Stack>
      </Card>
    )
  }

  if (hasError && !isHealthy) {
    return (
      <Alert 
        color="red" 
        icon={<IconX />}
        title="🚨 API Connection Failed"
        style={{ 
          border: '1px solid #f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)'
        }}
      >
        <Stack gap="xs">
          <Text fw={600} style={{ color: '#FFFFFF' }}>
            Unable to connect to backend API
          </Text>
          <Text size="sm" style={{ color: '#E9E9E9' }}>
            Error: {healthError?.message || 'Network error'}
          </Text>
          <Button 
            mt="sm" 
            size="sm" 
            color="red"
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={handleManualRefresh}
            loading={manualRefresh}
          >
            Retry Connection
          </Button>
        </Stack>
      </Alert>
    )
  }

  return (
    <Stack gap="lg">
      {/* API Health Status */}
      {isHealthy && (
        <Alert 
          color="green" 
          icon={<IconApi />}
          title="🟢 Backend API Connected"
          style={{ 
            border: '1px solid #4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.15)'
          }}
        >
          <Group justify="space-between" align="center">
            <Box>
              <Text size="sm" fw={500} style={{ color: '#FFFFFF' }}>
                Status: {healthData?.status || 'healthy'} | Version: {healthData?.version || 'v3.0'}
              </Text>
              <Text size="xs" style={{ color: '#C1C2C5' }}>
                Last updated: {new Date().toLocaleTimeString()}
              </Text>
            </Box>
            
            {/* Real-time Controls */}
            <Group gap="xs">
              <Tooltip label={isRealTimeActive ? 'Stop real-time updates' : 'Start real-time updates'}>
                <ActionIcon
                  color={isRealTimeActive ? 'red' : 'green'}
                  variant="light"
                  onClick={toggleRealTime}
                >
                  {isRealTimeActive ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                </ActionIcon>
              </Tooltip>
              
              <Badge color={isRealTimeActive ? 'green' : 'gray'} variant="light">
                {isRealTimeActive ? 'LIVE' : 'PAUSED'}
              </Badge>
            </Group>
          </Group>
        </Alert>
      )}

      {/* Live Crypto Data */}
      <Grid>
        {/* Bitcoin Card */}
        {cryptoData.bitcoin && (
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card 
              withBorder 
              className={isRealTimeActive ? "crypto-glow" : ""}
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%)',
                border: '1px solid rgba(255, 193, 7, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)'
              }}
            >
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="lg" fw={700} c="bitcoin">
                    ₿ Bitcoin (BTC)
                  </Text>
                  <Badge color="bitcoin" variant="light">
                    {isRealTimeActive ? 'LIVE' : 'CACHED'}
                  </Badge>
                </Group>
                
                <Text size="xl" fw={800} style={{ color: '#FFFFFF' }}>
                  <NumberFormatter 
                    value={cryptoData.bitcoin.close || cryptoData.bitcoin.price || 0} 
                    prefix="$" 
                    thousandSeparator 
                    decimalScale={2}
                  />
                </Text>

                <Group gap="xs">
                  {cryptoData.bitcoin.percent_change_24h && (
                    <Badge 
                      color={getPriceChangeColor(cryptoData.bitcoin.percent_change_24h)}
                      leftSection={getPriceChangeIcon(cryptoData.bitcoin.percent_change_24h)}
                      variant="light"
                      size="md"
                    >
                      {cryptoData.bitcoin.percent_change_24h > 0 ? '+' : ''}
                      {cryptoData.bitcoin.percent_change_24h.toFixed(2)}%
                    </Badge>
                  )}
                </Group>

                {cryptoData.bitcoin.galaxy_score && (
                  <Box>
                    <Text size="sm" style={{ color: '#C1C2C5' }}>Galaxy Score</Text>
                    <Text fw={600} c="bitcoin" size="lg">
                      {cryptoData.bitcoin.galaxy_score}/100
                    </Text>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        )}

        {/* Ethereum Card */}
        {cryptoData.ethereum && (
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card 
              withBorder
              className={isRealTimeActive ? "crypto-glow" : ""}
              style={{ 
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)'
              }}
            >
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="lg" fw={700} c="ethereum">
                    Ξ Ethereum (ETH)
                  </Text>
                  <Badge color="ethereum" variant="light">
                    {isRealTimeActive ? 'LIVE' : 'CACHED'}
                  </Badge>
                </Group>
                
                <Text size="xl" fw={800} style={{ color: '#FFFFFF' }}>
                  <NumberFormatter 
                    value={cryptoData.ethereum.close || cryptoData.ethereum.price || 0} 
                    prefix="$" 
                    thousandSeparator 
                    decimalScale={2}
                  />
                </Text>

                <Group gap="xs">
                  {cryptoData.ethereum.percent_change_24h && (
                    <Badge 
                      color={getPriceChangeColor(cryptoData.ethereum.percent_change_24h)}
                      leftSection={getPriceChangeIcon(cryptoData.ethereum.percent_change_24h)}
                      variant="light"
                      size="md"
                    >
                      {cryptoData.ethereum.percent_change_24h > 0 ? '+' : ''}
                      {cryptoData.ethereum.percent_change_24h.toFixed(2)}%
                    </Badge>
                  )}
                </Group>

                {cryptoData.ethereum.galaxy_score && (
                  <Box>
                    <Text size="sm" style={{ color: '#C1C2C5' }}>Galaxy Score</Text>
                    <Text fw={600} c="ethereum" size="lg">
                      {cryptoData.ethereum.galaxy_score}/100
                    </Text>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        )}
      </Grid>

      <Divider color="rgba(255, 255, 255, 0.2)" />

      {/* Enhanced Controls */}
      <Group justify="center" gap="md">
        <Button 
          leftSection={<IconRefresh size={18} />}
          variant="gradient"
          gradient={{ from: 'bitcoin', to: 'ethereum', deg: 45 }}
          onClick={handleManualRefresh}
          loading={manualRefresh}
          size="md"
          fw={600}
        >
          Refresh Data
        </Button>
        
        <Tooltip label="Configure real-time update interval">
          <ActionIcon size="lg" variant="light" color="gray">
            <IconSettings size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* State Management Debug Info (Development Only) */}
      {import.meta.env.DEV && (
        <Card withBorder style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Text size="xs" fw={600} mb="xs">Debug Info (Dev Only)</Text>
          <Text size="xs" style={{ color: '#C1C2C5' }}>
            Real-time: {isRealTimeActive ? 'Active' : 'Inactive'} | 
            Refresh Interval: {refreshInterval/1000}s | 
            Notifications: {notifications.length}
          </Text>
        </Card>
      )}
    </Stack>
  )
}

export default ApiTest
