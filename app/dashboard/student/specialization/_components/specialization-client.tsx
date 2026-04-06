'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { updateStudentSpecialization } from '@/lib/actions/student-subactions';

interface Specialization {
    id: string;
    name: string;
    description: string;
    count: number;
    capacity: number;
    isFull?: boolean;
}

interface SpecializationClientProps {
    initialData: {
        specializations: Specialization[];
        currentSpecialization: string | null;
    }
}

export default function SpecializationClient({ initialData }: SpecializationClientProps) {
    const { specializations, currentSpecialization } = initialData;
    const [selected, setSelected] = useState<string | null>(currentSpecialization);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSelect = (id: string) => {
        if (isPending) return;
        setSelected(id);
    };

    const handleConfirm = async () => {
        if (!selected || isPending) return;
        
        const targetSpec = specializations.find(s => s.id === selected);
        if (targetSpec?.isFull && selected !== currentSpecialization) {
            toast.error("This specialization is currently full.");
            return;
        }

        try {
            await updateStudentSpecialization(selected);
            toast.success(`Specialization confirmed: ${selected}`);
            startTransition(() => {
                router.refresh();
            });
        } catch (e: any) {
            // Extract meaningful error message
            const errorMessage = e.message || "Failed to update specialization";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <PageHeader 
                title="Specialization Selection" 
                description="Select your preferred specialization for the MIT degree program. Please note that specializations have limited capacity." 
            />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {specializations.map((spec) => {
                    const isSelected = selected === spec.id;
                    const wasSelected = currentSpecialization === spec.id;
                    const isCurrentlyEnrolled = wasSelected;
                    
                    // Live preview of count if they were to switch
                    const liveCount = spec.count + (isSelected && !wasSelected ? 1 : !isSelected && wasSelected ? -1 : 0);
                    const percentage = Math.min(100, Math.round((liveCount / spec.capacity) * 100));
                    const isFull = spec.isFull && !isCurrentlyEnrolled;

                    return (
                        <Card 
                            key={spec.id} 
                            className={`transition-all duration-200 ${
                                isSelected 
                                    ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
                                    : 'hover:border-primary/50 hover:shadow-md'
                            } ${isFull ? 'opacity-75 grayscale-[0.2]' : ''}`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold">{spec.name}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                                                {spec.id}
                                            </Badge>
                                            {isCurrentlyEnrolled && (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                                    Current
                                                </Badge>
                                            )}
                                            {isSelected && !isCurrentlyEnrolled && (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                    Selected
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {isFull && <Badge variant="destructive" className="animate-pulse">Full</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                                    {spec.description}
                                </p>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>Current Enrollment</span>
                                        </div>
                                        <span className={isFull ? 'text-destructive' : ''}>
                                            {liveCount} / {spec.capacity}
                                        </span>
                                    </div>
                                    <Progress
                                        value={percentage}
                                        className={`h-2 ${
                                            isFull 
                                                ? '[&>div]:bg-destructive' 
                                                : percentage >= 90 
                                                    ? '[&>div]:bg-orange-500' 
                                                    : '[&>div]:bg-primary'
                                        }`}
                                    />
                                </div>

                                <Button
                                    className="w-full font-semibold transition-all"
                                    variant={isSelected ? 'default' : 'outline'}
                                    onClick={() => handleSelect(spec.id)}
                                    disabled={(isFull && !isSelected) || isPending}
                                >
                                    {isCurrentlyEnrolled 
                                        ? 'Keep Current' 
                                        : isSelected 
                                            ? 'Selected' 
                                            : isFull 
                                                ? 'Capacity Reached' 
                                                : 'Select Specialization'}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {selected !== currentSpecialization && (
                <div className="mt-12 flex justify-center sticky bottom-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Card className="border-primary shadow-2xl bg-background/95 backdrop-blur-md border-2 max-w-lg w-full">
                        <CardContent className="py-5 px-6 flex items-center justify-between gap-8">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Confirm Selection</p>
                                <p className="text-sm font-semibold">
                                    Switch to <span className="text-primary underline decoration-2 underline-offset-4">{selected}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelected(currentSpecialization)}
                                    disabled={isPending}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleConfirm} 
                                    disabled={isPending}
                                    size="lg"
                                    className="px-8 shadow-inner hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {isPending ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                            Saving...
                                        </span>
                                    ) : (
                                        'Confirm & Save'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
