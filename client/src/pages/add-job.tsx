import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, X, DollarSign, Users, Briefcase, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface JobNeededFormData {
  userId: string;
  skills: string[];
  websiteUrl: string;
  description: string;
}

interface JobGivingFormData {
  userId: string;
  serverInviteLink: string;
  description: string;
  currency: string[];
}

export default function AddJob() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("job-needed");

  // Job Needed Form State
  const [jobNeededData, setJobNeededData] = useState<JobNeededFormData>({
    userId: "",
    skills: [],
    websiteUrl: "",
    description: ""
  });
  const [skillInput, setSkillInput] = useState("");

  // Job Giving Form State
  const [jobGivingData, setJobGivingData] = useState<JobGivingFormData>({
    userId: "",
    serverInviteLink: "",
    description: "",
    currency: []
  });
  const [currencyInput, setCurrencyInput] = useState("");

  // Add skill to job needed form
  const addSkill = () => {
    if (skillInput.trim() && !jobNeededData.skills.includes(skillInput.trim()) && jobNeededData.skills.length < 5) {
      setJobNeededData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  // Remove skill from job needed form
  const removeSkill = (skillToRemove: string) => {
    setJobNeededData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Add currency to job giving form
  const addCurrency = () => {
    if (currencyInput.trim() && !jobGivingData.currency.includes(currencyInput.trim())) {
      setJobGivingData(prev => ({
        ...prev,
        currency: [...prev.currency, currencyInput.trim()]
      }));
      setCurrencyInput("");
    }
  };

  // Remove currency from job giving form
  const removeCurrency = (currencyToRemove: string) => {
    setJobGivingData(prev => ({
      ...prev,
      currency: prev.currency.filter(currency => currency !== currencyToRemove)
    }));
  };

  // Submit job needed form
  const submitJobNeeded = useMutation({
    mutationFn: async (data: JobNeededFormData) => {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'job_needed',
          title: `Looking for ${data.skills.join(", ")} skills`,
          description: data.description,
          userId: data.userId,
          skills: data.skills,
          websiteUrl: data.websiteUrl,
          contactInfo: `User ID: ${data.userId}`,
          postedBy: user?.username || "Anonymous"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job posting');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job needed posting created successfully!",
      });
      // Reset form
      setJobNeededData({
        userId: "",
        skills: [],
        websiteUrl: "",
        description: ""
      });
      // Redirect to jobs page
      navigate('/jobs');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit job giving form
  const submitJobGiving = useMutation({
    mutationFn: async (data: JobGivingFormData) => {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'job_giving',
          title: `Offering job opportunity`,
          description: data.description,
          userId: data.userId,
          serverInviteLink: data.serverInviteLink,
          currency: data.currency,
          contactInfo: `User ID: ${data.userId}`,
          postedBy: user?.username || "Anonymous"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job posting');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job giving posting created successfully!",
      });
      // Reset form
      setJobGivingData({
        userId: "",
        serverInviteLink: "",
        description: "",
        currency: []
      });
      // Redirect to jobs page
      navigate('/jobs');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">Please log in to create job postings.</p>
          <Button onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/jobs")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Post a Job
              </h1>
              <p className="text-muted-foreground">
                Create a job posting to find talent or offer your services
              </p>
            </div>
          </div>

          {/* Job Form Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="job-needed" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Job Needed
              </TabsTrigger>
              <TabsTrigger value="job-giving" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Job Giving
              </TabsTrigger>
            </TabsList>

            {/* Job Needed Tab */}
            <TabsContent value="job-needed" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Looking for Talent
                  </CardTitle>
                  <CardDescription>
                    Post what kind of skills and talent you're looking for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="userId-needed">User ID *</Label>
                    <Input
                      id="userId-needed"
                      placeholder="Enter your User ID"
                      value={jobNeededData.userId}
                      onChange={(e) => setJobNeededData(prev => ({ ...prev, userId: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Skills Needed * (Max 5)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        disabled={jobNeededData.skills.length >= 5}
                      />
                      <Button 
                        type="button" 
                        onClick={addSkill}
                        disabled={!skillInput.trim() || jobNeededData.skills.length >= 5}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobNeededData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {jobNeededData.skills.length}/5 skills added
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website-url" className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Website URL (Optional)
                    </Label>
                    <Input
                      id="website-url"
                      type="url"
                      placeholder="https://your-website.com"
                      value={jobNeededData.websiteUrl}
                      onChange={(e) => setJobNeededData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description-needed">Description *</Label>
                    <Textarea
                      id="description-needed"
                      placeholder="Describe what you're looking for, project details, requirements, etc."
                      value={jobNeededData.description}
                      onChange={(e) => setJobNeededData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <Button 
                    onClick={() => submitJobNeeded.mutate(jobNeededData)}
                    disabled={!jobNeededData.userId || jobNeededData.skills.length === 0 || !jobNeededData.description || submitJobNeeded.isPending}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {submitJobNeeded.isPending ? "Publishing..." : "Publish Job Needed"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Job Giving Tab */}
            <TabsContent value="job-giving" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-400" />
                    Offering Services
                  </CardTitle>
                  <CardDescription>
                    Post the services or jobs you're offering
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="userId-giving">User ID *</Label>
                    <Input
                      id="userId-giving"
                      placeholder="Enter your User ID"
                      value={jobGivingData.userId}
                      onChange={(e) => setJobGivingData(prev => ({ ...prev, userId: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="server-invite">Server Invite Link *</Label>
                    <Input
                      id="server-invite"
                      placeholder="https://discord.gg/your-server"
                      value={jobGivingData.serverInviteLink}
                      onChange={(e) => setJobGivingData(prev => ({ ...prev, serverInviteLink: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Currency/Payment Options</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add currency (e.g., USD, EUR, BTC)..."
                        value={currencyInput}
                        onChange={(e) => setCurrencyInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCurrency())}
                      />
                      <Button 
                        type="button" 
                        onClick={addCurrency}
                        disabled={!currencyInput.trim()}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobGivingData.currency.map((currency, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {currency}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeCurrency(currency)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description-giving">Job Description *</Label>
                    <Textarea
                      id="description-giving"
                      placeholder="Describe the services you're offering, your experience, pricing, etc."
                      value={jobGivingData.description}
                      onChange={(e) => setJobGivingData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <Button 
                    onClick={() => submitJobGiving.mutate(jobGivingData)}
                    disabled={!jobGivingData.userId || !jobGivingData.serverInviteLink || !jobGivingData.description || submitJobGiving.isPending}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {submitJobGiving.isPending ? "Publishing..." : "Publish Job Offer"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}