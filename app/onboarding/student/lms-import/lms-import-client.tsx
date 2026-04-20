'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';

type LmsImportStatus = 'NOT_STARTED' | 'RUNNING' | 'PREVIEW_READY' | 'COMMITTED' | 'FAILED';
type LmsImportStage =
    | 'LOGIN'
    | 'FETCH_YEAR_1'
    | 'FETCH_YEAR_2'
    | 'FETCH_YEAR_3'
    | 'FETCH_YEAR_4'
    | 'MATCHING'
    | 'READY';

function stageLabel(stage: LmsImportStage | string | null) {
    switch (stage) {
        case 'LOGIN':
            return 'Logging in to LMS...';
        case 'FETCH_YEAR_1':
            return 'Fetching Year 1 registration...';
        case 'FETCH_YEAR_2':
            return 'Fetching Year 2 registration...';
        case 'FETCH_YEAR_3':
            return 'Fetching Year 3 registration...';
        case 'FETCH_YEAR_4':
            return 'Fetching Year 4 registration...';
        case 'MATCHING':
            return 'Matching modules into SEES catalogue...';
        case 'READY':
            return 'Preview ready.';
        default:
            return stage ? String(stage) : 'Starting...';
    }
}

export default function LmsImportClient() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [status, setStatus] = useState<LmsImportStatus | null>(null);
    const [stage, setStage] = useState<LmsImportStage | string | null>(null);
    const [progressPct, setProgressPct] = useState(0);
    const [preview, setPreview] = useState<any>(null);
    const [busy, setBusy] = useState(false);

    const isPreviewReady = status === 'PREVIEW_READY';
    const isFailed = status === 'FAILED';
    const canStart = !busy && !sessionId && username.trim().length > 0 && password.trim().length > 0;

    const skipForNow = async () => {
        if (busy) return;
        setBusy(true);
        try {
            const res = await fetch('/api/lms-import/skip', { method: 'POST', cache: 'no-store' });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || 'Failed to skip LMS import');
            }
            toast.message('Skipped LMS import for now.');
            router.replace('/dashboard/student');
        } catch (e: any) {
            toast.error(e.message || 'Failed to skip LMS import');
        } finally {
            setBusy(false);
        }
    };

    const statusText = useMemo(() => {
        if (!status) return '';
        if (status === 'RUNNING') return 'Import in progress...';
        if (status === 'PREVIEW_READY') return 'Preview ready.';
        if (status === 'COMMITTED') return 'Import committed.';
        if (status === 'FAILED') return 'Import failed.';
        return String(status);
    }, [status]);

    useEffect(() => {
        if (!sessionId) return;

        let stopped = false;
        let interval: ReturnType<typeof setInterval> | null = null;
        const poll = async () => {
            try {
                const res = await fetch(`/api/lms-import/session/${sessionId}`, { cache: 'no-store' });
                if (!res.ok) throw new Error(`Failed to load session: ${res.status}`);
                const data = await res.json();
                if (stopped) return;

                setStatus(data.status);
                setStage(data.stage);
                setProgressPct(Number(data.progress_pct ?? 0));
                if (data.preview) setPreview(data.preview);

                if (data.status === 'PREVIEW_READY' || data.status === 'FAILED') {
                    // Stop polling.
                    if (interval) clearInterval(interval);
                    interval = null;
                    return;
                }
            } catch (e: any) {
                console.error(e);
            }
        };

        interval = setInterval(() => {
            void poll();
        }, 1200);

        // Immediate first fetch.
        void poll();

        return () => {
            stopped = true;
            if (interval) clearInterval(interval);
            interval = null;
        };
    }, [sessionId]);

    const startPreview = async () => {
        if (!canStart) return;
        setBusy(true);
        try {
            const res = await fetch('/api/lms-import/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || 'Failed to start FIS import');
            }

            const data = await res.json();
            setSessionId(data.sessionId);
            setStatus('RUNNING');
            setStage('LOGIN');
            setProgressPct(5);
            toast.success('FIS import started. Fetching...');
        } catch (e: any) {
            toast.error(e.message || 'Failed to start FIS import');
        } finally {
            setBusy(false);
        }
    };

    const commitImport = async () => {
        if (!sessionId || status !== 'PREVIEW_READY') return;
        setBusy(true);
        try {
            const res = await fetch(`/api/lms-import/session/${sessionId}/commit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || 'Failed to commit import');
            }

            toast.success('FIS import committed successfully.');
            router.replace('/dashboard/student');
        } catch (e: any) {
            toast.error(e.message || 'Commit failed');
        } finally {
            setBusy(false);
        }
    };

    const previewSummary = preview?.inferred ? preview : null;

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logoutAction()}
                    className="text-muted-foreground hover:text-destructive flex items-center gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Log Out
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Import Module Registrations from Faculty Information system</CardTitle>
                    <CardDescription>
                        Enter your FIS password to sync your module registrations and released grades into SEES.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!sessionId && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="lmsUsername">FIS Username</Label>
                                <Input
                                    id="lmsUsername"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your (Student Number)"
                                    autoComplete="username"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lmsPassword">FIS Password</Label>
                                <Input
                                    id="lmsPassword"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your FIS password"
                                    autoComplete="current-password"
                                />
                                <p className="text-xs text-muted-foreground font-medium">
                                    Your Faculty information system credentials are used only for this sync and are never stored.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button variant="secondary" type="button" disabled={busy} onClick={skipForNow}>
                                    Skip for now
                                </Button>
                                <Button disabled={!canStart} onClick={startPreview}>
                                    {busy ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        'Start FIS Import'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}

                    {sessionId && (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">{stageLabel(stage as any)}</div>
                                    <div className="text-sm text-muted-foreground">{progressPct}%</div>
                                </div>
                                <Progress value={progressPct} />
                                <div className="text-xs text-muted-foreground">{statusText}</div>
                            </div>

                            {isFailed && (
                                <div className="rounded-md border border-red-200 bg-red-50/10 p-3 text-sm text-red-700">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="mt-0.5 h-4 w-4" />
                                        <div>
                                            Import failed. Please refresh and try again.
                                            {preview?.error_message ? <div className="mt-2">{preview.error_message}</div> : null}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isPreviewReady && previewSummary && (
                                <div className="space-y-4 pt-3">
                                    <h3 className="text-base font-semibold">Preview Summary</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-md border p-3">
                                            <div className="text-xs text-muted-foreground">Inferred current level</div>
                                            <div className="text-sm font-medium">
                                                {previewSummary.inferred?.current_level ?? 'Unknown'}
                                            </div>
                                        </div>
                                        <div className="rounded-md border p-3">
                                            <div className="text-xs text-muted-foreground">Inferred pathway</div>
                                            <div className="text-sm font-medium">
                                                {previewSummary.inferred?.pathway_code ?? 'Unknown'}
                                            </div>
                                        </div>
                                        {previewSummary.inferred?.specialization_code ? (
                                            <div className="rounded-md border p-3">
                                                <div className="text-xs text-muted-foreground">Inferred specialization</div>
                                                <div className="text-sm font-medium">
                                                    {previewSummary.inferred.specialization_code}
                                                </div>
                                            </div>
                                        ) : null}
                                        <div className="rounded-md border p-3">
                                            <div className="text-xs text-muted-foreground">Released grades</div>
                                            <div className="text-sm font-medium">
                                                {previewSummary.stats?.released_grades_count ?? 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-md border p-3">
                                        <div className="text-xs text-muted-foreground">Imported modules by year</div>
                                        <div className="mt-2 space-y-2">
                                            {Object.entries(previewSummary.years ?? {}).map(([year, y]: [string, any]) => (
                                                <div key={year} className="space-y-2 rounded-md border p-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div>
                                                            Year {year}: matched {y.matched_count ?? 0} / {y.total_count ?? 0}
                                                        </div>
                                                        <div className="text-muted-foreground">released {y.released_count ?? 0}</div>
                                                    </div>

                                                    {Array.isArray(y.matched_modules) && y.matched_modules.length > 0 ? (
                                                        <div>
                                                            <div className="text-xs text-muted-foreground">Matched modules</div>
                                                            <div className="mt-1 space-y-1">
                                                                {y.matched_modules.slice(0, 8).map((m: any, idx: number) => (
                                                                    <div key={`${m.module_code ?? 'mod'}-${idx}`} className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0">
                                                                            <div className="truncate text-sm font-medium">
                                                                                {m.module_code ?? ''} {m.module_name ? `- ${m.module_name}` : ''}
                                                                            </div>
                                                                            {m.grade_letter ? (
                                                                                <div className="truncate text-xs text-muted-foreground">
                                                                                    Released grade: {m.grade_letter}
                                                                                </div>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {y.matched_modules.length > 8 ? (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        +{y.matched_modules.length - 8} more matched modules
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    ) : null}

                                                    {Array.isArray(y.unmatched_modules) && y.unmatched_modules.length > 0 ? (
                                                        <div>
                                                            <div className="text-xs text-muted-foreground">Unmatched modules</div>
                                                            <div className="mt-1 space-y-1">
                                                                {y.unmatched_modules.slice(0, 5).map((m: any, idx: number) => (
                                                                    <div key={`${m.lms_course_code ?? 'lms'}-${idx}`} className="text-sm text-muted-foreground">
                                                                        {m.lms_course_code ?? ''}{m.lms_course_name ? ` - ${m.lms_course_name}` : ''}
                                                                    </div>
                                                                ))}
                                                                {y.unmatched_modules.length > 5 ? (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        +{y.unmatched_modules.length - 5} more unmatched modules
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-muted-foreground">No unmatched modules.</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="secondary" type="button" disabled={busy} onClick={skipForNow}>
                                            Skip for now
                                        </Button>
                                        <Button onClick={commitImport} disabled={busy}>
                                            {busy ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Importing...
                                                </>
                                            ) : (
                                                'Confirm Import'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

