'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Lock, TrendingUp, Users, BookOpen, Briefcase, Target, HelpCircle, Info, Star, ArrowRight, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import type { DegreeProgram } from '@/types';
import { updateStudentPathway } from '@/lib/actions/student-subactions';
import { submitPathwayPreferences } from '@/lib/actions/pathway-actions';
import { getAIGuidance } from '@/lib/actions/ai-actions';
import { Sparkles, BrainCircuit, MessageSquare, Quote, Loader2 } from 'lucide-react';

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
    const [isPending, startTransition] = useTransition();
    const { currentStudent, pathwayDemand, studentRank } = initialData;

    // Use codes for selection state
    const [pref1, setPref1] = useState<string | null>(currentStudent.preference1 || null);
    const [pref2, setPref2] = useState<string | null>(currentStudent.preference2 || null);
    
    const [activeTab, setActiveTab] = useState('overview');
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

    // Comprehensive pathway data based on guide book
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
    const fetchAIAdvice = async () => {
        setLoadingAI(true);
        try {
            const advice = await getAIGuidance();
            setAIAdvice(advice);
            setActiveTab('aicounselor');
        } catch (err) {
            toast.error("Failed to connect to the AI Counselor.");
        } finally {
            setLoadingAI(false);
        }
    };

    // Decision Helper Questions
    const decisionQuestions = [
        {
            question: "What type of work environment do you prefer?",
            options: [
                { text: "Leading teams and managing projects", pathway: "MIT" },
                { text: "Hands-on technical development", pathway: "IT" },
                { text: "Both management and technical work", pathway: "MIT" },
                { text: "Focusing on coding and problem-solving", pathway: "IT" }
            ]
        },
        {
            question: "What interests you more?",
            options: [
                { text: "How technology can solve business problems", pathway: "MIT" },
                { text: "Building and creating software applications", pathway: "IT" },
                { text: "Managing technology projects and teams", pathway: "MIT" },
                { text: "Learning new programming languages and frameworks", pathway: "IT" }
            ]
        },
        {
            question: "What career path appeals to you?",
            options: [
                { text: "IT Manager or Business Analyst", pathway: "MIT" },
                { text: "Software Engineer or Developer", pathway: "IT" },
                { text: "Project Manager or Consultant", pathway: "MIT" },
                { text: "Systems Administrator or DevOps Engineer", pathway: "IT" }
            ]
        }
    ];

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

    return (
        <div>
            <PageHeader
                title="Pathway Selection"
                description="Choose your degree program pathway for L2 and beyond"
            />

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

            {/* Comprehensive Guidance Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-6 flex-wrap md:flex-nowrap mb-6 md:mb-0">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="aicounselor" className="bg-primary/5 text-primary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Counselor
                    </TabsTrigger>
                    <TabsTrigger value="mit">MIT Details</TabsTrigger>
                    <TabsTrigger value="it">IT Details</TabsTrigger>
                    <TabsTrigger value="guidance">Ref. Guidance</TabsTrigger>
                    <TabsTrigger value="decision">Helper</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Quick Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Quick Comparison
                            </CardTitle>
                            <CardDescription>Key differences between MIT and IT pathways</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                        <h3 className="font-semibold text-blue-900 mb-2">MIT - Management Focus</h3>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Business + Technology integration</li>
                                            <li>• 3 specialization options (BSE, OSCM, IS)</li>
                                            <li>• Management and leadership skills</li>
                                            <li>• Project management focus</li>
                                            <li>• Business analysis and consulting</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                                        <h3 className="font-semibold text-green-900 mb-2">IT - Technical Focus</h3>
                                        <ul className="text-sm text-green-800 space-y-1">
                                            <li>• Pure technical development</li>
                                            <li>• No specializations (broader technical base)</li>
                                            <li>• Programming and systems design</li>
                                            <li>• Software engineering focus</li>
                                            <li>• Technical implementation</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Demand Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Demand Status</CardTitle>
                            <CardDescription>
                                Real-time pathway demand among L1 students ({totalStudents} total students)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.values(pathwayData).map((pathway) => {
                                const initialCount = pathway.code === 'MIT' ? mitCount : itCount;
                                const initialPathway = currentStudent.degreeProgram;
                                const isSelectedNow = (pref1 || initialPathway) === pathway.code;
                                const wasSelected = initialPathway === pathway.code;
                                
                                const liveCount = initialCount + (isSelectedNow && !wasSelected ? 1 : !isSelectedNow && wasSelected ? -1 : 0);
                                const capacity = pathway.code === 'MIT' ? mitCapacity : itCapacity;
                                const percentage = Math.min(100, Math.round((liveCount / capacity) * 100));
                                const isOversubscribed = liveCount > capacity;

                                return (
                                    <div key={pathway.code} className={`p-4 rounded-xl border-2 transition-all ${isSelectedNow ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-muted/50 border-transparent hover:border-muted'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{pathway.code}</span>
                                                {isSelectedNow && !wasSelected && (
                                                    <Badge variant="secondary" className="text-[10px] h-4 bg-blue-100 text-blue-700">Pending</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {liveCount} / {capacity} students ({percentage}%)
                                                </span>
                                                {isOversubscribed && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Full
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Progress
                                            value={percentage}
                                            className={isOversubscribed ? '[&>div]:bg-red-500' : percentage >= 80 ? '[&>div]:bg-orange-500' : ''}
                                        />
                                        {percentage >= 90 && percentage < 100 && (
                                            <p className="text-xs text-orange-600 mt-1">
                                                Approaching capacity - selection may trigger GPA-based allocation
                                            </p>
                                        )}
                                        {isOversubscribed && (
                                            <p className="text-xs text-red-600 mt-1">
                                                ⚠️ Capacity reached. Final selection will be based on GPA ranking
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Counselor Tab */}
                <TabsContent value="aicounselor" className="space-y-6">
                    <Card className="border-primary/20 bg-primary/5 shadow-inner">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Academic Career Counselor</CardTitle>
                            <CardDescription>
                                AI-driven analysis of your Year 1 performance to find your perfect pathway match.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center py-6">
                            {!aiAdvice && !loadingAI && (
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Our AI Counselor will analyze your grades, academic strengths, and domain-specific scores 
                                        to suggest the best pathway for your future career.
                                    </p>
                                    <Button onClick={fetchAIAdvice} className="bg-primary hover:bg-primary/90">
                                        <BrainCircuit className="h-4 w-4 mr-2" />
                                        Begin Data-Driven Analysis
                                    </Button>
                                </div>
                            )}

                            {loadingAI && (
                                <div className="text-center space-y-4 py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                    <p className="text-sm font-medium animate-pulse text-primary">
                                        Analyzing transcript & skill vectors...
                                    </p>
                                </div>
                            )}

                            {aiAdvice && (
                                <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-6 bg-white/80 rounded-2xl border border-primary/10 shadow-sm">
                                        <div className="relative">
                                            <div className="h-24 w-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                                                <span className="text-2xl font-black text-primary">{aiAdvice.fit_score}%</span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="text-center md:text-left space-y-1">
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">The AI Suggests</p>
                                            <h3 className="text-3xl font-black text-primary">{aiAdvice.primary_recommendation} Pathway</h3>
                                            <p className="text-sm text-muted-foreground">Academic Match: Excellent</p>
                                        </div>
                                    </div>

                                    <div className="relative p-6 bg-slate-900 text-slate-50 rounded-2xl overflow-hidden group">
                                        <Quote className="absolute top-2 left-2 h-12 w-12 text-slate-800 -rotate-12" />
                                        <div className="relative z-10 flex gap-4">
                                            <MessageSquare className="h-6 w-6 text-primary flex-shrink-0" />
                                            <p className="text-lg leading-relaxed font-medium italic">
                                                "{aiAdvice.insight}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Card className="bg-white/50 border-white/50 backdrop-blur-sm">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-orange-500" />
                                                    Core Strengths
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {aiAdvice.supporting_reasons.map((reason: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                                                            {reason}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-white/50 border-white/50 backdrop-blur-sm">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                    Skill Profile
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] uppercase font-bold">
                                                        <span>Technical Logic</span>
                                                        <span>{aiAdvice.primary_recommendation === 'IT' ? '92%' : '78%'}</span>
                                                    </div>
                                                    <Progress value={aiAdvice.primary_recommendation === 'IT' ? 92 : 78} className="h-1" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] uppercase font-bold">
                                                        <span>Business Operations</span>
                                                        <span>{aiAdvice.primary_recommendation === 'MIT' ? '94%' : '65%'}</span>
                                                    </div>
                                                    <Progress value={aiAdvice.primary_recommendation === 'MIT' ? 94 : 65} className="h-1" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    
                                    <Button variant="outline" className="w-full text-xs" onClick={() => setAIAdvice(null)}>
                                        Reset Guidance Engine
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reference Guidance Tab */}
                <TabsContent value="guidance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5" />
                                Decision-Making Guidance
                            </CardTitle>
                            <CardDescription>Factors to consider when choosing your pathway</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Choose MIT if you:</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Want to lead technology projects and teams</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Are interested in business analysis and consulting</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Enjoy solving business problems with technology</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Want to specialize in a specific business area</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Prefer management and strategic roles</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Choose IT if you:</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Love programming and software development</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Want to build applications and systems</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Enjoy technical problem-solving</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Want to work as a developer or engineer</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Prefer hands-on technical work</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5" />
                                Important Considerations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                                    <h4 className="font-semibold text-amber-900 mb-2">Academic Performance</h4>
                                    <p className="text-sm text-amber-800">
                                        Your L1 GPA will determine your eligibility if pathways become oversubscribed (60%+ demand).
                                    </p>
                                </div>
                                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                    <h4 className="font-semibold text-blue-900 mb-2">Career Goals</h4>
                                    <p className="text-sm text-blue-800">
                                        Consider your long-term career aspirations and the type of work you want to do.
                                    </p>
                                </div>
                                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                                    <h4 className="font-semibold text-green-900 mb-2">Interest Alignment</h4>
                                    <p className="text-sm text-green-800">
                                        Choose based on what genuinely interests you, not just current trends or peer pressure.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MIT Details Tab */}
                <TabsContent value="mit" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-blue-600" />
                                MIT - Management and Information Technology
                            </CardTitle>
                            <CardDescription>{pathwayData.MIT.fullName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Program Overview</h3>
                                <p className="text-sm text-muted-foreground mb-4">{pathwayData.MIT.detailedDescription}</p>

                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900">Total Credits</p>
                                        <p className="text-2xl font-bold text-blue-600">{pathwayData.MIT.totalCredits}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900">Duration</p>
                                        <p className="text-2xl font-bold text-blue-600">{pathwayData.MIT.duration}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900">Level</p>
                                        <p className="text-lg font-bold text-blue-600">{pathwayData.MIT.level}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Available Specializations</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {pathwayData.MIT.specializations.map((spec) => (
                                        <div key={spec.code} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                            <h4 className="font-semibold text-blue-900 mb-2">{spec.code}</h4>
                                            <p className="text-sm text-blue-800 mb-3">{spec.description}</p>
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-blue-900">Core Modules:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {spec.coreModules.slice(0, 3).map((module) => (
                                                        <Badge key={module} variant="outline" className="text-xs">{module}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Career Opportunities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pathwayData.MIT.careerPaths.map((career) => (
                                        <Badge key={career} variant="secondary" className="text-sm">{career}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Industry Insights</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Growth Potential:</span>
                                            <Badge variant="outline" className="text-green-600">{pathwayData.MIT.industryInsights.growth}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Salary Range:</span>
                                            <span className="text-sm font-medium">{pathwayData.MIT.industryInsights.salaryRange}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Job Demand:</span>
                                            <Badge variant="outline" className="text-blue-600">{pathwayData.MIT.industryInsights.demand}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Key Sectors:</span>
                                            <span className="text-sm">{pathwayData.MIT.industryInsights.sectors.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* IT Details Tab */}
                <TabsContent value="it" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-green-600" />
                                IT - Information Technology
                            </CardTitle>
                            <CardDescription>{pathwayData.IT.fullName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Program Overview</h3>
                                <p className="text-sm text-muted-foreground mb-4">{pathwayData.IT.detailedDescription}</p>

                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm font-medium text-green-900">Total Credits</p>
                                        <p className="text-2xl font-bold text-green-600">{pathwayData.IT.totalCredits}</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm font-medium text-green-900">Duration</p>
                                        <p className="text-2xl font-bold text-green-600">{pathwayData.IT.duration}</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm font-medium text-green-900">Level</p>
                                        <p className="text-lg font-bold text-green-600">{pathwayData.IT.level}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Career Opportunities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pathwayData.IT.careerPaths.map((career) => (
                                        <Badge key={career} variant="secondary" className="text-sm">{career}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Industry Insights</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Growth Potential:</span>
                                            <Badge variant="outline" className="text-green-600">{pathwayData.IT.industryInsights.growth}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Salary Range:</span>
                                            <span className="text-sm font-medium">{pathwayData.IT.industryInsights.salaryRange}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Job Demand:</span>
                                            <Badge variant="outline" className="text-green-600">{pathwayData.IT.industryInsights.demand}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Key Sectors:</span>
                                            <span className="text-sm">{pathwayData.IT.industryInsights.sectors.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Skills You'll Develop</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pathwayData.IT.skills.map((skill) => (
                                        <Badge key={skill} variant="outline" className="text-sm">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Decision Helper Tab */}
                <TabsContent value="decision" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Interactive Decision Helper
                            </CardTitle>
                            <CardDescription>Answer these questions to get personalized guidance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {decisionQuestions.map((question, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-3">{question.question}</h4>
                                    <div className="grid md:grid-cols-2 gap-2">
                                        {question.options.map((option, optIndex) => (
                                            <Button
                                                key={optIndex}
                                                variant="outline"
                                                className="justify-start text-left h-auto p-3"
                                                onClick={() => {
                                                    toast.info(`This suggests: ${option.pathway} pathway`);
                                                }}
                                            >
                                                <ArrowRight className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="text-sm">{option.text}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Note:</strong> This is a guidance tool. Consider all factors including your interests, career goals, and academic performance when making your final decision.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

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

            {/* Pathway Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {Object.values(pathwayData).map((pathway) => {
                    const isPref1 = pref1 === pathway.code;
                    const isPref2 = pref2 === pathway.code;
                    const isSelected = isPref1 || isPref2;

                    return (
                        <Card
                            key={pathway.code}
                            className={`transition-all ${isSelected
                                ? 'border-primary border-2 shadow-lg ring-2 ring-primary/10'
                                : 'hover:shadow-md'
                                } ${isLocked && !isSelected ? 'opacity-50' : ''}`}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">{pathway.code}</CardTitle>
                                        <CardDescription className="mt-2 font-medium">
                                            {pathway.name}
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        {isPref1 && (
                                            <Badge variant="default" className="text-[10px] h-5 bg-primary">
                                                1st Choice
                                            </Badge>
                                        )}
                                        {isPref2 && (
                                            <Badge variant="outline" className="text-[10px] h-5 border-primary text-primary">
                                                2nd Choice
                                            </Badge>
                                        )}
                                        {isLocked && isSelected && (
                                            <Badge variant="secondary" className="text-[10px] h-5">
                                                Confirmed
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {pathway.description}
                                </p>

                                {/* Demand Status */}
                                <div className="p-3 bg-muted rounded-lg">
                                    {(() => {
                                        const initialCount = pathway.code === 'MIT' ? mitCount : itCount;
                                        const initialWasP1 = currentStudent.preference1 === pathway.code;
                                        const isP1Now = pref1 === pathway.code;
                                        const liveCount = initialCount + (isP1Now && !initialWasP1 ? 1 : !isP1Now && initialWasP1 ? -1 : 0);
                                        const capacity = pathway.code === 'MIT' ? mitCapacity : itCapacity;
                                        const percentage = Math.min(100, Math.round((liveCount / capacity) * 100));
                                        
                                        return (
                                            <>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">Enrollment Capacity</span>
                                                    <span className="text-sm font-bold">
                                                        {liveCount} / {capacity}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={percentage}
                                                    className={liveCount >= capacity ? '[&>div]:bg-red-500' : percentage >= 80 ? '[&>div]:bg-orange-500' : ''}
                                                />
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Specializations */}
                                {pathway.specializations.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">Available Specializations</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {pathway.specializations.map((spec) => (
                                                <Badge key={spec.code} variant="outline">
                                                    {spec.code}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Key Modules */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">Key Modules</p>
                                    </div>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        {pathway.careerPaths.slice(0, 4).map((career) => (
                                            <li key={career}>• {career}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action Selection */}
                                <div className="flex flex-col gap-2">
                                    <Button
                                        className="w-full flex justify-between"
                                        variant={isPref1 ? 'default' : 'outline'}
                                        onClick={() => handleSelectPathway(pathway.code, 1)}
                                        disabled={isLocked || isPending || isPref1}
                                    >
                                        <span>Set as 1st Choice</span>
                                        {isPref1 && <CheckCircle className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        className="w-full flex justify-between"
                                        variant={isPref2 ? 'default' : 'outline'}
                                        onClick={() => handleSelectPathway(pathway.code, 2)}
                                        disabled={isLocked || isPending || isPref2}
                                    >
                                        <span>Set as 2nd Choice</span>
                                        {isPref2 && <CheckCircle className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {!isLocked && (pref1 !== currentStudent.preference1 || pref2 !== currentStudent.preference2) && (
                <div className="mt-8 flex justify-center sticky bottom-6 z-50">
                    <Card className="border-primary shadow-2xl bg-white/95 backdrop-blur-md border-2 w-full max-w-lg">
                        <CardContent className="py-4 flex items-center justify-between gap-6">
                            <div className="flex-1 space-y-1">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Confirm Preferences</p>
                                <div className="text-sm flex gap-3">
                                    <span className="font-medium">1: <span className="text-primary font-bold">{pref1 || '---'}</span></span>
                                    <span className="font-medium">2: <span className="text-primary font-bold">{pref2 || '---'}</span></span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleConfirmPathway} 
                                    disabled={isPending || !pref1 || !pref2}
                                    className="px-6 shadow-lg shadow-primary/20"
                                >
                                    {isPending ? 'Saving...' : 'Save Choices'}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                        setPref1(currentStudent.preference1);
                                        setPref2(currentStudent.preference2);
                                    }}
                                    disabled={isPending}
                                >
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
