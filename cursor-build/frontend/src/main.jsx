import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'
import App from './App.jsx'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css'
import './index.css'

// Enhanced theme with chart support
const theme = createTheme({
  colorScheme: 'dark',
  primaryColor: 'bitcoin',
  colors: {
    bitcoin: [
      '#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', 
      '#FFCA28', '#FFC107', '#FFB300', '#FFA000', 
      '#FF8F00', '#FF6F00'
    ],
    ethereum: [
      '#E8F5E8', '#C8E6C9', '#A5D6A7', '#81C784',
      '#66BB6A', '#4CAF50', '#43A047', '#388E3C',
      '#2E7D32', '#1B5E20'
    ],
    dark: [
      '#FFFFFF', '#E9E9E9', '#C1C2C5', '#A6A7AB',
      '#909296', '#5C5F66', '#373A40', '#2C2E33',
      '#25262B', '#1A1B1E'
    ]
  },
  components: {
    Card: {
      styles: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }
      }
    },
    AppShell: {
      styles: {
        header: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 193, 7, 0.4)'
        }
      }
    },
    SegmentedControl: {
      styles: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        indicator: {
          backgroundColor: 'var(--mantine-color-bitcoin-6)',
        },
        control: {
          color: '#C1C2C5',
          '&[dataActive]': {
            color: '#000000'
          }
        }
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" />
        <App />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
