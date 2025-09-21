import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Coins, Zap, ArrowLeft, Server, CheckCircle } from "lucide-react";
import Navbar from "@/components/navbar";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute, Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface PaymentFormProps {
  amount: number;
  description: string;
  paymentType: string;
  coins?: number;
  serverId?: string;
  boostType?: string;
  onSuccess: () => void;
}

const PaymentForm = ({ amount, description, paymentType, coins, serverId, boostType, onSuccess }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: "if_required"
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Call payment success endpoint
      try {
        const response = await apiRequest("POST", "/api/payment-success", {
          paymentIntentId: paymentIntent.id
        });
        
        const data = await response.json();
        
        toast({
          title: "Payment Successful",
          description: data.message,
        });
        
        onSuccess();
        
        // Redirect to success page
        setTimeout(() => {
          window.location.href = '/payment/success';
        }, 1000);
      } catch (successError) {
        console.error("Payment success handling error:", successError);
        toast({
          title: "Payment Completed",
          description: "Your payment was successful! Redirecting to confirmation.",
        });
        onSuccess();
        setTimeout(() => {
          window.location.href = '/payment/success';
        }, 1000);
      }
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-xl mb-2 text-foreground">{description}</h3>
        <p className="text-3xl font-bold text-primary">${amount}</p>
        {paymentType.includes('boost') && serverId && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Server selected for advertising boost</span>
            </div>
          </div>
        )}
      </div>
      <PaymentElement />
      <div className="flex gap-4">
        <Link href="/store" className="flex-1">
          <Button type="button" variant="outline" className="w-full" data-testid="button-back-to-store">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          data-testid="button-complete-payment"
        >
          {isProcessing ? "Processing..." : `Pay $${amount}`}
        </Button>
      </div>
    </form>
  );
};

export default function Payment() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/payment/:type");
  const { toast } = useToast();
  
  const [paymentConfig, setPaymentConfig] = useState<{
    amount: number;
    description: string;
    coins?: number;
    boostType?: string;
  } | null>(null);

  // Parse URL parameters
  useEffect(() => {
    if (params?.type) {
      const urlParams = new URLSearchParams(window.location.search);
      
      if (params.type === 'coins') {
        const coins = parseInt(urlParams.get('coins') || '0');
        const price = parseFloat(urlParams.get('price') || '0');
        
        if (coins > 0 && price > 0) {
          setPaymentConfig({
            amount: price,
            description: `${coins} Coins Package`,
            coins
          });
        } else {
          toast({
            title: "Invalid Parameters",
            description: "Missing coin package information.",
            variant: "destructive",
          });
          setLocation("/store");
        }
      } else if (params.type.includes('boost')) {
        const price = parseFloat(urlParams.get('price') || '0');
        const duration = urlParams.get('duration') || '';
        
        if (price > 0 && duration) {
          setPaymentConfig({
            amount: price,
            description: `${duration} Advertise Boost`,
            boostType: params.type === '24hour-boost' ? '24hour_boost' : '1month_boost'
          });
        } else {
          toast({
            title: "Invalid Parameters",
            description: "Missing boost package information.",
            variant: "destructive",
          });
          setLocation("/store");
        }
      }
    }
  }, [params, setLocation, toast]);

  // Payment processing temporarily disabled

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">Please login to continue with your purchase.</p>
            <Link href="/store">
              <Button>Return to Store</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentConfig) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading Payment...</h1>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 mb-4">
            {paymentConfig.boostType ? <Zap className="w-6 h-6 text-white" /> : <Coins className="w-6 h-6 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">Secure payment powered by Stripe</p>
        </div>

        {/* Payment Temporarily Disabled */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Coming Soon</CardTitle>
            <CardDescription>Payment processing is temporarily disabled</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-xl mb-2 text-foreground">{paymentConfig.description}</h3>
              <p className="text-3xl font-bold text-primary">${paymentConfig.amount}</p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                <span className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Payment System Under Development
                </span>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                We're working hard to integrate secure payment processing. This feature will be available soon!
              </p>
              <div className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                <p>🔧 Setting up payment infrastructure</p>
                <p>🔒 Implementing security measures</p>
                <p>✨ Almost ready to launch</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/store" className="flex-1">
                <Button type="button" variant="outline" className="w-full" data-testid="button-back-to-store">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Store
                </Button>
              </Link>
              <Button
                type="button"
                disabled
                className="flex-1 bg-gray-400 cursor-not-allowed"
                data-testid="button-complete-payment"
              >
                Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}