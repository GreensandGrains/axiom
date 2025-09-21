
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import LoadingPage from '@/components/loading-page';
import OfflinePage from '@/components/offline-page';

interface NavigationContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [location, setLocation] = useLocation();
  const [previousLocation, setPreviousLocation] = useState(location);

  // Handle route changes
  useEffect(() => {
    if (location !== previousLocation) {
      setIsLoading(true);
      
      // Simulate loading time for better UX
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
        setPreviousLocation(location);
      }, 300);

      return () => clearTimeout(loadingTimer);
    }
  }, [location, previousLocation]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Check initial online status
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for failed requests (potential network issues)
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && response.status >= 500) {
          // Server error might indicate connectivity issues
          if (!navigator.onLine) {
            setIsOffline(true);
          }
        }
        
        return response;
      } catch (error) {
        // Network error
        if (!navigator.onLine) {
          setIsOffline(true);
        }
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const value: NavigationContextType = {
    isLoading,
    setIsLoading,
    isOffline,
    setIsOffline,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
      {isLoading && <LoadingPage />}
      {isOffline && <OfflinePage />}
    </NavigationContext.Provider>
  );
};
