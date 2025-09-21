import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Event, Slideshow } from "@shared/schema";

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch slideshows for events page
  const { data: slideshows, isLoading: loadingSlideshows } = useQuery<Slideshow[]>({
    queryKey: ["/api/slideshows", "events"],
    queryFn: async () => {
      const response = await fetch("/api/slideshows?page=events");
      if (!response.ok) throw new Error("Failed to fetch slideshows");
      return response.json();
    },
  });

  // Fetch events
  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events", searchQuery, filterBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (filterBy !== "all") params.set("filter", filterBy);
      params.set("limit", "50");
      params.set("offset", "0");

      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const handleJoinEvent = (eventId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login with Discord to join events.",
        variant: "destructive",
      });
      return;
    }

    // For now, just show a toast - in real implementation this would join the event
    toast({
      title: "Event Interest Registered",
      description: "We'll notify you with more details soon!",
    });
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return "upcoming";
    if (now >= startDate && now <= endDate) return "ongoing";
    return "ended";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Upcoming</Badge>;
      case "ongoing":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Live Now</Badge>;
      case "ended":
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Ended</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Discord Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and join amazing events happening across Discord communities
          </p>
        </div>

        {/* Admin Slideshow Section */}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-lg"
              data-testid="input-search-events"
            />
          </div>
          <Select onValueChange={setFilterBy} defaultValue="all">
            <SelectTrigger className="w-48" data-testid="select-filter-events">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Live Now</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="art">Art & Design</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        {loadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6">
                <Skeleton className="w-full h-48 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: Event) => {
                const status = getEventStatus(event);
                return (
                  <Card 
                    key={event.id} 
                    className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border hover:border-primary/50"
                  >
                    {/* Event Banner */}
                    {event.imageUrl ? (
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        <div className="absolute top-4 right-4">
                          {getStatusBadge(status)}
                        </div>

                        {event.featured && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-yellow-500/90 text-yellow-900">
                              <i className="fas fa-star mr-1"></i>
                              Featured
                            </Badge>
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        <div className="absolute top-4 right-4">
                          {getStatusBadge(status)}
                        </div>

                        {event.featured && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-yellow-500/90 text-yellow-900">
                              <i className="fas fa-star mr-1"></i>
                              Featured
                            </Badge>
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>
                        </div>
                      </div>
                    )}

                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>
                            {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Join Button */}
                      <Button 
                        onClick={() => handleJoinEvent(event.id)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 group relative overflow-hidden"
                        variant={status === "ended" ? "secondary" : "default"}
                        disabled={status === "ended"}
                        data-testid={`button-join-event-${event.id}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {status === "ended" ? (
                            <>
                              <Clock className="w-4 h-4" />
                              Event Ended
                            </>
                          ) : status === "ongoing" ? (
                            <>
                              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                              Join Live Event
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                              Show Interest
                            </>
                          )}
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <Button
                variant="secondary"
                className="px-8 py-3"
                data-testid="button-load-more-events"
              >
                Load More Events
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search or filter criteria to find more events."
                : "Check back later for upcoming events in the Discord community."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}