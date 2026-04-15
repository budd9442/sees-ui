'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    GraduationCap,
    CheckCircle,
    Loader2,
    Info,
    Clock,
    AlertTriangle,
    TrendingUp,
    ChevronRight,
    ListOrdered,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getStudentActiveSelectionRound,
    submitSelectionApplication,
    submitAllocationChangeRequest,
} from '@/lib/actions/selection-actions';
import { format, formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

type Slot = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    capacity: number;
    firstChoiceCount: number;
    secondChoiceCount: number;
};

type RankingApp = { student_id: string; preference_1: string; gpa_at_time: number };

type DegreePathProgram = { program_id: string; code: string; name: string };

function firstChoiceRankForSlot(
    apps: RankingApp[],
    slotId: string,
    viewerId: string,
    myGpa: number
): { rank: number; total: number } {
    const others = apps.filter(a => a.preference_1 === slotId && a.student_id !== viewerId);
    let better = 0;
    for (const a of others) {
        if (a.gpa_at_time > myGpa) better += 1;
        else if (a.gpa_at_time === myGpa && a.student_id < viewerId) better += 1;
    }
    return { rank: better + 1, total: others.length + 1 };
}

function liveFirstChoiceCount(
    slotId: string,
    baseCount: number,
    savedPref1: string | null,
    draftPref1: string | null
): number {
    let n = baseCount;
    if (draftPref1 === slotId && savedPref1 !== slotId) n += 1;
    if (draftPref1 !== slotId && savedPref1 === slotId) n -= 1;
    return Math.max(0, n);
}

function allocationRuleBullets(mode: string, needsSecond: boolean): string[] {
    if (mode === 'AUTO') {
        const b = [
            'Each pathway: if 1st-choice demand is within the published cap, order is by application time (earlier helps).',
            'If 1st-choice demand exceeds the cap, that pathway fills by GPA (higher first).',
        ];
        if (needsSecond) b.push('If you are not placed on your 1st choice, your 2nd choice is tried with the same rules for remaining seats.');
        return b;
    }
    if (mode === 'GPA') {
        return [
            'Places are decided by GPA across everyone in this round (higher first), subject to caps.',
            ...(needsSecond ? ['Your 2nd choice is used if your 1st is full, in GPA order.'] : []),
        ];
    }
    return [
        'One global queue by application time: earlier submissions get priority for their 1st choice, then 2nd.',
    ];
}

