
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Coins, ArrowRight, User, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Trade() {
  const [tradeCoins, setTradeCoins] = useState("");
  const [tradeUserId, setTradeUserId] = useState("");
  const [lookedUpUser, setLookedUpUser] = useState<any>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // User lookup mutation
  const userLookupMutation = useMutation({
    mutationFn: async (identifier: string) => {
      const res = await fetch(`/api/users/lookup/${encodeURIComponent(identifier)}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    onSuccess: (userData) => {
      setLookedUpUser(userData);
    },
    onError: (error: any) => {
      setLookedUpUser(null);
      toast({
        title: "User Not Found",
        description: error.message || "Could not find user with that Discord ID or username",
        variant: "destructive",
      });
    },
  });

  // Coin transfer mutation
  const transferCoinsMutation = useMutation({
    mutationFn: async ({ recipientId, amount }: { recipientId: string; amount: number }) => {
      const res = await fetch(`/api/users/transfer-coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, amount }),
      });
      if (!res.ok) throw new Error("Transfer failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setTradeCoins("");
      setTradeUserId("");
      setLookedUpUser(null);
      toast({
        title: "Success!",
        description: `Successfully transferred ${data.amount} coins to ${lookedUpUser?.username}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer coins",
        variant: "destructive",
      });
    },
  });

  const handleUserIdChange = (identifier: string) => {
    setTradeUserId(identifier);
    if (identifier.trim()) {
      userLookupMutation.mutate(identifier.trim());
    } else {
      setLookedUpUser(null);
    }
  };

  const handleTradeCoins = () => {
    const amount = parseInt(tradeCoins);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number of coins to transfer.",
        variant: "destructive",
      });
      return;
    }

    if (!lookedUpUser) {
      toast({
        title: "User Required",
        description: "Please enter a valid Discord ID or username.",
        variant: "destructive",
      });
      return;
    }

    const userCoins = user?.coins || 0;
    if (userCoins < amount) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${amount} coins but only have ${userCoins}.`,
        variant: "destructive",
      });
      return;
    }

    transferCoinsMutation.mutate({ recipientId: lookedUpUser.id, amount });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                You need to be logged in to trade coins.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back to Join Members Button - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/join-members">
          <Button 
            variant="outline" 
            className="border-border bg-card/80 backdrop-blur-sm hover:bg-card text-foreground hover:text-primary transition-all duration-300"
            data-testid="button-back-to-join-members-trade"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Member Exchange
          </Button>
        </Link>
      </div>
      
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            💰 Trade Coins
          </h1>
          <p className="text-xl text-muted-foreground">
            Transfer your coins to other Discord users safely and securely
          </p>
        </div>

        {/* Your Balance */}
        <Card className="mb-8 bg-card border-2 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex bg-card items-center justify-center space-x-2 mb-2">
                <Coins className="w-6 h-6 text-yellow-500" />
                <span className="text-lg font-semibold">Your Balance</span>
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-white">
                {user?.coins || 0} coins
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade Form */}
        <Card className="bg-card border-2 border-green-200 dark:border-green-800 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Send Coins
                </CardTitle>
                <CardDescription className="text-lg">
                  Transfer coins to another Discord user
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Recipient Input */}
            <div>
              <Label htmlFor="trade-user-id" className="text-base font-medium">
                Discord User ID or Username
              </Label>
              <Input
                id="trade-user-id"
                type="text"
                placeholder="Enter Discord ID or username"
                value={tradeUserId}
                onChange={(e) => handleUserIdChange(e.target.value)}
                className="mt-2 text-lg"
                data-testid="input-trade-user-id"
              />
              {userLookupMutation.isPending && (
                <div className="mt-2 text-sm text-muted-foreground">Looking up user...</div>
              )}
            </div>

            {/* User Preview */}
            {lookedUpUser && (
              <Card className="bg-secondary/20 border-secondary">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">{lookedUpUser.username}</div>
                      <Badge variant="secondary" className="text-xs">
                        {lookedUpUser.coins || 0} coins
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amount Input */}
            <div>
              <Label htmlFor="trade-coins" className="text-base font-medium">
                Amount to Send
              </Label>
              <Input
                id="trade-coins"
                type="number"
                min="1"
                max={user?.coins || 0}
                placeholder="Enter amount"
                value={tradeCoins}
                onChange={(e) => setTradeCoins(e.target.value)}
                className="mt-2 text-lg"
                data-testid="input-trade-coins"
              />
              <div className="mt-2 text-sm text-muted-foreground">
                Maximum: {user?.coins || 0} coins
              </div>
            </div>

            {/* Transfer Button */}
            <Button
              onClick={handleTradeCoins}
              disabled={!lookedUpUser || !tradeCoins || transferCoinsMutation.isPending}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg py-6"
              data-testid="button-transfer-coins"
            >
              {transferCoinsMutation.isPending ? (
                "Transferring..."
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Send {tradeCoins || 0} Coins
                </>
              )}
            </Button>

            {/* Security Note */}
            <div className="text-xs text-muted-foreground text-center space-y-1 pt-4 border-t">
              <p>🔒 All transfers are secure and cannot be reversed</p>
              <p>Make sure you're sending to the correct user</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
