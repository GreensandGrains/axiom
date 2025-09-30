
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Shield, AlertTriangle, Ban, CheckCircle, XCircle, Eye, MessageSquare, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Moderation() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState("");
  const [moderationReason, setModerationReason] = useState("");

  const { data: reports } = useQuery({
    queryKey: ["/api/moderation/reports"],
    queryFn: async () => {
      const response = await fetch("/api/moderation/reports");
      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: moderationStats } = useQuery({
    queryKey: ["/api/moderation/stats"],
    queryFn: async () => {
      const response = await fetch("/api/moderation/stats");
      if (!response.ok) throw new Error("Failed to fetch moderation stats");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const handleReportMutation = useMutation({
    mutationFn: async ({ reportId, action, reason }: { reportId: string; action: string; reason: string }) => {
      const response = await fetch(`/api/moderation/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!response.ok) throw new Error("Failed to process report");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/stats"] });
      setShowReportDialog(false);
      setSelectedReport(null);
      toast({
        title: "Success",
        description: "Moderation action completed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process moderation action.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-muted-foreground">You need admin privileges to access moderation tools.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Moderation Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage reported content and maintain community standards
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {reports?.filter((r: any) => r.status === 'pending')?.length || 0} Pending
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats?.totalReports || 0}</div>
              <p className="text-xs text-muted-foreground">
                {moderationStats?.reportsToday || 0} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats?.pendingReports || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions Taken</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats?.actionsToday || 0}</div>
              <p className="text-xs text-muted-foreground">
                Today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats?.avgResponseTime || "0h"}</div>
              <p className="text-xs text-muted-foreground">
                Average
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="actions">Recent Actions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports?.map((report: any) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={
                            report.status === 'pending' ? 'default' :
                            report.status === 'resolved' ? 'secondary' : 'destructive'
                          }>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">{report.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reported by: {report.reporterUsername}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowReportDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {!reports?.length && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">No pending reports</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Moderation Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Recent moderation actions will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Moderation configuration options will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Review Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Report</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedReport.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Action</Label>
                    <Select value={moderationAction} onValueChange={setModerationAction}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dismiss">Dismiss Report</SelectItem>
                        <SelectItem value="warn">Issue Warning</SelectItem>
                        <SelectItem value="remove">Remove Content</SelectItem>
                        <SelectItem value="ban">Ban User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Reason</Label>
                  <Textarea
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    placeholder="Explain the reasoning for this action..."
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleReportMutation.mutate({
                      reportId: selectedReport.id,
                      action: moderationAction,
                      reason: moderationReason
                    })}
                    disabled={!moderationAction || handleReportMutation.isPending}
                  >
                    Apply Action
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
