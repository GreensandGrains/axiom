
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, Mail, MessageSquare, Settings, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    serverUpdates: true,
    botAlerts: true,
    questCompletions: true,
    systemAnnouncements: true,
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    enabled: !!isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete notification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "Notification deleted successfully.",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch("/api/notifications/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-muted-foreground">Please log in to view notifications.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const unreadCount = notifications?.filter((n: any) => !n.read)?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated with your platform activity
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              <Bell className="w-4 h-4 mr-1" />
              {unreadCount} Unread
            </Badge>
            <Button
              variant="outline"
              onClick={() => {
                notifications?.forEach((notification: any) => {
                  if (!notification.read) {
                    markAsReadMutation.mutate(notification.id);
                  }
                });
              }}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
          </div>
        </div>

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            {notifications?.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification: any) => (
                  <Card key={notification.id} className={`${!notification.read ? 'border-blue-500 bg-blue-50/10' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {notification.type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                            {notification.type === 'system' && <Bell className="w-4 h-4 text-purple-500" />}
                            {notification.type === 'quest' && <MessageSquare className="w-4 h-4 text-green-500" />}
                            <Badge variant={notification.priority === 'high' ? 'destructive' : 'outline'}>
                              {notification.priority || 'normal'}
                            </Badge>
                            {!notification.read && <Badge>New</Badge>}
                          </div>
                          <h3 className="font-medium mb-1">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Delivery Methods</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.push}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, push: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Server Updates</Label>
                      <p className="text-sm text-muted-foreground">Updates about your servers</p>
                    </div>
                    <Switch
                      checked={notificationSettings.serverUpdates}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, serverUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Bot Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notifications about your bots</p>
                    </div>
                    <Switch
                      checked={notificationSettings.botAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, botAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Quest Completions</Label>
                      <p className="text-sm text-muted-foreground">When you complete quests</p>
                    </div>
                    <Switch
                      checked={notificationSettings.questCompletions}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, questCompletions: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">System Announcements</Label>
                      <p className="text-sm text-muted-foreground">Important platform updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemAnnouncements}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAnnouncements: checked }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => updateSettingsMutation.mutate(notificationSettings)}
                  disabled={updateSettingsMutation.isPending}
                  className="w-full"
                >
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
