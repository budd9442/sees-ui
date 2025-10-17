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
import { CheckCircle, AlertTriangle, Lock, TrendingUp, Users, BookOpen, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import type { Student, DegreeProgram } from '@/types';

export default function PathwaySelectionPage() {
  const { user } = useAuthStore();
  const { students, pathwayDemand, updateStudent } = useAppStore();
  const [selectedPathway, setSelectedPathway] = useState<DegreeProgram | null>(null);

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

  const pathways = [
    {
      code: 'MIT' as DegreeProgram,
      name: 'Management and Information Technology',
      description:
        'Combines business management principles with IT skills. Ideal for students interested in IT management, business analysis, and enterprise systems.',
      demand: mitDemand,
      oversubscribed: mitOversubscribed,
      specializations: ['BSE', 'OSCM', 'IS'],
      careerPaths: [
        'IT Manager',
        'Business Analyst',
        'Systems Analyst',
        'ERP Consultant',
      ],
      keyModules: [
        'Enterprise Resource Planning',
        'Business Intelligence',
        'Supply Chain Management',
        'Digital Marketing',
      ],
    },
    {
      code: 'IT' as DegreeProgram,
      name: 'Information Technology',
      description:
        'Focuses on technical aspects of computing and software development. Perfect for students passionate about programming, systems development, and technology innovation.',
      demand: itDemand,
      oversubscribed: itOversubscribed,
      specializations: [],
      careerPaths: [
        'Software Engineer',
        'Systems Developer',
        'Network Administrator',
        'Database Administrator',
      ],
      keyModules: [
        'Software Engineering',
        'Database Systems',
        'Web Development',
        'Cloud Computing',
      ],
    },
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
        <Alert className="mb-6">
          <AlertDescription>
            Please select a pathway for your L2 year. Review the options carefully before making your decision.
          </AlertDescription>
        </Alert>
      )}

      {/* Demand Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Demand Status</CardTitle>
          <CardDescription>
            Real-time pathway demand among L1 students ({totalStudents} total students)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pathways.map((pathway) => (
            <div key={pathway.code}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{pathway.code}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{pathway.demand}%</span>
                  {pathway.oversubscribed && (
                    <Badge variant="destructive" className="text-xs">
                      Oversubscribed
                    </Badge>
                  )}
                </div>
              </div>
              <Progress
                value={pathway.demand}
                className={pathway.oversubscribed ? '[&>div]:bg-red-500' : ''}
              />
              {pathway.demand >= 55 && pathway.demand < 60 && (
                <p className="text-xs text-orange-600 mt-1">
                  Approaching 60% threshold - may trigger GPA-based allocation
                </p>
              )}
              {pathway.oversubscribed && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Selection will be based on GPA ranking
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

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

      {/* Pathway Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {pathways.map((pathway) => {
          const isSelected =
            selectedPathway === pathway.code ||
            (currentStudent.degreeProgram === pathway.code && !selectedPathway);

          return (
            <Card
              key={pathway.code}
              className={`transition-all ${
                isSelected
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
                    <span className="text-sm font-bold">{pathway.demand}%</span>
                  </div>
                  <Progress
                    value={pathway.demand}
                    className={pathway.oversubscribed ? '[&>div]:bg-red-500' : ''}
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
                        <Badge key={spec} variant="outline">
                          {spec}
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
                    {pathway.keyModules.slice(0, 4).map((module) => (
                      <li key={module}>• {module}</li>
                    ))}
                  </ul>
                </div>

                {/* Career Paths */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Career Opportunities</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pathway.careerPaths.slice(0, 4).map((career) => (
                      <Badge key={career} variant="secondary" className="text-xs">
                        {career}
                      </Badge>
                    ))}
                  </div>
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

      {/* Confirm Selection */}
      {!isLocked && selectedPathway && selectedPathway !== currentStudent.degreeProgram && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Confirm Your Selection</CardTitle>
            <CardDescription>
              You have selected <strong>{selectedPathway}</strong>. Click confirm to save your choice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={handleConfirmSelection} className="flex-1">
                Confirm Selection
              </Button>
              <Button variant="outline" onClick={() => setSelectedPathway(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
