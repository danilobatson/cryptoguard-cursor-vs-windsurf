import { 
  Card, 
  Group, 
  Text, 
  Badge, 
  Stack, 
  Box, 
  Progress, 
  ActionIcon,
  Tooltip,
  NumberFormatter,
  RingProgress,
  ThemeIcon,
  Divider
} from '@mantine/core'
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconMinus,
  IconStar,
  IconBell,
  IconExternalLink,
  IconChartLine
} from '@tabler/icons-react'
import { useState } from 'react'
import useCryptoStore from '../../stores/useCryptoStore'
import { CryptoCardSkeleton } from '../ui/Skeleton'

const CryptoCard = ({ 
  symbol, 
  data, 
  isLoading, 
  isRealTime = false,
  onAddAlert,
  onViewChart,
  variant = 'default' // 'default', 'compact', 'detailed'
}) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const { addNotification } = useCryptoStore()

  // Sophisticated skeleton loading state
  if (isLoading || !data) {
    return <CryptoCardSkeleton variant={variant} />
  }

  // Calculate price metrics
  const price = data.close || data.price || 0
  const change24h = data.percent_change_24h || 0
  const galaxyScore = data.galaxy_score || 0
  const volume24h = data.volume_24h || 0
  const marketCap = data.market_cap || 0
  const socialDominance = data.social_dominance || 0

  // Determine colors and icons
  const isPositive = change24h > 0
  const isNegative = change24h < 0
  const changeColor = isPositive ? 'green' : isNegative ? 'red' : 'gray'
  const ChangeIcon = isPositive ? IconTrendingUp : isNegative ? IconTrendingDown : IconMinus

  // Symbol-specific styling
  const symbolColors = {
    bitcoin: { primary: 'bitcoin', secondary: '#FF8F00', gradient: ['#FFC107', '#FF8F00'] },
    ethereum: { primary: 'ethereum', secondary: '#2E7D32', gradient: ['#4CAF50', '#2E7D32'] }
  }
  const colors = symbolColors[symbol] || { primary: 'blue', secondary: '#1976D2', gradient: ['#2196F3', '#1976D2'] }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    addNotification({
      type: isFavorite ? 'info' : 'success',
      title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      message: `${data.name || symbol} ${isFavorite ? 'removed from' : 'added to'} your watchlist`
    })
  }

  const handleAddAlert = () => {
    if (onAddAlert) {
      onAddAlert(symbol, data)
    } else {
      addNotification({
        type: 'info',
        title: 'Alert System',
        message: 'Alert creation will be available soon!'
      })
    }
  }

  return (
    <Card 
      withBorder
      className={isRealTime ? "crypto-glow" : ""}
      style={{ 
        background: `linear-gradient(135deg, rgba(${colors.secondary.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.15) 0%, rgba(${colors.secondary.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.08) 100%)`,
        border: `1px solid rgba(${colors.secondary.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.4)`,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        transition: 'all 0.3s ease'
      }}
    >
      <Stack gap="md">
        {/* Header with Symbol and Controls */}
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <ThemeIcon 
              size="lg" 
              variant="gradient" 
              gradient={{ from: colors.gradient[0], to: colors.gradient[1], deg: 45 }}
            >
              {symbol === 'bitcoin' ? '₿' : symbol === 'ethereum' ? 'Ξ' : symbol[0].toUpperCase()}
            </ThemeIcon>
            <Box>
              <Text size="lg" fw={700} c={colors.primary}>
                {data.name || symbol.charAt(0).toUpperCase() + symbol.slice(1)} ({symbol.toUpperCase()})
              </Text>
              <Badge color={colors.primary} variant="light" size="sm">
                {isRealTime ? 'LIVE' : 'CACHED'}
              </Badge>
            </Box>
          </Group>

          <Group gap="xs">
            <Tooltip label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <ActionIcon
                variant={isFavorite ? 'filled' : 'subtle'}
                color="yellow"
                onClick={handleToggleFavorite}
                size="sm"
              >
                <IconStar size={16} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="Set price alert">
              <ActionIcon variant="subtle" color={colors.primary} onClick={handleAddAlert} size="sm">
                <IconBell size={16} />
              </ActionIcon>
            </Tooltip>
            
            {onViewChart && (
              <Tooltip label="View chart">
                <ActionIcon variant="subtle" color={colors.primary} onClick={() => onViewChart(symbol)} size="sm">
                  <IconChartLine size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        {/* Price Display */}
        <Box>
          <Text size="xl" fw={800} style={{ color: '#FFFFFF', lineHeight: 1.2 }}>
            <NumberFormatter 
              value={price} 
              prefix="$" 
              thousandSeparator 
              decimalScale={2}
            />
          </Text>
          
          <Group gap="xs" mt="xs">
            <Badge 
              color={changeColor}
              leftSection={<ChangeIcon size={14} />}
              variant="light"
              size="md"
            >
              {change24h > 0 ? '+' : ''}{change24h.toFixed(2)}%
            </Badge>
            <Text size="xs" c="dimmed">24h change</Text>
          </Group>
        </Box>

        {/* Metrics Grid */}
        <Group grow>
          {/* Galaxy Score */}
          <Box>
            <Group gap="xs" mb={4}>
              <Text size="xs" c="dimmed">Galaxy Score</Text>
              <Tooltip label="LunarCrush proprietary metric combining price performance and social activity">
                <Text size="xs" c="dimmed" style={{ cursor: 'help' }}>ⓘ</Text>
              </Tooltip>
            </Group>
            <Group gap="sm" align="center">
              <RingProgress
                size={40}
                thickness={4}
                sections={[{ value: galaxyScore, color: colors.primary }]}
              />
              <Text fw={600} c={colors.primary}>{galaxyScore}/100</Text>
            </Group>
          </Box>

          {/* Social Dominance */}
          {socialDominance > 0 && (
            <Box>
              <Text size="xs" c="dimmed" mb={4}>Social Dominance</Text>
              <Text fw={600} c="white">{socialDominance.toFixed(1)}%</Text>
              <Progress value={socialDominance} size="xs" color={colors.primary} />
            </Box>
          )}
        </Group>

        {/* Additional Metrics (Detailed Variant) */}
        {variant === 'detailed' && (
          <>
            <Divider color="rgba(255, 255, 255, 0.1)" />
            <Group grow>
              <Box>
                <Text size="xs" c="dimmed">Market Cap</Text>
                <Text size="sm" fw={600} c="white">
                  <NumberFormatter 
                    value={marketCap} 
                    prefix="$" 
                    thousandSeparator 
                    suffix={marketCap > 1e12 ? 'T' : marketCap > 1e9 ? 'B' : 'M'}
                    decimalScale={1}
                  />
                </Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">24h Volume</Text>
                <Text size="sm" fw={600} c="white">
                  <NumberFormatter 
                    value={volume24h} 
                    prefix="$" 
                    thousandSeparator 
                    suffix={volume24h > 1e9 ? 'B' : 'M'}
                    decimalScale={1}
                  />
                </Text>
              </Box>
            </Group>
          </>
        )}

        {/* Real-time Indicator */}
        {isRealTime && (
          <Group justify="center">
            <Badge variant="dot" color="green" size="sm">
              Updates every 60s
            </Badge>
          </Group>
        )}
      </Stack>
    </Card>
  )
}

export default CryptoCard
