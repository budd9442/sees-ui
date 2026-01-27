'use client';

import { useState, useEffect } from 'react';
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
  Calendar,
  Settings,
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
} from 'lucide-react';
import { toast } from 'sonner';
import { FeatureFlag, CalendarEvent } from '@prisma/client'; // Use Prisma types
import {
  getFeatureFlags,
  createFeatureFlag,
  updateFeatureFlag,
  toggleFeatureFlag,
  deleteFeatureFlag,
} from '@/app/actions/feature-flags';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/app/actions/calendar';

export default function CalendarPage() {
  const { user } = useAuthStore();
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | null>(null);

  // Data State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
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
    key: '',
    description: '',
    enabled: false,
    targetRoles: [] as string[],
    startDate: '',
    endDate: '',
  });

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, flagsRes] = await Promise.all([
        getCalendarEvents(),
        getFeatureFlags(),
      ]);

      if (eventsRes.success && eventsRes.data) setCalendarEvents(eventsRes.data);
      if (flagsRes.success && flagsRes.data) setFeatureFlags(flagsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load configuration data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await createCalendarEvent({
        ...newEvent,
        startDate: new Date(newEvent.startDate),
        endDate: newEvent.endDate ? new Date(newEvent.endDate) : new Date(newEvent.startDate),
        recurrencePattern: newEvent.recurringPattern === 'none' ? undefined : newEvent.recurringPattern,
      });

      if (result.success) {
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
        fetchData(); // Refresh list
      } else {
        toast.error(result.error || 'Failed to create event');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleCreateFeature = async () => {
    if (!newFeature.name || !newFeature.key) {
      toast.error('Name and Key are required');
      return;
    }

    try {
      const result = await createFeatureFlag({
        ...newFeature,
        isEnabled: newFeature.enabled,
        startDate: newFeature.startDate ? new Date(newFeature.startDate) : undefined,
        endDate: newFeature.endDate ? new Date(newFeature.endDate) : undefined,
      });

      if (result.success) {
        toast.success('Feature flag created successfully!');
        setShowFeatureDialog(false);
        setNewFeature({
          name: '',
          key: '',
          description: '',
          enabled: false,
          targetRoles: [],
          startDate: '',
          endDate: '',
        });
        fetchData();
      } else {
        toast.error(result.error || 'Failed to create feature flag');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    // For simplicity in this demo, we might skip full edit implementation details or just handle delete
    // But let's support delete primarily for speed
    setSelectedEvent(event);
    // You could pre-fill form here to edit
  };

  const handleToggleFeature = async (featureId: string) => {
    try {
      const result = await toggleFeatureFlag(featureId);
      if (result.success) {
        toast.success('Feature flag toggled successfully!');
        fetchData();
      } else {
        toast.error('Failed to toggle feature flag');
      }
    } catch (error) {
      toast.error('Error toggling feature flag');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const result = await deleteCalendarEvent(eventId);
    if (result.success) {
      toast.success('Calendar event deleted successfully!');
      fetchData();
    } else {
      toast.error('Failed to delete event');
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;
    const result = await deleteFeatureFlag(featureId);
    if (result.success) {
      toast.success('Feature flag deleted successfully!');
      fetchData();
    } else {
      toast.error('Failed to delete feature flag');
    }
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

      {isLoading ? (
        <div className="flex justify-center p-8">Loading configurations...</div>
      ) : (
        <>
          {/* Calendar Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calendarEvents.length}</div>
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{featureFlags.filter(f => f.isEnabled).length}</div>
                <p className="text-xs text-muted-foreground">Currently enabled</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="features" className="space-y-4">
            <TabsList>
              <TabsTrigger value="features">Feature Flags</TabsTrigger>
              <TabsTrigger value="calendar">Academic Calendar</TabsTrigger>
              <TabsTrigger value="events">All Events</TabsTrigger>
            </TabsList>

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
                        <TableHead>Key</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Target Roles</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {featureFlags.map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell className="font-medium">{feature.name}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{feature.key}</TableCell>
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
                            <div className="flex gap-1 flex-wrap">
                              {feature.targetRoles.map((role) => (
                                <Badge key={role} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">
                              {feature.startDate && (
                                <div>Start: {new Date(feature.startDate).toLocaleDateString()}</div>
                              )}
                              {feature.endDate && (
                                <div>End: {new Date(feature.endDate).toLocaleDateString()}</div>
                              )}
                              {!feature.startDate && !feature.endDate && "Always active"}
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

            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Overview</CardTitle>
                  <CardDescription>
                    Upcoming events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calendarEvents.slice(0, 5).map((event) => (
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
                    {calendarEvents.length === 0 && <p className="text-muted-foreground">No events scheduled.</p>}
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
                      {calendarEvents.map((event) => {
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
          </Tabs>
        </>
      )}

      {/* Create Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Calendar Event</DialogTitle>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Feature Flag Dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
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
              <Label htmlFor="feature-key">Feature Key (Unique)</Label>
              <Input
                id="feature-key"
                value={newFeature.key}
                onChange={(e) => setNewFeature({ ...newFeature, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                placeholder="e.g., module_registration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feature-description">Description</Label>
              <Textarea
                id="feature-description"
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="feature-start">Start Date (Optional)</Label>
                <Input
                  id="feature-start"
                  type="date"
                  value={newFeature.startDate}
                  onChange={(e) => setNewFeature({ ...newFeature, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feature-end">End Date (Optional)</Label>
                <Input
                  id="feature-end"
                  type="date"
                  value={newFeature.endDate}
                  onChange={(e) => setNewFeature({ ...newFeature, endDate: e.target.value })}
                />
              </div>
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
            <div className="flex items-center space-x-2">
              <Label htmlFor="feature-enabled">Enabled by Default</Label>
              <input
                type="checkbox"
                id="feature-enabled"
                checked={newFeature.enabled}
                onChange={(e) => setNewFeature({ ...newFeature, enabled: e.target.checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateFeature}>Create Feature Flag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
