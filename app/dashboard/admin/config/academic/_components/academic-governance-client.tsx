'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CalendarDays,
    Plus,
    Play,
    Trash2,
    AlertCircle,
    CheckCircle2,
    History,
    Users,
    Layers,
    ArrowRight,
    Copy,
    GraduationCap,
    ArrowUpCircle,
    Loader2,
    Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import {
    createAcademicYear,
    updateAcademicYear,
    setActiveAcademicYear,
    deleteAcademicYear
} from '@/lib/actions/academic-year-admin';
import { cloneAcademicYearData } from '@/lib/actions/academic-continuity-actions';
import { getBatchStatistics, promoteBatch } from '@/lib/actions/academic-transition-actions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';

interface AcademicYear {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    stats: {
        semesterCount: number;
        intakeCount: number;
    };
}

interface BatchStats {
    level: string;
    count: number;
}

interface AcademicGovernanceClientProps {
    initialYears: any[];
}

export function AcademicGovernanceClient({ initialYears }: AcademicGovernanceClientProps) {
    const [years, setYears] = useState<AcademicYear[]>(initialYears.map(y => ({
        ...y,
        startDate: new Date(y.startDate),
        endDate: new Date(y.endDate)
    })));

    // Provisioning State
    const [newYear, setNewYear] = useState({
        label: '',
        startDate: '',
        endDate: '',
        cloneSourceId: 'none',
        cloneModules: true,
        cloneStaff: false
    });
    const [isProvisioning, setIsProvisioning] = useState(false);

    // Edit State
    const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
    const [editData, setEditData] = useState({ label: '', startDate: '', endDate: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    // Transition State
    const [batchStats, setBatchStats] = useState<BatchStats[]>([]);
    const [isPromoting, setIsPromoting] = useState<string | null>(null);
    const [promotionDialog, setPromotionDialog] = useState<{
        source: string;
        target: string;
        count: number;
        targetCount: number;
    } | null>(null);

    useEffect(() => {
        getBatchStatistics().then(res => {
            if (res.success && res.data) setBatchStats(res.data);
        });
    }, []);

    const handleCreate = async () => {
        if (!newYear.label || !newYear.startDate || !newYear.endDate) {
            toast.error("Please fill in all mandatory fields.");
            return;
        }

        setIsProvisioning(true);
        try {
            // 1. Create the Year
            const res = await createAcademicYear({
                label: newYear.label,
                startDate: new Date(newYear.startDate),
                endDate: new Date(newYear.endDate)
            });

            if (res.success && res.data) {
                // 2. Optional Cloning
                if (newYear.cloneSourceId !== 'none') {
                    toast.info(`Provisioning complete. Commencing data clone from ${years.find(y => y.id === newYear.cloneSourceId)?.label}...`);
                    const cloneRes = await cloneAcademicYearData(
                        newYear.cloneSourceId,
                        res.data.academic_year_id,
                        { modules: newYear.cloneModules, staff: newYear.cloneStaff }
                    );
                    if (cloneRes.success) {
                        const { modulesCloned, structuresCloned, programsCloned, specializationsCloned } = cloneRes.data || {};
                        toast.success(`Continuity established: ${modulesCloned} modules, ${programsCloned} programs, and ${structuresCloned} curriculum structures copied.`);
                    }
                } else {
                    toast.success("Academic year created successfully.");
                }
                window.location.reload();
            } else {
                toast.error(res.error || "Failed to create year.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred during provisioning.");
        } finally {
            setIsProvisioning(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingYear || !editData.label || !editData.startDate || !editData.endDate) {
            toast.error("Please fill in all mandatory fields.");
            return;
        }

        setIsUpdating(true);
        try {
            const res = await updateAcademicYear(editingYear.id, {
                label: editData.label,
                startDate: new Date(editData.startDate),
                endDate: new Date(editData.endDate)
            });

            if (res.success) {
                toast.success("Academic year updated successfully.");
                window.location.reload();
            } else {
                toast.error(res.error || "Failed to update year.");
            }
        } catch (error) {
            toast.error("An error occurred during update.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePromote = async (source: string, target: string) => {
        const count = batchStats.find(b => b.level === source)?.count || 0;
        if (count === 0) {
            toast.error(`No students found at level ${source}.`);
            return;
        }

        const targetCount = batchStats.find(b => b.level === target)?.count || 0;
        setPromotionDialog({ source, target, count, targetCount });
    };

    const executePromotion = async () => {
        if (!promotionDialog) return;
        const { source, target } = promotionDialog;

        setIsPromoting(source);
        setPromotionDialog(null);
        try {
            const res = await promoteBatch(source, target);
            if (res.success) {
                toast.success(`Success: ${res.count} students promoted to ${target}.`);
                // Refresh stats
                const statRes = await getBatchStatistics();
                if (statRes.success && statRes.data) setBatchStats(statRes.data);
            } else {
                toast.error(res.error || "Transition failed.");
            }
        } catch (error) {
            toast.error("An error occurred during promotion.");
        } finally {
            setIsPromoting(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Academic Lifecycle Governance"
                    description="Institutional temporal settings, continuity cloning, and vertical batch transitions."
                />

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl h-11">
                            <Plus className="h-4 w-4 mr-2" />
                            Initialize Academic Cycle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl max-w-2xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold">Create Academic Year</DialogTitle>
                            <DialogDescription>
                                Configure the dates and data migration for the new academic session.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="label" className="text-xs font-medium text-muted-foreground/70">Academic Identifier</Label>
                                    <Input
                                        id="label"
                                        placeholder="e.g. AY 2026/2027"
                                        className="h-12 rounded-xl bg-muted/30 border-none"
                                        value={newYear.label}
                                        onChange={(e) => setNewYear({ ...newYear, label: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start" className="text-xs font-medium text-muted-foreground/70">Session Start</Label>
                                        <Input
                                            id="start"
                                            type="date"
                                            className="h-12 rounded-xl bg-muted/30 border-none"
                                            value={newYear.startDate}
                                            onChange={(e) => setNewYear({ ...newYear, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end" className="text-xs font-medium text-muted-foreground/70">Session End</Label>
                                        <Input
                                            id="end"
                                            type="date"
                                            className="h-12 rounded-xl bg-muted/30 border-none"
                                            value={newYear.endDate}
                                            onChange={(e) => setNewYear({ ...newYear, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Continuity Engine */}
                            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Copy className="h-4 w-4 text-primary" />
                                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">Data Continuity</h4>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Copy configuration from existing year:</Label>
                                        <Select
                                            value={newYear.cloneSourceId}
                                            onValueChange={(val) => setNewYear({ ...newYear, cloneSourceId: val })}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-primary/20">
                                                <SelectValue placeholder="Do not clone" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="none">None (Fresh Configuration)</SelectItem>
                                                {years.map(y => (
                                                    <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {newYear.cloneSourceId !== 'none' && (
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="clone-modules"
                                                    checked={newYear.cloneModules}
                                                    onCheckedChange={(val) => setNewYear({ ...newYear, cloneModules: !!val })}
                                                />
                                                <label htmlFor="clone-modules" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    Clone Module Structures
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="clone-staff"
                                                    checked={newYear.cloneStaff}
                                                    onCheckedChange={(val) => setNewYear({ ...newYear, cloneStaff: !!val })}
                                                />
                                                <label htmlFor="clone-staff" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    Clone Staff Assignments
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-3">
                            <Button variant="ghost" className="rounded-xl px-8 h-12" disabled={isProvisioning}>Cancel</Button>
                            <Button
                                onClick={handleCreate}
                                className="rounded-xl px-12 h-12"
                                disabled={isProvisioning}
                            >
                                {isProvisioning ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Provisioning...
                                    </>
                                ) : "Finalize Setup"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="cycles" className="w-full">
                <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl mb-6">
                    <TabsTrigger value="cycles" className="rounded-xl px-8 font-semibold text-xs uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Academic Cycles
                    </TabsTrigger>
                    <TabsTrigger value="transitions" className="rounded-xl px-8 font-semibold text-xs uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Batch Transitions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="cycles">
                    <div className="grid gap-4">
                        {years.map((year) => (
                            <Card key={year.id} className={`overflow-hidden transition-all ${year.isActive ? 'border-primary border-2 shadow-xl shadow-primary/5' : 'hover:shadow-md'}`}>
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row min-h-[100px]">
                                        <div className={`w-2 h-auto ${year.isActive ? 'bg-primary' : 'bg-muted'}`} />
                                        <div className="flex-1 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-semibold">{year.label}</h3>
                                                    {/* Removed redundant Active badge */}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="h-4 w-4 text-primary opacity-60" />
                                                        <span>{format(year.startDate, 'MMM d, yyyy')}</span>
                                                        <ArrowRight className="h-3 w-3 mx-1" />
                                                        <span>{format(year.endDate, 'MMM d, yyyy')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 px-8 py-4 bg-muted/20 rounded-2xl border border-muted/5">
                                                <div className="text-center">
                                                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide mb-1 opacity-70">Semesters</p>
                                                    <span className="font-semibold text-lg">{year.stats.semesterCount}</span>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide mb-1 opacity-70">Programs</p>
                                                    <span className="font-semibold text-lg">{year.stats.intakeCount}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {!year.isActive ? (
                                                    <Button
                                                        variant="outline"
                                                        className="border-primary/20 text-primary hover:bg-primary/5 font-bold rounded-xl h-11"
                                                        onClick={() => setActiveAcademicYear(year.id)}
                                                    >
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Activate Cycle
                                                    </Button>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-5 py-2.5 rounded-xl border border-green-100 font-semibold text-sm shadow-sm ring-1 ring-green-200/50">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Active Session
                                                    </div>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-11 w-11 hover:text-primary hover:bg-primary/5 rounded-xl"
                                                    onClick={() => {
                                                        setEditingYear(year);
                                                        setEditData({
                                                            label: year.label,
                                                            startDate: format(year.startDate, 'yyyy-MM-dd'),
                                                            endDate: format(year.endDate, 'yyyy-MM-dd')
                                                        });
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-11 w-11 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                                    disabled={year.isActive}
                                                    onClick={() => deleteAcademicYear(year.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="transitions" className="space-y-6">
                    <Alert className="bg-orange-50 border-orange-100 rounded-2xl p-6">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <CardDescription className="text-orange-800 ml-2 font-medium">
                            Vertical promotion moves the entire student batch to their next academic level.
                        </CardDescription>
                    </Alert>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            { from: 'L1', to: 'L2', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { from: 'L2', to: 'L3', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { from: 'L3', to: 'L4', color: 'text-orange-600', bg: 'bg-orange-50' },
                            { from: 'L4', to: 'GRADUATED', color: 'text-green-600', bg: 'bg-green-50' },
                        ].map((transition) => (
                            <Card key={transition.from} className="relative overflow-hidden group hover:shadow-xl transition-all border-none bg-white shadow-sm ring-1 ring-muted">
                                <CardHeader className="pb-4">
                                    <div className={`h-12 w-12 rounded-2xl ${transition.bg} ${transition.color} flex items-center justify-center mb-2`}>
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-lg font-semibold">Transition {transition.from}</CardTitle>
                                    <CardDescription className="text-xs">
                                        Shift population to {transition.to}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Eligible Population</span>
                                        <span className="text-xl font-semibold">{batchStats.find(b => b.level === transition.from)?.count || 0}</span>
                                    </div>
                                    <Button
                                        className="w-full font-semibold rounded-xl h-11"
                                        disabled={isPromoting !== null}
                                        onClick={() => handlePromote(transition.from, transition.to)}
                                    >
                                        {isPromoting === transition.from ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <ArrowUpCircle className="h-4 w-4 mr-2" />
                                                Elevate Batch
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>


            {/* Edit Dialog */}
            <Dialog open={!!editingYear} onOpenChange={(open) => !open && setEditingYear(null)}>
                <DialogContent className="rounded-3xl max-w-lg border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold">Edit Academic Cycle</DialogTitle>
                        <DialogDescription>
                            Modify the configuration for {editingYear?.label}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-label" className="text-xs font-medium text-muted-foreground/70">Academic Identifier</Label>
                                <Input
                                    id="edit-label"
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    value={editData.label}
                                    onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-start" className="text-xs font-medium text-muted-foreground/70">Session Start</Label>
                                    <Input
                                        id="edit-start"
                                        type="date"
                                        className="h-12 rounded-xl bg-muted/30 border-none"
                                        value={editData.startDate}
                                        onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-end" className="text-xs font-medium text-muted-foreground/70">Session End</Label>
                                    <Input
                                        id="edit-end"
                                        type="date"
                                        className="h-12 rounded-xl bg-muted/30 border-none"
                                        value={editData.endDate}
                                        onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setEditingYear(null)} className="rounded-xl h-12">Cancel</Button>
                        <Button
                            onClick={handleUpdate}
                            className="rounded-xl font-semibold px-12 h-12"
                            disabled={isUpdating}
                        >
                            {isUpdating ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Promotion Confirmation Dialog */}
            <Dialog open={!!promotionDialog} onOpenChange={(open) => !open && setPromotionDialog(null)}>
                <DialogContent className="rounded-3xl max-w-md border-none shadow-2xl">
                    <DialogHeader>
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${promotionDialog?.targetCount && promotionDialog.targetCount > 0 && promotionDialog.target !== 'GRADUATED' ? 'bg-orange-100 text-orange-600' : 'bg-primary/10 text-primary'}`}>
                            <ArrowUpCircle className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold">Confirm Batch Transition</DialogTitle>
                        <DialogDescription className="pt-2">
                            You are about to promote <span className="font-bold text-foreground">{promotionDialog?.count} students</span> from 
                            <span className="px-2 py-0.5 mx-1 rounded bg-muted font-bold text-foreground">{promotionDialog?.source}</span> to 
                            <span className="px-2 py-0.5 mx-1 rounded bg-muted font-bold text-foreground">{promotionDialog?.target}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {promotionDialog?.targetCount && promotionDialog.targetCount > 0 && promotionDialog.target !== 'GRADUATED' && (
                        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 space-y-2 mt-4">
                            <div className="flex items-center gap-2 text-orange-800 font-semibold text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>Destination Conflict Detected</span>
                            </div>
                            <p className="text-xs text-orange-700 leading-relaxed">
                                There are already <span className="font-bold">{promotionDialog.targetCount} students</span> at level {promotionDialog.target}. 
                                Proceeding will merge these batches together. 
                                We recommend promoting the existing {promotionDialog.target} batch first.
                            </p>
                        </div>
                    )}

                    <div className="py-4 text-xs text-muted-foreground italic">
                        * This action is permanent and will update the academic records of all eligible students.
                    </div>

                    <DialogFooter className="gap-3 sm:justify-between mt-2">
                        <Button variant="ghost" onClick={() => setPromotionDialog(null)} className="rounded-xl flex-1 h-12">
                            Cancel
                        </Button>
                        <Button 
                            onClick={executePromotion} 
                            className={`rounded-xl flex-[2] h-12 shadow-lg transition-all ${promotionDialog?.targetCount && promotionDialog.targetCount > 0 && promotionDialog.target !== 'GRADUATED' 
                                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200' 
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'}`}
                        >
                            Proceed with Promotion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
