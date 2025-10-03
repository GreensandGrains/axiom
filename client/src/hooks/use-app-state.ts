import * as React from 'react';
import { useLocation } from 'wouter';

export function useAppState() {
  const [isOnline, setIsOnline] = React.useState<boolean>(navigator.onLine);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [location] = useLocation();

  // Handle online/offline detection
  React.useEffect(() => {
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
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Show loading for 500ms on route change

    return () => clearTimeout(timer);
  }, [location]);

  return {
    isOnline,
    isLoading,
    location,
  };
}
