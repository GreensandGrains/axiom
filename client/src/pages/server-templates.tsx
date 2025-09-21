import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Copy, Eye, Download, Hash, Shield, Users, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import backgroundImage from "@assets/generated_images/mengo-fedorov-forest-snow-parallax.gif";

interface ServerTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  channels: string; // Changed to string to match JSON parsing
  roles: string;    // Changed to string to match JSON parsing
  templateLink: string;
  downloads: number;
  rating: number;
  createdBy: string;
  verified: boolean;
  featured: boolean;
  createdAt: string;
}

// Interface for parsing channels and roles, kept for clarity within the map functions
interface TemplateChannel {
  name: string;
  type: 'text' | 'voice' | 'category';
  position: number;
  category?: string;
  permissions?: any[];
}

interface TemplateRole {
  name: string;
  color: string;
  permissions: string[];
  position: number;
  mentionable: boolean;
}

export default function ServerTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<ServerTemplate | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/templates", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory !== "all") params.set("category", selectedCategory);

      const response = await fetch(`/api/templates?${params}`);
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    },
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "gaming", label: "Gaming" },
    { value: "community", label: "Community" },
    { value: "business", label: "Business" },
    { value: "education", label: "Education" },
    { value: "creative", label: "Creative" },
    { value: "roleplay", label: "Roleplay" },
    { value: "support", label: "Support" },
  ];

  const copyTemplateLink = (templateLink: string, templateName: string) => {
    navigator.clipboard.writeText(templateLink);
    toast({
      title: "Template link copied!",
      description: `Use /addtemplate ${templateLink} in your Discord server`,
    });
  };

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
                <Hash className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                Server Templates
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ready-to-use Discord server templates with pre-configured channels and roles
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
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
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
              {templates.map((template: ServerTemplate) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow border-border bg-card overflow-hidden">
                  {/* Preview Image */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    {template.previewImage ? (
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Hash className="w-16 h-16 text-purple-400/50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {template.featured && (
                        <Badge className="bg-yellow-500/90 text-black">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {template.verified && (
                        <Badge className="bg-green-500/90">Verified</Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <Badge variant="secondary">{template.category}</Badge>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {template.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          {template.rating}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-blue-400" />
                        <span>{JSON.parse(template.channels || '[]')?.length || 0} Channels</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span>{JSON.parse(template.roles || '[]')?.length || 0} Roles</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => copyTemplateLink(template.templateLink, template.name)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      Use: <code>/addtemplate {template.templateLink}</code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {templates.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Hash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Be the first to create a server template"}
              </p>
              {isAuthenticated && (
                <Button onClick={() => window.location.href = '/add-template'}>
                  Create First Template
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-6">
              <p className="text-muted-foreground">{previewTemplate.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Channels Preview */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-blue-400" />
                    Channels ({JSON.parse(previewTemplate.channels || '[]').length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {JSON.parse(previewTemplate.channels || '[]').map((channel: TemplateChannel, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        {channel.type === 'category' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-500 rounded"></div>
                            <span className="font-medium uppercase text-xs">{channel.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 ml-4">
                            {channel.type === 'voice' ? (
                              <Users className="w-4 h-4 text-green-400" />
                            ) : (
                              <Hash className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm">{channel.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roles Preview */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    Roles ({JSON.parse(previewTemplate.roles || '[]').length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {JSON.parse(previewTemplate.roles || '[]').map((role: TemplateRole, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: role.color || '#99aab5' }}
                        ></div>
                        <span className="text-sm font-medium">{role.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {role.permissions?.length || 0} perms
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    copyTemplateLink(previewTemplate.templateLink, previewTemplate.name)
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Template Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}