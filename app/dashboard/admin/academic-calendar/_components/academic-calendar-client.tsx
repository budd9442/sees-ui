'use client';

import { useState } from 'react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Calendar, Clock, Plus, Trash2, CheckCircle, AlertTriangle, Settings, ToggleLeft
} from 'lucide-react';
import { toast } from 'sonner';
import {
    createAcademicYear,
    createSemester,
    toggleAcademicYearActive,
    updateSystemFeatureFlag,
    deleteSemester
} from '@/lib/actions/admin-calendar';

interface AcademicCalendarClientProps {
    initialAcademicYears: any[];
    initialFeatureFlags: Record<string, boolean>;
}

export default function AcademicCalendarClient({
    initialAcademicYears,
    initialFeatureFlags
}: AcademicCalendarClientProps) {
    const [activeTab, setActiveTab] = useState('years');
    const [years, setYears] = useState(initialAcademicYears);
    const [flags, setFlags] = useState(initialFeatureFlags);

    // Dialog States
    const [showNewYearDialog, setShowNewYearDialog] = useState(false);
    const [showNewSemesterDialog, setShowNewSemesterDialog] = useState(false);
    const [selectedYearId, setSelectedYearId] = useState<string | null>(null);

    // Forms
    const [newYear, setNewYear] = useState({ label: '', startDate: '', endDate: '' });
    const [newSemester, setNewSemester] = useState({ label: '', startDate: '', endDate: '' });

    // Handlers - Feature Flags
    const handleToggleFlag = async (key: string, currentValue: boolean) => {
        try {
            // Optimistic update
            setFlags(prev => ({ ...prev, [key]: !currentValue }));
            await updateSystemFeatureFlag(key, !currentValue);
            toast.success(`${key.replace(/_/g, ' ')} updated`);
        } catch (error) {
            setFlags(prev => ({ ...prev, [key]: currentValue })); // Revert
            toast.error("Failed to update flag");
        }
    };

    // Handlers - Academic Years
    const handleCreateYear = async () => {
        try {
            await createAcademicYear(newYear);
            toast.success("Academic year created");
            setShowNewYearDialog(false);
            setNewYear({ label: '', startDate: '', endDate: '' });
            // In a real app we'd re-fetch or use router.refresh() 
            // but the server action calls revalidatePath which should refresh the server prop
            // Since this is a client component receiving props, we rely on parent re-render or explicit refresh.
            // Next.js server actions + revalidatePath usually trigger a refresh of the route segment.
            // However, useState holds initial data. We should use router to refresh or specific technique?
            // For simplicity, let's assume valid re-render or we might need `useRouter().refresh()`.
            // Adding robust refresh:
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Academic Calendar & System</h1>
                    <p className="text-gray-600">Manage academic timelines and system-wide feature controls.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="years">Academic Years & Semesters</TabsTrigger>
                    <TabsTrigger value="flags">System Controls (Feature Flags)</TabsTrigger>
                </TabsList>

                <TabsContent value="years" className="space-y-6">
                    <div className="flex justify-end">
                        <Button onClick={() => setShowNewYearDialog(true)} className="bg-primary">
                            <Plus className="h-4 w-4 mr-2" /> New Academic Year
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {years.map((year) => (
                            <Card key={year.academic_year_id} className={`border-l-4 ${year.active ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <CardTitle>{year.label}</CardTitle>
                                                {year.active && <Badge className="bg-green-100 text-green-800">Active</Badge>}
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
                                            <Button variant="outline" size="sm" onClick={() => {
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
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Semesters</h4>
                                        {year.semesters.length === 0 ? (
                                            <p className="text-sm text-gray-400 italic">No semesters defined</p>
                                        ) : (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {year.semesters.map((sem: any) => (
                                                    <div key={sem.semester_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                        <div>
                                                            <p className="font-medium">{sem.label}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(sem.start_date).toLocaleDateString()} - {new Date(sem.end_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteSemester(sem.semester_id)}>
                                                            <Trash2 className="h-4 w-4" />
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
                </TabsContent>

                <TabsContent value="flags">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-blue-600" />
                                Feature Configuration
                            </CardTitle>
                            <CardDescription>
                                Toggle system-wide features for students. Changes take effect immediately.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Pathway Selection */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium">Pathway Selection</Label>
                                    <p className="text-sm text-gray-500">
                                        Allow L1 students to choose between MIT and IT pathways.
                                    </p>
                                </div>
                                <Switch
                                    checked={flags.enable_pathway_selection}
                                    onCheckedChange={(checked) => handleToggleFlag('enable_pathway_selection', !checked)}
                                />
                            </div>

                            {/* Specialization Selection */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium">Specialization Selection</Label>
                                    <p className="text-sm text-gray-500">
                                        Allow MIT students to choose specializations (BSE, OSCM, IS).
                                    </p>
                                </div>
                                <Switch
                                    checked={flags.enable_specialization_selection}
                                    onCheckedChange={(checked) => handleToggleFlag('enable_specialization_selection', !checked)}
                                />
                            </div>

                            {/* Module Registration */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium">Module Registration</Label>
                                    <p className="text-sm text-gray-500">
                                        Enable the module registration period for all active students.
                                    </p>
                                </div>
                                <Switch
                                    checked={flags.enable_module_registration}
                                    onCheckedChange={(checked) => handleToggleFlag('enable_module_registration', !checked)}
                                />
                            </div>

                            {/* Anonymous Reports */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium">Anonymous Reports</Label>
                                    <p className="text-sm text-gray-500">
                                        Allow students to submit anonymous feedback/reports.
                                    </p>
                                </div>
                                <Switch
                                    checked={flags.enable_anonymous_reports}
                                    onCheckedChange={(checked) => handleToggleFlag('enable_anonymous_reports', !checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
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
        </div>
    );
}
