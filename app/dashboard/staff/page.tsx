'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Award,
  ClipboardCheck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const { modules, students, grades } = useAppStore();

  // Mock data for staff member
  const myModules = modules.slice(0, 4); // Staff teaches 4 modules
  const totalStudents = 156;
  const assignmentsToGrade = 23;
  const upcomingClasses = 5;

  // Performance data
  const performanceData = [
    { month: 'Jan', avgGrade: 72 },
    { month: 'Feb', avgGrade: 75 },
    { month: 'Mar', avgGrade: 71 },
    { month: 'Apr', avgGrade: 78 },
    { month: 'May', avgGrade: 76 },
    { month: 'Jun', avgGrade: 80 },
  ];

  // Grade distribution
  const gradeDistribution = [
    { name: 'A (80-100)', value: 25, color: '#10b981' },
    { name: 'B (70-79)', value: 35, color: '#3b82f6' },
    { name: 'C (60-69)', value: 28, color: '#f59e0b' },
    { name: 'D (50-59)', value: 10, color: '#ef4444' },
    { name: 'F (<50)', value: 2, color: '#6b7280' },
  ];

  // Module workload
  const moduleWorkload = myModules.map(module => ({
    name: module.code,
    fullName: module.title,
    students: Math.floor(Math.random() * 40) + 20,
    assignments: Math.floor(Math.random() * 5) + 2,
    completion: Math.floor(Math.random() * 40) + 60,
  }));

  // Recent activities
  const recentActivities = [
    { id: 1, type: 'grade', description: 'Graded CS301 midterm exams', time: '2 hours ago' },
    { id: 2, type: 'upload', description: 'Uploaded lecture materials for SE302', time: '5 hours ago' },
    { id: 3, type: 'meeting', description: 'Department meeting scheduled', time: '1 day ago' },
    { id: 4, type: 'assignment', description: 'Created new assignment for DB303', time: '2 days ago' },
    { id: 5, type: 'feedback', description: 'Received student feedback for CS301', time: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.firstName}! Here's your teaching overview.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules Teaching</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myModules.length}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentsToGrade}</div>
            <p className="text-xs text-muted-foreground">Assignments to review</p>
            {assignmentsToGrade > 0 && (
              <Badge variant="destructive" className="mt-2">Action Required</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingClasses}</div>
            <p className="text-xs text-muted-foreground">Classes scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Student Performance Trends</CardTitle>
            <CardDescription>Average grades across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgGrade"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Current semester grade breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => `${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Module Management and Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Module Workload */}
        <Card>
          <CardHeader>
            <CardTitle>My Modules</CardTitle>
            <CardDescription>Modules you're teaching this semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleWorkload.map((module) => (
                <div key={module.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{module.fullName}</p>
                        <Badge variant="outline">{module.students} students</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {module.fullName} • {module.assignments} pending assignments
                      </p>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                  <Progress value={module.completion} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {module.completion}% semester complete
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {activity.type === 'grade' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {activity.type === 'upload' && <FileText className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-purple-600" />}
                    {activity.type === 'assignment' && <BookOpen className="h-4 w-4 text-orange-600" />}
                    {activity.type === 'feedback' && <Award className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button className="h-24 flex-col gap-2" variant="outline">
              <FileText className="h-6 w-6" />
              <span className="text-xs">Grade Assignments</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Calendar className="h-6 w-6" />
              <span className="text-xs">Schedule Class</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Users className="h-6 w-6" />
              <span className="text-xs">View Students</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Important dates to remember</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">CS301 Final Grades</p>
                  <p className="text-sm text-muted-foreground">Submit final grades for review</p>
                </div>
              </div>
              <Badge variant="destructive">2 days left</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">SE302 Project Reviews</p>
                  <p className="text-sm text-muted-foreground">Complete project evaluations</p>
                </div>
              </div>
              <Badge variant="outline">5 days left</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Department Meeting</p>
                  <p className="text-sm text-muted-foreground">Monthly faculty meeting</p>
                </div>
              </div>
              <Badge variant="secondary">Next week</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
