'use client';

import { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Edit2, Save, RefreshCcw } from 'lucide-react';
import { updateLectureSchedule } from '@/lib/actions/staff-actions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function ScheduleEditModal({ schedule }: { schedule: any }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Safe formatting utility
    const safeFormat = (dateInput: any, formatStr: string) => {
        try {
            if (!dateInput) return "09:00"; // Default fallback
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return "09:00";
            return format(date, formatStr);
        } catch (e) {
            return "09:00";
        }
    };

    const [formData, setFormData] = useState({
        dayOfWeek: schedule.day_of_week || schedule.day || 'Monday',
        location: schedule.location || schedule.room || '',
        startTime: schedule.startTime || safeFormat(schedule.start_time, 'HH:mm'),
        endTime: schedule.endTime || safeFormat(schedule.end_time, 'HH:mm'),
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateLectureSchedule({
                scheduleId: schedule.id,
                ...formData
            });
            toast.success("Schedule updated successfully.");
            setOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to update schedule.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modify Class Schedule</DialogTitle>
                    <DialogDescription>
                        Update the room and timing for {schedule.module?.name || 'this module'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="day" className="text-right">Day</Label>
                        <Select 
                            value={formData.dayOfWeek} 
                            onValueChange={(val) => setFormData({...formData, dayOfWeek: val})}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select Day" />
                            </SelectTrigger>
                            <SelectContent>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">Room</Label>
                        <Input 
                            id="location" 
                            className="col-span-3" 
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Start</Label>
                        <Input 
                            type="time" 
                            className="col-span-3" 
                            value={formData.startTime}
                            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">End</Label>
                        <Input 
                            type="time" 
                            className="col-span-3" 
                            value={formData.endTime}
                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
