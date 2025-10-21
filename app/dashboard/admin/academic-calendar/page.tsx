'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
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
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Download,
  Clock,
  Users,
  BookOpen,
  GraduationCap,
  Info,
} from 'lucide-react';
import type { AcademicCalendar, CalendarEvent } from '@/types';

// Mock data for academic calendar
const mockAcademicCalendar: AcademicCalendar = {
  id: 'calendar-2025',
  name: 'Academic Calendar 2025-2025',
  academicYear: '2025-2025',
  events: [
    {
      id: 'event-001',
      title: 'Semester 1 Start',
      description: 'Beginning of first semester',
      startDate: '2025-09-01T08:00:00Z',
      endDate: '2025-09-01T17:00:00Z',
      type: 'semester_start',
      isRecurring: false
    },
    {
      id: 'event-002',
      title: 'Module Registration Period',
      description: 'Students can register for modules',
      startDate: '2025-09-15T09:00:00Z',
      endDate: '2025-09-30T17:00:00Z',
      type: 'registration',
      isRecurring: false
    },
    {
      id: 'event-003',
      title: 'Mid-Semester Examinations',
      description: 'Mid-semester assessment period',
      startDate: '2025-10-15T09:00:00Z',
      endDate: '2025-10-25T17:00:00Z',
      type: 'examination',
      isRecurring: false
    },
    {
      id: 'event-004',
      title: 'Semester 1 End',
      description: 'End of first semester',
      startDate: '2025-12-15T17:00:00Z',
      endDate: '2025-12-15T17:00:00Z',
      type: 'semester_end',
      isRecurring: false
    },
    {
      id: 'event-005',
      title: 'Semester 2 Start',
      description: 'Beginning of second semester',
      startDate: '2025-01-15T08:00:00Z',
      endDate: '2025-01-15T17:00:00Z',
      type: 'semester_start',
      isRecurring: false
    },
    {
      id: 'event-006',
      title: 'Final Examinations',
      description: 'End-of-year examination period',
      startDate: '2025-05-01T09:00:00Z',
      endDate: '2025-05-15T17:00:00Z',
      type: 'examination',
      isRecurring: false
    },
    {
      id: 'event-007',
      title: 'Graduation Ceremony',
      description: 'Annual graduation ceremony',
      startDate: '2025-06-15T10:00:00Z',
      endDate: '2025-06-15T16:00:00Z',
      type: 'deadline',
      isRecurring: false
    }
  ],
  isActive: true,
  createdAt: '2025-08-01T00:00:00Z',
  updatedAt: '2025-12-15T10:00:00Z'
};

