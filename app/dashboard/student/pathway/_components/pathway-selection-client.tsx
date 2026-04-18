'use client';

import { useState, useEffect, useTransition, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    GraduationCap,
    CheckCircle,
    Loader2,
    Info,
    Clock,
    AlertTriangle,
    TrendingUp,
    Sparkles,
    BrainCircuit,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getStudentActiveSelectionRound,
    submitSelectionApplication,
    submitAllocationChangeRequest,
} from '@/lib/actions/selection-actions';
import { getPathwayGuidance } from '@/lib/actions/pathway-actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
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

type DegreePathProgram = { program_id: string; code: string; name: string };

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

export function PathwaySelectionClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasAutoRunTriggered = useRef(false);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [aiAdvice, setAIAdvice] = useState<any>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [viewerId, setViewerId] = useState<string | null>(null);
    const [roundId, setRoundId] = useState<string | null>(null);
    const [roundLabel, setRoundLabel] = useState<string>('');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [, setRankingApps] = useState<any[]>([]);
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

    const fetchPathwayGuidance = useCallback(async () => {
        setLoadingAI(true);
        try {
            const advice = await getPathwayGuidance();
            if (advice.isEligible && advice.hasRequiredPreferences === false) {
                setAIAdvice(null);
                toast.error(advice.message || 'Complete pathway preferences first.');
                const returnTo = encodeURIComponent('/dashboard/student/pathway?autorun=1');
                router.push(`/dashboard/student/pathway-preferences?next=${returnTo}`);
                return;
            }
            if (advice.isEligible) {
                setAIAdvice(advice);
                if (advice.decision_source === 'GROK') {
                    toast.success('Pathway guidance complete (Grok).');
                } else {
                    toast.warning('Guidance completed using fallback logic.');
                }
            } else {
                toast.error(advice.message || 'Unable to run guidance.');
            }
        } catch {
            toast.error('Failed to connect to the pathway counselor.');
        } finally {
            setLoadingAI(false);
        }
    }, [router]);

    useEffect(() => {
        if (loading || aiAdvice || loadingAI || hasAutoRunTriggered.current) return;
        if (searchParams.get('autorun') !== '1') return;
        hasAutoRunTriggered.current = true;
        void fetchPathwayGuidance();
    }, [aiAdvice, fetchPathwayGuidance, loading, loadingAI, searchParams]);

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

    const skillVector = aiAdvice?.skill_vector || {};
    const radarData = aiAdvice
        ? [
              { subject: 'Technical', A: Number(skillVector.Technical ?? 60), fullMark: 100 },
              { subject: 'Strategic', A: Number(skillVector.Strategic ?? 60), fullMark: 100 },
              { subject: 'Operations', A: Number(skillVector.Operations ?? 60), fullMark: 100 },
          ]
        : [
              { subject: 'Technical', A: 60, fullMark: 100 },
              { subject: 'Strategic', A: 60, fullMark: 100 },
              { subject: 'Operations', A: 60, fullMark: 100 },
          ];
    const fitScore = Number(aiAdvice?.fit_score ?? 0);
    const confidence = fitScore >= 75 ? 'High' : fitScore >= 50 ? 'Medium' : 'Emerging';

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 py-2">
            <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1">
                    <Card className="bg-primary/5 border-primary/20 overflow-hidden relative group">
                    <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="h-24 w-24 text-primary" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <BrainCircuit className="h-5 w-5" />
                            Pathway Counselor
                        </CardTitle>
                        <CardDescription>AI-assisted MIT vs IT guidance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="h-[220px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                    <Radar name="Student" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {!aiAdvice && !loadingAI && (
                            <div className="space-y-2">
                                <Button className="w-full" onClick={fetchPathwayGuidance}>
                                    Run Pathway Analysis
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push('/dashboard/student/pathway-preferences')}
                                >
                                    Retake / Update Details
                                </Button>
                            </div>
                        )}
                        {loadingAI && (
                            <Button disabled className="w-full">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Analyzing...
                            </Button>
                        )}

                        {aiAdvice && (
                            <div className="p-4 bg-white/50 rounded-xl space-y-3 border border-primary/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Recommendation</span>
                                    <Badge variant="default" className="bg-primary">{confidence} Confidence</Badge>
                                </div>
                                <h4 className="text-xl font-bold text-primary">{aiAdvice.primary_recommendation} Pathway</h4>
                                <p className="text-xs italic text-muted-foreground">"{aiAdvice.insight}"</p>
                            </div>
                        )}
                    </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <div className="p-4 bg-muted/40 rounded-xl space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="font-bold text-lg">{roundLabel}</h3>
                            <Badge variant="outline">
                                {selectionMode === 'AUTO' ? 'Auto' : selectionMode === 'FREE' ? 'FCFS' : 'GPA-ranked'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {closesSummary ? `Deadline: ${closesSummary.absolute}` : 'Deadline not published.'} GPA used for ranking: {myGpa.toFixed(2)}.
                        </p>
                        {cohort && (
                            <p className="text-xs text-muted-foreground">
                                Current standing: #{cohort.gpaRank}/{cohort.peerCount} ({((1 - cohort.gpaRank / cohort.peerCount) * 100).toFixed(0)}th percentile)
                            </p>
                        )}
                        {!windowOk && <p className="text-sm text-amber-700">{windowMessage || 'Submissions are closed for this period.'}</p>}
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

                    <div className="grid md:grid-cols-2 gap-4">
                        {slots.map((slot) => {
                            const liveFirst = liveFirstChoiceCount(slot.id, slot.firstChoiceCount, savedPref1, pref1);
                            const pct = slot.capacity > 0 ? Math.min(100, Math.round((liveFirst / slot.capacity) * 100)) : 0;
                            return (
                                <Card
                                    key={slot.id}
                                    className={`border-2 ${pref1 === slot.id ? 'border-primary bg-primary/5' : pref2 === slot.id ? 'border-secondary bg-muted/40' : 'border-muted'}`}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{slot.code}</CardTitle>
                                        <CardDescription className="text-[11px] leading-tight">{slot.name}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {slot.description && <p className="text-[11px] text-muted-foreground line-clamp-4">{slot.description}</p>}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>Demand</span>
                                                <span>{liveFirst}/{slot.capacity}</span>
                                            </div>
                                            <Progress value={pct} className={liveFirst > slot.capacity ? '[&>div]:bg-red-500' : pct >= 80 ? '[&>div]:bg-orange-500' : ''} />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button size="sm" variant={pref1 === slot.id ? 'default' : 'outline'} disabled={!windowOk} onClick={() => selectRank(slot.id, 1)}>1st</Button>
                                            {needsSecondChoice && (
                                                <Button size="sm" variant={pref2 === slot.id ? 'secondary' : 'outline'} disabled={!windowOk} onClick={() => selectRank(slot.id, 2)}>
                                                    2nd
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="font-semibold">
                                    First Preference: {pref1 ? slots.find(s => s.id === pref1)?.code : '—'}
                                </Badge>
                                {needsSecondChoice && (
                                    <Badge variant="outline" className="font-semibold">
                                        Second Preference: {pref2 ? slots.find(s => s.id === pref2)?.code : '—'}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" asChild>
                                    <a href="/dashboard/student">Back</a>
                                </Button>
                                <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (existingSubmitted ? 'Save changes' : 'Submit')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
