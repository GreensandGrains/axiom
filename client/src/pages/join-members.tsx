import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  Coins, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  Crown,
  Shield,
  Zap,
  ArrowUpRight,
  Calculator,
  Wallet
} from "lucide-react";
import Navbar from "@/components/navbar";
import { Link } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";

interface Server {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  inviteUrl: string;
  memberCount: number;
  category: string;
  tags: string[];
  discordId: string;
  isAdvertising: boolean;
  advertisingType?: string;
  coinsPerMember?: number;
}

export default function JoinMembers() {
  const [membersToGet, setMembersToGet] = useState("");
  const [selectedServer, setSelectedServer] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [botCheckDialogOpen, setBotCheckDialogOpen] = useState(false);
  const [botCheckData, setBotCheckData] = useState<any>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  usePageTitle("Join Members");

  // Fetch member-exchange advertising servers (servers that give coins when joined)
  const { data: advertisingServers, isLoading: loadingServers } = useQuery<Server[]>({
    queryKey: ["/api/servers/advertising", "member_exchange"],
    queryFn: async () => {
      const response = await fetch("/api/servers/advertising?type=member_exchange");
      if (!response.ok) throw new Error("Failed to fetch advertising servers");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch user's Discord admin servers (all admin servers, not filtered by bot presence)
  // Database usage for this section: Primarily for storing server metadata fetched from Discord API. 
  // This data is used to populate the dropdown and is not the sole source of truth for server details.
  const { data: userServers, isLoading: loadingUserServers } = useQuery<Server[]>({
    queryKey: ["/api/servers/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/servers/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch user servers");
      const servers = await response.json();

      // Return all admin servers with proper image URLs
      return servers.map((server: any) => ({
        ...server,
        // Ensure proper image URL construction
        imageUrl: server.imageUrl || (server.icon ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=256` : null)
      }));
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Purchase members mutation
  const purchaseMembersMutation = useMutation({
    mutationFn: async ({ serverId, members }: { serverId: string; members: number }) => {
      const server = userServers?.find(s => s.id === serverId);
      const guildId = server?.discordId || server?.id; // Use Discord guild ID for the API call
      const response = await fetch("/api/servers/purchase-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: guildId, members }),
      });
      if (!response.ok) throw new Error("Failed to purchase members");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setDialogOpen(false);
      setMembersToGet("");
      setSelectedServer("");
      toast({
        title: "Purchase Successful!",
        description: `Successfully purchased ${data.members} members for your server!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase members",
        variant: "destructive",
      });
    },
  });

  // Bot check mutation
  const botCheckMutation = useMutation({
    mutationFn: async (serverId: string) => {
      const server = userServers?.find(s => s.id === serverId);
      const guildId = server?.discordId || server?.id; // Use Discord guild ID
      if (!guildId) {
        throw new Error("Server ID not found");
      }
      const res = await fetch(`/api/discord/bot-check/${guildId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Bot check failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setBotCheckData(data);
      if (!data.botPresent) {
        setBotCheckDialogOpen(true);
        toast({
          title: "Bot Required",
          description: "Please add our bot to your server to continue.",
          variant: "destructive",
        });
      } else {
        // Bot is present, proceed with purchase
        proceedWithPurchase();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Bot Check Failed",
        description: error.message || "Failed to check bot presence. Please try again.",
        variant: "destructive",
      });
    },
  });

  const proceedWithPurchase = () => {
    const members = parseInt(membersToGet);
    purchaseMembersMutation.mutate({
      serverId: selectedServer,
      members,
    });
  };

  const handlePurchaseMembers = async () => {
    const members = parseInt(membersToGet);
    if (!members || members < 1) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of members.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedServer) {
      toast({
        title: "Server Required",
        description: "Please select a server to advertise.",
        variant: "destructive",
      });
      return;
    }

    const totalCost = members * 2;
    const userCoins = user?.coins || 0;

    if (userCoins < totalCost) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${totalCost} coins but only have ${userCoins}. Join more servers to earn coins!`,
        variant: "destructive",
      });
      return;
    }

    // First check if bot is present in the server
    botCheckMutation.mutate(selectedServer);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Authentication Required</CardTitle>
              <CardDescription className="text-gray-400">
                Please log in to access the member exchange platform.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Member Exchange</h1>
                <p className="text-gray-400">Professional server growth platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400">1 coin per join</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400">2 coins per member</span>
              </div>
            </div>
          </div>

          {/* Wallet Card */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Balance</p>
                  <p className="text-2xl font-bold text-white">{user?.coins || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Navigation */}
            <Card className="bg-gray-900 border border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/quest">
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                    <Zap className="w-4 h-4 mr-3" />
                    Quest
                  </Button>
                </Link>
                <Link href="/trade">
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                    <Coins className="w-4 h-4 mr-3" />
                    Trade Coins
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                  <Crown className="w-4 h-4 mr-3" />
                  Premium
                </Button>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="bg-gray-900 border border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <CardTitle className="text-sm text-emerald-400">Platform Guidelines</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Maintain membership for 24+ hours</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Authentic accounts only</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Follow community standards</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Purchase Members Section */}
            <Card className="bg-gray-900 border border-gray-800">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-xl text-white flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-purple-400" />
                  Purchase Members
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Invest your earned coins to grow your server community
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-300">Members Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="100"
                        value={membersToGet}
                        onChange={(e) => setMembersToGet(e.target.value)}
                        className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        data-testid="input-members"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-300">Target Server</Label>
                      <Select value={selectedServer} onValueChange={setSelectedServer}>
                        <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select your server" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {userServers && userServers.length > 0 ? (
                            userServers.map((server) => (
                              <SelectItem key={server.id} value={server.id} className="text-white hover:bg-gray-700">
                                <div className="flex items-center justify-between w-full">
                                  <span>{server.name}</span>
                                  <Badge variant="outline" className="ml-2 text-xs border-gray-600 text-gray-400">
                                    {server.memberCount || 0}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-servers" disabled className="text-gray-500">
                              No eligible servers found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Cost Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Members:</span>
                        <span className="text-white">{membersToGet || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rate:</span>
                        <span className="text-white">2 coins each</span>
                      </div>
                      <div className="border-t border-gray-700 pt-2 flex justify-between font-medium">
                        <span className="text-gray-300">Total Cost:</span>
                        <span className="text-purple-400">{membersToGet ? parseInt(membersToGet) * 2 : 0} coins</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setDialogOpen(true)}
                  disabled={!membersToGet || !selectedServer || loadingUserServers}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12"
                  data-testid="button-purchase"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Purchase {membersToGet || 0} Members
                </Button>
              </CardContent>
            </Card>

            {/* Available Servers Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Available Servers</h2>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Earn +1 coin per join
                </Badge>
              </div>

              {loadingServers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse bg-gray-900 border-gray-800">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="w-full h-24 bg-gray-800 rounded"></div>
                          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : advertisingServers && advertisingServers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {advertisingServers.map((server) => (
                    <Card key={server.id} className="group bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {server.imageUrl && (
                            <div className="relative overflow-hidden rounded-lg">
                              <img
                                src={server.imageUrl}
                                alt={server.name}
                                className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-white text-sm group-hover:text-purple-400 transition-colors">
                              {server.name}
                            </h3>
                            <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                              {server.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1 text-gray-400">
                              <Users className="w-3 h-3" />
                              <span>{server.memberCount.toLocaleString()}</span>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                              +1 coin
                            </Badge>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600"
                            data-testid={`button-join-${server.id}`}
                          >
                            <a href={server.inviteUrl} target="_blank" rel="noopener noreferrer">
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                              Join Server
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-gray-400">No servers available at the moment</p>
                    <p className="text-sm text-gray-500 mt-1">Check back later for new opportunities</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Purchase</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review your member purchase details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Members:</span>
                  <span className="text-white font-medium">{membersToGet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate:</span>
                  <span className="text-white">2 coins each</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between font-medium">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-purple-400">{membersToGet ? parseInt(membersToGet) * 2 : 0} coins</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Balance after:</span>
                  <span className="text-white">{(user?.coins || 0) - (membersToGet ? parseInt(membersToGet) * 2 : 0)} coins</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
              <Button
                onClick={handlePurchaseMembers}
                disabled={!selectedServer || purchaseMembersMutation.isPending || botCheckMutation.isPending || !userServers}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                data-testid="button-confirm-purchase"
              >
                {botCheckMutation.isPending ? "Verifying..." : purchaseMembersMutation.isPending ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bot Check Dialog */}
      <Dialog open={botCheckDialogOpen} onOpenChange={setBotCheckDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Smart Serve Bot Required</DialogTitle>
            <DialogDescription className="text-gray-400">
              Our bot must be in your server to deliver members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-yellow-400 mb-2">Bot Permissions Needed:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• View server information</li>
                <li>• Send invite links</li>
                <li>• Track member joins</li>
                <li>• Manage member delivery</li>
              </ul>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-400">
                💡 After adding the bot, you can immediately proceed with your member purchase.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setBotCheckDialogOpen(false)} className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
              <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                <a href={botCheckData?.inviteUrl || "#"} target="_blank" rel="noopener noreferrer">
                  <Zap className="w-4 h-4 mr-2" />
                  Invite Bot
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}