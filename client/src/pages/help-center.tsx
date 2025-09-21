
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, HelpCircle, MessageSquare, ChevronRight, ChevronDown, Bot } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const response = await fetch("/api/faqs");
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      return response.json();
    },
  });

  const filteredFAQs = (faqs || []).filter((faq: FAQ) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-gray-400 text-lg">Find answers to frequently asked questions and get the help you need</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a1a2e] border-[#16213e] text-white placeholder-gray-500 h-12"
              data-testid="input-search"
            />
          </div>
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-[#1a1a2e] border-[#16213e]">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-[#16213e] rounded w-3/4"></div>
                    <div className="h-3 bg-[#16213e] rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map((faq: FAQ) => (
              <Card key={faq.id} className="bg-[#1a1a2e] border-[#16213e] hover:border-[#16213e]/80 transition-colors">
                <Collapsible>
                  <CollapsibleTrigger 
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left"
                    data-testid={`faq-trigger-${faq.id}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-white mb-2 flex items-start">
                            <MessageSquare className="w-5 h-5 mr-2 mt-0.5 text-purple-400 flex-shrink-0" />
                            {faq.question}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs border-[#16213e] text-gray-400 capitalize">
                              {faq.category}
                            </Badge>
                            {faq.tags?.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-xs bg-[#16213e] text-gray-300"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4">
                          {openItems.includes(faq.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="bg-[#16213e] rounded-lg p-4 border border-[#0f172a]">
                        <div className="flex items-start space-x-3">
                          <Bot className="w-5 h-5 mt-1 text-purple-400 flex-shrink-0" />
                          <div className="text-gray-300 leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-400">
              {searchQuery ? `No FAQs match "${searchQuery}"` : "No FAQs available at the moment"}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] border-t border-[#16213e] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/assets/axiom-logo.png" 
                  width="32"
                  height="32"
                  alt="Axiom Logo" 
                  className="object-contain rounded-lg"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.currentTarget.style.display = 'block';
                  }}
                />
                <span className="font-bold text-xl text-white">Axiom</span>
              </div>
              <p className="text-gray-400">
                Smart communities, smarter connections. Discover the best Discord servers and bots for your community.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Browse</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/explore" className="hover:text-purple-400 transition-colors">Discord Servers</a></li>
                <li><a href="/add-bot" className="hover:text-purple-400 transition-colors">Discord Bots</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Popular</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-purple-400 transition-colors">Help Center</a></li>
                <li><a href="/contact-us" className="hover:text-purple-400 transition-colors">Contact Us</a></li>
                <li><a href="/terms-of-service" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
                <li><a href="/privacy-policy" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/blog" className="hover:text-purple-400 transition-colors">Blog</a></li>
                <li><a href="https://discord.gg/axiom" className="hover:text-purple-400 transition-colors">Discord Server</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#16213e] mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Axiom. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
