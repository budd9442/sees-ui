'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Trash2, Plus, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { assignStaffToModule, getModuleAssignments, removeStaffAssignment, getAllStaffList } from '@/lib/actions/admin-modules';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AssignStaffDialogProps {
    moduleId: string;
    moduleName: string;
    trigger?: React.ReactNode;
}

export function AssignStaffDialog({ moduleId, moduleName, trigger }: AssignStaffDialogProps) {
    const [open, setOpen] = useState(false);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [allStaff, setAllStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    // Form state
    const [selectedStaff, setSelectedStaff] = useState('');
    const [selectedRole, setSelectedRole] = useState('LECTURER');

    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open, moduleId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedAssignments, fetchedStaff] = await Promise.all([
                getModuleAssignments(moduleId),
                getAllStaffList()
            ]);
            setAssignments(fetchedAssignments);
            setAllStaff(fetchedStaff);
        } catch (e) {
            toast.error("Failed to load staff data");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedStaff) return;
        setAssigning(true);
        try {
            await assignStaffToModule(moduleId, selectedStaff, selectedRole);
            toast.success("Staff assigned successfully");
            setSelectedStaff('');
            loadData(); // Reload list
        } catch (e: any) {
            toast.error(e.message || "Failed to assign staff");
        } finally {
            setAssigning(false);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeStaffAssignment(id);
            toast.success("Assignment removed");
            setAssignments(prev => prev.filter(a => a.assignmentId !== id));
        } catch (e) {
            toast.error("Failed to remove assignment");
        }
    };

    // Filter staff out only if assigned in the SAME year to allow re-assignments across years
    // (Actually backend handles the uniqueness, but for UX we just show all matches)
    const availableStaff = allStaff;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <Users className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Assign Staff: {moduleName}</DialogTitle>
                    <DialogDescription>
                        Manage lecturer rotations and session-specific assignments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Assignment Form */}
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                            <Label>Staff Member</Label>
                            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableStaff.map(s => (
                                        <SelectItem key={s.staffId} value={s.staffId}>
                                            {s.name} ({s.staffNumber})
                                        </SelectItem>
                                    ))}
                                    {availableStaff.length === 0 && (
                                        <SelectItem value="none" disabled>No staff available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-[140px] space-y-2">
                            <Label>Role</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                                    <SelectItem value="LEADER">Module Leader</SelectItem>
                                    <SelectItem value="LECTURER">Lecturer</SelectItem>
                                    <SelectItem value="TUTOR">Tutor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAssign} disabled={!selectedStaff || assigning}>
                            {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/20">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Default Target: Active Academic Year</span>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Assignment History</Label>
                            <Badge variant="outline" className="text-[10px] py-0">{assignments.length} Total</Badge>
                        </div>
                        <div className="border rounded-xl bg-muted/5">
                            <ScrollArea className="h-[200px]">
                                {loading ? (
                                    <div className="p-4 flex justify-center text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                                    </div>
                                ) : assignments.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Users className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">No historical or current assignments found.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-muted/10">
                                        {assignments.map(a => (
                                            <div key={a.assignmentId} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                                                <div className="flex gap-4 items-center">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {a.name.split(' ').map((n: string) => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-sm tracking-tight">{a.name}</p>
                                                            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 text-[9px] px-1.5 py-0">
                                                                {a.academicYear}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{a.role}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                    onClick={() => handleRemove(a.assignmentId)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Close Manager</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
