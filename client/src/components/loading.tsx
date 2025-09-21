
import { useEffect, useState } from "react";
import { Loader2, Zap } from "lucide-react";

interface LoadingProps {
  message?: string;
  showLogo?: boolean;
}

export default function Loading({ message = "Loading...", showLogo = true }: LoadingProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6 p-8">
        {/* Animated Logo */}
        {showLogo && (
          <div className="relative">
            <img
              src="/assets/axiom-logo.png"
              alt="Axiom Logo"
              className="w-16 h-16 object-contain rounded-lg animate-pulse"
            />
            <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-lg scale-150 animate-pulse"></div>
          </div>
        )}

        {/* Spinning Icon */}
        <div className="relative">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md scale-150 animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text">
            {message}{dots}
          </h2>
          <p className="text-muted-foreground text-sm">
            Please wait while we load your content
          </p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-cyan-400 rounded-full animate-float opacity-80" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/6 w-2 h-2 bg-purple-300 rounded-full animate-float opacity-50" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
}
