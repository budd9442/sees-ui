'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
    History, Settings, Users, BarChart3, Plus, Play, Lock,
    CheckCircle2, AlertTriangle, Clock, Zap, ArrowRight,
    GraduationCap, ListFilter, RefreshCw, Eye, ChevronRight,
    Trophy, TrendingUp, Info, X, Medal, Save
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    createSelectionRound, updateRoundStatus, updateRoundConfigs,
    updateSelectionRoundMeta,
    runGPAAllocation, approveSelectionRound, commitApprovedPathwayAllocationsToStudents,
    moveWaitlistStudent,
    getSelectionRoundDetail, rejectApplication, redistributeUnderThresholdSpecs,
    getSelectionInsights,
    listAllocationChangeRequestsForRound,
    resolveAllocationChangeRequest,
    promoteAllWaitlistToFreeSlots,
} from '@/lib/actions/selection-actions';


// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type RoundStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'APPROVED';
type RoundType = 'PATHWAY' | 'SPECIALIZATION';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: RoundStatus }) {
    const map: Record<RoundStatus, { label: string; className: string }> = {
        DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
        OPEN: { label: 'Open', className: 'bg-green-100 text-green-700 border-green-200' },
        CLOSED: { label: 'Closed — Awaiting Approval', className: 'bg-amber-100 text-amber-700 border-amber-200' },
        APPROVED: { label: 'Approved', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    };
    const { label, className } = map[status] || map.DRAFT;
    return <Badge variant="outline" className={`text-[10px] uppercase tracking-wide ${className}`}>{label}</Badge>;
}

function TypeBadge({ type }: { type: RoundType }) {
    return type === 'PATHWAY'
        ? <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">Pathway</Badge>
        : <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px]">Specialization</Badge>;
}

