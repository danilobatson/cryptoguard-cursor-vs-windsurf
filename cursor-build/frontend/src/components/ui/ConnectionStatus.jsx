import {
  Group,
  Badge,
  Text,
  ActionIcon,
  Tooltip,
  Box,
  Indicator,
  Button,
  Popover,
  Stack,
  Progress,
  Code
} from '@mantine/core'
import {
  IconWifi,
  IconWifiOff,
  IconRefresh,
  IconPlayerPlay,
  IconPlayerPause,
  IconSettings,
  IconCircle
} from '@tabler/icons-react'
import { useState } from 'react'
import { useConnectionStatus } from '../../hooks/useWebSocket'
import useCryptoStore from '../../stores/useCryptoStore'

const ConnectionStatus = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const { 
    isConnected, 
    status, 
    healthScore, 
    reconnectAttempts, 
    lastUpdate 
  } = useConnectionStatus()
  
  const { 
    isRealTimeActive,
    startRealTime,
    stopRealTime,
    forceWebSocketRefresh,
    connectionStatus
  } = useCryptoStore()

  // Status configurations
  const statusConfig = {
    connected: {
      color: 'green',
      icon: IconWifi,
      text: 'LIVE',
      description: 'WebSocket connected, receiving real-time updates'
    },
    connecting: {
      color: 'orange', 
      icon: IconWifi,
      text: 'CONNECTING',
      description: 'Establishing WebSocket connection...'
    },
    error: {
      color: 'red',
      icon: IconWifiOff,
      text: 'ERROR',
      description: 'Connection failed, retrying...'
    },
    disconnected: {
      color: 'gray',
      icon: IconWifiOff,
      text: 'PAUSED',
      description: 'Real-time updates paused'
    }
  }

  const config = statusConfig[status] || statusConfig.disconnected
  const StatusIcon = config.icon

  // Pulsing animation for live status
  const pulseAnimation = isConnected ? {
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': { opacity: 1 },
      '50%': { opacity: 0.5 },
      '100%': { opacity: 1 }
    }
  } : {}

  const handleToggleConnection = () => {
    if (isRealTimeActive) {
      stopRealTime()
    } else {
      startRealTime()
    }
  }

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never'
    const date = new Date(lastUpdate)
    return date.toLocaleTimeString()
  }

  return (
    <Popover 
      width={300} 
      position="bottom" 
      withArrow 
      shadow="md"
      opened={isPopoverOpen}
      onChange={setIsPopoverOpen}
    >
      <Popover.Target>
        <Group 
          gap="xs" 
          style={{ cursor: 'pointer' }}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          {/* Live indicator with pulse */}
          <Box style={pulseAnimation}>
            <Indicator
              color={config.color}
              size={8}
              processing={status === 'connecting'}
              disabled={!isConnected}
            >
              <StatusIcon size={16} color={config.color} />
            </Indicator>
          </Box>
          
          <Text size="sm" fw={600} c={config.color}>
            {config.text}
          </Text>
          
          {healthScore !== undefined && (
            <Badge 
              size="xs" 
              variant="light" 
              color={config.color}
              style={{ minWidth: 35 }}
            >
              {healthScore}%
            </Badge>
          )}
        </Group>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="md">
          {/* Connection Status Header */}
          <Group justify="space-between">
            <Text fw={600} size="sm">Connection Status</Text>
            <Badge variant="light" color={config.color}>
              {config.text}
            </Badge>
          </Group>

          {/* Status Description */}
          <Text size="xs" c="dimmed">
            {config.description}
          </Text>

          {/* Health Score */}
          {healthScore !== undefined && (
            <Box>
              <Group justify="space-between" mb={5}>
                <Text size="xs" c="dimmed">Health Score</Text>
                <Text size="xs" fw={500}>{healthScore}%</Text>
              </Group>
              <Progress 
                value={healthScore} 
                color={config.color} 
                size="sm" 
                radius="xl"
              />
            </Box>
          )}

          {/* Connection Details */}
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">Last Update</Text>
              <Code size="xs">{formatLastUpdate()}</Code>
            </Group>
            
            {reconnectAttempts > 0 && (
              <Group justify="space-between">
                <Text size="xs" c="dimmed">Reconnect Attempts</Text>
                <Badge size="xs" color="orange" variant="light">
                  {reconnectAttempts}
                </Badge>
              </Group>
            )}
          </Stack>

          {/* Controls */}
          <Group gap="xs">
            <Button
              size="xs"
              variant={isRealTimeActive ? "light" : "filled"}
              color={isRealTimeActive ? "red" : "green"}
              leftSection={
                isRealTimeActive ? 
                <IconPlayerPause size={14} /> : 
                <IconPlayerPlay size={14} />
              }
              onClick={handleToggleConnection}
              flex={1}
            >
              {isRealTimeActive ? 'Pause' : 'Go Live'}
            </Button>

            <Tooltip label="Force Refresh">
              <ActionIcon
                variant="light"
                color="blue"
                size="sm"
                onClick={forceWebSocketRefresh}
                disabled={!isConnected}
              >
                <IconRefresh size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

export default ConnectionStatus
