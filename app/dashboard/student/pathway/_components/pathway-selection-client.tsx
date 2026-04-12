'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GraduationCap, CheckCircle, ArrowRight, Loader2, Star, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getAvailableSpecializedPaths, selectSpecializedPath } from '@/lib/actions/academic-path-actions';
import { motion, AnimatePresence } from 'framer-motion';

export function PathwaySelectionClient() {
    const [paths, setPaths] = useState<any[]>([]);
    const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const data = await getAvailableSpecializedPaths();
                setPaths(data);
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
                toast.success("Degree specialization confirmed!");
                setCompleted(true);
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
                    Action Required: Mandatory Choice
                </Badge>
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
                                        {selectedPathId === path.program_id && (
                                            <Badge className="bg-primary text-primary-foreground animate-in zoom-in h-5 px-2">Selected</Badge>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl leading-tight">{path.name}</h3>
                                        <Badge variant="secondary" className="text-[10px] font-mono">{path.code}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {path.description || "This specialized pathway focuses on advanced concepts in Management and Information Technology, preparing you for high-impact roles in the global tech ecosystem."}
                                    </p>
                                </div>
                                <div className="mt-8 pt-8 border-t w-full flex items-center justify-between">
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
                        className="flex-1 font-bold shadow-lg shadow-primary/20"
                        disabled={!selectedPathId || processing}
                        onClick={handleConfirm}
                    >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Finalize Selection
                    </Button>
                </div>
            </div>
        </div>
    );
}

function AlertTriangle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}
