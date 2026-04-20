'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { executeBatchTransition, getBatchDetailsForOperator, getBatchOverviewForOperator } from '@/lib/actions/academic-transition-actions';
import { AlertCircle, ArrowUpCircle, GraduationCap, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type BatchLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'GRADUATED';

interface BatchOverviewRow {
    level: BatchLevel;
    count: number;
}

interface BatchDetailsPayload {
    level: BatchLevel;
    summary: {
        totalStudents: number;
        enrolledCount: number;
        promotedReadyCount: number;
        exceptionsCount: number;
        graduatesCount: number;
        enrollmentBuckets: { status: string; count: number }[];
    };
    students: {
        studentId: string;
        fullName: string;
        email: string;
        level: string | null;
        enrollmentStatus: string;
        degreeProgram: string | null;
        degreeProgramCode: string | null;
        specialization: string | null;
        gpa: number;
        admissionYear: number;
        graduationStatus: string | null;
        graduatedAt: string | null;
    }[];
}

interface BatchManagementClientProps {
    initialOverview: BatchOverviewRow[];
    initialDetail: BatchDetailsPayload | null;
}

const TRANSITIONS: Array<{ from: BatchLevel; to: BatchLevel }> = [
    { from: 'L1', to: 'L2' },
    { from: 'L2', to: 'L3' },
    { from: 'L3', to: 'L4' },
    { from: 'L4', to: 'GRADUATED' },
];

export function BatchManagementClient({ initialOverview, initialDetail }: BatchManagementClientProps) {
    const [overview, setOverview] = useState<BatchOverviewRow[]>(initialOverview);
    const [activeLevel, setActiveLevel] = useState<BatchLevel>(initialDetail?.level ?? 'L1');
    const [details, setDetails] = useState<BatchDetailsPayload | null>(initialDetail);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [transitionInFlight, setTransitionInFlight] = useState<BatchLevel | null>(null);
    const [promotionDialog, setPromotionDialog] = useState<{
        from: BatchLevel;
        to: BatchLevel;
        count: number;
        targetCount: number;
    } | null>(null);

    const overviewMap = useMemo(() => {
        return overview.reduce<Record<string, number>>((acc, row) => {
            acc[row.level] = row.count;
            return acc;
        }, {});
    }, [overview]);

    const refreshOverview = async () => {
        const res = await getBatchOverviewForOperator();
        if (!res.success || !res.data) {
            toast.error(res.error || 'Failed to refresh batch overview.');
            return;
        }
        setOverview(res.data as BatchOverviewRow[]);
    };

    const loadDetails = async (level: BatchLevel) => {
        setActiveLevel(level);
        setLoadingDetails(true);
        try {
            const res = await getBatchDetailsForOperator(level);
            if (!res.success || !res.data) {
                toast.error(res.error || 'Failed to load batch details.');
                return;
            }
            setDetails(res.data as BatchDetailsPayload);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleTransition = async (from: BatchLevel, to: BatchLevel) => {
        const population = overviewMap[from] ?? 0;
        if (population === 0) {
            toast.error(`No students found in ${from}.`);
            return;
        }
        const targetCount = overviewMap[to] ?? 0;
        setPromotionDialog({ from, to, count: population, targetCount });
    };

    const executeTransition = async () => {
        if (!promotionDialog) return;
        const { from, to } = promotionDialog;

        setTransitionInFlight(from);
        setPromotionDialog(null);
        try {
            const res = await executeBatchTransition(from, to);
            if (!res.success) {
                toast.error(res.error || 'Batch transition failed.');
                return;
            }
            toast.success(`${res.count} students moved from ${from} to ${to}.`);
            await refreshOverview();
            await loadDetails(activeLevel);
        } finally {
            setTransitionInFlight(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Batch Management"
                description="View all cohorts and graduates, inspect batch details, and run end-of-year transitions."
            />

            <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-900">
                    Make sure no open selection rounds are active before running transitions.
                </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {(['L1', 'L2', 'L3', 'L4', 'GRADUATED'] as BatchLevel[]).map((level) => (
                    <Card
                        key={level}
                        role="button"
                        onClick={() => loadDetails(level)}
                        className={`cursor-pointer transition ${activeLevel === level ? 'border-primary ring-1 ring-primary' : 'hover:shadow-md'}`}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold">{level}</CardTitle>
                            <CardDescription>{level === 'GRADUATED' ? 'Graduates' : 'Current cohort'}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <span className="text-2xl font-semibold">{overviewMap[level] ?? 0}</span>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Year-End Transitions</CardTitle>
                    <CardDescription>Only legal progression is allowed (L1 to L2 to L3 to L4 to GRADUATED).</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {TRANSITIONS.map((transition) => (
                        <Card key={transition.from} className="border-dashed">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">
                                    {transition.from} to {transition.to}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Eligible</span>
                                    <Badge variant="secondary">{overviewMap[transition.from] ?? 0}</Badge>
                                </div>
                                <Button
                                    className="w-full"
                                    disabled={transitionInFlight !== null}
                                    onClick={() => handleTransition(transition.from, transition.to)}
                                >
                                    {transitionInFlight === transition.from ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <ArrowUpCircle className="h-4 w-4 mr-2" />
                                            Promote Batch
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>


            {/* Promotion Confirmation Dialog */}
            <Dialog open={!!promotionDialog} onOpenChange={(open) => !open && setPromotionDialog(null)}>
                <DialogContent className="rounded-3xl max-w-md border-none shadow-2xl">
                    <DialogHeader>
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${promotionDialog?.targetCount && promotionDialog.targetCount > 0 && promotionDialog.to !== 'GRADUATED' ? 'bg-orange-100 text-orange-600' : 'bg-primary/10 text-primary'}`}>
                            <ArrowUpCircle className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold">Confirm Batch Transition</DialogTitle>
                        <DialogDescription className="pt-2">
                            You are about to promote <span className="font-bold text-foreground">{promotionDialog?.count} students</span> from
                            <span className="px-2 py-0.5 mx-1 rounded bg-muted font-bold text-foreground">{promotionDialog?.from}</span> to
                            <span className="px-2 py-0.5 mx-1 rounded bg-muted font-bold text-foreground">{promotionDialog?.to}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {promotionDialog?.targetCount && promotionDialog.targetCount > 0 && promotionDialog.to !== 'GRADUATED' && (
                        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 space-y-2 mt-4">
                            <div className="flex items-center gap-2 text-orange-800 font-semibold text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>Destination Conflict Detected</span>
                            </div>
                            <p className="text-xs text-orange-700 leading-relaxed">
                                There are already <span className="font-bold">{promotionDialog.targetCount} students</span> at level {promotionDialog.to}.
                                Proceeding will merge these batches together.
                                We recommend promoting the existing {promotionDialog.to} batch first.
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
                            onClick={executeTransition}
                            className={`rounded-xl flex-[2] h-12 shadow-lg transition-all ${promotionDialog?.targetCount && promotionDialog.targetCount > 0 && promotionDialog.to !== 'GRADUATED'
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
