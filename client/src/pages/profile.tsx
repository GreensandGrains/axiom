import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/navbar";
import { User, Calendar, Trophy, Coins, Settings, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You need to be logged in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Clean display name (remove username prefixes)
  const displayName = user.username?.replace(/^.*_/, '') || user.username;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="w-24 h-24 border-2 border-purple-400/30">
                  <AvatarImage
                    src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : undefined}
                    alt="Profile Avatar"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-foreground" data-testid="text-profile-name">
                      {displayName}
                    </h1>
                    {user.username === "aetherflux_02" && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Discord Member</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span data-testid="text-coins">{user?.coins || 0} Coins</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="border-purple-400/30 hover:bg-purple-400/10" data-testid="button-edit-profile">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity Overview */}
            <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Events Created</span>
                    <Badge variant="secondary" data-testid="text-events-created">0</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Servers Joined</span>
                    <Badge variant="secondary" data-testid="text-servers-joined">0</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Quests Completed</span>
                    <Badge variant="secondary" data-testid="text-quests-completed">0</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rewards Earned</span>
                    <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      0 Coins
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Start exploring to see your activity here!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Settings */}
          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Discord Information</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>Username: {user.username}</div>
                    <div>Discord ID: {user.discordId}</div>
                    {user.email && <div>Email: {user.email}</div>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Account Status</h3>
                  <div className="space-y-2">
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      Active
                    </Badge>
                    {user.username === "aetherflux_02" && (
                      <Badge variant="outline" className="border-purple-400 text-purple-400">
                        Administrator
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}