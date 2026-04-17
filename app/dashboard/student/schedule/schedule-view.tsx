'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Lock,
    Unlock,
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
    const [filterType, setFilterType] = useState<string>('all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [customScheduleItems, setCustomScheduleItems] = useState<ScheduleItem[]>([]);
    const [newItem, setNewItem] = useState({
        title: '',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        description: '',
    });

    // Merge academic timetable + user custom items.
    const combinedSchedule = useMemo(() => {
        const academic = academicSchedule.map(item => ({
            ...item,
            color: 'bg-blue-100 text-blue-800 border-blue-300',
            title: item.moduleName
        }));

        return [...academic, ...customScheduleItems];
    }, [academicSchedule, customScheduleItems]);

    const addCustomItem = () => {
        if (!newItem.title.trim()) {
            toast.error('Title is required.');
            return;
        }
        if (newItem.endTime <= newItem.startTime) {
            toast.error('End time must be later than start time.');
            return;
        }

        setCustomScheduleItems((prev) => [
            ...prev,
            {
                id: `custom-${Date.now()}`,
                title: newItem.title.trim(),
                day: newItem.day,
                startTime: newItem.startTime,
                endTime: newItem.endTime,
                type: 'custom',
                location: newItem.location.trim() || 'Custom',
                description: newItem.description.trim() || undefined,
                isAcademic: false,
                isRecurring: true,
                color: 'bg-green-100 text-green-800 border-green-300',
            },
        ]);
        setShowAddDialog(false);
        setNewItem({
            title: '',
            day: 'Monday',
            startTime: '09:00',
            endTime: '10:00',
            location: '',
            description: '',
        });
        toast.success('Custom schedule item added.');
    };

    // Conflict detection
    const conflicts = useMemo(() => {
        const detectedConflicts: any[] = [];
        const allItems = combinedSchedule;

        for (let i = 0; i < allItems.length; i++) {
            for (let j = i + 1; j < allItems.length; j++) {
                const item1 = allItems[i];
                const item2 = allItems[j];

                // Ignore exact same logical event duplicated in data.
                const sameEvent =
                    item1.id === item2.id ||
                    (
                        (item1.title || item1.moduleName) === (item2.title || item2.moduleName) &&
                        item1.day === item2.day &&
                        item1.startTime === item2.startTime &&
                        item1.endTime === item2.endTime &&
                        (item1.location || item1.room || '') === (item2.location || item2.room || '')
                    );
                if (sameEvent) continue;

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
        return filteredSchedule
            .filter(item => item.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
            {/* Main Content */}
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Items</SelectItem>
                                <SelectItem value="academic">Academic Only</SelectItem>
                                <SelectItem value="custom">Custom Only</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                            Add Custom Item
                        </Button>
                    </div>
                </div>

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
                            {/* Compact Weekly Board */}
                            <div className="grid gap-3 md:grid-cols-7">
                                {days.map((day) => {
                                    const dayItems = getScheduleForDay(day);
                                    return (
                                        <div key={day} className="rounded-lg border bg-muted/20">
                                            <div className="border-b bg-background/70 px-3 py-2 text-center text-sm font-semibold">
                                                {day}
                                            </div>
                                            <div className="space-y-2 p-2">
                                                {dayItems.length === 0 ? (
                                                    <div className="rounded-md border border-dashed bg-background px-2 py-4 text-center text-xs text-muted-foreground">
                                                        No classes
                                                    </div>
                                                ) : (
                                                    dayItems.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className={`rounded-md border px-2 py-2 shadow-sm transition-colors ${
                                                                item.isAcademic
                                                                    ? 'border-blue-200 bg-blue-50/70'
                                                                    : 'border-green-200 bg-green-50/70'
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-1.5">
                                                                {item.isAcademic ? (
                                                                    <Lock className="mt-0.5 h-3.5 w-3.5 text-blue-600 shrink-0" />
                                                                ) : (
                                                                    <Unlock className="mt-0.5 h-3.5 w-3.5 text-green-600 shrink-0" />
                                                                )}
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-xs font-semibold text-foreground">
                                                                        {item.title || item.moduleName}
                                                                    </p>
                                                                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                                                        <Clock className="h-3 w-3" />
                                                                        {item.startTime} - {item.endTime}
                                                                    </p>
                                                                    {(item.location || item.room) && (
                                                                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                                                            <MapPin className="h-3 w-3" />
                                                                            {item.location || item.room}
                                                                        </p>
                                                                    )}
                                                                    {item.lecturer && (
                                                                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                                                            <User className="h-3 w-3" />
                                                                            {item.lecturer}
                                                                        </p>
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
                        </CardContent>
                    </Card>

                {/* Conflicts moved to bottom with detailed list */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Conflicts
                        </CardTitle>
                        <CardDescription>
                            {conflicts.length === 0
                                ? 'No time conflicts detected.'
                                : `${conflicts.length} conflict${conflicts.length > 1 ? 's' : ''} detected`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {conflicts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Your current schedule has no overlaps.</p>
                        ) : (
                            <div className="space-y-2">
                                {conflicts.map((c, index) => (
                                    <div key={`${c.item1.id}-${c.item2.id}-${index}`} className="rounded-md border bg-orange-50/40 p-3 text-sm">
                                        <p className="font-medium text-orange-900">
                                            {c.item1.title || c.item1.moduleName} overlaps with {c.item2.title || c.item2.moduleName}
                                        </p>
                                        <p className="mt-1 text-orange-800">
                                            {c.item1.day} {c.item1.startTime}-{c.item1.endTime} and {c.item2.startTime}-{c.item2.endTime}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Custom Schedule Item</DialogTitle>
                        <DialogDescription>Add personal tasks, study blocks, or reminders to your calendar.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label>Title</Label>
                            <Input
                                value={newItem.title}
                                onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. Group Study Session"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Day</Label>
                                <Select value={newItem.day} onValueChange={(v) => setNewItem((prev) => ({ ...prev, day: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {days.map((d) => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Location</Label>
                                <Input
                                    value={newItem.location}
                                    onChange={(e) => setNewItem((prev) => ({ ...prev, location: e.target.value }))}
                                    placeholder="Library / Online"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Start</Label>
                                <Input
                                    type="time"
                                    value={newItem.startTime}
                                    onChange={(e) => setNewItem((prev) => ({ ...prev, startTime: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>End</Label>
                                <Input
                                    type="time"
                                    value={newItem.endTime}
                                    onChange={(e) => setNewItem((prev) => ({ ...prev, endTime: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button onClick={addCustomItem}>Add Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
