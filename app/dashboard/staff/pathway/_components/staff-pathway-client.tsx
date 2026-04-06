'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { runPathwayAllocation } from '@/lib/actions/pathway-actions';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Play, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProgramStat {
    programId: string;
    code: string;
    name: string;
    pref1Count: number;
    pref2Count: number;
    capacity: number;
}

interface StaffPathwayClientProps {
    initialStats: ProgramStat[];
}

export function StaffPathwayClient({ initialStats }: StaffPathwayClientProps) {
    const [isPending, startTransition] = useTransition();
    const [stats, setStats] = useState(initialStats);
    const [result, setResult] = useState<{ totalProcessed: number; distribution: Record<string, number> } | null>(null);

    const handleRunAllocation = async () => {
        if (!confirm("Are you sure? This will permanently assign pathways for ALL Level 1 students and lock their selections.")) return;
        
        try {
            const res = await runPathwayAllocation();
            if (res.success) {
                toast.success("Allocation engine completed successfully!");
                setResult({
                    totalProcessed: res.totalProcessed,
                    distribution: res.distribution as Record<string, number>
                });
            }
        } catch (e: any) {
            toast.error(e.message || "Allocation failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {stats.map((prog) => {
                    const demand = Math.round((prog.pref1Count / prog.capacity) * 100);
                    return (
                        <Card key={prog.programId} className={demand > 100 ? 'border-red-500 ring-1 ring-red-500' : ''}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-xl font-bold">{prog.code}</CardTitle>
                                    <CardDescription>{prog.name}</CardDescription>
                                </div>
                                <Users className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">1st Preference</p>
                                        <p className="text-2xl font-bold">{prog.pref1Count}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">2nd Preference</p>
                                        <p className="text-2xl font-bold">{prog.pref2Count}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Demand vs. Capacity</span>
                                        <span className={demand > 100 ? 'text-red-500 font-bold' : ''}>
                                            {prog.pref1Count} / {prog.capacity} ({demand}%)
                                        </span>
                                    </div>
                                    <Progress 
                                        value={demand} 
                                        className={demand > 100 ? '[&>div]:bg-red-500' : demand > 80 ? '[&>div]:bg-orange-500' : ''} 
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Allocation Engine Trigger */}
            <Card className="bg-primary/5 border-dashed border-primary/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Play className="h-4 w-4 fill-primary text-primary" />
                        Allocation Engine
                    </CardTitle>
                    <CardDescription>
                        Running the engine will assign programs to students based on their 
                        <strong> GPA rank</strong> and <strong>Priority 1/2 selections</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive" className="border-orange-200 bg-orange-50/50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertTitle className="text-orange-800">Operational Notice</AlertTitle>
                        <AlertDescription className="text-orange-700">
                            Once run, students will no longer be able to change their preferences. 
                            The system will automatically lock all selections and update transcript records.
                        </AlertDescription>
                    </Alert>

                    <Button 
                        size="lg" 
                        className="w-full" 
                        onClick={handleRunAllocation} 
                        disabled={isPending}
                    >
                        {isPending ? 'Processing Allocation...' : 'Start Allocation Engine'}
                    </Button>
                </CardContent>
            </Card>

            {/* Results Display */}
            {result && (
                <Alert className="border-green-200 bg-green-50/50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Allocation Successful</AlertTitle>
                    <AlertDescription className="text-green-700">
                        Processed {result.totalProcessed} students.
                        <div className="mt-2 flex gap-4 font-mono text-sm">
                            {Object.entries(result.distribution).map(([pid, count]) => {
                                const prog = stats.find(s => s.programId === pid);
                                return <span key={pid}>{prog?.code || pid}: {count}</span>
                            })}
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
