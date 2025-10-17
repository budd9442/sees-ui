'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Target,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function SpecializationPage() {
  const { user } = useAuthStore();
  const { students, modules } = useAppStore();
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const student = students.find(s => s.id === user?.id);

  // Mock specializations data
  const specializations = [
    {
      id: 'bse',
      name: 'Business Software Engineering',
      code: 'BSE',
      description: 'Combine software engineering with business acumen to develop enterprise solutions',
      enrolledCount: 45,
      capacity: 60,
      requiredGPA: 2.8,
      modules: ['SE301', 'BUS302', 'PM303', 'ENT304'],
      careerPaths: ['Software Architect', 'Product Manager', 'Tech Entrepreneur'],
      skills: ['Enterprise Systems', 'Business Analysis', 'Project Management'],
      demandLevel: 'high',
    },
    {
      id: 'isc',
      name: 'Information Security & Cybersecurity',
      code: 'ISC',
      description: 'Master the art of protecting digital assets and securing information systems',
      enrolledCount: 38,
      capacity: 50,
      requiredGPA: 3.0,
      modules: ['SEC301', 'NET302', 'FOR303', 'CRY304'],
      careerPaths: ['Security Analyst', 'Ethical Hacker', 'Security Architect'],
      skills: ['Network Security', 'Cryptography', 'Digital Forensics'],
      demandLevel: 'very-high',
    },
    {
      id: 'ds',
      name: 'Data Science',
      code: 'DS',
      description: 'Unlock insights from data using advanced analytics and machine learning',
      enrolledCount: 52,
      capacity: 55,
      requiredGPA: 3.2,
      modules: ['ML301', 'STAT302', 'BIG303', 'VIS304'],
      careerPaths: ['Data Scientist', 'ML Engineer', 'Business Intelligence Analyst'],
      skills: ['Machine Learning', 'Statistical Analysis', 'Data Visualization'],
      demandLevel: 'critical',
    },
    {
      id: 'cn',
      name: 'Computer Networks',
      code: 'CN',
      description: 'Design and manage complex network infrastructures and cloud systems',
      enrolledCount: 28,
      capacity: 40,
      requiredGPA: 2.5,
      modules: ['NET301', 'CLD302', 'IOT303', 'SDN304'],
      careerPaths: ['Network Engineer', 'Cloud Architect', 'IoT Specialist'],
      skills: ['Network Design', 'Cloud Computing', 'Network Security'],
      demandLevel: 'medium',
    },
  ];

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'very-high': return 'text-orange-600 bg-orange-50';
      case 'high': return 'text-yellow-600 bg-yellow-50';
      case 'medium': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
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

  const canSelectSpecialization = student?.academicYear === 'L2' && !student?.specialization;
  const currentGPA = student?.currentGPA || 3.2;

  const handleSubmit = async () => {
    if (!selectedSpec) {
      toast.error('Please select a specialization');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Specialization selected successfully!');
    setIsSubmitting(false);
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Specialization Selection</h1>
        <p className="text-muted-foreground mt-1">
          Choose your area of expertise for advanced study
        </p>
      </div>

      {/* Status Alert */}
      {!canSelectSpecialization && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Selection Not Available</AlertTitle>
          <AlertDescription>
            {student.academicYear !== 'L2'
              ? `Specialization selection is only available for L2 students. You are currently ${student.academicYear}.`
              : `You have already selected ${student.specialization} as your specialization.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Pathway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student?.specialization || 'Not Assigned'}</div>
            <p className="text-xs text-muted-foreground mt-1">{student?.specialization}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Selection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={canSelectSpecialization ? 'default' : 'secondary'}>
              {canSelectSpecialization ? 'Open for Selection' : 'Not Available'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Specialization Options */}
      {canSelectSpecialization && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Specializations</TabsTrigger>
            <TabsTrigger value="eligible">Eligible For You</TabsTrigger>
            <TabsTrigger value="comparison">Compare</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <RadioGroup value={selectedSpec} onValueChange={setSelectedSpec}>
              {specializations.map((spec) => {
                const isEligible = currentGPA >= spec.requiredGPA;
                const availableSlots = spec.capacity - spec.enrolledCount;
                const fillPercentage = (spec.enrolledCount / spec.capacity) * 100;

                return (
                  <Card key={spec.id} className={selectedSpec === spec.id ? 'ring-2 ring-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={spec.id} id={spec.id} disabled={!isEligible} />
                          <div className="space-y-1">
                            <Label htmlFor={spec.id} className="text-base font-semibold cursor-pointer">
                              {spec.name} ({spec.code})
                            </Label>
                            <CardDescription>{spec.description}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getDemandColor(spec.demandLevel)}>
                          {getDemandText(spec.demandLevel)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Capacity */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Enrollment</span>
                          <span className="font-medium">{spec.enrolledCount}/{spec.capacity}</span>
                        </div>
                        <Progress value={fillPercentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {availableSlots} slots remaining
                        </p>
                      </div>

                      {/* Requirements */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Min GPA: {spec.requiredGPA}</span>
                          {currentGPA >= spec.requiredGPA ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>

                      {/* Career Paths */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Career Paths</p>
                        <div className="flex flex-wrap gap-2">
                          {spec.careerPaths.map(path => (
                            <Badge key={path} variant="secondary">{path}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Key Skills */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Key Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {spec.skills.map(skill => (
                            <Badge key={skill} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Core Modules */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Core Modules</p>
                        <div className="grid grid-cols-4 gap-2">
                          {spec.modules.map(moduleCode => (
                            <div key={moduleCode} className="flex items-center gap-1 text-sm">
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                              <span>{moduleCode}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {!isEligible && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Your GPA ({currentGPA.toFixed(2)}) does not meet the minimum requirement ({spec.requiredGPA})
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </RadioGroup>

            <div className="flex justify-end gap-3">
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedSpec || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Selection'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="eligible">
            <div className="space-y-4">
              {specializations
                .filter(spec => currentGPA >= spec.requiredGPA)
                .map(spec => (
                  <Card key={spec.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{spec.name}</CardTitle>
                        <Badge variant="default">Eligible</Badge>
                      </div>
                      <CardDescription>{spec.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Specialization Comparison</CardTitle>
                <CardDescription>
                  Compare different specializations side by side
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Specialization</th>
                        <th className="text-center p-2">Min GPA</th>
                        <th className="text-center p-2">Available Slots</th>
                        <th className="text-center p-2">Demand</th>
                        <th className="text-center p-2">Your Eligibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specializations.map(spec => (
                        <tr key={spec.id} className="border-b">
                          <td className="p-2 font-medium">{spec.code}</td>
                          <td className="text-center p-2">{spec.requiredGPA}</td>
                          <td className="text-center p-2">{spec.capacity - spec.enrolledCount}</td>
                          <td className="text-center p-2">
                            <Badge className={getDemandColor(spec.demandLevel)}>
                              {spec.demandLevel}
                            </Badge>
                          </td>
                          <td className="text-center p-2">
                            {currentGPA >= spec.requiredGPA ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}