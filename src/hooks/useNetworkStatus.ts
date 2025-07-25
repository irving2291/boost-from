import { useState, useEffect } from 'react';
import type { NetworkStatus } from '../types';
import { checkNetworkStatus } from '../services/api';

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isReconnecting: false,
  });

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let checkInterval: ReturnType<typeof setInterval>;

    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true, isReconnecting: false }));
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: false, isReconnecting: false }));
    };

    const checkConnection = async () => {
      if (!navigator.onLine) {
        setNetworkStatus(prev => ({ ...prev, isOnline: false, isReconnecting: false }));
        return;
      }

      try {
        const isConnected = await checkNetworkStatus();
        setNetworkStatus(prev => ({
          ...prev,
          isOnline: isConnected,
          isReconnecting: !isConnected && prev.isOnline,
        }));

        // If we're reconnecting, try again in 5 seconds
        if (!isConnected && networkStatus.isOnline) {
          setNetworkStatus(prev => ({ ...prev, isReconnecting: true }));
          reconnectTimeout = setTimeout(checkConnection, 5000);
        }
      } catch {
        setNetworkStatus(prev => ({ ...prev, isOnline: false, isReconnecting: false }));
      }
    };

    // Listen to browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection status every 30 seconds
    checkInterval = setInterval(checkConnection, 30000);

    // Initial check
    checkConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(reconnectTimeout);
      clearInterval(checkInterval);
    };
  }, [networkStatus.isOnline]);

  return networkStatus;
}