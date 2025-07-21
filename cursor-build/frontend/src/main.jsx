import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import App from './App.jsx'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'

// Enhanced crypto theme with better contrast
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
    // Better dark colors with more contrast
    dark: [
      '#FFFFFF', '#A6A7AB', '#909296', '#5C5F66',
      '#373A40', '#2C2E33', '#25262B', '#1A1B1E',
      '#141517', '#101113'
    ]
  },
  components: {
    Card: {
      styles: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 193, 7, 0.2)',
          boxShadow: '0 8px 32px rgba(255, 193, 7, 0.1)'
        }
      }
    },
    AppShell: {
      styles: {
        header: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 193, 7, 0.3)'
        },
        main: {
          backgroundColor: 'transparent'
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
