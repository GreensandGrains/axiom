import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import backgroundImage from "@assets/generated_images/Galaxy Far Away On.gif";

interface HeroSearchProps {
  onSearch: (query: string) => void;
}


export default function HeroSearch({ onSearch }: HeroSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Check if search query contains bot-related terms
      const query = searchQuery.trim().toLowerCase();
      const botTerms = ['bot', 'music bot', 'moderation bot', 'game bot', 'utility bot', 'fun bot'];
      const eventTerms = ['event', 'tournament', 'competition', 'meetup', 'workshop'];
      const serverTerms = ['server', 'guild', 'community', 'discord server'];
      
      let targetPage = '/explore';
      
      // Determine if this should go to search page for mixed results or explore for specific category
      if (botTerms.some(term => query.includes(term))) {
        targetPage = `/search?q=${encodeURIComponent(searchQuery.trim())}&type=bots`;
      } else if (eventTerms.some(term => query.includes(term))) {
        targetPage = `/search?q=${encodeURIComponent(searchQuery.trim())}&type=events`;
      } else if (serverTerms.some(term => query.includes(term))) {
        targetPage = `/search?q=${encodeURIComponent(searchQuery.trim())}&type=servers`;
      } else {
        // General search - show all results
        targetPage = `/search?q=${encodeURIComponent(searchQuery.trim())}&type=all`;
      }
      
      navigate(targetPage);
    }
    onSearch(searchQuery);
  };

  return (
    <section className="relative py-20 w-full overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a]">
      <div className="absolute z-0 inset-0 w-full h-full overflow-hidden">
        <img
          src={backgroundImage}
          alt="Background"
          className="absolute z-0 inset-0 w-full h-full object-cover object-bottom rounded-xl opacity-90"
        />
        <div className="absolute z-1 inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20 rounded-xl"></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="block text-white drop-shadow-lg">
            Find Your Perfect</span>
          
        
          <span className="block bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent animate-gradient-x bg-300% text-primary  shadow-md">
            Discord Community
          </span>
            
        </h1>

        <p className="text-xl text-gray-800 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
          ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ 
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search servers and bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/90 border-0 rounded-xl text-gray-900 placeholder-gray-500 search-glow focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            data-testid="input-search"
          />
        </form>

      </div>
    </section>
  );
}