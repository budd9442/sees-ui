'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Target,
  Activity,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdvisorDashboard() {
  const { user } = useAuthStore();
  const { students, messages } = useAppStore();

  // Mock data for advisor
  const myStudents = students.slice(0, 24); // Advisor handles 24 students
  const atRiskStudents = myStudents.filter(s => s.currentGPA < 2.5);
  const pendingMessages = 8;
  const scheduledMeetings = 3;

  // GPA trend data
  const gpaTrendData = [
    { month: 'Sep', averageGPA: 3.2 },
    { month: 'Oct', averageGPA: 3.15 },
    { month: 'Nov', averageGPA: 3.18 },
    { month: 'Dec', averageGPA: 3.1 },
    { month: 'Jan', averageGPA: 3.25 },
    { month: 'Feb', averageGPA: 3.3 },
  ];

  // Student performance distribution
  const performanceDistribution = [
    { range: 'Excellent (3.7+)', students: 6, percentage: 25 },
    { range: 'Good (3.0-3.69)', students: 10, percentage: 42 },
    { range: 'Satisfactory (2.5-2.99)', students: 5, percentage: 21 },
    { range: 'At Risk (<2.5)', students: 3, percentage: 12 },
  ];

  // Recent advisee activities
  const recentActivities = [
    { id: 1, student: 'Alice Johnson', activity: 'Pathway selection completed', type: 'success', time: '2 hours ago' },
    { id: 2, student: 'Bob Martinez', activity: 'GPA dropped below 2.5', type: 'warning', time: '1 day ago' },
    { id: 3, student: 'Emma Davis', activity: 'Scheduled advising appointment', type: 'info', time: '2 days ago' },
    { id: 4, student: 'Frank Wilson', activity: 'Module registration completed', type: 'success', time: '3 days ago' },
  ];

  // Upcoming meetings
  const upcomingMeetings = [
    { id: 1, student: 'Alice Johnson', date: '2024-03-15', time: '10:00 AM', topic: 'Career guidance' },
    { id: 2, student: 'Bob Martinez', date: '2024-03-15', time: '2:00 PM', topic: 'Academic recovery plan' },
    { id: 3, student: 'Carol White', date: '2024-03-16', time: '11:00 AM', topic: 'Module selection' },
  ];

  const averageGPA = myStudents.reduce((sum, s) => sum + s.currentGPA, 0) / myStudents.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Advisor Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.firstName}! Monitor and support your advisees.
        </p>
      </div>

      {/* Alert for at-risk students */}
      {atRiskStudents.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            You have {atRiskStudents.length} students at risk who need immediate intervention.
            Review their cases and schedule meetings as necessary.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Advisees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStudents.length}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{atRiskStudents.length}</div>
            <p className="text-xs text-muted-foreground">Need intervention</p>
            {atRiskStudents.length > 0 && (
              <Badge variant="destructive" className="mt-2">Critical</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMessages}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Group performance</p>
          </CardContent>
        </Card>
      </div>

      {/* GPA Trends and Performance Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Average GPA Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Average GPA Trend</CardTitle>
            <CardDescription>Advisee group performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={gpaTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[2.5, 4]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="averageGPA"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center mt-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Current: 3.3</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span>Target: 3.5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>Current advisee performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceDistribution.map((category) => (
                <div key={category.range} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.range}</span>
                    <span className="text-muted-foreground">
                      {category.students} students ({category.percentage}%)
                    </span>
                  </div>
                  <Progress
                    value={category.percentage}
                    className={`h-2 ${
                      category.range.includes('At Risk') ? '[&>div]:bg-red-500' : ''
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Students */}
      <Card>
        <CardHeader>
          <CardTitle>At-Risk Students</CardTitle>
          <CardDescription>Students requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {atRiskStudents.length > 0 ? (
            <div className="space-y-4">
              {atRiskStudents.slice(0, 3).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{student.firstName} {student.lastName}</p>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        GPA: {student.currentGPA.toFixed(2)} • {student.studentId}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Profile</Button>
                    <Button size="sm" variant="default">Schedule Meeting</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No at-risk students. All advisees are performing well!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities and Upcoming Meetings */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Advisee Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your advisees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {activity.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {activity.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {activity.type === 'info' && <MessageCircle className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.student}</span>
                      {' - '}
                      {activity.activity}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Your scheduled advising sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{meeting.student}</p>
                      <p className="text-sm text-muted-foreground">
                        {meeting.date} at {meeting.time} • {meeting.topic}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common advising tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button className="h-24 flex-col gap-2" variant="outline">
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs">Send Message</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Calendar className="h-6 w-6" />
              <span className="text-xs">Schedule Meeting</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Target className="h-6 w-6" />
              <span className="text-xs">Set Goals</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs">Performance Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
