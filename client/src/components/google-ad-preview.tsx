
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface GoogleAdPreviewProps {
  ad: {
    title: string;
    description: string;
    imageUrl?: string;
    targetUrl?: string;
  };
}

export function GoogleAdPreview({ ad }: GoogleAdPreviewProps) {
  return (
    <Card className="max-w-md border border-gray-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {ad.imageUrl && (
            <img 
              src={ad.imageUrl} 
              alt={ad.title}
              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-xs text-green-600 font-medium">Ad</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </div>
            <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer truncate">
              {ad.title || 'Your Headline Here'}
            </h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {ad.description || 'Your description will appear here. Make it compelling and clear.'}
            </p>
            {ad.targetUrl && (
              <p className="text-green-700 text-xs mt-1 truncate">
                {ad.targetUrl}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
