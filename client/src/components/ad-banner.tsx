
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  position: string;
}

interface AdBannerProps {
  position: string;
  className?: string;
}

export function AdBanner({ position, className = "" }: AdBannerProps) {
  const [ads, setAds] = React.useState<Ad[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`/api/ads?position=${position}`);
        if (response.ok) {
          const data = await response.json();
          setAds(data);
        }
      } catch (error) {
        console.error("Failed to fetch ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [position]);

  if (loading || ads.length === 0) {
    return null;
  }

  const ad = ads[0]; // Show first ad for the position

  return (
    <Card className={`border-dashed border-orange-300 bg-orange-50/50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-orange-600 font-medium">Advertisement</span>
        </div>
        {ad.imageUrl && (
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
            className="w-full h-32 object-cover rounded-md mb-3"
          />
        )}
        <h3 className="font-semibold text-sm mb-2">{ad.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{ad.content}</p>
        {ad.linkUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => window.open(ad.linkUrl, '_blank')}
          >
            Learn More
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
