import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Users, Gift, Zap, Video, Clock, Trophy, CheckCircle, ExternalLink, UserPlus, Copy, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import backgroundImage from "@assets/generated_images/6682744.gif"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";

interface QuestCompletion {
  questId: string;
  completedAt: string;
  reward: number;
}

interface QuestProgress {
  completions: QuestCompletion[];
  lastDailyReward: string | null;
}

interface ServerStatus {
  inServer: boolean;
  isBoosting: boolean;
  serverGuildId: string;
}

export default function Quest() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const inviteLink = "https://discord.gg/2dEC7dAX"; // Default invite link
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number } | null>(null);

  const { data: userQuests, refetch: refetchQuests } = useQuery<QuestProgress>({
    queryKey: ["/api/quests/user-progress"],
    queryFn: async () => {
      const res = await fetch("/api/quests/user-progress", { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch user quests');
      return res.json();
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  const { data: serverStatus, refetch: refetchServerStatus } = useQuery<ServerStatus>({
    queryKey: ["/api/quests/server-status"],
    queryFn: async () => {
      const res = await fetch("/api/quests/server-status", { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch server status');
      return res.json();
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch user data');
      return res.json();
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    staleTime: 3000,
  });

  const currentCoins = (currentUser as any)?.coins || 0;

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

  const isQuestCompleted = (questId: string) => {
    return userQuests?.completions.some(completion => completion.questId === questId) || false;
  };

  const canClaimDaily = () => {
    if (!userQuests?.lastDailyReward) return true;
    const lastClaim = new Date(userQuests.lastDailyReward);
    const now = new Date();
    const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastClaim >= 24;
  };

  const getTimeUntilNextDaily = () => {
    if (!userQuests?.lastDailyReward) return "Available now!";
    const lastClaim = new Date(userQuests.lastDailyReward);
    const nextAvailable = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now >= nextAvailable) return "Available now!";

    const msUntil = nextAvailable.getTime() - now.getTime();
    const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60));
    const minutesUntil = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60));

    return `${hoursUntil}h ${minutesUntil}m`;
  };

  useEffect(() => {
    if (!userQuests?.lastDailyReward) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      if (!userQuests.lastDailyReward) return;
      const lastClaim = new Date(userQuests.lastDailyReward);
      const now = new Date();
      const diffMs = lastClaim.getTime() + 24 * 60 * 60 * 1000 - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining(null);
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining({ hours, minutes });
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 60000);

    return () => clearInterval(intervalId);
  }, [userQuests?.lastDailyReward]);

  const dailyRewardMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/quests/daily-reward", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to claim daily reward");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/user-progress"] });
      refetchQuests();
      toast({
        title: "Daily Reward Claimed!",
        description: `You earned ${data.coinsEarned} coins! Come back tomorrow for more. Total: ${data.totalCoins}`,
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

  const joinServerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/quests/join-server", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Could not verify server join.");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/server-status"] });
      refetchQuests();
      refetchServerStatus();
      toast({
        title: "Quest Completed!",
        description: `You earned ${data.coinsEarned} coins for joining the server! Total: ${data.totalCoins}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Quest Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const inviteMembersMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/quests/check-invites", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to check invites.");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.newInvites > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quests/user-progress"] });
        refetchQuests();
        toast({
          title: "Invites Rewarded!",
          description: `You earned ${data.coinsEarned} coins for ${data.newInvites} new invites! Total: ${data.totalCoins}`,
        });
      } else {
        toast({
          title: "No New Invites",
          description: "You haven't invited any new members recently.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Invite Check Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const boostServerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/quests/boost-server", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to boost server");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/server-status"] });
      refetchQuests();
      refetchServerStatus();
      toast({
        title: "Server Boost Rewarded!",
        description: `You earned ${data.coinsEarned} coins for boosting the server! Total: ${data.totalCoins}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Boost Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
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
      action: isQuestCompleted("join-server") ? "Completed" : (serverStatus?.inServer ? "Claim Reward" : "Join Server"),
      link: `https://discord.gg/${serverStatus?.serverGuildId || '2dEC7dAX'}`,
      note: "Note: Leave and join again reduces reward by 1.5 coins",
      completed: isQuestCompleted("join-server")
    },
    {
      id: "social-promotion",
      title: "Promote Us on Social Media",
      description: "Create an Instagram reel or YouTube video (5+ minutes) about our platform",
      reward: 1000,
      icon: <Video className="w-8 h-8 text-primary" />,
      action: "Submit Content",
      completed: isQuestCompleted("social-promotion")
    },
    {
      id: "daily-reward",
      title: "Daily Check-in",
      description: "Click the reward button below every 24 hours to earn coins",
      reward: 2,
      icon: <Gift className="w-8 h-8 text-primary" />,
      action: canClaimDaily() ? "Claim Reward" : getTimeUntilNextDaily(),
      canClaim: canClaimDaily(),
      isDaily: true
    },
    {
      id: "boost-server",
      title: "Boost Our Server",
      description: "Use Discord Nitro to boost our server and earn a big reward",
      reward: 50,
      icon: <Zap className="w-8 h-8 text-primary" />,
      action: isQuestCompleted("boost-server") ? "Completed" : "Boost Server",
      completed: isQuestCompleted("boost-server")
    },
    {
      id: "invite-members",
      title: "Invite Members",
      description: "Invite new members to our Discord server",
      reward: 3,
      icon: <UserPlus className="w-8 h-8 text-primary" />,
      action: "Start Inviting",
      note: "Earn 3 coins per member. If member leaves: -1.75 coins",
      isOngoing: true
    }
  ];

  const completedCount = allQuests.filter(quest => quest.completed).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Back to Join Members Button - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/join-members">
          <Button 
            variant="outline" 
            className="border-border bg-card/80 backdrop-blur-sm hover:bg-card text-foreground hover:text-primary transition-all duration-300"
            data-testid="button-back-to-join-members"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Member Exchange
          </Button>
        </Link>
      </div>
      

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={backgroundImage}
            alt="Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

            <div className="mt-6">
              <div className="flex flex-wrap justify-center gap-4">
                <div className="inline-block bg-card border border-border rounded-xl px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold text-foreground" data-testid="text-coin-balance">
                      {user?.coins || 0} Coins
                    </span>
                  </div>
                </div>
                <div className="inline-block bg-card border border-border rounded-xl px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <span className="text-xl font-bold text-foreground">
                      {completedCount} Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Available Quests</h2>
            <p className="text-muted-foreground">Complete these tasks to earn coins and rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allQuests.map((quest) => (
              <Card key={quest.id} className="transition-all duration-300 hover:scale-105 bg-card border-border hover:bg-card/80">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2 relative">
                    {quest.icon}
                    {quest.completed && (
                      <CheckCircle className="w-6 h-6 text-green-500 absolute ml-6 -mt-2" />
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                    {quest.title}
                    {quest.completed && <Badge className="bg-green-500 text-white">Completed</Badge>}
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
                      className={`w-full ${quest.completed ? 'bg-green-600 cursor-default' : ''}`}
                      onClick={() => {
                        if (!quest.completed) {
                          if (serverStatus?.inServer) {
                            joinServerMutation.mutate();
                          } else {
                            window.open(quest.link, '_blank', 'noopener,noreferrer');
                            // Refresh server status after user potentially joins
                            setTimeout(() => {
                              refetchServerStatus();
                            }, 5000);
                          }
                        }
                      }}
                      disabled={quest.completed || joinServerMutation.isPending}
                      data-testid="button-join-server"
                    >
                      {quest.completed ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : joinServerMutation.isPending ? (
                        "Verifying..."
                      ) : serverStatus?.inServer ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Claim Reward
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join Server
                        </>
                      )}
                    </Button>
                  )}

                  {quest.id === "social-promotion" && (
                    <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className={`w-full ${quest.completed ? 'bg-green-600 cursor-default' : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'}`}
                          disabled={quest.completed}
                          data-testid="button-submit-content"
                        >
                          {quest.completed ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Video className="w-4 h-4 mr-2" />
                              {quest.action}
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border border-border">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Submit Your Content</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Complete the social media promotion quest
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-primary/10 border border-primary/20 p-4 rounded-md">
                            <h4 className="font-semibold text-foreground mb-2">Instructions:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Create an Instagram reel or YouTube video (5+ minutes minimum)</li>
                              <li>• Feature our Discord server and platform</li>
                              <li>• Send the video link to our Discord bot via DM</li>
                              <li>• Wait for manual review and approval</li>
                            </ul>
                          </div>
                          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded">
                            <p className="text-sm text-amber-300">
                              <strong>Reward:</strong> 1000 coins upon approval
                            </p>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => {
                              window.open("https://discord.gg/Ept7zwYJH5", '_blank');
                              setSocialDialogOpen(false);
                            }}
                          >
                            Open Discord Server
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {quest.id === "daily-reward" && (
                    <div className="space-y-2">
                      {!canClaimDaily() && timeRemaining && (
                        <div className="text-xs text-center text-muted-foreground bg-amber-500/10 border border-amber-500/20 p-2 rounded">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Next claim in: {timeRemaining.hours}h {timeRemaining.minutes}m
                        </div>
                      )}
                      <Button
                        className={`w-full ${canClaimDaily() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
                        disabled={!canClaimDaily() || dailyRewardMutation.isPending}
                        onClick={() => canClaimDaily() && dailyRewardMutation.mutate()}
                        data-testid="button-daily-reward"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        {dailyRewardMutation.isPending ? "Claiming..." : canClaimDaily() ? "Claim Reward" : "Wait 24h"}
                      </Button>
                    </div>
                  )}

                  {quest.id === "boost-server" && (
                    <Button
                      className={`w-full ${quest.completed ? 'bg-green-600 cursor-default' : 'bg-purple-600 hover:bg-purple-700'}`}
                      onClick={() => {
                        if (!quest.completed) {
                          if (serverStatus?.isBoosting) {
                            boostServerMutation.mutate();
                          } else {
                            window.open(`https://discord.gg/${serverStatus?.serverGuildId || '2dEC7dAX'}`, '_blank', 'noopener,noreferrer');
                          }
                        }
                      }}
                      disabled={quest.completed}
                      data-testid="button-boost-server"
                    >
                      {quest.completed ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {quest.action}
                        </>
                      )}
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
                          <Button
                            onClick={() => {
                              inviteMembersMutation.mutate();
                              setInviteDialogOpen(false);
                            }}
                            className="w-full"
                            disabled={inviteMembersMutation.isPending}
                          >
                            {inviteMembersMutation.isPending ? "Checking..." : "Check My Invites"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

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
