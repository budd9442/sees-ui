'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Loader2, Plus, Lock, Play, Square, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    createModuleRegistrationRound,
    openModuleRegistrationRound,
    listModuleRegistrationRounds,
} from '@/lib/actions/module-registration-round-actions';

const LEVEL_OPTIONS = ['L1', 'L2', 'L3', 'L4'] as const;

type RoundRow = {
    round_id: string;
    label: string;
    status: string;
    opens_at: Date | null;
    closes_at: Date | null;
    levels: string[];
    notes: string | null;
    student_message: string | null;
    finalized_at: Date | null;
    academic_year: { label: string; active: boolean };
};

type YearRow = { academic_year_id: string; label: string };

export function ModuleRegistrationRoundsClient({
    initialRounds,
    academicYears,
}: {
    initialRounds: RoundRow[];
    academicYears: YearRow[];
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [rounds, setRounds] = useState<RoundRow[]>(initialRounds);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        academic_year_id: academicYears[0]?.academic_year_id ?? '',
        label: '',
        opens_at: '',
        closes_at: '',
        notes: '',
        student_message: '',
        levels: [] as string[],
    });

    const refresh = async () => {
        const res = await listModuleRegistrationRounds();
        if (res.success && res.data) setRounds(res.data as RoundRow[]);
        router.refresh();
    };

    const toggleLevel = (lv: string) => {
        setForm(f => ({
            ...f,
            levels: f.levels.includes(lv) ? f.levels.filter(x => x !== lv) : [...f.levels, lv],
        }));
    };

    const handleCreate = () => {
        if (!form.academic_year_id || !form.label.trim()) {
            toast.error('Choose an academic year and enter a label.');
            return;
        }
        startTransition(async () => {
            const res = await createModuleRegistrationRound({
                academic_year_id: form.academic_year_id,
                label: form.label.trim(),
                levels: form.levels,
                opens_at: form.opens_at ? new Date(form.opens_at) : null,
                closes_at: form.closes_at ? new Date(form.closes_at) : null,
                notes: form.notes || null,
                student_message: form.student_message || null,
            });
            if (res.success) {
                toast.success('Round created.');
                setShowCreate(false);
                setForm({
                    academic_year_id: academicYears[0]?.academic_year_id ?? '',
                    label: '',
                    opens_at: '',
                    closes_at: '',
                    notes: '',
                    student_message: '',
                    levels: [],
                });
                await refresh();
            } else toast.error(res.error || 'Failed');
        });
    };

    const run = (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
        startTransition(async () => {
            const res = await fn();
            if (res.success) {
                toast.success(ok);
                await refresh();
            } else toast.error(res.error || 'Failed');
        });
    };

    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            DRAFT: 'secondary',
            OPEN: 'default',
            CLOSED: 'outline',
            FINALIZED: 'destructive',
        };
        return <Badge variant={map[s] as 'default' | 'secondary' | 'outline' | 'destructive'}>{s}</Badge>;
    };

    const reportHref = (roundId: string, intent?: 'close' | 'finalize') => {
        const base = `/dashboard/hod/module-registration/${roundId}/report`;
        return intent ? `${base}?intent=${intent}` : base;
    };

    return (
        <div className="container max-w-6xl py-8 space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <BookOpen className="h-4 w-4" />
                        HOD
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Module registration rounds</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Create windows, open them for students, review registrations on the full report page before
                        closing or finalizing. Empty level list means all levels.
                    </p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New round
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Rounds</CardTitle>
                    <CardDescription>
                        Students can edit module picks only when a round is OPEN and within dates. Use Preview or View
                        report for full stats, tables, and CSV exports on a dedicated page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Label</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Levels</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Window</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rounds.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                        No rounds yet. Create one to enable student module registration.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rounds.map(r => (
                                    <TableRow key={r.round_id}>
                                        <TableCell className="font-medium">{r.label}</TableCell>
                                        <TableCell className="text-sm">{r.academic_year.label}</TableCell>
                                        <TableCell className="text-xs font-mono">
                                            {r.levels.length === 0 ? 'All' : r.levels.join(', ')}
                                        </TableCell>
                                        <TableCell>{statusBadge(r.status)}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                                            {r.opens_at && format(r.opens_at, 'PPp')}
                                            {r.opens_at && r.closes_at ? ' → ' : ''}
                                            {r.closes_at && format(r.closes_at, 'PPp')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-wrap justify-end gap-1">
                                                {(r.status === 'OPEN' || r.status === 'CLOSED' || r.status === 'FINALIZED') && (
                                                    <Button size="sm" variant="outline" disabled={isPending} asChild>
                                                        <Link href={reportHref(r.round_id)}>
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            {r.status === 'OPEN' ? 'Preview' : 'View report'}
                                                        </Link>
                                                    </Button>
                                                )}
                                                {r.status === 'DRAFT' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={isPending}
                                                        onClick={() =>
                                                            run(() => openModuleRegistrationRound(r.round_id), 'Round opened')
                                                        }
                                                    >
                                                        <Play className="h-3.5 w-3.5 mr-1" />
                                                        Open
                                                    </Button>
                                                )}
                                                {r.status === 'OPEN' && (
                                                    <Button size="sm" variant="outline" disabled={isPending} asChild>
                                                        <Link href={reportHref(r.round_id, 'close')}>
                                                            <Square className="h-3.5 w-3.5 mr-1" />
                                                            Close
                                                        </Link>
                                                    </Button>
                                                )}
                                                {r.status === 'CLOSED' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            disabled={isPending}
                                                            onClick={() =>
                                                                run(
                                                                    () => openModuleRegistrationRound(r.round_id),
                                                                    'Round re-opened'
                                                                )
                                                            }
                                                        >
                                                            <Play className="h-3.5 w-3.5 mr-1" />
                                                            Re-open
                                                        </Button>
                                                        <Button size="sm" className="bg-green-700 hover:bg-green-800" asChild>
                                                            <Link href={reportHref(r.round_id, 'finalize')}>
                                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                                Review and finalize
                                                            </Link>
                                                        </Button>
                                                    </>
                                                )}
                                                {r.status === 'FINALIZED' && (
                                                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1 px-2">
                                                        <Lock className="h-3.5 w-3.5" />
                                                        Locked
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New module registration round</DialogTitle>
                        <DialogDescription>Draft rounds do not allow student changes until you open them.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Academic year</Label>
                            <Select
                                value={form.academic_year_id}
                                onValueChange={v => setForm(f => ({ ...f, academic_year_id: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map(y => (
                                        <SelectItem key={y.academic_year_id} value={y.academic_year_id}>
                                            {y.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Label</Label>
                            <Input
                                value={form.label}
                                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                                placeholder="e.g. 2025/26 S1+S2 registration"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Target levels (none = all)</Label>
                            <div className="flex flex-wrap gap-3">
                                {LEVEL_OPTIONS.map(lv => (
                                    <label key={lv} className="flex items-center gap-2 text-sm">
                                        <Checkbox checked={form.levels.includes(lv)} onCheckedChange={() => toggleLevel(lv)} />
                                        {lv}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Opens</Label>
                                <Input
                                    type="datetime-local"
                                    value={form.opens_at}
                                    onChange={e => setForm(f => ({ ...f, opens_at: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Closes</Label>
                                <Input
                                    type="datetime-local"
                                    value={form.closes_at}
                                    onChange={e => setForm(f => ({ ...f, closes_at: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Internal notes (HOD)</Label>
                            <Textarea
                                value={form.notes}
                                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message to students (optional)</Label>
                            <Textarea
                                value={form.student_message}
                                onChange={e => setForm(f => ({ ...f, student_message: e.target.value }))}
                                placeholder="Shown on the student module page when they cannot edit."
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create draft'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
