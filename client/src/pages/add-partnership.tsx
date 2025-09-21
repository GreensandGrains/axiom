import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertPartnershipSchema } from "@shared/schema";
import { Link2, Users, Search, Plus, X, ArrowLeft, CheckCircle } from "lucide-react";

interface ServerAnalysis {
  serverName: string;
  serverIcon: string;
  memberCount: number;
  verified: boolean;
}

const partnershipFormSchema = insertPartnershipSchema.extend({
  requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
  benefits: z.array(z.string()).min(1, "At least one benefit is needed"),
  joinEnabled: z.boolean().default(true),
});

type PartnershipFormData = z.infer<typeof partnershipFormSchema>;

export default function AddPartnership() {
  const [serverAnalysis, setServerAnalysis] = useState<ServerAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newRequirement, setNewRequirement] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const form = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipFormSchema),
    defaultValues: {
      title: "",
      description: "",
      serverName: "",
      serverIcon: "",
      memberCount: 0,
      partnershipType: "",
      requirements: [],
      benefits: [],
      contactInfo: "",
      discordLink: "",
      verified: false,
      featured: false,
      ownerId: user?.id || "",
      joinEnabled: true,
    },
  });

  const partnershipTypes = [
    { value: "server_partnership", label: "Server Partnership" },
    { value: "bot_collaboration", label: "Bot Collaboration" },
    { value: "content_creation", label: "Content Creation" },
    { value: "event_hosting", label: "Event Hosting" },
    { value: "community_growth", label: "Community Growth" },
  ];

  const analyzeServer = async () => {
    const inviteLink = form.getValues("discordLink");
    if (!inviteLink) {
      toast({
        title: "Server invite link required",
        description: "Please enter a Discord server invite link to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest("/api/partnerships/analyze", "POST", {
        serverLink: inviteLink,
      });

      if (!response.ok) throw new Error("Failed to analyze server");
      const data = await response.json();
      
      setServerAnalysis(data);
      form.setValue("serverName", data.serverName);
      form.setValue("serverIcon", data.serverIcon);
      form.setValue("memberCount", data.memberCount);
      form.setValue("verified", data.verified);

      toast({
        title: "Server analyzed successfully",
        description: `Found server: ${data.serverName} with ${data.memberCount} members`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze server. Make sure the invite link is valid and the bot has access.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createPartnershipMutation = useMutation({
    mutationFn: async (data: PartnershipFormData) => {
      const response = await apiRequest("/api/partnerships", "POST", data);
      if (!response.ok) throw new Error("Failed to create partnership");
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Partnership created:", data);
      toast({
        title: "Partnership created successfully",
        description: "Your partnership has been published and is now searchable.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partnerships"] });
      setTimeout(() => {
        window.location.href = "/partnership";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create partnership",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const current = form.getValues("requirements");
      form.setValue("requirements", [...current, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    const current = form.getValues("requirements");
    form.setValue("requirements", current.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      const current = form.getValues("benefits");
      form.setValue("benefits", [...current, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    const current = form.getValues("benefits");
    form.setValue("benefits", current.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PartnershipFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to create a partnership.",
        variant: "destructive",
      });
      return;
    }

    if (!serverAnalysis) {
      toast({
        title: "Server analysis required",
        description: "Please analyze your server first.",
        variant: "destructive",
      });
      return;
    }

    createPartnershipMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please login to create a partnership opportunity.
            </p>
            <Button onClick={() => window.location.href = "/login"}>
              Login to Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/partnership"}
              className="mr-4"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Partnerships
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create Partnership</h1>
              <p className="text-muted-foreground">
                Create a partnership opportunity for your Discord server
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Server Analysis Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Link2 className="w-5 h-5 mr-2" />
                    Server Analysis
                  </CardTitle>
                  <CardDescription>
                    Enter your Discord server invite link to automatically analyze your server
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="discordLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discord Server Invite Link</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="https://discord.gg/your-invite-code"
                              {...field}
                              data-testid="input-discord-link"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={analyzeServer}
                            disabled={isAnalyzing}
                            data-testid="button-analyze"
                          >
                            {isAnalyzing ? (
                              <Search className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Search className="w-4 h-4 mr-2" />
                            )}
                            Analyze
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {serverAnalysis && (
                    <div className="border rounded-lg p-4 bg-muted/50" data-testid="server-analysis-result">
                      <div className="flex items-center space-x-3">
                        <img
                          src={serverAnalysis.serverIcon}
                          alt="Server Icon"
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{serverAnalysis.serverName}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{serverAnalysis.memberCount?.toLocaleString()} members</span>
                            {serverAnalysis.verified && (
                              <Badge variant="default" className="ml-2">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Partnership Details</CardTitle>
                  <CardDescription>
                    Provide information about your partnership opportunity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partnership Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Looking for Gaming Community Partnership"
                            {...field}
                            data-testid="input-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnershipType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partnership Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-partnership-type">
                              <SelectValue placeholder="Select partnership type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {partnershipTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your partnership opportunity, what you're looking for, and what you can offer..."
                            rows={4}
                            {...field}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="memberCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Members Required</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 500"
                              {...field}
                              value={field.value?.toString() || "0"}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-member-count"
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum server size needed for partnership
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Information</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Discord username, email, etc."
                              {...field}
                              value={field.value || ""}
                              data-testid="input-contact"
                            />
                          </FormControl>
                          <FormDescription>
                            How interested servers can reach you
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="joinEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-end">
                          <FormLabel>Join Enabled</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-join-enabled"
                              />
                              <span className="text-sm">
                                {field.value ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Allow auto-joining to partnership
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Requirements Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Partnership Requirements</CardTitle>
                  <CardDescription>
                    What requirements do potential partners need to meet?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a requirement (e.g., Active community, 1000+ members)"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      data-testid="input-new-requirement"
                    />
                    <Button
                      type="button"
                      onClick={addRequirement}
                      disabled={!newRequirement.trim()}
                      data-testid="button-add-requirement"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {form.watch("requirements").map((requirement, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {requirement}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0 w-4 h-4"
                          onClick={() => removeRequirement(index)}
                          data-testid={`button-remove-requirement-${index}`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Partnership Benefits</CardTitle>
                  <CardDescription>
                    What benefits do you offer to partnership partners?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a benefit (e.g., Cross-promotion, Joint events)"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      data-testid="input-new-benefit"
                    />
                    <Button
                      type="button"
                      onClick={addBenefit}
                      disabled={!newBenefit.trim()}
                      data-testid="button-add-benefit"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {form.watch("benefits").map((benefit, index) => (
                      <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                        {benefit}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0 w-4 h-4"
                          onClick={() => removeBenefit(index)}
                          data-testid={`button-remove-benefit-${index}`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = "/partnership"}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPartnershipMutation.isPending || !serverAnalysis}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-testid="button-publish"
                >
                  {createPartnershipMutation.isPending ? (
                    <>
                      <Search className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish Partnership
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}