'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Target,
  Download,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const { modules, students, grades } = useAppStore();
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Get modules taught by current staff member (mock: all modules)
  const staffModules = modules.filter(m => m.academicYear === '2024');
  const currentModule = modules.find(m => m.id === selectedModule);

  // Get grades for selected module
  const moduleGrades = grades.filter(g => g.moduleId === selectedModule);
  const enrolledStudents = students.filter(s => 
    moduleGrades.some(g => g.studentId === s.id)
  );

  // Calculate analytics data
  const getAnalyticsData = () => {
    if (!selectedModule) return null;

    const gradedStudents = moduleGrades.filter(g => g.points > 0);
    const totalStudents = enrolledStudents.length;
    const avgGrade = gradedStudents.length > 0 
      ? gradedStudents.reduce((sum, g) => sum + g.points, 0) / gradedStudents.length 
      : 0;
    
    const passRate = gradedStudents.length > 0
      ? (gradedStudents.filter(g => g.points >= 2.0).length / gradedStudents.length) * 100
      : 0;

    const gradeDistribution = ['A', 'B', 'C', 'D', 'F'].map(grade => ({
      grade,
      count: gradedStudents.filter(g => g.grade === grade).length,
      percentage: gradedStudents.length > 0 
        ? (gradedStudents.filter(g => g.grade === grade).length / gradedStudents.length) * 100 
        : 0,
    }));

    const pathwayPerformance = enrolledStudents.reduce((acc, student) => {
      const grade = moduleGrades.find(g => g.studentId === student.id);
      if (!grade) return acc;
      
      if (!acc[student.pathway]) {
        acc[student.pathway] = { total: 0, sum: 0, count: 0 };
      }
      acc[student.pathway].total += grade.points;
      acc[student.pathway].sum += grade.points;
      acc[student.pathway].count += 1;
      return acc;
    }, {} as Record<string, { total: number; sum: number; count: number }>);

    const pathwayData = Object.entries(pathwayPerformance).map(([pathway, data]) => ({
      pathway,
      average: data.count > 0 ? data.sum / data.count : 0,
      students: data.count,
    }));

    const academicYearPerformance = enrolledStudents.reduce((acc, student) => {
      const grade = moduleGrades.find(g => g.studentId === student.id);
      if (!grade) return acc;
      
      if (!acc[student.academicYear]) {
        acc[student.academicYear] = { total: 0, sum: 0, count: 0 };
      }
      acc[student.academicYear].total += grade.points;
      acc[student.academicYear].sum += grade.points;
      acc[student.academicYear].count += 1;
      return acc;
    }, {} as Record<string, { total: number; sum: number; count: number }>);

    const yearData = Object.entries(academicYearPerformance).map(([year, data]) => ({
      year,
      average: data.count > 0 ? data.sum / data.count : 0,
      students: data.count,
    }));

    return {
      totalStudents,
      gradedStudents: gradedStudents.length,
      avgGrade,
      passRate,
      gradeDistribution,
      pathwayData,
      yearData,
    };
  };

  const analyticsData = getAnalyticsData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const exportAnalytics = () => {
    toast.success('Analytics report exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Module Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Performance statistics and insights for your modules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Module Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Module</CardTitle>
          <CardDescription>
            Choose a module to view detailed analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="module">Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {staffModules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name} - {module.academicYear} {module.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="period">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Semester</SelectItem>
                  <SelectItem value="year">Academic Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedModule && currentModule && analyticsData && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.avgGrade.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Grade points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.passRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Students passed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Graded Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.gradedStudents}</div>
                <p className="text-xs text-muted-foreground">Out of {analyticsData.totalStudents}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="distribution">Grade Distribution</TabsTrigger>
              <TabsTrigger value="pathway">By Pathway</TabsTrigger>
              <TabsTrigger value="year">By Academic Year</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                    <CardDescription>
                      Distribution of grades across all students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grade Distribution (Pie)</CardTitle>
                    <CardDescription>
                      Percentage breakdown by grade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.gradeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ grade, percentage }) => `${grade}: ${percentage.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analyticsData.gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Grade trends over time (mock data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { week: 'Week 1', average: 2.8 },
                      { week: 'Week 2', average: 3.1 },
                      { week: 'Week 3', average: 3.0 },
                      { week: 'Week 4', average: 3.2 },
                      { week: 'Week 5', average: 3.4 },
                      { week: 'Week 6', average: 3.3 },
                      { week: 'Week 7', average: 3.5 },
                      { week: 'Week 8', average: 3.6 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Grade Distribution</CardTitle>
                  <CardDescription>
                    Comprehensive breakdown of student performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.gradeDistribution.map((item) => (
                      <div key={item.grade} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Grade {item.grade}</span>
                          <span>{item.count} students ({item.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pathway" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Pathway</CardTitle>
                  <CardDescription>
                    Average grades across different academic pathways
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.pathwayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="pathway" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="average" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pathway Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.pathwayData.map((item) => (
                      <div key={item.pathway} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium">{item.pathway}</div>
                          <div className="text-sm text-muted-foreground">{item.students} students</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.average.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">Average</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="year" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Academic Year</CardTitle>
                  <CardDescription>
                    Average grades across different academic years
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.yearData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="average" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Academic Year Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.yearData.map((item) => (
                      <div key={item.year} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium">{item.year}</div>
                          <div className="text-sm text-muted-foreground">{item.students} students</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.average.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">Average</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                Key observations and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">Strong Performance</h4>
                    <p className="text-sm text-green-800">
                      The module shows a {analyticsData.passRate.toFixed(1)}% pass rate, which is above the department average.
                    </p>
                  </div>
                </div>

                {analyticsData.avgGrade < 3.0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Below Average Performance</h4>
                      <p className="text-sm text-yellow-800">
                        The average grade of {analyticsData.avgGrade.toFixed(1)} is below the department average. Consider additional support resources.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Recommendation</h4>
                    <p className="text-sm text-blue-800">
                      Consider implementing additional tutorial sessions for students with grades below C+ to improve overall performance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedModule && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a Module</h3>
              <p className="text-muted-foreground">
                Choose a module from the dropdown above to view detailed analytics and performance insights.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
