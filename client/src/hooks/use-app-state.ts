
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export function useAppState() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [location] = useLocation();

  // Handle online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle loading state for route changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Show loading for 500ms on route change

    return () => clearTimeout(timer);
  }, [location]);

  return {
    isOnline,
    isLoading,
    setIsLoading
  };
}
