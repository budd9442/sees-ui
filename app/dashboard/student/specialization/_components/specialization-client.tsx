'use client';

import { useState, useTransition, useEffect } from 'react';
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
    ShieldCheck 
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
    const [isPending, startTransition] = useTransition();
    const [loadingAI, setLoadingAI] = useState(false);
    const [aiAdvice, setAIAdvice] = useState<any>(null);
    const [selectedSpec, setSelectedSpec] = useState<string | null>(currentSpecialization?.code || null);

    const fetchSenseiAdvise = async () => {
        setLoadingAI(true);
        try {
            const advice = await getSpecializationGuidance();
            if (advice.isEligible) {
                setAIAdvice(advice);
                toast.success("Specialization Sensei analysis complete.");
            } else {
                toast.error(advice.message);
            }
        } catch (err) {
            toast.error("Failed to connect to the Specialization Sensei.");
        } finally {
            setLoadingAI(false);
        }
    };

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
    const radarData = aiAdvice ? [
        { subject: 'Technical', A: aiAdvice.skill_vector.Technical, fullMark: 100 },
        { subject: 'Strategic', A: aiAdvice.skill_vector.Strategic, fullMark: 100 },
        { subject: 'Operations', A: aiAdvice.skill_vector.Operations, fullMark: 100 },
        { subject: 'Analytics', A: 90, fullMark: 100 }
    ] : [
        { subject: 'Technical', A: 60, fullMark: 100 },
        { subject: 'Strategic', A: 60, fullMark: 100 },
        { subject: 'Operations', A: 60, fullMark: 100 },
        { subject: 'Process', A: 60, fullMark: 100 },
        { subject: 'Analytics', A: 60, fullMark: 100 }
    ];

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
                                Specialization Sensei
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
                                <Button className="w-full" onClick={fetchSenseiAdvise}>
                                    Run Sensei Analysis
                                </Button>
                            )}
                            {loadingAI && <Button disabled className="w-full"><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</Button>}

                            {aiAdvice && (
                                <div className="p-4 bg-white/50 rounded-xl space-y-3 border border-primary/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">Match Found</span>
                                        <Badge variant="default" className="bg-primary">{aiAdvice.fit_score}% Fit</Badge>
                                    </div>
                                    <h4 className="text-xl font-bold text-primary">{aiAdvice.recommended_specialization} Branch</h4>
                                    <p className="text-xs italic text-muted-foreground">"{aiAdvice.insight}"</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Specialization Options */}
                <div className="lg:col-span-2 space-y-6">
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
                                            <Badge className="bg-orange-500 text-[10px]">Sensei Choice</Badge>
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
                        <Card className="bg-amber-50/50 border-amber-200">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Target className="h-5 w-5 text-amber-600" />
                                    <p className="text-sm font-medium">Ready to lock in <strong>{selectedSpec}</strong> as your permanent specialization?</p>
                                </div>
                                <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleConfirmSelection} disabled={isPending}>
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Specialization"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
