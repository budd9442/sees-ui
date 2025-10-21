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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Video,
  MessageCircle,
} from 'lucide-react';
import type { Meeting, Student } from '@/types';

// Mock data for meetings
const mockMeetings: Meeting[] = [
  {
    id: 'meeting-001',
    advisorId: 'ADV001',
    studentId: 'STU001',
    title: 'Academic Progress Review',
    description: 'Review student progress and discuss upcoming modules',
    scheduledDate: '2025-12-20T14:00:00Z',
    duration: 30,
    location: 'Office 205',
    status: 'scheduled',
    meetingType: 'academic',
    notes: '',
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z'
  },
  {
    id: 'meeting-002',
    advisorId: 'ADV001',
    studentId: 'STU002',
    title: 'Career Guidance Session',
    description: 'Discuss career options and specialization choices',
    scheduledDate: '2025-12-18T10:00:00Z',
    duration: 45,
    location: 'Online - Zoom',
    status: 'completed',
    meetingType: 'career',
    notes: 'Student interested in software development. Recommended BSE specialization.',
    createdAt: '2025-12-10T09:00:00Z',
    updatedAt: '2025-12-18T11:00:00Z'
  },
  {
    id: 'meeting-003',
    advisorId: 'ADV001',
    studentId: 'STU003',
    title: 'Emergency Academic Support',
    description: 'Urgent meeting to address academic concerns',
    scheduledDate: '2025-12-16T16:00:00Z',
    duration: 60,
    location: 'Office 205',
    status: 'scheduled',
    meetingType: 'emergency',
    notes: '',
    createdAt: '2025-12-15T15:30:00Z',
    updatedAt: '2025-12-15T15:30:00Z'
  }
];

const mockStudents: Student[] = [
  {
    id: 'STU001',
    email: 'alice@university.edu',
    firstName: 'Alice',
    lastName: 'Johnson',
    name: 'Alice Johnson',
    role: 'student',
    isActive: true,
    studentId: 'STU001',
    academicYear: 'L2',
    degreeProgram: 'MIT',
    specialization: 'BSE',
    currentGPA: 3.65,
    totalCredits: 65,
    academicClass: 'Second Class Upper',
    pathwayLocked: true,
    enrollmentDate: '2023-09-01',
    enrollmentStatus: 'enrolled'
  },
  {
    id: 'STU002',
    email: 'bob@university.edu',
    firstName: 'Bob',
    lastName: 'Smith',
    name: 'Bob Smith',
    role: 'student',
    isActive: true,
    studentId: 'STU002',
    academicYear: 'L2',
    degreeProgram: 'MIT',
    specialization: 'OSCM',
    currentGPA: 3.45,
    totalCredits: 63,
    academicClass: 'Second Class Lower',
    pathwayLocked: true,
    enrollmentDate: '2023-09-01',
    enrollmentStatus: 'enrolled'
  },
  {
    id: 'STU003',
    email: 'carol@university.edu',
    firstName: 'Carol',
    lastName: 'Davis',
    name: 'Carol Davis',
    role: 'student',
    isActive: true,
    studentId: 'STU003',
    academicYear: 'L2',
    degreeProgram: 'IT',
    specialization: 'IS',
    currentGPA: 3.20,
    totalCredits: 64,
    academicClass: 'Second Class Lower',
    pathwayLocked: true,
    enrollmentDate: '2023-09-01',
    enrollmentStatus: 'enrolled'
  }
];

const meetingTypes = [
  { value: 'academic', label: 'Academic', icon: Users, color: 'bg-blue-100 text-blue-800' },
  { value: 'career', label: 'Career', icon: Users, color: 'bg-green-100 text-green-800' },
  { value: 'personal', label: 'Personal', icon: Users, color: 'bg-purple-100 text-purple-800' },
  { value: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'bg-red-100 text-red-800' }
];


