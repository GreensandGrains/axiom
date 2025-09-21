
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OfflinePageProps {
  onRetry?: () => void;
}

export default function OfflinePage({ onRetry }: OfflinePageProps) {
  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-400/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <WifiOff className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-xl text-red-500">No Internet Connection</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            It looks like you're offline. Please check your internet connection and try again.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={handleRefresh}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full border-red-400/30 hover:bg-red-400/10"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
