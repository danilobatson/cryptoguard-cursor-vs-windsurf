import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import App from './App.jsx'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'

// Enhanced theme with MUCH better text contrast
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
    // Much better dark colors with high contrast
    dark: [
      '#FFFFFF',    // 0 - brightest text
      '#E9E9E9',    // 1 - very light text  
      '#C1C2C5',    // 2 - light text
      '#A6A7AB',    // 3 - medium light
      '#909296',    // 4 - medium
      '#5C5F66',    // 5 - medium dark
      '#373A40',    // 6 - dark
      '#2C2E33',    // 7 - darker
      '#25262B',    // 8 - very dark
      '#1A1B1E'     // 9 - darkest
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
        },
        main: {
          backgroundColor: 'transparent'
        }
      }
    },
    Text: {
      styles: {
        root: {
          // Ensure all text has good contrast
          '&[data-variant="dimmed"]': {
            color: 'var(--mantine-color-dark-2) !important' // Much lighter dimmed text
          }
        }
      }
    },
    Alert: {
      styles: {
        body: {
          color: 'var(--mantine-color-dark-0) !important' // White text in alerts
        }
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
