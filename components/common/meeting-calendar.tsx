'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Meeting {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendees: string[];
  location?: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface MeetingCalendarProps {
  meetings: Meeting[];
  onAddMeeting?: (meeting: Omit<Meeting, 'id'>) => void;
  onEditMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meetingId: string) => void;
  onMeetingClick?: (meeting: Meeting) => void;
  className?: string;
  view?: 'month' | 'week' | 'day';
  currentUser?: string;
}

export function MeetingCalendar({
  meetings,
  onAddMeeting,
  onEditMeeting,
  onDeleteMeeting,
  onMeetingClick,
  className = '',
  view: initialView = 'month',
  currentUser,
}: MeetingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>(initialView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -7 : 7;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -1 : 1;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const today = new Date();

    return (
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-2" />;
          }

          const dayMeetings = getMeetingsForDate(day);
          const isToday = day.toDateString() === today.toDateString();
          const isSelected = selectedDate?.toDateString() === day.toDateString();

          return (
            <div
              key={day.getDate()}
              className={`p-2 min-h-20 border rounded cursor-pointer hover:bg-muted/50 ${
                isToday ? 'bg-primary/10 border-primary' : ''
              } ${isSelected ? 'bg-primary/20 border-primary' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-sm font-medium mb-1">{day.getDate()}</div>
              <div className="space-y-1">
                {dayMeetings.slice(0, 2).map(meeting => (
                  <div
                    key={meeting.id}
                    className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(meeting.status)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMeetingClick?.(meeting);
                    }}
                  >
                    <div className="truncate">{meeting.title}</div>
                    <div className="text-xs opacity-75">{meeting.startTime}</div>
                  </div>
                ))}
                {dayMeetings.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayMeetings.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return (
      <div className="space-y-4">
        {weekDays.map(day => {
          const dayMeetings = getMeetingsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={day.toDateString()}
              className={`p-4 border rounded-lg ${isToday ? 'bg-primary/10 border-primary' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">
                  {dayNames[day.getDay()]}, {day.getDate()} {monthNames[day.getMonth()]}
                </h3>
                <Badge variant="outline">{dayMeetings.length} meetings</Badge>
              </div>
              
              <div className="space-y-2">
                {dayMeetings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No meetings scheduled</p>
                ) : (
                  dayMeetings.map(meeting => (
                    <div
                      key={meeting.id}
                      className={`p-3 rounded-lg border cursor-pointer ${getStatusColor(meeting.status)}`}
                      onClick={() => onMeetingClick?.(meeting)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{meeting.title}</h4>
                          <div className="flex items-center gap-4 text-sm opacity-75">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {meeting.startTime} - {meeting.endTime}
                            </span>
                            {meeting.location && (
                              <span>{meeting.location}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {onEditMeeting && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditMeeting(meeting);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteMeeting && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteMeeting(meeting.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayMeetings = getMeetingsForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();

    return (
      <div className={`p-4 border rounded-lg ${isToday ? 'bg-primary/10 border-primary' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {dayNames[currentDate.getDay()]}, {currentDate.getDate()} {monthNames[currentDate.getMonth()]}
          </h3>
          <Badge variant="outline">{dayMeetings.length} meetings</Badge>
        </div>
        
        <div className="space-y-3">
          {dayMeetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No meetings scheduled for this day</p>
            </div>
          ) : (
            dayMeetings.map(meeting => (
              <div
                key={meeting.id}
                className={`p-4 rounded-lg border cursor-pointer ${getStatusColor(meeting.status)}`}
                onClick={() => onMeetingClick?.(meeting)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{meeting.title}</h4>
                    <div className="flex items-center gap-4 text-sm opacity-75 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.startTime} - {meeting.endTime}
                      </span>
                      {meeting.location && (
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {meeting.location}
                        </span>
                      )}
                    </div>
                    {meeting.description && (
                      <p className="text-sm mt-2 opacity-75">{meeting.description}</p>
                    )}
                    {meeting.attendees.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Attendees:</p>
                        <p className="text-sm opacity-75">{meeting.attendees.join(', ')}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {onEditMeeting && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMeeting(meeting);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteMeeting && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMeeting(meeting.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (view) {
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      default:
        return renderMonthView();
    }
  };

  const getNavigationActions = () => {
    switch (view) {
      case 'week':
        return {
          prev: () => navigateWeek('prev'),
          next: () => navigateWeek('next'),
        };
      case 'day':
        return {
          prev: () => navigateDay('prev'),
          next: () => navigateDay('next'),
        };
      default:
        return {
          prev: () => navigateMonth('prev'),
          next: () => navigateMonth('next'),
        };
    }
  };

  const navActions = getNavigationActions();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meeting Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={view} onValueChange={(value: any) => setView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            {onAddMeeting && (
              <Button size="sm" onClick={() => onAddMeeting({
                title: 'New Meeting',
                date: currentDate,
                startTime: '09:00',
                endTime: '10:00',
                attendees: [],
                status: 'scheduled',
              })}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={navActions.prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navActions.next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold">
            {view === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {view === 'week' && `Week of ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`}
            {view === 'day' && `${dayNames[currentDate.getDay()]}, ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </h2>
        </div>

        {/* Calendar Content */}
        {renderView()}
      </CardContent>
    </Card>
  );
}
