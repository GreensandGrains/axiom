
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Edit, Timer, Upload, Image, Play, Pause, Eye, EyeOff, Zap, TrendingUp, Star, Users, Server, Bot, Calendar, MessageCircle, BarChart3, Search, Filter, Settings, Activity, Download, FileText, Globe, Shield, HeartHandshake, HelpCircle, BookOpen, PenTool } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/navbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { insertSlideshowSchema, type Slideshow, insertFaqSchema, type Faq } from "@shared/schema";
import backgroundImage from "@assets/generated_images/mengo-fedorov-forest-snow-parallax.gif";

// Interface definitions
interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  budget: number;
  spent: number;
  createdAt: string;
  ctr?: number;
  conversions?: number;
  cost?: number;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

interface LiveChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  status: 'read' | 'unread';
}

interface ServerAnalytics {
  serverId: string;
  serverName: string;
  memberCount: number;
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  activeMembers: number;
  messagesSent: number;
  joinRate: number;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for live chat
  const [liveChatMessages, setLiveChatMessages] = useState<LiveChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  // State for server management
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedServers, setSelectedServers] = useState<string[]>([]);

  // Blog management state
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogFormData, setBlogFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "announcements",
    coverImage: "",
    published: false,
    featured: false,
  });

  // Fetch data with new endpoints
  const { data: adsData, isLoading: adsLoading, refetch: refetchAds } = useQuery<Ad[]>({
    queryKey: ["/api/ads"],
    queryFn: async () => {
      const response = await fetch("/api/ads");
      if (!response.ok) throw new Error("Failed to fetch ads");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: liveStats } = useQuery({
    queryKey: ["/api/admin/live-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/live-stats");
      if (!response.ok) throw new Error("Failed to fetch live stats");
      return response.json();
    },
    enabled: !!user?.isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: serverAnalytics } = useQuery<ServerAnalytics[]>({
    queryKey: ["/api/admin/server-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/server-analytics");
      if (!response.ok) throw new Error("Failed to fetch server analytics");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: allServers } = useQuery<any[]>({
    queryKey: ["/api/servers"],
    queryFn: async () => {
      const response = await fetch("/api/servers");
      if (!response.ok) throw new Error("Failed to fetch servers");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch all slideshows for admin management
  const { data: allSlideshows, isLoading: slideshowsLoading, refetch: refetchSlideshows } = useQuery<Slideshow[]>({
    queryKey: ["/api/slideshows", "admin"],
    queryFn: async () => {
      // Fetch all slideshows (admin can see inactive ones too)
      const response = await fetch("/api/slideshows?includeInactive=true");
      if (!response.ok) throw new Error("Failed to fetch slideshows");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch all FAQs for admin management
  const { data: allFaqs, isLoading: faqsLoading, refetch: refetchFaqs } = useQuery<Faq[]>({
    queryKey: ["/api/faqs", "admin"],
    queryFn: async () => {
      // Fetch all FAQs (admin can see inactive ones too)
      const response = await fetch("/api/faqs");
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch all blog posts for admin management
  const { data: allBlogs, isLoading: blogsLoading, refetch: refetchBlogs } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts", "admin"],
    queryFn: async () => {
      const response = await fetch("/api/blog/posts?includeUnpublished=true");
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Slideshow mutations
  const createSlideshowMutation = useMutation({
    mutationFn: async (slideshowData: any) => {
      const response = await apiRequest("/api/slideshows", "POST", slideshowData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshows"] });
      refetchSlideshows();
      setShowSlideshowForm(false);
      setSlideshowFormData({
        title: "",
        imageUrl: "",
        linkUrl: "",
        order: 0,
        active: true,
      });
      toast({
        title: "Success!",
        description: "Slideshow created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create slideshow",
        variant: "destructive",
      });
    },
  });

  const updateSlideshowMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/slideshows/${id}`, "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshows"] });
      refetchSlideshows();
      setEditingSlideshow(null);
      setShowSlideshowForm(false);
      toast({
        title: "Success!",
        description: "Slideshow updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update slideshow",
        variant: "destructive",
      });
    },
  });

  const deleteSlideshowMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/slideshows/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshows"] });
      refetchSlideshows();
      toast({
        title: "Success!",
        description: "Slideshow deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete slideshow",
        variant: "destructive",
      });
    },
  });

  // FAQ mutations
  const createFaqMutation = useMutation({
    mutationFn: async (faqData: any) => {
      const response = await apiRequest("/api/faqs", "POST", faqData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      refetchFaqs();
      setShowFaqForm(false);
      setFaqFormData({
        question: "",
        answer: "",
        category: "general",
        tags: [] as string[],
        order: 0,
      });
      toast({
        title: "Success!",
        description: "FAQ created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create FAQ",
        variant: "destructive",
      });
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/faqs/${id}`, "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      refetchFaqs();
      setEditingFaq(null);
      setShowFaqForm(false);
      toast({
        title: "Success!",
        description: "FAQ updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update FAQ",
        variant: "destructive",
      });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/faqs/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      refetchFaqs();
      toast({
        title: "Success!",
        description: "FAQ deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete FAQ",
        variant: "destructive",
      });
    },
  });

  // Blog mutations
  const createBlogMutation = useMutation({
    mutationFn: async (blogData: any) => {
      const response = await apiRequest("/api/blog/posts", "POST", blogData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      refetchBlogs();
      setShowBlogForm(false);
      setBlogFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "announcements",
        coverImage: "",
        published: false,
        featured: false,
      });
      toast({
        title: "Success!",
        description: "Blog post created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/blog/posts/${id}`, "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      refetchBlogs();
      setEditingBlog(null);
      setShowBlogForm(false);
      toast({
        title: "Success!",
        description: "Blog post updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/blog/posts/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      refetchBlogs();
      toast({
        title: "Success!",
        description: "Blog post deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  // State for forms
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    position: "header",
  });

  // Slideshow management state
  const [showSlideshowForm, setShowSlideshowForm] = useState(false);
  const [editingSlideshow, setEditingSlideshow] = useState<Slideshow | null>(null);
  const [slideshowFormData, setSlideshowFormData] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    order: 0,
    active: true,
  });

  // FAQ management state
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [faqFormData, setFaqFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    tags: [] as string[],
    order: 0,
  });

  // Google Ad Preview Component
  const GoogleAdPreview = ({ ad }: { ad: any }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
      <div className="flex items-start space-x-3">
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt="Ad" className="w-16 h-16 object-cover rounded" />
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-xs text-gray-500">Ad</span>
            <Globe className="w-3 h-3 text-gray-500" />
          </div>
          <h3 className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">
            {ad.title || "Advertisement Title"}
          </h3>
          <p className="text-gray-800 text-sm mt-1">
            {ad.description || "Advertisement description goes here..."}
          </p>
          <div className="text-green-700 text-xs mt-1">
            {ad.targetUrl || "example.com"}
          </div>
        </div>
      </div>
    </div>
  );

  // Live Chat Component
  const LiveChatPanel = () => (
    <Card className="border border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
          Live Chat Support
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Manage live chat conversations with users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat List */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground mb-2">Active Conversations</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {liveChatMessages.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 border border-border rounded-lg cursor-pointer transition-colors ${
                    selectedChat === chat.id ? 'bg-primary/20 border-primary' : 'bg-card hover:bg-card/80'
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{chat.username}</p>
                      <p className="text-sm text-muted-foreground truncate">{chat.message}</p>
                    </div>
                    <Badge
                      variant={chat.status === 'read' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {chat.status === 'read' ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="border border-border rounded-lg p-4 bg-card">
            <h4 className="font-medium text-foreground mb-4">Chat Response</h4>
            <div className="space-y-4">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your response..."
                className="bg-background border-border text-foreground"
                rows={4}
              />
              <div className="flex space-x-2">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Send Response
                </Button>
                <Button size="sm" variant="outline" className="border-border text-muted-foreground">
                  Mark Resolved
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Server Analytics Component
  const ServerAnalyticsPanel = () => (
    <Card className="border border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
          Server Analytics & Insights
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Real-time server performance and growth metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search servers..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-background border-border">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analytics Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">
                  <Checkbox
                    checked={selectedServers.length > 0 && serverAnalytics?.every(s => selectedServers.includes(s.serverId))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedServers(serverAnalytics?.map(s => s.serverId) || []);
                      } else {
                        setSelectedServers([]);
                      }
                    }}
                    className="mr-2"
                  />
                  Server
                </TableHead>
                <TableHead className="text-muted-foreground">Members</TableHead>
                <TableHead className="text-muted-foreground">Daily Growth</TableHead>
                <TableHead className="text-muted-foreground">Active Rate</TableHead>
                <TableHead className="text-muted-foreground">Messages/Day</TableHead>
                <TableHead className="text-muted-foreground">Join Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serverAnalytics?.map((server) => (
                <TableRow key={server.serverId} className="border-border">
                  <TableCell className="text-foreground">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedServers.includes(server.serverId)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedServers([...selectedServers, server.serverId]);
                          } else {
                            setSelectedServers(selectedServers.filter(id => id !== server.serverId));
                          }
                        }}
                        className="mr-2"
                      />
                      {server.serverName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{server.memberCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={`text-sm ${server.dailyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {server.dailyGrowth >= 0 ? '+' : ''}{server.dailyGrowth}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Progress value={server.activeMembers} className="w-16" />
                      <span className="text-xs">{server.activeMembers}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{server.messagesSent.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{server.joinRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Bulk Operations */}
          {selectedServers.length > 0 && (
            <div className="flex space-x-2 mt-4 p-3 bg-card rounded-lg">
              <span className="text-muted-foreground">{selectedServers.length} servers selected:</span>
              <Button size="sm" variant="outline" className="border-border text-muted-foreground">
                <Download className="w-4 h-4 mr-1" />
                Export Data
              </Button>
              <Button size="sm" variant="outline" className="border-border text-muted-foreground">
                <Settings className="w-4 h-4 mr-1" />
                Bulk Edit
              </Button>
              <Button size="sm" variant="outline" className="border-destructive text-destructive">
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Ad Performance Analytics Component
  const AdPerformancePanel = () => (
    <Card className="border border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          Ad Performance Analytics
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Detailed metrics and performance data for advertisements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Ad Title</TableHead>
              <TableHead className="text-muted-foreground">Impressions</TableHead>
              <TableHead className="text-muted-foreground">Clicks</TableHead>
              <TableHead className="text-muted-foreground">CTR</TableHead>
              <TableHead className="text-muted-foreground">Conversions</TableHead>
              <TableHead className="text-muted-foreground">Cost</TableHead>
              <TableHead className="text-muted-foreground">Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adsData?.map((ad) => (
              <TableRow key={ad.id} className="border-border">
                <TableCell className="text-foreground font-medium">{ad.title}</TableCell>
                <TableCell className="text-muted-foreground">{(ad.impressions || 0).toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{(ad.clicks || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`text-sm ${(ad.ctr || 0) >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {((ad.ctr || 0) * 100).toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{ad.conversions || 0}</TableCell>
                <TableCell className="text-muted-foreground">${(ad.cost || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-border text-muted-foreground">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Ad Preview</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center p-4">
                        <GoogleAdPreview ad={ad} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4 text-foreground">Access Denied</h1>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Background */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 w-full h-full z-0">
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
              <div className="inline-block p-3 rounded-xl bg-gradient-to-r from-purple-400 to-cyan-400">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                Admin Control Center
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive platform management with real-time analytics and advanced tools
              </p>
            </div>

            {/* Live Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <div className="flex items-center justify-center space-x-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-foreground font-bold">{liveStats?.onlineUsers || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Online Users</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <div className="flex items-center justify-center space-x-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  <span className="text-foreground font-bold">{liveStats?.totalServers || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total Servers</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-foreground font-bold">{liveStats?.activeAds || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Active Ads</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <div className="flex items-center justify-center space-x-2">
                  <Bot className="w-5 h-5 text-orange-400" />
                  <span className="text-foreground font-bold">{liveStats?.botCommands || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Bot Commands/Hour</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-9 bg-card/50 border border-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary">Overview</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-primary">Google Ads</TabsTrigger>
            <TabsTrigger value="slideshows" className="data-[state=active]:bg-primary">Slideshows</TabsTrigger>
            <TabsTrigger value="blogs" className="data-[state=active]:bg-primary">Blog Posts</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary">Analytics</TabsTrigger>
            <TabsTrigger value="servers" className="data-[state=active]:bg-primary">Servers</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-primary">Live Support</TabsTrigger>
            <TabsTrigger value="bot" className="data-[state=active]:bg-primary">Bot Control</TabsTrigger>
            <TabsTrigger value="faqs" className="data-[state=active]:bg-primary">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{liveStats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ad Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${liveStats?.adRevenue || 0}</div>
                  <p className="text-xs text-muted-foreground">+8% from last week</p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Support Tickets</CardTitle>
                  <HeartHandshake className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{liveStats?.supportTickets || 0}</div>
                  <p className="text-xs text-muted-foreground">5 pending resolution</p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Bot Uptime</CardTitle>
                  <Shield className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">99.9%</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Frequently used administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-16 flex-col"
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    Create Google Ad
                  </Button>
                  <Button
                    onClick={() => setShowBlogForm(true)}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 h-16 flex-col"
                  >
                    <PenTool className="w-5 h-5 mb-1" />
                    Write Blog Post
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-card h-16 flex-col"
                  >
                    <FileText className="w-5 h-5 mb-1" />
                    Export Reports
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-card h-16 flex-col"
                  >
                    <Settings className="w-5 h-5 mb-1" />
                    System Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <Card className="border border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Google-Style Advertisement Management</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create and manage Google Ads-style advertisements with professional layouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Current Advertisements</h3>
                  <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Google Ad
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-background border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Create Google-Style Advertisement</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Create professional advertisements with Google Ads appearance
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Form */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="ad-title" className="text-muted-foreground">Headline</Label>
                            <Input
                              id="ad-title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="Your compelling headline"
                              className="bg-background border-border text-foreground"
                              maxLength={30}
                            />
                            <p className="text-xs text-muted-foreground mt-1">{formData.title.length}/30 characters</p>
                          </div>

                          <div>
                            <Label htmlFor="ad-content" className="text-muted-foreground">Description</Label>
                            <Textarea
                              id="ad-content"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Describe your offer or service"
                              rows={3}
                              className="bg-background border-border text-foreground"
                              maxLength={90}
                            />
                            <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/90 characters</p>
                          </div>

                          <div>
                            <Label htmlFor="ad-url" className="text-muted-foreground">Final URL</Label>
                            <Input
                              id="ad-url"
                              value={formData.targetUrl}
                              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                              placeholder="https://your-website.com"
                              className="bg-background border-border text-foreground"
                            />
                          </div>

                          <div>
                            <Label htmlFor="ad-image" className="text-muted-foreground">Image URL (Optional)</Label>
                            <Input
                              id="ad-image"
                              value={formData.imageUrl}
                              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                              placeholder="https://your-image.jpg"
                              className="bg-background border-border text-foreground"
                            />
                          </div>

                          <div>
                            <Label htmlFor="ad-position" className="text-muted-foreground">Placement</Label>
                            <Select onValueChange={(value) => setFormData({ ...formData, position: value })} defaultValue={formData.position}>
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent className="bg-background border-border">
                                <SelectItem value="search-results">Search Results</SelectItem>
                                <SelectItem value="sidebar">Sidebar</SelectItem>
                                <SelectItem value="header">Header Banner</SelectItem>
                                <SelectItem value="footer">Footer</SelectItem>
                                <SelectItem value="between-content">Between Content</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button className="w-full bg-primary hover:bg-primary/90">
                            Create Advertisement
                          </Button>
                        </div>

                        {/* Live Preview */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground">Live Preview</h4>
                          <div className="bg-gray-100 p-6 rounded-lg">
                            <GoogleAdPreview ad={formData} />
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>• Headlines should be compelling and under 30 characters</p>
                            <p>• Descriptions should be clear and under 90 characters</p>
                            <p>• Images should be high quality and relevant</p>
                            <p>• URLs should lead to relevant landing pages</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {adsData?.map((ad) => (
                    <div key={ad.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="mb-3">
                        <GoogleAdPreview ad={ad} />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-muted-foreground">
                          <p>CTR: {((ad.ctr || 0) * 100).toFixed(2)}%</p>
                          <p>Clicks: {(ad.clicks || 0).toLocaleString()}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" className="border-border text-muted-foreground">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-border text-muted-foreground">
                            {ad.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="outline" className="border-destructive text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slideshows" className="space-y-6">
            <Card className="border border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Image className="w-5 h-5 mr-2 text-cyan-400" />
                  Slideshow Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage slideshows for explore and events pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Current Slideshows</h3>
                  <Dialog open={showSlideshowForm} onOpenChange={setShowSlideshowForm}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600" data-testid="button-create-slideshow">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Slideshow
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-background border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">
                          {editingSlideshow ? "Edit Slideshow" : "Create Slideshow"}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          {editingSlideshow ? "Update slideshow details" : "Create a new slideshow for explore or events pages"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="slideshow-title" className="text-muted-foreground">Title</Label>
                          <Input
                            id="slideshow-title"
                            value={slideshowFormData.title}
                            onChange={(e) => setSlideshowFormData({ ...slideshowFormData, title: e.target.value })}
                            placeholder="Slideshow title"
                            className="bg-background border-border text-foreground"
                            data-testid="input-slideshow-title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="slideshow-image" className="text-muted-foreground">Image URL</Label>
                          <Input
                            id="slideshow-image"
                            value={slideshowFormData.imageUrl}
                            onChange={(e) => setSlideshowFormData({ ...slideshowFormData, imageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="bg-background border-border text-foreground"
                            data-testid="input-slideshow-image"
                          />
                        </div>
                        <div>
                          <Label htmlFor="slideshow-link" className="text-muted-foreground">Link URL (Optional)</Label>
                          <Input
                            id="slideshow-link"
                            value={slideshowFormData.linkUrl}
                            onChange={(e) => setSlideshowFormData({ ...slideshowFormData, linkUrl: e.target.value })}
                            placeholder="https://example.com"
                            className="bg-background border-border text-foreground"
                            data-testid="input-slideshow-link"
                          />
                        </div>
                        <div>
                          <Label htmlFor="slideshow-order" className="text-muted-foreground">Display Order</Label>
                          <Input
                            id="slideshow-order"
                            type="number"
                            value={slideshowFormData.order}
                            onChange={(e) => setSlideshowFormData({ ...slideshowFormData, order: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            className="bg-background border-border text-foreground"
                            data-testid="input-slideshow-order"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={slideshowFormData.active}
                            onCheckedChange={(checked) => setSlideshowFormData({ ...slideshowFormData, active: checked })}
                            data-testid="switch-slideshow-active"
                          />
                          <Label className="text-muted-foreground">Active</Label>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowSlideshowForm(false);
                              setEditingSlideshow(null);
                              setSlideshowFormData({
                                title: "",
                                imageUrl: "",
                                linkUrl: "",
                                order: 0,
                                active: true,
                              });
                            }}
                            className="border-border text-muted-foreground"
                            data-testid="button-cancel-slideshow"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              if (editingSlideshow) {
                                updateSlideshowMutation.mutate({
                                  id: editingSlideshow.id,
                                  data: slideshowFormData
                                });
                              } else {
                                createSlideshowMutation.mutate(slideshowFormData);
                              }
                            }}
                            disabled={createSlideshowMutation.isPending || updateSlideshowMutation.isPending}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                            data-testid="button-save-slideshow"
                          >
                            {editingSlideshow ? "Update" : "Create"} Slideshow
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {slideshowsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border rounded-lg p-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allSlideshows?.map((slideshow) => (
                      <div key={slideshow.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {slideshow.imageUrl && (
                              <img
                                src={slideshow.imageUrl}
                                alt={slideshow.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <h4 className="text-foreground font-medium" data-testid={`text-slideshow-title-${slideshow.id}`}>
                                {slideshow.title}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>Order: {slideshow.order}</span>
                                <Badge variant={slideshow.active ? "default" : "destructive"}>
                                  {slideshow.active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingSlideshow(slideshow);
                                setSlideshowFormData({
                                  title: slideshow.title,
                                  imageUrl: slideshow.imageUrl,
                                  linkUrl: slideshow.linkUrl || "",
                                  order: slideshow.order || 0,
                                  active: slideshow.active || false,
                                });
                                setShowSlideshowForm(true);
                              }}
                              className="border-border text-muted-foreground"
                              data-testid={`button-edit-slideshow-${slideshow.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                updateSlideshowMutation.mutate({
                                  id: slideshow.id,
                                  data: { active: !slideshow.active }
                                });
                              }}
                              className="border-border text-muted-foreground"
                              data-testid={`button-toggle-slideshow-${slideshow.id}`}
                            >
                              {slideshow.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteSlideshowMutation.mutate(slideshow.id)}
                              className="border-destructive text-destructive"
                              data-testid={`button-delete-slideshow-${slideshow.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {allSlideshows?.length === 0 && (
                      <div className="text-center py-8">
                        <Image className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No slideshows created yet</p>
                        <p className="text-sm text-muted-foreground">Create your first slideshow to get started</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blogs" className="space-y-6">
            <Card className="border border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
                      Blog Post Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Create and manage blog posts for the community
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowBlogForm(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    data-testid="button-add-blog"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Blog Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Blog Form Dialog */}
                {showBlogForm && (
                  <div className="mb-6 p-6 bg-card border border-border rounded-lg">
                    <h3 className="text-lg font-medium text-foreground mb-4">
                      {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="blog-title" className="text-muted-foreground">Title</Label>
                        <Input
                          id="blog-title"
                          value={blogFormData.title}
                          onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                          placeholder="Enter blog post title"
                          className="bg-background border-border text-foreground"
                          data-testid="input-blog-title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="blog-excerpt" className="text-muted-foreground">Excerpt</Label>
                        <Textarea
                          id="blog-excerpt"
                          value={blogFormData.excerpt}
                          onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                          placeholder="Brief description or excerpt"
                          className="bg-background border-border text-foreground"
                          rows={2}
                          data-testid="textarea-blog-excerpt"
                        />
                      </div>
                      <div>
                        <Label htmlFor="blog-content" className="text-muted-foreground">Content</Label>
                        <Textarea
                          id="blog-content"
                          value={blogFormData.content}
                          onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                          placeholder="Write your blog post content..."
                          className="bg-background border-border text-foreground"
                          rows={8}
                          data-testid="textarea-blog-content"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="blog-category" className="text-muted-foreground">Category</Label>
                          <Select 
                            value={blogFormData.category} 
                            onValueChange={(value) => setBlogFormData({ ...blogFormData, category: value })}
                          >
                            <SelectTrigger className="bg-background border-border text-foreground" data-testid="select-blog-category">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border">
                              <SelectItem value="announcements">Announcements</SelectItem>
                              <SelectItem value="tutorials">Tutorials</SelectItem>
                              <SelectItem value="community">Community</SelectItem>
                              <SelectItem value="updates">Platform Updates</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="blog-cover" className="text-muted-foreground">Cover Image URL</Label>
                          <Input
                            id="blog-cover"
                            value={blogFormData.coverImage}
                            onChange={(e) => setBlogFormData({ ...blogFormData, coverImage: e.target.value })}
                            placeholder="https://example.com/cover.jpg"
                            className="bg-background border-border text-foreground"
                            data-testid="input-blog-cover"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={blogFormData.published}
                            onCheckedChange={(checked) => setBlogFormData({ ...blogFormData, published: checked })}
                            data-testid="switch-blog-published"
                          />
                          <Label className="text-muted-foreground">Published</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={blogFormData.featured}
                            onCheckedChange={(checked) => setBlogFormData({ ...blogFormData, featured: checked })}
                            data-testid="switch-blog-featured"
                          />
                          <Label className="text-muted-foreground">Featured</Label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowBlogForm(false);
                            setEditingBlog(null);
                            setBlogFormData({
                              title: "",
                              content: "",
                              excerpt: "",
                              category: "announcements",
                              coverImage: "",
                              published: false,
                              featured: false,
                            });
                          }}
                          className="border-border text-muted-foreground"
                          data-testid="button-cancel-blog"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (editingBlog) {
                              updateBlogMutation.mutate({
                                id: editingBlog.id,
                                data: blogFormData
                              });
                            } else {
                              createBlogMutation.mutate(blogFormData);
                            }
                          }}
                          disabled={createBlogMutation.isPending || updateBlogMutation.isPending}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                          data-testid="button-save-blog"
                        >
                          {createBlogMutation.isPending || updateBlogMutation.isPending ? (
                            <>
                              <Timer className="w-4 h-4 mr-2 animate-spin" />
                              {editingBlog ? "Updating..." : "Creating..."}
                            </>
                          ) : (
                            editingBlog ? "Update Blog Post" : "Create Blog Post"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blog List */}
                {blogsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border rounded-lg p-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-full mb-1"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allBlogs?.map((blog) => (
                      <div key={blog.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-foreground font-medium mb-2" data-testid={`text-blog-title-${blog.id}`}>
                              {blog.title}
                            </h4>
                            <p className="text-muted-foreground text-sm mb-3" data-testid={`text-blog-excerpt-${blog.id}`}>
                              {blog.excerpt}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Badge variant="outline">{blog.category}</Badge>
                              <Badge variant={blog.published ? "default" : "destructive"}>
                                {blog.published ? "Published" : "Draft"}
                              </Badge>
                              {blog.featured && (
                                <Badge variant="secondary">Featured</Badge>
                              )}
                              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingBlog(blog);
                                setBlogFormData({
                                  title: blog.title,
                                  content: blog.content,
                                  excerpt: blog.excerpt,
                                  category: blog.category,
                                  coverImage: blog.coverImage || "",
                                  published: blog.published,
                                  featured: blog.featured,
                                });
                                setShowBlogForm(true);
                              }}
                              className="border-border text-muted-foreground"
                              data-testid={`button-edit-blog-${blog.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBlogMutation.mutate(blog.id)}
                              className="border-destructive text-destructive"
                              data-testid={`button-delete-blog-${blog.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {allBlogs?.length === 0 && (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No blog posts created yet</p>
                        <p className="text-sm text-muted-foreground">Create your first blog post to get started</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdPerformancePanel />
          </TabsContent>

          <TabsContent value="servers" className="space-y-6">
            <ServerAnalyticsPanel />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <LiveChatPanel />

            <Card className="border border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-blue-400" />
                  Discord Bot Assistance
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Automated Discord bot responses and assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Bot Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Online Status:</span>
                        <Badge className="bg-green-600">Online</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commands/Hour:</span>
                        <span className="text-foreground">{liveStats?.botCommands || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Servers Connected:</span>
                        <span className="text-foreground">{liveStats?.botServers || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full border-border text-muted-foreground">
                        Restart Bot
                      </Button>
                      <Button size="sm" variant="outline" className="w-full border-border text-muted-foreground">
                        Update Commands
                      </Button>
                      <Button size="sm" variant="outline" className="w-full border-border text-muted-foreground">
                        View Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bot" className="space-y-6">
            <Card className="border border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Discord Bot Control Panel</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage Discord bot settings and monitor performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Bot control interface will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blogs" className="space-y-6">
            <Card className="border border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <PenTool className="w-5 h-5 mr-2 text-green-400" />
                  Blog Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create and manage blog posts for the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Current Blog Posts</h3>
                  <Dialog open={showBlogForm} onOpenChange={setShowBlogForm}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Blog Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-background border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">
                          {editingBlog ? "Edit Blog Post" : "Create Blog Post"}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          {editingBlog ? "Update blog post details" : "Create a new blog post for the community"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="blog-title" className="text-muted-foreground">Title</Label>
                            <Input
                              id="blog-title"
                              value={blogFormData.title}
                              onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                              placeholder="Blog post title"
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                          <div>
                            <Label htmlFor="blog-category" className="text-muted-foreground">Category</Label>
                            <Select
                              value={blogFormData.category}
                              onValueChange={(value) => setBlogFormData({ ...blogFormData, category: value })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="announcements">Announcements</SelectItem>
                                <SelectItem value="updates">Updates</SelectItem>
                                <SelectItem value="guides">Guides</SelectItem>
                                <SelectItem value="community">Community</SelectItem>
                                <SelectItem value="news">News</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="blog-excerpt" className="text-muted-foreground">Excerpt</Label>
                          <Textarea
                            id="blog-excerpt"
                            value={blogFormData.excerpt}
                            onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                            placeholder="Brief description of the blog post"
                            className="bg-background border-border text-foreground"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="blog-content" className="text-muted-foreground">Content</Label>
                          <Textarea
                            id="blog-content"
                            value={blogFormData.content}
                            onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                            placeholder="Write your blog post content here..."
                            className="bg-background border-border text-foreground"
                            rows={8}
                          />
                        </div>
                        <div>
                          <Label htmlFor="blog-cover" className="text-muted-foreground">Cover Image URL</Label>
                          <Input
                            id="blog-cover"
                            value={blogFormData.coverImage}
                            onChange={(e) => setBlogFormData({ ...blogFormData, coverImage: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="bg-background border-border text-foreground"
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={blogFormData.published}
                              onCheckedChange={(checked) => setBlogFormData({ ...blogFormData, published: checked })}
                            />
                            <Label className="text-muted-foreground">Published</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={blogFormData.featured}
                              onCheckedChange={(checked) => setBlogFormData({ ...blogFormData, featured: checked })}
                            />
                            <Label className="text-muted-foreground">Featured</Label>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowBlogForm(false);
                              setEditingBlog(null);
                              setBlogFormData({
                                title: "",
                                content: "",
                                excerpt: "",
                                category: "announcements",
                                coverImage: "",
                                published: false,
                                featured: false,
                              });
                            }}
                            className="border-border text-muted-foreground"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              if (editingBlog) {
                                updateBlogMutation.mutate({
                                  id: editingBlog.id,
                                  data: blogFormData
                                });
                              } else {
                                createBlogMutation.mutate(blogFormData);
                              }
                            }}
                            disabled={createBlogMutation.isPending || updateBlogMutation.isPending}
                            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                          >
                            {editingBlog ? "Update" : "Create"} Blog Post
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {blogsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border rounded-lg p-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allBlogs?.map((blog) => (
                      <div key={blog.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-foreground font-medium">{blog.title}</h4>
                              <Badge variant={blog.published ? "default" : "destructive"}>
                                {blog.published ? "Published" : "Draft"}
                              </Badge>
                              {blog.featured && (
                                <Badge variant="secondary">Featured</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{blog.excerpt}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                              <span>Category: {blog.category}</span>
                              <span>•</span>
                              <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingBlog(blog);
                                setBlogFormData({
                                  title: blog.title,
                                  content: blog.content,
                                  excerpt: blog.excerpt,
                                  category: blog.category,
                                  coverImage: blog.coverImage || "",
                                  published: blog.published,
                                  featured: blog.featured,
                                });
                                setShowBlogForm(true);
                              }}
                              className="border-border text-muted-foreground"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBlogMutation.mutate(blog.id)}
                              disabled={deleteBlogMutation.isPending}
                              className="border-destructive text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faqs" className="space-y-6"></TabsContent>

          <TabsContent value="faqs" className="space-y-6">
            <Card className="border border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2 text-cyan-400" />
                      FAQ Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Manage frequently asked questions for user support
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowFaqForm(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    data-testid="button-add-faq"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* FAQ Form Dialog */}
                {showFaqForm && (
                  <div className="mb-6 p-6 bg-card border border-border rounded-lg">
                    <h3 className="text-lg font-medium text-foreground mb-4">
                      {editingFaq ? "Edit FAQ" : "Create New FAQ"}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="faq-question" className="text-muted-foreground">Question</Label>
                        <Input
                          id="faq-question"
                          value={faqFormData.question}
                          onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                          placeholder="Enter the frequently asked question"
                          className="bg-background border-border text-foreground"
                          data-testid="input-faq-question"
                        />
                      </div>
                      <div>
                        <Label htmlFor="faq-answer" className="text-muted-foreground">Answer</Label>
                        <Textarea
                          id="faq-answer"
                          value={faqFormData.answer}
                          onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                          placeholder="Enter the detailed answer"
                          className="bg-background border-border text-foreground"
                          rows={4}
                          data-testid="textarea-faq-answer"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="faq-category" className="text-muted-foreground">Category</Label>
                          <Select 
                            value={faqFormData.category} 
                            onValueChange={(value) => setFaqFormData({ ...faqFormData, category: value })}
                          >
                            <SelectTrigger className="bg-background border-border text-foreground" data-testid="select-faq-category">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border">
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="servers">Servers</SelectItem>
                              <SelectItem value="bots">Bots</SelectItem>
                              <SelectItem value="account">Account</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="faq-order" className="text-muted-foreground">Display Order</Label>
                          <Input
                            id="faq-order"
                            type="number"
                            value={faqFormData.order}
                            onChange={(e) => setFaqFormData({ ...faqFormData, order: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            className="bg-background border-border text-foreground"
                            data-testid="input-faq-order"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowFaqForm(false);
                            setEditingFaq(null);
                            setFaqFormData({
                              question: "",
                              answer: "",
                              category: "general",
                              tags: [],
                              order: 0,
                            });
                          }}
                          className="border-border text-muted-foreground"
                          data-testid="button-cancel-faq"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (editingFaq) {
                              updateFaqMutation.mutate({
                                id: editingFaq.id,
                                data: faqFormData
                              });
                            } else {
                              createFaqMutation.mutate(faqFormData);
                            }
                          }}
                          disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                          data-testid="button-save-faq"
                        >
                          {createFaqMutation.isPending || updateFaqMutation.isPending ? (
                            <>
                              <Timer className="w-4 h-4 mr-2 animate-spin" />
                              {editingFaq ? "Updating..." : "Creating..."}
                            </>
                          ) : (
                            editingFaq ? "Update FAQ" : "Create FAQ"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQ List */}
                {faqsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border rounded-lg p-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-full mb-1"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allFaqs?.map((faq) => (
                      <div key={faq.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-foreground font-medium mb-2" data-testid={`text-faq-question-${faq.id}`}>
                              {faq.question}
                            </h4>
                            <p className="text-muted-foreground text-sm mb-3" data-testid={`text-faq-answer-${faq.id}`}>
                              {faq.answer}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Badge variant="outline">{faq.category}</Badge>
                              <span>Order: {faq.order}</span>
                              <Badge variant={faq.isActive ? "default" : "destructive"}>
                                {faq.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingFaq(faq);
                                setFaqFormData({
                                  question: faq.question,
                                  answer: faq.answer,
                                  category: faq.category,
                                  tags: faq.tags as string[] || [],
                                  order: faq.order || 0,
                                });
                                setShowFaqForm(true);
                              }}
                              className="border-border text-muted-foreground"
                              data-testid={`button-edit-faq-${faq.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteFaqMutation.mutate(faq.id)}
                              className="border-destructive text-destructive"
                              data-testid={`button-delete-faq-${faq.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {allFaqs?.length === 0 && (
                      <div className="text-center py-8">
                        <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No FAQs created yet</p>
                        <p className="text-sm text-muted-foreground">Create your first FAQ to help users</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
