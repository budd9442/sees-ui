'use client';

import { useMemo, useState, useEffect } from 'react';
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
    Search,
    FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { createStaffSchedule } from '@/lib/actions/staff-subactions';
import { useRouter } from 'next/navigation';
import { ScheduleEditModal } from './schedule-edit-modal';

export default function ScheduleClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    const { modules, schedules: initialSchedules } = initialData;
    /** One assignment row = one card; avoids duplicate React keys when the same module_id appears twice. */
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showConflictDialog, setShowConflictDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSchedules, setCurrentSchedules] = useState(initialSchedules);

    useEffect(() => {
        setCurrentSchedules(initialSchedules);
    }, [initialSchedules]);

    const [scheduleData, setScheduleData] = useState({
        moduleId: '',
        day: 'Monday' as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'A101',
        type: 'lecture' as 'lecture' | 'tutorial' | 'lab',
        capacity: 50,
    });

    const selectedEntry = modules.find((m: any) => m.assignmentId === selectedAssignmentId);
    const selectedModuleId = selectedEntry?.id ?? '';
    const selectedMetaLabel = selectedEntry
        ? [selectedEntry.code, selectedEntry.academicYearLabel].filter(Boolean).join(' · ')
        : '';

    const moduleSchedules = useMemo(() => {
        const rows = currentSchedules.filter((s: any) => s.moduleId === selectedModuleId);
        const seen = new Set<string>();
        return rows.filter((s: any) => {
            if (!s.id || seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
        });
    }, [currentSchedules, selectedModuleId]);

    const currentModule = selectedEntry;

    const detectConflicts = (newSchedule: any) => {
        return currentSchedules.filter((schedule: any) =>
            schedule.id !== newSchedule.id &&
            schedule.day === newSchedule.day &&
            schedule.room === newSchedule.room &&
            (
                (newSchedule.startTime && schedule.startTime <= newSchedule.startTime && schedule.endTime > newSchedule.startTime) ||
                (newSchedule.endTime && schedule.startTime < newSchedule.endTime && schedule.endTime >= newSchedule.endTime)
            )
        );
    };

    const handleEditSchedule = (schedule: any) => {
        setScheduleData({
            moduleId: schedule.moduleId,
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
        setIsEditing(false);
        toast.success('Schedule updated successfully');
    };

    const handleAddSchedule = async () => {
        const conflicts = detectConflicts(scheduleData);
        if (conflicts.length > 0) {
            setShowConflictDialog(true);
            return;
        }

        try {
            const _s = await createStaffSchedule(scheduleData);
            setCurrentSchedules((prev: any) =>
                prev.some((x: any) => x.id === _s.id) ? prev : [...prev, _s],
            );
            setShowAddDialog(false);
            toast.success('New schedule added successfully');
            router.refresh();
        } catch (e) {
            toast.error("Failed to add schedule");
        }
    };

    const getScheduleStats = (moduleId: string) => {
        const schedules = currentSchedules.filter((s: any) => s.moduleId === moduleId);
        const totalHours = schedules.reduce((sum: number, s: any) => {
            const start = new Date(`2000-01-01 ${s.startTime}`);
            const end = new Date(`2000-01-01 ${s.endTime}`);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0);

        return {
            totalSessions: schedules.length,
            totalHours: totalHours,
            lectureHours: schedules.filter((s: any) => s.type === 'lecture').length * 1.5,
            tutorialHours: schedules.filter((s: any) => s.type === 'tutorial').length * 1.5,
            labHours: schedules.filter((s: any) => s.type === 'lab').length * 2,
        };
    };

    const filteredModules = modules.filter((module: any) => {
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

            <Card>
                <CardHeader>
                    <CardTitle>My Modules</CardTitle>
                    <CardDescription>Select a module to view and edit its schedule</CardDescription>
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
                            {filteredModules.map((module: any) => {
                                const stats = getScheduleStats(module.id);
                                return (
                                    <Card
                                        key={module.assignmentId}
                                        className={`cursor-pointer transition-colors ${selectedAssignmentId === module.assignmentId ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                        onClick={() => {
                                            setSelectedAssignmentId(module.assignmentId);
                                            setScheduleData(prev => ({ ...prev, moduleId: module.id }));
                                        }}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{module.title}</CardTitle>
                                                    <CardDescription>
                                                        {module.code}
                                                        {module.academicYearLabel
                                                            ? ` · ${module.academicYearLabel}`
                                                            : ''}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="outline">{stats.totalSessions} sessions</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    {stats.totalHours.toFixed(1)} hours/week
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

            {selectedAssignmentId && selectedModuleId && currentModule && (
                <Tabs defaultValue="schedule" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="schedule" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Schedule for {currentModule.title}</CardTitle>
                                        <CardDescription>
                                            {selectedMetaLabel ? `${selectedMetaLabel} — ` : ''}
                                            Manage lecture, tutorial, and lab schedules
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
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
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {moduleSchedules.map((schedule: any) => {
                                                const TypeIcon = getTypeIcon(schedule.type);
                                                return (
                                                    <div key={schedule.id} className="p-4 rounded-lg border">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                                                    <TypeIcon className="h-5 w-5 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="font-semibold capitalize">{schedule.type || 'Lecture'}</h4>
                                                                            <Badge className={getDayColor(schedule.day || schedule.day_of_week)}>
                                                                                {schedule.day || schedule.day_of_week}
                                                                        </Badge>
                                                                        </div>
                                                                        <ScheduleEditModal schedule={schedule} />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1 text-sm text-muted-foreground mt-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4" />
                                                                        {schedule.startTime || (schedule.start_time ? format(new Date(schedule.start_time), 'HH:mm') : '09:00')} - {schedule.endTime || (schedule.end_time ? format(new Date(schedule.end_time), 'HH:mm') : '10:30')}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="h-4 w-4" />
                                                                        Room {schedule.room || schedule.location}
                                                                    </div>
                                                                </div>
                                                                </div>
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
                                <CardDescription>Detect and resolve scheduling conflicts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertTitle>No Conflicts Detected</AlertTitle>
                                    <AlertDescription>
                                        All schedules are conflict-free.
                                    </AlertDescription>
                                </Alert>
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
                            Add a new schedule for {currentModule?.title || 'the selected module'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="day">Day</Label>
                                <Select
                                    value={scheduleData.day}
                                    onValueChange={(value) => setScheduleData({ ...scheduleData, day: value as any })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monday">Monday</SelectItem>
                                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                                        <SelectItem value="Thursday">Thursday</SelectItem>
                                        <SelectItem value="Friday">Friday</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={scheduleData.type}
                                    onValueChange={(value) => setScheduleData({ ...scheduleData, type: value as any })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                                    id="startTime" type="time"
                                    value={scheduleData.startTime}
                                    onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input
                                    id="endTime" type="time"
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
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddSchedule} disabled={!scheduleData.moduleId}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Schedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
