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
import AlertModal from './components/alerts/AlertModal'
import useCryptoStore from './stores/useCryptoStore'
import useAlertStore from './stores/useAlertStore'
import useNotifications from './hooks/useNotifications.jsx'
import useAlertInitialization from './hooks/useAlertInitialization'

function App() {
  const { notifications, addNotification } = useCryptoStore()
  const { getActiveAlerts, getTriggeredAlerts } = useAlertStore()

  // Initialize notification system
  useNotifications()
  
  // Initialize alert system with persistence
  const { isInitialized, activeAlertsCount } = useAlertInitialization()

  // Welcome notification on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'success',
        title: '🚀 CryptoGuard Active!',
        message: 'Real-time crypto data and alert system ready'
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [addNotification])

  const handleSetupAlerts = () => {
    addNotification({
      type: 'info',
      title: 'Alert System Active',
      message: 'Click "Set Alert" in the dashboard or visit the Alerts tab to create price alerts!'
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
  const activeAlerts = getActiveAlerts()
  const triggeredAlerts = getTriggeredAlerts()

  return (
    <>
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
                  variant="light"
                  color="green"
                  leftSection="��"
                  size="lg"
                >
                  Live Data
                </Badge>

                {/* Alert Status - Enhanced with persistence indicator */}
                {isInitialized && activeAlerts.length > 0 && (
                  <Tooltip label={`${activeAlerts.length} active alerts, ${triggeredAlerts.length} triggered (persistent)`}>
                    <Badge
                      variant="light"
                      color={triggeredAlerts.length > 0 ? "orange" : "blue"}
                      leftSection={<IconBell size={12} />}
                      size="lg"
                    >
                      {activeAlerts.length} alerts
                    </Badge>
                  </Tooltip>
                )}

                {/* Storage Status Indicator */}
                {isInitialized && (
                  <Tooltip label="Alerts are saved and will persist across browser sessions">
                    <Badge
                      variant="light"
                      color="green"
                      size="sm"
                    >
                      💾 Saved
                    </Badge>
                  </Tooltip>
                )}

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
                      <Box
                        style={{
                          position: 'absolute',
                          top: -2,
                          right: -2,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: 'var(--mantine-color-red-6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'white',
                          fontWeight: 700
                        }}
                      >
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Box>
                    )}
                  </ActionIcon>
                </Tooltip>

                {/* Settings */}
                <Tooltip label="Settings">
                  <ActionIcon
                    variant="light"
                    color="gray"
                    size="lg"
                    onClick={() => addNotification({
                      type: 'info',
                      title: 'Settings',
                      message: 'Advanced settings panel coming in next update!'
                    })}
                  >
                    <IconSettings size={18} />
                  </ActionIcon>
                </Tooltip>

                {/* GitHub */}
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

      {/* Alert Modal - Rendered globally */}
      <AlertModal />
    </>
  )
}

export default App
