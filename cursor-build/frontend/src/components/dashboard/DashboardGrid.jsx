import { 
  Grid, 
  Stack, 
  Card, 
  Group, 
  Text, 
  Badge, 
  ActionIcon,
  Tooltip,
  Button,
  Box,
  Select,
  Switch
} from '@mantine/core'
import { 
  IconSettings, 
  IconRefresh, 
  IconPlayerPlay, 
  IconPlayerPause,
  IconLayoutDashboard,
  IconTrendingUp,
  IconBell
} from '@tabler/icons-react'
import CryptoCard from './CryptoCard'
import { useMultipleCrypto } from '../../hooks/useCryptoData'
import useCryptoStore from '../../stores/useCryptoStore'

const DashboardGrid = () => {
  const { 
    isRealTimeActive, 
    startRealTime, 
    stopRealTime,
    refreshInterval,
    setRefreshInterval,
    notifications,
    addNotification
  } = useCryptoStore()

  // Fetch multiple crypto assets
  const { 
    data: cryptoData, 
    isLoading, 
    refreshAll,
    hasError 
  } = useMultipleCrypto(['bitcoin', 'ethereum'])

  const handleToggleRealTime = () => {
    if (isRealTimeActive) {
      stopRealTime()
      addNotification({
        type: 'info',
        title: 'Real-time Updates Paused',
        message: 'Dashboard will show cached data only'
      })
    } else {
      startRealTime()
      addNotification({
        type: 'success',
        title: 'Real-time Updates Active',
        message: `Dashboard will refresh every ${refreshInterval / 1000} seconds`
      })
    }
  }

  const handleRefreshAll = async () => {
    try {
      await refreshAll()
      addNotification({
        type: 'success',
        title: 'Data Refreshed',
        message: 'All cryptocurrency data has been updated'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Unable to refresh data. Please try again.'
      })
    }
  }

  const handleIntervalChange = (value) => {
    const newInterval = parseInt(value) * 1000
    setRefreshInterval(newInterval)
    addNotification({
      type: 'info',
      title: 'Update Interval Changed',
      message: `Dashboard will now refresh every ${value} seconds`
    })
  }

  return (
    <Stack gap="xl">
      {/* Dashboard Header */}
      <Card withBorder style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
        <Group justify="space-between" align="center">
          <Group gap="md">
            <IconLayoutDashboard size={24} color="var(--mantine-color-bitcoin-6)" />
            <Box>
              <Text size="lg" fw={700} c="white">Market Overview</Text>
              <Text size="sm" c="dimmed">
                Live cryptocurrency market data powered by LunarCrush API
              </Text>
            </Box>
          </Group>

          {/* Dashboard Controls */}
          <Group gap="sm">
            <Badge 
              color={hasError ? 'red' : isLoading ? 'yellow' : 'green'} 
              variant="light"
              leftSection={hasError ? '⚠️' : isLoading ? '⏳' : '✅'}
            >
              {hasError ? 'Error' : isLoading ? 'Loading' : 'Connected'}
            </Badge>

            <Tooltip label="Refresh interval">
              <Select
                size="xs"
                value={(refreshInterval / 1000).toString()}
                onChange={handleIntervalChange}
                data={[
                  { value: '30', label: '30s' },
                  { value: '60', label: '1m' },
                  { value: '120', label: '2m' },
                  { value: '300', label: '5m' }
                ]}
                style={{ width: 80 }}
              />
            </Tooltip>

            <Tooltip label={isRealTimeActive ? 'Pause updates' : 'Start real-time'}>
              <ActionIcon
                color={isRealTimeActive ? 'red' : 'green'}
                variant="light"
                onClick={handleToggleRealTime}
              >
                {isRealTimeActive ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Refresh all data">
              <ActionIcon
                color="blue"
                variant="light"
                onClick={handleRefreshAll}
                loading={isLoading}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Dashboard settings">
              <ActionIcon color="gray" variant="light">
                <IconSettings size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Card>

      {/* Main Dashboard Grid */}
      <Grid>
        {/* Primary Assets - Larger Cards */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <CryptoCard
            symbol="bitcoin"
            data={cryptoData.bitcoin}
            isLoading={isLoading}
            isRealTime={isRealTimeActive}
            variant="detailed"
            onAddAlert={(symbol, data) => {
              addNotification({
                type: 'info',
                title: 'Alert System',
                message: `Price alert for ${data.name} will be available in next update`
              })
            }}
            onViewChart={(symbol) => {
              addNotification({
                type: 'info', 
                title: 'Chart View',
                message: `Advanced charts for ${symbol} coming in next version`
              })
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <CryptoCard
            symbol="ethereum"
            data={cryptoData.ethereum}
            isLoading={isLoading}
            isRealTime={isRealTimeActive}
            variant="detailed"
            onAddAlert={(symbol, data) => {
              addNotification({
                type: 'info',
                title: 'Alert System',
                message: `Price alert for ${data.name} will be available in next update`
              })
            }}
            onViewChart={(symbol) => {
              addNotification({
                type: 'info',
                title: 'Chart View', 
                message: `Advanced charts for ${symbol} coming in next version`
              })
            }}
          />
        </Grid.Col>

        {/* Quick Stats Row */}
        <Grid.Col span={12}>
          <Group grow>
            <Card withBorder style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', textAlign: 'center' }}>
              <Text size="xs" c="dimmed">Portfolio Value</Text>
              <Text size="lg" fw={700} c="green">$0.00</Text>
              <Text size="xs" c="dimmed">+0.00% (24h)</Text>
            </Card>

            <Card withBorder style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', textAlign: 'center' }}>
              <Text size="xs" c="dimmed">Active Alerts</Text>
              <Text size="lg" fw={700} c="blue">0</Text>
              <Text size="xs" c="dimmed">0 triggered today</Text>
            </Card>

            <Card withBorder style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', textAlign: 'center' }}>
              <Text size="xs" c="dimmed">Data Status</Text>
              <Text size="lg" fw={700} c="bitcoin">
                {isRealTimeActive ? 'LIVE' : 'CACHED'}
              </Text>
              <Text size="xs" c="dimmed">
                {isRealTimeActive ? `${refreshInterval/1000}s interval` : 'Manual refresh'}
              </Text>
            </Card>

            <Card withBorder style={{ backgroundColor: 'rgba(156, 39, 176, 0.1)', textAlign: 'center' }}>
              <Text size="xs" c="dimmed">API Health</Text>
              <Text size="lg" fw={700} c="grape">100%</Text>
              <Text size="xs" c="dimmed">All systems operational</Text>
            </Card>
          </Group>
        </Grid.Col>

        {/* Action Cards */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card 
            withBorder 
            style={{ 
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => addNotification({
              type: 'info',
              title: 'Alert Center',
              message: 'Alert management system coming soon!'
            })}
          >
            <Stack align="center" gap="sm">
              <IconBell size={32} color="var(--mantine-color-bitcoin-6)" />
              <Text fw={600} c="bitcoin">Set Alert</Text>
              <Text size="sm" c="dimmed" ta="center">
                Create price or sentiment alerts
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card 
            withBorder 
            style={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => addNotification({
              type: 'info',
              title: 'Portfolio',
              message: 'Portfolio tracking coming in next update!'
            })}
          >
            <Stack align="center" gap="sm">
              <IconTrendingUp size={32} color="var(--mantine-color-ethereum-6)" />
              <Text fw={600} c="ethereum">Portfolio</Text>
              <Text size="sm" c="dimmed" ta="center">
                Track your crypto holdings
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card 
            withBorder 
            style={{ 
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => window.open('https://lunarcrush.com', '_blank')}
          >
            <Stack align="center" gap="sm">
              <Text size="xl" fw={700}>🚀</Text>
              <Text fw={600} c="blue">LunarCrush</Text>
              <Text size="sm" c="dimmed" ta="center">
                Powered by social intelligence
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card 
            withBorder 
            style={{ 
              backgroundColor: 'rgba(156, 39, 176, 0.1)',
              border: '1px solid rgba(156, 39, 176, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => addNotification({
              type: 'info',
              title: 'Analytics',
              message: 'Advanced analytics dashboard coming soon!'
            })}
          >
            <Stack align="center" gap="sm">
              <Text size="xl" fw={700}>📊</Text>
              <Text fw={600} c="grape">Analytics</Text>
              <Text size="sm" c="dimmed" ta="center">
                Deep market insights
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Debug Panel (Development Only) */}
      {import.meta.env.DEV && (
        <Card withBorder style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <Group justify="space-between">
            <Text size="xs" fw={600} c="dimmed">Developer Debug Panel</Text>
            <Badge variant="light" size="xs">DEV MODE</Badge>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Real-time: {isRealTimeActive ? '✅' : '❌'} | 
            Interval: {refreshInterval/1000}s | 
            Notifications: {notifications.length} | 
            Loading: {isLoading ? '⏳' : '✅'} |
            Error: {hasError ? '❌' : '✅'}
          </Text>
        </Card>
      )}
    </Stack>
  )
}

export default DashboardGrid
