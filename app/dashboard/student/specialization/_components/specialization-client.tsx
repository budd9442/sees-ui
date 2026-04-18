'use client';

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Sparkles, 
    BrainCircuit, 
    CheckCircle, 
    Target, 
    TrendingUp, 
    Briefcase, 
    Network, 
    Factory, 
    LayoutDashboard, 
    Loader2, 
    Star, 
    ShieldCheck,
    Clock,
    Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    Radar, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    ResponsiveContainer,
    Tooltip 
} from 'recharts';
import { getSpecializationGuidance, submitSpecializationSelection } from '@/lib/actions/specialization-actions';
import {
    getStudentActiveSelectionRound,
    submitSelectionApplication,
    submitAllocationChangeRequest,
} from '@/lib/actions/selection-actions';
import { format, formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter, useSearchParams } from 'next/navigation';

interface SpecializationClientProps {
    initialData: {
        currentSpecialization: any;
        availableSpecializations: any[];
        degreeCode: string;
        isMIT: boolean;
    }
}

export function SpecializationClient({ initialData }: SpecializationClientProps) {
    const { currentSpecialization, availableSpecializations, isMIT } = initialData;
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasAutoRunTriggered = useRef(false);
    const [isPending, startTransition] = useTransition();
    const [loadingAI, setLoadingAI] = useState(false);
    const [aiAdvice, setAIAdvice] = useState<any>(null);
    const [selectedSpec, setSelectedSpec] = useState<string | null>(currentSpecialization?.code || null);

    type RoundFlowState = {
        phase: 'OPEN' | 'POST_APPROVAL';
        roundId: string;
        slots: { id: string; code: string; name: string; description: string | null }[];
        windowOk: boolean;
        windowMessage?: string;
        mode: string;
        pref1: string | null;
        pref2: string | null;
        graceEndsAt?: Date | null;
        approvedAt?: Date | null;
        canRequestChange?: boolean;
        pendingChangeRequest?: boolean;
        changeRequestLockReason?: string | null;
        appStatus?: string | null;
        allocatedTo?: string | null;
    };
    const [roundChecked, setRoundChecked] = useState(!isMIT);
    const [activeRound, setActiveRound] = useState<RoundFlowState | null>(null);

    useEffect(() => {
        if (!isMIT) return;
        let cancel = false;
        (async () => {
            try {
                const res = await getStudentActiveSelectionRound('SPECIALIZATION');
                if (cancel) return;
                if (!res.success || !res.data?.round) {
                    setActiveRound(null);
                    return;
                }
                const {
                    phase: ph,
                    round,
                    existingApp,
                    windowOk,
                    windowMessage,
                    graceEndsAt: gEnd,
                    canRequestChange: canReq,
                    pendingChangeRequest: pendReq,
                    changeRequestLockReason: lockReason,
                } = res.data;
                const slots = (round.configs || []).map((c: any) => {
                    const s = c.specialization;
                    if (!s) return null;
                    return {
                        id: s.specialization_id,
                        code: s.code,
                        name: s.name,
                        description: s.description ?? null,
                    };
                }).filter(Boolean) as RoundFlowState['slots'];

                setActiveRound({
                    phase: ph ?? 'OPEN',
                    roundId: round.round_id,
                    slots,
                    windowOk: (ph ?? 'OPEN') === 'OPEN' ? windowOk !== false : false,
                    windowMessage,
                    mode: round.selection_mode,
                    pref1: existingApp?.preference_1 ?? null,
                    pref2: existingApp?.preference_2 ?? null,
                    graceEndsAt: gEnd ? new Date(gEnd) : null,
                    approvedAt: round.approved_at ? new Date(round.approved_at) : null,
                    canRequestChange: !!canReq,
                    pendingChangeRequest: !!pendReq,
                    changeRequestLockReason:
                        typeof lockReason === 'string' && lockReason.length > 0 ? lockReason : null,
                    appStatus: existingApp?.status ?? null,
                    allocatedTo: existingApp?.allocated_to ?? null,
                });
            } catch {
                setActiveRound(null);
            } finally {
                if (!cancel) setRoundChecked(true);
            }
        })();
        return () => { cancel = true; };
    }, [isMIT]);

    const fetchGuideAdvise = useCallback(async () => {
        setLoadingAI(true);
        try {
            const advice = await getSpecializationGuidance();
            if (advice.isEligible && advice.hasRequiredPreferences === false) {
                setAIAdvice(null);
                toast.error(advice.message || "Please complete specialization preferences first.");
                const returnTo = encodeURIComponent('/dashboard/student/specialization?autorun=1');
                router.push(`/dashboard/student/specialization-preferences?next=${returnTo}`);
            } else if (advice.isEligible) {
                setAIAdvice(advice);
                if (advice.decision_source === 'GROK') {
                    toast.success("Specialization Guide analysis complete (Grok).");
                } else {
                    toast.warning("Analysis completed using fallback logic.");
                }
            } else {
                toast.error(advice.message);
            }
        } catch (err) {
            toast.error("Failed to connect to the Specialization Guide.");
        } finally {
            setLoadingAI(false);
        }
    }, [router]);

    useEffect(() => {
        if (!isMIT || aiAdvice || loadingAI || hasAutoRunTriggered.current) return;
        if (searchParams.get('autorun') !== '1') return;
        hasAutoRunTriggered.current = true;
        void fetchGuideAdvise();
    }, [aiAdvice, fetchGuideAdvise, isMIT, loadingAI, searchParams]);

    const handleConfirmSelection = async () => {
        if (!selectedSpec) return;
        
        startTransition(async () => {
            try {
                const res = await submitSpecializationSelection(selectedSpec);
                if (res.success) {
                    toast.success(`Specialization locked: ${selectedSpec}`);
                    window.location.reload();
                }
            } catch (err: any) {
                toast.error(err.message);
            }
        });
    };

    // Skills data for Radar Chart
    const skillVector = aiAdvice?.skill_vector || {};
    const radarData = aiAdvice ? [
        { subject: 'Technical', A: Number(skillVector.Technical ?? 60), fullMark: 100 },
        { subject: 'Strategic', A: Number(skillVector.Strategic ?? 60), fullMark: 100 },
        { subject: 'Operations', A: Number(skillVector.Operations ?? 60), fullMark: 100 },
        { subject: 'Analytics', A: 90, fullMark: 100 }
    ] : [
        { subject: 'Technical', A: 60, fullMark: 100 },
        { subject: 'Strategic', A: 60, fullMark: 100 },
        { subject: 'Operations', A: 60, fullMark: 100 },
        { subject: 'Process', A: 60, fullMark: 100 },
        { subject: 'Analytics', A: 60, fullMark: 100 }
    ];

    const [rp1, setRp1] = useState<string | null>(null);
    const [rp2, setRp2] = useState<string | null>(null);
    const [chg1, setChg1] = useState<string | null>(null);
    const [chg2, setChg2] = useState<string | null>(null);
    const [chgReason, setChgReason] = useState('');
    const fitScore = Number(aiAdvice?.fit_score ?? 0);
    const confidence = fitScore >= 75 ? 'High' : fitScore >= 50 ? 'Medium' : 'Emerging';

    useEffect(() => {
        if (!activeRound) return;
        setRp1(activeRound.pref1);
        setRp2(activeRound.pref2);
        if (activeRound.phase === 'POST_APPROVAL') {
            setChg1(activeRound.pref1);
            setChg2(activeRound.pref2);
            setChgReason('');
        }
    }, [activeRound]);

    const pickRoundSpec = (specId: string, rank: 1 | 2) => {
        if (activeRound?.phase !== 'OPEN') return;
        if (!activeRound?.windowOk) {
            toast.error(activeRound?.windowMessage || 'Selection is not open.');
            return;
        }
        if (rank === 1) {
            if (specId === rp2) setRp2(null);
            setRp1(specId);
        } else {
            if (specId === rp1) {
                toast.error('Choices must be different.');
                return;
            }
            setRp2(specId);
        }
    };

    const handleRoundSubmit = () => {
        if (!activeRound || activeRound.phase !== 'OPEN' || !rp1) {
            toast.error('Select a primary specialization.');
            return;
        }
        startTransition(async () => {
            const res = await submitSelectionApplication({
                round_id: activeRound.roundId,
                preference_1: rp1,
                preference_2: rp2 || undefined,
            });
            if (res.success) {
                toast.success('Application saved.');
            } else {
                toast.error(res.error || 'Submit failed');
            }
        });
    };

    const handleSpecChangeRequest = () => {
        if (!activeRound || activeRound.phase !== 'POST_APPROVAL' || !chg1) {
            toast.error('Select your requested preferences.');
            return;
        }
        startTransition(async () => {
            const res = await submitAllocationChangeRequest({
                round_id: activeRound.roundId,
                requested_preference_1: chg1,
                requested_preference_2: chg2 || undefined,
                reason: chgReason.trim() || undefined,
            });
            if (res.success) {
                toast.success('Change request submitted.');
                window.location.reload();
            } else {
                toast.error(res.error || 'Request failed');
            }
        });
    };

    if (!isMIT) {
        return (
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        IT Generalist Pathway
                    </CardTitle>
                    <CardDescription>
                        The B.Sc. IT pathway is a structured technical program without separate specialization tracks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-blue-800">
                    Your curriculum focuses on a broad range of technical modules including Software Engineering, Networking, and Technical Management. No further selection is required for your Level 3 and Level 4 modules.
                </CardContent>
            </Card>
        );
    }

    if (!roundChecked) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: AI Advisor & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-primary/5 border-primary/20 overflow-hidden relative group">
                        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="h-24 w-24 text-primary" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <BrainCircuit className="h-5 w-5" />
                                Specialization Guide
                            </CardTitle>
                            <CardDescription>Performance-based branch analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="h-[250px] w-full flex items-center justify-center">
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
                                    <Button className="w-full" onClick={fetchGuideAdvise}>
                                        Run Guide Analysis
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push('/dashboard/student/specialization-preferences')}
                                    >
                                        Retake / Update Details
                                    </Button>
                                </div>
                            )}
                            {loadingAI && <Button disabled className="w-full"><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</Button>}

                            {aiAdvice && (
                                <div className="p-4 bg-white/50 rounded-xl space-y-3 border border-primary/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">Match Found</span>
                                        <Badge variant="default" className="bg-primary">{confidence} Confidence</Badge>
                                    </div>
                                    <h4 className="text-xl font-bold text-primary">{aiAdvice.recommended_specialization} Branch</h4>
                                    <p className="text-xs italic text-muted-foreground">"{aiAdvice.insight}"</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Confidence improves as more academic results and profile signals become available.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Specialization Options */}
                <div className="lg:col-span-2 space-y-6">
                    {activeRound ? (
                        activeRound.phase === 'POST_APPROVAL' ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/40 rounded-xl space-y-2">
                                    <h3 className="font-bold text-lg">Completed specialization round</h3>
                                    {activeRound.approvedAt && (
                                        <p className="text-xs text-muted-foreground">
                                            Approved {format(activeRound.approvedAt, 'PPp')}
                                        </p>
                                    )}
                                    {activeRound.appStatus === 'ALLOCATED' && activeRound.allocatedTo && (
                                        <p className="text-sm">
                                            <strong>Your allocation:</strong>{' '}
                                            {activeRound.slots.find(s => s.id === activeRound.allocatedTo)?.name ?? '—'}{' '}
                                            <span className="font-mono text-xs text-muted-foreground">
                                                ({activeRound.slots.find(s => s.id === activeRound.allocatedTo)?.code})
                                            </span>
                                        </p>
                                    )}
                                    {activeRound.graceEndsAt && (
                                        <p className="text-xs text-muted-foreground">
                                            {new Date() <= activeRound.graceEndsAt ? (
                                                <>
                                                    Change requests close{' '}
                                                    {formatDistanceToNow(activeRound.graceEndsAt, { addSuffix: true })} (
                                                    {format(activeRound.graceEndsAt, 'PPp')}).
                                                </>
                                            ) : (
                                                <>The post-approval change window has ended.</>
                                            )}
                                        </p>
                                    )}
                                </div>
                                {activeRound.pendingChangeRequest && (
                                    <Alert>
                                        <Clock className="h-4 w-4" />
                                        <AlertDescription>
                                            You have a pending allocation change request for your HOD to review.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {activeRound.changeRequestLockReason && !activeRound.pendingChangeRequest && (
                                    <Alert className="border-muted-foreground/30 bg-muted/30">
                                        <Info className="h-4 w-4" />
                                        <AlertDescription className="text-sm">
                                            {activeRound.changeRequestLockReason}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {activeRound.canRequestChange && !activeRound.pendingChangeRequest && (
                                    <Card className="border-primary/30">
                                        <CardHeader>
                                            <CardTitle className="text-base">Request a change</CardTitle>
                                            <CardDescription>
                                                You may submit <strong>one</strong> allocation change request during this
                                                window. Your HOD must approve it before your record updates; after a
                                                decision you cannot submit another request for this round.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid md:grid-cols-3 gap-4">
                                                {activeRound.slots.map(spec => (
                                                    <Card
                                                        key={spec.id}
                                                        className={`border-2 ${chg1 === spec.id ? 'border-primary bg-primary/5' : chg2 === spec.id ? 'border-secondary bg-muted/40' : 'border-muted'}`}
                                                    >
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="text-lg">{spec.code}</CardTitle>
                                                            <CardDescription className="text-[10px]">{spec.name}</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="flex flex-wrap gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant={chg1 === spec.id ? 'default' : 'outline'}
                                                                onClick={() => {
                                                                    if (spec.id === chg2) setChg2(null);
                                                                    setChg1(spec.id);
                                                                }}
                                                            >
                                                                1st
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant={chg2 === spec.id ? 'secondary' : 'outline'}
                                                                onClick={() => {
                                                                    if (spec.id === chg1) {
                                                                        toast.error('Choices must differ.');
                                                                        return;
                                                                    }
                                                                    setChg2(spec.id);
                                                                }}
                                                            >
                                                                2nd
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Reason (optional)</label>
                                                <Textarea
                                                    className="mt-1.5"
                                                    rows={3}
                                                    value={chgReason}
                                                    onChange={e => setChgReason(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={handleSpecChangeRequest} disabled={isPending || !chg1}>
                                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Submit request
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ) : (
                        <>
                            <div className="p-4 bg-muted/40 rounded-xl space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h3 className="font-bold text-lg">Official selection round</h3>
                                    <Badge variant="outline">
                                        {activeRound.mode === 'AUTO' ? 'Auto' : activeRound.mode === 'FREE' ? 'FCFS' : 'GPA-ranked'}
                                    </Badge>
                                </div>
                                {!activeRound.windowOk && (
                                    <p className="text-sm text-amber-700">{activeRound.windowMessage || 'Submissions are closed for this period.'}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Choose your primary specialization; add an optional second choice for redistribution if a track is under-subscribed. Final assignments are confirmed by your department after the round closes.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                {activeRound.slots.map((spec) => (
                                    <Card
                                        key={spec.id}
                                        className={`border-2 relative overflow-hidden h-full ${rp1 === spec.id ? 'border-primary bg-primary/5' : rp2 === spec.id ? 'border-secondary bg-muted/40' : 'border-muted'}`}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{spec.code}</CardTitle>
                                            <CardDescription className="text-[10px] leading-tight">{spec.name}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {spec.description && (
                                                <p className="text-[11px] text-muted-foreground line-clamp-4">{spec.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                <Button size="sm" variant={rp1 === spec.id ? 'default' : 'outline'} disabled={!activeRound.windowOk}
                                                    onClick={() => pickRoundSpec(spec.id, 1)}>1st</Button>
                                                <Button size="sm" variant={rp2 === spec.id ? 'secondary' : 'outline'} disabled={!activeRound.windowOk}
                                                    onClick={() => pickRoundSpec(spec.id, 2)}>2nd (optional)</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <p className="text-sm">
                                        Primary: <strong>{activeRound.slots.find(s => s.id === rp1)?.code ?? '—'}</strong>
                                        {rp2 && <> · Backup: <strong>{activeRound.slots.find(s => s.id === rp2)?.code}</strong></>}
                                    </p>
                                    <Button size="sm" className="shrink-0" onClick={handleRoundSubmit} disabled={isPending || !activeRound.windowOk || !rp1}>
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save application'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                        )
                    ) : (
                        <>
                            <div className="p-4 bg-muted/40 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {currentSpecialization ? <CheckCircle className="h-6 w-6 text-green-600" /> : <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
                                    <h3 className="font-bold text-lg">
                                        {currentSpecialization ? `Locked into: ${currentSpecialization.name}` : "Pending Specialization Choice"}
                                    </h3>
                                </div>
                                {currentSpecialization && <Badge variant="outline">Confirmed</Badge>}
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {availableSpecializations.map((spec) => (
                                    <Card
                                        key={spec.code}
                                        className={`cursor-pointer transition-all border-2 relative overflow-hidden h-full ${selectedSpec === spec.code ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'hover:border-muted hover:bg-muted/5'}`}
                                        onClick={() => !currentSpecialization && setSelectedSpec(spec.code)}
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className={`p-2 rounded-lg ${selectedSpec === spec.code ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                                    {spec.code === 'BSE' && <Factory className="h-4 w-4" />}
                                                    {spec.code === 'OSCM' && <Network className="h-4 w-4" />}
                                                    {spec.code === 'IS' && <LayoutDashboard className="h-4 w-4" />}
                                                </div>
                                                {aiAdvice?.recommended_specialization === spec.code && (
                                                    <Badge className="bg-orange-500 text-[10px]">Guide Choice</Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg mt-3">{spec.code}</CardTitle>
                                            <CardDescription className="text-[10px] leading-tight">{spec.name}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-[11px] text-muted-foreground min-h-[60px]">
                                                {spec.description || `Specialization track focusing on ${spec.name} methodologies and advanced industry practices.`}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {spec.code === 'BSE' && ['ERP', 'Consulting', 'SaaS'].map(s => <Badge key={s} variant="outline" className="text-[9px] px-1">{s}</Badge>)}
                                                {spec.code === 'OSCM' && ['Ops', 'Supply Chain', 'Logistics'].map(s => <Badge key={s} variant="outline" className="text-[9px] px-1">{s}</Badge>)}
                                                {spec.code === 'IS' && ['Arch', 'Cloud', 'Networking'].map(s => <Badge key={s} variant="outline" className="text-[9px] px-1">{s}</Badge>)}
                                            </div>
                                        </CardContent>
                                        {selectedSpec === spec.code && (
                                            <div className="absolute top-2 right-2">
                                                <Star className="h-3 w-3 fill-primary text-primary" />
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>

                            {selectedSpec && !currentSpecialization && (
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Target className="h-5 w-5 text-amber-600" />
                                            <p className="text-sm font-medium">Ready to lock in <strong>{selectedSpec}</strong> as your permanent specialization?</p>
                                        </div>
                                        <Button size="sm" onClick={handleConfirmSelection} disabled={isPending}>
                                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Specialization"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
