
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  ExternalLink, 
  Star, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Command,
  Shield,
  Globe,
  MessageSquare,
  ThumbsUp
} from "lucide-react";
import type { Bot as BotType } from "@shared/schema";

export default function BotDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch bot data
  const { data: bot, isLoading } = useQuery({
    queryKey: ["/api/bots", id],
    queryFn: async () => {
      const response = await fetch(`/api/bots/${id}`);
      if (!response.ok) throw new Error("Bot not found");
      return response.json();
    },
    enabled: !!id,
  });

  usePageTitle(bot ? `${bot.name} - Bot Profile` : "Bot Profile");

  const handleInviteBot = () => {
    if (bot?.inviteLink) {
      window.open(bot.inviteLink, '_blank');
    }
  };

  const handleVote = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to vote for this bot.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/bots/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast({
          title: "Vote Submitted!",
          description: "Thank you for voting for this bot.",
        });
      } else {
        throw new Error("Failed to vote");
      }
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: "You can only vote once every 12 hours.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Bot Not Found</h1>
              <p className="mb-6">The bot you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/explore")}>
                Back to Explore
              </Button>
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
          Under Review (May take 2 days)
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Bot Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              {bot.iconUrl ? (
                <img src={bot.iconUrl} alt={bot.name} className="w-20 h-20 rounded-2xl" />
              ) : (
                <Bot className="w-10 h-10 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{bot.name}</h1>
                {getStatusBadge(bot)}
                {bot.verified && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{bot.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>{bot.serverCount || 0} servers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{bot.totalVotes || 0} votes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Command className="w-4 h-4 text-purple-400" />
                  <span>{bot.prefix || 'Slash commands'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleInviteBot}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={!bot.verified}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {bot.verified ? 'Invite Bot' : 'Pending Approval'}
              </Button>
              <Button
                onClick={handleVote}
                variant="outline"
                className="border-yellow-400/30 hover:bg-yellow-400/10"
                disabled={!bot.verified}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Vote
              </Button>
            </div>
          </div>
        </div>

        {/* Bot Details Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="commands">Commands</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>About {bot.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {bot.description}
                    </p>
                    {bot.uses && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Bot Uses:</h4>
                        <p className="text-muted-foreground">{bot.uses}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {bot.tags && bot.tags.length > 0 && (
                  <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {bot.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="space-y-6">
                <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Bot Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Prefix</span>
                      <span className="font-mono bg-muted px-2 py-1 rounded">
                        {bot.prefix || '/'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="outline">{bot.type}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Servers</span>
                      <span>{bot.serverCount || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Shards</span>
                      <span>{bot.shardCount || 1}</span>
                    </div>
                  </CardContent>
                </Card>

                {bot.supportServerInvite && (
                  <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Support Server</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => window.open(bot.supportServerInvite, '_blank')}
                        className="w-full"
                        variant="outline"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Join Support Server
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="commands">
            <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Bot Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Command className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Commands information will be available after bot approval.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>User Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No reviews yet. Be the first to review this bot!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{bot.serverCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Servers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-yellow-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{bot.totalVotes || 0}</p>
                      <p className="text-sm text-muted-foreground">Votes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Globe className="w-8 h-8 text-purple-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{bot.shardCount || 1}</p>
                      <p className="text-sm text-muted-foreground">Shards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">
                        {bot.verified ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-muted-foreground">Verified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
