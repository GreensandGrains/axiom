import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { insertBotSchema } from "@shared/schema";
import { Bot, Upload, Image, Link2, Hash, Zap, Command, Settings, Type, Target } from "lucide-react";

const botFormSchema = insertBotSchema.extend({
  tags: z.string().optional(),
});

type BotFormData = z.infer<typeof botFormSchema>;

// Predefined tags for bots
const BOT_TAGS = {
  "Features": [
    "Music", "Moderation", "Economy", "Leveling", "Reaction Roles", "Tickets",
    "Polls", "Giveaways", "Welcome Bot", "Auto Mod", "Custom Commands", "Logs",
    "Fun Commands", "Utility", "Games", "Trivia", "Reminder", "Translator"
  ],
  "Categories": [
    "Multi-purpose", "Music Bot", "Moderation Bot", "Utility Bot", "Fun Bot",
    "Economy Bot", "Roleplay Bot", "Gaming Bot", "Social Bot", "Educational",
    "Art Bot", "Meme Bot", "News Bot", "Weather Bot", "Anime Bot"
  ],
  "Technology": [
    "Slash Commands", "Prefix Commands", "Web Dashboard", "AI Powered",
    "Machine Learning", "Open Source", "Premium Features", "Free", "24/7 Uptime",
    "Fast Response", "Lightweight", "Feature Rich", "Customizable", "Secure"
  ]
};

export default function AddBot() {
  const [, setLocation] = useLocation();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create bot mutation
  const createBotMutation = useMutation({
    mutationFn: async (data: BotFormData) => {
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };
      return apiRequest("/api/bots", "POST", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Bot Submitted for Review!",
        description: "Your Discord bot has been submitted and is under review. This may take up to 2 days.",
      });
      setLocation("/your-bots");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Bot",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<BotFormData>({
    resolver: zodResolver(botFormSchema),
    defaultValues: {
      name: "",
      description: "",
      botId: "",
      inviteUrl: "",
      tags: "",
      prefix: "",
      serverCount: 0,
      verified: false,
      featured: false,
      iconUrl: "",
      bannerUrl: "",
      uses: "",
      type: "",
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You need to be logged in to add a bot.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 15) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < 15) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setCustomTag("");
    }
  };

  const onSubmit = (data: BotFormData) => {
    setIsSubmitting(true);
    const botData = {
      ...data,
      tags: selectedTags.join(',')
    };
    createBotMutation.mutate(botData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text mb-2">
                Add Your Discord Bot
              </h1>
              <p className="text-muted-foreground text-lg">
                Share your amazing Discord bot with the community and help server owners discover new features.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/your-bots")}
              className="border-purple-400/30 hover:bg-purple-400/10"
            >
              Your Bots
            </Button>
          </div>

          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-500" />
                Bot Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        Bot Name *
                      </label>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Your Bot Name"
                                {...field}
                                data-testid="input-bot-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Bot Type *
                      </label>
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-bot-type">
                                  <SelectValue placeholder="Select bot type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="music">🎵 Music Bot</SelectItem>
                                <SelectItem value="moderation">🛡️ Moderation Bot</SelectItem>
                                <SelectItem value="utility">🔧 Utility Bot</SelectItem>
                                <SelectItem value="fun">🎮 Fun/Entertainment Bot</SelectItem>
                                <SelectItem value="economy">💰 Economy Bot</SelectItem>
                                <SelectItem value="roleplay">🎭 Roleplay Bot</SelectItem>
                                <SelectItem value="gaming">🎲 Gaming Bot</SelectItem>
                                <SelectItem value="social">👥 Social Bot</SelectItem>
                                <SelectItem value="multipurpose">⚡ Multi-purpose Bot</SelectItem>
                                <SelectItem value="other">📋 Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Visual Assets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Bot Icon URL
                      </label>
                      <FormField
                        control={form.control}
                        name="iconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="https://cdn.discordapp.com/avatars/..."
                                {...field}
                                data-testid="input-icon-url"
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              Direct link to your bot's avatar/icon image
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Bot Banner URL
                      </label>
                      <FormField
                        control={form.control}
                        name="bannerUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/banner.jpg"
                                {...field}
                                data-testid="input-banner-url"
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              Banner image for your bot (recommended: 1200x400px)
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Bot Technical Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Bot ID *
                      </label>
                      <FormField
                        control={form.control}
                        name="botId"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="123456789012345678"
                                {...field}
                                data-testid="input-bot-id"
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              You can find this in your bot's application page
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Command className="w-4 h-4" />
                        Bot Prefix
                      </label>
                      <FormField
                        control={form.control}
                        name="prefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="! or $ or //"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-prefix"
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              Command prefix (leave empty for slash commands only)
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      Bot Invite URL *
                    </label>
                    <FormField
                      control={form.control}
                      name="inviteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="https://discord.com/api/oauth2/authorize?client_id=..."
                              {...field}
                              data-testid="input-invite-url"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            The invite link for users to add your bot to their servers
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Bot Purpose & Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Bot Uses/Purpose *
                    </label>
                    <FormField
                      control={form.control}
                      name="uses"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="What is your bot used for? (e.g., Music playback, Server moderation, Fun commands, etc.)"
                              {...field}
                              data-testid="textarea-uses"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bot Description *</label>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Describe your bot's features and capabilities in detail..."
                              {...field}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tags Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium leading-none flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Bot Tags
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select tags that describe your bot's features (maximum 15 tags)
                      </p>
                    </div>

                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-purple-400">Selected Tags ({selectedTags.length}/15)</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 cursor-pointer transition-colors"
                              onClick={() => toggleTag(tag)}
                              data-testid={`badge-selected-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Tag Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Add Custom Tag</label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter custom tag..."
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomTag();
                            }
                          }}
                          className="flex-1 bg-background/50 border-purple-400/30 focus:border-purple-400/50"
                          data-testid="input-custom-tag"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addCustomTag}
                          disabled={!customTag.trim() || selectedTags.length >= 15}
                          className="border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10"
                          data-testid="button-add-custom-tag"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Available Tags */}
                    <div className="space-y-3">
                      {Object.entries(BOT_TAGS).map(([category, tags]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => {
                              const isSelected = selectedTags.includes(tag);
                              const isDisabled = !isSelected && selectedTags.length >= 15;

                              return (
                                <Badge
                                  key={tag}
                                  variant={isSelected ? "default" : "outline"}
                                  className={`cursor-pointer transition-all duration-200 ${
                                    isSelected
                                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                                      : isDisabled
                                      ? "opacity-50 cursor-not-allowed border-muted-foreground/20 text-muted-foreground"
                                      : "border-purple-400/30 text-muted-foreground hover:border-purple-400/50 hover:bg-purple-500/10 hover:text-purple-300"
                                  }`}
                                  onClick={() => !isDisabled && toggleTag(tag)}
                                  data-testid={`badge-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {tag}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting || createBotMutation.isPending}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex-1"
                      data-testid="button-publish"
                    >
                      {isSubmitting || createBotMutation.isPending ? "Publishing..." : "Publish Bot"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/")}
                      className="border-purple-400/30 hover:bg-purple-400/10"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}