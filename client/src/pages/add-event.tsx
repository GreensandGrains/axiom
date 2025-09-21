import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import { Calendar, Upload, Gift, Users, Clock, MapPin, Award, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function AddEventPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "",
    imageUrl: "",
    serverLink: "",
    rewards: "",
    requirements: "",
    maxParticipants: "",
    registrationDeadline: "",
    startDate: "",
    endDate: "",
    location: "",
    featured: false,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You need to be logged in to create an event.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const eventData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        ownerId: user.id,
        isActive: true,
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        toast({
          title: "Event Created!",
          description: "Your event has been successfully created and is now live.",
        });
        setLocation("/events");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create event");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text mb-2">
              Create New Event
            </h1>
            <p className="text-muted-foreground text-lg">
              Create an amazing event for the Discord community to participate in.
            </p>
          </div>

          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Event Name *</Label>
                    <Input
                      id="title"
                      placeholder="Enter event name"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                      data-testid="input-event-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventType" className="text-sm font-medium">Event Type *</Label>
                    <Select value={formData.eventType} onValueChange={(value) => handleInputChange("eventType", value)}>
                      <SelectTrigger data-testid="select-event-type">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tournament">🏆 Tournament</SelectItem>
                        <SelectItem value="giveaway">🎁 Giveaway</SelectItem>
                        <SelectItem value="community">👥 Community Event</SelectItem>
                        <SelectItem value="gaming">🎮 Gaming Event</SelectItem>
                        <SelectItem value="contest">🏅 Contest</SelectItem>
                        <SelectItem value="meetup">🤝 Meetup</SelectItem>
                        <SelectItem value="workshop">📚 Workshop</SelectItem>
                        <SelectItem value="other">📋 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Event Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event in detail..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                    rows={4}
                    data-testid="textarea-event-description"
                  />
                </div>

                {/* Visual & Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="text-sm font-medium flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Event Poster URL
                    </Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/poster.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                      data-testid="input-event-poster"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serverLink" className="text-sm font-medium flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Discord Server Link
                    </Label>
                    <Input
                      id="serverLink"
                      type="url"
                      placeholder="https://discord.gg/your-server"
                      value={formData.serverLink}
                      onChange={(e) => handleInputChange("serverLink", e.target.value)}
                      data-testid="input-server-link"
                    />
                  </div>
                </div>

                {/* Rewards & Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rewards" className="text-sm font-medium flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Event Rewards
                    </Label>
                    <Textarea
                      id="rewards"
                      placeholder="List the rewards participants can win..."
                      value={formData.rewards}
                      onChange={(e) => handleInputChange("rewards", e.target.value)}
                      rows={3}
                      data-testid="textarea-event-rewards"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements" className="text-sm font-medium flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Requirements & Rules
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder="List any requirements or rules for participation..."
                      value={formData.requirements}
                      onChange={(e) => handleInputChange("requirements", e.target.value)}
                      rows={3}
                      data-testid="textarea-event-requirements"
                    />
                  </div>
                </div>

                {/* Capacity & Deadlines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants" className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Max Participants
                    </Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      placeholder="Leave empty for unlimited"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                      data-testid="input-max-participants"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationDeadline" className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Registration Deadline
                    </Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={formData.registrationDeadline}
                      onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                      data-testid="input-registration-deadline"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      required
                      data-testid="input-start-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">End Date & Time *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      required
                      data-testid="input-end-date"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location (Optional)
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Virtual, Discord Voice Channel, etc."
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    data-testid="input-event-location"
                  />
                </div>

                {/* Featured Event Toggle */}
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange("featured", checked)}
                    data-testid="switch-featured"
                  />
                  <Label className="text-sm font-medium">Feature this event (more visibility)</Label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex-1"
                    data-testid="button-create-event"
                  >
                    {isSubmitting ? "Creating Event..." : "Create Event"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/events")}
                    className="border-purple-400/30 hover:bg-purple-400/10"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}