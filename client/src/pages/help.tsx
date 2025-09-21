import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronRight, HelpCircle, MessageSquare, Lightbulb } from "lucide-react";
import Navbar from "@/components/navbar";
import { usePageTitle } from "@/hooks/use-page-title";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openItems, setOpenItems] = useState<string[]>([]);

  usePageTitle("Help Center");

  // Fetch FAQs from API
  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const response = await fetch("/api/faqs");
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      return response.json();
    },
  });

  // Filter FAQs based on search and category
  const filteredFAQs = faqs?.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory && faq.isActive;
  }) || [];

  // Get unique categories
  const categories = Array.from(new Set(faqs?.map(faq => faq.category) || []));

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
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
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12"
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              data-testid="category-all"
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-colors capitalize ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                data-testid={`category-${category}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
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
                            <MessageSquare className="w-5 h-5 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
                            {faq.question}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400 capitalize">
                              {faq.category}
                            </Badge>
                            {faq.tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-xs bg-gray-800 text-gray-300"
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
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-start space-x-3">
                          <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
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
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400">
                {searchQuery 
                  ? `No FAQs match your search for "${searchQuery}"`
                  : "No FAQs available in this category"
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
              Still need help?
            </CardTitle>
            <CardDescription className="text-gray-300">
              Can't find what you're looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/contact-us"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-center transition-colors"
                data-testid="link-contact-us"
              >
                Contact Support
              </a>
              <a 
                href="/support-ticket"
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-center border border-gray-700 transition-colors"
                data-testid="link-support-ticket"
              >
                Create Ticket
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}