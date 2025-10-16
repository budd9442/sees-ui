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
  Users,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  GraduationCap,
  Target,
  BarChart3,
  Clock,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Student, Grade } from '@/types';

interface RosterPageProps {
  params: {
    moduleId: string;
  };
}

export default function RosterPage({ params }: RosterPageProps) {
  const { user } = useAuthStore();
  const { students, modules, grades, messages } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const moduleId = params.moduleId;
  const currentModule = modules.find(m => m.id === moduleId);

  // Get students enrolled in this module
  const enrolledStudents = students.filter(student => 
    grades.some(grade => grade.moduleId === moduleId && grade.studentId === student.id)
  );

  // Get grades for this module
  const moduleGrades = grades.filter(grade => grade.moduleId === moduleId);

  // Calculate student statistics
  const getStudentStats = (studentId: string) => {
    const studentGrades = moduleGrades.filter(g => g.studentId === studentId);
    const currentGrade = studentGrades[0]; // Assuming one grade per module
    const attendance = Math.floor(Math.random() * 20) + 80; // Mock attendance percentage
    const lastActive = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Mock last active date
    
    return {
      grade: currentGrade,
      attendance,
      lastActive,
      isAtRisk: attendance < 85 || (currentGrade && currentGrade.points < 2.5),
    };
  };

  // Filter and sort students
  const filteredStudents = enrolledStudents
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'at-risk') {
        const stats = getStudentStats(student.id);
        return matchesSearch && stats.isAtRisk;
      } else if (filterBy === 'high-performers') {
        const stats = getStudentStats(student.id);
        return matchesSearch && stats.grade && stats.grade.points >= 3.5;
      } else if (filterBy === 'no-grade') {
        const stats = getStudentStats(student.id);
        return matchesSearch && !stats.grade;
      }
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'id':
          return a.id.localeCompare(b.id);
        case 'grade':
          const gradeA = getStudentStats(a.id).grade?.points || 0;
          const gradeB = getStudentStats(b.id).grade?.points || 0;
          return gradeB - gradeA;
        case 'attendance':
          const attendanceA = getStudentStats(a.id).attendance;
          const attendanceB = getStudentStats(b.id).attendance;
          return attendanceB - attendanceA;
        default:
          return 0;
      }
    });

  const handleContactStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      toast.success(`Opening contact form for ${student.name}`);
    }
  };

  const handleViewStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    setShowStudentDialog(true);
  };

  const exportRoster = () => {
    toast.success('Roster exported successfully!');
  };

  const getGradeColor = (points?: number) => {
    if (!points) return 'text-gray-500';
    if (points >= 3.5) return 'text-green-600';
    if (points >= 2.5) return 'text-blue-600';
    if (points >= 2.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!currentModule) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Module not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Student Roster</h1>
          <p className="text-muted-foreground mt-1">
            {currentModule.name} - {enrolledStudents.length} students enrolled
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportRoster}>
            <Download className="mr-2 h-4 w-4" />
            Export Roster
          </Button>
        </div>
      </div>

      {/* Module Information */}
      <Card>
        <CardHeader>
          <CardTitle>Module Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Module Code</Label>
              <div className="font-medium">{currentModule.code}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Credits</Label>
              <div className="font-medium">{currentModule.credits}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Academic Year</Label>
              <div className="font-medium">{currentModule.academicYear} {currentModule.semester}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Capacity</Label>
              <div className="font-medium">
                {enrolledStudents.length} / {currentModule.capacity || 50}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledStudents.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const gradedStudents = moduleGrades.filter(g => g.points > 0);
                return gradedStudents.length > 0 
                  ? (gradedStudents.reduce((sum, g) => sum + g.points, 0) / gradedStudents.length).toFixed(1)
                  : '0.0';
              })()}
            </div>
            <p className="text-xs text-muted-foreground">Grade points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {enrolledStudents.filter(s => getStudentStats(s.id).isAtRisk).length}
            </div>
            <p className="text-xs text-muted-foreground">Students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enrolledStudents.filter(s => {
                const stats = getStudentStats(s.id);
                return stats.grade && stats.grade.points >= 3.5;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Students</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            View and manage enrolled students
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
                <Label htmlFor="filter">Filter:</Label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="high-performers">High Performers</SelectItem>
                    <SelectItem value="no-grade">No Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort">Sort by:</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="id">Student ID</SelectItem>
                    <SelectItem value="grade">Grade</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
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
                  <TableHead>Grade</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const stats = getStudentStats(student.id);
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
                        <Badge variant="secondary">{student.pathway}</Badge>
                      </TableCell>
                      <TableCell>
                        {stats.grade ? (
                          <div className={`font-medium ${getGradeColor(stats.grade.points)}`}>
                            {stats.grade.grade} ({stats.grade.points.toFixed(1)})
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No grade</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${getAttendanceColor(stats.attendance)}`}>
                          {stats.attendance}%
                        </div>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Comprehensive view of student information and performance
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (() => {
            const student = students.find(s => s.id === selectedStudent);
            const stats = getStudentStats(selectedStudent);
            if (!student) return null;

            return (
              <div className="space-y-6">
                {/* Student Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Student Name</Label>
                    <div className="font-medium">{student.name}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Student ID</Label>
                    <div className="font-medium">{student.id}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Academic Year</Label>
                    <div className="font-medium">{student.academicYear}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Pathway</Label>
                    <div className="font-medium">{student.pathway}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="font-medium">{student.email}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="font-medium">{student.phone || 'Not provided'}</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance in {currentModule.name}</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Current Grade</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getGradeColor(stats.grade?.points)}`}>
                          {stats.grade ? `${stats.grade.grade} (${stats.grade.points.toFixed(1)})` : 'No Grade'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getAttendanceColor(stats.attendance)}`}>
                          {stats.attendance}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {stats.isAtRisk ? (
                            <Badge variant="destructive">At Risk</Badge>
                          ) : (
                            <Badge variant="default">Good Standing</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Last active: {stats.lastActive.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      Module enrollment: {currentModule.academicYear} {currentModule.semester}
                    </div>
                    {stats.grade && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        Grade released: {stats.grade.isReleased ? 'Yes' : 'No'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={() => handleContactStudent(student.id)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Full Record
                  </Button>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudentDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
