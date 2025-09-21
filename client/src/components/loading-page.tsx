
import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-purple-500/20 rounded-full animate-pulse mx-auto"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Loading...</h3>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your content</p>
        </div>
      </div>
    </div>
  );
}