export function PathwaySelectionClient() {
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [viewerId, setViewerId] = useState<string | null>(null);
    const [roundId, setRoundId] = useState<string | null>(null);
    const [roundLabel, setRoundLabel] = useState<string>('');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [rankingApps, setRankingApps] = useState<RankingApp[]>([]);
    const [pref1, setPref1] = useState<string | null>(null);
    const [pref2, setPref2] = useState<string | null>(null);
    const [savedPref1, setSavedPref1] = useState<string | null>(null);
    const [savedPref2, setSavedPref2] = useState<string | null>(null);
    const [opensAt, setOpensAt] = useState<Date | null>(null);
    const [closesAt, setClosesAt] = useState<Date | null>(null);
    const [windowOk, setWindowOk] = useState(true);
    const [windowMessage, setWindowMessage] = useState<string | undefined>();
    const [selectionMode, setSelectionMode] = useState<string>('GPA');
    const [existingSubmitted, setExistingSubmitted] = useState(false);
    const [appStatus, setAppStatus] = useState<string | null>(null);
    const [waitlistPos, setWaitlistPos] = useState<number | null>(null);
    const [allocatedTo, setAllocatedTo] = useState<string | null>(null);
    const [frozenGpa, setFrozenGpa] = useState<number | null>(null);
    const [cohort, setCohort] = useState<{ gpaRank: number; peerCount: number; gpa: number } | null>(null);
    const [phase, setPhase] = useState<'OPEN' | 'POST_APPROVAL'>('OPEN');
    const [graceEndsAt, setGraceEndsAt] = useState<Date | null>(null);
    const [approvedAt, setApprovedAt] = useState<Date | null>(null);
    const [canRequestChange, setCanRequestChange] = useState(false);
    const [pendingChangeRequest, setPendingChangeRequest] = useState<{ request_id: string } | null>(null);
    const [changeRequestLockReason, setChangeRequestLockReason] = useState<string | null>(null);
    const [reqPref1, setReqPref1] = useState<string | null>(null);
    const [reqPref2, setReqPref2] = useState<string | null>(null);
    const [changeReason, setChangeReason] = useState('');
    const [degreePathProgram, setDegreePathProgram] = useState<DegreePathProgram | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await getStudentActiveSelectionRound('PATHWAY');
                if (cancelled) return;
                if (!res.success || !res.data?.round) {
                    setRoundId(null);
                    setSlots([]);
                    setPhase('OPEN');
                    setDegreePathProgram(null);
                    setChangeRequestLockReason(null);
                    return;
                }
                const {
                    phase: ph,
                    viewerId: vid,
                    round,
                    existingApp,
                    degreePathProgram: dpp,
                    windowOk: wOk,
                    windowMessage: wMsg,
                    pathwayStats,
                    pathwayRankingApps,
                    cohort: cohortData,
                    graceEndsAt: gEnd,
                    canRequestChange: canReq,
                    pendingChangeRequest: pendingReq,
                    changeRequestLockReason: lockReason,
                } = res.data;
                const roundPhase = ph ?? 'OPEN';
                setDegreePathProgram(dpp ?? null);
                setPhase(roundPhase);
                setGraceEndsAt(gEnd ? new Date(gEnd) : null);
                setApprovedAt(round.approved_at ? new Date(round.approved_at) : null);
                setCanRequestChange(!!canReq);
                setPendingChangeRequest(pendingReq ?? null);
                setChangeRequestLockReason(
                    typeof lockReason === 'string' && lockReason.length > 0 ? lockReason : null
                );
                setViewerId(vid ?? null);
                setRoundId(round.round_id);
                setRoundLabel(round.label || 'Pathway selection');
                setSelectionMode(round.selection_mode);
                setOpensAt(round.opens_at ? new Date(round.opens_at) : null);
                setClosesAt(round.closes_at ? new Date(round.closes_at) : null);
                setWindowOk(roundPhase === 'OPEN' ? wOk !== false : false);
                setWindowMessage(wMsg);
                setRankingApps(pathwayRankingApps ?? []);
                setCohort(cohortData ?? null);

                const list: Slot[] = (round.configs || [])
                    .map((c: any) => {
                            const p = c.program;
                            if (!p) return null;
                            const st = pathwayStats?.[p.program_id];
                            return {
                                id: p.program_id,
                                code: p.code,
                                name: p.name,
                                description: p.description ?? null,
                                capacity: st?.capacity ?? c.capacity ?? 0,
                                firstChoiceCount: st?.firstChoiceCount ?? 0,
                                secondChoiceCount: st?.secondChoiceCount ?? 0,
                            };
                    })
                    .filter(Boolean) as Slot[];

                setSlots(list);

                if (existingApp) {
                    setPref1(existingApp.preference_1);
                    setPref2(existingApp.preference_2 || null);
                    setSavedPref1(existingApp.preference_1);
                    setSavedPref2(existingApp.preference_2 || null);
                    setExistingSubmitted(true);
                    setAppStatus(existingApp.status ?? null);
                    setWaitlistPos(existingApp.waitlist_pos ?? null);
                    setAllocatedTo(existingApp.allocated_to ?? null);
                    setFrozenGpa(typeof existingApp.gpa_at_time === 'number' ? existingApp.gpa_at_time : null);
                } else {
                    setPref1(null);
                    setPref2(null);
                    setSavedPref1(null);
                    setSavedPref2(null);
                    setExistingSubmitted(false);
                    setAppStatus(null);
                    setWaitlistPos(null);
                    setAllocatedTo(null);
                    setFrozenGpa(null);
                }
                if (roundPhase === 'POST_APPROVAL' && existingApp) {
                    setReqPref1(existingApp.preference_1);
                    setReqPref2(existingApp.preference_2 || null);
                    setChangeReason('');
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load pathway selection.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const needsSecondChoice = slots.length > 2;
    const myGpa = frozenGpa ?? cohort?.gpa ?? 0;
    const gpaSourceLabel = frozenGpa != null ? 'Locked at last save' : 'From your transcript (not saved yet)';

    const anyOversubscribed = useMemo(() => {
        return slots.some(s => {
            const live = liveFirstChoiceCount(s.id, s.firstChoiceCount, savedPref1, pref1);
            return live > s.capacity;
        });
    }, [slots, savedPref1, pref1]);

    const rowMetrics = useMemo(() => {
        return slots.map(slot => {
            const liveFirst = liveFirstChoiceCount(slot.id, slot.firstChoiceCount, savedPref1, pref1);
            const seatsLeft = Math.max(0, slot.capacity - liveFirst);
            const overBy = Math.max(0, liveFirst - slot.capacity);
            const pct = slot.capacity > 0 ? Math.min(100, Math.round((liveFirst / slot.capacity) * 100)) : 0;
            const rank =
                viewerId != null
                    ? firstChoiceRankForSlot(rankingApps, slot.id, viewerId, myGpa)
                    : { rank: 0, total: 0 };
            return { slot, liveFirst, seatsLeft, overBy, pct, oversubscribed: liveFirst > slot.capacity, rank };
        });
    }, [slots, savedPref1, pref1, rankingApps, viewerId, myGpa]);

    const closesSummary = useMemo(() => {
        if (!closesAt) return null;
        const now = new Date();
        if (closesAt > now) {
            return {
                absolute: format(closesAt, 'PPp'),
                relative: formatDistanceToNow(closesAt, { addSuffix: true }),
                urgent: closesAt.getTime() - now.getTime() < 48 * 60 * 60 * 1000,
            };
        }
        return { absolute: format(closesAt, 'PPp'), relative: 'Closed', urgent: true };
    }, [closesAt]);

    const selectRank = (slotId: string, rank: 1 | 2) => {
        if (!windowOk) {
            toast.error(windowMessage || 'Selection is not available right now.');
            return;
        }
        if (rank === 1) {
            if (slotId === pref2) setPref2(null);
            setPref1(slotId);
        } else {
            if (slotId === pref1) {
                toast.error('First and second choice must be different.');
                return;
            }
            setPref2(slotId);
        }
    };

    const handleSubmit = () => {
        if (!roundId || !pref1) {
            toast.error('Choose a first preference.');
            return;
        }
        if (needsSecondChoice && !pref2) {
            toast.error('Choose a second preference.');
            return;
        }
        startTransition(async () => {
            const res = await submitSelectionApplication({
                round_id: roundId,
                preference_1: pref1,
                preference_2: needsSecondChoice ? pref2! : undefined,
            });
            if (res.success) {
                toast.success(existingSubmitted ? 'Preferences updated.' : 'Preferences submitted.');
                setExistingSubmitted(true);
                setSavedPref1(pref1);
                setSavedPref2(needsSecondChoice ? pref2 : null);
                if (res.data) {
                    const app = res.data as {
                        status?: string;
                        waitlist_pos?: number | null;
                        allocated_to?: string | null;
                        gpa_at_time?: number;
                    };
                    setAppStatus(app.status ?? 'PENDING');
                    setWaitlistPos(app.waitlist_pos ?? null);
                    setAllocatedTo(app.allocated_to ?? null);
                    if (typeof app.gpa_at_time === 'number') setFrozenGpa(app.gpa_at_time);
                }
                const refresh = await getStudentActiveSelectionRound('PATHWAY');
                if (refresh.success && refresh.data?.pathwayStats) {
                    const { pathwayStats: ps, pathwayRankingApps: pra } = refresh.data;
                    setRankingApps(pra ?? []);
                    setSlots(prev =>
                        prev.map(s => ({
                            ...s,
                            firstChoiceCount: ps[s.id]?.firstChoiceCount ?? s.firstChoiceCount,
                            secondChoiceCount: ps[s.id]?.secondChoiceCount ?? s.secondChoiceCount,
                            capacity: ps[s.id]?.capacity ?? s.capacity,
                        }))
                    );
                }
            } else {
                toast.error(res.error || 'Submit failed');
            }
        });
    };

    const canSubmit =
        windowOk &&
        !!pref1 &&
        (!needsSecondChoice || !!pref2) &&
        (!existingSubmitted || pref1 !== savedPref1 || (needsSecondChoice ? pref2 !== savedPref2 : false));

    const handleSubmitChangeRequest = () => {
        if (!roundId || !reqPref1) {
            toast.error('Choose your requested pathway preferences.');
            return;
        }
        if (needsSecondChoice && !reqPref2) {
            toast.error('Choose a second preference.');
            return;
        }
        startTransition(async () => {
            const res = await submitAllocationChangeRequest({
                round_id: roundId,
                requested_preference_1: reqPref1,
                requested_preference_2: needsSecondChoice ? reqPref2! : undefined,
                reason: changeReason.trim() || undefined,
            });
            if (res.success) {
                toast.success('Change request submitted. Your HOD will review it.');
                window.location.reload();
            } else {
                toast.error(res.error || 'Request failed');
            }
        });
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!roundId || slots.length === 0) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-3">
                <Info className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                <h2 className="text-lg font-semibold">No pathway selection for your level</h2>
                <p className="text-sm text-muted-foreground">
                    There is no open round and no completed round on file. If this looks wrong, contact your HOD.
                </p>
            </div>
        );
    }

    if (phase === 'POST_APPROVAL') {
        const graceSummary =
            graceEndsAt && approvedAt
                ? {
                      ends: format(graceEndsAt, 'PPp'),
                      relative:
                          new Date() <= graceEndsAt
                              ? formatDistanceToNow(graceEndsAt, { addSuffix: true })
                              : 'Ended',
                  }
                : null;

        return (
            <div className="w-full max-w-3xl mx-auto space-y-6 py-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Pathway allocation (completed round)
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{roundLabel}</h1>
                    {approvedAt && (
                        <p className="text-sm text-muted-foreground">
                            Round approved {format(approvedAt, 'PPp')}
                        </p>
                    )}
                </div>

                {appStatus === 'ALLOCATED' && (
                    <Alert className="border-green-300 bg-green-50/80">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm">
                            <strong>Your pathway (degree program)</strong> —{' '}
                            {degreePathProgram ? (
                                <>
                                    <span className="font-medium">{degreePathProgram.name}</span>{' '}
                                    <span className="font-mono text-xs text-muted-foreground">
                                        ({degreePathProgram.code})
                                    </span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">Record updating — refresh shortly or contact your HOD.</span>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {appStatus === 'WAITLISTED' && (
                    <Alert className="border-amber-300 bg-amber-50/80">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-sm">
                            <strong>Waitlisted</strong>
                            {waitlistPos != null ? (
                                <> — position #{waitlistPos} on your 1st-choice pathway.</>
                            ) : (
                                <> — see your HOD for final placement.</>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {graceSummary && (
                    <Card className="shadow-none border">
                        <CardHeader className="py-3 pb-2">
                            <CardTitle className="text-base">Allocation change window</CardTitle>
                            <CardDescription>
                                {new Date() <= (graceEndsAt ?? new Date(0)) ? (
                                    <>Requests close {graceSummary.relative} ({graceSummary.ends}).</>
                                ) : (
                                    <>The post-approval change window has ended.</>
                                )}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {pendingChangeRequest && (
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                            You have a <strong>pending</strong> allocation change request. Your HOD will review it.
                        </AlertDescription>
                    </Alert>
                )}

                {changeRequestLockReason && !pendingChangeRequest && (
                    <Alert className="border-muted-foreground/30 bg-muted/30">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">{changeRequestLockReason}</AlertDescription>
                    </Alert>
                )}

                {canRequestChange && !pendingChangeRequest && (
                    <Card className="border-primary/30">
                        <CardHeader>
                            <CardTitle className="text-base">Request a change</CardTitle>
                            <CardDescription>
                                You may submit <strong>one</strong> allocation change request during this window. Your HOD
                                must approve it before your degree program updates; after a decision you cannot submit
                                another request for this round.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {slots.map(slot => (
                                    <div key={slot.id} className="flex gap-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={reqPref1 === slot.id ? 'default' : 'outline'}
                                            onClick={() => {
                                                if (slot.id === reqPref2) setReqPref2(null);
                                                setReqPref1(slot.id);
                                            }}
                                        >
                                            1st: {slot.code}
                                        </Button>
                                        {needsSecondChoice && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={reqPref2 === slot.id ? 'secondary' : 'outline'}
                                                onClick={() => {
                                                    if (slot.id === reqPref1) {
                                                        toast.error('Choices must differ.');
                                                        return;
                                                    }
                                                    setReqPref2(slot.id);
                                                }}
                                            >
                                                2nd: {slot.code}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-sm font-medium">Reason (optional)</label>
                                <Textarea
                                    className="mt-1.5"
                                    rows={3}
                                    value={changeReason}
                                    onChange={e => setChangeReason(e.target.value)}
                                    placeholder="Briefly explain why you are requesting a change"
                                />
                            </div>
                            <Button onClick={handleSubmitChangeRequest} disabled={isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Submit request
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Button variant="outline" asChild>
                    <a href="/dashboard/student">Back to dashboard</a>
                </Button>
            </div>
        );
    }

    const ruleBullets = allocationRuleBullets(selectionMode, needsSecondChoice);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 py-2">
            {/* Title + status */}
            <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Pathway selection
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-balance">{roundLabel}</h1>
                    <p className="text-sm text-muted-foreground">
                        {slots.length} pathway{slots.length === 1 ? '' : 's'}
                        {needsSecondChoice ? ' · pick 1st and 2nd choice' : ' · pick 1st choice only'}
                        {existingSubmitted ? ' · draft saved (edit until deadline)' : ' · not submitted yet'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Badge variant={windowOk ? 'default' : 'secondary'} className="text-xs">
                        {windowOk ? 'Window open' : 'Window closed'}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono">
                        {selectionMode === 'AUTO' && 'AUTO'}
                        {selectionMode === 'GPA' && 'GPA'}
                        {selectionMode === 'FREE' && 'FCFS'}
                    </Badge>
                </div>
            </div>

            {/* Fact grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-none border bg-card/80">
                    <CardHeader className="py-3 pb-2 space-y-0">
                        <CardDescription className="text-[11px] uppercase tracking-wide font-medium">Deadline</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3">
                        {closesSummary ? (
                            <>
                                <p className="text-lg font-semibold tabular-nums leading-tight">{closesSummary.relative}</p>
                                <p className="text-xs text-muted-foreground mt-1">{closesSummary.absolute}</p>
                                {closesSummary.urgent && windowOk && (
                                    <p className="text-[11px] text-amber-700 mt-1.5">Submit before this time.</p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No closing date set</p>
                        )}
                        {opensAt && (
                            <p className="text-[11px] text-muted-foreground mt-2 border-t pt-2">
                                Opened {format(opensAt, 'PPp')}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-none border bg-card/80">
                    <CardHeader className="py-3 pb-2 space-y-0">
                        <CardDescription className="text-[11px] uppercase tracking-wide font-medium">GPA used for ranking</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3">
                        <p className="text-2xl font-bold tabular-nums">{myGpa.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{gpaSourceLabel}</p>
                    </CardContent>
                </Card>

                {cohort && (
                    <Card className="shadow-none border bg-card/80">
                        <CardHeader className="py-3 pb-2 space-y-0">
                            <CardDescription className="text-[11px] uppercase tracking-wide font-medium">
                                Standing in your year
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                            <p className="text-lg font-semibold">
                                <span className="tabular-nums">#{cohort.gpaRank}</span>
                                <span className="text-muted-foreground font-normal"> / {cohort.peerCount}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                By current GPA among students at your level
                                {cohort.peerCount > 0 && (
                                    <>
                                        {' '}
                                        (~
                                        {((1 - cohort.gpaRank / cohort.peerCount) * 100).toFixed(0)}% percentile)
                                    </>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-none border bg-card/80 sm:col-span-2 lg:col-span-1">
                    <CardHeader className="py-3 pb-2 space-y-0">
                        <CardDescription className="text-[11px] uppercase tracking-wide font-medium">Your picks (draft)</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3 space-y-1.5 text-sm">
                        <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground shrink-0">1st</span>
                            <span className="font-medium text-right truncate">
                                {pref1 ? slots.find(s => s.id === pref1)?.code : '—'}
                            </span>
                        </div>
                        {needsSecondChoice && (
                            <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground shrink-0">2nd</span>
                                <span className="font-medium text-right truncate">
                                    {pref2 ? slots.find(s => s.id === pref2)?.code : '—'}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {appStatus && appStatus !== 'PENDING' && (
                <Alert
                    className={
                        appStatus === 'WAITLISTED'
                            ? 'border-amber-300 bg-amber-50/80'
                            : appStatus === 'ALLOCATED'
                              ? 'border-green-300 bg-green-50/80'
                              : ''
                    }
                >
                    {appStatus === 'WAITLISTED' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    {appStatus === 'ALLOCATED' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    <AlertDescription className="text-sm">
                        {appStatus === 'WAITLISTED' && (
                            <>
                                <strong>Waitlisted</strong>
                                {waitlistPos != null ? (
                                    <> — position #{waitlistPos} on your 1st-choice pathway.</>
                                ) : (
                                    <> — run after the HOD allocates; refresh this page later.</>
                                )}
                            </>
                        )}
                        {appStatus === 'ALLOCATED' && allocatedTo && (
                            <>
                                <strong>Allocated</strong> —{' '}
                                <span className="font-medium">{slots.find(s => s.id === allocatedTo)?.name}</span>{' '}
                                <span className="font-mono text-xs text-muted-foreground">
                                    ({slots.find(s => s.id === allocatedTo)?.code})
                                </span>
                            </>
                        )}
                        {appStatus === 'REJECTED' && (
                            <>
                                <strong>Rejected.</strong> Contact your HOD.
                            </>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {!windowOk && (
                <Alert variant="destructive" className="bg-amber-50 text-amber-950 border-amber-200 [&>svg]:text-amber-700">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>{windowMessage || 'You cannot change choices now.'}</AlertDescription>
                </Alert>
            )}

            {anyOversubscribed && cohort && (
                <div className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50/70 px-3 py-2.5 text-sm text-orange-950">
                    <TrendingUp className="h-4 w-4 shrink-0 mt-0.5 text-orange-600" />
                    <p>
                        <strong>Demand above cap</strong> on at least one pathway. Expect GPA to decide who gets a seat there.
                        Your year rank is <strong className="tabular-nums">#{cohort.gpaRank}</strong> of{' '}
                        <strong className="tabular-nums">{cohort.peerCount}</strong>.
                    </p>
                </div>
            )}

            <details className="group rounded-lg border bg-muted/20 px-4 py-3 text-sm">
                <summary className="cursor-pointer list-none font-medium flex items-center gap-2 [&::-webkit-details-marker]:hidden">
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90 text-muted-foreground" />
                    How seats are allocated ({selectionMode === 'AUTO' ? 'Auto' : selectionMode === 'GPA' ? 'GPA' : 'First-come'}{' '}
                    mode)
                </summary>
                <ul className="mt-3 ml-6 space-y-2 text-muted-foreground list-disc text-[13px] leading-relaxed">
                    {ruleBullets.map((line, i) => (
                        <li key={i}>{line}</li>
                    ))}
                </ul>
            </details>

            {/* Comparison table */}
            <Card className="min-w-0 shadow-none">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <ListOrdered className="h-4 w-4" />
                        Pathways at a glance
                    </CardTitle>
                    <CardDescription>
                        Live 1st-choice demand vs cap. &ldquo;You if 1st&rdquo; is your GPA order among everyone who put that pathway
                        first (including you if you save that pick).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-0 sm:px-6">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] font-semibold">Code</TableHead>
                                <TableHead className="min-w-[140px] font-semibold">Pathway</TableHead>
                                <TableHead className="text-right font-semibold whitespace-nowrap">1st / cap</TableHead>
                                <TableHead className="text-right font-semibold whitespace-nowrap hidden md:table-cell">
                                    Seats left
                                </TableHead>
                                <TableHead className="text-center font-semibold whitespace-nowrap">Load</TableHead>
                                <TableHead className="text-right font-semibold whitespace-nowrap">
                                    You if 1st
                                </TableHead>
                                <TableHead className="text-right font-semibold">Pick</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rowMetrics.map(({ slot, liveFirst, seatsLeft, overBy, pct, oversubscribed, rank }) => (
                                <TableRow key={slot.id} className={pref1 === slot.id ? 'bg-primary/5' : undefined}>
                                    <TableCell className="font-mono text-xs font-medium">{slot.code}</TableCell>
                                    <TableCell className="font-medium text-sm max-w-[220px]">
                                        <span className="line-clamp-2">{slot.name}</span>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums text-sm">
                                        {liveFirst} / {slot.capacity}
                                        {overBy > 0 && (
                                            <span className="block text-[11px] text-red-600 font-normal">+{overBy} over</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums text-sm hidden md:table-cell">
                                        {oversubscribed ? '—' : seatsLeft}
                                    </TableCell>
                                    <TableCell className="w-[120px]">
                                        <div className="flex flex-col gap-1">
                                            <Progress
                                                value={pct}
                                                className={
                                                    oversubscribed
                                                        ? 'h-2 [&>div]:bg-red-500'
                                                        : pct >= 80
                                                          ? 'h-2 [&>div]:bg-orange-500'
                                                          : 'h-2'
                                                }
                                            />
                                            <span className="text-[10px] text-muted-foreground text-center tabular-nums">
                                                {pct}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums text-sm">
                                        {viewerId ? (
                                            <>
                                                #{rank.rank}/{rank.total}
                                            </>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-wrap justify-end gap-1">
                                            <Button
                                                size="sm"
                                                variant={pref1 === slot.id ? 'default' : 'outline'}
                                                className="h-8 px-2 text-xs"
                                                disabled={!windowOk}
                                                onClick={() => selectRank(slot.id, 1)}
                                            >
                                                1st
                                            </Button>
                                            {needsSecondChoice && (
                                                <Button
                                                    size="sm"
                                                    variant={pref2 === slot.id ? 'secondary' : 'outline'}
                                                    className="h-8 px-2 text-xs"
                                                    disabled={!windowOk}
                                                    onClick={() => selectRank(slot.id, 2)}
                                                >
                                                    2nd
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </CardContent>
            </Card>

            {/* Per-pathway detail (description only) */}
            {slots.some(s => s.description?.trim()) && (
                <div className="grid gap-3 sm:grid-cols-2">
                    {slots
                        .filter(slot => slot.description?.trim())
                        .map(slot => (
                            <details key={`d-${slot.id}`} className="rounded-lg border bg-card px-3 py-2 text-sm group">
                                <summary className="cursor-pointer font-medium flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
                                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-open:rotate-90 transition-transform" />
                                    <span className="font-mono text-xs text-muted-foreground">{slot.code}</span>
                                    <span className="truncate">Programme description</span>
                                </summary>
                                <p className="mt-2 pl-6 text-muted-foreground text-[13px] leading-relaxed">{slot.description}</p>
                            </details>
                        ))}
                </div>
            )}

            <Card className="shadow-md border-primary/20">
                <CardFooter className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm space-y-1 min-w-0">
                        <p className="font-medium">Ready to save?</p>
                        <p className="text-muted-foreground text-xs">
                            {needsSecondChoice
                                ? `1st: ${pref1 ? slots.find(s => s.id === pref1)?.code : '—'} · 2nd: ${pref2 ? slots.find(s => s.id === pref2)?.code : '—'}`
                                : `1st: ${pref1 ? slots.find(s => s.id === pref1)?.code : '—'}`}
                            {!windowOk && ' · window closed — changes disabled'}
                        </p>
                    </div>
                    <div className="flex w-full sm:w-auto gap-2 shrink-0">
                        <Button variant="outline" asChild className="flex-1 sm:flex-none">
                            <a href="/dashboard/student">Back</a>
                        </Button>
                        <Button onClick={handleSubmit} disabled={!canSubmit || isPending} className="flex-1 sm:flex-none">
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {existingSubmitted ? 'Save changes' : 'Submit'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
