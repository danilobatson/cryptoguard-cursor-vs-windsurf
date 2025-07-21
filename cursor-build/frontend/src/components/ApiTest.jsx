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
  NumberFormatter
} from '@mantine/core'
import { IconRefresh, IconCheck, IconX } from '@tabler/icons-react'

const ApiTest = () => {
  const [loading, setLoading] = useState(false)
  const [health, setHealth] = useState(null)
  const [bitcoinData, setBitcoinData] = useState(null)
  const [error, setError] = useState(null)

  const apiBase = import.meta.env.VITE_API_BASE

  const testApiHealth = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test health endpoint
      const healthResponse = await fetch(`${apiBase}/health`)
      const healthData = await healthResponse.json()
      setHealth(healthData)

      // Test Bitcoin data
      const bitcoinResponse = await fetch(`${apiBase}/crypto/bitcoin`)
      const bitcoinResult = await bitcoinResponse.json()
      setBitcoinData(bitcoinResult)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-test on component mount
  useEffect(() => {
    testApiHealth()
  }, [])

  if (loading) {
    return (
      <Stack align="center" gap="md">
        <Loader color="bitcoin" size="md" />
        <Text>Testing API connection...</Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Alert color="red" icon={<IconX />}>
        <Text fw={500}>Connection Failed</Text>
        <Text size="sm">{error}</Text>
        <Button 
          mt="sm" 
          size="sm" 
          leftSection={<IconRefresh size={16} />}
          onClick={testApiHealth}
        >
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <Stack gap="md">
      {/* Health Status */}
      {health && (
        <Card withBorder>
          <Group justify="space-between">
            <Text fw={500}>API Health</Text>
            <Badge color="green" leftSection={<IconCheck size={12} />}>
              {health.status}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">Version: {health.version}</Text>
          <Text size="sm" c="dimmed">Uptime: {health.uptime}</Text>
        </Card>
      )}

      {/* Bitcoin Data */}
      {bitcoinData && (
        <Grid>
          <Grid.Col span={6}>
            <Card withBorder>
              <Text size="sm" c="dimmed">Bitcoin Price</Text>
              <Text size="xl" fw={700} c="bitcoin">
                <NumberFormatter 
                  value={bitcoinData.price} 
                  prefix="$" 
                  thousandSeparator 
                  decimalScale={2}
                />
              </Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Card withBorder>
              <Text size="sm" c="dimmed">Galaxy Score</Text>
              <Text size="xl" fw={700} c="ethereum">
                {bitcoinData.galaxy_score || 'N/A'}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      <Group justify="center">
        <Button 
          leftSection={<IconRefresh size={16} />}
          variant="light"
          color="bitcoin"
          onClick={testApiHealth}
        >
          Refresh Data
        </Button>
      </Group>
    </Stack>
  )
}

export default ApiTest
