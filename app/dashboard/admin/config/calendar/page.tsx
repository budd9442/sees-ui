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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  Calendar,
  Settings,
  Save,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Users,
  BookOpen,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AcademicCalendar, CalendarEvent, FeatureFlag, UserRole } from '@/types';

export default function CalendarPage() {
  const { user } = useAuthStore();
  const { systemConfiguration, updateSystemConfiguration } = useAppStore();
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'semester_start' as 'semester_start' | 'semester_end' | 'registration' | 'examination' | 'holiday' | 'deadline',
    isRecurring: false,
    recurringPattern: 'none' as 'none' | 'weekly' | 'monthly' | 'yearly',
  });

  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    enabled: false,
    targetRoles: [] as string[],
  });

  // Mock academic calendar data
  const academicCalendar: AcademicCalendar = {
    id: 'CAL2024',
    name: 'Academic Calendar 2024',
    academicYear: '2024',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    events: [
      {
        id: 'EVT001',
        title: 'Module Registration Opens',
        description: 'Students can begin registering for modules',
        startDate: '2024-01-01',
        endDate: '2024-01-01',
        type: 'registration',
        isRecurring: true,
        recurrencePattern: 'yearly',
      },
      {
        id: 'EVT002',
        title: 'Pathway Selection Period',
        description: 'L1 students select their degree pathways',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        type: 'semester_start',
        isRecurring: true,
        recurrencePattern: 'yearly',
      },
      {
        id: 'EVT003',
        title: 'Mid-Semester Break',
        description: 'Academic break for students',
        startDate: '2024-03-15',
        endDate: '2024-03-22',
        type: 'holiday',
        isRecurring: true,
        recurrencePattern: 'yearly',
      },
      {
        id: 'EVT004',
        title: 'Final Examinations',
        description: 'End of semester examinations',
        startDate: '2024-05-01',
        endDate: '2024-05-15',
        type: 'examination',
        isRecurring: true,
        recurrencePattern: 'yearly',
      },
    ],
  };

  // Mock feature flags
  const featureFlags: FeatureFlag[] = [
    {
      id: 'FF001',
      name: 'Module Registration',
      description: 'Enable/disable module registration functionality',
      isEnabled: true,
      targetRoles: ['student'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'FF002',
      name: 'Pathway Selection',
      description: 'Enable/disable pathway selection for L1 students',
      isEnabled: true,
      targetRoles: ['student'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'FF003',
      name: 'Grade Viewing',
      description: 'Enable/disable grade viewing for students',
      isEnabled: true,
      targetRoles: ['student'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'FF004',
      name: 'Anonymous Reporting',
      description: 'Enable/disable anonymous reporting system',
      isEnabled: false,
      targetRoles: ['student'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'FF005',
      name: 'Bulk Enrollment',
      description: 'Enable/disable bulk student enrollment',
      isEnabled: true,
      targetRoles: ['admin'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const event: CalendarEvent = {
      id: `EVT${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate || newEvent.startDate,
      type: newEvent.type,
      isRecurring: newEvent.isRecurring,
      recurrencePattern: newEvent.recurringPattern,
    };

    toast.success('Calendar event created successfully!');
    setShowEventDialog(false);
    setNewEvent({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      type: 'semester_start',
      isRecurring: false,
      recurringPattern: 'none',
    });
  };

  const handleCreateFeature = () => {
    if (!newFeature.name || !newFeature.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const feature: FeatureFlag = {
      id: `FF${Date.now()}`,
      name: newFeature.name,
      description: newFeature.description,
      isEnabled: newFeature.enabled,
      targetRoles: newFeature.targetRoles as UserRole[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    toast.success('Feature flag created successfully!');
    setShowFeatureDialog(false);
    setNewFeature({
      name: '',
      description: '',
      enabled: false,
      targetRoles: [],
    });
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleEditFeature = (feature: FeatureFlag) => {
    setSelectedFeature(feature);
    setShowFeatureDialog(true);
  };

  const handleToggleFeature = (featureId: string) => {
    toast.success('Feature flag toggled successfully!');
  };

  const handleDeleteEvent = (eventId: string) => {
    toast.success('Calendar event deleted successfully!');
  };

  const handleDeleteFeature = (featureId: string) => {
    toast.success('Feature flag deleted successfully!');
  };

  const exportCalendar = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Calendar exported as ${format.toUpperCase()} successfully!`);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'text-blue-600 bg-blue-50';
      case 'registration': return 'text-green-600 bg-green-50';
      case 'examination': return 'text-red-600 bg-red-50';
      case 'holiday': return 'text-yellow-600 bg-yellow-50';
      case 'deadline': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'academic': return BookOpen;
      case 'registration': return Users;
      case 'examination': return GraduationCap;
      case 'holiday': return Calendar;
      case 'deadline': return Clock;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Academic Calendar & Feature Flags</h1>
          <p className="text-muted-foreground mt-1">
            Configure academic calendar events and system feature flags
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCalendar('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export Calendar
          </Button>
          <Button variant="outline" onClick={() => setShowEventDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
          <Button variant="outline" onClick={() => setShowFeatureDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Add Feature Flag
          </Button>
        </div>
      </div>

      {/* Calendar Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicCalendar.academicYear}</div>
            <p className="text-xs text-muted-foreground">Current year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicCalendar.events.length}</div>
            <p className="text-xs text-muted-foreground">Calendar events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicCalendar.events.length}</div>
            <p className="text-xs text-muted-foreground">Calendar events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Feature Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featureFlags.length}</div>
            <p className="text-xs text-muted-foreground">System features</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Academic Calendar</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Calendar Overview</CardTitle>
              <CardDescription>
                Current academic year calendar with key dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {academicCalendar.events.map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge variant="outline">
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.description}
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Events</CardTitle>
              <CardDescription>
                Manage academic calendar events and deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Recurring</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicCalendar.events.map((event) => {
                    const EventIcon = getEventTypeIcon(event.type);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">{event.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEventTypeColor(event.type)}>
                            <EventIcon className="h-3 w-3 mr-1" />
                            {event.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(event.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {event.isRecurring ? (
                            <Badge variant="outline">{event.recurrencePattern}</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Manage system feature flags and their availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target Roles</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureFlags.map((feature) => (
                    <TableRow key={feature.id}>
                      <TableCell className="font-medium">{feature.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {feature.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {feature.isEnabled ? (
                            <Badge className="text-green-600 bg-green-50">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge className="text-red-600 bg-red-50">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Disabled
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {feature.targetRoles.map((role) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          Always active
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleFeature(feature.id)}
                          >
                            {feature.isEnabled ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditFeature(feature)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteFeature(feature.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Calendar Event</DialogTitle>
            <DialogDescription>
              Add a new event to the academic calendar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="e.g., Module Registration Opens"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event description..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event-start">Start Date</Label>
                <Input
                  id="event-start"
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-end">End Date</Label>
                <Input
                  id="event-end"
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select
                value={newEvent.type}
                onValueChange={(value) => setNewEvent({ ...newEvent, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="examination">Examination</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurring">Recurring Event</Label>
              <Select
                value={newEvent.isRecurring ? 'yes' : 'no'}
                onValueChange={(value) => setNewEvent({ ...newEvent, isRecurring: value === 'yes' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newEvent.isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurring-pattern">Recurring Pattern</Label>
                <Select
                  value={newEvent.recurringPattern}
                  onValueChange={(value) => setNewEvent({ ...newEvent, recurringPattern: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Feature Flag Dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription>
              Add a new feature flag to control system functionality
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feature-name">Feature Name</Label>
              <Input
                id="feature-name"
                value={newFeature.name}
                onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                placeholder="e.g., Module Registration"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feature-description">Description</Label>
              <Textarea
                id="feature-description"
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                placeholder="Feature description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feature-enabled">Status</Label>
              <Select
                value={newFeature.enabled ? 'enabled' : 'disabled'}
                onValueChange={(value) => setNewFeature({ ...newFeature, enabled: value === 'enabled' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-roles">Target Roles</Label>
              <div className="space-y-2">
                {['student', 'staff', 'advisor', 'hod', 'admin'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={role}
                      checked={newFeature.targetRoles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewFeature({
                            ...newFeature,
                            targetRoles: [...newFeature.targetRoles, role],
                          });
                        } else {
                          setNewFeature({
                            ...newFeature,
                            targetRoles: newFeature.targetRoles.filter(r => r !== role),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={role} className="capitalize">{role}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFeature}>
              <Settings className="mr-2 h-4 w-4" />
              Create Feature Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
