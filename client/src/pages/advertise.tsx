import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Server, Bot, Building2, Star, Zap, TrendingUp, CheckCircle } from "lucide-react";

export default function Advertise() {
  const advertisingOptions = [
    {
      id: "discord-server",
      title: "Advertise Your Discord Server",
      description: "Promote your Discord community to thousands of potential members. Get discovered by users looking for active servers in your niche.",
      icon: Server,
      features: [
        "Featured placement in server listings",
        "Category-specific promotion",
        "Member count boost visibility",
        "Custom server spotlight",
        "Analytics dashboard",
        "Community growth tools"
      ],
      gradient: "from-blue-500 to-cyan-400",
      cost: "Starting from $9.99"
    },
    {
      id: "discord-bot",
      title: "Advertise Your Discord Bot",
      description: "Showcase your Discord bot to server owners and developers. Increase installations and user engagement with targeted promotion.",
      icon: Bot,
      features: [
        "Bot directory featured listing",
        "Command showcase display",
        "Installation count highlights",
        "Developer verification badge",
        "Usage statistics tracking",
        "Integration guides"
      ],
      gradient: "from-purple-500 to-pink-400",
      cost: "Starting from $14.99"
    },
    {
      id: "business",
      title: "Advertise Your Business",
      description: "Connect with the Discord community to promote your products, services, or brand. Reach engaged audiences through targeted campaigns.",
      icon: Building2,
      features: [
        "Banner advertisements",
        "Sponsored content placement",
        "Community partnership programs",
        "Brand verification status",
        "Campaign performance metrics",
        "Custom branding options"
      ],
      gradient: "from-green-500 to-emerald-400",
      cost: "Starting from $29.99"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/20 via-background to-background">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text animate-gradient-x bg-300%">
                Advertise with Smart Serve
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Reach thousands of Discord users and grow your community, bot, or business with our targeted advertising solutions
              </p>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>High Engagement Rates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Instant Approval</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-primary" />
                <span>Premium Placement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advertising Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Advertising Option
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the advertising solution that best fits your needs and reach your target audience effectively
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advertisingOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card 
                key={option.id} 
                className="glass-card h-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group"
              >
                <CardHeader className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${option.gradient} shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground mb-2">
                      {option.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {option.description}
                    </p>
                  </div>
                  <div className="text-primary font-bold text-lg">
                    {option.cost}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">What's Included:</h4>
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
                      data-testid={`button-learn-more-${option.id}`}
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center space-y-8">
          <Card className="glass-card max-w-4xl mx-auto">
            <CardContent className="p-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Contact our team to discuss your advertising needs and get a custom quote for your campaign.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
                    data-testid="button-contact-sales"
                  >
                    Contact Sales Team
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                    data-testid="button-get-quote"
                  >
                    Get Free Quote
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">High Visibility</h3>
            <p className="text-muted-foreground">
              Get your content seen by thousands of active Discord users daily
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Quick Setup</h3>
            <p className="text-muted-foreground">
              Fast approval process and instant campaign activation
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Premium Support</h3>
            <p className="text-muted-foreground">
              Dedicated support team to help optimize your campaigns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}