'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Lock, TrendingUp, Users, BookOpen, Briefcase, Lightbulb, Target, HelpCircle, Info, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Student, DegreeProgram } from '@/types';

export default function PathwayClient() {
    const { user } = useAuthStore();
    const { students, pathwayDemand, updateStudent } = useAppStore();
    const [selectedPathway, setSelectedPathway] = useState<DegreeProgram | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    const currentStudent = students.find((s) => s.email === user?.email) as Student | undefined;

    if (!currentStudent) {
        return <div>Loading...</div>;
    }

    const isL1Student = currentStudent.academicYear === 'L1';
    const hasSelectedPathway = !!currentStudent.degreeProgram;
    const isLocked = currentStudent.pathwayLocked;

    const mitDemand = pathwayDemand.MIT;
    const itDemand = pathwayDemand.IT;
    const mitOversubscribed = mitDemand >= 60;
    const itOversubscribed = itDemand >= 60;

    // Mock GPA ranking (would be calculated from actual data)
    const studentRank = Math.floor(Math.random() * 50) + 1;
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

    const handleSelectPathway = (pathway: DegreeProgram) => {
        if (isLocked) {
            toast.error('Pathway selection is locked');
            return;
        }
        setSelectedPathway(pathway);
    };

    const handleConfirmSelection = () => {
        if (!selectedPathway) {
            toast.error('Please select a pathway');
            return;
        }

        updateStudent(currentStudent.studentId, {
            degreeProgram: selectedPathway,
        });

        toast.success(`Pathway selected: ${selectedPathway}`);
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
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="guidance">Guidance</TabsTrigger>
                    <TabsTrigger value="mit">MIT Details</TabsTrigger>
                    <TabsTrigger value="it">IT Details</TabsTrigger>
                    <TabsTrigger value="decision">Decision Helper</TabsTrigger>
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
                            {Object.values(pathwayData).map((pathway) => (
                                <div key={pathway.code}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{pathway.code}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {pathway.code === 'MIT' ? mitDemand : itDemand}%
                                            </span>
                                            {(pathway.code === 'MIT' ? mitOversubscribed : itOversubscribed) && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Oversubscribed
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Progress
                                        value={pathway.code === 'MIT' ? mitDemand : itDemand}
                                        className={(pathway.code === 'MIT' ? mitOversubscribed : itOversubscribed) ? '[&>div]:bg-red-500' : ''}
                                    />
                                    {(pathway.code === 'MIT' ? mitDemand : itDemand) >= 55 && (pathway.code === 'MIT' ? mitDemand : itDemand) < 60 && (
                                        <p className="text-xs text-orange-600 mt-1">
                                            Approaching 60% threshold - may trigger GPA-based allocation
                                        </p>
                                    )}
                                    {(pathway.code === 'MIT' ? mitOversubscribed : itOversubscribed) && (
                                        <p className="text-xs text-red-600 mt-1">
                                            ⚠️ Selection will be based on GPA ranking
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Guidance Tab */}
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
                                    {((1 - studentRank / totalStudents) * 100).toFixed(0)}%
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
                    const isSelected =
                        selectedPathway === pathway.code ||
                        (currentStudent.degreeProgram === pathway.code && !selectedPathway);

                    return (
                        <Card
                            key={pathway.code}
                            className={`transition-all ${isSelected
                                    ? 'border-primary border-2 shadow-lg'
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
                                    {isSelected && (
                                        <Badge variant="default" className="text-sm">
                                            {isLocked ? 'Confirmed' : 'Selected'}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {pathway.description}
                                </p>

                                {/* Demand Status */}
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Current Demand</span>
                                        <span className="text-sm font-bold">
                                            {pathway.code === 'MIT' ? mitDemand : itDemand}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={pathway.code === 'MIT' ? mitDemand : itDemand}
                                        className={(pathway.code === 'MIT' ? mitOversubscribed : itOversubscribed) ? '[&>div]:bg-red-500' : ''}
                                    />
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

                                {/* Action Button */}
                                <Button
                                    className="w-full"
                                    variant={isSelected ? 'default' : 'outline'}
                                    onClick={() => handleSelectPathway(pathway.code)}
                                    disabled={isLocked}
                                >
                                    {isLocked
                                        ? isSelected
                                            ? 'Confirmed'
                                            : 'Locked'
                                        : isSelected
                                            ? 'Selected'
                                            : 'Select This Pathway'}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