function toDatetimeLocalValue(d: string | Date | null | undefined): string {
    if (!d) return '';
    const x = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(x.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function SelectionClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const { academicYears, allRounds, programs, specializations } = initialData;

    // ── State ──
    const [activeTab, setActiveTab] = useState('rounds');
    const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
    const [roundDetail, setRoundDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Create round dialog
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newRound, setNewRound] = useState({
        type: 'PATHWAY' as RoundType,
        label: '',
        level: '',
        target_program_id: '',
        academic_year_id: academicYears[0]?.academic_year_id || '',
        selection_mode: 'AUTO',
        opens_at: '',
        closes_at: '',
        allocation_change_grace_days: 0,
    });
    const [newConfigs, setNewConfigs] = useState<any[]>([]);

    // Approval
    const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);
    const [approvalWarnings, setApprovalWarnings] = useState<string[]>([]);
    const [showAllocationReview, setShowAllocationReview] = useState(false);
    const [allocationReviewAcknowledged, setAllocationReviewAcknowledged] = useState(false);

    // Waitlist move
    const [showMoveDialog, setShowMoveDialog] = useState(false);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [moveTarget, setMoveTarget] = useState('');

    // Search / filter on live list
    const [liveSearch, setLiveSearch] = useState('');
    const [liveFilter, setLiveFilter] = useState<'ALL' | 'ALLOCATED' | 'WAITLISTED' | 'PENDING'>('ALL');

    // Round settings (editable DRAFT / OPEN)
    const [settingsRoundId, setSettingsRoundId] = useState<string>('');
    const [settingsMeta, setSettingsMeta] = useState({
        label: '',
        level: '',
        target_program_id: '',
        selection_mode: 'AUTO',
        opens_at: '',
        closes_at: '',
        notes: '',
        allocation_change_grace_days: 0,
    });
    const [settingsConfigs, setSettingsConfigs] = useState<any[]>([]);
    const [settingsType, setSettingsType] = useState<RoundType>('PATHWAY');
    const [loadingSettings, setLoadingSettings] = useState(false);

    // Insights
    const [insightsData, setInsightsData] = useState<any>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);

    const [changeRequests, setChangeRequests] = useState<any[]>([]);
    const [loadingChangeRequests, setLoadingChangeRequests] = useState(false);

    // ── Load detail ──
    const loadRoundDetail = async (roundId: string) => {
        setLoadingDetail(true);
        setSelectedRoundId(roundId);
        setActiveTab('live');
        const result = await getSelectionRoundDetail(roundId);
        if (result.success) setRoundDetail(result.data);
        else toast.error('Failed to load round detail');
        setLoadingDetail(false);
    };

    const refreshDetail = async () => {
        if (!selectedRoundId) return;
        const result = await getSelectionRoundDetail(selectedRoundId);
        if (result.success) setRoundDetail(result.data);
    };

    const loadSettingsRound = async (roundId: string) => {
        if (!roundId) {
            setSettingsConfigs([]);
            return;
        }
        setLoadingSettings(true);
        const result = await getSelectionRoundDetail(roundId);
        if (result.success && result.data) {
            const r = result.data;
            setSettingsType(r.type as RoundType);
            setSettingsMeta({
                label: r.label,
                level: r.level || '',
                target_program_id: r.target_program_id || '',
                selection_mode: r.selection_mode,
                opens_at: toDatetimeLocalValue(r.opens_at),
                closes_at: toDatetimeLocalValue(r.closes_at),
                notes: r.notes ?? '',
                allocation_change_grace_days: typeof r.allocation_change_grace_days === 'number' ? r.allocation_change_grace_days : 0,
            });
            setSettingsConfigs(
                r.configs.map((c: any) => ({
                    program_id: c.program_id || undefined,
                    spec_id: c.spec_id || undefined,
                    capacity: c.capacity,
                    priority: c.priority ?? 0,
                }))
            );
        } else toast.error('Failed to load round for settings');
        setLoadingSettings(false);
    };

    useEffect(() => {
        if (activeTab !== 'insights' || insightsData) return;
        setInsightsLoading(true);
        getSelectionInsights().then(res => {
            if (res.success) setInsightsData(res.data);
            else toast.error(res.error || 'Failed to load insights');
            setInsightsLoading(false);
        });
    }, [activeTab, insightsData]);

    useEffect(() => {
        if (
            !selectedRoundId ||
            roundDetail?.round_id !== selectedRoundId ||
            roundDetail?.status !== 'APPROVED'
        ) {
            setChangeRequests([]);
            return;
        }
        let cancelled = false;
        setLoadingChangeRequests(true);
        listAllocationChangeRequestsForRound(selectedRoundId).then(res => {
            if (!cancelled && res.success) setChangeRequests(res.data ?? []);
            if (!cancelled) setLoadingChangeRequests(false);
        });
        return () => {
            cancelled = true;
        };
    }, [roundDetail?.round_id, roundDetail?.status, selectedRoundId]);

    const editableRoundIds = allRounds.filter((r: any) => r.status === 'DRAFT' || r.status === 'OPEN').map((r: any) => r.round_id);

    // ── Actions ──
    const handleCreateRound = async () => {
        if (!newRound.label || !newRound.academic_year_id) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (!newRound.level && !newRound.target_program_id) {
            toast.error('Set at least a target level or a target program');
            return;
        }
        startTransition(async () => {
            const result = await createSelectionRound({
                ...newRound,
                configs: newConfigs,
            } as any);
            if (result.success) {
                toast.success('Round created successfully');
                setShowCreateDialog(false);
                setNewConfigs([]);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to create round');
            }
        });
    };

    const handleStatusChange = async (roundId: string, status: RoundStatus) => {
        startTransition(async () => {
            const result = await updateRoundStatus(roundId, status);
            if (result.success) {
                toast.success(`Round ${status.toLowerCase()}`);
                refreshDetail();
                router.refresh();
            } else {
                toast.error(result.error || 'Failed');
            }
        });
    };

    const handleRunAllocation = async () => {
        if (!selectedRoundId) return;
        startTransition(async () => {
            const result = await runGPAAllocation(selectedRoundId);
            if (result.success) {
                toast.success(`Allocation complete — ${(result as any).summary?.allocated} allocated, ${(result as any).summary?.waitlisted} waitlisted`);
                refreshDetail();
            } else {
                toast.error(result.error || 'Allocation failed');
            }
        });
    };

    const handleApprove = async (force = false) => {
        if (!selectedRoundId) return;
        startTransition(async () => {
            const result = await approveSelectionRound(selectedRoundId, force);
            if (result.success) {
                toast.success('Round approved — student records updated');
                setShowApprovalConfirm(false);
                setShowAllocationReview(false);
                setAllocationReviewAcknowledged(false);
                setApprovalWarnings([]);
                await refreshDetail();
                router.refresh();
            } else if ((result as any).needsForce) {
                setShowAllocationReview(false);
                setAllocationReviewAcknowledged(false);
                setApprovalWarnings((result as any).warnings || []);
                setShowApprovalConfirm(true);
            } else {
                toast.error(result.error || 'Approval failed');
            }
        });
    };

    const handleCommitPathwayDegrees = async () => {
        if (!selectedRoundId) return;
        startTransition(async () => {
            const result = await commitApprovedPathwayAllocationsToStudents(selectedRoundId);
            if (result.success) {
                const n = (result as { updated?: number }).updated ?? 0;
                toast.success(
                    n === 0
                        ? 'No allocated students to update (or allocations are invalid).'
                        : `Updated ${n} student degree record(s) to match approved allocations.`
                );
                refreshDetail();
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update student records');
            }
        });
    };

    const handleMoveStudent = async () => {
        if (!selectedApp || !moveTarget) return;
        startTransition(async () => {
            const result = await moveWaitlistStudent(selectedApp.app_id, moveTarget);
            if (result.success) {
                toast.success('Student moved successfully');
                setShowMoveDialog(false);
                refreshDetail();
            } else {
                toast.error(result.error || 'Failed to move student');
            }
        });
    };

    const handleRejectApp = async (appId: string) => {
        startTransition(async () => {
            const result = await rejectApplication(appId);
            if (result.success) {
                toast.success('Application rejected');
                refreshDetail();
            } else toast.error(result.error || 'Reject failed');
        });
    };

    const handleSaveSettings = async () => {
        if (!settingsRoundId) {
            toast.error('Select a round');
            return;
        }
        if (!settingsMeta.level && !settingsMeta.target_program_id) {
            toast.error('Set at least a target level or a target program');
            return;
        }
        startTransition(async () => {
            const metaRes = await updateSelectionRoundMeta(settingsRoundId, {
                label: settingsMeta.label,
                selection_mode: settingsMeta.selection_mode as 'AUTO' | 'GPA' | 'FREE',
                opens_at: settingsMeta.opens_at || null,
                closes_at: settingsMeta.closes_at || null,
                notes: settingsMeta.notes || null,
                level: settingsMeta.level || null,
                target_program_id: settingsMeta.target_program_id || null,
                allocation_change_grace_days: settingsMeta.allocation_change_grace_days,
            });
            if (!metaRes.success) {
                toast.error(metaRes.error || 'Failed to update round');
                return;
            }
            const cfgRes = await updateRoundConfigs(settingsRoundId, settingsConfigs);
            if (cfgRes.success) {
                toast.success('Round settings saved');
                router.refresh();
                loadSettingsRound(settingsRoundId);
            } else toast.error(cfgRes.error || 'Failed to update slots');
        });
    };

    const handleResolveChangeRequest = (requestId: string, decision: 'APPROVE' | 'REJECT') => {
        startTransition(async () => {
            const res = await resolveAllocationChangeRequest(requestId, decision);
            if (res.success) {
                toast.success(decision === 'APPROVE' ? 'Request approved' : 'Request rejected');
                refreshDetail();
                const list = await listAllocationChangeRequestsForRound(selectedRoundId!);
                if (list.success) setChangeRequests(list.data ?? []);
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to resolve');
            }
        });
    };

    const handleRedistributeSpecs = async () => {
        if (!selectedRoundId) return;
        startTransition(async () => {
            const result = await redistributeUnderThresholdSpecs(selectedRoundId);
            if (result.success) {
                toast.success(
                    typeof result.moved === 'number'
                        ? `Redistributed ${result.moved} student(s) to second choice or pending`
                        : (result as any).message || 'Done'
                );
                setShowApprovalConfirm(false);
                setApprovalWarnings([]);
                refreshDetail();
            } else toast.error(result.error || 'Redistribution failed');
        });
    };

    const handlePromoteWaitlist = async () => {
        if (!selectedRoundId) return;
        startTransition(async () => {
            const result = await promoteAllWaitlistToFreeSlots(selectedRoundId);
            if (result.success) {
                toast.success(`Redistributed ${result.moved} student(s) to pathways with available capacity.`);
                refreshDetail();
            } else {
                toast.error(result.error || 'Failed to redistribute waitlist');
            }
        });
    };

    // ── Filtered live list ──
    const filteredApps = roundDetail?.applications?.filter((a: any) => {
        const name = `${a.student?.firstName ?? ''} ${a.student?.lastName ?? ''}`.toLowerCase();
        const email = (a.student?.email ?? '').toLowerCase();
        const matchSearch = name.includes(liveSearch.toLowerCase()) || email.includes(liveSearch.toLowerCase());
        const matchFilter = liveFilter === 'ALL' || a.status === liveFilter;
        return matchSearch && matchFilter;
    }) ?? [];

    const reviewSortedApps = useMemo(() => {
        const apps = roundDetail?.applications ?? [];
        const order: Record<string, number> = { ALLOCATED: 0, WAITLISTED: 1, PENDING: 2, REJECTED: 3 };
        return [...apps].sort((a: any, b: any) => {
            const da = order[a.status] ?? 9;
            const db = order[b.status] ?? 9;
            if (da !== db) return da - db;
            const na = `${a.student?.lastName ?? ''} ${a.student?.firstName ?? ''}`.toLowerCase();
            const nb = `${b.student?.lastName ?? ''} ${b.student?.firstName ?? ''}`.toLowerCase();
            return na.localeCompare(nb);
        });
    }, [roundDetail?.applications]);

    const sum = roundDetail?.allocationSummary;

    // Stats for history
    const totalApproved = allRounds.filter((r: any) => r.status === 'APPROVED').length;
    const totalActive = allRounds.filter((r: any) => ['OPEN', 'CLOSED'].includes(r.status)).length;

    // Config helpers for new round dialog
    const addConfig = () => {
        const isPathway = newRound.type === 'PATHWAY';
        setNewConfigs(prev => [...prev, {
            program_id: isPathway ? '' : undefined,
            spec_id: isPathway ? undefined : '',
            capacity: isPathway ? 50 : 10,
        }]);
    };
    const removeConfig = (i: number) => setNewConfigs(prev => prev.filter((_, idx) => idx !== i));
    const updateConfig = (i: number, key: string, value: any) => {
        setNewConfigs(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: value } : c));
    };

    // ── Render ──
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Selection Management</h1>
                    <p className="text-muted-foreground mt-1">Manage pathway and specialization selection rounds</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Round
                </Button>
            </div>

            {/* KPI strip + awaiting-review alert: anchor target from HOD dashboard “Pending approvals” */}
            <div id="hod-pending-approvals" className="scroll-mt-24 space-y-4">
                {/* KPI Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total Rounds</p>
                            <p className="text-3xl font-black mt-1 text-foreground">{allRounds.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Active</p>
                            <p className="text-3xl font-black mt-1 text-foreground">{totalActive}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Approved</p>
                            <p className="text-3xl font-black mt-1 text-foreground">{totalApproved}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Awaiting Review</p>
                            <p className="text-3xl font-black mt-1 text-foreground">{allRounds.filter((r: any) => r.status === 'CLOSED').length}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Alert for rounds awaiting approval */}
                {allRounds.filter((r: any) => r.status === 'CLOSED').length > 0 && (
                    <Alert className="border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-700">Rounds Awaiting HOD Approval</AlertTitle>
                        <AlertDescription className="text-amber-600">
                            {allRounds.filter((r: any) => r.status === 'CLOSED').length} round(s) are closed and require your review and approval before student records are updated.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => {
                setActiveTab(v);
                if (v === 'settings') {
                    const pick = settingsRoundId || editableRoundIds[0] || '';
                    if (pick) {
                        setSettingsRoundId(pick);
                        loadSettingsRound(pick);
                    }
                }
            }} className="space-y-4">
                <TabsList className="h-10 flex-wrap">
                    <TabsTrigger value="rounds" className="gap-1.5"><ListFilter className="h-3.5 w-3.5" />All Rounds</TabsTrigger>
                    <TabsTrigger value="live" className="gap-1.5" disabled={!selectedRoundId}><Users className="h-3.5 w-3.5" />Live View{selectedRoundId && <Badge className="ml-1 h-4 w-4 p-0 text-[9px] flex items-center justify-center">!</Badge>}</TabsTrigger>
                    <TabsTrigger value="settings" className="gap-1.5"><Settings className="h-3.5 w-3.5" />Round Settings</TabsTrigger>
                    <TabsTrigger value="history" className="gap-1.5"><History className="h-3.5 w-3.5" />History</TabsTrigger>
                    <TabsTrigger value="insights" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Insights</TabsTrigger>
                </TabsList>

                {/* ══ All Rounds ══ */}
                <TabsContent value="rounds" className="space-y-3">
                    {allRounds.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center py-16 text-center gap-3">
                                <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
                                <h3 className="font-semibold text-lg">No Selection Rounds Yet</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">Create your first selection round to begin managing pathway or specialization applications.</p>
                                <Button onClick={() => setShowCreateDialog(true)} className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" />Create Round
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {allRounds.map((round: any) => (
                                <Card key={round.round_id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${round.type === 'PATHWAY' ? 'bg-purple-100' : 'bg-cyan-100'}`}>
                                                    {round.type === 'PATHWAY'
                                                        ? <ArrowRight className="h-5 w-5 text-purple-600" />
                                                        : <Trophy className="h-5 w-5 text-cyan-600" />
                                                    }
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{round.label}</span>
                                                        <TypeBadge type={round.type} />
                                                        <StatusBadge status={round.status} />
                                                        {round.selection_mode === 'AUTO' && (
                                                            <Badge variant="outline" className="text-[9px] bg-sky-50 text-sky-700 border-sky-200">Auto (by capacity)</Badge>
                                                        )}
                                                        {round.selection_mode === 'GPA' && (
                                                            <Badge variant="outline" className="text-[9px] bg-orange-50 text-orange-600 border-orange-200">GPA-Ranked</Badge>
                                                        )}
                                                        {round.selection_mode === 'FREE' && (
                                                            <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">FCFS</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {round.academic_year?.label} · Level {round.level || 'Any'} · Program {round.target_program?.code || 'Any'} ·
                                                        {round._count?.applications ?? 0} applications ·
                                                        {round.configs?.length ?? 0} slots configured
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {round.status === 'DRAFT' && (
                                                    <Button size="sm" onClick={() => handleStatusChange(round.round_id, 'OPEN')}>
                                                        <Play className="h-3.5 w-3.5 mr-1" />Open
                                                    </Button>
                                                )}
                                                {round.status === 'OPEN' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(round.round_id, 'CLOSED')}>
                                                        <Lock className="h-3.5 w-3.5 mr-1" />Close
                                                    </Button>
                                                )}
                                                {round.status === 'CLOSED' && (
                                                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => loadRoundDetail(round.round_id)}>
                                                        <Eye className="h-3.5 w-3.5 mr-1" />Review & Approve
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost" onClick={() => loadRoundDetail(round.round_id)}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ══ Round Settings ══ */}
                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Round Settings</CardTitle>
                            <CardDescription>Edit draft or open rounds: dates, mode, level, notes, and slot capacities or minimum thresholds.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {editableRoundIds.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No draft or open rounds available. Create or reopen a round first.</p>
                            ) : (
                                <>
                                    <div className="space-y-1.5 max-w-md">
                                        <Label>Round</Label>
                                        <Select
                                            value={settingsRoundId}
                                            onValueChange={(id) => {
                                                setSettingsRoundId(id);
                                                loadSettingsRound(id);
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select round" /></SelectTrigger>
                                            <SelectContent>
                                                {allRounds
                                                    .filter((r: any) => r.status === 'DRAFT' || r.status === 'OPEN')
                                                    .map((r: any) => (
                                                        <SelectItem key={r.round_id} value={r.round_id}>
                                                            {r.label} ({r.status})
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {loadingSettings ? (
                                        <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                                    ) : settingsRoundId ? (
                                        <>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label>Label</Label>
                                                    <Input value={settingsMeta.label} onChange={e => setSettingsMeta(m => ({ ...m, label: e.target.value }))} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Target level</Label>
                                                    <Select value={settingsMeta.level || '__none'} onValueChange={v => setSettingsMeta(m => ({ ...m, level: v === '__none' ? '' : v }))}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__none">Any level</SelectItem>
                                                            {['L1', 'L2', 'L3', 'L4'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Target program</Label>
                                                    <Select
                                                        value={settingsMeta.target_program_id || '__none'}
                                                        onValueChange={v => setSettingsMeta(m => ({ ...m, target_program_id: v === '__none' ? '' : v }))}
                                                    >
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__none">Any program</SelectItem>
                                                            {programs.map((p: any) => (
                                                                <SelectItem key={p.program_id} value={p.program_id}>
                                                                    {p.code} — {p.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Selection mode</Label>
                                                    <Select value={settingsMeta.selection_mode} onValueChange={v => setSettingsMeta(m => ({ ...m, selection_mode: v }))}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="AUTO">Auto — FIFO within cap, GPA if oversubscribed</SelectItem>
                                                            <SelectItem value="GPA">Always GPA-ranked</SelectItem>
                                                            <SelectItem value="FREE">Always FCFS (global)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label>Opens at</Label>
                                                    <Input type="datetime-local" value={settingsMeta.opens_at} onChange={e => setSettingsMeta(m => ({ ...m, opens_at: e.target.value }))} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Closes at</Label>
                                                    <Input type="datetime-local" value={settingsMeta.closes_at} onChange={e => setSettingsMeta(m => ({ ...m, closes_at: e.target.value }))} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Post-approval change window (days)</Label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={365}
                                                        value={settingsMeta.allocation_change_grace_days}
                                                        onChange={e =>
                                                            setSettingsMeta(m => ({
                                                                ...m,
                                                                allocation_change_grace_days: Math.max(0, Number(e.target.value) || 0),
                                                            }))
                                                        }
                                                    />
                                                    <p className="text-[10px] text-muted-foreground">After the round is approved; 0 = no student requests.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Notes (optional)</Label>
                                                <Textarea value={settingsMeta.notes} onChange={e => setSettingsMeta(m => ({ ...m, notes: e.target.value }))} rows={2} className="resize-none" />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold">
                                                    {settingsType === 'PATHWAY' ? 'Pathway slots (max capacity)' : 'Specialization slots (min threshold)'}
                                                </Label>
                                                <Button type="button" size="sm" variant="outline" onClick={() => {
                                                    const isPathway = settingsType === 'PATHWAY';
                                                    setSettingsConfigs(prev => [...prev, {
                                                        program_id: isPathway ? '' : undefined,
                                                        spec_id: isPathway ? undefined : '',
                                                        capacity: isPathway ? 50 : 10,
                                                        priority: 0,
                                                    }]);
                                                }}><Plus className="h-3.5 w-3.5 mr-1" />Add slot</Button>
                                            </div>
                                            <div className="space-y-2">
                                                {settingsConfigs.map((cfg, i) => (
                                                    <div key={i} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg flex-wrap">
                                                        <Select
                                                            value={cfg.program_id || cfg.spec_id || ''}
                                                            onValueChange={v => {
                                                                setSettingsConfigs(prev => prev.map((c, idx) => idx === i
                                                                    ? settingsType === 'PATHWAY'
                                                                        ? { ...c, program_id: v, spec_id: undefined }
                                                                        : { ...c, spec_id: v, program_id: undefined }
                                                                    : c));
                                                            }}
                                                        >
                                                            <SelectTrigger className="flex-1 min-w-[200px] h-8 text-xs"><SelectValue placeholder={settingsType === 'PATHWAY' ? 'Pathway' : 'Specialization'} /></SelectTrigger>
                                                            <SelectContent>
                                                                {settingsType === 'PATHWAY'
                                                                    ? programs.map((p: any) => <SelectItem key={p.program_id} value={p.program_id}>{p.code} — {p.name}</SelectItem>)
                                                                    : specializations.map((s: any) => <SelectItem key={s.specialization_id} value={s.specialization_id}>{s.code} — {s.name}</SelectItem>)
                                                                }
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex items-center gap-1.5">
                                                            <Label className="text-[10px] whitespace-nowrap">{settingsType === 'PATHWAY' ? 'Max' : 'Min'}</Label>
                                                            <Input type="number" className="w-20 h-8 text-xs" value={cfg.capacity}
                                                                onChange={e => setSettingsConfigs(prev => prev.map((c, idx) => idx === i ? { ...c, capacity: Number(e.target.value) } : c))} />
                                                        </div>
                                                        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSettingsConfigs(prev => prev.filter((_, idx) => idx !== i))}>
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button onClick={handleSaveSettings} disabled={isPending}>
                                                {isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                Save settings
                                            </Button>
                                        </>
                                    ) : null}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ══ Live View ══ */}
                <TabsContent value="live" className="space-y-4">
                    {loadingDetail ? (
                        <div className="flex items-center justify-center h-48">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !roundDetail ? (
                        <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">Select a round from the All Rounds tab to view live data.</CardContent></Card>
                    ) : (
                        <div className="space-y-4">
                            {/* Round Header */}
                            <Card className="border-l-4 border-l-primary">
                                <CardContent className="py-3 px-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg">{roundDetail.label}</span>
                                                    <TypeBadge type={roundDetail.type} />
                                                    <StatusBadge status={roundDetail.status} />
                                                    {roundDetail.selection_mode === 'AUTO' && (
                                                        <Badge variant="outline" className="text-[9px] bg-sky-50 text-sky-700 border-sky-200">Auto</Badge>
                                                    )}
                                                    {roundDetail.selection_mode === 'GPA' && (
                                                        <Badge variant="outline" className="text-[9px] bg-orange-50 text-orange-600 border-orange-200">GPA</Badge>
                                                    )}
                                                    {roundDetail.selection_mode === 'FREE' && (
                                                        <Badge variant="outline" className="text-[9px]">FCFS</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {roundDetail.academic_year?.label} · Level {roundDetail.level || 'Any'} · Program {roundDetail.target_program?.code || 'Any'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={refreshDetail}><RefreshCw className="h-3.5 w-3.5" /></Button>
                                            {roundDetail.status === 'CLOSED' && (
                                                <Button size="sm" onClick={handleRunAllocation} disabled={isPending}>
                                                    <Zap className="h-3.5 w-3.5 mr-1" />
                                                    {roundDetail.selection_mode === 'FREE'
                                                        ? 'Run FCFS allocation'
                                                        : roundDetail.selection_mode === 'AUTO'
                                                            ? 'Run allocation (auto by capacity)'
                                                            : 'Run GPA allocation'}
                                                </Button>
                                            )}
                                            {roundDetail.status === 'CLOSED' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => {
                                                        setAllocationReviewAcknowledged(false);
                                                        setShowAllocationReview(true);
                                                    }}
                                                    disabled={isPending}
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                    Review allocations and approve
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {roundDetail.status === 'CLOSED' && (
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle className="text-sm">Verify before approving</AlertTitle>
                                    <AlertDescription className="text-xs leading-relaxed">
                                        {
                                            "Run allocation if you have not already. Check slot totals above and every row in the student list. Use Review allocations and approve to see the full sorted list and confirm; pathway rounds then update each student's official degree program."
                                        }
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Slot Stats */}
                            <div className="grid gap-3 md:grid-cols-3">
                                {roundDetail.slotStats?.map((slot: any) => {
                                    const isSpecialization = roundDetail.type === 'SPECIALIZATION';
                                    const pct = Math.min(100, Math.round(((slot.allocated + slot.pending) / slot.capacity) * 100));
                                    const viabilityIssue = isSpecialization && slot.allocated < slot.capacity;

                                    return (
                                        <Card key={slot.config_id} className={`${viabilityIssue ? 'border-amber-300' : ''}`}>
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-sm">{slot.label}</p>
                                                        <p className="text-[10px] text-muted-foreground font-mono">{slot.code}</p>
                                                    </div>
                                                    {viabilityIssue && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                                    {slot.isFull && <Badge variant="destructive" className="text-[9px]">Full</Badge>}
                                                </div>
                                                <Progress value={pct} className="h-1.5" />
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span className="font-semibold text-green-600">{slot.allocated} allocated</span>
                                                    {slot.pending > 0 && <span className="text-blue-600">{slot.pending} pending</span>}
                                                    <span className="text-amber-600">{slot.waitlisted} waitlisted</span>
                                                    <span>{isSpecialization ? `Min: ${slot.capacity}` : `Cap: ${slot.capacity}`}</span>
                                                </div>
                                                {viabilityIssue && (
                                                    <p className="text-[10px] text-amber-600 font-medium">Below minimum threshold</p>
                                                )}
                                                <p className="text-[10px] text-muted-foreground">Avg GPA: <span className="font-medium">{slot.avgGpa}</span></p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>



                            {roundDetail.status === 'APPROVED' && (
                                <Card className="border-l-4 border-l-violet-500">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Pending allocation change requests</CardTitle>
                                        <CardDescription className="text-xs">
                                            Students may request a different pathway or specialization during the grace period set on this round.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {loadingChangeRequests ? (
                                            <div className="flex justify-center py-8">
                                                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : changeRequests.length === 0 ? (
                                            <p className="text-sm text-muted-foreground py-2">No pending requests.</p>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Student</TableHead>
                                                        <TableHead>Current</TableHead>
                                                        <TableHead>Requested</TableHead>
                                                        <TableHead>Reason</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {changeRequests.map((cr: any) => {
                                                        const name = `${cr.student?.user?.firstName ?? ''} ${cr.student?.user?.lastName ?? ''}`.trim();
                                                        const cur = cr.current_application?.allocated_to;
                                                        const slotLabel = (id: string) =>
                                                            roundDetail.slotStats?.find((s: any) => s.id === id)?.label ?? id.slice(0, 8);
                                                        return (
                                                            <TableRow key={cr.request_id}>
                                                                <TableCell className="text-sm">
                                                                    <div className="font-medium">{name || '—'}</div>
                                                                    <div className="text-[10px] text-muted-foreground">{cr.student?.user?.email}</div>
                                                                </TableCell>
                                                                <TableCell className="text-xs">{cur ? slotLabel(cur) : '—'}</TableCell>
                                                                <TableCell className="text-xs">
                                                                    {slotLabel(cr.requested_preference_1)}
                                                                    {cr.requested_preference_2 ? (
                                                                        <> → {slotLabel(cr.requested_preference_2)}</>
                                                                    ) : null}
                                                                </TableCell>
                                                                <TableCell className="text-xs max-w-[200px] truncate" title={cr.reason || ''}>
                                                                    {cr.reason || '—'}
                                                                </TableCell>
                                                                <TableCell className="text-right space-x-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-green-700 border-green-300"
                                                                        disabled={isPending}
                                                                        onClick={() => handleResolveChangeRequest(cr.request_id, 'APPROVE')}
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        disabled={isPending}
                                                                        onClick={() => handleResolveChangeRequest(cr.request_id, 'REJECT')}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Live Student List */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Student List</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Search student..."
                                                value={liveSearch}
                                                onChange={e => setLiveSearch(e.target.value)}
                                                className="h-8 w-48 text-xs"
                                            />
                                            <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                                                {(['ALL', 'ALLOCATED', 'WAITLISTED', 'PENDING'] as const).map(f => (
                                                    <button
                                                        key={f}
                                                        onClick={() => setLiveFilter(f)}
                                                        className={`text-[10px] px-2 py-1 rounded transition-colors uppercase font-medium ${liveFilter === f ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[420px]">
                                        <Table>
                                            <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="text-[10px] uppercase">Student</TableHead>
                                                    <TableHead className="text-[10px] uppercase min-w-[120px]">Current degree</TableHead>
                                                    <TableHead className="text-[10px] uppercase">GPA</TableHead>
                                                    <TableHead className="text-[10px] uppercase">1st Pref</TableHead>
                                                    <TableHead className="text-[10px] uppercase">2nd Pref</TableHead>
                                                    <TableHead className="text-[10px] uppercase">Status</TableHead>
                                                    <TableHead className="text-[10px] uppercase">Allocated To</TableHead>
                                                    <TableHead className="text-[10px] uppercase w-16">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredApps.length === 0 ? (
                                                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No applications found</TableCell></TableRow>
                                                ) : filteredApps.map((app: any) => {
                                                    const slot1 = roundDetail.slotStats?.find((s: any) => s.id === app.preference_1);
                                                    const slot2 = roundDetail.slotStats?.find((s: any) => s.id === app.preference_2);
                                                    const allocSlot = roundDetail.slotStats?.find((s: any) => s.id === app.allocated_to);
                                                    return (
                                                        <TableRow key={app.app_id} className={
                                                            app.status === 'WAITLISTED' ? 'bg-amber-50/40' :
                                                                app.status === 'ALLOCATED' ? 'bg-green-50/30' : ''
                                                        }>
                                                            <TableCell className="py-2">
                                                                <div>
                                                                    <p className="text-xs font-medium">{app.student?.firstName} {app.student?.lastName}</p>
                                                                    <p className="text-[10px] text-muted-foreground">{app.student?.email}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-xs max-w-[160px] align-top">
                                                                {app.student?.student?.degree_path ? (
                                                                    <div>
                                                                        <p className="font-medium line-clamp-2 leading-snug">
                                                                            {app.student.student.degree_path.name}
                                                                        </p>
                                                                        <p className="font-mono text-[10px] text-muted-foreground">
                                                                            {app.student.student.degree_path.code}
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">—</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-bold">{app.gpa_at_time.toFixed(2)}</TableCell>
                                                            <TableCell className="text-xs">{slot1?.code || app.preference_1?.slice(0, 8) || '—'}</TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">{slot2?.code || (app.preference_2 ? app.preference_2.slice(0, 8) : '—')}</TableCell>
                                                            <TableCell>
                                                                {app.status === 'ALLOCATED' && <Badge className="bg-green-500 text-[9px] h-4 px-1">Allocated</Badge>}
                                                                {app.status === 'WAITLISTED' && <Badge variant="outline" className="text-amber-600 border-amber-200 text-[9px] h-4 px-1">#{app.waitlist_pos} Wait</Badge>}
                                                                {app.status === 'PENDING' && <Badge variant="outline" className="text-[9px] h-4 px-1">Pending</Badge>}
                                                                {app.status === 'REJECTED' && <Badge variant="destructive" className="text-[9px] h-4 px-1">Rejected</Badge>}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {allocSlot?.code || (app.allocated_to ? '...' : <span className="text-muted-foreground">—</span>)}
                                                            </TableCell>
                                                            <TableCell>
                                                                {roundDetail.status === 'CLOSED' && app.status !== 'REJECTED' && (
                                                                    <div className="flex flex-col gap-1">
                                                                        <Button size="sm" variant="ghost" className="h-6 text-[10px]"
                                                                            onClick={() => { setSelectedApp(app); setShowMoveDialog(true); }}>
                                                                            Move
                                                                        </Button>
                                                                        <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive"
                                                                            onClick={() => handleRejectApp(app.app_id)}>
                                                                            Reject
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* ══ History ══ */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Selection Round Archive</CardTitle>
                            <CardDescription>All past selection rounds with outcomes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Round</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Applications</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-16"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allRounds.map((round: any) => (
                                        <TableRow key={round.round_id}>
                                            <TableCell className="font-medium">{round.label}</TableCell>
                                            <TableCell><TypeBadge type={round.type} /></TableCell>
                                            <TableCell className="text-sm">{round.academic_year?.label}</TableCell>
                                            <TableCell><Badge variant="outline">{round.level || 'Any'}</Badge></TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{round.target_program?.code || 'Any'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {round.selection_mode === 'AUTO' && (
                                                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-[10px]">Auto</Badge>
                                                )}
                                                {round.selection_mode === 'GPA' && (
                                                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-[10px]">GPA</Badge>
                                                )}
                                                {round.selection_mode === 'FREE' && (
                                                    <Badge variant="outline" className="text-[10px]">Free</Badge>
                                                )}
                                                {!['AUTO', 'GPA', 'FREE'].includes(round.selection_mode) && (
                                                    <Badge variant="outline" className="text-[10px]">{round.selection_mode}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold">{round._count?.applications ?? 0}</TableCell>
                                            <TableCell><StatusBadge status={round.status} /></TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(round.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" onClick={() => loadRoundDetail(round.round_id)}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {allRounds.length === 0 && (
                                        <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No rounds found</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ══ Insights ══ */}
                <TabsContent value="insights" className="space-y-4">
                    {insightsLoading && (
                        <div className="flex justify-center py-16"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    )}
                    {!insightsLoading && insightsData && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Applications by academic year</CardTitle>
                                    <CardDescription>Approved rounds only</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Year</TableHead>
                                                <TableHead className="text-right">Pathway</TableHead>
                                                <TableHead className="text-right">Spec</TableHead>
                                                <TableHead className="text-right">Rounds</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {insightsData.yearOverYear.map((row: any) => (
                                                <TableRow key={row.academic_year_id}>
                                                    <TableCell className="text-xs font-medium">{row.label}</TableCell>
                                                    <TableCell className="text-right text-xs">{row.pathwayApps}</TableCell>
                                                    <TableCell className="text-right text-xs">{row.specApps}</TableCell>
                                                    <TableCell className="text-right text-xs">{row.rounds}</TableCell>
                                                </TableRow>
                                            ))}
                                            {insightsData.yearOverYear.length === 0 && (
                                                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-6">No approved rounds yet</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">GPA distribution (applications)</CardTitle>
                                    <CardDescription>Heat intensity by volume in approved rounds</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        const h = insightsData.gpaHistogram as Record<string, number>;
                                        const max = Math.max(1, ...Object.values(h));
                                        const buckets = ['0-2', '2-2.5', '2.5-3', '3-3.5', '3.5-4'];
                                        return (
                                            <div className="flex items-end gap-2 h-40 pt-2">
                                                {buckets.map(b => {
                                                    const n = h[b] ?? 0;
                                                    const pct = Math.round((n / max) * 100);
                                                    return (
                                                        <div key={b} className="flex-1 flex flex-col items-center gap-2">
                                                            <div
                                                                className="w-full rounded-t-md bg-primary/80 min-h-[4px] transition-all"
                                                                style={{ height: `${Math.max(8, pct)}%`, opacity: 0.35 + (n / max) * 0.65 }}
                                                                title={`${n} applications`}
                                                            />
                                                            <span className="text-[10px] text-muted-foreground font-mono">{b}</span>
                                                            <span className="text-xs font-bold">{n}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Pathway overflow signals</CardTitle>
                                    <CardDescription>Historical waitlist volume and second-choice placements</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <p><span className="text-muted-foreground">Waitlist records (pathway rounds):</span> <strong>{insightsData.pathwayWaitlistCount}</strong></p>
                                    <p><span className="text-muted-foreground">Allocated to 2nd preference:</span> <strong>{insightsData.pathwaySecondChoiceAllocations}</strong></p>
                                    <p><span className="text-muted-foreground">Approved rounds analyzed:</span> <strong>{insightsData.approvedRoundCount}</strong></p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Most competitive pathways</CardTitle>
                                    <CardDescription>By waitlist share of total pathway outcomes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Slot</TableHead>
                                                <TableHead className="text-right">Overflow %</TableHead>
                                                <TableHead className="text-right">Wait</TableHead>
                                                <TableHead className="text-right">Alloc</TableHead>
                                                <TableHead className="text-right">Avg GPA</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {insightsData.competitivePathways.map((c: any) => (
                                                <TableRow key={c.key}>
                                                    <TableCell className="text-xs font-mono truncate max-w-[140px]">{c.key.replace('PATHWAY:', '')}</TableCell>
                                                    <TableCell className="text-right text-xs">{(c.overflowRate * 100).toFixed(0)}%</TableCell>
                                                    <TableCell className="text-right text-xs">{c.waitlisted}</TableCell>
                                                    <TableCell className="text-right text-xs">{c.allocated}</TableCell>
                                                    <TableCell className="text-right text-xs">{c.avgGpa}</TableCell>
                                                </TableRow>
                                            ))}
                                            {insightsData.competitivePathways.length === 0 && (
                                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-6">No pathway competition data yet</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Round Summary by Type</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {['PATHWAY', 'SPECIALIZATION'].map(type => {
                                    const typeRounds = allRounds.filter((r: any) => r.type === type);
                                    const approved = typeRounds.filter((r: any) => r.status === 'APPROVED').length;
                                    const totalApps = typeRounds.reduce((sum: number, r: any) => sum + (r._count?.applications ?? 0), 0);
                                    return (
                                        <div key={type} className="p-3 rounded-lg border space-y-2">
                                            <div className="flex items-center justify-between">
                                                <TypeBadge type={type as RoundType} />
                                                <span className="text-xs text-muted-foreground">{typeRounds.length} rounds</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                <div><p className="font-bold text-lg">{typeRounds.length}</p><p className="text-muted-foreground">Total</p></div>
                                                <div><p className="font-bold text-lg text-green-600">{approved}</p><p className="text-muted-foreground">Approved</p></div>
                                                <div><p className="font-bold text-lg">{totalApps}</p><p className="text-muted-foreground">Applications</p></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Medal className="h-4 w-4 text-primary" />Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {allRounds.slice(0, 6).map((round: any) => (
                                        <div key={round.round_id} className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full flex-shrink-0 ${round.status === 'APPROVED' ? 'bg-blue-500' : round.status === 'OPEN' ? 'bg-green-500' : round.status === 'CLOSED' ? 'bg-amber-500' : 'bg-gray-300'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{round.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{round.academic_year?.label} · {round._count?.applications ?? 0} apps</p>
                                            </div>
                                            <StatusBadge status={round.status} />
                                        </div>
                                    ))}
                                    {allRounds.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Programs overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" />Configurable Slots</CardTitle>
                            <CardDescription>Programs and specializations available for selection rounds</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-purple-500" />Degree Pathways</h4>
                                    <div className="space-y-1.5">
                                        {programs.map((p: any) => (
                                            <div key={p.program_id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                                                <span className="font-mono font-medium">{p.code}</span>
                                                <span className="text-muted-foreground truncate max-w-[60%]">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Trophy className="h-3.5 w-3.5 text-cyan-500" />Specializations</h4>
                                    <div className="space-y-1.5">
                                        {specializations.map((s: any) => (
                                            <div key={s.specialization_id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                                                <span className="font-mono font-medium">{s.code}</span>
                                                <span className="text-muted-foreground truncate max-w-[60%]">{s.name}</span>
                                            </div>
                                        ))}
                                        {specializations.length === 0 && <p className="text-xs text-muted-foreground">No specializations configured</p>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ══ Create Round Dialog ══ */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="flex max-h-[85vh] w-full min-w-0 max-w-5xl flex-col gap-0 overflow-x-hidden overflow-y-hidden p-0 sm:max-w-5xl">
                    <div className="min-w-0 shrink-0 border-b px-6 pt-6 pb-4 pr-14">
                        <DialogHeader className="space-y-1 text-left">
                            <DialogTitle>New selection round</DialogTitle>
                            <DialogDescription>
                                Configure a pathway or specialization round. Slot dropdowns support long program names.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
                        <div className="min-w-0 space-y-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="min-w-0 space-y-1.5">
                                    <Label>Round Type *</Label>
                                    <Select value={newRound.type} onValueChange={v => { setNewRound(r => ({ ...r, type: v as RoundType })); setNewConfigs([]); }}>
                                        <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PATHWAY">Pathway Selection</SelectItem>
                                            <SelectItem value="SPECIALIZATION">Specialization Selection</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="min-w-0 space-y-1.5">
                                    <Label>Academic Year *</Label>
                                    <Select value={newRound.academic_year_id} onValueChange={v => setNewRound(r => ({ ...r, academic_year_id: v }))}>
                                        <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((y: any) => (
                                                <SelectItem key={y.academic_year_id} value={y.academic_year_id}>{y.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="min-w-0 space-y-1.5">
                                <Label>Round Label *</Label>
                                <Input className="min-w-0 max-w-full" placeholder="e.g. 2024/25 L2 Pathway Selection" value={newRound.label} onChange={e => setNewRound(r => ({ ...r, label: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="min-w-0 space-y-1.5">
                                    <Label>Target Level</Label>
                                    <Select value={newRound.level || '__none'} onValueChange={v => setNewRound(r => ({ ...r, level: v === '__none' ? '' : v }))}>
                                        <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none">Any level</SelectItem>
                                            <SelectItem value="L1">Level 1</SelectItem>
                                            <SelectItem value="L2">Level 2</SelectItem>
                                            <SelectItem value="L3">Level 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="min-w-0 space-y-1.5">
                                    <Label>Target Program</Label>
                                    <Select
                                        value={newRound.target_program_id || '__none'}
                                        onValueChange={v => setNewRound(r => ({ ...r, target_program_id: v === '__none' ? '' : v }))}
                                    >
                                        <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none">Any program</SelectItem>
                                            {programs.map((p: any) => (
                                                <SelectItem key={p.program_id} value={p.program_id}>
                                                    {p.code} — {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <Label>Selection Mode</Label>
                                    <Select value={newRound.selection_mode} onValueChange={v => setNewRound(r => ({ ...r, selection_mode: v }))}>
                                        <SelectTrigger className="h-auto min-h-10 w-full min-w-0 whitespace-normal py-2 text-left [&_[data-slot=select-value]]:line-clamp-3 [&_[data-slot=select-value]]:whitespace-normal">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-w-[min(90vw,40rem)]">
                                            <SelectItem className="whitespace-normal break-words py-2" value="AUTO">Auto — FIFO within capacity, GPA when over cap (recommended)</SelectItem>
                                            <SelectItem className="whitespace-normal break-words py-2" value="GPA">Always GPA-ranked (whole cohort)</SelectItem>
                                            <SelectItem className="whitespace-normal break-words py-2" value="FREE">Always FCFS (global order)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="min-w-0 space-y-1.5">
                                    <Label>Opens At</Label>
                                    <Input className="min-w-0 w-full max-w-full" type="datetime-local" value={newRound.opens_at} onChange={e => setNewRound(r => ({ ...r, opens_at: e.target.value }))} />
                                </div>
                                <div className="min-w-0 space-y-1.5">
                                    <Label>Closes At</Label>
                                    <Input className="min-w-0 w-full max-w-full" type="datetime-local" value={newRound.closes_at} onChange={e => setNewRound(r => ({ ...r, closes_at: e.target.value }))} />
                                </div>
                            </div>
                            <div className="min-w-0 space-y-1.5 max-w-md">
                                <Label>Post-approval change window (days)</Label>
                                <Input
                                    className="min-w-0"
                                    type="number"
                                    min={0}
                                    max={365}
                                    value={newRound.allocation_change_grace_days}
                                    onChange={e => setNewRound(r => ({ ...r, allocation_change_grace_days: Math.max(0, Number(e.target.value) || 0) }))}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Days after approval during which allocated students may submit a change request for HOD review (0 = none).
                                </p>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                    <div className="min-w-0 flex-1">
                                        <Label className="text-sm font-bold">
                                            {newRound.type === 'PATHWAY' ? 'Pathway Slots (Max Capacity)' : 'Specialization Slots (Min Threshold)'}
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {newRound.type === 'PATHWAY' ? 'Pathway closes when max is reached' : 'Warns if enrollment falls below minimum'}
                                        </p>
                                    </div>
                                    <Button type="button" size="sm" variant="outline" className="shrink-0 self-start" onClick={addConfig}><Plus className="h-3.5 w-3.5 mr-1" />Add Slot</Button>
                                </div>
                                {newConfigs.map((cfg, i) => (
                                    <div key={i} className="flex min-w-0 flex-col gap-3 rounded-lg border border-border/50 bg-muted/30 p-4 sm:flex-row sm:items-end sm:gap-3">
                                        <div className="min-w-0 flex-1">
                                            <Label className="text-[10px] text-muted-foreground mb-1.5 block">
                                                {newRound.type === 'PATHWAY' ? 'Pathway' : 'Specialization'}
                                            </Label>
                                            <Select value={cfg.program_id || cfg.spec_id || ''}
                                                onValueChange={v => {
                                                    if (newRound.type === 'PATHWAY') updateConfig(i, 'program_id', v);
                                                    else updateConfig(i, 'spec_id', v);
                                                }}>
                                                <SelectTrigger className="h-auto min-h-10 w-full min-w-0 text-xs text-left whitespace-normal py-2.5 [&_[data-slot=select-value]]:line-clamp-4 [&_[data-slot=select-value]]:whitespace-normal">
                                                    <SelectValue placeholder={newRound.type === 'PATHWAY' ? 'Select pathway…' : 'Select specialization…'} />
                                                </SelectTrigger>
                                                <SelectContent className="max-w-[min(90vw,42rem)]">
                                                    {newRound.type === 'PATHWAY'
                                                        ? programs.map((p: any) => (
                                                            <SelectItem key={p.program_id} className="whitespace-normal break-words py-2" value={p.program_id}>
                                                                <span className="font-mono text-[10px] text-muted-foreground">{p.code}</span>
                                                                {' — '}
                                                                <span>{p.name}</span>
                                                            </SelectItem>
                                                        ))
                                                        : specializations.map((s: any) => (
                                                            <SelectItem key={s.specialization_id} className="whitespace-normal break-words py-2" value={s.specialization_id}>
                                                                <span className="font-mono text-[10px] text-muted-foreground">{s.code}</span>
                                                                {' — '}
                                                                <span>{s.name}</span>
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs whitespace-nowrap text-muted-foreground">
                                                    {newRound.type === 'PATHWAY' ? 'Max cap' : 'Min'}
                                                </Label>
                                                <Input type="number" value={cfg.capacity} onChange={e => updateConfig(i, 'capacity', Number(e.target.value))}
                                                    className="h-9 w-20 text-xs" />
                                            </div>
                                            <Button type="button" size="sm" variant="ghost" onClick={() => removeConfig(i)} className="h-9 w-9 shrink-0 p-0" aria-label="Remove slot">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {newConfigs.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-3">No slots configured. Click &quot;Add Slot&quot; to start.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="min-w-0 shrink-0 border-t bg-muted/20 px-6 py-4">
                        <DialogFooter className="gap-2 sm:justify-end">
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                            <Button onClick={handleCreateRound} disabled={isPending}>
                                {isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Create round
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ══ Allocation review (before finalize) ══ */}
            <Dialog
                open={showAllocationReview}
                onOpenChange={open => {
                    setShowAllocationReview(open);
                    if (!open) setAllocationReviewAcknowledged(false);
                }}
            >
                <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col gap-0 overflow-hidden p-0">
                    <div className="px-6 pt-6 pb-3 space-y-3 shrink-0">
                        <DialogHeader>
                            <DialogTitle>Review all allocations</DialogTitle>
                            <DialogDescription className="text-xs leading-relaxed">
                                {roundDetail?.type === 'PATHWAY'
                                    ? 'Allocated students will have their official degree program set to the pathway shown in the last column. Waitlisted and pending students are unchanged until you move them or run allocation again.'
                                    : 'Allocated students will have their specialization set as shown. Confirm every row before approving.'}
                            </DialogDescription>
                        </DialogHeader>
                        {sum && (
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs font-normal">
                                    Total {sum.total}
                                </Badge>
                                <Badge className="text-xs bg-green-600">Allocated {sum.allocated}</Badge>
                                <Badge variant="outline" className="text-xs text-amber-800 border-amber-300">
                                    Waitlisted {sum.waitlisted}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    Pending {sum.pending}
                                </Badge>
                                {sum.rejected > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                        Rejected {sum.rejected}
                                    </Badge>
                                )}
                            </div>
                        )}
                        {sum && sum.pending > 0 && (
                            <Alert variant="destructive" className="py-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    {sum.pending} application(s) are still pending. They will not receive an allocation on
                                    approval until you run allocation or resolve them. You can still approve if that is intentional.
                                </AlertDescription>
                            </Alert>
                        )}

                        {sum && sum.waitlisted > 0 && roundDetail?.slotStats?.some((s: any) => s.allocated < s.capacity) && (
                            <Alert className="bg-blue-50 border-blue-200 py-3">
                                <Zap className="h-4 w-4 text-blue-600" />
                                <div className="flex-1 flex items-center justify-between gap-4">
                                    <AlertDescription className="text-xs text-blue-700 font-medium ml-2">
                                        There are {sum.waitlisted} students on the waitlist, and some pathways still have available seats.
                                        You can automatically move waitlisted students to these free pathways.
                                    </AlertDescription>
                                    <Button
                                        size="sm"
                                        onClick={handlePromoteWaitlist}
                                        disabled={isPending}
                                        className="h-7 text-[10px] bg-blue-600 hover:bg-blue-700 shrink-0"
                                    >
                                        Move to free pathways
                                    </Button>
                                </div>
                            </Alert>
                        )}
                    </div>
                    <div className="px-6 flex-1 min-h-0 flex flex-col border-y">
                        <ScrollArea className="h-[min(52vh,480px)]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-[10px] uppercase">Student</TableHead>
                                        <TableHead className="text-[10px] uppercase min-w-[120px]">Current degree</TableHead>
                                        <TableHead className="text-[10px] uppercase">1st</TableHead>
                                        <TableHead className="text-[10px] uppercase">2nd</TableHead>
                                        <TableHead className="text-[10px] uppercase">Status</TableHead>
                                        <TableHead className="text-[10px] uppercase min-w-[140px]">
                                            Outcome / allocation
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reviewSortedApps.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-10 text-sm">
                                                No applications in this round.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {reviewSortedApps.map((app: any) => {
                                        const slot1 = roundDetail?.slotStats?.find((s: any) => s.id === app.preference_1);
                                        const slot2 = roundDetail?.slotStats?.find((s: any) => s.id === app.preference_2);
                                        const allocSlot = roundDetail?.slotStats?.find((s: any) => s.id === app.allocated_to);
                                        let outcome = '—';
                                        if (app.status === 'ALLOCATED' && allocSlot) {
                                            outcome = `${allocSlot.label} (${allocSlot.code})`;
                                        } else if (app.status === 'WAITLISTED') {
                                            outcome = `Waitlisted on 1st choice: ${slot1?.code ?? app.preference_1?.slice(0, 8) ?? '—'}`;
                                        } else if (app.status === 'PENDING') {
                                            outcome = 'No allocation yet';
                                        } else if (app.status === 'REJECTED') {
                                            outcome = 'Rejected';
                                        }
                                        return (
                                            <TableRow key={app.app_id}>
                                                <TableCell className="text-xs align-top py-2">
                                                    <div className="font-medium">
                                                        {app.student?.firstName} {app.student?.lastName}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">{app.student?.email}</div>
                                                </TableCell>
                                                <TableCell className="text-xs align-top max-w-[180px] py-2">
                                                    {app.student?.student?.degree_path ? (
                                                        <>
                                                            <div className="font-medium leading-snug line-clamp-2">
                                                                {app.student.student.degree_path.name}
                                                            </div>
                                                            <div className="font-mono text-[10px] text-muted-foreground">
                                                                {app.student.student.degree_path.code}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs align-top py-2 font-mono">
                                                    {slot1?.code ?? app.preference_1?.slice(0, 8) ?? '—'}
                                                </TableCell>
                                                <TableCell className="text-xs align-top py-2 font-mono text-muted-foreground">
                                                    {slot2?.code ?? (app.preference_2 ? app.preference_2.slice(0, 8) : '—')}
                                                </TableCell>
                                                <TableCell className="align-top py-2">
                                                    {app.status === 'ALLOCATED' && (
                                                        <Badge className="bg-green-600 text-[9px] h-5">Allocated</Badge>
                                                    )}
                                                    {app.status === 'WAITLISTED' && (
                                                        <Badge variant="outline" className="text-amber-700 border-amber-300 text-[9px] h-5">
                                                            #{app.waitlist_pos ?? '—'} Wait
                                                        </Badge>
                                                    )}
                                                    {app.status === 'PENDING' && (
                                                        <Badge variant="secondary" className="text-[9px] h-5">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                    {app.status === 'REJECTED' && (
                                                        <Badge variant="destructive" className="text-[9px] h-5">
                                                            Rejected
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs align-top py-2 leading-snug">{outcome}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                    <div className="px-6 py-4 space-y-3 shrink-0 bg-muted/20">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="allocation-review-ack"
                                checked={allocationReviewAcknowledged}
                                onCheckedChange={v => setAllocationReviewAcknowledged(v === true)}
                                className="mt-0.5"
                            />
                            <label
                                htmlFor="allocation-review-ack"
                                className="text-sm text-muted-foreground leading-snug cursor-pointer select-none"
                            >
                                I have reviewed this list and the slot totals for this round. I am ready to approve and
                                write outcomes to student records.
                            </label>
                        </div>
                        <DialogFooter className="gap-2 sm:justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowAllocationReview(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={!allocationReviewAcknowledged || isPending}
                                onClick={() => handleApprove(false)}
                            >
                                {isPending ? (
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                Approve and finalize
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ══ Approval Confirm (with viability warnings) ══ */}
            <Dialog open={showApprovalConfirm} onOpenChange={setShowApprovalConfirm}>
                <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-5 w-5" />Viability Warning</DialogTitle>
                        <DialogDescription>Some specializations are below their minimum student threshold.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        {approvalWarnings.map((w, i) => (
                            <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-700">{w}</p>
                            </div>
                        ))}
                        <p className="text-sm text-muted-foreground pt-2">
                            You can redistribute students on under-threshold specs to their second choice (where set), force-approve anyway, or go back and move students manually.
                        </p>
                    </div>
                    <DialogFooter className="gap-2 flex-col sm:flex-row sm:flex-wrap sm:justify-end">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => {
                                setShowApprovalConfirm(false);
                                setAllocationReviewAcknowledged(false);
                                setShowAllocationReview(true);
                            }}
                        >
                            Go back to allocation review
                        </Button>
                        <Button variant="secondary" className="w-full sm:w-auto" onClick={handleRedistributeSpecs} disabled={isPending}>
                            Redistribute under-threshold (2nd choice)
                        </Button>
                        <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600" onClick={() => handleApprove(true)} disabled={isPending}>
                            Force Approve Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ══ Move Student Dialog ══ */}
            <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move Student</DialogTitle>
                        <DialogDescription>
                            Manually allocate {selectedApp?.student?.firstName} {selectedApp?.student?.lastName} to a specific slot.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Target Slot</Label>
                            <Select value={moveTarget} onValueChange={setMoveTarget}>
                                <SelectTrigger><SelectValue placeholder="Select target..." /></SelectTrigger>
                                <SelectContent>
                                    {roundDetail?.slotStats?.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.code} — {s.label} ({s.allocated}/{s.capacity} filled)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMoveDialog(false)}>Cancel</Button>
                        <Button onClick={handleMoveStudent} disabled={!moveTarget || isPending}>Move Student</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
