'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Building2,
  Calendar,
  MapPin,
  Clock,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Target,
  TrendingUp,
  DollarSign,
  Edit,
  Save,
  X,
  Plus,
  Download,
  Phone,
  Mail,
  Star,
  Award,
  Users,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Internship, InternshipMilestone, InternshipDocument } from '@/types';

export default function InternshipPage() {
  const { user } = useAuthStore();
  const { internships, addInternship, updateInternship } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  
  // Get student's internship
  const studentInternship = internships.find(i => i.studentId === user?.id);
  
  const [internshipData, setInternshipData] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    supervisorName: '',
    supervisorEmail: '',
    supervisorPhone: '',
    description: '',
    status: 'applied' as 'applied' | 'accepted' | 'in_progress' | 'completed',
  });

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'report' as 'report' | 'certificate' | 'evaluation' | 'other',
  });

  // Check if student is eligible (L3 only) - mock check
  const isEligible = true;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'secondary';
      case 'accepted': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'success';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return Clock;
      case 'accepted': return CheckCircle2;
      case 'in_progress': return TrendingUp;
      case 'completed': return Award;
      default: return Clock;
    }
  };

  const calculateProgress = () => {
    if (!studentInternship) return 0;
    
    const startDate = new Date(studentInternship.startDate);
    const endDate = new Date(studentInternship.endDate);
    const currentDate = new Date();
    
    if (currentDate < startDate) return 0;
    if (currentDate > endDate) return 100;
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  };

  const handleSaveInternship = () => {
    if (!internshipData.company || !internshipData.role) {
      toast.error('Please fill in required fields');
      return;
    }

    if (studentInternship) {
      updateInternship(studentInternship.id, internshipData);
      toast.success('Internship details updated successfully');
    } else {
      const newInternship: Internship = {
        id: `INT${Date.now()}`,
        studentId: user?.id || '',
        company: internshipData.company,
        role: internshipData.role,
        startDate: internshipData.startDate,
        endDate: internshipData.endDate,
        status: internshipData.status,
        supervisorName: internshipData.supervisorName,
        supervisorEmail: internshipData.supervisorEmail,
        supervisorPhone: internshipData.supervisorPhone,
        description: internshipData.description,
        progress: calculateProgress(),
        milestones: [],
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addInternship(newInternship);
      toast.success('Internship details saved successfully');
    }
    
    setIsEditing(false);
    setShowAddDialog(false);
  };

  const handleAddMilestone = () => {
    if (!newMilestone.title || !newMilestone.dueDate) {
      toast.error('Please fill in required fields');
      return;
    }

    if (studentInternship) {
      const milestone: InternshipMilestone = {
        id: `MIL${Date.now()}`,
        title: newMilestone.title,
        description: newMilestone.description,
        dueDate: newMilestone.dueDate,
        completed: false,
      };
      
      updateInternship(studentInternship.id, {
        milestones: [...studentInternship.milestones, milestone]
      });
      
      toast.success('Milestone added successfully');
      setNewMilestone({ title: '', description: '', dueDate: '' });
      setShowMilestoneDialog(false);
    }
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (studentInternship) {
      const updatedMilestones = studentInternship.milestones.map(milestone =>
        milestone.id === milestoneId
          ? { ...milestone, completed: !milestone.completed, completedDate: !milestone.completed ? new Date().toISOString() : undefined }
          : milestone
      );
      
      updateInternship(studentInternship.id, { milestones: updatedMilestones });
      toast.success('Milestone status updated');
    }
  };

  const handleAddDocument = () => {
    if (!newDocument.name) {
      toast.error('Please enter document name');
      return;
    }

    if (studentInternship) {
      const document: InternshipDocument = {
        id: `DOC${Date.now()}`,
        name: newDocument.name,
        type: newDocument.type,
        uploadedAt: new Date().toISOString(),
        url: `/mock-files/${newDocument.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      };
      
      updateInternship(studentInternship.id, {
        documents: [...studentInternship.documents, document]
      });
      
      toast.success('Document added successfully');
      setNewDocument({ name: '', type: 'report' });
      setShowDocumentDialog(false);
    }
  };

  const handleDownloadDocument = (document: InternshipDocument) => {
    // Mock download functionality
    toast.success(`Downloading ${document.name}`);
  };

  if (!isEligible) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Internship Program</h1>
          <p className="text-muted-foreground mt-1">
            Gain real-world experience through our internship program
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Yet Eligible</AlertTitle>
          <AlertDescription>
            The internship program is available for L3 students only. You'll be eligible once you reach Level 3.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Internship Program</h1>
          <p className="text-muted-foreground mt-1">
            Track your internship progress and submit reports
          </p>
        </div>
        <div className="flex gap-2">
          {studentInternship ? (
            !isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSaveInternship}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </>
            )
          ) : (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Internship
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Internship Details</DialogTitle>
                  <DialogDescription>
                    Enter your internship information to start tracking your progress
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        value={internshipData.company}
                        onChange={(e) => setInternshipData({ ...internshipData, company: e.target.value })}
                        placeholder="e.g., TechCorp Solutions"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Position/Role *</Label>
                      <Input
                        id="role"
                        value={internshipData.role}
                        onChange={(e) => setInternshipData({ ...internshipData, role: e.target.value })}
                        placeholder="e.g., Software Developer Intern"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={internshipData.startDate}
                        onChange={(e) => setInternshipData({ ...internshipData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={internshipData.endDate}
                        onChange={(e) => setInternshipData({ ...internshipData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="supervisorName">Supervisor Name</Label>
                      <Input
                        id="supervisorName"
                        value={internshipData.supervisorName}
                        onChange={(e) => setInternshipData({ ...internshipData, supervisorName: e.target.value })}
                        placeholder="e.g., John Smith"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supervisorEmail">Supervisor Email</Label>
                      <Input
                        id="supervisorEmail"
                        type="email"
                        value={internshipData.supervisorEmail}
                        onChange={(e) => setInternshipData({ ...internshipData, supervisorEmail: e.target.value })}
                        placeholder="e.g., john.smith@company.com"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supervisorPhone">Supervisor Phone</Label>
                    <Input
                      id="supervisorPhone"
                      value={internshipData.supervisorPhone}
                      onChange={(e) => setInternshipData({ ...internshipData, supervisorPhone: e.target.value })}
                      placeholder="e.g., +1-555-123-4567"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={internshipData.status}
                      onValueChange={(value) => setInternshipData({ ...internshipData, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={internshipData.description}
                      onChange={(e) => setInternshipData({ ...internshipData, description: e.target.value })}
                      placeholder="Describe your internship role and responsibilities"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveInternship}>
                    Save Internship
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Status Overview */}
      {studentInternship && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const StatusIcon = getStatusIcon(studentInternship.status);
                  return <StatusIcon className="h-4 w-4" />;
                })()}
                <Badge variant={getStatusColor(studentInternship.status) as any}>
                  {studentInternship.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Started {new Date(studentInternship.startDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentInternship.progress}%</div>
              <Progress value={studentInternship.progress} className="mt-2 h-1" />
              <p className="text-xs text-muted-foreground mt-1">Overall progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.ceil((new Date(studentInternship.endDate).getTime() - new Date(studentInternship.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks
              </div>
              <p className="text-xs text-muted-foreground">Total duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentInternship.milestones.filter(m => m.completed).length}/{studentInternship.milestones.length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {studentInternship ? (
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Company Details</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Internship Information</CardTitle>
                <CardDescription>
                  Details about your current internship placement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Company</Label>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{studentInternship.company}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Position</Label>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{studentInternship.role}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Duration</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(studentInternship.startDate).toLocaleDateString()} - {new Date(studentInternship.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Supervisor</Label>
                        <div className="space-y-1">
                          <span className="font-medium">{studentInternship.supervisorName}</span>
                          {studentInternship.supervisorEmail && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {studentInternship.supervisorEmail}
                            </div>
                          )}
                          {studentInternship.supervisorPhone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {studentInternship.supervisorPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {studentInternship.description && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Job Description</Label>
                        <p className="text-sm">{studentInternship.description}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-company">Company Name</Label>
                        <Input
                          id="edit-company"
                          value={internshipData.company}
                          onChange={(e) => setInternshipData({ ...internshipData, company: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-role">Position</Label>
                        <Input
                          id="edit-role"
                          value={internshipData.role}
                          onChange={(e) => setInternshipData({ ...internshipData, role: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-startDate">Start Date</Label>
                        <Input
                          id="edit-startDate"
                          type="date"
                          value={internshipData.startDate}
                          onChange={(e) => setInternshipData({ ...internshipData, startDate: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-endDate">End Date</Label>
                        <Input
                          id="edit-endDate"
                          type="date"
                          value={internshipData.endDate}
                          onChange={(e) => setInternshipData({ ...internshipData, endDate: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-supervisorName">Supervisor Name</Label>
                        <Input
                          id="edit-supervisorName"
                          value={internshipData.supervisorName}
                          onChange={(e) => setInternshipData({ ...internshipData, supervisorName: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-supervisorEmail">Supervisor Email</Label>
                        <Input
                          id="edit-supervisorEmail"
                          type="email"
                          value={internshipData.supervisorEmail}
                          onChange={(e) => setInternshipData({ ...internshipData, supervisorEmail: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-supervisorPhone">Supervisor Phone</Label>
                      <Input
                        id="edit-supervisorPhone"
                        value={internshipData.supervisorPhone}
                        onChange={(e) => setInternshipData({ ...internshipData, supervisorPhone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">Job Description</Label>
                      <Textarea
                        id="edit-description"
                        value={internshipData.description}
                        onChange={(e) => setInternshipData({ ...internshipData, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>
                  Track your internship milestones and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentInternship.milestones.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No milestones yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add milestones to track your internship progress
                      </p>
                      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Milestone
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Milestone</DialogTitle>
                            <DialogDescription>
                              Create a new milestone to track your progress
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="milestone-title">Title *</Label>
                              <Input
                                id="milestone-title"
                                value={newMilestone.title}
                                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                placeholder="e.g., Complete project setup"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="milestone-description">Description</Label>
                              <Textarea
                                id="milestone-description"
                                value={newMilestone.description}
                                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                placeholder="Describe what needs to be accomplished"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="milestone-dueDate">Due Date *</Label>
                              <Input
                                id="milestone-dueDate"
                                type="date"
                                value={newMilestone.dueDate}
                                onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddMilestone}>
                              Add Milestone
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {studentInternship.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-start gap-4 p-4 rounded-lg border">
                            <div className="flex items-center gap-2">
                              {milestone.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{milestone.title}</h4>
                                  {milestone.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {milestone.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">
                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                  </p>
                                  {milestone.completedDate && (
                                    <p className="text-sm text-green-600">
                                      Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant={milestone.completed ? "outline" : "default"}
                                  onClick={() => handleToggleMilestone(milestone.id)}
                                >
                                  {milestone.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Milestone
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Milestone</DialogTitle>
                            <DialogDescription>
                              Create a new milestone to track your progress
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="milestone-title">Title *</Label>
                              <Input
                                id="milestone-title"
                                value={newMilestone.title}
                                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                placeholder="e.g., Complete project setup"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="milestone-description">Description</Label>
                              <Textarea
                                id="milestone-description"
                                value={newMilestone.description}
                                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                placeholder="Describe what needs to be accomplished"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="milestone-dueDate">Due Date *</Label>
                              <Input
                                id="milestone-dueDate"
                                type="date"
                                value={newMilestone.dueDate}
                                onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddMilestone}>
                              Add Milestone
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Upload and manage your internship-related documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentInternship.documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No documents yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload documents related to your internship
                      </p>
                      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
                        <DialogTrigger asChild>
                          <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload First Document
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>
                              Add a document related to your internship
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="document-name">Document Name *</Label>
                              <Input
                                id="document-name"
                                value={newDocument.name}
                                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                                placeholder="e.g., Internship Report"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="document-type">Document Type</Label>
                              <Select
                                value={newDocument.type}
                                onValueChange={(value) => setNewDocument({ ...newDocument, type: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="report">Report</SelectItem>
                                  <SelectItem value="certificate">Certificate</SelectItem>
                                  <SelectItem value="evaluation">Evaluation</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddDocument}>
                              Upload Document
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {studentInternship.documents.map((document) => (
                          <div key={document.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{document.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {document.type} • Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(document)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full" variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload New Document
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>
                              Add a document related to your internship
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="document-name">Document Name *</Label>
                              <Input
                                id="document-name"
                                value={newDocument.name}
                                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                                placeholder="e.g., Internship Report"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="document-type">Document Type</Label>
                              <Select
                                value={newDocument.type}
                                onValueChange={(value) => setNewDocument({ ...newDocument, type: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="report">Report</SelectItem>
                                  <SelectItem value="certificate">Certificate</SelectItem>
                                  <SelectItem value="evaluation">Evaluation</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddDocument}>
                              Upload Document
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>
                  Track your overall internship progress and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Overall Progress</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{studentInternship.progress}%</span>
                        </div>
                        <Progress value={studentInternship.progress} className="h-3" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Milestone Completion</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completed</span>
                          <span className="font-medium">
                            {studentInternship.milestones.filter(m => m.completed).length}/{studentInternship.milestones.length}
                          </span>
                        </div>
                        <Progress 
                          value={studentInternship.milestones.length > 0 ? 
                            (studentInternship.milestones.filter(m => m.completed).length / studentInternship.milestones.length) * 100 : 0
                          } 
                          className="h-3" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Recent Activity</h4>
                    <div className="space-y-2">
                      {studentInternship.milestones
                        .filter(m => m.completed)
                        .slice(-3)
                        .map((milestone) => (
                          <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">{milestone.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Completed {milestone.completedDate && new Date(milestone.completedDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Internship Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your internship details to start tracking your progress
            </p>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Internship
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}