'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GraduationCap, CheckCircle, ArrowRight, Loader2, Star, Info, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getAvailableSpecializedPaths, selectSpecializedPath } from '@/lib/actions/academic-path-actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

export function PathwaySelectionClient() {
    const [paths, setPaths] = useState<any[]>([]);
    const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [deadline, setDeadline] = useState<Date | null>(null);
    const [isReSelection, setIsReSelection] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const res = await getAvailableSpecializedPaths();
                setDeadline(res.closingDate ? new Date(res.closingDate) : null);
                
                if (res.status === 'COMPLETED') {
                    setCompleted(true);
                } else {
                    setPaths(res.paths);
                    if (res.currentSelectionId) {
                        setSelectedPathId(res.currentSelectionId);
                        if (res.isLocked) {
                            setIsReSelection(true);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load specialization options.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleConfirm = async () => {
        if (!selectedPathId) return;

        setProcessing(true);
        try {
            const res = await selectSpecializedPath(selectedPathId);
            if (res.success) {
                toast.success(isReSelection ? "Degree specialization updated!" : "Degree specialization confirmed!");
                // Refresh data instead of switching views
                const freshData = await getAvailableSpecializedPaths();
                setPaths(freshData.paths);
                setIsReSelection(true);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (completed) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto py-12"
            >
                <Card className="text-center border-2 border-green-500/20 bg-green-500/5">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-700">Selection Finalized</CardTitle>
                        <CardDescription className="text-green-600/80">
                            Your academic path has been successfully updated. Your degree program is now locked for your specialized years.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center flex-col gap-4">
                        <Button color="success" className="w-full" asChild>
                            <a href="/dashboard/student">Go to Dashboard</a>
                        </Button>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Decision Processed Securely</p>
                    </CardFooter>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                    <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Select Your Academic Pathway</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Based on your current performance and the academic calendar, you are now eligible to choose your specialized degree for Level 2 and beyond.
                    </p>
                </div>
                <Badge variant="outline" className="px-4 py-1 text-xs uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                    {isReSelection ? "Change Requested: Selection Window Open" : "Action Required: Mandatory Choice"}
                </Badge>

                {deadline && (
                    <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-2 text-sm font-bold bg-zinc-900 text-white px-6 py-3 rounded-full shadow-xl">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>Deadline: {format(deadline, 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold bg-primary/10 text-primary px-6 py-3 rounded-full border border-primary/20">
                            <Info className="h-4 w-4" />
                            <span>Batch Quota: 60% (~{paths[0]?.selectionStats?.quota} seats)</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid gap-6">
                <RadioGroup 
                    value={selectedPathId || ''} 
                    onValueChange={setSelectedPathId}
                    className="grid gap-6 md:grid-cols-2"
                >
                    {paths.map((path) => (
                        <div key={path.program_id}>
                            <RadioGroupItem
                                value={path.program_id}
                                id={path.program_id}
                                className="peer sr-only"
                            />
                            <Label
                                htmlFor={path.program_id}
                                className="flex flex-col h-full items-start justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                            >
                                <div className="space-y-4 w-full">
                                    <div className="flex justify-between items-start">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Star className={`h-5 w-5 ${selectedPathId === path.program_id ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {path.selectionStats?.mode === 'GPA_PRIORITY' ? (
                                                <Badge variant="destructive" className="animate-pulse flex items-center gap-1 text-[10px] uppercase font-black">
                                                    Competitive (GPA Priority)
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 border-green-500/20 bg-green-500/5 text-[10px] uppercase font-black">
                                                    Open (Free Selection)
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-xl leading-tight">{path.name}</h3>
                                            {selectedPathId === path.program_id && (
                                                <Badge 
                                                    variant={path.selectionStats?.status === 'WAITLISTED' ? 'secondary' : 'default'}
                                                    className="shadow-sm"
                                                >
                                                    {path.selectionStats?.status === 'WAITLISTED' ? 'Waitlisted' : 'Provisionally Accepted'}
                                                </Badge>
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] font-mono">{path.code}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {path.description || "This specialized pathway focuses on advanced concepts in Management and Information Technology."}
                                    </p>

                                    {/* Demand Bar */}
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                            <span className="text-muted-foreground">Batch Demand</span>
                                            <span className={path.selectionStats?.demandPercentage > 85 ? 'text-red-500' : 'text-primary'}>
                                                {path.selectionStats?.applicantCount} / {path.selectionStats?.quota} Seats
                                            </span>
                                        </div>
                                        <Progress value={path.selectionStats?.demandPercentage} className="h-1.5" />
                                        
                                        {path.selectionStats?.rank && (
                                            <div className="flex items-center gap-2 mt-2 py-2 px-3 bg-muted/40 rounded-lg border border-muted-foreground/10">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase flex-1">Your Rank in Batch</div>
                                                <div className="text-sm font-black flex items-center gap-1.5">
                                                    #{path.selectionStats.rank}
                                                    {path.selectionStats.status === 'WAITLISTED' && (
                                                        <span className="text-[10px] text-red-500">(Waitlisted)</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t w-full flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Level 2 - Level 4</span>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${selectedPathId === path.program_id ? 'bg-primary text-white' : 'bg-muted'}`}>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>

                {paths.length === 0 && (
                    <div className="text-center py-20 border rounded-xl bg-muted/5 border-dashed">
                        <Info className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No pathways currently available</h3>
                        <p className="text-sm text-muted-foreground">Please contact your academic advisor if you believe this is an error.</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center gap-6 pt-10 border-t">
                <div className="flex items-center gap-4 max-w-lg bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl shadow-sm">
                    <AlertTriangle className="h-10 w-10 flex-shrink-0" />
                    <p className="text-sm font-medium">
                        <b>Important:</b> This selection is permanent. Once you finalize your degree path, it will be used for all future module registrations and cannot be changed without formal HOD approval.
                    </p>
                </div>

                <div className="flex gap-4 w-full max-w-md">
                    <Button 
                        variant="outline" 
                        size="lg" 
                        className="flex-1"
                        asChild
                    >
                        <a href="/dashboard/student">Cancel</a>
                    </Button>
                    <Button 
                        size="lg" 
                        className="flex-1 font-bold shadow-lg shadow-primary/20 h-12 rounded-xl"
                        disabled={!selectedPathId || processing}
                        onClick={handleConfirm}
                    >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        {isReSelection ? "Update Selection" : "Finalize Selection"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

