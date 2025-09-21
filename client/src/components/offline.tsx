
import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OfflineProps {
  onRetry?: () => void;
}

export default function Offline({ onRetry }: OfflineProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Check if we're back online
      const response = await fetch('/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Still offline');
      }
    } catch (error) {
      console.log('Still offline');
      setTimeout(() => setIsRetrying(false), 2000);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-red-400/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src="/assets/axiom-logo.png"
                  alt="Axiom Logo"
                  className="w-16 h-16 object-contain rounded-lg opacity-50"
                />
                <WifiOff className="absolute -bottom-2 -right-2 w-8 h-8 text-red-500 bg-background rounded-full p-1 border-2 border-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text">
              You're Offline
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                It looks like you've lost your internet connection. Please check your network and try again.
              </p>
            </div>

            {/* Offline Tips */}
            <div className="text-left space-y-2">
              <h3 className="font-semibold text-sm text-foreground">Quick fixes:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Check your Wi-Fi connection</li>
                <li>Make sure airplane mode is off</li>
                <li>Try refreshing the page</li>
                <li>Contact your network administrator</li>
              </ul>
            </div>

            {/* Retry Button */}
            <Button
              onClick={onRetry || handleRetry}
              disabled={isRetrying}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking Connection...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>

            {/* Connection Status */}
            <div className="text-xs text-muted-foreground">
              Connection Status: {navigator.onLine ? "Online" : "Offline"}
            </div>
          </CardContent>
        </Card>

        {/* Floating Error Elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-yellow-400 rounded-full animate-float opacity-80" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}
