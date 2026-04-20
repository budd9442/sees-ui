'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2, Lightbulb, Mail, RefreshCw, ShieldAlert, TrendingDown } from 'lucide-react';
import { getAcademicRecoveryData, regenerateAcademicRecoveryPlan } from '@/lib/actions/monitoring-actions';
import { toast } from 'sonner';

export function AcademicRecoveryCard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        async function fetchSupport() {
            setLoading(true);
            try {
                const res = await getAcademicRecoveryData();
                if (res.dipDetected) {
                    // Check if *this specific* dip was dismissed in this session
                    const dismissedDip = sessionStorage.getItem('academic_recovery_dismissed_amount');
                    if (dismissedDip === res.trend.dipAmount.toString()) {
                        setDismissed(true);
                    } else {
                        setData(res);
                    }
                }
            } catch (err) {
                console.error('Monitoring check failed', err);
            } finally {
                setLoading(false);
            }
        }
        fetchSupport();
    }, []);

    if (loading || dismissed) return null;
    if (!data) return null;

    const { trend, advice, advisor } = data;

    const handleMessageAdvisor = () => {
        window.location.href = '/dashboard/student/messages?openAdvisorModal=1';
    };

    const handleDismiss = () => {
        setDismissed(true);
        if (data?.trend?.dipAmount) {
            sessionStorage.setItem('academic_recovery_dismissed_amount', data.trend.dipAmount.toString());
        }
    };

    const handleRegenerate = async () => {
        if (regenerating) return;
        setRegenerating(true);
        const tId = toast.loading('Regenerating support plan...');
        try {
            const newData = await regenerateAcademicRecoveryPlan();
            if (newData.dipDetected) {
                setData(newData);
                toast.success('Fresh recovery plan generated!', { id: tId });
            } else {
                toast.error('Could not regenerate plan.', { id: tId });
            }
        } catch (err) {
            console.error('Regeneration failed', err);
            toast.error('Failed to regenerate plan.', { id: tId });
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <>
            {/* Simple Horizontal Banner */}
            <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-amber-900 leading-none">Academic Support Required</p>
                                <p className="text-xs text-amber-800/80">A GPA dip has been detected. Please review your recovery plan.</p>
                            </div>
                            <Badge variant="outline" className="bg-white text-amber-700 border-amber-200">
                                -{trend.dipAmount.toFixed(2)} Dip
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-amber-700 hover:bg-amber-100/50">
                                Dismiss
                            </Button>
                            <Button size="sm" onClick={() => setOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                                View Plan
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-amber-600" />
                                Academic Recovery Plan
                            </DialogTitle>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleRegenerate} 
                                disabled={regenerating}
                                className="h-8 gap-2 text-muted-foreground hover:text-amber-600"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                                <span className="text-xs">Regenerate</span>
                            </Button>
                        </div>
                        <DialogDescription>
                            Guidance generated based on your latest academic performance.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <h4 className="text-sm font-semibold mb-2">Support Note</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                "{advice.message}"
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Recommended Actions
                            </h4>
                            <div className="grid gap-2">
                                {advice.recovery_actions.map((action: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 rounded-md border p-3 bg-white dark:bg-slate-900/50">
                                        <div className="text-xs font-bold text-muted-foreground mt-0.5">{i + 1}.</div>
                                        <p className="text-sm">{action}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {advisor ? (
                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4 bg-amber-50/20">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                        {advisor.firstName?.[0]}{advisor.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{advisor.firstName} {advisor.lastName}</p>
                                        <p className="text-xs text-muted-foreground">Academic Advisor</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" onClick={handleMessageAdvisor} className="gap-2">
                                    <Mail className="h-4 w-4" />
                                    Contact
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-amber-900">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                <p className="text-xs font-medium">No specific advisor assigned. Contact available staff from messaging.</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={() => setOpen(false)} className="bg-amber-600 hover:bg-amber-700 text-white">
                            I Understand
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
