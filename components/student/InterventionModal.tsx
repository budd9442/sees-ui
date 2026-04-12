'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BookOpen,
  Users,
  MessageSquare,
  Calendar,
  Target,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
  Phone,
  Mail,
  GraduationCap,
  Award,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Intervention, InterventionResource } from '@/types';
import { acknowledgeIntervention } from '@/lib/actions/advisor-subactions';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  intervention: Intervention;
  gpaChange?: {
    previous: number;
    current: number;
    change: number;
  };
  academicClass?: string;
}

export default function InterventionModal({
  isOpen,
  onClose,
  intervention,
  gpaChange,
  academicClass
}: InterventionModalProps) {
  const { user } = useAuthStore();
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  if (!intervention) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return Lightbulb;
      case 'medium': return AlertTriangle;
      case 'high': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await acknowledgeIntervention(intervention.id, notes);
      setAcknowledged(true);
      toast.success('Intervention acknowledged. We\'re here to help you succeed!');
      setTimeout(onClose, 2000);
    } catch (error) {
      toast.error('Failed to acknowledge intervention. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleResource = (resourceId: string) => {
    setSelectedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'service': return Users;
      case 'workshop': return BookOpen;
      case 'program': return GraduationCap;
      case 'contact': return MessageSquare;
      default: return ExternalLink;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(() => {
              const SeverityIcon = getSeverityIcon(intervention.severity);
              return <SeverityIcon className="h-5 w-5" />;
            })()}
            Academic Support Alert
          </DialogTitle>
          <DialogDescription>
            We've noticed some changes in your academic performance and want to help you succeed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* GPA Change Alert */}
          {gpaChange && (
            <Alert className={getSeverityColor(intervention.severity)}>
              <TrendingDown className="h-4 w-4" />
              <AlertTitle>GPA Change Detected</AlertTitle>
              <AlertDescription>
                Your GPA has changed from {gpaChange.previous.toFixed(2)} to {gpaChange.current.toFixed(2)}
                ({gpaChange.change > 0 ? '+' : ''}{gpaChange.change.toFixed(2)}).
                {academicClass && ` Your academic class is: ${academicClass}`}
              </AlertDescription>
            </Alert>
          )}

          {/* Intervention Details */}
          <Card>
            <CardHeader>
              <CardTitle>{intervention.title}</CardTitle>
              <CardDescription>{intervention.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Personalized Suggestions</h4>
                  <ul className="space-y-2">
                    {intervention.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Available Support Resources</CardTitle>
              <CardDescription>
                Select resources that you'd like to learn more about or access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {intervention.resources?.map((resource) => {
                  const ResourceIcon = getResourceIcon(resource.type);
                  const isSelected = selectedResources.includes(resource.id);

                  return (
                    <div
                      key={resource.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => toggleResource(resource.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          <ResourceIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{resource.title}</h4>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {resource.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {resource.contact && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {resource.contact}
                              </div>
                            )}
                            {resource.url && (
                              <div className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                Learn More
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Take immediate steps to improve your academic performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Contact Advisor</div>
                      <div className="text-xs text-muted-foreground">Schedule a meeting</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Book Tutoring</div>
                      <div className="text-xs text-muted-foreground">Get academic support</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Study Resources</div>
                      <div className="text-xs text-muted-foreground">Access materials</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Set Goals</div>
                      <div className="text-xs text-muted-foreground">Create study plan</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Your Notes</CardTitle>
              <CardDescription>
                Share any thoughts, concerns, or questions about your academic performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Comments (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share any concerns, questions, or thoughts about your academic performance..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Support Contact */}
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Need Immediate Help?</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Our academic support team is here to help you succeed. Don't hesitate to reach out.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Support
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Support
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleAcknowledge} disabled={acknowledged}>
            {acknowledged ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Acknowledged
              </>
            ) : (
              'Acknowledge & Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
