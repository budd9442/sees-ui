'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Loader2, FileDown, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    getModuleRegistrationRoundSnapshot,
    closeModuleRegistrationRound,
    finalizeModuleRegistrationRound,
    type ModuleRegistrationRoundSnapshot,
} from '@/lib/actions/module-registration-round-actions';

function csvEscape(cell: string | number): string {
    const s = String(cell ?? '');
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function downloadCsv(filename: string, header: string[], lines: (string | number)[][]) {
    const body = [header.map(csvEscape).join(',')]
        .concat(lines.map(row => row.map(csvEscape).join(',')))
        .join('\n');
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadDetailedCsv(data: ModuleRegistrationRoundSnapshot) {
    // 1. Group by student
    const studentMap = new Map<string, {
        student_id: string;
        email: string;
        firstName: string;
        lastName: string;
        level: string;
        modules: string[];
        totalCredits: number;
    }>();

    data.rows.forEach(row => {
        if (!studentMap.has(row.student_id)) {
            studentMap.set(row.student_id, {
                student_id: row.student_id,
                email: row.email,
                firstName: row.firstName,
                lastName: row.lastName,
                level: row.current_level,
                modules: [],
                totalCredits: 0
            });
        }
        const s = studentMap.get(row.student_id)!;
        s.modules.push(row.module_code);
        s.totalCredits += row.credits;
    });

    const students = Array.from(studentMap.values()).sort((a, b) => a.student_id.localeCompare(b.student_id));
    const maxModules = Math.max(...students.map(s => s.modules.length), 1);

    // 2. Build headers
    const h = [
        'STUDENT ID',
        'EMAIL',
        'FIRST NAME',
        'LAST NAME',
        'LEVEL',
        ...Array.from({ length: maxModules }, (_, i) => `MODULE ${i + 1}`),
        'TOTAL CREDITS'
    ];

    // 3. Build lines
    const lines = students.map(s => {
        const row: (string | number)[] = [
            s.student_id,
            s.email,
            s.firstName,
            s.lastName,
            s.level,
            ...s.modules,
            ...Array(maxModules - s.modules.length).fill(''),
            s.totalCredits
        ];
        return row;
    });

    const safe = data.round.label.replace(/[^\w\-]+/g, '_').slice(0, 40);
    downloadCsv(`module-registrations_${safe}_full_report.csv`, h, lines);
}

function downloadByModuleCsv(data: ModuleRegistrationRoundSnapshot) {
    const levels = Object.keys(data.summary.byLevel).sort();
    let h: string[];
    let lines: (string | number)[][];
    if (levels.length === 0) {
        h = ['module_code', 'module_name', 'credits', 'total_registrations'];
        lines = data.summary.byModule.map(m => [m.code, m.name, m.credits, m.total]);
    } else {
        h = ['module_code', 'module_name', 'credits', 'total_registrations', ...levels.map(l => `count_${l}`)];
        lines = data.summary.byModule.map(m => {
            const row: (string | number)[] = [m.code, m.name, m.credits, m.total];
            for (const lv of levels) {
                row.push(m.byLevel[lv] ?? 0);
            }
            return row;
        });
    }
    const safe = data.round.label.replace(/[^\w\-]+/g, '_').slice(0, 40);
    downloadCsv(`module-registrations_${safe}_by_module.csv`, h, lines);
}

function downloadByLevelCsv(data: ModuleRegistrationRoundSnapshot) {
    const h = ['level', 'distinct_students', 'registration_rows'];
    const lines = Object.entries(data.summary.byLevel).map(([lvl, v]) => [lvl, v.students, v.registrations]);
    const safe = data.round.label.replace(/[^\w\-]+/g, '_').slice(0, 40);
    downloadCsv(`module-registrations_${safe}_by_level.csv`, h, lines);
}

/** Levels this round applies to (tabs). Explicit round.levels order; if "all", use levels present in snapshot. */
function reportLevelTabs(data: ModuleRegistrationRoundSnapshot): string[] {
    if (data.round.levels.length > 0) {
        return [...data.round.levels];
    }
    return Object.keys(data.summary.byLevel).sort();
}

function levelTabValue(lv: string) {
    return `level-${encodeURIComponent(lv)}`;
}

type LevelMatrixModule = { module_id: string; code: string; name: string; catalogCredits: number };

type LevelMatrixStudent = {
    student_id: string;
    email: string;
    firstName: string;
    lastName: string;
    /** Credits registered per module column index (0 if none) */
    creditsByModuleIndex: number[];
    totalCredits: number;
};

function buildLevelMatrix(data: ModuleRegistrationRoundSnapshot, level: string): {
    modules: LevelMatrixModule[];
    students: LevelMatrixStudent[];
} {
    const rowsAt = data.rows.filter(r => r.current_level === level);
    const modMap = new Map<string, LevelMatrixModule>();
    for (const r of rowsAt) {
        if (!modMap.has(r.module_id)) {
            modMap.set(r.module_id, {
                module_id: r.module_id,
                code: r.module_code,
                name: r.module_name,
                catalogCredits: r.credits,
            });
        }
    }
    const modules = [...modMap.values()].sort((a, b) => a.code.localeCompare(b.code));
    const modIndex = new Map(modules.map((m, i) => [m.module_id, i] as const));

    const byStudent = new Map<
        string,
        { credits: number[]; email: string; firstName: string; lastName: string; total: number }
    >();
    for (const r of rowsAt) {
        const i = modIndex.get(r.module_id);
        if (i === undefined) continue;
        let row = byStudent.get(r.student_id);
        if (!row) {
            row = {
                credits: modules.map(() => 0),
                email: r.email,
                firstName: r.firstName,
                lastName: r.lastName,
                total: 0,
            };
            byStudent.set(r.student_id, row);
        }
        row.credits[i] += r.credits;
        row.total += r.credits;
    }

    const students: LevelMatrixStudent[] = [...byStudent.entries()]
        .map(([student_id, v]) => ({
            student_id,
            email: v.email,
            firstName: v.firstName,
            lastName: v.lastName,
            creditsByModuleIndex: v.credits,
            totalCredits: v.total,
        }))
        .sort((a, b) => {
            const ln = a.lastName.localeCompare(b.lastName);
            if (ln !== 0) return ln;
            return a.firstName.localeCompare(b.firstName);
        });

    return { modules, students };
}

function downloadLevelMatrixCsv(data: ModuleRegistrationRoundSnapshot, level: string) {
    const { modules, students } = buildLevelMatrix(data, level);
    const modHeaders = modules.map(
        m => `${m.code} — ${m.name} [module_id:${m.module_id}] (${m.catalogCredits} cr.)`
    );
    const h = ['student_id', 'email', 'first_name', 'last_name', ...modHeaders, 'total_credits'];
    const lines = students.map(s => {
        const row: (string | number)[] = [
            s.student_id,
            s.email,
            s.firstName,
            s.lastName,
            ...s.creditsByModuleIndex.map(c => (c > 0 ? '✓' : '')),
            s.totalCredits,
        ];
        return row;
    });
    const safe = data.round.label.replace(/[^\w\-]+/g, '_').slice(0, 40);
    const lv = level.replace(/[^\w\-]+/g, '_');
    downloadCsv(`module-registrations_${safe}_level_${lv}_matrix.csv`, h, lines);
}

function ModuleRegistrationSnapshotFull({ data }: { data: ModuleRegistrationRoundSnapshot }) {
    const levelKeys = Object.keys(data.summary.byLevel).sort();
    const tabLevels = reportLevelTabs(data);

    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm border rounded-xl p-5 bg-muted/20">
                <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Academic year</span>
                    <p className="font-semibold text-base mt-1">{data.academic_year_label}</p>
                </div>
                <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Round status</span>
                    <p className="mt-1">
                        <Badge variant="outline" className="text-sm">
                            {data.round.status}
                        </Badge>
                    </p>
                </div>
                <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Target levels</span>
                    <p className="font-mono text-sm mt-1">{data.round.levels.length === 0 ? 'All' : data.round.levels.join(', ')}</p>
                </div>
                <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Registration window</span>
                    <p className="text-sm mt-1 leading-snug">
                        {data.round.opens_at ? format(new Date(data.round.opens_at), 'PPp') : '—'}
                        <span className="text-muted-foreground"> → </span>
                        {data.round.closes_at ? format(new Date(data.round.closes_at), 'PPp') : '—'}
                    </p>
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Semesters in this year</span>
                    <p className="text-sm mt-1">{data.semesters.map(s => s.label).join(' · ') || 'None configured'}</p>
                </div>
            </div>

            {(data.round.notes || data.round.student_message) && (
                <div className="grid gap-4 md:grid-cols-2">
                    {data.round.notes ? (
                        <Card className="shadow-none border-dashed">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Internal notes</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">{data.round.notes}</CardContent>
                        </Card>
                    ) : null}
                    {data.round.student_message ? (
                        <Card className="shadow-none border-dashed">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Student-facing message</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {data.round.student_message}
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            )}

            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="h-auto flex-wrap gap-1 p-1 justify-start">
                    <TabsTrigger value="summary" className="text-sm px-4 py-2">
                        Summary
                    </TabsTrigger>
                    {tabLevels.map(lv => (
                        <TabsTrigger key={lv} value={levelTabValue(lv)} className="text-sm px-4 py-2 font-mono">
                            {lv}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="summary" className="mt-6 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Registration rows</CardDescription>
                                <CardTitle className="text-3xl tabular-nums">{data.summary.totalRegistrations}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Distinct students</CardDescription>
                                <CardTitle className="text-3xl tabular-nums">{data.summary.uniqueStudents}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardDescription>Modules with at least one registration</CardDescription>
                                <CardTitle className="text-3xl tabular-nums">{data.summary.byModule.length}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                    {data.round.finalized_at && (
                        <p className="text-sm text-muted-foreground">
                            Finalized at {format(new Date(data.round.finalized_at), 'PPp')}
                        </p>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold mb-3">By level</h3>
                        <div className="rounded-xl border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="min-w-[100px]">Level</TableHead>
                                        <TableHead className="text-right min-w-[120px]">Distinct students</TableHead>
                                        <TableHead className="text-right min-w-[140px]">Registration rows</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(data.summary.byLevel)
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([lvl, v]) => (
                                            <TableRow key={lvl}>
                                                <TableCell className="font-mono font-medium">{lvl}</TableCell>
                                                <TableCell className="text-right tabular-nums text-base">{v.students}</TableCell>
                                                <TableCell className="text-right tabular-nums text-base">{v.registrations}</TableCell>
                                            </TableRow>
                                        ))}
                                    {Object.keys(data.summary.byLevel).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-12 text-base">
                                                No registrations yet for this round.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold mb-3">By module</h3>
                        <div className="rounded-xl border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="min-w-[90px]">Code</TableHead>
                                        <TableHead className="min-w-[220px]">Module</TableHead>
                                        <TableHead className="text-right min-w-[80px]">Credits</TableHead>
                                        <TableHead className="text-right min-w-[90px]">Total</TableHead>
                                        {levelKeys.map(lv => (
                                            <TableHead key={lv} className="text-right min-w-[72px] font-mono text-xs">
                                                {lv}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.summary.byModule.map(m => (
                                        <TableRow key={m.module_id}>
                                            <TableCell className="font-mono text-sm font-medium">{m.code}</TableCell>
                                            <TableCell className="text-sm max-w-md">
                                                <span className="line-clamp-2" title={m.name}>
                                                    {m.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{m.credits}</TableCell>
                                            <TableCell className="text-right font-semibold tabular-nums">{m.total}</TableCell>
                                            {levelKeys.map(lv => (
                                                <TableCell key={lv} className="text-right tabular-nums text-sm">
                                                    {m.byLevel[lv] ?? 0}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                {tabLevels.map(lv => {
                    const { modules, students } = buildLevelMatrix(data, lv);
                    const tabValue = levelTabValue(lv);
                    return (
                        <TabsContent key={lv} value={tabValue} className="mt-6 space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                        
                                    <span className="tabular-nums">{students.length}</span> students ·{' '}
                                    <span className="tabular-nums">{modules.length}</span> modules
                                </p>
                                <Button type="button" variant="outline" size="sm" onClick={() => downloadLevelMatrixCsv(data, lv)}>
                                    <FileDown className="h-4 w-4 mr-2" />
                                    CSV ({lv} matrix)
                                </Button>
                            </div>
                            {modules.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-8 text-center border rounded-xl">
                                    No registrations for this level in this snapshot.
                                </p>
                            ) : (
                                <div className="rounded-xl border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                                <TableHead className="sticky left-0 z-10 bg-muted/95 backdrop-blur min-w-[200px] border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                                                    Student
                                                </TableHead>
                                                {modules.map(m => (
                                                    <TableHead
                                                        key={m.module_id}
                                                        className="text-center min-w-[52px] max-w-[100px] align-bottom p-2"
                                                        title={`${m.name} (${m.catalogCredits} cr.)`}
                                                    >
                                                        <span className="font-mono text-xs font-semibold leading-tight block break-all">
                                                            {m.code}
                                                        </span>
                                                    </TableHead>
                                                ))}
                                                <TableHead className="text-right min-w-[88px] whitespace-nowrap bg-muted/40">
                                                    Total cr.
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={modules.length + 2}
                                                        className="text-center text-muted-foreground py-12"
                                                    >
                                                        No students at this level with registrations.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                students.map(s => (
                                                    <TableRow key={s.student_id}>
                                                        <TableCell className="sticky left-0 z-[1] bg-background border-r py-2 align-top shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                                                            <div className="font-medium text-sm">
                                                                {s.firstName} {s.lastName}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground break-all max-w-[200px]">
                                                                {s.email}
                                                            </div>
                                                            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                                                {s.student_id}
                                                            </div>
                                                        </TableCell>
                                                        {s.creditsByModuleIndex.map((c, i) => (
                                                            <TableCell
                                                                key={modules[i]!.module_id}
                                                                className="text-center p-2 align-middle"
                                                                aria-label={
                                                                    c > 0
                                                                        ? `Registered: ${modules[i]!.code}`
                                                                        : `Not registered: ${modules[i]!.code}`
                                                                }
                                                            >
                                                                {c > 0 ? (
                                                                    <Check
                                                                        className="h-4 w-4 mx-auto text-primary"
                                                                        strokeWidth={2.5}
                                                                        aria-hidden
                                                                    />
                                                                ) : null}
                                                            </TableCell>
                                                        ))}
                                                        <TableCell className="text-right font-semibold tabular-nums text-sm bg-muted/20">
                                                            {s.totalCredits}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}

export function ModuleRegistrationReportClient({
    roundId,
    intent,
}: {
    roundId: string;
    intent: 'close' | 'finalize' | null;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [data, setData] = useState<ModuleRegistrationRoundSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [ackClose, setAckClose] = useState(false);
    const [ackFinalize, setAckFinalize] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await getModuleRegistrationRoundSnapshot(roundId);
            if (cancelled) return;
            if (!res.success || !res.data) {
                toast.error('error' in res ? res.error : 'Failed to load report');
                setData(null);
            } else {
                setData(res.data);
            }
            setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [roundId]);

    const status = data?.round.status;
    const intentValid =
        intent === null ||
        (intent === 'close' && status === 'OPEN') ||
        (intent === 'finalize' && status === 'CLOSED');

    const handleClose = () => {
        if (!ackClose) return;
        startTransition(async () => {
            const res = await closeModuleRegistrationRound(roundId);
            if (res.success) {
                toast.success('Round closed');
                router.push('/dashboard/hod/module-registration');
                router.refresh();
            } else toast.error(res.error || 'Failed to close');
        });
    };

    const handleFinalize = () => {
        if (!ackFinalize) return;
        startTransition(async () => {
            const res = await finalizeModuleRegistrationRound(roundId);
            if (res.success) {
                toast.success('Round finalized');
                router.push('/dashboard/hod/module-registration');
                router.refresh();
            } else toast.error(res.error || 'Failed to finalize');
        });
    };

    const title =
        intent === 'close'
            ? 'Close round — review registrations'
            : intent === 'finalize'
              ? 'Finalize module registration round'
              : 'Module registration report';

    return (
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 min-w-0">
                    <Button variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground" asChild>
                        <Link href="/dashboard/hod/module-registration">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to rounds
                        </Link>
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">{title}</h1>
                    {data && (
                        <p className="text-muted-foreground text-base max-w-3xl">
                            <span className="font-medium text-foreground">{data.round.label}</span>
                            {' · '}
                            {data.academic_year_label}
                        </p>
                    )}
                </div>
                {data && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <Button type="button" variant="outline" size="sm" onClick={() => downloadDetailedCsv(data)}>
                            <FileDown className="h-4 w-4 mr-2" />
                            CSV Full Report
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => downloadByModuleCsv(data)}>
                            <FileDown className="h-4 w-4 mr-2" />
                            CSV by module
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => downloadByLevelCsv(data)}>
                            <FileDown className="h-4 w-4 mr-2" />
                            CSV by level
                        </Button>
                    </div>
                )}
            </div>

            {intent && data && !intentValid && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Wrong round state</AlertTitle>
                    <AlertDescription className="text-sm">
                        This page was opened for a specific action, but the round is now <strong>{status}</strong>. Use
                        Back to rounds and try again from the list.
                    </AlertDescription>
                </Alert>
            )}

            {intent === 'finalize' && data && intentValid && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-base">Finalizing is irreversible</AlertTitle>
                    <AlertDescription className="text-sm">
                        After you finalize, students cannot change module picks for this round unless you open a new
                        round. Scroll through every tab before confirming.
                    </AlertDescription>
                </Alert>
            )}

            {intent === 'close' && data && intentValid && (
                <Alert>
                    <AlertTitle className="text-base">Closing stops student edits</AlertTitle>
                    <AlertDescription className="text-sm">
                        Students will no longer be able to change module selections until you re-open this round.
                    </AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
            ) : data ? (
                <>
                    <ModuleRegistrationSnapshotFull data={data} />

                    {intent === 'close' && intentValid && (
                        <Card className="border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="ack-close"
                                        checked={ackClose}
                                        onCheckedChange={v => setAckClose(v === true)}
                                        className="mt-1"
                                    />
                                    <label htmlFor="ack-close" className="text-sm leading-relaxed cursor-pointer">
                                        I have reviewed the full report above and understand that closing this round will
                                        stop students from editing their module selections.
                                    </label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href="/dashboard/hod/module-registration">Cancel</Link>
                                    </Button>
                                    <Button disabled={!ackClose || isPending} onClick={handleClose}>
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Close round
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {intent === 'finalize' && intentValid && (
                        <Card className="border-green-200/80 bg-green-50/30 dark:bg-green-950/20">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="ack-finalize"
                                        checked={ackFinalize}
                                        onCheckedChange={v => setAckFinalize(v === true)}
                                        className="mt-1"
                                    />
                                    <label htmlFor="ack-finalize" className="text-sm leading-relaxed cursor-pointer">
                                        I have reviewed the summary (including by-level and by-module tables), each
                                        level&apos;s student–module matrix, and any CSV exports I need. I am ready to
                                        finalize this round.
                                    </label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href="/dashboard/hod/module-registration">Cancel</Link>
                                    </Button>
                                    <Button
                                        className="bg-green-700 hover:bg-green-800"
                                        disabled={!ackFinalize || isPending}
                                        onClick={handleFinalize}
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Finalize round
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : !loading ? (
                <p className="text-muted-foreground">Could not load this round.</p>
            ) : null}
        </div>
    );
}
