import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Coins, Zap, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import { Link } from "wouter";
import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const { user, isAuthenticated, refresh } = useAuth();
  const [hasRefreshed, setHasRefreshed] = useState(false);

  // Refresh user data to get updated coin balance
  useEffect(() => {
    if (isAuthenticated && !hasRefreshed) {
      refresh?.();
      setHasRefreshed(true);
    }
  }, [isAuthenticated, refresh, hasRefreshed]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">Please login to view this page.</p>
            <Link href="/store">
              <Button>Go to Store</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">Your purchase has been completed successfully.</p>
        </div>

        {/* Success Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-green-600 dark:text-green-400">
              Thank you for your purchase!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {user?.coins && (
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold text-foreground">
                    Current Balance: {user.coins} Coins
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your coins have been added to your account
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p>✅ Payment processed securely</p>
              <p>✅ Account updated</p>
              <p>✅ Ready to use</p>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-muted-foreground">What would you like to do next?</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/store" className="flex-1">
                  <Button className="w-full" variant="outline" data-testid="button-back-to-store">
                    <Coins className="w-4 h-4 mr-2" />
                    Browse Store
                  </Button>
                </Link>
                
                <Link href="/servers" className="flex-1">
                  <Button className="w-full" data-testid="button-browse-servers">
                    Browse Servers
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <Link href="/join-members" className="w-full">
                <Button className="w-full" variant="outline" data-testid="button-join-members">
                  <Zap className="w-4 h-4 mr-2" />
                  Join Members & Earn Coins
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about your purchase, please contact our support team.
              </p>
              <Link href="/help-center">
                <Button variant="link" className="text-primary" data-testid="link-help-center">
                  Visit Help Center
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}