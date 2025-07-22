import { useEffect } from 'react'
import { notifications } from '@mantine/notifications'
import { 
  IconCheck, 
  IconX, 
  IconInfoCircle, 
  IconAlertTriangle 
} from '@tabler/icons-react'
import useCryptoStore from '../stores/useCryptoStore'

// Hook to integrate Zustand notifications with Mantine notifications
export const useNotifications = () => {
  const { notifications: storeNotifications, removeNotification } = useCryptoStore()

  useEffect(() => {
    // Process new notifications
    storeNotifications.forEach((notification) => {
      if (!notification.displayed) {
        const icons = {
          success: IconCheck,
          error: IconX,
          info: IconInfoCircle,
          warning: IconAlertTriangle
        }

        const colors = {
          success: 'green',
          error: 'red', 
          info: 'blue',
          warning: 'yellow'
        }

        const Icon = icons[notification.type] || IconInfoCircle

        notifications.show({
          id: notification.id.toString(),
          title: notification.title,
          message: notification.message,
          color: colors[notification.type] || 'blue',
          icon: <Icon size={18} />,
          autoClose: notification.autoClose !== false ? 5000 : false,
          onClose: () => removeNotification(notification.id)
        })

        // Mark as displayed
        notification.displayed = true
      }
    })
  }, [storeNotifications, removeNotification])

  return {
    showNotification: (notification) => {
      // This is handled by the store
    }
  }
}

export default useNotifications
