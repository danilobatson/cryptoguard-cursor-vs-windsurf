import { useEffect, useRef } from 'react';
import useAlertStore from '../stores/useAlertStore';
import useCryptoStore from '../stores/useCryptoStore';

// Hook to automatically check alerts against real crypto data
export const useAlertChecker = () => {
  const { checkAlerts, getActiveAlerts } = useAlertStore();
  const { cryptoData, addNotification } = useCryptoStore();
  const lastCheckRef = useRef(0);

  useEffect(() => {
    const checkAlertsInterval = setInterval(() => {
      const activeAlerts = getActiveAlerts();
      
      // Only check if we have active alerts and real crypto data
      if (activeAlerts.length === 0 || Object.keys(cryptoData).length === 0) {
        return;
      }

      // Prevent too frequent checking (max once per 10 seconds)
      const now = Date.now();
      if (now - lastCheckRef.current < 10000) {
        return;
      }
      lastCheckRef.current = now;

      console.log('🔍 Running alert check with data:', {
        activeAlerts: activeAlerts.length,
        cryptoData: Object.keys(cryptoData),
        btcPrice: cryptoData.bitcoin?.price,
        ethPrice: cryptoData.ethereum?.price,
      });

      try {
        const triggeredAlerts = checkAlerts(cryptoData);
        
        if (triggeredAlerts.length > 0) {
          console.log(`🚨 ${triggeredAlerts.length} alerts triggered!`);
          
          triggeredAlerts.forEach(({ alert, currentPrice }) => {
            addNotification({
              type: 'warning',
              title: `🚨 Alert Triggered!`,
              message: `${alert.symbol.toUpperCase()}: $${currentPrice.toLocaleString()}`,
            });
          });
        }
      } catch (error) {
        console.error('Error checking alerts:', error);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkAlertsInterval);
  }, [cryptoData, getActiveAlerts, checkAlerts, addNotification]);

  return {
    isActive: true,
  };
};

export default useAlertChecker;
