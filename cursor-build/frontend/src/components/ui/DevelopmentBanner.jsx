import { Alert, Group, Text, Badge } from '@mantine/core'
import { IconFlask } from '@tabler/icons-react'

const DevelopmentBanner = () => {
  // Only show in development
  if (!import.meta.env.DEV) return null

  return (
    <Alert 
      icon={<IconFlask size={16} />}
      color="blue"
      variant="light"
      mb="md"
    >
      <Group justify="space-between">
        <Text size="sm">
          🧪 Development Mode: Using mock WebSocket data for demonstration
        </Text>
        <Badge size="sm" color="blue" variant="light">
          DEMO
        </Badge>
      </Group>
    </Alert>
  )
}

export default DevelopmentBanner
