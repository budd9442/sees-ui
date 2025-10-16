'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { PageHeader } from '@/components/layout/page-header';
import { GradeCard } from '@/components/common/grade-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { calculateGPA, calculateSemesterGPA } from '@/lib/gpaCalculations';
import type { Student } from '@/types';

export default function GradesPage() {
  const { user } = useAuthStore();
  const { students, grades } = useAppStore();
  const [selectedSemester, setSelectedSemester] = useState('all');

  const currentStudent = students.find((s) => s.email === user?.email) as Student | undefined;

  if (!currentStudent) {
    return <div>Loading...</div>;
  }

  const studentGrades = grades.filter(
    (g) => g.studentId === currentStudent.studentId && g.isReleased
  );

  // Group grades by semester
  const gradesBySemester = studentGrades.reduce((acc, grade) => {
    const key = `${grade.academicYear}-${grade.semester}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(grade);
    return acc;
  }, {} as Record<string, typeof studentGrades>);

  const semesters = Object.keys(gradesBySemester).sort();

  // Calculate GPAs
  const overallGPA = calculateGPA(studentGrades);
  const semesterGPAs = semesters.map((sem) => {
    const [year, semester] = sem.split('-');
    return {
      semester: sem,
      gpa: calculateGPA(gradesBySemester[sem]),
    };
  });

  // Grade distribution data
  const gradeDistribution = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'].map(
    (grade) => ({
      grade,
      count: studentGrades.filter((g) => g.letterGrade === grade).length,
    })
  );

  const filteredGrades =
    selectedSemester === 'all'
      ? studentGrades
      : gradesBySemester[selectedSemester] || [];

  const currentSemesterGPA =
    selectedSemester === 'all'
      ? overallGPA
      : calculateGPA(gradesBySemester[selectedSemester] || []);

  const totalCredits = filteredGrades.reduce((sum, g) => sum + g.credits, 0);

  return (
    <div>
      <PageHeader
        title="My Grades"
        description="View your academic performance and grade history"
      >
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Transcript
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Cumulative GPA
              </p>
              <p className="text-3xl font-bold">{overallGPA.toFixed(2)}</p>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">+0.12</span>
                <span className="text-muted-foreground">from last semester</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Current Semester
              </p>
              <p className="text-3xl font-bold">
                {semesterGPAs[semesterGPAs.length - 1]?.gpa.toFixed(2) || '0.00'}
              </p>
              <Badge variant="outline">{semesters[semesters.length - 1] || 'N/A'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Credits
              </p>
              <p className="text-3xl font-bold">{currentStudent.totalCredits}</p>
              <p className="text-sm text-muted-foreground">
                {studentGrades.length} modules completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Academic Class
              </p>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {currentStudent.academicClass}
              </Badge>
              <p className="text-sm text-muted-foreground">Based on GPA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Grade Distribution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Breakdown of your grades across all modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="grade" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GPA Trend */}
        <Card>
          <CardHeader>
            <CardTitle>GPA Progression</CardTitle>
            <CardDescription>Semester by semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {semesterGPAs.map((item, index) => {
                const prevGPA = index > 0 ? semesterGPAs[index - 1].gpa : item.gpa;
                const change = item.gpa - prevGPA;
                const isIncrease = change >= 0;

                return (
                  <div
                    key={item.semester}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{item.semester}</p>
                      <p className="text-2xl font-bold">{item.gpa.toFixed(2)}</p>
                    </div>
                    {index > 0 && (
                      <div
                        className={`flex items-center gap-1 ${
                          isIncrease ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isIncrease ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {Math.abs(change).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades by Semester */}
      <Card>
        <CardHeader>
          <CardTitle>Module Grades</CardTitle>
          <CardDescription>
            View your grades by semester or all at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSemester} onValueChange={setSelectedSemester}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Semesters</TabsTrigger>
              {semesters.map((sem) => (
                <TabsTrigger key={sem} value={sem}>
                  {sem}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mb-6 flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedSemester === 'all' ? 'Overall' : selectedSemester} GPA
                </p>
                <p className="text-2xl font-bold">{currentSemesterGPA.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{totalCredits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modules</p>
                <p className="text-2xl font-bold">{filteredGrades.length}</p>
              </div>
            </div>

            <TabsContent value={selectedSemester} className="mt-0">
              {filteredGrades.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No grades available</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredGrades.map((grade) => (
                    <GradeCard
                      key={grade.id}
                      moduleCode={grade.moduleCode}
                      moduleTitle={grade.moduleTitle}
                      grade={grade.grade}
                      letterGrade={grade.letterGrade}
                      credits={grade.credits}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
