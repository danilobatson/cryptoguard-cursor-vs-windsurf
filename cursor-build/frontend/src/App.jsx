import { useState, useEffect } from 'react'
import './debug/window-exposure.js'
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
import ConnectionStatus from './components/ui/ConnectionStatus'

function App() {
  const { notifications, addNotification } = useCryptoStore()
  const { getActiveAlerts } = useAlertStore()

  // Initialize notification system
  useNotifications()

  // Initialize alert system with persistence
  const { isInitialized, activeAlertsCount } = useAlertInitialization()

  // Welcome notification on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'success',
        title: '🚀 CryptoGuard v5.3 Active!',
        message: 'Real-time WebSocket integration ready. Click GO LIVE for instant updates!'
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [addNotification])

  const handleSetupAlerts = () => {
    addNotification({
      type: 'info',
      title: 'Alert System Active',
      message: 'Click "Set Alert" on any crypto card or visit the Alerts tab!'
    })
  }

  const handleViewGitHub = () => {
    addNotification({
      type: 'info',
      title: 'Cursor vs Windsurf IDE Battle',
      message: 'Source code available after the AI IDE comparison is complete!'
    })
  }

  return (
    <AppShell padding="md">
      <AppShell.Header height={70}>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" align="center">
            {/* Logo Section */}
            <Group gap="md">
              <Box
                style={{
                  background: 'linear-gradient(135deg, #F7931A 0%, #FFB84D 100%)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconCoin size={28} color="white" />
              </Box>

              <Box>
                <Title order={2} size="h3" fw={700} c="white">
                  CryptoGuard
                </Title>
                <Text size="xs" c="dimmed">
                  Real-time WebSocket Alert System
                </Text>
              </Box>
            </Group>

            {/* Center Section - Connection Status */}
            <ConnectionStatus />

            {/* Right Section */}
            <Group gap="md">
              {/* Alert Counter */}
              <Tooltip label="Active Alerts" position="bottom">
                <ActionIcon
                  variant="light"
                  color="orange"
                  size="lg"
                  onClick={handleSetupAlerts}
                >
                  <IconBell size={18} />
                  {activeAlertsCount > 0 && (
                    <Badge
                      size="xs"
                      variant="filled"
                      color="red"
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        minWidth: 16,
                        height: 16,
                        padding: 0,
                        fontSize: '10px'
                      }}
                    >
                      {activeAlertsCount}
                    </Badge>
                  )}
                </ActionIcon>
              </Tooltip>

              {/* Settings */}
              <Tooltip label="Settings" position="bottom">
                <ActionIcon variant="light" color="gray" size="lg">
                  <IconSettings size={18} />
                </ActionIcon>
              </Tooltip>

              {/* GitHub */}
              <Tooltip label="View Source Code" position="bottom">
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="lg"
                  onClick={handleViewGitHub}
                >
                  <IconBrandGithub size={18} />
                </ActionIcon>
              </Tooltip>

              {/* Portfolio */}
              <Tooltip label="My Portfolio" position="bottom">
                <ActionIcon
                  component="a"
                  href="https://danilobatson.github.io/"
                  target="_blank"
                  variant="light"
                  color="violet"
                  size="lg"
                >
                  <IconExternalLink size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <DashboardGrid />
          <AlertModal />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
