import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ServerCard from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { usePageTitle } from "@/hooks/use-page-title";
import type { Server, Bot, Event, Slideshow } from "@shared/schema";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Explore() {
  // Get search query from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("servers");
  const [sortBy, setSortBy] = useState("members");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  usePageTitle("Explore Discord Universe");

  // Fetch slideshows for explore page
  const { data: slideshows, isLoading: loadingSlideshows } = useQuery<Slideshow[]>({
    queryKey: ["/api/slideshows", "explore"],
    queryFn: async () => {
      const response = await fetch("/api/slideshows?page=explore");
      if (!response.ok) throw new Error("Failed to fetch slideshows");
      return response.json();
    },
  });

  // Fetch servers (only when servers tab is active)
  const { data: servers, isLoading: loadingServers } = useQuery<Server[]>({
    queryKey: ["/api/servers", searchQuery, sortBy, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (sortBy) params.set("sort", sortBy);
      params.set("limit", "50");
      params.set("offset", "0");

      const response = await fetch(`/api/servers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch servers");
      return response.json();
    },
    enabled: activeTab === "servers",
  });

  // Fetch bots (only when bots tab is active)
  const { data: bots, isLoading: loadingBots } = useQuery<Bot[]>({
    queryKey: ["/api/bots", searchQuery, sortBy, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (sortBy) params.set("sort", sortBy);
      params.set("limit", "50");
      params.set("offset", "0");

      const response = await fetch(`/api/bots?${params}`);
      if (!response.ok) throw new Error("Failed to fetch bots");
      return response.json();
    },
    enabled: activeTab === "bots",
  });

  // Fetch events (only when events tab is active)
  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events", searchQuery, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      params.set("limit", "30");
      params.set("offset", "0");

      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    enabled: activeTab === "events",
  });

  const handleJoinServer = (serverId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login with Discord to join servers.",
        variant: "destructive",
      });
      return;
    }

    const server = (Array.isArray(servers) ? servers : []).find((s: Server) => s.id === serverId);
    if (server?.inviteCode) {
      window.open(`https://discord.gg/${server.inviteCode}`, '_blank');
    }
  };

  const handleAddBot = (bot: Bot) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login with Discord to add bots.",
        variant: "destructive",
      });
      return;
    }

    if (bot.inviteUrl) {
      window.open(bot.inviteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      

      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Explore Discord Universe
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing servers, powerful bots, and exciting events in the Discord community
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
            }
          }}>
            <Input
              placeholder="Search servers, bots, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-lg"
              data-testid="input-search"
            />
          </form>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>15K+ Servers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
            <span>8K+ Bots</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-700"></div>
            <span>500+ Events</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="servers" data-testid="tab-servers">
                <i className="fas fa-server mr-2"></i>
                Servers
              </TabsTrigger>
              <TabsTrigger value="bots" data-testid="tab-bots">
                <i className="fas fa-robot mr-2"></i>
                Bots
              </TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">
                <i className="fas fa-calendar mr-2"></i>
                Events
              </TabsTrigger>
            </TabsList>

            {activeTab !== "events" && (
              <Select onValueChange={setSortBy} defaultValue="members">
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members">Sort by Members</SelectItem>
                  <SelectItem value="newest">Sort by Newest</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Admin Slideshow Section - Moved here between tabs and content */}
          <section className="mb-8">
            {loadingSlideshows ? (
              <Skeleton className="w-full h-64 rounded-2xl" />
            ) : slideshows && slideshows.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {slideshows.map((slide: Slideshow) => (
                    <CarouselItem key={slide.id}>
                      <div className="relative h-64 rounded-2xl overflow-hidden">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="text-center text-white">
                            <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
                            {slide.linkUrl && (
                              <Button
                                onClick={() => slide.linkUrl && window.open(slide.linkUrl, '_blank', 'noopener,noreferrer')}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                data-testid={`button-slideshow-${slide.id}`}
                              >
                                Learn More
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : null}
          </section>

          <TabsContent value="servers">
            {loadingServers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Array.isArray(servers) ? servers : []).map((server: Server) => (
                  <ServerCard
                    key={server.id}
                    server={server}
                    onJoin={handleJoinServer}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bots">
            {loadingBots ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Array.isArray(bots) ? bots : []).map((bot: Bot) => (
                  <Card key={bot.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          {bot.avatar ? (
                            <img src={bot.avatar} alt={bot.name} className="w-full h-full rounded-xl" />
                          ) : (
                            <i className="fas fa-robot text-white text-2xl"></i>
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">{bot.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{bot.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span><i className="fas fa-server mr-1"></i>{bot.serverCount}</span>
                          <span className="px-2 py-1 bg-primary/10 rounded-full text-primary">{bot.type}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddBot(bot)}
                        className="w-full"
                        data-testid={`button-add-bot-${bot.id}`}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Add Bot
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            {loadingEvents ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6">
                    <Skeleton className="w-full h-48 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Array.isArray(events) ? events : []).map((event: Event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                    {event.imageUrl && (
                      <div className="w-full h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <i className="fas fa-calendar mr-2"></i>
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            {event.location}
                          </div>
                        )}
                      </div>
                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        data-testid={`button-view-event-${event.id}`}
                      >
                        <i className="fas fa-eye mr-2"></i>
                        View Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button
            variant="secondary"
            className="px-8 py-3 text-white"
            data-testid="button-load-more"
          >
            Load More {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}