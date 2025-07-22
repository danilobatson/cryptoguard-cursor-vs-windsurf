import { useEffect } from 'react'
import useAlertStore from '../stores/useAlertStore'
import useCryptoStore from '../stores/useCryptoStore'

/**
 * Hook to initialize alert system on app startup
 * - Loads alerts from localStorage  
 * - Sets up alert checking intervals
 * - Handles browser storage events
 * - Forces immediate storage initialization
 */
const useAlertInitialization = () => {
  const { 
    initializeFromStorage, 
    checkAlerts, 
    getActiveAlerts,
    alertSettings,
    alerts 
  } = useAlertStore()
  
  const { 
    cryptoData, 
    addNotification, 
    isRealTimeActive 
  } = useCryptoStore()

  // Force initialize alerts from localStorage on first load
  useEffect(() => {
    console.log('🔄 Initializing Alert System...')
    
    // Force initialization
    try {
      initializeFromStorage()
      
      // Double-check storage is working
      const testAlert = {
        id: 'test_init_' + Date.now(),
        title: 'System Test Alert',
        symbol: 'bitcoin',
        type: 'price_above',
        targetValue: 999999,
        status: 'disabled',
        createdAt: new Date().toISOString()
      }
      
      // Test storage functionality
      const storageTest = localStorage.getItem('cryptoguard-alerts')
      if (!storageTest) {
        // Initialize empty storage structure
        const initialData = {
          state: {
            alerts: [],
            alertHistory: [],
            alertSettings: {
              soundEnabled: true,
              pushEnabled: true,
              emailEnabled: false,
              maxAlerts: 10,
              checkInterval: 30000
            }
          },
          version: 0
        }
        localStorage.setItem('cryptoguard-alerts', JSON.stringify(initialData))
        console.log('✅ Initialized empty alert storage')
      }
      
    } catch (error) {
      console.warn('Alert initialization error:', error)
    }
    
    // Welcome message for alert system
    const timer = setTimeout(() => {
      const activeAlerts = getActiveAlerts()
      addNotification({
        type: 'info',
        title: '🚨 Alert System Ready',
        message: `Alert system initialized. Storage working: ${!!localStorage.getItem('cryptoguard-alerts')}`
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [initializeFromStorage, addNotification, getActiveAlerts])

  // Check alerts when crypto data updates (real-time monitoring)
  useEffect(() => {
    if (cryptoData && Object.keys(cryptoData).length > 0 && isRealTimeActive) {
      const triggeredAlerts = checkAlerts(cryptoData)
      
      // Show notifications for newly triggered alerts
      if (triggeredAlerts && triggeredAlerts.length > 0) {
        triggeredAlerts.forEach(({ alert, triggerData, currentPrice }) => {
          // Create rich notification based on alert type
          let message = ''
          
          switch (alert.type) {
            case 'price_above':
              message = `${alert.symbol.toUpperCase()} reached $${currentPrice.toLocaleString()} (target: $${alert.targetValue.toLocaleString()})`
              break
            case 'price_below':
              message = `${alert.symbol.toUpperCase()} dropped to $${currentPrice.toLocaleString()} (target: $${alert.targetValue.toLocaleString()})`
              break
            case 'percent_change':
              message = `${alert.symbol.toUpperCase()} changed ${triggerData.currentChange?.toFixed(2)}% (target: ${alert.targetValue}%)`
              break
            case 'volume_spike':
              message = `${alert.symbol.toUpperCase()} volume spike detected: $${triggerData.currentVolume?.toLocaleString()}`
              break
            default:
              message = `${alert.symbol.toUpperCase()} alert triggered at $${currentPrice.toLocaleString()}`
          }

          addNotification({
            type: 'warning',
            title: `🚨 ${alert.title}`,
            message,
            autoClose: false // Keep alert notifications visible longer
          })

          // Play sound if enabled (browser permitting)
          if (alertSettings.soundEnabled) {
            try {
              // Create a simple beep sound using Web Audio API
              const audioContext = new (window.AudioContext || window.webkitAudioContext)()
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)
              
              oscillator.frequency.value = 800 // Alert frequency
              oscillator.type = 'sine'
              
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
              
              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + 0.5)
            } catch (error) {
              console.warn('Unable to play alert sound:', error)
            }
          }
        })
      }
    }
  }, [cryptoData, isRealTimeActive, checkAlerts, addNotification, alertSettings.soundEnabled])

  // Handle browser storage events (sync across tabs)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'cryptoguard-alerts' && event.newValue !== event.oldValue) {
        console.log('🔄 Syncing alerts from another tab...')
        initializeFromStorage()
        
        addNotification({
          type: 'info',
          title: 'Alerts Synced',
          message: 'Alert data synchronized from another tab'
        })
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [initializeFromStorage, addNotification])

  // Periodic alert checking (backup to real-time updates)
  useEffect(() => {
    if (!isRealTimeActive) return

    const interval = setInterval(() => {
      if (cryptoData && Object.keys(cryptoData).length > 0) {
        checkAlerts(cryptoData)
      }
    }, alertSettings.checkInterval || 30000) // Default 30 seconds

    return () => clearInterval(interval)
  }, [cryptoData, checkAlerts, isRealTimeActive, alertSettings.checkInterval])

  // Return some useful status information
  return {
    isInitialized: true,
    activeAlertsCount: getActiveAlerts().length,
    storageWorking: !!localStorage.getItem('cryptoguard-alerts'),
    alertsInMemory: alerts.length
  }
}

export default useAlertInitialization
