// Browser notification utilities for CryptoGuard alerts

export class NotificationManager {
  constructor() {
    this.permission = null
    this.init()
  }

  async init() {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications')
      return false
    }

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      this.permission = await Notification.requestPermission()
    } else {
      this.permission = Notification.permission
    }

    return this.permission === 'granted'
  }

  async requestPermission() {
    if (!('Notification' in window)) return false
    
    try {
      this.permission = await Notification.requestPermission()
      return this.permission === 'granted'
    } catch (error) {
      console.warn('Failed to request notification permission:', error)
      return false
    }
  }

  showAlert(alert, triggerData) {
    if (this.permission !== 'granted') return

    const { title, symbol, type } = alert
    const price = triggerData.currentPrice || 0
    
    // Create notification based on alert type
    let notificationTitle = `🚨 ${title}`
    let notificationBody = `${symbol.toUpperCase()}: $${price.toLocaleString()}`
    let icon = '/crypto-icon.png' // Optional: add icon to public folder

    // Customize based on alert type
    switch (type) {
      case 'price_above':
        notificationTitle = `📈 ${symbol.toUpperCase()} Price Alert`
        notificationBody = `Price reached $${price.toLocaleString()} (target: $${alert.targetValue.toLocaleString()})`
        break
      case 'price_below':
        notificationTitle = `📉 ${symbol.toUpperCase()} Price Alert`
        notificationBody = `Price dropped to $${price.toLocaleString()} (target: $${alert.targetValue.toLocaleString()})`
        break
      case 'moving_average':
        notificationTitle = `📊 ${symbol.toUpperCase()} MA Cross`
        notificationBody = `Price crossed ${alert.direction} ${alert.period}-day MA at $${price.toLocaleString()}`
        break
      case 'volatility_spike':
        notificationTitle = `⚡ ${symbol.toUpperCase()} Volatility Spike`
        notificationBody = `High volatility detected (${alert.volatilityMultiplier}x average)`
        break
      case 'bullish_breakout':
        notificationTitle = `🚀 ${symbol.toUpperCase()} Bullish Breakout`
        notificationBody = `Multi-signal bullish breakout confirmed at $${price.toLocaleString()}`
        break
      default:
        notificationBody = `Alert triggered at $${price.toLocaleString()}`
    }

    try {
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
        icon: icon,
        badge: icon,
        tag: `crypto-alert-${alert.id}`, // Prevent duplicate notifications
        requireInteraction: true, // Keep notification until user interacts
        timestamp: Date.now()
      })

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close()
      }, 10000)

      // Handle click to focus window
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return true
    } catch (error) {
      console.warn('Failed to show notification:', error)
      return false
    }
  }

  showTestNotification() {
    if (this.permission !== 'granted') {
      return this.requestPermission()
    }

    this.showAlert(
      {
        id: 'test',
        title: 'Test Alert',
        symbol: 'bitcoin',
        type: 'price_above',
        targetValue: 100000
      },
      {
        currentPrice: 100500
      }
    )

    return true
  }
}

// Create global instance
export const notificationManager = new NotificationManager()

// Utility functions
export const requestNotificationPermission = () => {
  return notificationManager.requestPermission()
}

export const showAlertNotification = (alert, triggerData) => {
  return notificationManager.showAlert(alert, triggerData)
}

export const testNotification = () => {
  return notificationManager.showTestNotification()
}