export default function MeetingSchedulingPage() {
  const { user } = useAuthStore();
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [students] = useState<Student[]>(mockStudents);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [meetingForm, setMeetingForm] = useState({
    studentId: '',
    title: '',
    description: '',
    scheduledDate: '',
    duration: 30,
    location: '',
    meetingType: 'academic',
    notes: ''
  });

  const getMeetingTypeInfo = (type: string) => {
    return meetingTypes.find(mt => mt.value === type) || meetingTypes[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return Clock;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'rescheduled': return Calendar;
      default: return Clock;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (selectedStatus === 'all') return true;
    return meeting.status === selectedStatus;
  });

  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings
      .filter(meeting => new Date(meeting.scheduledDate) > now && meeting.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 5);
  };

  const handleCreateMeeting = async () => {
    try {
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        advisorId: user?.id || 'ADV001',
        studentId: meetingForm.studentId,
        title: meetingForm.title,
        description: meetingForm.description,
        scheduledDate: meetingForm.scheduledDate,
        duration: meetingForm.duration,
        location: meetingForm.location,
        status: 'scheduled',
        meetingType: meetingForm.meetingType as Meeting['meetingType'],
        notes: meetingForm.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setMeetings(prev => [newMeeting, ...prev]);
      setShowCreateDialog(false);
      setMeetingForm({
        studentId: '',
        title: '',
        description: '',
        scheduledDate: '',
        duration: 30,
        location: '',
        meetingType: 'academic',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleUpdateMeeting = async () => {
    if (!selectedMeeting) return;
    
    try {
      setMeetings(prev => 
        prev.map(meeting => 
          meeting.id === selectedMeeting.id 
            ? { 
                ...meeting, 
                title: meetingForm.title,
                description: meetingForm.description,
                scheduledDate: meetingForm.scheduledDate,
                duration: meetingForm.duration,
                location: meetingForm.location,
                meetingType: meetingForm.meetingType as Meeting['meetingType'],
                notes: meetingForm.notes,
                updatedAt: new Date().toISOString() 
              }
            : meeting
        )
      );
      
      setShowEditDialog(false);
      setSelectedMeeting(null);
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const handleCancelMeeting = (meetingId: string) => {
    setMeetings(prev => 
      prev.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, status: 'cancelled', updatedAt: new Date().toISOString() }
          : meeting
      )
    );
  };

  const handleCompleteMeeting = (meetingId: string) => {
    setMeetings(prev => 
      prev.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, status: 'completed', updatedAt: new Date().toISOString() }
          : meeting
      )
    );
  };

  const openEditDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingForm({
      studentId: meeting.studentId,
      title: meeting.title,
      description: meeting.description || '',
      scheduledDate: meeting.scheduledDate.split('T')[0] + 'T' + meeting.scheduledDate.split('T')[1].substring(0, 5),
      duration: meeting.duration,
      location: meeting.location,
      meetingType: meeting.meetingType,
      notes: meeting.notes || ''
    });
    setShowEditDialog(true);
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

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meeting Scheduling</h1>
            <p className="text-gray-600">
              Schedule and manage meetings with your assigned students.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      </div>

      {/* Meeting Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Total Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {meetings.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {meetings.filter(m => m.status === 'scheduled').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Scheduled meetings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {meetings.filter(m => m.status === 'completed').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {students.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Assigned students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Views */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
          <TabsTrigger value="all">All Meetings</TabsTrigger>
          <TabsTrigger value="students">Student Overview</TabsTrigger>
        </TabsList>

        {/* Upcoming Meetings */}
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Meetings
              </CardTitle>
              <CardDescription>
                Your scheduled meetings with students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUpcomingMeetings().map((meeting) => {
                  const meetingTypeInfo = getMeetingTypeInfo(meeting.meetingType);
                  const MeetingIcon = meetingTypeInfo.icon;
                  
                  return (
                    <div key={meeting.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${meetingTypeInfo.color}`}>
                          <MeetingIcon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{meeting.title}</h4>
                          <Badge className={meetingTypeInfo.color}>
                            {meetingTypeInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {getStudentName(meeting.studentId)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(meeting.scheduledDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(meeting.scheduledDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {meeting.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(meeting)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCompleteMeeting(meeting.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelMeeting(meeting.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {getUpcomingMeetings().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming meetings scheduled
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Meetings */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    All Meetings
                  </CardTitle>
                  <CardDescription>
                    Complete list of meetings with students
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.map((meeting) => {
                    const meetingTypeInfo = getMeetingTypeInfo(meeting.meetingType);
                    const StatusIcon = getStatusIcon(meeting.status);
                    
                    return (
                      <TableRow key={meeting.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getStudentName(meeting.studentId)}</div>
                            <div className="text-xs text-gray-500">{meeting.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{meeting.title}</div>
                            <div className="text-xs text-gray-500">{meeting.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={meetingTypeInfo.color}>
                            {meetingTypeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{formatDate(meeting.scheduledDate)}</div>
                            <div className="text-xs text-gray-500">{formatTime(meeting.scheduledDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {meeting.location.includes('Online') ? (
                              <Video className="h-3 w-3 text-blue-600" />
                            ) : (
                              <MapPin className="h-3 w-3 text-gray-600" />
                            )}
                            <span className="text-sm">{meeting.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(meeting.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {meeting.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(meeting)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {meeting.status === 'scheduled' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCompleteMeeting(meeting.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCancelMeeting(meeting.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
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

        {/* Student Overview */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Overview
              </CardTitle>
              <CardDescription>
                Overview of your assigned students and meeting history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => {
                  const studentMeetings = meetings.filter(m => m.studentId === student.id);
                  const upcomingMeetings = studentMeetings.filter(m => m.status === 'scheduled');
                  const completedMeetings = studentMeetings.filter(m => m.status === 'completed');
                  
                  return (
                    <div key={student.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{student.name}</h4>
                          <Badge variant="outline">{student.academicYear}</Badge>
                          <Badge variant="outline">{student.degreeProgram}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {student.specialization} • GPA: {student.currentGPA} • {student.academicClass}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Total Meetings: {studentMeetings.length}</span>
                          <span>Upcoming: {upcomingMeetings.length}</span>
                          <span>Completed: {completedMeetings.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setMeetingForm(prev => ({ ...prev, studentId: student.id }));
                            setShowCreateDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4" />
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

      {/* Create Meeting Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
            <DialogDescription>
              Schedule a meeting with one of your assigned students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select 
                value={meetingForm.studentId} 
                onValueChange={(value) => setMeetingForm(prev => ({ ...prev, studentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.studentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="meetingTitle">Meeting Title</Label>
              <Input
                id="meetingTitle"
                placeholder="e.g., Academic Progress Review"
                value={meetingForm.title}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="meetingDescription">Description</Label>
              <Textarea
                id="meetingDescription"
                placeholder="Brief description of the meeting"
                value={meetingForm.description}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingDate">Date & Time</Label>
                <Input
                  id="meetingDate"
                  type="datetime-local"
                  value={meetingForm.scheduledDate}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="meetingDuration">Duration (minutes)</Label>
                <Select 
                  value={meetingForm.duration.toString()} 
                  onValueChange={(value) => setMeetingForm(prev => ({ ...prev, duration: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="meetingLocation">Location</Label>
              <Input
                id="meetingLocation"
                placeholder="e.g., Office 205 or Online - Zoom"
                value={meetingForm.location}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="meetingType">Meeting Type</Label>
              <Select 
                value={meetingForm.meetingType} 
                onValueChange={(value) => setMeetingForm(prev => ({ ...prev, meetingType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map(type => (
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
              onClick={handleCreateMeeting}
              disabled={!meetingForm.studentId || !meetingForm.title || !meetingForm.scheduledDate}
              className="bg-green-600 hover:bg-green-700"
            >
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Modify the selected meeting details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editMeetingTitle">Meeting Title</Label>
              <Input
                id="editMeetingTitle"
                value={meetingForm.title}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="editMeetingDescription">Description</Label>
              <Textarea
                id="editMeetingDescription"
                value={meetingForm.description}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editMeetingDate">Date & Time</Label>
                <Input
                  id="editMeetingDate"
                  type="datetime-local"
                  value={meetingForm.scheduledDate}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="editMeetingDuration">Duration (minutes)</Label>
                <Select 
                  value={meetingForm.duration.toString()} 
                  onValueChange={(value) => setMeetingForm(prev => ({ ...prev, duration: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="editMeetingLocation">Location</Label>
              <Input
                id="editMeetingLocation"
                value={meetingForm.location}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="editMeetingNotes">Meeting Notes</Label>
              <Textarea
                id="editMeetingNotes"
                placeholder="Add notes from the meeting"
                value={meetingForm.notes}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateMeeting}
              disabled={!meetingForm.title || !meetingForm.scheduledDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Meeting Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Meeting Types</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Academic:</strong> Progress reviews, academic support</li>
                <li>• <strong>Career:</strong> Career guidance, specialization advice</li>
                <li>• <strong>Personal:</strong> Personal development, well-being</li>
                <li>• <strong>Emergency:</strong> Urgent academic or personal issues</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Best Practices</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Schedule meetings at least 24 hours in advance</li>
                <li>• Provide clear meeting objectives</li>
                <li>• Take notes during meetings</li>
                <li>• Follow up on action items</li>
                <li>• Respect student time and availability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
