'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Calendar,
  BookOpen,
  GraduationCap,
  Target,
  BarChart3,
  FileText,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Student, Grade, AcademicGoal } from '@/types';

export default function RecordsPage() {
  const { user } = useAuthStore();
  const { students, modules, grades, academicGoals, interventions } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterPathway, setFilterPathway] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showStudentDialog, setShowStudentDialog] = useState(false);

  // Get advisor's students (mock: all students)
  const advisorStudents = students.filter(s => s.academicYear === 'L2' || s.academicYear === 'L3');

  // Calculate student statistics
  const getStudentStats = (student: Student) => {
    const studentGrades = grades.filter(g => g.studentId === student.id && g.isReleased);
    const totalPoints = studentGrades.reduce((sum, grade) => sum + (grade.points * grade.credits), 0);
    const totalCredits = studentGrades.reduce((sum, grade) => sum + grade.credits, 0);
    const currentGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
    
    const studentGoals = academicGoals.filter(g => g.studentId === student.id);
    const studentInterventions = interventions.filter(i => i.studentId === student.id);
    
    const isAtRisk = currentGPA < 2.5 || studentGrades.some(g => g.points < 2.0);
    
    return {
      currentGPA,
      totalCredits,
      totalGrades: studentGrades.length,
      goalsCount: studentGoals.length,
      interventionsCount: studentInterventions.length,
      isAtRisk,
    };
  };

  // Filter students
  const filteredStudents = advisorStudents.filter(student => {
    const term = (searchTerm || '').toLowerCase();
    const studentName = (student.name || '').toLowerCase();
    const studentId = (student.id || '').toLowerCase();
    const matchesSearch = studentName.includes(term) || studentId.includes(term);
    
    const stats = getStudentStats(student);
    const matchesRisk = filterRisk === 'all' || 
                       (filterRisk === 'at-risk' && stats.isAtRisk) ||
                       (filterRisk === 'good-standing' && !stats.isAtRisk);
    
    const matchesYear = filterYear === 'all' || student.academicYear === filterYear;
    const matchesPathway = filterPathway === 'all' || student.specialization === filterPathway;
    
    return matchesSearch && matchesRisk && matchesYear && matchesPathway;
  });

  const handleViewStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    setShowStudentDialog(true);
  };

  const handleContactStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      toast.success(`Opening contact form for ${student.name}`);
    }
  };

  const exportRecords = () => {
    toast.success('Academic records exported successfully!');
  };

  const getAcademicClass = (gpa: number) => {
    if (gpa >= 3.7) return 'First Class';
    if (gpa >= 3.0) return 'Second Upper';
    if (gpa >= 2.5) return 'Second Lower';
    return 'Third/Pass';
  };

  const getGpaTrendData = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.isReleased);
    // Mock trend data based on current GPA
    const currentGPA = studentGrades.length > 0 
      ? studentGrades.reduce((sum, g) => sum + g.points, 0) / studentGrades.length 
      : 0;
    
    return [
      { semester: 'S1 2023', gpa: Math.max(0, currentGPA - 0.3) },
      { semester: 'S2 2023', gpa: Math.max(0, currentGPA - 0.1) },
      { semester: 'S1 2025', gpa: Math.max(0, currentGPA + 0.1) },
      { semester: 'S2 2025', gpa: currentGPA },
    ];
  };

  const getGradeDistribution = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.isReleased);
    const distribution = ['A', 'B', 'C', 'D', 'F'].map(grade => ({
      grade,
      count: studentGrades.filter(g => g.letterGrade === grade).length,
    }));
    return distribution;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Academic Records</h1>
          <p className="text-muted-foreground mt-1">
            View and manage academic records for all your advisees
          </p>
        </div>
        <Button variant="outline" onClick={exportRecords}>
          <Download className="mr-2 h-4 w-4" />
          Export Records
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Advisees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advisorStudents.length}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {advisorStudents.filter(s => getStudentStats(s).isAtRisk).length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Good Standing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {advisorStudents.filter(s => !getStudentStats(s).isAtRisk).length}
            </div>
            <p className="text-xs text-muted-foreground">On track</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const totalGPA = advisorStudents.reduce((sum, s) => sum + getStudentStats(s).currentGPA, 0);
                return advisorStudents.length > 0 ? (totalGPA / advisorStudents.length).toFixed(2) : '0.00';
              })()}
            </div>
            <p className="text-xs text-muted-foreground">Cohort average</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Student Records</CardTitle>
          <CardDescription>
            Filter and search through your advisees' academic records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="risk-filter">Risk:</Label>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="good-standing">Good Standing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="year-filter">Year:</Label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="L1">L1</SelectItem>
                    <SelectItem value="L2">L2</SelectItem>
                    <SelectItem value="L3">L3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="pathway-filter">Pathway:</Label>
                <Select value={filterPathway} onValueChange={setFilterPathway}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Pathway</TableHead>
                  <TableHead>Current GPA</TableHead>
                  <TableHead>Academic Class</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const stats = getStudentStats(student);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.academicYear}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.specialization}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{stats.currentGPA.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{getAcademicClass(stats.currentGPA)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{stats.totalCredits}</div>
                      </TableCell>
                      <TableCell>
                        {stats.isAtRisk ? (
                          <Badge variant="destructive">At Risk</Badge>
                        ) : (
                          <Badge variant="default">Good Standing</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewStudent(student.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleContactStudent(student.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Academic Record</DialogTitle>
            <DialogDescription>
              Comprehensive academic record for {students.find(s => s.id === selectedStudent)?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (() => {
            const student = students.find(s => s.id === selectedStudent);
            if (!student) return null;

            const stats = getStudentStats(student);
            const gpaTrendData = getGpaTrendData(student.id);
            const gradeDistribution = getGradeDistribution(student.id);
            const studentGrades = grades.filter(g => g.studentId === student.id && g.isReleased);
            const studentGoals = academicGoals.filter(g => g.studentId === student.id);
            const studentInterventions = interventions.filter(i => i.studentId === student.id);

            return (
              <div className="space-y-6">
                {/* Student Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.currentGPA.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Grade points</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Academic Class</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{getAcademicClass(stats.currentGPA)}</div>
                      <p className="text-xs text-muted-foreground">Current standing</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalCredits}</div>
                      <p className="text-xs text-muted-foreground">Out of 120 required</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Risk Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.isAtRisk ? (
                          <Badge variant="destructive">At Risk</Badge>
                        ) : (
                          <Badge variant="default">Good Standing</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Academic status</p>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="interventions">Interventions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>GPA Trend</CardTitle>
                          <CardDescription>
                            Academic performance over time
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={gpaTrendData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="semester" />
                              <YAxis domain={[0, 4]} />
                              <Tooltip />
                              <Line type="monotone" dataKey="gpa" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Grade Distribution</CardTitle>
                          <CardDescription>
                            Distribution of grades earned
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={gradeDistribution}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="grade" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="grades" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Academic Record</CardTitle>
                        <CardDescription>
                          Complete grade history
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Module</TableHead>
                              <TableHead>Code</TableHead>
                              <TableHead>Credits</TableHead>
                              <TableHead>Grade</TableHead>
                              <TableHead>Points</TableHead>
                              <TableHead>Semester</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentGrades.map((grade) => {
                              const module = modules.find(m => m.id === grade.moduleId);
                              return (
                                <TableRow key={grade.id}>
                                  <TableCell className="font-medium">{module?.title}</TableCell>
                                  <TableCell>{module?.code}</TableCell>
                                  <TableCell>{grade.credits}</TableCell>
                                  <TableCell>
                                    <Badge variant={grade.letterGrade === 'F' ? 'destructive' : 'default'}>
                                      {grade.letterGrade}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{grade.points.toFixed(1)}</TableCell>
                                  <TableCell>{grade.semester}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="goals" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Academic Goals</CardTitle>
                        <CardDescription>
                          Student's academic and personal goals
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {studentGoals.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <Target className="h-12 w-12 mx-auto mb-4" />
                              <p>No goals set yet</p>
                            </div>
                          ) : (
                            studentGoals.map((goal) => (
                              <div key={goal.id} className="p-4 rounded-lg border">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold">{goal.title}</h4>
                                    {goal.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                                    )}
                                  </div>
                                  <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                                    {goal.priority}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{goal.currentProgress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${goal.currentProgress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="interventions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Academic Interventions</CardTitle>
                        <CardDescription>
                          History of academic support and interventions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {studentInterventions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                              <p>No interventions recorded</p>
                            </div>
                          ) : (
                            studentInterventions.map((intervention) => (
                              <div key={intervention.id} className="p-4 rounded-lg border">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold">{intervention.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{intervention.description}</p>
                                  </div>
                                  <Badge variant={intervention.severity === 'high' ? 'destructive' : intervention.severity === 'medium' ? 'default' : 'secondary'}>
                                    {intervention.severity}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="text-sm text-muted-foreground">
                                    Type: {intervention.type.replace('_', ' ')}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Created: {new Date(intervention.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Status: {intervention.status}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudentDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowStudentDialog(false);
              handleContactStudent(selectedStudent);
            }}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
