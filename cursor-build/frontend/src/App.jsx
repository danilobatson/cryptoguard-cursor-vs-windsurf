import { useState, useEffect } from 'react'
import { 
  AppShell, 
  Group, 
  Text, 
  Button,
  Container,
  Title,
  Badge,
  Box,
  Tooltip,
  ActionIcon
} from '@mantine/core'
import { 
  IconCoin, 
  IconBell, 
  IconSettings,
  IconBrandGithub,
  IconExternalLink
} from '@tabler/icons-react'
import DashboardGrid from './components/dashboard/DashboardGrid'
import useCryptoStore from './stores/useCryptoStore'
import useNotifications from './hooks/useNotifications'

function App() {
  const { notifications, addNotification } = useCryptoStore()
  
  // Initialize notification system
  useNotifications()

  // Welcome notification on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'success',
        title: '🚀 CryptoGuard Active!',
        message: 'Live crypto data dashboard with professional state management'
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [addNotification])

  const handleSetupAlerts = () => {
    addNotification({
      type: 'info',
      title: 'Alert System Coming Soon',
      message: 'Advanced price & sentiment alerts will be available in the next update!'
    })
  }

  const handleViewGitHub = () => {
    addNotification({
      type: 'info',
      title: 'Source Code',
      message: 'GitHub repository will be available after the Cursor vs Windsurf IDE battle!'
    })
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <AppShell
      header={{ height: 80 }}
      padding="xl"
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" align="center">
            <Group gap="md">
              <IconCoin 
                size={36} 
                color="var(--mantine-color-bitcoin-6)" 
                className="crypto-pulse"
              />
              <Box>
                <Title order={1} style={{ color: '#FFFFFF' }} size="h2">
                  {import.meta.env.VITE_APP_NAME || 'CryptoGuard'}
                </Title>
                <Text size="md" fw={500} style={{ color: '#C1C2C5' }}>
                  Real-time Crypto Alert System
                </Text>
              </Box>
            </Group>
            
            <Group gap="md">
              {/* Live Status */}
              <Badge 
                color="green" 
                variant="light" 
                size="lg"
                className="crypto-pulse"
                leftSection="🟢"
              >
                PRODUCTION READY
              </Badge>

              {/* Notifications */}
              <Tooltip label={`${unreadNotifications} unread notifications`}>
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="lg"
                  style={{ position: 'relative' }}
                  onClick={() => addNotification({
                    type: 'info',
                    title: 'Notification Center',
                    message: 'Advanced notification management coming soon!'
                  })}
                >
                  <IconBell size={18} />
                  {unreadNotifications > 0 && (
                    <Badge
                      size="xs"
                      color="red"
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        minWidth: 16,
                        height: 16,
                        padding: 0
                      }}
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Badge>
                  )}
                </ActionIcon>
              </Tooltip>

              {/* Settings */}
              <Tooltip label="Dashboard settings">
                <ActionIcon 
                  variant="light" 
                  color="gray" 
                  size="lg"
                  onClick={() => addNotification({
                    type: 'info',
                    title: 'Settings Panel',
                    message: 'Dashboard customization options coming soon!'
                  })}
                >
                  <IconSettings size={18} />
                </ActionIcon>
              </Tooltip>

              {/* GitHub Link */}
              <Tooltip label="View source code">
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="lg"
                  onClick={handleViewGitHub}
                >
                  <IconBrandGithub size={18} />
                </ActionIcon>
              </Tooltip>

              {/* Main CTA */}
              <Button 
                leftSection={<IconBell size={18} />}
                variant="gradient"
                gradient={{ from: 'bitcoin', to: 'ethereum', deg: 45 }}
                size="md"
                fw={600}
                onClick={handleSetupAlerts}
              >
                Setup Alerts
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <DashboardGrid />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