const eventTypes = [
  { value: 'semester_start', label: 'Semester Start', icon: GraduationCap, color: 'bg-green-100 text-green-800' },
  { value: 'semester_end', label: 'Semester End', icon: GraduationCap, color: 'bg-red-100 text-red-800' },
  { value: 'registration', label: 'Registration', icon: Users, color: 'bg-blue-100 text-blue-800' },
  { value: 'examination', label: 'Examination', icon: BookOpen, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'holiday', label: 'Holiday', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
  { value: 'deadline', label: 'Deadline', icon: Clock, color: 'bg-orange-100 text-orange-800' }
];

export default function AcademicCalendarPage() {
  const [calendar, setCalendar] = useState<AcademicCalendar>(mockAcademicCalendar);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'deadline',
    isRecurring: false
  });

  const getEventTypeInfo = (type: string) => {
    return eventTypes.find(et => et.value === type) || eventTypes[0];
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return calendar.events
      .filter(event => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  };

  const getEventsForMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return calendar.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  const handleCreateEvent = async () => {
    try {
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: eventForm.title,
        description: eventForm.description,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        type: eventForm.type as CalendarEvent['type'],
        isRecurring: eventForm.isRecurring
      };
      
      setCalendar(prev => ({
        ...prev,
        events: [...prev.events, newEvent],
        updatedAt: new Date().toISOString()
      }));
      
      setShowCreateDialog(false);
      setEventForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'deadline',
        isRecurring: false
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setCalendar(prev => ({
        ...prev,
        events: prev.events.map(event => 
          event.id === selectedEvent.id 
            ? { 
                ...event, 
                title: eventForm.title,
                description: eventForm.description,
                startDate: eventForm.startDate,
                endDate: eventForm.endDate,
                type: eventForm.type as CalendarEvent['type'],
                isRecurring: eventForm.isRecurring
              }
            : event
        ),
        updatedAt: new Date().toISOString()
      }));
      
      setShowEditDialog(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setCalendar(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== eventId),
      updatedAt: new Date().toISOString()
    }));
  };

  const openEditDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      type: event.type,
      isRecurring: event.isRecurring
    });
    setShowEditDialog(true);
  };

  const exportCalendar = () => {
    const dataStr = JSON.stringify(calendar, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `academic-calendar-${calendar.academicYear}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Academic Calendar</h1>
            <p className="text-gray-600">
              Manage academic events, deadlines, and important dates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
            <Button 
              onClick={exportCalendar}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {calendar.events.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Academic year {calendar.academicYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {getUpcomingEvents().length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-yellow-600" />
              Examinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {calendar.events.filter(e => e.type === 'examination').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              This academic year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Registration Periods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {calendar.events.filter(e => e.type === 'registration').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              This academic year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Views */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="month">Monthly View</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>

        {/* Upcoming Events */}
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>
                Important dates and deadlines coming up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUpcomingEvents().map((event) => {
                  const eventTypeInfo = getEventTypeInfo(event.type);
                  const EventIcon = eventTypeInfo.icon;
                  
                  return (
                    <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${eventTypeInfo.color}`}>
                          <EventIcon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge className={eventTypeInfo.color}>
                            {eventTypeInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.startDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly View */}
        <TabsContent value="month">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly View
                  </CardTitle>
                  <CardDescription>
                    Events for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getEventsForMonth().map((event) => {
                  const eventTypeInfo = getEventTypeInfo(event.type);
                  const EventIcon = eventTypeInfo.icon;
                  
                  return (
                    <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${eventTypeInfo.color}`}>
                          <EventIcon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge className={eventTypeInfo.color}>
                            {eventTypeInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.startDate)} - {formatTime(event.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {getEventsForMonth().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No events scheduled for this month
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Events */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Events
              </CardTitle>
              <CardDescription>
                Complete list of academic events for {calendar.academicYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {calendar.events
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .map((event) => {
                    const eventTypeInfo = getEventTypeInfo(event.type);
                    const EventIcon = eventTypeInfo.icon;
                    
                    return (
                      <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-full ${eventTypeInfo.color}`}>
                            <EventIcon className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge className={eventTypeInfo.color}>
                              {eventTypeInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(event.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(event.startDate)} - {formatTime(event.endDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to the academic calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventTitle">Event Title</Label>
              <Input
                id="eventTitle"
                placeholder="e.g., Mid-Semester Examinations"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="eventDescription">Description</Label>
              <Textarea
                id="eventDescription"
                placeholder="Brief description of the event"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select 
                value={eventForm.type} 
                onValueChange={(value) => setEventForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEvent}
              disabled={!eventForm.title || !eventForm.startDate}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Modify the selected event details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editEventTitle">Event Title</Label>
              <Input
                id="editEventTitle"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="editEventDescription">Description</Label>
              <Textarea
                id="editEventDescription"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartDate">Start Date</Label>
                <Input
                  id="editStartDate"
                  type="date"
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="editEndDate">End Date</Label>
                <Input
                  id="editEndDate"
                  type="date"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="editEventType">Event Type</Label>
              <Select 
                value={eventForm.type} 
                onValueChange={(value) => setEventForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateEvent}
              disabled={!eventForm.title || !eventForm.startDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calendar Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Academic Calendar Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Event Types</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Semester Start/End:</strong> Academic term boundaries</li>
                <li>• <strong>Registration:</strong> Module registration periods</li>
                <li>• <strong>Examination:</strong> Assessment and exam periods</li>
                <li>• <strong>Holiday:</strong> University holidays and breaks</li>
                <li>• <strong>Deadline:</strong> Important submission deadlines</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Best Practices</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Plan events well in advance</li>
                <li>• Avoid scheduling conflicts</li>
                <li>• Provide clear descriptions</li>
                <li>• Consider student workload</li>
                <li>• Communicate changes promptly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
