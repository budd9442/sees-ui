'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Printer,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Star,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CustomScheduleItem, ScheduleConflict } from '@/types';

export default function SchedulePage() {
  const { user } = useAuthStore();
  const { modules, students } = useAppStore();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [viewType, setViewType] = useState<'week' | 'day' | 'list'>('week');
  const [activeTab, setActiveTab] = useState('calendar');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomScheduleItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showConflicts, setShowConflicts] = useState(false);

  const currentStudent = students.find((s) => s.email === user?.email);

  // Academic schedule data (read-only, provided by academics)
  const academicSchedule = [
    {
      id: 'ACAD001',
      moduleCode: 'INTE 11223',
      moduleName: 'Programming Concepts',
      type: 'lecture',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      room: 'LT-A201',
      lecturer: 'Ms. Tharuka Subhashi',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      isAcademic: true,
      title: undefined,
      description: undefined,
      location: undefined,
      priority: undefined,
      isRecurring: false,
    },
    {
      id: 'ACAD002',
      moduleCode: 'INTE 11223',
      moduleName: 'Programming Concepts',
      type: 'tutorial',
      day: 'Monday',
      startTime: '14:00',
      endTime: '15:00',
      room: 'TR-B102',
      lecturer: 'Mr. James Wilson',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      isAcademic: true,
      title: undefined,
      description: undefined,
      location: undefined,
      priority: undefined,
      isRecurring: false,
    },
    {
      id: 'ACAD003',
      moduleCode: 'INTE 12223',
      moduleName: 'Database Design and Development',
      type: 'lecture',
      day: 'Tuesday',
      startTime: '10:00',
      endTime: '12:00',
      room: 'LT-C301',
      lecturer: 'Prof. Akila Pallepitiya',
      color: 'bg-green-100 text-green-800 border-green-300',
      isAcademic: true,
      title: undefined,
      description: undefined,
      location: undefined,
      priority: undefined,
      isRecurring: false,
    },
    {
      id: 'ACAD004',
      moduleCode: 'INTE 12223',
      moduleName: 'Database Design and Development',
      type: 'lab',
      day: 'Tuesday',
      startTime: '14:00',
      endTime: '17:00',
      room: 'LAB-D201',
      lecturer: 'Dr. Emily Davis',
      color: 'bg-green-100 text-green-800 border-green-300',
      isAcademic: true,
      title: undefined,
      description: undefined,
      location: undefined,
      priority: undefined,
      isRecurring: false,
    },
    {
      id: 'ACAD005',
      moduleCode: 'MGTE 11233',
      moduleName: 'Business Statistics and Economics',
      type: 'lecture',
      day: 'Wednesday',
      startTime: '09:00',
      endTime: '11:00',
      room: 'LT-A102',
      lecturer: 'Ms. Tharuka Subhashi',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      isAcademic: true,
      title: undefined,
      description: undefined,
      location: undefined,
      priority: undefined,
      isRecurring: false,
    },
    {
      id: 'ACAD006',
      moduleCode: 'MGTE 11233',
      moduleName: 'Business Statistics and Economics',
      type: 'tutorial',
      day: 'Wednesday',
      startTime: '15:00',
      endTime: '16:00',
      room: 'TR-B203',
      lecturer: 'Ms. Lisa Anderson',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      isAcademic: true,
      title: undefined,
      description: undefined,
      location: undefined,
      priority: undefined,
      isRecurring: false,
    },
    {
      id: 'ACAD007',
      moduleCode: 'INTE 11223',
      moduleName: 'Programming Concepts',
      type: 'quiz',
      day: 'Thursday',
      startTime: '11:00',
      endTime: '11:30',
      room: 'LAB-A101',
      lecturer: 'Ms. Tharuka Subhashi',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      isAcademic: true,
      title: undefined,
      description: undefined,
      location: undefined,
      priority: undefined,
      isRecurring: false,
    },
  ];

  // Custom schedule items (user can add/edit/delete)
  const [customScheduleItems, setCustomScheduleItems] = useState<CustomScheduleItem[]>([
    {
      id: 'CUSTOM001',
      studentId: currentStudent?.studentId || 'STU001',
      title: 'Study Group - Algorithms',
      description: 'Weekly study session with classmates',
      day: 'Monday',
      startTime: '16:00',
      endTime: '18:00',
      location: 'Library Study Room 3',
      type: 'study',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      isRecurring: true,
      recurringPattern: 'weekly',
      priority: 'high',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CUSTOM002',
      studentId: currentStudent?.studentId || 'STU001',
      title: 'Gym Session',
      description: 'Regular workout routine',
      day: 'Tuesday',
      startTime: '18:00',
      endTime: '19:30',
      location: 'University Gym',
      type: 'exercise',
      color: 'bg-red-100 text-red-800 border-red-300',
      isRecurring: true,
      recurringPattern: 'weekly',
      priority: 'medium',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CUSTOM003',
      studentId: currentStudent?.studentId || 'STU001',
      title: 'Part-time Work',
      description: 'Campus library assistant',
      day: 'Thursday',
      startTime: '14:00',
      endTime: '18:00',
      location: 'Main Library',
      type: 'work',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      isRecurring: true,
      recurringPattern: 'weekly',
      priority: 'high',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CUSTOM004',
      studentId: currentStudent?.studentId || 'STU001',
      title: 'Morning Run',
      description: 'Daily exercise routine',
      day: 'Wednesday',
      startTime: '06:30',
      endTime: '07:30',
      location: 'University Track',
      type: 'exercise',
      color: 'bg-red-100 text-red-800 border-red-300',
      isRecurring: true,
      recurringPattern: 'daily',
      priority: 'medium',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CUSTOM005',
      studentId: currentStudent?.studentId || 'STU001',
      title: 'Evening Study',
      description: 'Personal study time',
      day: 'Friday',
      startTime: '19:00',
      endTime: '21:00',
      location: 'Home',
      type: 'study',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      isRecurring: true,
      recurringPattern: 'weekly',
      priority: 'high',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CUSTOM006',
      studentId: currentStudent?.studentId || 'STU001',
      title: 'Quick Break',
      description: 'Short coffee break',
      day: 'Monday',
      startTime: '10:30',
      endTime: '10:45',
      location: 'Cafeteria',
      type: 'personal',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      isRecurring: true,
      recurringPattern: 'daily',
      priority: 'low',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CUSTOM007',
      studentId: currentStudent?.studentId || 'STU001',
      title: 'Team Meeting',
      description: 'Project discussion',
      day: 'Wednesday',
      startTime: '15:00',
      endTime: '15:30',
      location: 'Meeting Room A',
      type: 'work',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      isRecurring: true,
      recurringPattern: 'weekly',
      priority: 'high',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Form state for adding/editing custom items
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    day: 'Monday' as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    type: 'personal' as 'personal' | 'study' | 'work' | 'exercise' | 'social' | 'other',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    isRecurring: false,
    recurringPattern: 'weekly' as 'daily' | 'weekly' | 'monthly',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Helper functions
  const getTypeColor = (type: string) => {
    const colorMap = {
      personal: 'bg-gray-100 text-gray-800 border-gray-300',
      study: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      work: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      exercise: 'bg-red-100 text-red-800 border-red-300',
      social: 'bg-pink-100 text-pink-800 border-pink-300',
      other: 'bg-slate-100 text-slate-800 border-slate-300',
    };
    return colorMap[type as keyof typeof colorMap] || colorMap.other;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Star className="h-3 w-3 text-red-500" />;
      case 'medium': return <Star className="h-3 w-3 text-yellow-500" />;
      case 'low': return <Star className="h-3 w-3 text-gray-400" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study': return <BookOpen className="h-4 w-4" />;
      case 'work': return <User className="h-4 w-4" />;
      case 'exercise': return <User className="h-4 w-4" />;
      case 'social': return <User className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  // Combine academic and custom schedules
  const combinedSchedule = useMemo(() => {
    const customItems = customScheduleItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      type: item.type,
      color: item.color,
      isAcademic: false,
      isCustom: true,
      priority: item.priority,
      isRecurring: item.isRecurring,
      lecturer: undefined,
      moduleCode: undefined,
      moduleName: undefined,
      room: item.location,
    }));

    return [...academicSchedule, ...customItems];
  }, [customScheduleItems]);

  // Conflict detection
  const conflicts = useMemo(() => {
    const detectedConflicts: ScheduleConflict[] = [];
    const allItems = combinedSchedule;

    for (let i = 0; i < allItems.length; i++) {
      for (let j = i + 1; j < allItems.length; j++) {
        const item1 = allItems[i];
        const item2 = allItems[j];

        // Check for time conflicts on the same day
        if (item1.day === item2.day) {
          const start1 = new Date(`2000-01-01 ${item1.startTime}`);
          const end1 = new Date(`2000-01-01 ${item1.endTime}`);
          const start2 = new Date(`2000-01-01 ${item2.startTime}`);
          const end2 = new Date(`2000-01-01 ${item2.endTime}`);

          // Check if times overlap
          if ((start1 < end2 && end1 > start2)) {
            detectedConflicts.push({
              id: `conflict-${item1.id}-${item2.id}`,
              item1Id: item1.id,
              item2Id: item2.id,
              item1Type: item1.isAcademic ? 'academic' : 'custom',
              item2Type: item2.isAcademic ? 'academic' : 'custom',
              conflictType: 'time',
              severity: 'warning',
              message: `Time conflict between "${item1.title || item1.moduleName}" and "${item2.title || item2.moduleName}"`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    return detectedConflicts;
  }, [combinedSchedule]);

  // Filter schedule based on type
  const filteredSchedule = useMemo(() => {
    if (filterType === 'all') return combinedSchedule;
    if (filterType === 'academic') return academicSchedule;
    if (filterType === 'custom') return customScheduleItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      type: item.type,
      color: item.color,
      isAcademic: false,
      isCustom: true,
      priority: item.priority,
      isRecurring: item.isRecurring,
      lecturer: undefined,
      moduleCode: undefined,
      moduleName: undefined,
      room: item.location,
    }));
    
    return combinedSchedule.filter(item => item.type === filterType);
  }, [combinedSchedule, filterType, academicSchedule, customScheduleItems]);

  // Form handlers
  const handleAddItem = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const newItem: CustomScheduleItem = {
      id: `CUSTOM${Date.now()}`,
      studentId: currentStudent?.studentId || 'STU001',
      title: formData.title,
      description: formData.description,
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      type: formData.type,
      color: getTypeColor(formData.type),
      isRecurring: formData.isRecurring,
      recurringPattern: formData.recurringPattern,
      priority: formData.priority,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomScheduleItems(prev => [...prev, newItem]);
    setShowAddDialog(false);
    resetForm();
    toast.success('Custom schedule item added successfully');
  };

  const handleEditItem = (item: CustomScheduleItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location || '',
      type: item.type,
      color: item.color,
      isRecurring: item.isRecurring,
      recurringPattern: item.recurringPattern || 'weekly',
      priority: item.priority,
    });
    setShowEditDialog(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const updatedItem: CustomScheduleItem = {
      ...editingItem,
      title: formData.title,
      description: formData.description,
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      type: formData.type,
      color: getTypeColor(formData.type),
      isRecurring: formData.isRecurring,
      recurringPattern: formData.recurringPattern,
      priority: formData.priority,
      updatedAt: new Date().toISOString(),
    };

    setCustomScheduleItems(prev => 
      prev.map(item => item.id === editingItem.id ? updatedItem : item)
    );
    setShowEditDialog(false);
    setEditingItem(null);
    resetForm();
    toast.success('Schedule item updated successfully');
  };

  const handleDeleteItem = (itemId: string) => {
    setCustomScheduleItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Schedule item deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      type: 'personal',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      isRecurring: false,
      recurringPattern: 'weekly',
      priority: 'medium',
    });
  };

  const getScheduleForDay = (day: string) => {
    return filteredSchedule.filter(item => item.day === day);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lecture': return 'LEC';
      case 'tutorial': return 'TUT';
      case 'lab': return 'LAB';
      case 'study': return 'STUDY';
      case 'work': return 'WORK';
      case 'exercise': return 'EXERCISE';
      case 'social': return 'SOCIAL';
      case 'personal': return 'PERSONAL';
      default: return type.toUpperCase();
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 16 }, (_, i) => `${6 + i}:00`); // 6 AM to 9 PM

  const currentDate = new Date();
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1 + (selectedWeek * 7));

  const formatWeekRange = () => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
        <div>
      <PageHeader
        title="My Schedule"
        description="Manage your academic and personal schedule"
      />

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
        </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">
                Schedule Conflicts Detected
              </h3>
              <p className="text-sm text-orange-800 mb-2">
                You have {conflicts.length} time conflict{conflicts.length > 1 ? 's' : ''} in your schedule that need attention.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/80 text-orange-800 border-orange-300 hover:bg-orange-100"
                onClick={() => setActiveTab('conflicts')}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                View Conflicts
          </Button>
        </div>
      </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="custom">Custom Items</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="academic">Academic Only</SelectItem>
                <SelectItem value="custom">Custom Only</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="exercise">Exercise</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Item
            </Button>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
      </div>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-6">
          {/* Week Navigation */}
      <Card>
        <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Weekly Schedule
                  </CardTitle>
                  <CardDescription>{formatWeekRange()}</CardDescription>
                </div>
                <div className="flex gap-2">
              <Button
                variant="outline"
                    size="sm"
                    onClick={() => setSelectedWeek(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                    size="sm"
                    onClick={() => setSelectedWeek(0)}
                  >
                    This Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWeek(prev => prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
            <CardContent>
              {/* Weekly Grid */}
              <div className="grid grid-cols-8 gap-2">
                {/* Time column */}
                <div className="space-y-1">
                  <div className="h-12"></div>
                  {timeSlots.map((time) => (
                    <div key={time} className="h-16 text-xs text-muted-foreground flex items-center justify-center">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {days.map((day) => (
                  <div key={day} className="space-y-1">
                    <div className="h-12 flex items-center justify-center font-medium text-sm border-b">
                      {day.slice(0, 3)}
                    </div>
                    <div className="relative">
                      {/* Time slot grid for positioning */}
                      {timeSlots.map((time) => (
                        <div key={time} className="h-16 border-b border-gray-100"></div>
                      ))}
                      
                      {/* Schedule items positioned absolutely */}
                      {getScheduleForDay(day).map((item) => {
                        const startHour = parseInt(item.startTime.split(':')[0]);
                        const startMinute = parseInt(item.startTime.split(':')[1]);
                        const endHour = parseInt(item.endTime.split(':')[0]);
                        const endMinute = parseInt(item.endTime.split(':')[1]);
                        
                        // Calculate position and height (6 AM = 0px)
                        const startPosition = ((startHour - 6) * 64) + (startMinute / 60) * 64;
                        const duration = ((endHour - startHour) * 60) + (endMinute - startMinute);
                        const height = (duration / 60) * 64;

                          return (
                                <div
                                  key={item.id}
                             className={`absolute left-1 right-1 p-2 rounded-lg shadow-sm border-l-4 transition-all duration-200 hover:shadow-md group ${
                               item.isAcademic 
                                 ? 'bg-blue-50 border-l-blue-500 border border-blue-200' 
                                 : 'bg-green-50 border-l-green-500 border border-green-200'
                             }`}
                                  style={{
                               top: `${startPosition}px`,
                               height: `${height}px`,
                               minHeight: '40px'
                             }}
                           >
                             {/* Show only title for all items */}
                             <div className="flex items-center h-full">
                               <div className="flex items-center gap-1 flex-1 min-w-0">
                                 {item.isAcademic ? (
                                   <Lock className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                 ) : (
                                   <Unlock className="h-3 w-3 text-green-600 flex-shrink-0" />
                                 )}
                                 <span className="font-medium text-sm text-gray-900 truncate">
                                   {item.title || item.moduleName}
                                 </span>
                               </div>
                             </div>

                             {/* Hover tooltip for all items */}
                             <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                               <div className="font-semibold mb-1">{item.title || item.moduleName}</div>
                                  <div className="space-y-1">
                                 <div className="flex items-center gap-1">
                                   <Clock className="h-3 w-3" />
                                   <span>{item.startTime} - {item.endTime}</span>
                                    </div>
                                 <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                   <span>{item.location || item.room}</span>
                                    </div>
                                 {item.lecturer && (
                                   <div className="flex items-center gap-1">
                                     <User className="h-3 w-3" />
                                     <span>{item.lecturer}</span>
                                  </div>
                                 )}
                                 {item.moduleCode && (
                                   <div className="flex items-center gap-1">
                                     <span className="font-mono">{item.moduleCode}</span>
                                </div>
                                 )}
                                 {!item.isAcademic && item.priority && (
                                   <div className="flex items-center gap-1">
                                     <Star className="h-3 w-3" />
                                     <span className="capitalize">{item.priority} Priority</span>
                                   </div>
                                 )}
                                 {!item.isAcademic && item.isRecurring && 'recurringPattern' in item && (
                                   <div className="flex items-center gap-1">
                                     <Bell className="h-3 w-3" />
                                     <span>Recurring ({(item as any).recurringPattern})</span>
                                   </div>
                                 )}
                               </div>
                               {/* Arrow pointing down */}
                               <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                             </div>
                           </div>
                          );
                        })}
                    </div>
                  </div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Items Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
                  <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Custom Schedule Items
              </CardTitle>
              <CardDescription>
                Manage your personal schedule items. Academic items are read-only.
              </CardDescription>
                  </CardHeader>
            <CardContent>
              {customScheduleItems.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No custom schedule items yet. Add your first item to get started.
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Item
                  </Button>
                </div>
              ) : (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                   {customScheduleItems.map((item) => (
                        <div
                          key={item.id}
                       className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                     >
                       {/* Color accent bar */}
                       <div className={`h-1 w-full ${
                         item.type === 'study' ? 'bg-yellow-400' :
                         item.type === 'work' ? 'bg-indigo-400' :
                         item.type === 'exercise' ? 'bg-red-400' :
                         item.type === 'social' ? 'bg-pink-400' :
                         'bg-gray-400'
                       }`} />
                       
                       <div className="p-5">
                         {/* Header */}
                         <div className="flex items-start justify-between mb-3">
                           <div className="flex-1 min-w-0">
                             <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                               {item.title}
                             </h3>
                             <div className="flex items-center gap-2 flex-wrap">
                               <Badge 
                                 variant="secondary" 
                                 className="text-xs px-2 py-1 bg-gray-100 text-gray-700"
                               >
                                  {getTypeLabel(item.type)}
                                </Badge>
                               {getPriorityIcon(item.priority)}
                               {item.isRecurring && (
                                 <Badge variant="outline" className="text-xs px-2 py-1">
                                   <Bell className="h-3 w-3 mr-1" />
                                   Recurring
                                 </Badge>
                               )}
                              </div>
                              </div>
                            </div>

                         {/* Description */}
                         {item.description && (
                           <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                             {item.description}
                           </p>
                         )}

                         {/* Details */}
                         <div className="space-y-2 mb-4">
                           <div className="flex items-center gap-2 text-sm text-gray-600">
                             <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full">
                               <Clock className="h-3 w-3 text-blue-600" />
                          </div>
                             <span className="font-medium">{item.day}</span>
                             <span>•</span>
                             <span>{item.startTime} - {item.endTime}</span>
                           </div>
                           
                           {item.location && (
                             <div className="flex items-center gap-2 text-sm text-gray-600">
                               <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                                 <MapPin className="h-3 w-3 text-green-600" />
                               </div>
                               <span className="line-clamp-1">{item.location}</span>
                             </div>
                           )}
                         </div>

                         {/* Actions */}
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                           <Button
                             size="sm"
                             variant="outline"
                             className="flex-1 h-8"
                             onClick={() => handleEditItem(item)}
                           >
                             <Edit className="h-3 w-3 mr-1" />
                             Edit
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                             onClick={() => handleDeleteItem(item.id)}
                           >
                             <Trash2 className="h-3 w-3" />
                          </Button>
                         </div>
                       </div>
                        </div>
                      ))}
                 </div>
              )}
                  </CardContent>
                </Card>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-6">
      <Card>
        <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Schedule Conflicts
              </CardTitle>
              <CardDescription>
                Review and resolve time conflicts in your schedule
              </CardDescription>
        </CardHeader>
        <CardContent>
              {conflicts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                  <p className="mt-4 text-muted-foreground">
                    No schedule conflicts detected. Your schedule is clear!
                  </p>
            </div>
              ) : (
                 <div className="space-y-4">
                   {conflicts.map((conflict) => (
                     <div
                       key={conflict.id}
                       className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm"
                     >
                       <div className="flex items-start gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                           <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-gray-900 mb-1">
                             Schedule Conflict Detected
                           </h4>
                           <p className="text-sm text-gray-700 mb-3">
                             {conflict.message}
                           </p>
            <div className="flex items-center gap-2">
                             <Badge 
                               variant="outline" 
                               className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                             >
                               {conflict.item1Type}
                             </Badge>
                             <span className="text-xs text-gray-500">vs</span>
                             <Badge 
                               variant="outline" 
                               className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200"
                             >
                               {conflict.item2Type}
                             </Badge>
            </div>
          </div>
                       </div>
                     </div>
                   ))}
                 </div>
              )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Add Custom Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Custom Schedule Item</DialogTitle>
            <DialogDescription>
              Add a personal item to your schedule. This will be visible only to you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Study Group, Gym Session"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value, color: getTypeColor(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select value={formData.day} onValueChange={(value: any) => setFormData(prev => ({ ...prev, day: value }))}>
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
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Library, Gym, Home"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurringPattern">Recurring Pattern</Label>
                <Select value={formData.recurringPattern} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurringPattern: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: !!checked }))}
              />
              <Label htmlFor="isRecurring">This is a recurring event</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Custom Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Custom Schedule Item</DialogTitle>
            <DialogDescription>
              Modify your custom schedule item details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Study Group, Gym Session"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value, color: getTypeColor(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-day">Day</Label>
                <Select value={formData.day} onValueChange={(value: any) => setFormData(prev => ({ ...prev, day: value }))}>
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
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Library, Gym, Home"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-recurringPattern">Recurring Pattern</Label>
                <Select value={formData.recurringPattern} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurringPattern: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: !!checked }))}
              />
              <Label htmlFor="edit-isRecurring">This is a recurring event</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}