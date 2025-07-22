import { Box, Group, Text, keyframes } from '@mantine/core'
import { IconCircle } from '@tabler/icons-react'

const pulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
`

const RealTimeIndicator = ({ 
  isActive = false, 
  label = "LIVE",
  size = "sm",
  showIcon = true
}) => {
  if (!isActive) return null

  return (
    <Group gap="xs" align="center">
      {showIcon && (
        <Box
          style={{
            animation: `${pulse} 2s infinite`,
            color: '#ff4444'
          }}
        >
          <IconCircle size={size === 'sm' ? 8 : 12} fill="currentColor" />
        </Box>
      )}
      
      <Text 
        size={size} 
        fw={600} 
        c="red"
        style={{
          animation: `${pulse} 2s infinite`,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {label}
      </Text>
    </Group>
  )
}

export default RealTimeIndicator
