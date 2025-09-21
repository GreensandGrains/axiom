
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Users, Star, ExternalLink, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import backgroundImage from "@assets/generated_images/mengo-fedorov-forest-snow-parallax.gif";

interface Partnership {
  id: string;
  title: string;
  description: string;
  serverName: string;
  serverIcon: string;
  memberCount: number;
  partnershipType: string;
  requirements: string[];
  benefits: string[];
  contactInfo: string;
  discordLink: string;
  verified: boolean;
  featured: boolean;
  createdAt: string;
  ownerUsername: string;
}

export default function Partnership() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const { isAuthenticated } = useAuth();

  const { data: partnerships = [], isLoading } = useQuery({
    queryKey: ["/api/partnerships", searchQuery, selectedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedType !== "all") params.set("type", selectedType);
      
      const response = await fetch(`/api/partnerships?${params}`);
      if (!response.ok) throw new Error("Failed to fetch partnerships");
      return response.json();
    },
  });

  const partnershipTypes = [
    { value: "all", label: "All Types" },
    { value: "server_partnership", label: "Server Partnership" },
    { value: "bot_collaboration", label: "Bot Collaboration" },
    { value: "content_creation", label: "Content Creation" },
    { value: "event_hosting", label: "Event Hosting" },
    { value: "community_growth", label: "Community Growth" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Background */}
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
              <div className="inline-block p-3 rounded-xl bg-gradient-to-r from-purple-400 to-cyan-400">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                Partnership Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect, collaborate, and grow your Discord community through meaningful partnerships
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search partnerships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {partnershipTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Partnerships Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerships.map((partnership: Partnership) => (
                <Card key={partnership.id} className="hover:shadow-lg transition-shadow border-border bg-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={partnership.serverIcon} />
                          <AvatarFallback>{partnership.serverName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{partnership.title}</CardTitle>
                          <CardDescription className="text-sm">{partnership.serverName}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {partnership.verified && <Badge variant="default" className="mb-1">Verified</Badge>}
                        {partnership.featured && <Star className="w-4 h-4 text-yellow-400" />}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {partnership.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{partnership.memberCount?.toLocaleString()} members</span>
                      </div>
                      <Badge variant="secondary">{partnership.partnershipType.replace('_', ' ')}</Badge>
                    </div>

                    {partnership.requirements && partnership.requirements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {partnership.requirements.slice(0, 2).map((req, idx) => (
                            <li key={idx}>• {req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(partnership.discordLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Server
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = `/partnership/${partnership.id}`}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {partnerships.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No partnerships found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Be the first to create a partnership opportunity"}
              </p>
              {isAuthenticated && (
                <Button onClick={() => window.location.href = '/add-partnership'}>
                  Create First Partnership
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
