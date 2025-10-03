import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export function useAppState() {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [location] = useLocation();

  // Handle online/offline detection
  useEffect(() => {
    // Check if navigator is available (client-side only)
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Handle loading state based on location changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, [location]);

  return {
    isOnline,
    isLoading,
    location,
  };
}
