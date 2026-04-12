'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getStudentInterventions } from '@/lib/actions/student-actions';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
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
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  BookOpen,
  Users,
  Target,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  Lightbulb,
  Heart,
  Brain,
  Zap,
} from 'lucide-react';
import type { Intervention, InterventionResource, Student } from '@/types';


const resourceIcons = {
  study_tip: BookOpen,
  resource_link: ExternalLink,
  contact_info: Phone,
  action_item: Target,
  service: Users,
  workshop: Lightbulb,
  program: Heart,
};

export default function PersonalizedFeedbackPage() {
  const { user } = useAuthStore();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [showContactDialog, setShowContactDialog] = useState(false);

  useEffect(() => {
    async function fetchInterventions() {
      try {
        const data = await getStudentInterventions();
        setInterventions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInterventions();
  }, []);

  if (!user || user.role !== 'student' || loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleAcknowledgeIntervention = (interventionId: string) => {
    setInterventions(prev =>
      prev.map(int =>
        int.id === interventionId
          ? { ...int, acknowledged: true, acknowledgedAt: new Date().toISOString() }
          : int
      )
    );
  };

  const handleSelectResource = (interventionId: string, resourceId: string, selected: boolean) => {
    setInterventions(prev =>
      prev.map(int =>
        int.id === interventionId
          ? {
            ...int,
            selectedResources: selected
              ? [...(int.selectedResources || []), resourceId]
              : (int.selectedResources || []).filter(id => id !== resourceId)
          }
          : int
      )
    );
  };

  const handleSaveNotes = (interventionId: string) => {
    setInterventions(prev =>
      prev.map(int =>
        int.id === interventionId
          ? { ...int, studentNotes }
          : int
      )
    );
    setSelectedIntervention(null);
    setStudentNotes('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return CheckCircle;
      case 'medium': return AlertTriangle;
      case 'high': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gpa_drop': return TrendingDown;
      case 'class_decline': return TrendingDown;
      case 'attendance_issue': return Calendar;
      case 'academic_warning': return AlertTriangle;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personalized Academic Feedback"
        description="Your personalized academic insights, intervention recommendations, and support resources."
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Active Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {interventions.filter(i => i.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {interventions.filter(i => i.status === 'active' && !i.acknowledged).length} require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Available Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {interventions.reduce((acc, int) => acc + int.resources.length, 0)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Support resources available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Advisor Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              Available
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Contact your assigned advisor for support
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interventions List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Academic Interventions & Recommendations</h2>

        {interventions.map((intervention) => {
          const SeverityIcon = getSeverityIcon(intervention.severity);
          const TypeIcon = getTypeIcon(intervention.type);

          return (
            <Card key={intervention.id} className={`border-l-4 ${intervention.severity === 'high' ? 'border-l-red-500' : intervention.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <TypeIcon className="h-6 w-6 text-gray-600" />
                    <div>
                      <CardTitle className="text-xl">{intervention.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {intervention.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(intervention.severity)}>
                      <SeverityIcon className="h-3 w-3 mr-1" />
                      {intervention.severity.toUpperCase()}
                    </Badge>
                    {!intervention.acknowledged && (
                      <Badge variant="destructive">New</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Trigger Reason */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">What triggered this intervention?</h4>
                  <p className="text-sm text-gray-600">{intervention.triggerReason}</p>
                </div>

                {/* Suggestions */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Recommended Actions</h4>
                  <ul className="space-y-2">
                    {intervention.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Available Resources</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {intervention.resources.map((resource) => {
                      const ResourceIcon = resourceIcons[resource.type as keyof typeof resourceIcons] || BookOpen;
                      const isSelected = intervention.selectedResources?.includes(resource.id) || false;

                      return (
                        <div key={resource.id} className={`p-4 border rounded-lg ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectResource(intervention.id, resource.id, checked as boolean)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <ResourceIcon className="h-4 w-4 text-gray-600" />
                                <h5 className="font-medium text-gray-800">{resource.title}</h5>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                              {resource.url && (
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Learn More
                                </a>
                              )}
                              {resource.contactInfo && (
                                <p className="text-sm text-gray-600">
                                  <Mail className="h-3 w-3 inline mr-1" />
                                  {resource.contactInfo}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {!intervention.acknowledged && (
                    <Button
                      onClick={() => handleAcknowledgeIntervention(intervention.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Acknowledge
                    </Button>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Add Notes
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Personal Notes</DialogTitle>
                        <DialogDescription>
                          Add your thoughts, questions, or concerns about this intervention.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">Your Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Share your thoughts about this intervention..."
                            value={studentNotes}
                            onChange={(e) => setStudentNotes(e.target.value)}
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setStudentNotes('')}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleSaveNotes(intervention.id)}>
                          Save Notes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    onClick={() => setShowContactDialog(true)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Advisor
                  </Button>
                </div>

                {/* Student Notes */}
                {intervention.studentNotes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Your Notes</h5>
                    <p className="text-sm text-blue-700">{intervention.studentNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Advisor Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Your Academic Advisor</DialogTitle>
            <DialogDescription>
              Reach out to Dr. Michael Smith for personalized academic support.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Academic Advisor</h4>
            <p className="text-sm text-gray-600 mb-2">Departmental Academic Support</p>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  advisor@university.edu
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  University Academic Extension
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message to Advisor</Label>
              <Textarea
                id="message"
                placeholder="Describe your academic concerns or questions..."
                rows={4}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-1">Standard Office Hours</h5>
              <p className="text-sm text-blue-700">
                Advisors are available for meetings during set departmental office hours.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowContactDialog(false)}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Resources */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Additional Support Resources
          </CardTitle>
          <CardDescription>
            Additional resources to help you succeed academically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Study Skills Center</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Get help with study techniques, time management, and exam preparation.
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit Center
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Peer Tutoring</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Connect with peer tutors for subject-specific help and study groups.
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Find Tutor
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Mental Health Support</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Access counseling services and mental health resources.
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Get Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encouragement Message */}
      <Alert className="mt-6 border-green-200 bg-green-50">
        <Heart className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">You've Got This!</AlertTitle>
        <AlertDescription className="text-green-700">
          Academic challenges are a normal part of the learning journey. With the right support and resources,
          you can overcome any obstacle. Remember, seeking help is a sign of strength, not weakness.
        </AlertDescription>
      </Alert>
    </div>
  );
}
