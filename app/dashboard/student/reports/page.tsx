'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Upload,
  Send,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  Trash2,
  Plus,
  MessageSquare,
  Building,
  Users,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AnonymousReport, ReportAttachment } from '@/types';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { anonymousReports, addAnonymousReport } = useAppStore();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [newReport, setNewReport] = useState({
    category: 'academic' as 'academic' | 'harassment' | 'facilities' | 'staff' | 'other',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  // Get student's reports (anonymized)
  const studentReports = anonymousReports.filter(r => 
    // In a real system, this would be filtered by student ID
    // For demo purposes, we'll show a subset
    Math.random() > 0.7
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return MessageSquare;
      case 'harassment': return AlertCircle;
      case 'facilities': return Building;
      case 'staff': return Users;
      case 'other': return HelpCircle;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'text-blue-600 bg-blue-50';
      case 'harassment': return 'text-red-600 bg-red-50';
      case 'facilities': return 'text-green-600 bg-green-50';
      case 'staff': return 'text-purple-600 bg-purple-50';
      case 'other': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'secondary';
      case 'under_review': return 'default';
      case 'resolved': return 'success';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return Clock;
      case 'under_review': return Eye;
      case 'resolved': return CheckCircle2;
      case 'closed': return CheckCircle2;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'urgent': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = () => {
    if (!newReport.title || !newReport.description) {
      toast.error('Please fill in required fields');
      return;
    }

    const reportAttachments: ReportAttachment[] = attachments.map((file, index) => ({
      id: `att-${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: `/mock-files/${file.name}`,
    }));

    const report: AnonymousReport = {
      id: `RPT${Date.now()}`,
      category: newReport.category,
      title: newReport.title,
      description: newReport.description,
      attachments: reportAttachments,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      priority: newReport.priority,
    };

    addAnonymousReport(report);
    toast.success('Report submitted successfully! Your report has been received and will be reviewed.');
    
    // Reset form
    setNewReport({
      category: 'academic',
      title: '',
      description: '',
      priority: 'medium',
    });
    setAttachments([]);
    setShowSubmitDialog(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Anonymous Reports</h1>
          <p className="text-muted-foreground mt-1">
            Submit anonymous reports about academic or campus issues
          </p>
        </div>
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Submit Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Submit Anonymous Report</DialogTitle>
              <DialogDescription>
                Your report will be reviewed by the appropriate department. All reports are anonymous.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newReport.category}
                  onValueChange={(value) => setNewReport({ ...newReport, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic Issues</SelectItem>
                    <SelectItem value="harassment">Harassment/Discrimination</SelectItem>
                    <SelectItem value="facilities">Facilities/Infrastructure</SelectItem>
                    <SelectItem value="staff">Staff Conduct</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="Please provide as much detail as possible about the issue..."
                  rows={6}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={newReport.priority}
                  onValueChange={(value) => setNewReport({ ...newReport, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="attachments">Attachments (Optional)</Label>
                <div className="space-y-2">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB per file)
                  </p>
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAttachment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReport}>
                <Send className="mr-2 h-4 w-4" />
                Submit Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Privacy Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Your Privacy is Protected</AlertTitle>
        <AlertDescription>
          All reports are completely anonymous. We do not track or store any personal information that could identify you. 
          Your report will be reviewed by the appropriate department and action will be taken as needed.
        </AlertDescription>
      </Alert>

      {/* Report Categories Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              Academic Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Report concerns about grading, course content, academic policies, or educational quality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              Harassment/Discrimination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Report incidents of harassment, discrimination, or inappropriate behavior.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4" />
              Facilities Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Report problems with buildings, equipment, maintenance, or campus infrastructure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Staff Conduct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Report concerns about staff behavior, professionalism, or conduct.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wrench className="h-4 w-4" />
              Technical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Report problems with IT systems, software, or technical infrastructure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <HelpCircle className="h-4 w-4" />
              Other Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Report any other concerns that don't fit into the above categories.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Reports */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Reports</CardTitle>
              <CardDescription>
                Track the status of your submitted reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentReports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No reports yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Submit your first anonymous report to get started
                    </p>
                    <Button onClick={() => setShowSubmitDialog(true)}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit First Report
                    </Button>
                  </div>
                ) : (
                  studentReports.map((report) => {
                    const CategoryIcon = getCategoryIcon(report.category);
                    const StatusIcon = getStatusIcon(report.status);
                    
                    return (
                      <div key={report.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getCategoryColor(report.category)}`}>
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{report.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Submitted {new Date(report.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(report.priority)}>
                              {report.priority}
                            </Badge>
                            <Badge variant={getStatusColor(report.status) as any}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {report.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {report.description.length > 200 
                            ? `${report.description.substring(0, 200)}...` 
                            : report.description
                          }
                        </p>
                        
                        {report.attachments && report.attachments.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-2">Attachments:</p>
                            <div className="flex gap-2">
                              {report.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center gap-2 p-2 rounded-lg border">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{attachment.name}</span>
                                  <Button size="sm" variant="outline">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {report.reviewerNotes && (
                          <div className="p-3 rounded-lg bg-blue-50">
                            <p className="text-sm font-medium text-blue-900 mb-1">Reviewer Notes:</p>
                            <p className="text-sm text-blue-800">{report.reviewerNotes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Reports</CardTitle>
              <CardDescription>Reports that have been submitted and are awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentReports.filter(r => r.status === 'submitted').map((report) => {
                  const CategoryIcon = getCategoryIcon(report.category);
                  return (
                    <div key={report.id} className="p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getCategoryColor(report.category)}`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <h4 className="font-semibold">{report.title}</h4>
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="under_review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Under Review</CardTitle>
              <CardDescription>Reports currently being reviewed by the appropriate department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentReports.filter(r => r.status === 'under_review').map((report) => {
                  const CategoryIcon = getCategoryIcon(report.category);
                  return (
                    <div key={report.id} className="p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getCategoryColor(report.category)}`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <h4 className="font-semibold">{report.title}</h4>
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Under review since {report.reviewedAt && new Date(report.reviewedAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Reports</CardTitle>
              <CardDescription>Reports that have been reviewed and resolved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentReports.filter(r => r.status === 'resolved' || r.status === 'closed').map((report) => {
                  const CategoryIcon = getCategoryIcon(report.category);
                  return (
                    <div key={report.id} className="p-4 rounded-lg border bg-green-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getCategoryColor(report.category)}`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <h4 className="font-semibold">{report.title}</h4>
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Resolved {report.resolvedAt && new Date(report.resolvedAt).toLocaleDateString()}
                      </p>
                      {report.reviewerNotes && (
                        <p className="text-sm text-green-700 mt-2">
                          {report.reviewerNotes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Reporting Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">What to Include</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Specific details about the incident or issue</li>
                <li>• Date, time, and location when applicable</li>
                <li>• Names of people involved (if comfortable)</li>
                <li>• Any supporting evidence or documentation</li>
                <li>• Impact on you or others</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">What Happens Next</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your report is reviewed within 48 hours</li>
                <li>• Appropriate action is taken by relevant department</li>
                <li>• You can track the status of your report</li>
                <li>• Follow-up may be provided if needed</li>
                <li>• All reports are kept confidential</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
