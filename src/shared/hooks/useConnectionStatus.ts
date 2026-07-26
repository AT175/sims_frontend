import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { apiClient } from '@shared/api/apiClient';

interface ConnectionStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
}

export function useConnectionStatus(): ConnectionStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(new Date());
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastOnlineAt(new Date());
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Use browser online/offline events
      const initialOnline = navigator.onLine;
      setIsOnline(initialOnline);
      if (initialOnline) setLastOnlineAt(new Date());

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // Native: poll health check every 30s
      const checkConnection = async () => {
        try {
          const result = await apiClient.healthCheck();
          if (result.ok) {
            if (!isOnline) handleOnline();
          } else {
            if (isOnline) handleOffline();
          }
        } catch {
          if (isOnline) handleOffline();
        }
      };

      checkConnection();
      pollTimerRef.current = setInterval(checkConnection, 30000);

      return () => {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isOnline, wasOffline, lastOnlineAt };
}
