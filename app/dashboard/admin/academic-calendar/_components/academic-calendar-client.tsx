'use client';

import { useState } from 'react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Plus, Trash2, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import {
    createAcademicYear,
    createSemester,
    toggleAcademicYearActive,
    deleteSemester
} from '@/lib/actions/admin-calendar';

interface AcademicCalendarClientProps {
    initialAcademicYears: any[];
}

export default function AcademicCalendarClient({
    initialAcademicYears
}: AcademicCalendarClientProps) {
    const [years, setYears] = useState(initialAcademicYears);

    // Dialog States
    const [showNewYearDialog, setShowNewYearDialog] = useState(false);
    const [showNewSemesterDialog, setShowNewSemesterDialog] = useState(false);
    const [selectedYearId, setSelectedYearId] = useState<string | null>(null);

    // Forms
    const [newYear, setNewYear] = useState({ label: '', startDate: '', endDate: '' });
    const [newSemester, setNewSemester] = useState({ label: '', startDate: '', endDate: '' });

    // Handlers - Academic Years
    const handleCreateYear = async () => {
        try {
            await createAcademicYear(newYear);
            toast.success("Academic year created");
            setShowNewYearDialog(false);
            setNewYear({ label: '', startDate: '', endDate: '' });
            window.location.reload();
        } catch (error) {
            toast.error("Failed to create academic year");
        }
    };

    const handleToggleActiveYear = async (id: string, isActive: boolean) => {
        try {
            await toggleAcademicYearActive(id, isActive);
            toast.success(`Academic Year ${isActive ? 'Activated' : 'Deactivated'}`);
            window.location.reload();
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    // Handlers - Semesters
    const handleCreateSemester = async () => {
        if (!selectedYearId) return;
        try {
            await createSemester(selectedYearId, newSemester);
            toast.success("Semester added");
            setShowNewSemesterDialog(false);
            setNewSemester({ label: '', startDate: '', endDate: '' });
            window.location.reload();
        } catch (e) {
            toast.error("Failed to add semester");
        }
    };

    const handleDeleteSemester = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteSemester(id);
            toast.success("Semester deleted");
            window.location.reload();
        } catch (e) {
            toast.error("Failed to delete semester");
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex items-center justify-between mb-8 text-center md:text-left flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Academic Calendar</h1>
                    <p className="text-gray-600">Manage academic years, semesters, and intakes.</p>
                </div>
                <Button onClick={() => setShowNewYearDialog(true)} className="bg-primary">
                    <Plus className="h-4 w-4 mr-2" /> New Academic Year
                </Button>
            </div>

            <div className="grid gap-6">
                {years.map((year) => (
                    <Card key={year.academic_year_id} className={`border-l-4 transition-all duration-300 hover:shadow-md ${year.active ? 'border-l-green-500 shadow-sm' : 'border-l-gray-300'}`}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle>{year.label}</CardTitle>
                                        {year.active && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>}
                                    </div>
                                    <CardDescription>
                                        {new Date(year.start_date).toLocaleDateString()} - {new Date(year.end_date).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!year.active && (
                                        <Button variant="outline" size="sm" onClick={() => handleToggleActiveYear(year.academic_year_id, true)}>
                                            Set Active
                                        </Button>
                                    )}
                                    <Button variant="secondary" size="sm" onClick={() => {
                                        setSelectedYearId(year.academic_year_id);
                                        setShowNewSemesterDialog(true);
                                    }}>
                                        Add Semester
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    <Calendar className="h-3 w-3" />
                                    Semesters
                                </div>
                                {year.semesters.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No semesters defined for this period.</p>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {year.semesters.map((sem: any) => (
                                            <div key={sem.semester_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50 transition-colors hover:bg-muted/50">
                                                <div>
                                                    <p className="text-xs font-black">{sem.label}</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {new Date(sem.start_date).toLocaleDateString()} - {new Date(sem.end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSemester(sem.semester_id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialogs */}
            <AnimatePresence>
            <Dialog open={showNewYearDialog} onOpenChange={setShowNewYearDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Academic Year</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Label</Label>
                            <Input placeholder="e.g. 2025-2026" value={newYear.label} onChange={e => setNewYear({ ...newYear, label: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" value={newYear.startDate} onChange={e => setNewYear({ ...newYear, startDate: e.target.value })} />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" value={newYear.endDate} onChange={e => setNewYear({ ...newYear, endDate: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateYear}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showNewSemesterDialog} onOpenChange={setShowNewSemesterDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Semester</DialogTitle>
                        <DialogDescription>Adding semester to selected year</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Label</Label>
                            <Input placeholder="e.g. Semester 1" value={newSemester.label} onChange={e => setNewSemester({ ...newSemester, label: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" value={newSemester.startDate} onChange={e => setNewSemester({ ...newSemester, startDate: e.target.value })} />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" value={newSemester.endDate} onChange={e => setNewSemester({ ...newSemester, endDate: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateSemester}>Add Semester</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </AnimatePresence>
        </div>
    );
}

// Helper to keep the imports clean in the target file
const AnimatePresence = ({ children }: { children: any }) => <>{children}</>;
