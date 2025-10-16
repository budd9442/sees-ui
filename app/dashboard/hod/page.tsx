'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  TrendingUp,
  GraduationCap,
  AlertTriangle,
  BarChart3,
  FileText,
  Download,
  Building2,
  Award,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function HODDashboard() {
  const { user } = useAuthStore();
  const { students, pathwayDemand, modules } = useAppStore();

  const totalStudents = students.length;
  const averageGPA = students.reduce((sum, s) => sum + s.currentGPA, 0) / totalStudents;
  const retentionRate = 94.5;
  const graduationRate = 88.2;

  // Performance trends over years
  const performanceTrends = [
    { year: '2020', avgGPA: 3.15, retention: 91, graduation: 85 },
    { year: '2021', avgGPA: 3.22, retention: 92, graduation: 86 },
    { year: '2022', avgGPA: 3.28, retention: 93, graduation: 87 },
    { year: '2023', avgGPA: 3.35, retention: 94, graduation: 88 },
    { year: '2024', avgGPA: 3.40, retention: 94.5, graduation: 88.2 },
  ];

  // Pathway distribution with capacity
  const pathwayDistribution = [
    { name: 'MIT', demand: pathwayDemand.MIT, capacity: 100, enrolled: 65, color: '#3b82f6' },
    { name: 'IT', demand: pathwayDemand.IT, capacity: 100, enrolled: 35, color: '#10b981' },
  ];

  // Academic class distribution
  const classDistribution = [
    { name: 'First Class (3.7+)', value: 20, count: Math.floor(totalStudents * 0.2), color: '#16a34a' },
    { name: 'Second Upper (3.0-3.69)', value: 35, count: Math.floor(totalStudents * 0.35), color: '#3b82f6' },
    { name: 'Second Lower (2.5-2.99)', value: 30, count: Math.floor(totalStudents * 0.3), color: '#f59e0b' },
    { name: 'Third/Pass (<2.5)', value: 15, count: Math.floor(totalStudents * 0.15), color: '#ef4444' },
  ];

  // Department performance metrics
  const performanceMetrics = [
    { metric: 'Teaching Quality', current: 85, target: 90 },
    { metric: 'Research Output', current: 72, target: 80 },
    { metric: 'Student Satisfaction', current: 88, target: 90 },
    { metric: 'Industry Collaboration', current: 65, target: 75 },
    { metric: 'Resource Utilization', current: 78, target: 85 },
  ];

  // Department radar chart data
  const radarData = [
    { subject: 'Academic Excellence', A: 85, fullMark: 100 },
    { subject: 'Student Support', A: 90, fullMark: 100 },
    { subject: 'Research', A: 72, fullMark: 100 },
    { subject: 'Industry Links', A: 65, fullMark: 100 },
    { subject: 'Innovation', A: 80, fullMark: 100 },
    { subject: 'Infrastructure', A: 75, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Head of Department Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {user?.firstName}! Department performance overview and analytics.
        </p>
      </div>

      {/* Critical Alerts */}
      {pathwayDemand.thresholdReached && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pathway Allocation Alert</AlertTitle>
          <AlertDescription>
            MIT pathway has reached {pathwayDemand.MIT}% demand (threshold: 60%).
            GPA-based allocation is now active for new pathway selections.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+0.05 from last sem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionRate}%</div>
            <p className="text-xs text-muted-foreground">Above target</p>
            <Badge variant="default" className="mt-2">Excellent</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduation Rate</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graduationRate}%</div>
            <p className="text-xs text-muted-foreground">4-year completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="pathways">Pathway Analysis</TabsTrigger>
          <TabsTrigger value="department">Department Metrics</TabsTrigger>
          <TabsTrigger value="distribution">Class Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Year Performance Trends</CardTitle>
              <CardDescription>Department performance indicators over the last 5 years</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" domain={[3, 4]} />
                  <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgGPA"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Average GPA"
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="retention"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Retention Rate %"
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="graduation"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Graduation Rate %"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathways" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pathway Demand vs Capacity</CardTitle>
                <CardDescription>Current allocation status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pathwayDistribution.map((pathway) => (
                    <div key={pathway.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{pathway.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {pathway.enrolled}/{pathway.capacity} enrolled
                        </span>
                      </div>
                      <Progress
                        value={(pathway.enrolled / pathway.capacity) * 100}
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Demand: {pathway.demand}%</span>
                        <span>Capacity: {((pathway.enrolled / pathway.capacity) * 100).toFixed(0)}% full</span>
                      </div>
                      {pathway.demand >= 60 && (
                        <Badge variant="destructive" className="text-xs">
                          GPA-based allocation active
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Current"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department KPI Performance</CardTitle>
              <CardDescription>Progress towards annual targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{metric.metric}</span>
                      <span className="text-sm">
                        <span className="font-semibold">{metric.current}%</span>
                        <span className="text-muted-foreground"> / {metric.target}%</span>
                      </span>
                    </div>
                    <Progress
                      value={(metric.current / metric.target) * 100}
                      className={`h-2 ${
                        metric.current >= metric.target ? '[&>div]:bg-green-500' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Class Distribution</CardTitle>
              <CardDescription>Student performance breakdown by academic class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={classDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => `${(props.percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {classDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {classDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.count} students</p>
                        </div>
                      </div>
                      <Badge variant="outline">{item.value}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Department management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <Button className="h-24 flex-col gap-2" variant="outline">
              <FileText className="h-6 w-6" />
              <span className="text-xs">Generate Report</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Download className="h-6 w-6" />
              <span className="text-xs">Export Analytics</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs">View Trends</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Users className="h-6 w-6" />
              <span className="text-xs">Staff Review</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Award className="h-6 w-6" />
              <span className="text-xs">Recognition</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
