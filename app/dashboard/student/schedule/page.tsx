'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from 'lucide-react';

export default function SchedulePage() {
  const { user } = useAuthStore();
  const { modules } = useAppStore();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [viewType, setViewType] = useState<'week' | 'day' | 'list'>('week');

  // Mock schedule data
  const scheduleData = [
    {
      id: 1,
      moduleCode: 'CS301',
      moduleName: 'Advanced Algorithms',
      type: 'lecture',
      day: 'Monday',
      startTime: '09:00',
      endTime: '11:00',
      room: 'LT-A201',
      lecturer: 'Dr. Sarah Johnson',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 2,
      moduleCode: 'CS301',
      moduleName: 'Advanced Algorithms',
      type: 'tutorial',
      day: 'Monday',
      startTime: '14:00',
      endTime: '15:00',
      room: 'TR-B102',
      lecturer: 'Mr. James Wilson',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 3,
      moduleCode: 'SE302',
      moduleName: 'Software Architecture',
      type: 'lecture',
      day: 'Tuesday',
      startTime: '10:00',
      endTime: '12:00',
      room: 'LT-C301',
      lecturer: 'Prof. Michael Chen',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      id: 4,
      moduleCode: 'DB303',
      moduleName: 'Database Systems',
      type: 'lab',
      day: 'Tuesday',
      startTime: '14:00',
      endTime: '17:00',
      room: 'LAB-D201',
      lecturer: 'Dr. Emily Davis',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      id: 5,
      moduleCode: 'NET304',
      moduleName: 'Network Security',
      type: 'lecture',
      day: 'Wednesday',
      startTime: '09:00',
      endTime: '11:00',
      room: 'LT-A102',
      lecturer: 'Dr. Robert Kim',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
    {
      id: 6,
      moduleCode: 'SE302',
      moduleName: 'Software Architecture',
      type: 'tutorial',
      day: 'Wednesday',
      startTime: '15:00',
      endTime: '16:00',
      room: 'TR-B203',
      lecturer: 'Ms. Lisa Anderson',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      id: 7,
      moduleCode: 'AI305',
      moduleName: 'Machine Learning',
      type: 'lecture',
      day: 'Thursday',
      startTime: '11:00',
      endTime: '13:00',
      room: 'LT-E401',
      lecturer: 'Prof. David Lee',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
    {
      id: 8,
      moduleCode: 'CS301',
      moduleName: 'Advanced Algorithms',
      type: 'lab',
      day: 'Thursday',
      startTime: '14:00',
      endTime: '17:00',
      room: 'LAB-F301',
      lecturer: 'Dr. Sarah Johnson',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 9,
      moduleCode: 'NET304',
      moduleName: 'Network Security',
      type: 'lab',
      day: 'Friday',
      startTime: '09:00',
      endTime: '12:00',
      room: 'LAB-G201',
      lecturer: 'Mr. Thomas Brown',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
    {
      id: 10,
      moduleCode: 'AI305',
      moduleName: 'Machine Learning',
      type: 'tutorial',
      day: 'Friday',
      startTime: '14:00',
      endTime: '15:00',
      room: 'TR-H102',
      lecturer: 'Ms. Jennifer White',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

  const getScheduleForDay = (day: string) => {
    return scheduleData.filter(item => item.day === day);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lecture': return 'LEC';
      case 'tutorial': return 'TUT';
      case 'lab': return 'LAB';
      default: return type.toUpperCase();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-500';
      case 'tutorial': return 'bg-green-500';
      case 'lab': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const currentDate = new Date();
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1 + (selectedWeek * 7));

  const formatWeekRange = () => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground mt-1">
            View your classes, tutorials, and lab sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleData.length}</div>
            <p className="text-xs text-muted-foreground">Per week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Lab Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">CS301</div>
            <p className="text-xs text-muted-foreground">In 2 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* View Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedWeek(selectedWeek - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">{formatWeekRange()}</p>
                <p className="text-sm text-muted-foreground">Week {selectedWeek === 0 ? 'Current' : selectedWeek}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedWeek(selectedWeek + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Schedule Views */}
      <Tabs value={viewType} onValueChange={(value: any) => setViewType(value)}>
        <TabsContent value="week" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Time</th>
                      {days.map(day => (
                        <th key={day} className="text-center p-3 text-sm font-medium min-w-[150px]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(time => (
                      <tr key={time} className="border-b">
                        <td className="p-3 text-sm text-muted-foreground">{time}</td>
                        {days.map(day => {
                          const classesAtTime = getScheduleForDay(day).filter(
                            item => item.startTime === time
                          );

                          return (
                            <td key={`${day}-${time}`} className="p-2 relative h-20">
                              {classesAtTime.map(item => (
                                <div
                                  key={item.id}
                                  className={`absolute inset-x-2 p-2 rounded-md border ${item.color}`}
                                  style={{
                                    top: '4px',
                                    height: `${parseInt(item.endTime) - parseInt(item.startTime)} * 80px`,
                                  }}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-xs">{item.moduleCode}</span>
                                      <Badge variant="secondary" className="text-xs px-1 py-0">
                                        {getTypeLabel(item.type)}
                                      </Badge>
                                    </div>
                                    <p className="text-xs truncate">{item.moduleName}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span>{item.room}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="space-y-2">
            {days.map(day => {
              const daySchedule = getScheduleForDay(day);
              if (daySchedule.length === 0) return null;

              return (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle className="text-lg">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {daySchedule
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-1 h-12 rounded-full ${getTypeColor(item.type)}`} />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{item.moduleCode}</span>
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(item.type)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.moduleName}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {item.startTime} - {item.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {item.room}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {item.lecturer}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-sm">Lecture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-sm">Tutorial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500" />
              <span className="text-sm">Lab Session</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}