import { Box, Group, Text } from '@mantine/core'
import { IconCircle } from '@tabler/icons-react'

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
        <Box className="pulse-dot">
          <IconCircle size={size === 'sm' ? 8 : 12} fill="currentColor" />
        </Box>
      )}
      
      <Text 
        size={size} 
        fw={600} 
        c="red"
        className="pulse-live"
        style={{
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
