'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Target,
  Trophy,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  GraduationCap,
  Briefcase,
  BarChart3,
  Info,
  Star,
  Award,
  Building2,
  Globe,
  Zap,
  Brain,
  Database,
  Settings,
  ArrowRight,
  ExternalLink,
  FileText,
  Download,
  Eye,
  Heart,
  Lightbulb,
  MapPin,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function SpecializationPage() {
  const { user } = useAuthStore();
  const { students, modules } = useAppStore();
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [showDetailedInfo, setShowDetailedInfo] = useState<string | null>(null);

  const student = students.find(s => s.id === user?.id);

  // Comprehensive specialization data based on guide book
  const specializations = [
    {
      id: 'bse',
      name: 'Business Systems Engineering',
      code: 'BSE',
      description: 'Focus on enterprise systems, business process engineering, and technology-enabled business solutions',
      demandLevel: 'high',
      selectionPeriod: 'March 1-15, 2025',
      allocationDate: 'March 20, 2025',
      
      // Core modules from guide book
      coreModules: [
        {
          code: 'MGTE 31293',
          name: 'Computer Integrated Manufacturing',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: true,
          description: 'Covers computer-aided manufacturing systems and industrial automation'
        },
        {
          code: 'MGTE 31403',
          name: 'Management of Technology',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: true,
          description: 'Technology strategy and innovation management'
        },
        {
          code: 'MGTE 41333',
          name: 'Business Process Engineering',
          credits: 3,
          semester: 'Year 4, Semester 1',
          compulsory: true,
          description: 'Process improvement and business transformation methodologies'
        },
        {
          code: 'MGTE 42213',
          name: 'Industrial and Systems Engineering',
          credits: 3,
          semester: 'Year 4, Semester 2',
          compulsory: true,
          description: 'Systems thinking and industrial engineering principles'
        }
      ],
      
      // Optional modules
      optionalModules: [
        {
          code: 'MGTE 31433',
          name: 'Computer based tools for Management Applications',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: false
        },
        {
          code: 'MGTE 41363',
          name: 'Digital Innovations Management',
          credits: 3,
          semester: 'Year 4, Semester 1',
          compulsory: false
        }
      ],

      careerPaths: [
        {
          title: 'Business Systems Analyst',
          description: 'Analyze business processes and design technology solutions',
          salary: 'LKR 80,000 - 150,000',
          companies: ['Dialog Axiata', 'John Keells Holdings', 'Ceylon Tobacco Company'],
          skills: ['Business Analysis', 'Process Mapping', 'Requirements Gathering']
        },
        {
          title: 'ERP Consultant',
          description: 'Implement and customize enterprise resource planning systems',
          salary: 'LKR 100,000 - 200,000',
          companies: ['SAP Lanka', 'Oracle Corporation', 'Microsoft Sri Lanka'],
          skills: ['ERP Systems', 'Configuration', 'Training']
        },
        {
          title: 'Solution Architect',
          description: 'Design comprehensive technology solutions for organizations',
          salary: 'LKR 120,000 - 250,000',
          companies: ['Tech Mahindra', 'WSO2', 'Virtusa'],
          skills: ['System Design', 'Architecture', 'Integration']
        }
      ],

      industryInsights: {
        growth: '+15% annually',
        demand: 'Very High',
        trends: ['Digital Transformation', 'Process Automation', 'Cloud Migration'],
        skills: ['Enterprise Systems', 'Business Analysis', 'Project Management', 'Process Optimization']
      },

      faculty: [
        {
          name: 'Dr. Samantha Perera',
          title: 'Senior Lecturer',
          expertise: 'Business Process Engineering',
          email: 'samantha.perera@kln.ac.lk',
          office: 'Room 205, Faculty Building'
        },
        {
          name: 'Prof. Rajitha Silva',
          title: 'Professor',
          expertise: 'Industrial Systems',
          email: 'rajitha.silva@kln.ac.lk',
          office: 'Room 301, Faculty Building'
        }
      ]
    },
    {
      id: 'oscm',
      name: 'Operations & Supply Chain Management',
      code: 'OSCM',
      description: 'Focus on operations optimization, logistics, supply chain management, and industrial systems',
      demandLevel: 'very-high',
      selectionPeriod: 'March 1-15, 2025',
      allocationDate: 'March 20, 2025',
      
      coreModules: [
        {
          code: 'MGTE 31413',
          name: 'Warehouse Management and Industrial Shipping',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: true,
          description: 'Warehouse operations and shipping logistics management'
        },
        {
          code: 'MGTE 31303',
          name: 'Procurement and Supply Management',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: true,
          description: 'Strategic procurement and supplier relationship management'
        },
        {
          code: 'MGTE 31423',
          name: 'Advanced Optimization Methods in Management Science',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: true,
          description: 'Mathematical optimization for supply chain problems'
        },
        {
          code: 'MGTE 41343',
          name: 'Logistics System Analysis and Geomatics',
          credits: 3,
          semester: 'Year 4, Semester 1',
          compulsory: true,
          description: 'Advanced logistics analysis and geographic information systems'
        },
        {
          code: 'MGTE 42323',
          name: 'Strategic Quality Management and Lean Six Sigma',
          credits: 3,
          semester: 'Year 4, Semester 2',
          compulsory: true,
          description: 'Quality management systems and continuous improvement methodologies'
        }
      ],

      optionalModules: [
        {
          code: 'MGTE 41353',
          name: 'Sustainability and Economics in Logistics and Supply Chain',
          credits: 3,
          semester: 'Year 4, Semester 1',
          compulsory: false
        },
        {
          code: 'MGTE 42313',
          name: 'Advanced Supply Chain and Logistics Applications',
          credits: 3,
          semester: 'Year 4, Semester 2',
          compulsory: false
        }
      ],

      careerPaths: [
        {
          title: 'Operations Analyst',
          description: 'Analyze and optimize operational processes and efficiency',
          salary: 'LKR 75,000 - 140,000',
          companies: ['MAS Holdings', 'Hayleys', 'Cargills'],
          skills: ['Process Analysis', 'Data Analysis', 'Optimization']
        },
        {
          title: 'Supply Chain Planner',
          description: 'Plan and coordinate supply chain activities',
          salary: 'LKR 85,000 - 160,000',
          companies: ['Unilever Sri Lanka', 'Nestle Lanka', 'Ceylon Biscuits'],
          skills: ['Demand Planning', 'Inventory Management', 'Forecasting']
        },
        {
          title: 'Industrial Engineer',
          description: 'Design and improve industrial systems and processes',
          salary: 'LKR 90,000 - 180,000',
          companies: ['Sri Lanka Ports Authority', 'Ceylon Petroleum Corporation', 'Lanka IOC'],
          skills: ['Process Design', 'Work Study', 'System Optimization']
        }
      ],

      industryInsights: {
        growth: '+18% annually',
        demand: 'Critical',
        trends: ['Supply Chain Digitization', 'Sustainability', 'Risk Management'],
        skills: ['Optimization', 'Logistics', 'Operations Planning', 'Quality Management']
      },

      faculty: [
        {
          name: 'Dr. Priyanka Fernando',
          title: 'Senior Lecturer',
          expertise: 'Supply Chain Management',
          email: 'priyanka.fernando@kln.ac.lk',
          office: 'Room 208, Faculty Building'
        },
        {
          name: 'Prof. Nimal Wijesinghe',
          title: 'Professor',
          expertise: 'Operations Research',
          email: 'nimal.wijesinghe@kln.ac.lk',
          office: 'Room 302, Faculty Building'
        }
      ]
    },
    {
      id: 'is',
      name: 'Information Systems',
      code: 'IS',
      description: 'Focus on information systems strategy, data analytics, enterprise integration, and digital transformation',
      demandLevel: 'high',
      selectionPeriod: 'March 1-15, 2025',
      allocationDate: 'March 20, 2025',
      
      coreModules: [
        {
          code: 'INTE 31423',
          name: 'Data Analytics and Visualization',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: true,
          description: 'Data analysis techniques and visualization tools'
        },
        {
          code: 'INTE 31413',
          name: 'Information Technology Infrastructure',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: true,
          description: 'IT infrastructure design and management'
        },
        {
          code: 'INTE 31393',
          name: 'Information Security',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: true,
          description: 'Information security principles and practices'
        },
        {
          code: 'INTE 41283',
          name: 'Information Systems Management and Strategy',
          credits: 3,
          semester: 'Year 4, Semester 1',
          compulsory: true,
          description: 'Strategic IS planning and management'
        },
        {
          code: 'MGTE 41303',
          name: 'Enterprise Systems',
          credits: 3,
          semester: 'Year 4, Semester 1',
          compulsory: true,
          description: 'Enterprise resource planning and business systems'
        }
      ],

      optionalModules: [
        {
          code: 'MGTE 31383',
          name: 'Research Methods',
          credits: 3,
          semester: 'Year 3, Semester 1',
          compulsory: false
        },
        {
          code: 'INTE 44303',
          name: 'Information Audit and Assurance',
          credits: 3,
          semester: 'Year 4, Semester 1/2',
          compulsory: false
        }
      ],

      careerPaths: [
        {
          title: 'Systems Analyst',
          description: 'Analyze business requirements and design information systems',
          salary: 'LKR 85,000 - 160,000',
          companies: ['Dialog Axiata', 'Sampath Bank', 'Commercial Bank'],
          skills: ['Systems Analysis', 'Requirements Gathering', 'System Design']
        },
        {
          title: 'IT Consultant',
          description: 'Provide technology consulting and implementation services',
          salary: 'LKR 100,000 - 220,000',
          companies: ['Deloitte Sri Lanka', 'PwC Sri Lanka', 'KPMG'],
          skills: ['Consulting', 'Project Management', 'Technology Strategy']
        },
        {
          title: 'Business Intelligence Analyst',
          description: 'Analyze data to support business decision making',
          salary: 'LKR 90,000 - 180,000',
          companies: ['John Keells Holdings', 'Ceylon Tobacco Company', 'Hayleys'],
          skills: ['Data Analysis', 'Business Intelligence', 'Reporting']
        }
      ],

      industryInsights: {
        growth: '+20% annually',
        demand: 'Very High',
        trends: ['Digital Transformation', 'Data Analytics', 'Cloud Computing'],
        skills: ['IS Strategy', 'Data Analytics', 'Integration', 'Security']
      },

      faculty: [
        {
          name: 'Dr. Anura Jayasuriya',
          title: 'Senior Lecturer',
          expertise: 'Information Systems',
          email: 'anura.jayasuriya@kln.ac.lk',
          office: 'Room 210, Faculty Building'
        },
        {
          name: 'Prof. Chaminda Rathnayake',
          title: 'Professor',
          expertise: 'Data Analytics',
          email: 'chaminda.rathnayake@kln.ac.lk',
          office: 'Room 304, Faculty Building'
        }
      ]
    }
  ];

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'very-high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'high': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'medium': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDemandText = (level: string) => {
    switch (level) {
      case 'critical': return 'Critical Demand';
      case 'very-high': return 'Very High Demand';
      case 'high': return 'High Demand';
      case 'medium': return 'Medium Demand';
      default: return 'Normal Demand';
    }
  };


  const canSelectSpecialization = student?.academicYear === 'L2' && student?.degreeProgram === 'MIT';

  const handleSubmit = async () => {
    if (!selectedSpec) {
      toast.error('Please select a specialization');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Specialization preference submitted successfully! You will be notified of the allocation result on March 20, 2025.');
    setIsSubmitting(false);
  };

  const toggleModuleExpansion = (specId: string) => {
    setExpandedModules(prev => 
      prev.includes(specId) 
        ? prev.filter(id => id !== specId)
        : [...prev, specId]
    );
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
      <div>
            <h1 className="text-3xl font-bold">Specialization Selection</h1>
            <p className="text-muted-foreground">B.Sc. Honours in Management and Information Technology (MIT)</p>
          </div>
      </div>

      </div>

      {/* Selection Timeline */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selection Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Selection Period</h3>
              <p className="text-sm text-muted-foreground">March 1-15, 2025</p>
              <p className="text-xs">Submit your preferences</p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Processing Period</h3>
              <p className="text-sm text-muted-foreground">March 16-19, 2025</p>
              <p className="text-xs">Bulk allocation processing</p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Results Release</h3>
              <p className="text-sm text-muted-foreground">March 20, 2025</p>
              <p className="text-xs">Allocation results published</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Current Pathway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student?.degreeProgram || 'Not Set'}</div>
            <p className="text-xs text-muted-foreground mt-1">Degree Program</p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Specialization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{student?.specialization || 'Not Assigned'}</div>
            <p className="text-xs text-muted-foreground mt-1">Current Status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Selection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={canSelectSpecialization ? 'default' : 'secondary'} className="text-sm">
              {canSelectSpecialization ? 'Open for Selection' : 'Not Available'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {!canSelectSpecialization && (
        <Alert className="max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Selection Not Available</AlertTitle>
          <AlertDescription>
            {student.academicYear !== 'L2'
              ? `Specialization selection is only available for L2 students. You are currently ${student.academicYear}.`
              : `Specialization selection applies only to MIT pathway. Your pathway is ${student.degreeProgram || 'Not Set'}.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Specialization Options */}
      {canSelectSpecialization && (
        <Tabs defaultValue="overview" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Info</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="selection">Make Selection</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {specializations.map((spec) => {
                return (
                  <Card key={spec.id} className="relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <Badge className={getDemandColor(spec.demandLevel)}>
                        {getDemandText(spec.demandLevel)}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">{spec.name}</CardTitle>
                      <CardDescription className="text-sm">{spec.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Industry Growth */}
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">{spec.industryInsights.growth}</span>
                        <span className="text-xs text-muted-foreground">annual growth</span>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{spec.careerPaths.length} career paths</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{spec.coreModules.length} core modules</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {specializations.map((spec) => (
              <Card key={spec.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{spec.name} ({spec.code})</CardTitle>
                      <CardDescription className="text-base mt-2">{spec.description}</CardDescription>
                    </div>
                    <Badge className={getDemandColor(spec.demandLevel)}>
                      {getDemandText(spec.demandLevel)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Core Modules */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Core Modules
                    </h3>
                    <div className="grid gap-3">
                      {spec.coreModules.map((module, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{module.code} - {module.name}</h4>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-medium">{module.credits} Credits</div>
                              <div className="text-muted-foreground">{module.semester}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                      </div>

                  {/* Career Paths */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Career Opportunities
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {spec.careerPaths.map((career, index) => (
                        <Card key={index} className="border-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{career.title}</CardTitle>
                            <CardDescription className="text-sm">{career.description}</CardDescription>
                    </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-green-600">{career.salary}</p>
                              <p className="text-xs text-muted-foreground">Starting salary range</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-1">Key Companies:</p>
                              <div className="flex flex-wrap gap-1">
                                {career.companies.map(company => (
                                  <Badge key={company} variant="outline" className="text-xs">
                                    {company}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-1">Required Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {career.skills.map(skill => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                  </Card>
                ))}
            </div>
                  </div>

                  {/* Industry Insights */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Industry Insights
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Market Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {spec.industryInsights.trends.map(trend => (
                              <div key={trend} className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">{trend}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Key Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {spec.industryInsights.skills.map(skill => (
                              <Badge key={skill} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                      </div>

                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialization Comparison Matrix</CardTitle>
                <CardDescription>
                  Compare all specializations side by side to make an informed decision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Criteria</th>
                        {specializations.map(spec => (
                          <th key={spec.id} className="text-center p-3 font-semibold">
                            {spec.code}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Demand Level</td>
                      {specializations.map(spec => (
                          <td key={spec.id} className="text-center p-3">
                            <Badge className={getDemandColor(spec.demandLevel)}>
                              {spec.demandLevel}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Industry Growth</td>
                        {specializations.map(spec => (
                          <td key={spec.id} className="text-center p-3">
                            <span className="text-green-600 font-medium">{spec.industryInsights.growth}</span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Core Modules</td>
                        {specializations.map(spec => (
                          <td key={spec.id} className="text-center p-3">
                            {spec.coreModules.length}
                          </td>
                        ))}
                        </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Career Paths</td>
                        {specializations.map(spec => (
                          <td key={spec.id} className="text-center p-3">
                            {spec.careerPaths.length}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selection" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Preference Submission</AlertTitle>
              <AlertDescription>
                Rank your specialization preferences from 1st to 3rd choice. The system will allocate based on 
                  capacity constraints after the selection period ends.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Submit Your Preferences</CardTitle>
                <CardDescription>
                  Select your preferred specialization. You can change your selection until the deadline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedSpec} onValueChange={setSelectedSpec} className="space-y-4">
                  {specializations.map((spec) => {
                    return (
                      <Card key={spec.id} className={`cursor-pointer transition-all ${
                        selectedSpec === spec.id ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}>
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <RadioGroupItem 
                              value={spec.id} 
                              id={spec.id} 
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={spec.id} className="text-lg font-semibold cursor-pointer">
                                {spec.name} ({spec.code})
                              </Label>
                              <CardDescription className="mt-1">{spec.description}</CardDescription>
                              
                              <div className="flex items-center gap-4 mt-3">
                                <Badge className={getDemandColor(spec.demandLevel)}>
                                  {getDemandText(spec.demandLevel)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </RadioGroup>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" disabled={isSubmitting}>
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedSpec || isSubmitting}
                    className="min-w-[150px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Preferences
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}