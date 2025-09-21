import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Coins, 
  Trophy, 
  Users, 
  Video, 
  Gift, 
  Crown,
  ExternalLink,
  UserPlus,
  Zap,
  Copy
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Quest() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [lastDailyReward, setLastDailyReward] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const inviteLink = "https://discord.gg/Ept7zwYJH5";
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Link Copied!",
        description: "Invite link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };
  
  // Check if user can claim daily reward (24 hours since last claim)
  const canClaimDaily = () => {
    if (!lastDailyReward) return true;
    const lastClaim = new Date(lastDailyReward);
    const now = new Date();
    const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastClaim >= 24;
  };

  const getTimeUntilNextDaily = () => {
    if (!lastDailyReward) return "Available now!";
    const lastClaim = new Date(lastDailyReward);
    const nextAvailable = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now >= nextAvailable) return "Available now!";
    
    const msUntil = nextAvailable.getTime() - now.getTime();
    const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60));
    const minutesUntil = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursUntil}h ${minutesUntil}m`;
  };

  // Daily reward mutation
  const dailyRewardMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/quests/daily-reward");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLastDailyReward(new Date().toISOString());
      toast({
        title: "Daily Reward Claimed!",
        description: `You earned ${data.coinsEarned} coins! Come back tomorrow for more.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reward Unavailable",
        description: error.message || "Please try again in 24 hours.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Authentication Required</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please login with Discord to access quests and start earning rewards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allQuests = [
    {
      id: "join-server",
      title: "Join Our Server",
      description: "Join our Discord server to get started with the community",
      reward: 2,
      icon: <Users className="w-8 h-8 text-primary" />,
      action: "Join Server",
      link: "https://discord.gg/Ept7zwYJH5",
      note: "Note: Leave and join again reduces reward by 1.5 coins"
    },
    {
      id: "social-promotion",
      title: "Promote Us on Social Media",
      description: "Create an Instagram reel or YouTube video (5+ minutes) about our platform",
      reward: 1000,
      icon: <Video className="w-8 h-8 text-primary" />,
      action: "Submit Content"
    },
    {
      id: "daily-reward",
      title: "Daily Check-in",
      description: "Click the reward button below every 24 hours to earn coins",
      reward: 2,
      icon: <Gift className="w-8 h-8 text-primary" />,
      action: canClaimDaily() ? "Claim Reward" : getTimeUntilNextDaily(),
      canClaim: canClaimDaily()
    },
    {
      id: "boost-server",
      title: "Boost Our Server",
      description: "Use Discord Nitro to boost our server and earn a big reward",
      reward: 50,
      icon: <Zap className="w-8 h-8 text-primary" />,
      action: "Boost Server"
    },
    {
      id: "invite-members",
      title: "Invite Members",
      description: "Invite new members to our Discord server",
      reward: 3,
      icon: <UserPlus className="w-8 h-8 text-primary" />,
      action: "Start Inviting",
      note: "Earn 3 coins per member. If member leaves: -1.75 coins"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-purple-900/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="inline-block p-3 rounded-xl bg-gradient-to-r from-orange-400 to-red-400">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text">
                Quest Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Complete quests to earn coins, unlock rewards, and support our community!
              </p>
            </div>
            
            {/* Current Balance */}
            <div className="mt-6">
              <div className="inline-block bg-card border border-border rounded-xl px-6 py-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold text-foreground" data-testid="text-coin-balance">
                    {(user as any)?.coins || 0} Coins
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Available Quests Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Available Quests</h2>
            <p className="text-muted-foreground">Complete these tasks to earn coins and rewards</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allQuests.map((quest) => (
              <Card key={quest.id} className="transition-all duration-300 hover:scale-105 bg-card border-border hover:bg-card/80">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    {quest.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {quest.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {quest.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center mb-4">
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      <Coins className="w-4 h-4 mr-1" />
                      {quest.reward} Coins
                    </Badge>
                  </div>
                  
                  {quest.note && (
                    <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded mb-4">
                      {quest.note}
                    </div>
                  )}

                  {quest.id === "join-server" && (
                    <Button 
                      className="w-full" 
                      onClick={() => window.open(quest.link, '_blank', 'noopener,noreferrer')}
                      data-testid="button-join-server"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {quest.action}
                    </Button>
                  )}

                  {quest.id === "social-promotion" && (
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" 
                      data-testid="button-submit-content"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {quest.action}
                    </Button>
                  )}

                  {quest.id === "daily-reward" && (
                    <Button 
                      className={`w-full ${canClaimDaily() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
                      disabled={!canClaimDaily() || dailyRewardMutation.isPending}
                      onClick={() => canClaimDaily() && dailyRewardMutation.mutate()}
                      data-testid="button-daily-reward"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {dailyRewardMutation.isPending ? "Claiming..." : quest.action}
                    </Button>
                  )}

                  {quest.id === "boost-server" && (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700" 
                      onClick={() => window.open("https://discord.gg/Ept7zwYJH5", '_blank', 'noopener,noreferrer')}
                      data-testid="button-boost-server"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {quest.action}
                    </Button>
                  )}

                  {quest.id === "invite-members" && (
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" 
                          data-testid="button-invite-members"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {quest.action}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border border-border">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Invite Your Friends</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Share this link with your friends to invite them to our Discord server
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              value={inviteLink} 
                              readOnly 
                              className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                              data-testid="input-invite-link"
                            />
                            <Button 
                              onClick={copyToClipboard}
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              data-testid="button-copy-invite"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground bg-primary/10 border border-primary/20 p-3 rounded">
                            <strong>Note:</strong> Earn 3 coins per member. If member leaves: -1.75 coins
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Information Panel */}
        <section className="mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Quest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <p>All quest completions are verified through our Discord bot system</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <p>Rewards are automatically credited to your account upon verification</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <p>Premium quests require active participation and may take time to verify</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                <p>Daily rewards reset every 24 hours - don't miss your streak!</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm animate-pulse"></div>
                </div>
                <span className="text-xl font-bold text-foreground">Quest Hub</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The ultimate platform for Discord server discovery and community building.
              </p>
            </div>
            
            <div>
              <h3 className="text-foreground font-semibold mb-3">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Discord Server</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Guidelines</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-foreground font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Quest Guide</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Rewards Info</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-foreground font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Quest Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Gift, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Quest() {
  const { isAuthenticated } = useAuth();
  const [completedQuests, setCompletedQuests] = useState([1, 3]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Authentication Required</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please login with Discord to access Quests and earn rewards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const quests = [
    {
      id: 1,
      title: "First Server Join",
      description: "Join your first Discord server through Smart Serve",
      reward: "10 Coins + Welcome Badge",
      progress: 100,
      maxProgress: 100,
      difficulty: "Easy",
      type: "daily",
      icon: Target,
      completed: true
    },
    {
      id: 2,
      title: "Social Butterfly",
      description: "Join 5 different Discord servers",
      reward: "50 Coins + Social Badge",
      progress: 2,
      maxProgress: 5,
      difficulty: "Medium",
      type: "weekly",
      icon: Star,
      completed: false
    },
    {
      id: 3,
      title: "Template Creator",
      description: "Create and publish your first server template",
      reward: "100 Coins + Creator Badge",
      progress: 100,
      maxProgress: 100,
      difficulty: "Hard",
      type: "achievement",
      icon: Trophy,
      completed: true
    },
    {
      id: 4,
      title: "Community Builder",
      description: "Get 100 members to join servers through your referrals",
      reward: "500 Coins + Builder Badge",
      progress: 23,
      maxProgress: 100,
      difficulty: "Legendary",
      type: "achievement",
      icon: Gift,
      completed: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "Hard": return "bg-orange-500";
      case "Legendary": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily": return "bg-blue-100 text-blue-800";
      case "weekly": return "bg-green-100 text-green-800";
      case "achievement": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Quest Center
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Complete quests to earn coins, badges, and exclusive rewards
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{completedQuests.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{quests.length - completedQuests.length}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">1,250</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quests.map((quest) => {
            const IconComponent = quest.icon;
            const isCompleted = completedQuests.includes(quest.id);
            
            return (
              <Card key={quest.id} className={`hover:shadow-lg transition-all duration-300 ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${getDifficultyColor(quest.difficulty)} rounded-full flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{quest.title}</span>
                          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </CardTitle>
                        <CardDescription>{quest.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getTypeColor(quest.type)}>{quest.type}</Badge>
                      <Badge className={`${getDifficultyColor(quest.difficulty)} text-white`}>{quest.difficulty}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!isCompleted ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{quest.progress}/{quest.maxProgress}</span>
                      </div>
                      <Progress value={(quest.progress / quest.maxProgress) * 100} className="h-2" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Quest Completed!</span>
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Reward: {quest.reward}</span>
                    </div>
                  </div>

                  {!isCompleted && (
                    <Button className="w-full mt-4" variant="outline">
                      View Details
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
