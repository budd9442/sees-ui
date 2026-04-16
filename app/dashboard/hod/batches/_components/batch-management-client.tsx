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
        if (!confirm(`Promote ${population} students from ${from} to ${to}? This action is irreversible.`)) return;

        setTransitionInFlight(from);
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
                            <span className="text-2xl font-black">{overviewMap[level] ?? 0}</span>
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Batch Detail: {activeLevel}
                    </CardTitle>
                    <CardDescription>Detailed roster and status mix for the selected batch.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingDetails ? (
                        <div className="py-12 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : !details ? (
                        <p className="text-sm text-muted-foreground">No detail available.</p>
                    ) : (
                        <Tabs defaultValue="summary" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="summary">Summary</TabsTrigger>
                                <TabsTrigger value="students">Students</TabsTrigger>
                            </TabsList>
                            <TabsContent value="summary" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-1"><CardDescription>Total Students</CardDescription></CardHeader>
                                    <CardContent><p className="text-2xl font-black">{details.summary.totalStudents}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-1"><CardDescription>Promoted Ready</CardDescription></CardHeader>
                                    <CardContent><p className="text-2xl font-black">{details.summary.promotedReadyCount}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-1"><CardDescription>Exceptions</CardDescription></CardHeader>
                                    <CardContent><p className="text-2xl font-black">{details.summary.exceptionsCount}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-1"><CardDescription>Graduates</CardDescription></CardHeader>
                                    <CardContent><p className="text-2xl font-black">{details.summary.graduatesCount}</p></CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="students">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Program</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>GPA</TableHead>
                                            <TableHead>Graduation</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {details.students.map((student) => (
                                            <TableRow key={student.studentId}>
                                                <TableCell>
                                                    <div className="font-medium">{student.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{student.studentId}</div>
                                                </TableCell>
                                                <TableCell>{student.email}</TableCell>
                                                <TableCell>{student.degreeProgramCode ?? student.degreeProgram ?? '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{student.enrollmentStatus}</Badge>
                                                </TableCell>
                                                <TableCell>{student.gpa.toFixed(2)}</TableCell>
                                                <TableCell>{student.graduationStatus ?? '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
