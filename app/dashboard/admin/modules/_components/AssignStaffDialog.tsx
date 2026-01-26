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
import { Users, Trash2, Plus, Loader2 } from 'lucide-react';
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
            toast.success("Staff assigned");
            setSelectedStaff('');
            loadData(); // Reload list
        } catch (e) {
            toast.error("Failed to assign staff");
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

    // Filter out already assigned staff from dropdown
    const availableStaff = allStaff.filter(s => !assignments.some(a => a.staffId === s.staffId));

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
                        Manage staff members assigned to this module.
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
                                        <SelectItem value="none" disabled>No assignments available</SelectItem>
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

                    {/* List */}
                    <div className="space-y-2">
                        <Label>Current Assignments</Label>
                        <div className="border rounded-md">
                            <ScrollArea className="h-[200px]">
                                {loading ? (
                                    <div className="p-4 flex justify-center text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                                    </div>
                                ) : assignments.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No staff assigned yet.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {assignments.map(a => (
                                            <div key={a.assignmentId} className="flex items-center justify-between p-3">
                                                <div>
                                                    <p className="font-medium text-sm">{a.name}</p>
                                                    <p className="text-xs text-muted-foreground">{a.role}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
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
                    <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
