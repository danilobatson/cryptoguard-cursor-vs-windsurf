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
  Box
} from '@mantine/core'
import { 
  IconRefresh, 
  IconCheck, 
  IconX, 
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconApi
} from '@tabler/icons-react'

const ApiTest = () => {
  const [loading, setLoading] = useState(false)
  const [health, setHealth] = useState(null)
  const [bitcoinData, setBitcoinData] = useState(null)
  const [ethereumData, setEthereumData] = useState(null)
  const [error, setError] = useState(null)

  const apiBase = import.meta.env.VITE_API_BASE

  const testApiHealth = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Testing API at:', apiBase)
      
      // Test health endpoint
      const healthResponse = await fetch(`${apiBase}/health`)
      const healthData = await healthResponse.json()
      console.log('Health data:', healthData)
      setHealth(healthData)

      // Test Bitcoin data
      const bitcoinResponse = await fetch(`${apiBase}/crypto/bitcoin`)
      const bitcoinResult = await bitcoinResponse.json()
      console.log('Bitcoin data:', bitcoinResult)
      setBitcoinData(bitcoinResult?.data || bitcoinResult)

      // Test Ethereum data
      const ethereumResponse = await fetch(`${apiBase}/crypto/ethereum`)
      const ethereumResult = await ethereumResponse.json()
      console.log('Ethereum data:', ethereumResult)
      setEthereumData(ethereumResult?.data || ethereumResult)
      
    } catch (err) {
      console.error('API Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-test on component mount
  useEffect(() => {
    testApiHealth()
  }, [])

  const getPriceChangeIcon = (change) => {
    if (!change) return <IconMinus size={16} />
    return change > 0 ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />
  }

  const getPriceChangeColor = (change) => {
    if (!change) return 'gray'
    return change > 0 ? 'green' : 'red'
  }

  if (loading) {
    return (
      <Card withBorder className="crypto-pulse" style={{ textAlign: 'center' }}>
        <Stack align="center" gap="lg">
          <Loader color="bitcoin" size="lg" type="dots" />
          <Box>
            <Text size="lg" fw={500}>Connecting to Backend API...</Text>
            <Text size="sm" c="dimmed">Testing Cloudflare Workers endpoint</Text>
          </Box>
          <Progress 
            value={75} 
            color="bitcoin" 
            size="sm" 
            radius="xl" 
            striped 
            animated 
            style={{ width: '100%' }}
          />
        </Stack>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert 
        color="red" 
        icon={<IconX />}
        title="🚨 API Connection Failed"
        style={{ border: '1px solid red' }}
      >
        <Stack gap="xs">
          <Text fw={500}>Unable to connect to backend</Text>
          <Text size="sm" c="dimmed">
            Error: {error}
          </Text>
          <Text size="sm" c="dimmed">
            Endpoint: {apiBase}
          </Text>
          <Button 
            mt="sm" 
            size="sm" 
            color="red"
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={testApiHealth}
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
      {health && (
        <Alert 
          color="green" 
          icon={<IconApi />}
          title="🟢 Backend API Connected"
          style={{ border: '1px solid #4CAF50' }}
        >
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm">
                <strong>Status:</strong> {health?.data?.status || health?.status}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm">
                <strong>Version:</strong> {health?.data?.version || 'v3.0'}
              </Text>
            </Grid.Col>
          </Grid>
        </Alert>
      )}

      {/* Live Crypto Data */}
      <Grid>
        {/* Bitcoin Card */}
        {bitcoinData && (
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card 
              withBorder 
              className="crypto-glow"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                border: '1px solid rgba(255, 193, 7, 0.3)'
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="lg" fw={600} c="bitcoin">
                    ₿ Bitcoin (BTC)
                  </Text>
                  <Badge color="bitcoin" variant="light">
                    Live
                  </Badge>
                </Group>
                
                <Text size="xl" fw={700} c="white">
                  <NumberFormatter 
                    value={bitcoinData.close || bitcoinData.price || bitcoinData.market_data?.price || 0} 
                    prefix="$" 
                    thousandSeparator 
                    decimalScale={2}
                  />
                </Text>

                <Group gap="xs">
                  {bitcoinData.percent_change_24h && (
                    <Badge 
                      color={getPriceChangeColor(bitcoinData.percent_change_24h)}
                      leftSection={getPriceChangeIcon(bitcoinData.percent_change_24h)}
                      variant="light"
                    >
                      {bitcoinData.percent_change_24h > 0 ? '+' : ''}
                      {bitcoinData.percent_change_24h.toFixed(2)}%
                    </Badge>
                  )}
                </Group>

                {bitcoinData.galaxy_score && (
                  <Box>
                    <Text size="xs" c="dimmed">Galaxy Score</Text>
                    <Text fw={500} c="bitcoin">{bitcoinData.galaxy_score}/100</Text>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        )}

        {/* Ethereum Card */}
        {ethereumData && (
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card 
              withBorder
              style={{ 
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="lg" fw={600} c="ethereum">
                    Ξ Ethereum (ETH)
                  </Text>
                  <Badge color="ethereum" variant="light">
                    Live
                  </Badge>
                </Group>
                
                <Text size="xl" fw={700} c="white">
                  <NumberFormatter 
                    value={ethereumData.close || ethereumData.price || ethereumData.market_data?.price || 0} 
                    prefix="$" 
                    thousandSeparator 
                    decimalScale={2}
                  />
                </Text>

                <Group gap="xs">
                  {ethereumData.percent_change_24h && (
                    <Badge 
                      color={getPriceChangeColor(ethereumData.percent_change_24h)}
                      leftSection={getPriceChangeIcon(ethereumData.percent_change_24h)}
                      variant="light"
                    >
                      {ethereumData.percent_change_24h > 0 ? '+' : ''}
                      {ethereumData.percent_change_24h.toFixed(2)}%
                    </Badge>
                  )}
                </Group>

                {ethereumData.galaxy_score && (
                  <Box>
                    <Text size="xs" c="dimmed">Galaxy Score</Text>
                    <Text fw={500} c="ethereum">{ethereumData.galaxy_score}/100</Text>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        )}
      </Grid>

      <Divider />

      {/* Refresh Button */}
      <Group justify="center">
        <Button 
          leftSection={<IconRefresh size={16} />}
          variant="gradient"
          gradient={{ from: 'bitcoin', to: 'ethereum', deg: 45 }}
          onClick={testApiHealth}
          size="md"
        >
          Refresh Live Data
        </Button>
      </Group>
    </Stack>
  )
}

export default ApiTest
