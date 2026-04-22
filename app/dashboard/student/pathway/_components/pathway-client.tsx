 'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/layout/page-header';
import { CheckCircle, AlertTriangle, Lock, TrendingUp, Target, Info, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DegreeProgram } from '@/types';
import { submitPathwayPreferences, getPathwayGuidance } from '@/lib/actions/pathway-actions';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface PathwayClientProps {
    initialData: {
        currentStudent: {
            studentId: string;
            academicYear: string | null;
            degreeProgram: string;
            pathwayLocked: boolean;
            currentGPA: number;
            preference1: string | null;
            preference2: string | null;
        };
        pathwayDemand: {
            MIT: number;
            IT: number;
            mitCount: number;
            itCount: number;
            mitCapacity: number;
            itCapacity: number;
            totalStudents: number;
        };
        studentRank: number;
    }
}

export default function PathwayClient({ initialData }: PathwayClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasAutoRunTriggered = useRef(false);
    const [isPending, startTransition] = useTransition();
    const { currentStudent, pathwayDemand, studentRank } = initialData;

    // Use codes for selection state
    const [pref1, setPref1] = useState<string | null>(currentStudent.preference1 || null);
    const [pref2, setPref2] = useState<string | null>(currentStudent.preference2 || null);
    
    const [aiAdvice, setAIAdvice] = useState<any>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const isL1Student = currentStudent.academicYear === 'L1';
    const hasSelectedPathway = currentStudent.degreeProgram === 'MIT' || currentStudent.degreeProgram === 'IT';
    const isLocked = currentStudent.pathwayLocked;

    const mitDemand = pathwayDemand.MIT;
    const itDemand = pathwayDemand.IT;
    const mitCount = pathwayDemand.mitCount;
    const itCount = pathwayDemand.itCount;
    const mitCapacity = pathwayDemand.mitCapacity;
    const itCapacity = pathwayDemand.itCapacity;
    const mitOversubscribed = mitCount >= mitCapacity;
    const itOversubscribed = itCount >= itCapacity;
    const totalStudents = pathwayDemand.totalStudents;

    const pathwayData = {
        MIT: {
            code: 'MIT' as DegreeProgram,
            name: 'Management and Information Technology',
            fullName: 'B.Sc. Honours in Management and Information Technology',
            description: 'A comprehensive program that combines business management principles with advanced IT skills, preparing students for leadership roles in technology-driven organizations.',
            detailedDescription: 'This pathway integrates management theory with practical IT applications, focusing on how technology can drive business success. Students learn to bridge the gap between technical teams and business stakeholders.',

            // Academic Structure
            totalCredits: 132,
            duration: '4 years',
            level: 'Level 6 Honours Degree',

            // Specializations
            specializations: [
                {
                    code: 'BSE',
                    name: 'Business Systems Engineering',
                    description: 'Focus on designing and implementing business systems, ERP solutions, and process optimization.',
                    coreModules: ['MGTE 31293', 'MGTE 31403', 'MGTE 31423', 'MGTE 41333', 'MGTE 42213'],
                    careerPaths: ['Business Systems Analyst', 'ERP Consultant', 'Process Engineer', 'Systems Integration Specialist']
                },
                {
                    code: 'OSCM',
                    name: 'Operations and Supply Chain Management',
                    description: 'Specialize in logistics, supply chain optimization, and operations management.',
                    coreModules: ['MGTE 31413', 'MGTE 31303', 'MGTE 41343', 'MGTE 42323'],
                    careerPaths: ['Supply Chain Manager', 'Logistics Coordinator', 'Operations Analyst', 'Procurement Specialist']
                },
                {
                    code: 'IS',
                    name: 'Information Systems',
                    description: 'Focus on information systems design, data analytics, and IT infrastructure management.',
                    coreModules: ['INTE 31423', 'INTE 31413', 'INTE 31393', 'INTE 41283', 'MGTE 41303'],
                    careerPaths: ['Information Systems Manager', 'Data Analyst', 'IT Infrastructure Manager', 'Business Intelligence Specialist']
                }
            ],

            // Career Information
            careerPaths: [
                'IT Manager', 'Business Analyst', 'Systems Analyst', 'ERP Consultant',
                'Project Manager', 'Digital Transformation Specialist', 'Technology Consultant',
                'Business Intelligence Analyst', 'Enterprise Architect', 'IT Strategy Manager'
            ],

            // Key Modules by Year
            keyModules: {
                L2: ['INTE 21213', 'INTE 21313', 'INTE 21323', 'INTE 21333', 'MGTE 21243', 'MGTE 21233'],
                L3: ['INTE 31356', 'MGTE 31393', 'MGTE 31373', 'GNCT 32216'],
                L4: ['MGTE 41323', 'MGTE 41313', 'INTE 43216b', 'MGTE 43216b']
            },

            // Industry Insights
            industryInsights: {
                growth: 'High',
                salaryRange: 'LKR 80,000 - 200,000+',
                demand: 'Very High',
                sectors: ['Technology', 'Finance', 'Manufacturing', 'Consulting', 'Government']
            },

            // Skills Developed
            skills: [
                'Business Process Analysis', 'Systems Design', 'Project Management',
                'Data Analysis', 'Strategic Planning', 'Change Management',
                'Technology Integration', 'Process Optimization'
            ]
        },

        IT: {
            code: 'IT' as DegreeProgram,
            name: 'Information Technology',
            fullName: 'B.Sc. Honours in Information Technology',
            description: 'A technical-focused program emphasizing software development, systems design, and technology innovation for students passionate about computing and programming.',
            detailedDescription: 'This pathway provides deep technical knowledge in computing, software engineering, and technology development. Students gain hands-on experience with modern technologies and development practices.',

            // Academic Structure
            totalCredits: 132,
            duration: '4 years',
            level: 'Level 6 Honours Degree',

            // No specializations for IT
            specializations: [],

            // Career Information
            careerPaths: [
                'Software Engineer', 'Systems Developer', 'Network Administrator', 'Database Administrator',
                'Web Developer', 'Mobile App Developer', 'DevOps Engineer', 'Cybersecurity Specialist',
                'Cloud Solutions Architect', 'Technical Lead', 'Software Architect'
            ],

            // Key Modules by Year
            keyModules: {
                L2: ['INTE 21213', 'INTE 21313', 'INTE 21323', 'INTE 21333', 'INTE 21343'],
                L3: ['INTE 31356', 'INTE 22343', 'INTE 22303', 'INTE 22283', 'GNCT 32216'],
                L4: ['INTE 43216b', 'MGTE 43216b']
            },

            // Industry Insights
            industryInsights: {
                growth: 'Very High',
                salaryRange: 'LKR 70,000 - 250,000+',
                demand: 'Extremely High',
                sectors: ['Software Development', 'Fintech', 'E-commerce', 'Gaming', 'Startups', 'Multinational Companies']
            },

            // Skills Developed
            skills: [
                'Programming', 'Software Architecture', 'Database Design', 'Web Development',
                'Mobile Development', 'System Administration', 'Network Management',
                'Cybersecurity', 'Cloud Computing', 'DevOps Practices'
            ]
        }
    };

    const handleSelectPathway = (pathway: string, rank: 1 | 2) => {
        if (isLocked) {
            toast.error('Pathway selection is locked');
            return;
        }

        if (rank === 1) {
            if (pathway === pref2) setPref2(null);
            setPref1(pathway);
        } else {
            if (pathway === pref1) {
                toast.error("You cannot select the same program for both preferences.");
                return;
            }
            setPref2(pathway);
        }
    };

    const handleConfirmPathway = async () => {
        if (!pref1 || !pref2) {
            toast.error("Please select both a 1st and 2nd choice.");
            return;
        }
        
        try {
            await submitPathwayPreferences({ 
                preference1: pref1, 
                preference2: pref2 
            });
            toast.success(`Preferences submitted successfully!`);
            startTransition(() => {
                router.refresh();
            });
        } catch (e: any) {
            toast.error(e.message || "Failed to submit preferences");
        }
    };
    const fetchAIAdvice = useCallback(async () => {
        setLoadingAI(true);
        try {
            const advice = await getPathwayGuidance();
            if (advice.isEligible && advice.hasRequiredPreferences === false) {
                setAIAdvice(null);
                toast.error(advice.message || 'Complete pathway preferences first.');
                const returnTo = encodeURIComponent('/dashboard/student/pathway?autorun=1');
                router.push(`/dashboard/student/pathway-preferences?next=${returnTo}`);
            } else if (advice.isEligible) {
                setAIAdvice(advice);
                if (advice.decision_source === 'GROK') {
                    toast.success('Pathway guidance complete (Grok).');
                } else {
                    toast.warning('Guidance completed using fallback logic.');
                }
            } else {
                toast.error(advice.message || 'Unable to run pathway guidance.');
            }
        } catch (err) {
            toast.error("Failed to connect to the AI Counselor.");
        } finally {
            setLoadingAI(false);
        }
    }, [router]);

    useEffect(() => {
        if (aiAdvice || loadingAI || hasAutoRunTriggered.current) return;
        if (searchParams.get('autorun') !== '1') return;
        hasAutoRunTriggered.current = true;
        void fetchAIAdvice();
    }, [aiAdvice, fetchAIAdvice, loadingAI, searchParams]);

    if (!isL1Student) {
        return (
            <div>
                <PageHeader
                    title="Pathway Selection"
                    description="View your selected pathway"
                />
                <Alert>
                    <AlertDescription>
                        Pathway selection is only available for L1 students. You have already selected: <strong>{currentStudent.degreeProgram}</strong>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const skillVector = aiAdvice?.skill_vector || {};
    const radarData = aiAdvice ? [
        { subject: 'Technical', A: Number(skillVector.Technical ?? 60), fullMark: 100 },
        { subject: 'Strategic', A: Number(skillVector.Strategic ?? 60), fullMark: 100 },
        { subject: 'Operations', A: Number(skillVector.Operations ?? 60), fullMark: 100 },
    ] : [
        { subject: 'Technical', A: 60, fullMark: 100 },
        { subject: 'Strategic', A: 60, fullMark: 100 },
        { subject: 'Operations', A: 60, fullMark: 100 },
    ];
    const fitScore = Number(aiAdvice?.fit_score ?? 0);
    const confidence = fitScore >= 75 ? 'High' : fitScore >= 50 ? 'Medium' : 'Emerging';

    return (
        <div className="space-y-6">

            {/* Status Alert */}
            {isLocked ? (
                <Alert className="mb-6 border-blue-500 bg-blue-50">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        Your pathway selection is locked. You have selected: <strong>{currentStudent.degreeProgram}</strong>
                    </AlertDescription>
                </Alert>
            ) : hasSelectedPathway ? (
                <Alert className="mb-6 border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        You have selected <strong>{currentStudent.degreeProgram}</strong>. You can still change your selection until the deadline.
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert className="mb-6 border-amber-500 bg-amber-50">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                        <strong>Important Decision:</strong> Choose your pathway carefully. This choice will determine your L2-L4 curriculum and career opportunities. Use the guidance below to make an informed decision.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
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
                                    <Button className="w-full" onClick={fetchAIAdvice}>
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
                            {loadingAI && <Button disabled className="w-full"><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</Button>}

                            {aiAdvice && (
                                <div className="p-4 bg-white/50 rounded-xl space-y-3 border border-primary/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">Recommendation</span>
                                        <Badge variant="default" className="bg-primary">{confidence} Confidence</Badge>
                                    </div>
                                    <h4 className="text-xl font-bold text-primary">{aiAdvice.primary_recommendation} Pathway</h4>
                                    <p className="text-xs italic text-muted-foreground">"{aiAdvice.insight}"</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Confidence improves as more academic results and profile signals become available.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Select Pathway Preferences
                            </CardTitle>
                            <CardDescription>
                                Keep AI guidance as support, then submit your final 1st and 2nd choices.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                {Object.values(pathwayData).map((pathway) => {
                                    const isPref1 = pref1 === pathway.code;
                                    const isPref2 = pref2 === pathway.code;
                                    const initialCount = pathway.code === 'MIT' ? mitCount : itCount;
                                    const initialWasP1 = currentStudent.preference1 === pathway.code;
                                    const isP1Now = pref1 === pathway.code;
                                    const liveCount = initialCount + (isP1Now && !initialWasP1 ? 1 : !isP1Now && initialWasP1 ? -1 : 0);
                                    const capacity = pathway.code === 'MIT' ? mitCapacity : itCapacity;
                                    const percentage = Math.min(100, Math.round((liveCount / capacity) * 100));

                                    return (
                                        <Card
                                            key={pathway.code}
                                            className={`border-2 ${isPref1 ? 'border-primary bg-primary/5' : isPref2 ? 'border-secondary bg-muted/40' : 'border-muted'}`}
                                        >
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg">{pathway.code}</CardTitle>
                                                <CardDescription className="text-[11px] leading-tight">{pathway.name}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <p className="text-[11px] text-muted-foreground">{pathway.description}</p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span>Demand</span>
                                                        <span>{liveCount} / {capacity}</span>
                                                    </div>
                                                    <Progress value={percentage} />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={isPref1 ? 'default' : 'outline'}
                                                        onClick={() => handleSelectPathway(pathway.code, 1)}
                                                        disabled={isLocked}
                                                    >
                                                        1st
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={isPref2 ? 'secondary' : 'outline'}
                                                        onClick={() => handleSelectPathway(pathway.code, 2)}
                                                        disabled={isLocked}
                                                    >
                                                        2nd
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <Card className="bg-amber-50/50 border-amber-200">
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <p className="text-sm">
                                        1st: <strong>{pref1 ?? '—'}</strong> · 2nd: <strong>{pref2 ?? '—'}</strong>
                                    </p>
                                    <Button onClick={handleConfirmPathway} disabled={isPending || !pref1 || !pref2 || isLocked}>
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save preferences'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* GPA Ranking (if oversubscribed) */}
            {(mitOversubscribed || itOversubscribed) && (
                <Card className="mb-6 border-orange-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            Your GPA Ranking
                        </CardTitle>
                        <CardDescription>
                            Your position for oversubscribed pathway allocation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Your GPA</p>
                                <p className="text-3xl font-bold">{currentStudent.currentGPA.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
                                <p className="text-3xl font-bold">#{studentRank}</p>
                                <p className="text-xs text-muted-foreground mt-1">out of {totalStudents}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Percentile</p>
                                <p className="text-3xl font-bold">
                                    {totalStudents > 0 ? ((1 - studentRank / totalStudents) * 100).toFixed(0) : 100}%
                                </p>
                            </div>
                        </div>
                        <Alert className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                If a pathway remains oversubscribed, final allocation will be based on GPA ranking.
                                Students with higher GPAs will be prioritized.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
