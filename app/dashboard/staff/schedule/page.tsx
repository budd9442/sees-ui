'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  MapPin,
  Users,
  Edit,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Download,
  Upload,
  Search,
  Filter,
  Bell,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ModuleSchedule } from '@/types';

export default function SchedulePage() {
  const { user } = useAuthStore();
  const { modules, students, grades } = useAppStore();
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleData, setScheduleData] = useState({
    day: 'Monday' as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday',
    startTime: '09:00',
    endTime: '10:30',
    room: 'A101',
    type: 'lecture' as 'lecture' | 'tutorial' | 'lab',
    capacity: 50,
  });

  // Mock schedule data
  const mockSchedules: ModuleSchedule[] = [
    {
      id: 'SCH001',
      moduleId: 'MOD001',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      room: 'A101',
      type: 'lecture',
      capacity: 50,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH002',
      moduleId: 'MOD001',
      day: 'Wednesday',
      startTime: '14:00',
      endTime: '15:30',
      room: 'A102',
      type: 'tutorial',
      capacity: 25,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH003',
      moduleId: 'MOD002',
      day: 'Tuesday',
      startTime: '10:00',
      endTime: '12:00',
      room: 'LAB001',
      type: 'lab',
      capacity: 20,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Get schedules for selected module
  const moduleSchedules = mockSchedules.filter(s => s.moduleId === selectedModule);
  const currentModule = modules.find(m => m.id === selectedModule);

  // Mock conflict detection
  const detectConflicts = (newSchedule: Partial<ModuleSchedule>) => {
    const conflicts = mockSchedules.filter(schedule => 
      schedule.id !== newSchedule.id &&
      schedule.day === newSchedule.day &&
      schedule.room === newSchedule.room &&
      (
        (newSchedule.startTime && schedule.startTime <= newSchedule.startTime && schedule.endTime > newSchedule.startTime) ||
        (newSchedule.endTime && schedule.startTime < newSchedule.endTime && schedule.endTime >= newSchedule.endTime)
      )
    );
    return conflicts;
  };

  const handleEditSchedule = (schedule: ModuleSchedule) => {
    setScheduleData({
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      type: schedule.type,
      capacity: schedule.capacity,
    });
    setIsEditing(true);
  };

  const handleSaveSchedule = () => {
    const conflicts = detectConflicts(scheduleData);
    
    if (conflicts.length > 0) {
      setShowConflictDialog(true);
      return;
    }

    setIsEditing(false);
    toast.success('Schedule updated successfully');
  };

  const handleAddSchedule = () => {
    const conflicts = detectConflicts(scheduleData);
    
    if (conflicts.length > 0) {
      setShowConflictDialog(true);
      return;
    }

    setShowAddDialog(false);
    toast.success('New schedule added successfully');
  };

  const handleNotifyStudents = () => {
    toast.success('Students notified about schedule changes');
  };

  const getScheduleStats = (moduleId: string) => {
    const schedules = mockSchedules.filter(s => s.moduleId === moduleId);
    const totalHours = schedules.reduce((sum, s) => {
      const start = new Date(`2000-01-01 ${s.startTime}`);
      const end = new Date(`2000-01-01 ${s.endTime}`);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    
    return {
      totalSessions: schedules.length,
      totalHours: totalHours,
      lectureHours: schedules.filter(s => s.type === 'lecture').length * 1.5,
      tutorialHours: schedules.filter(s => s.type === 'tutorial').length * 1.5,
      labHours: schedules.filter(s => s.type === 'lab').length * 2,
    };
  };

  const filteredModules = modules.filter(module => {
    const term = (searchTerm || '').toLowerCase();
    const moduleName = (module.title || '').toLowerCase();
    const moduleCode = (module.code || '').toLowerCase();
    return moduleName.includes(term) || moduleCode.includes(term);
  });

  const getDayColor = (day: string) => {
    const colors = {
      Monday: 'bg-blue-100 text-blue-800',
      Tuesday: 'bg-green-100 text-green-800',
      Wednesday: 'bg-yellow-100 text-yellow-800',
      Thursday: 'bg-purple-100 text-purple-800',
      Friday: 'bg-red-100 text-red-800',
      Saturday: 'bg-gray-100 text-gray-800',
      Sunday: 'bg-orange-100 text-orange-800',
    };
    return colors[day as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture': return Users;
      case 'tutorial': return FileText;
      case 'lab': return MapPin;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Schedule Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your module schedules and detect conflicts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Schedule
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Module Selection */}
      <Card>
        <CardHeader>
          <CardTitle>My Modules</CardTitle>
          <CardDescription>
            Select a module to view and edit its schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredModules.map((module) => {
                const stats = getScheduleStats(module.id);
                return (
                  <Card 
                    key={module.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedModule === module.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedModule(module.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription>{module.code}</CardDescription>
                        </div>
                        <Badge variant="outline">
                          {stats.totalSessions} sessions
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {stats.totalHours.toFixed(1)} hours/week
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {stats.lectureHours > 0 && `${stats.lectureHours}h lectures`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {stats.tutorialHours > 0 && `${stats.tutorialHours}h tutorials`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {stats.labHours > 0 && `${stats.labHours}h labs`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedModule && currentModule && (
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Schedule for {currentModule.title}</CardTitle>
                    <CardDescription>
                      Manage lecture, tutorial, and lab schedules
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSchedule}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Schedule
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleSchedules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4" />
                      <p>No schedules found for this module</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => setShowAddDialog(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Schedule
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {moduleSchedules.map((schedule) => {
                        const TypeIcon = getTypeIcon(schedule.type);
                        return (
                          <div key={schedule.id} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                  <TypeIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold capitalize">{schedule.type}</h4>
                                    <Badge className={getDayColor(schedule.day)}>
                                      {schedule.day}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      {schedule.startTime} - {schedule.endTime}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      Room {schedule.room}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      Capacity: {schedule.capacity}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditSchedule(schedule)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Conflicts</CardTitle>
                <CardDescription>
                  Detect and resolve scheduling conflicts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>No Conflicts Detected</AlertTitle>
                    <AlertDescription>
                      All schedules are conflict-free. The system automatically checks for:
                      <ul className="mt-2 list-disc list-inside">
                        <li>Room double-booking</li>
                        <li>Time overlaps</li>
                        <li>Instructor availability</li>
                        <li>Student schedule conflicts</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Room Usage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {['A101', 'A102', 'LAB001', 'LAB002'].map((room) => (
                            <div key={room} className="flex items-center justify-between">
                              <span className="text-sm">{room}</span>
                              <Badge variant="outline">
                                {mockSchedules.filter(s => s.room === room).length} sessions
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Time Slots</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {['09:00-10:30', '10:30-12:00', '14:00-15:30', '15:30-17:00'].map((slot) => (
                            <div key={slot} className="flex items-center justify-between">
                              <span className="text-sm">{slot}</span>
                              <Badge variant="outline">
                                {mockSchedules.filter(s => s.startTime === slot.split('-')[0]).length} sessions
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schedule History</CardTitle>
                <CardDescription>
                  Track changes and modifications to schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2025-01-15 10:30</TableCell>
                      <TableCell>
                        <Badge variant="outline">Updated</Badge>
                      </TableCell>
                      <TableCell>Changed room from A101 to A102</TableCell>
                      <TableCell>Dr. Smith</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-01-10 14:20</TableCell>
                      <TableCell>
                        <Badge variant="outline">Added</Badge>
                      </TableCell>
                      <TableCell>Added tutorial session on Wednesday</TableCell>
                      <TableCell>Dr. Smith</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-01-05 09:15</TableCell>
                      <TableCell>
                        <Badge variant="outline">Created</Badge>
                      </TableCell>
                      <TableCell>Initial schedule created</TableCell>
                      <TableCell>Dr. Smith</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Add Schedule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
            <DialogDescription>
              Add a new schedule for {currentModule?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select
                  value={scheduleData.day}
                  onValueChange={(value) => setScheduleData({ ...scheduleData, day: value as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={scheduleData.type}
                  onValueChange={(value) => setScheduleData({ ...scheduleData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={scheduleData.startTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={scheduleData.endTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  value={scheduleData.room}
                  onChange={(e) => setScheduleData({ ...scheduleData, room: e.target.value })}
                  placeholder="e.g., A101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={scheduleData.capacity}
                  onChange={(e) => setScheduleData({ ...scheduleData, capacity: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSchedule}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Conflict Detected</DialogTitle>
            <DialogDescription>
              The schedule you're trying to create conflicts with existing schedules
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Conflict Details</AlertTitle>
            <AlertDescription>
              Room A101 is already booked on Monday from 09:00 to 10:30 for another module.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConflictDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowConflictDialog(false);
              toast.success('Schedule added with conflict resolution');
            }}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Resolve & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
