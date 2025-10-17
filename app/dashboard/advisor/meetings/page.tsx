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
  Clock,
  Users,
  MapPin,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Bell,
  Video,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Meeting } from '@/types';

export default function MeetingsPage() {
  const { user } = useAuthStore();
  const { students, meetings, addMeeting, updateMeeting } = useAppStore();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [meetingData, setMeetingData] = useState({
    studentId: '',
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    meetingType: 'academic',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
  });

  // Get advisor's students (mock: all students)
  const advisorStudents = students.filter(s => s.academicYear === 'L2' || s.academicYear === 'L3');
  
  // Get advisor's meetings
  const advisorMeetings = meetings.filter(m => m.advisorId === user?.id);

  // Filter meetings
  const filteredMeetings = advisorMeetings.filter(meeting => {
    const student = students.find(s => s.id === meeting.studentId);
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Group meetings by date
  const meetingsByDate = filteredMeetings.reduce((acc, meeting) => {
    const date = meeting.scheduledDate.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meeting);
    return acc;
  }, {} as Record<string, Meeting[]>);

  const handleScheduleMeeting = () => {
    if (!meetingData.studentId || !meetingData.title || !meetingData.date || !meetingData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newMeeting: Meeting = {
      id: `MEET${Date.now()}`,
      advisorId: user?.id || '',
      studentId: meetingData.studentId,
      title: meetingData.title,
      description: meetingData.description,
      scheduledDate: `${meetingData.date}T${meetingData.startTime}:00`,
      duration: 60, // Default 60 minutes
      location: meetingData.location,
      meetingType: 'academic', // Default to academic, could be mapped from meetingData.meetingType
      status: meetingData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addMeeting(newMeeting);
    setShowScheduleDialog(false);
    setMeetingData({
      studentId: '',
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      meetingType: 'academic',
      status: 'scheduled',
    });
    toast.success('Meeting scheduled successfully');
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingData({
      studentId: meeting.studentId,
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.scheduledDate.split('T')[0],
      startTime: meeting.scheduledDate.split('T')[1].substring(0, 5),
      endTime: '',
      location: meeting.location || '',
      meetingType: meeting.meetingType,
      status: meeting.status,
    });
    setShowEditDialog(true);
  };

  const handleUpdateMeeting = () => {
    if (!selectedMeeting) return;

    updateMeeting(selectedMeeting.id, {
      ...meetingData,
      meetingType: meetingData.meetingType as 'academic' | 'career' | 'personal' | 'emergency',
      scheduledDate: `${meetingData.date}T${meetingData.startTime}:00`,
      updatedAt: new Date().toISOString(),
    });

    setShowEditDialog(false);
    setSelectedMeeting(null);
    toast.success('Meeting updated successfully');
  };

  const handleCancelMeeting = (meetingId: string) => {
    updateMeeting(meetingId, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
    toast.success('Meeting cancelled');
  };

  const handleCompleteMeeting = (meetingId: string) => {
    updateMeeting(meetingId, {
      status: 'completed',
      updatedAt: new Date().toISOString(),
    });
    toast.success('Meeting marked as completed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'rescheduled': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'in-person': return MapPin;
      case 'online': return Video;
      case 'phone': return Phone;
      default: return Calendar;
    }
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return advisorMeetings
      .filter(m => new Date(m.scheduledDate) > now && m.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 5);
  };

  const upcomingMeetings = getUpcomingMeetings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Meeting Scheduler</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage meetings with your advisees
          </p>
        </div>
        <Button onClick={() => setShowScheduleDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advisorMeetings.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advisorMeetings.filter(m => {
                const now = new Date();
                const meetingDate = new Date(m.scheduledDate);
                return meetingDate > now && m.status === 'scheduled';
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advisorMeetings.filter(m => m.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Advisees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advisorStudents.length}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">Meeting List</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Calendar</CardTitle>
              <CardDescription>
                View meetings by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(meetingsByDate).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4" />
                    <p>No meetings scheduled</p>
                  </div>
                ) : (
                  Object.entries(meetingsByDate)
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .map(([date, meetings]) => (
                      <div key={date} className="space-y-3">
                        <h3 className="font-semibold text-lg">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <div className="space-y-2">
                          {meetings.map((meeting) => {
                            const student = students.find(s => s.id === meeting.studentId);
                            const TypeIcon = getMeetingTypeIcon(meeting.meetingType);
                            return (
                              <div key={meeting.id} className="p-4 rounded-lg border">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                      <TypeIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">{meeting.title}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        with {student?.name}
                                      </p>
                                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          {new Date(meeting.scheduledDate).toLocaleTimeString('en-US', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                          })}
                                        </div>
                                        {meeting.location && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {meeting.location}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(meeting.status)}>
                                      {meeting.status}
                                    </Badge>
                                    <div className="flex gap-1">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEditMeeting(meeting)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      {meeting.status === 'scheduled' && (
                                        <>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleCompleteMeeting(meeting.id)}
                                          >
                                            <CheckCircle2 className="h-4 w-4" />
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleCancelMeeting(meeting.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Meetings</CardTitle>
              <CardDescription>
                Complete list of meetings with your advisees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search meetings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter">Filter:</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="rescheduled">Rescheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMeetings.map((meeting) => {
                      const student = students.find(s => s.id === meeting.studentId);
                      const TypeIcon = getMeetingTypeIcon(meeting.meetingType);
                      return (
                        <TableRow key={meeting.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{student?.name}</div>
                              <div className="text-sm text-muted-foreground">{student?.id}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{meeting.title}</TableCell>
                          <TableCell>
                            <div>
                              <div>{new Date(meeting.scheduledDate).toLocaleDateString()}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(meeting.scheduledDate).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4" />
                              <span className="capitalize">{meeting.meetingType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(meeting.status)}>
                              {meeting.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditMeeting(meeting)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>
                Your next scheduled meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4" />
                    <p>No upcoming meetings scheduled</p>
                  </div>
                ) : (
                  upcomingMeetings.map((meeting) => {
                    const student = students.find(s => s.id === meeting.studentId);
                    const TypeIcon = getMeetingTypeIcon(meeting.meetingType);
                    const meetingDate = new Date(meeting.scheduledDate);
                    const now = new Date();
                    const timeUntil = meetingDate.getTime() - now.getTime();
                    const daysUntil = Math.ceil(timeUntil / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={meeting.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                              <TypeIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{meeting.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                with {student?.name} ({student?.id})
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {meetingDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {meetingDate.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                                {meeting.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {meeting.location}
                                  </div>
                                )}
                              </div>
                              {daysUntil <= 1 && (
                                <Alert className="mt-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Meeting Tomorrow</AlertTitle>
                                  <AlertDescription>
                                    This meeting is scheduled for tomorrow. Consider sending a reminder.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Bell className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditMeeting(meeting)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Meeting Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
            <DialogDescription>
              Schedule a meeting with one of your advisees
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select
                value={meetingData.studentId}
                onValueChange={(value) => setMeetingData({ ...meetingData, studentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {advisorStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={meetingData.title}
                onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                placeholder="e.g., Academic Progress Review"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={meetingData.description}
                onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                placeholder="Meeting agenda or topics to discuss..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={meetingData.date}
                  onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={meetingData.startTime}
                  onChange={(e) => setMeetingData({ ...meetingData, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="meetingType">Meeting Type</Label>
                <Select
                  value={meetingData.meetingType}
                  onValueChange={(value) => setMeetingData({ ...meetingData, meetingType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={meetingData.location}
                  onChange={(e) => setMeetingData({ ...meetingData, location: e.target.value })}
                  placeholder="Office, Zoom link, etc."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleMeeting}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update meeting details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Meeting Title</Label>
              <Input
                id="edit-title"
                value={meetingData.title}
                onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={meetingData.description}
                onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={meetingData.date}
                  onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={meetingData.startTime}
                  onChange={(e) => setMeetingData({ ...meetingData, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-meetingType">Meeting Type</Label>
                <Select
                  value={meetingData.meetingType}
                  onValueChange={(value) => setMeetingData({ ...meetingData, meetingType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={meetingData.location}
                  onChange={(e) => setMeetingData({ ...meetingData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={meetingData.status}
                onValueChange={(value) => setMeetingData({ ...meetingData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMeeting}>
              <Edit className="mr-2 h-4 w-4" />
              Update Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
