
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { Bot, Plus, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import type { Bot as BotType } from "@shared/schema";

export default function YourBots() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  usePageTitle("Your Bots");

  // Fetch user's bots
  const { data: userBots = [], isLoading } = useQuery({
    queryKey: ["/api/bots/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/bots/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch bots");
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You need to be logged in to view your bots.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (bot: BotType) => {
    if (bot.verified) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    } else if (bot.featured === false && bot.verified === false) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
          <XCircle className="w-3 h-3 mr-1" />
          Declined
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
          <Clock className="w-3 h-3 mr-1" />
          Under Review
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Bots
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor your Discord bots
            </p>
          </div>
          <Button
            onClick={() => navigate("/add-bot")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Bot
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-purple-400/20 bg-card/50 backdrop-blur-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-muted rounded-xl mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userBots.length === 0 ? (
          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Bots Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't added any Discord bots yet. Start by adding your first bot!
              </p>
              <Button
                onClick={() => navigate("/add-bot")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBots.map((bot: BotType) => (
              <Card
                key={bot.id}
                className="border-purple-400/20 bg-card/50 backdrop-blur-sm hover:border-purple-400/40 transition-all cursor-pointer"
                onClick={() => navigate(`/bot/${bot.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        {bot.iconUrl ? (
                          <img src={bot.iconUrl} alt={bot.name} className="w-12 h-12 rounded-xl" />
                        ) : (
                          <Bot className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{bot.type}</p>
                      </div>
                    </div>
                    {getStatusBadge(bot)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {bot.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>{bot.serverCount || 0} servers</span>
                    <span>{bot.totalVotes || 0} votes</span>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-purple-400/30 hover:bg-purple-400/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/bot/${bot.id}`);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
