import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import Navbar from "@/components/navbar";
import ServerCard from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowLeft, Server, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Server as ServerType } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Get search params from URL
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [contentType, setContentType] = useState<"servers" | "bots" | "events" | "all">(
    initialType as "servers" | "bots" | "events" | "all"
  );
  const [sortBy, setSortBy] = useState("members");

  // Update URL when search query changes
  useEffect(() => {
    if (searchQuery) {
      const url = new URL(window.location.href);
      url.searchParams.set("q", searchQuery);
      window.history.pushState({}, "", url.toString());
    } else {
      // If searchQuery is cleared, remove 'q' param
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.pushState({}, "", url.toString());
    }
  }, [searchQuery]);

  // Fetch search results for specific content types
  const { data: searchResults, isLoading: loadingResults } = useQuery({
    queryKey: ["/api/search", searchQuery, sortBy, contentType],
    queryFn: async () => {
      if (!searchQuery.trim() || contentType === "all") return [];

      const params = new URLSearchParams();
      params.set("search", searchQuery);
      params.set("limit", "50");
      params.set("offset", "0");
      if (sortBy && contentType !== "events") params.set("sort", sortBy);

      let endpoint;
      switch (contentType) {
        case "servers":
          endpoint = "/api/servers";
          break;
        case "bots":
          endpoint = "/api/bots";
          break;
        case "events":
          endpoint = "/api/events";
          break;
        default:
          return [];
      }

      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) {
        console.error(`Failed to fetch ${contentType}: ${response.statusText}`);
        toast({
          title: "Error",
          description: `Could not fetch ${contentType}. Please try again later.`,
          variant: "destructive",
        });
        return []; // Return empty array on error to prevent crashing
      }
      const data = await response.json();
      // Ensure data is always an array, handle potential API inconsistencies
      return Array.isArray(data) ? data : [];
    },
    enabled: !!searchQuery.trim() && contentType !== "all", // Only enable query if searchQuery is not empty and not "all"
    onError: (error) => {
      console.error("Query Error:", error);
      toast({
        title: "Search Error",
        description: "An error occurred while fetching search results.",
        variant: "destructive",
      });
    },
  });

  // Fetch mixed results for broader search when no specific type is selected
  const { data: mixedResults, isLoading: loadingMixedResults } = useQuery({
    queryKey: ["/api/search/mixed", searchQuery, sortBy],
    queryFn: async () => {
      if (!searchQuery.trim()) return { servers: [], bots: [], events: [] };

      const params = new URLSearchParams();
      params.set("search", searchQuery);
      params.set("limit", "20");
      params.set("offset", "0");
      if (sortBy) params.set("sort", sortBy);

      // Fetch from all endpoints in parallel
      const [serversResponse, botsResponse, eventsResponse] = await Promise.all([
        fetch(`/api/servers?${params}`).catch(() => ({ ok: false })),
        fetch(`/api/bots?${params}`).catch(() => ({ ok: false })),
        fetch(`/api/events?${params}`).catch(() => ({ ok: false }))
      ]);

      const servers = serversResponse.ok ? await serversResponse.json() : [];
      const bots = botsResponse.ok ? await botsResponse.json() : [];
      const events = eventsResponse.ok ? await eventsResponse.json() : [];

      return {
        servers: Array.isArray(servers) ? servers : [],
        bots: Array.isArray(bots) ? bots : [],
        events: Array.isArray(events) ? events : []
      };
    },
    enabled: !!searchQuery.trim() && !contentType, // Only when no specific type is selected
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.set("q", searchQuery.trim());
      window.history.pushState({}, "", url.toString());
    } else {
      // If search is cleared, reset results and remove 'q' param
      navigate("/search"); // Navigate to clean search URL
    }
  };

  const handleJoinServer = (serverId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login with Discord to join servers.",
        variant: "destructive",
      });
      return;
    }

    // Ensure searchResults is treated as an array of ServerType
    const server = Array.isArray(searchResults) ? searchResults.find((s: any) => s.id === serverId) : undefined;
    if (server?.inviteCode) {
      window.open(`https://discord.gg/${server.inviteCode}`, '_blank');
    } else {
      toast({
        title: "Invite Not Found",
        description: "This server does not have a public invite code available.",
        variant: "warning",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-6 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Search Results
            </h1>

            {initialQuery && (
              <p className="text-xl text-gray-300 mb-8">
                Showing results for: <span className="font-semibold text-white">"{initialQuery}"</span>
              </p>
            )}

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for Discord servers, bots, or communities..."
                  className="pl-12 h-14 text-lg bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Content Type Toggle */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant={contentType === "all" ? "default" : "outline"}
              onClick={() => setContentType("all")}
              className="flex items-center space-x-2 border-gray-600 text-gray-400 hover:text-gray-300 data-[state=open]:bg-gray-600/20"
            >
              <Search className="w-4 h-4" />
              <span>All</span>
            </Button>
            <Button
              variant={contentType === "servers" ? "default" : "outline"}
              onClick={() => setContentType("servers")}
              className="flex items-center space-x-2 border-purple-600 text-purple-400 hover:text-purple-300 data-[state=open]:bg-purple-600/20"
            >
              <Server className="w-4 h-4" />
              <span>Servers</span>
            </Button>
            <Button
              variant={contentType === "bots" ? "default" : "outline"}
              onClick={() => setContentType("bots")}
              className="flex items-center space-x-2 border-blue-600 text-blue-400 hover:text-blue-300 data-[state=open]:bg-blue-600/20"
            >
              <Bot className="w-4 h-4" />
              <span>Bots</span>
            </Button>
            <Button
              variant={contentType === "events" ? "default" : "outline"}
              onClick={() => setContentType("events")}
              className="flex items-center space-x-2 border-green-600 text-green-400 hover:text-green-300 data-[state=open]:bg-green-600/20"
            >
              <i className="fas fa-calendar w-4 h-4"></i>
              <span>Events</span>
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Select onValueChange={setSortBy} defaultValue="members">
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-gray-300">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-gray-300">
                <SelectItem value="members">Sort by Members</SelectItem>
                <SelectItem value="newest">Sort by Newest</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="active">Most Active</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-6">
          {(loadingResults || loadingMixedResults) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="border border-gray-700 bg-gray-900/50">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-700 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-700 rounded w-full"></div>
                          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : contentType === "all" && mixedResults ? (
            // Mixed results for "All" content type
            <>
              {mixedResults.servers?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Servers ({mixedResults.servers.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mixedResults.servers.map((server: ServerType) => (
                      <ServerCard
                        key={server.id}
                        server={server}
                        onJoin={handleJoinServer}
                      />
                    ))}
                  </div>
                </div>
              )}

              {mixedResults.bots?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Bots ({mixedResults.bots.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mixedResults.bots.map((bot: any) => (
                      <Card key={bot.id} className="border border-gray-700 bg-gray-900/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-0">
                          <div className="flex items-start space-x-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                              {bot.iconUrl ? (
                                <img src={bot.iconUrl} alt={bot.name} className="w-full h-full rounded-xl" />
                              ) : (
                                <Bot className="w-8 h-8 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-white mb-1">{bot.name}</h3>
                              <p className="text-gray-400 text-sm mb-2 line-clamp-2">{bot.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>🤖 Bot</span>
                                {bot.tags && bot.tags.length > 0 && (
                                  <span>• {bot.tags.join(", ")}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700" 
                            onClick={() => bot.inviteUrl && window.open(bot.inviteUrl, '_blank')}
                          >
                            Add Bot
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {mixedResults.events?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                    <i className="fas fa-calendar w-5 h-5"></i>
                    Events ({mixedResults.events.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mixedResults.events.map((event: any) => (
                      <Card key={event.id} className="border border-gray-700 bg-gray-900/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-0">
                          {event.imageUrl && (
                            <div className="w-full h-32 mb-4 overflow-hidden rounded-lg">
                              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <h3 className="font-bold text-lg text-white mb-2">{event.title}</h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                            <i className="fas fa-calendar mr-1"></i>
                            {new Date(event.startDate).toLocaleDateString()}
                            {event.location && (
                              <>
                                <span>•</span>
                                <i className="fas fa-map-marker-alt mr-1"></i>
                                {event.location}
                              </>
                            )}
                          </div>
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            View Event
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {(!mixedResults.servers?.length && !mixedResults.bots?.length && !mixedResults.events?.length) && (
                <Card className="border border-gray-700 bg-gray-900/50">
                  <CardContent className="p-8 text-center">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                    <p className="text-gray-400">Try different search terms or browse specific categories.</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : searchResults && searchResults.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-gray-300">
                  Found <span className="font-semibold text-white">{searchResults.length}</span> {contentType} 
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((item: any) => (
                  contentType === "servers" ? (
                    <ServerCard
                      key={item.id}
                      server={item as ServerType}
                      onJoin={handleJoinServer}
                    />
                  ) : contentType === "events" ? (
                    <Card key={item.id} className="border border-gray-700 bg-gray-900/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-0">
                        {item.imageUrl && (
                          <div className="w-full h-32 mb-4 overflow-hidden rounded-lg">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <i className="fas fa-calendar mr-1"></i>
                          {new Date(item.startDate).toLocaleDateString()}
                          {item.location && (
                            <>
                              <span>•</span>
                              <i className="fas fa-map-marker-alt mr-1"></i>
                              {item.location}
                            </>
                          )}
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          View Event
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    // Bot Card Component
                    <Card key={item.id} className="border border-gray-700 bg-gray-900/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            {item.iconUrl ? (
                              <img src={item.iconUrl} alt={item.name} className="w-full h-full rounded-xl" />
                            ) : (
                              <Bot className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-white mb-1">{item.name}</h3>
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>🤖 Bot</span>
                              {item.tags && item.tags.length > 0 && (
                                <span>• {item.tags.join(", ")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700" 
                          onClick={() => item.inviteUrl && window.open(item.inviteUrl, '_blank')}
                        >
                          Add Bot
                        </Button>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            </>
          ) : searchQuery ? (
            <Card className="border border-gray-700 bg-gray-900/50">
              <CardContent className="p-8 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400 mb-4">
                  We couldn't find any {contentType} matching "{searchQuery}". Try:
                </p>
                <ul className="text-gray-400 text-sm space-y-1 mb-6">
                  <li>• Checking your spelling</li>
                  <li>• Using different keywords</li>
                  <li>• Trying a broader search term</li>
                  <li>• Switching between servers and bots</li>
                </ul>
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Browse All {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-gray-700 bg-gray-900/50">
              <CardContent className="p-8 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Start your search</h3>
                <p className="text-gray-400">
                  Enter a search term above to find Discord servers and bots
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}