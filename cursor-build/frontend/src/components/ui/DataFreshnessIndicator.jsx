import { Group, Badge, Text, Tooltip } from '@mantine/core'
import { IconClock, IconWifi, IconCloudDownload, IconAlertTriangle } from '@tabler/icons-react'
import useCryptoStore from '../../stores/useCryptoStore'

const DataFreshnessIndicator = ({ symbol, data }) => {
  const { getDataFreshness, isRealTimeActive, connectionStatus } = useCryptoStore()
  
  if (!data) return null

  const lastUpdated = new Date(data.lastUpdated || Date.now())
  const ageMinutes = (Date.now() - lastUpdated.getTime()) / 60000
  const source = data.source || 'api'
  
  const getFreshnessConfig = () => {
    if (source === 'websocket' && connectionStatus === 'connected') {
      return {
        color: 'green',
        icon: IconWifi,
        label: 'LIVE',
        description: 'Real-time WebSocket data'
      }
    }
    
    if (ageMinutes < 1) {
      return {
        color: 'green',
        icon: IconCloudDownload,
        label: 'FRESH',
        description: `API data, ${Math.round(ageMinutes * 60)}s old`
      }
    }
    
    if (ageMinutes < 5) {
      return {
        color: 'yellow',
        icon: IconClock,
        label: `${Math.round(ageMinutes)}m`,
        description: `API data, ${Math.round(ageMinutes)} minutes old`
      }
    }
    
    return {
      color: 'red',
      icon: IconAlertTriangle,
      label: 'STALE',
      description: `Data may be outdated (${Math.round(ageMinutes)} minutes old)`
    }
  }

  const config = getFreshnessConfig()
  const IconComponent = config.icon

  return (
    <Tooltip label={config.description} position="top">
      <Badge
        size="xs"
        color={config.color}
        variant="light"
        leftSection={<IconComponent size={12} />}
        style={{ cursor: 'help' }}
      >
        {config.label}
      </Badge>
    </Tooltip>
  )
}

export default DataFreshnessIndicator
