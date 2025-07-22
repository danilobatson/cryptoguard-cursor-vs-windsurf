import React from 'react'
import { Group, Badge, Text, Tooltip } from '@mantine/core'
import { IconApiApp } from '@tabler/icons-react'
import useCryptoStore from '../../stores/useCryptoStore'

const ConnectionStatus = () => {
  const { lastUpdate, isRealTimeActive } = useCryptoStore()

  return (
    <Tooltip 
      label={
        <div>
          <Text size="sm" fw={500}>Backend API Connection</Text>
          <Text size="xs">Fetching real data from LunarCrush via Cloudflare Workers</Text>
          {lastUpdate && (
            <Text size="xs">Last update: {new Date(lastUpdate).toLocaleTimeString()}</Text>
          )}
        </div>
      }
      multiline
    >
      <Group gap="xs">
        <IconApiApp size={16} color="var(--mantine-color-green-6)" />
        <Badge 
          size="sm" 
          color="green"
          variant="light"
        >
          Backend Connected
        </Badge>
      </Group>
    </Tooltip>
  )
}

export default ConnectionStatus
