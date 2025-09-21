import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, MessageSquare, MapPin, Phone, CheckCircle } from "lucide-react";
import Navbar from "@/components/navbar";
import { usePageTitle } from "@/hooks/use-page-title";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  reason: string;
  description: string;
}

export default function ContactUs() {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    reason: "",
    description: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { toast } = useToast();

  usePageTitle("Contact Us");

  // Contact form submission mutation
  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Message Sent Successfully!",
        description: "We've received your message and will get back to you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Message",
        description: error.message || "An error occurred while sending your message.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.reason || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    contactMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      reason: "",
      description: ""
    });
    setIsSubmitted(false);
  };

  // List of countries for the dropdown
  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Italy", "Spain", "Netherlands",
    "Sweden", "Norway", "Denmark", "Finland", "Belgium", "Switzerland", "Austria", "Portugal", "Ireland",
    "Japan", "South Korea", "Singapore", "Hong Kong", "Taiwan", "India", "Brazil", "Mexico", "Argentina",
    "Chile", "Colombia", "Peru", "Russia", "Ukraine", "Poland", "Czech Republic", "Hungary", "Romania",
    "South Africa", "Nigeria", "Kenya", "Egypt", "Morocco", "Turkey", "Israel", "UAE", "Saudi Arabia",
    "Thailand", "Philippines", "Indonesia", "Malaysia", "Vietnam", "China", "New Zealand", "Other"
  ];

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
              <h1 className="text-2xl font-bold text-white mb-4">Thank You!</h1>
              <p className="text-gray-300 mb-6">
                Your message has been sent successfully. Our team will review your inquiry and 
                get back to you via email within 24-48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Send Another Message
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
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-400 text-lg">Get in touch with our team for support, questions, or feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                  Get in Touch
                </CardTitle>
                <CardDescription className="text-gray-400">
                  We're here to help and answer any questions you might have
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400 text-sm">support@axiom.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Discord</p>
                    <p className="text-gray-400 text-sm">Join our server for instant support</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Response Time</p>
                    <p className="text-gray-400 text-sm">24-48 hours via email</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-800/30">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-3">Quick Support</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Need immediate assistance? Check out our help center or create a support ticket for faster resolution.
                </p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                    <a href="/help">Visit Help Center</a>
                  </Button>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <a href="/support-ticket">Create Support Ticket</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Send us a Message</CardTitle>
                <CardDescription className="text-gray-400">
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        data-testid="input-first-name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Doe"
                        className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        data-testid="input-last-name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="john@example.com"
                        className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        data-testid="input-email"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  {/* Country and Reason */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country" className="text-gray-300">Country</Label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                        <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white" data-testid="select-country">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                          {countries.map((country) => (
                            <SelectItem key={country} value={country} className="text-white hover:bg-gray-700">
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reason" className="text-gray-300">Reason for Contact *</Label>
                      <Select value={formData.reason} onValueChange={(value) => handleInputChange("reason", value)}>
                        <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white" data-testid="select-reason">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="report" className="text-white hover:bg-gray-700">Report an Issue</SelectItem>
                          <SelectItem value="suggestion" className="text-white hover:bg-gray-700">Suggestion</SelectItem>
                          <SelectItem value="help" className="text-white hover:bg-gray-700">Need Help</SelectItem>
                          <SelectItem value="partnership" className="text-white hover:bg-gray-700">Partnership Inquiry</SelectItem>
                          <SelectItem value="billing" className="text-white hover:bg-gray-700">Billing Question</SelectItem>
                          <SelectItem value="feedback" className="text-white hover:bg-gray-700">General Feedback</SelectItem>
                          <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-gray-300">Message *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Please provide a detailed description of your inquiry, including any relevant information that would help us assist you better..."
                      className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[120px]"
                      data-testid="textarea-description"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                    data-testid="button-send-message"
                  >
                    {contactMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}