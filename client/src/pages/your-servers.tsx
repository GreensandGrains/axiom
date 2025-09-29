import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Users, Settings, ExternalLink, Crown, Bot, Megaphone } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Server } from "@shared/schema";

// Placeholder for Input component if it's not globally available
// If Input is a custom component, ensure it's imported correctly.
// For this example, assuming it's available or a simple input is intended.
// const Input = ({ id, value, onChange, placeholder, className }) => (
//   <input id={id} value={value} onChange={onChange} placeholder={placeholder} className={className} />
// );

export default function YourServers() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showBotModal, setShowBotModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [botInviteUrl, setBotInviteUrl] = useState("");

  // Fetch user's servers where they have admin powers
  const { data: userServers, isLoading, refetch } = useQuery({
    queryKey: ["/api/servers/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/servers/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch your servers");
      const servers = await response.json();
      console.log('Fetched servers with icon data:', servers);
      return servers;
    },
    enabled: !!user?.id,
  });

  // Bump settings mutation
  const updateBumpSettings = useMutation({
    mutationFn: async ({ serverId, bumpEnabled }: { serverId: string; bumpEnabled: boolean }) => {
      const response = await fetch(`/api/servers/${serverId}/bump-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bumpEnabled }),
      });
      if (!response.ok) throw new Error('Failed to update bump settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Bump settings have been updated successfully.",
      });
      refetch();
      setShowSettingsModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleAdvertiseClick = async (server: Server) => {
    try {
      console.log(`Checking bot presence for server: ${server.name} (${server.discordId || server.id})`);
      const guildId = server.discordId || server.id;
      const response = await fetch(`/api/discord/bot-check/${guildId}`);

      let data;
      if (response.ok) {
        data = await response.json();
        console.log(`Bot check result:`, data);

        if (data.botPresent) {
          // Bot is present, redirect to add-server page
          console.log(`✅ Bot is present in ${server.name}, redirecting to add-server`);
          window.location.href = '/add-server';
          return;
        }
      } else {
        // Handle HTTP errors
        const errorData = await response.json();
        console.error(`Bot check HTTP error (${response.status}):`, errorData);
        data = {
          botPresent: false,
          checkMethod: "http_error",
          errorDetails: errorData.message,
          inviteUrl: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_BOT_CLIENT_ID || '1418600262938923220'}&permissions=8&integration_type=0&scope=bot+applications.commands`
        };
      }

      // Bot is not present or there was an error, show modal with details
      console.log(`❌ Bot is NOT present in ${server.name} (${data.checkMethod}), showing invite modal`);
      if (data.errorDetails) {
        console.log(`Error details: ${data.errorDetails}`);
      }

      setSelectedServer(server);
      setBotInviteUrl(data.inviteUrl);
      setShowBotModal(true);

    } catch (error) {
      console.error('Error checking bot presence:', error);
      // Fallback: show modal to invite bot
      console.log(`❌ Fallback: showing invite modal for ${server.name}`);
      setSelectedServer(server);
      setBotInviteUrl(`https://discord.com/oauth2/authorize?client_id=1418600262938923220&permissions=8&integration_type=0&scope=bot+applications.commands`);
      setShowBotModal(true);
    }
  };

  const handleRetryBotCheck = async () => {
    if (!selectedServer) return;

    try {
      console.log(`Retrying bot check for server: ${selectedServer.name}`);
      const response = await fetch(`/api/discord/bot-check/${selectedServer.id}`);
      if (!response.ok) throw new Error("Failed to check bot presence");

      const data = await response.json();
      console.log(`Retry bot check result:`, data);

      if (data.botPresent) {
        console.log(`Bot is now present in ${selectedServer.name}!`);
        setShowBotModal(false);
        // Bot is now present, redirect to advertise page
        window.location.href = '/add-server';
      } else {
        console.log(`Bot is still not present in ${selectedServer.name}`);
        // Still not present, keep modal open but show a message
        alert('Bot is still not detected. Please make sure the bot invitation was completed successfully and try again in a few moments.');
      }
    } catch (error) {
      console.error('Error retrying bot check:', error);
      alert('Failed to check bot presence. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Servers
            </h1>
            <p className="text-muted-foreground mb-8">
              Please login to view your Discord servers
            </p>
            <Button onClick={() => window.location.href = '/api/auth/discord'}>
              <i className="fab fa-discord mr-2"></i>
              Login with Discord
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Servers
              </h1>
              <p className="text-muted-foreground">
                Manage Discord servers where you have admin permissions
              </p>
            </div>
            <Link href="/add-server">
              <Button 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                data-testid="button-add-new-server"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Server
              </Button>
            </Link>
          </div>
        </div>

        {/* Server Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userServers && userServers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userServers.map((server: Server) => (
              <div key={server.id} className="relative">
                <Card 
                  key={server.id} 
                  className="group border border-border bg-card/50 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                  data-testid={`card-server-${server.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden relative">
                          {server.icon && server.discordId ? (
                            <>
                              <img 
                                src={`https://cdn.discordapp.com/icons/${server.discordId}/${server.icon}.png?size=64`} 
                                alt={server.name}
                                className="w-full h-full rounded-xl object-cover absolute inset-0"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.style.display = 'none';
                                  const fallback = img.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                              <div 
                                className="fallback-icon w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg absolute inset-0"
                                style={{ display: 'none' }}
                              >
                                {server.name.charAt(0).toUpperCase()}
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                              {server.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {server.verified && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-check text-white text-xs"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-foreground mb-1 truncate">
                          {server.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {server.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{server.memberCount?.toLocaleString() || 0} members</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{server.onlineCount?.toLocaleString() || 0} online</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {server.tags && server.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {server.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {server.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{server.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Server Status Badges */}
                    <div className="flex items-center space-x-2">
                      {server.verified && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <i className="fas fa-check-circle mr-1 text-xs"></i>
                          Verified
                        </Badge>
                      )}
                      {server.featured && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10"
                        onClick={() => window.open(`https://discord.gg/${server.inviteCode}`, '_blank')}
                        data-testid={`button-visit-${server.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10"
                        onClick={() => {
                          setSelectedServer(server);
                          setShowSettingsModal(true);
                        }}
                        data-testid={`button-manage-${server.id}`}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Advertise Button */}
                <div className="relative mt-3">
                  <Button
                    onClick={() => handleAdvertiseClick(server)}
                    variant="ghost"
                    size="sm"
                    className="w-full h-10 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                    data-testid={`button-advertise-${server.id}`}
                  >
                    <i className="fas fa-megaphone mr-2"></i>
                    Advertise Server
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <Crown className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">No servers found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You don't have any servers listed on Smart Serve yet. Add your first server to get started!
            </p>
            <Link href="/add-server">
              <Button 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                data-testid="button-add-first-server"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Server
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Bot Invitation Modal */}
      <Dialog open={showBotModal} onOpenChange={setShowBotModal}>
        <DialogContent className="max-w-md mx-auto bg-card border border-purple-400/30 backdrop-blur-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Bot Not Found!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Axiom Bot Required
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our Axiom bot is not present in <span className="font-semibold text-purple-400">{selectedServer?.name}</span>. 
                You must invite the bot first before you can advertise this server.
              </p>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mt-4">
                <p className="text-orange-300 text-xs">
                  ⚠️ Without our bot, server verification and analytics features won't work properly.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=1418600262938923220&permissions=8&integration_type=0&scope=bot+applications.commands')}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3"
                data-testid="button-invite-bot-to-server"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Invite Bot Now
              </Button>

              <Button
                onClick={handleRetryBotCheck}
                variant="outline"
                className="w-full border-green-400/50 hover:border-green-400/70 hover:bg-green-500/10 text-green-400 hover:text-green-300"
                data-testid="button-retry-bot-check"
              >
                <i className="fas fa-refresh mr-2"></i>
                Check Again
              </Button>

              <Button
                onClick={() => setShowBotModal(false)}
                variant="outline"
                className="w-full border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10"
                data-testid="button-cancel-bot-invite"
              >
                Cancel
              </Button>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> After inviting the bot, click "Check Again" to verify the bot is present, or wait a few moments and try "Advertise Server" again.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Server Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-md mx-auto bg-card border border-purple-400/30 backdrop-blur-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Server Settings
            </DialogTitle>
          </DialogHeader>

          {selectedServer && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden relative">
                  {selectedServer.icon && selectedServer.discordId ? (
                    <>
                      <img 
                        src={`https://cdn.discordapp.com/icons/${selectedServer.discordId}/${selectedServer.icon}.png?size=64`} 
                        alt={selectedServer.name}
                        className="w-full h-full rounded-xl object-cover absolute inset-0"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div 
                        className="fallback-icon w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg absolute inset-0"
                        style={{ display: 'none' }}
                      >
                        {selectedServer.name.charAt(0).toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {selectedServer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedServer.name}</h3>
                  <p className="text-sm text-muted-foreground">Server ID: {selectedServer.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="bump-enabled" className="text-sm font-medium flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-purple-400" />
                        Enable Bump System
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Allow your server to be bumped to other servers using /bump command
                      </p>
                    </div>
                    <Switch
                      id="bump-enabled"
                      checked={selectedServer.bumpEnabled || false}
                      onCheckedChange={(checked) => {
                        updateBumpSettings.mutate({
                          serverId: selectedServer.id,
                          bumpEnabled: checked
                        });
                      }}
                      disabled={updateBumpSettings.isPending}
                    />
                  </div>
                </div>

                {selectedServer.bumpEnabled && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5"></div>
                      <div className="text-xs text-green-300">
                        <p className="font-medium">Bump System Active</p>
                        <p>Users can now use /bump command to promote this server across the network</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Bump Commands:</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• <code>/bump</code> - Bump server to all bump channels</p>
                    <p>• <code>/bumpchannel</code> - Set bump channel for this server</p>
                    <p>• <code>/bumptools</code> - View all bump commands</p>
                    <p>• <code>/setbump</code> - Get server bump link (admin only)</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSettingsModal(false)}
                  variant="outline"
                  className="flex-1 border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}