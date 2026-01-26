'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    Plus,
    AlertTriangle,
    Lock,
    Unlock,
    Star,
    Bell,
} from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleItem {
    id: string;
    moduleCode?: string;
    moduleName?: string;
    type: string;
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
    location?: string;
    lecturer?: string;
    isAcademic: boolean;
    isRecurring: boolean;
    title?: string; // For custom items
    description?: string;
    color?: string;
    priority?: string;
}

interface ScheduleViewProps {
    academicSchedule: ScheduleItem[];
}

export function ScheduleView({ academicSchedule }: ScheduleViewProps) {
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [activeTab, setActiveTab] = useState('calendar');
    const [showAddDialog, setShowAddDialog] = useState(false); // Placeholder for future implementation
    const [filterType, setFilterType] = useState<string>('all');

    // Custom schedule items (Local state for now)
    const [customScheduleItems, setCustomScheduleItems] = useState<ScheduleItem[]>([
        {
            id: 'CUSTOM_DEFAULT',
            title: 'Study Time',
            day: 'Friday',
            startTime: '18:00',
            endTime: '20:00',
            type: 'study',
            location: 'Library',
            isAcademic: false,
            isRecurring: true,
            color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        }
    ]);

    // Combine academic and custom schedules
    const combinedSchedule = useMemo(() => {
        // Map academic items to include color if strictly needed, or handle in render
        const mappedAcademic = academicSchedule.map(item => ({
            ...item,
            color: 'bg-blue-100 text-blue-800 border-blue-300', // Default academic color
            title: item.moduleName // Use module name as title for unified view
        }));

        return [...mappedAcademic, ...customScheduleItems];
    }, [academicSchedule, customScheduleItems]);

    // Conflict detection
    const conflicts = useMemo(() => {
        const detectedConflicts: any[] = [];
        const allItems = combinedSchedule;

        for (let i = 0; i < allItems.length; i++) {
            for (let j = i + 1; j < allItems.length; j++) {
                const item1 = allItems[i];
                const item2 = allItems[j];

                if (item1.day === item2.day) {
                    // Simple string time compare for now, assuming HH:mm format
                    const start1 = new Date(`2000-01-01 ${item1.startTime}`);
                    const end1 = new Date(`2000-01-01 ${item1.endTime}`);
                    const start2 = new Date(`2000-01-01 ${item2.startTime}`);
                    const end2 = new Date(`2000-01-01 ${item2.endTime}`);

                    if ((start1 < end2 && end1 > start2)) {
                        detectedConflicts.push({ item1, item2 });
                    }
                }
            }
        }
        return detectedConflicts;
    }, [combinedSchedule]);

    const filteredSchedule = useMemo(() => {
        if (filterType === 'all') return combinedSchedule;
        if (filterType === 'academic') return combinedSchedule.filter(i => i.isAcademic);
        if (filterType === 'custom') return combinedSchedule.filter(i => !i.isAcademic);
        return combinedSchedule.filter(item => item.type === filterType);
    }, [combinedSchedule, filterType]);

    const getScheduleForDay = (day: string) => {
        return filteredSchedule.filter(item => item.day === day);
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
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-orange-900 mb-1">
                                Schedule Conflicts Detected
                            </h3>
                            <p className="text-sm text-orange-800 mb-2">
                                You have {conflicts.length} time conflict{conflicts.length > 1 ? 's' : ''} in your schedule.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="calendar">Calendar View</TabsTrigger>
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
                            </SelectContent>
                        </Select>
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
                                    <Button variant="outline" size="sm" onClick={() => setSelectedWeek(prev => prev - 1)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedWeek(0)}>
                                        This Week
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedWeek(prev => prev + 1)}>
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
                                                        className={`absolute left-1 right-1 p-2 rounded-lg shadow-sm border-l-4 transition-all duration-200 hover:shadow-md group ${item.isAcademic
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
            </Tabs>
        </div>
    );
}
