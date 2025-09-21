import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Bot, Send, MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import { usePageTitle } from "@/hooks/use-page-title";

interface TicketData {
  subject: string;
  category: string;
  priority: string;
  description: string;
}

export default function SupportTicket() {
  const [formData, setFormData] = useState<TicketData>({
    subject: "",
    category: "",
    priority: "medium",
    description: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  usePageTitle("Support Ticket");

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketData) => {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create support ticket");
      return response.json();
    },
    onSuccess: (data) => {
      setTicketId(data.ticketId);
      setIsSubmitted(true);
      toast({
        title: "Ticket Created Successfully!",
        description: `Your support ticket #${data.ticketId} has been created and sent to our support bot.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Ticket",
        description: error.message || "An error occurred while creating your support ticket.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.category || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof TicketData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      category: "",
      priority: "medium",
      description: ""
    });
    setIsSubmitted(false);
    setTicketId("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Authentication Required</CardTitle>
              <CardDescription className="text-gray-400">
                Please log in to create a support ticket.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-800/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Ticket Created Successfully!</h1>
              <p className="text-gray-300 mb-6">
                Your support ticket has been created and forwarded to our support bot. 
                You'll receive updates via Discord DM.
              </p>
              <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold">Ticket ID: #{ticketId}</span>
                </div>
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                  Status: Submitted
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Create Another Ticket
                </Button>
                <Button 
                  asChild
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <a href="/">Return to Home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Support Ticket</h1>
          <p className="text-gray-400">Get direct assistance from our support bot</p>
        </div>

        {/* Bot Info */}
        <Card className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/30">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Direct Bot Support</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Your ticket will be sent directly to our support bot for immediate processing. 
                  You'll receive updates and responses via Discord DM.
                </p>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Bot Online</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Clock className="w-3 h-3" />
                    <span>Avg Response: 5 mins</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Ticket Form */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Ticket Details</CardTitle>
            <CardDescription className="text-gray-400">
              Please provide detailed information about your issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject */}
              <div>
                <Label htmlFor="subject" className="text-gray-300">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Brief description of your issue"
                  className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  data-testid="input-subject"
                  required
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-gray-300">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="technical" className="text-white hover:bg-gray-700">Technical Issue</SelectItem>
                      <SelectItem value="account" className="text-white hover:bg-gray-700">Account Problem</SelectItem>
                      <SelectItem value="billing" className="text-white hover:bg-gray-700">Billing Question</SelectItem>
                      <SelectItem value="feature" className="text-white hover:bg-gray-700">Feature Request</SelectItem>
                      <SelectItem value="bug" className="text-white hover:bg-gray-700">Bug Report</SelectItem>
                      <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white" data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="low" className="text-white hover:bg-gray-700">Low</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-gray-700">Medium</SelectItem>
                      <SelectItem value="high" className="text-white hover:bg-gray-700">High</SelectItem>
                      <SelectItem value="urgent" className="text-white hover:bg-gray-700">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-300">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Please provide a detailed description of your issue, including any error messages and steps to reproduce the problem..."
                  className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[120px]"
                  data-testid="textarea-description"
                  required
                />
              </div>

              {/* User Info Display */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-white font-medium mb-2">Your Information</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Username: {user?.username}</p>
                  <p>User ID: {user?.id}</p>
                  <p>This information will be included with your ticket</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createTicketMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                data-testid="button-submit-ticket"
              >
                {createTicketMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Creating Ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Support Ticket
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6 bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-400">
                <p className="font-medium text-gray-300 mb-1">Important Notes:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Tickets are processed by our automated support bot</li>
                  <li>You'll receive responses via Discord DM</li>
                  <li>For urgent issues, please contact us directly via Discord</li>
                  <li>Include as much detail as possible for faster resolution</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}