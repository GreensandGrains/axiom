
import React from 'react';
import { useLocation } from 'wouter';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string[];
}

export function SEOHead({ 
  title = "Axiom - Discord Server Directory",
  description = "Discover amazing Discord servers, bots, and communities. Join thousands of active servers and grow your community with Axiom.",
  image = "/assets/axiom-logo.png",
  url,
  type = "website",
  keywords = []
}: SEOHeadProps) {
  const [location] = useLocation();
  const currentUrl = url || `https://axiom-discord.replit.app${location}`;
  const fullKeywords = ["discord", "servers", "bots", "community", "gaming", "directory", ...keywords].join(", ");

  React.useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', fullKeywords);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Add structured data for the page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "WebPage",
      "name": title,
      "description": description,
      "url": currentUrl,
      "image": image,
      "author": {
        "@type": "Organization",
        "name": "Axiom Discord Directory"
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"][data-page-schema]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-page-schema', 'true');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

  }, [title, description, image, currentUrl, type, fullKeywords]);

  return null; // This component doesn't render anything
}
