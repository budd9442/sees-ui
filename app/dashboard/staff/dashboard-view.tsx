'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
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
    Settings,
} from 'lucide-react';
import {
    LineChart,
    Line,
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

interface StaffDashboardViewProps {
    staff: any;
    myModules: any[];
    totalStudents: number;
    pendingGrades: number;
    upcomingClasses: number;
    gradeDistribution: any[];
    moduleWorkload: any[];
    performanceData: any[];
    recentActivities: any[];
    upcomingDeadlines: any[];
}

export function StaffDashboardView({
    staff,
    myModules,
    totalStudents,
    pendingGrades,
    upcomingClasses,
    gradeDistribution,
    moduleWorkload,
    performanceData,
    recentActivities,
    upcomingDeadlines
}: StaffDashboardViewProps) {


    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Staff Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, {staff.firstName}! Here's your teaching overview.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Link
                    href="/dashboard/staff/modules"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Across all modules</p>
                    </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/staff/modules"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Modules Teaching</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myModules.length}</div>
                        <p className="text-xs text-muted-foreground">This semester</p>
                    </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/staff/grades"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingGrades}</div>
                        <p className="text-xs text-muted-foreground">Entries to resolve</p>
                        {pendingGrades > 0 && (
                            <Badge variant="destructive" className="mt-2 text-[10px] font-black uppercase">Action Required</Badge>
                        )}
                    </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/staff/schedule"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Week</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingClasses}</div>
                        <p className="text-xs text-muted-foreground">Classes scheduled</p>
                    </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Performance Trends */}
                <Link
                    href="/dashboard/staff/analytics"
                    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/20 cursor-pointer">
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
                </Link>

                {/* Grade Distribution */}
                <Link
                    href="/dashboard/staff/grades"
                    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/20 cursor-pointer">
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
                </Link>
            </div>

            {/* Module Management and Activities */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Module Workload */}
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                        <div>
                            <CardTitle>My Modules</CardTitle>
                            <CardDescription>Modules you&apos;re teaching this semester</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/staff/modules">View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {moduleWorkload.map((module, index) => (
                                <div key={module.assignmentId ?? `${module.moduleId}-${index}`} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{module.fullName}</p>
                                                <Badge variant="outline">{module.students} students</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {module.name}
                                                {module.academicYear ? ` • ${module.academicYear}` : ''}
                                                {' • '}
                                                {module.pendingGrades} pending grades
                                            </p>
                                        </div>
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`/dashboard/staff/modules/${module.moduleId}`}>View</Link>
                                        </Button>
                                    </div>
                                    <Progress value={module.completion} className="h-2" />
                                    <p className="text-xs text-muted-foreground text-right italic font-medium">
                                        {module.completion}% grading progress
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
                                        {activity.type === 'system' && <Users className="h-4 w-4 text-orange-600" />}
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
                        <Button className="h-24 flex-col gap-2 rounded-2xl bg-primary/5 border-primary/10 hover:bg-primary/10 text-primary transition-all" variant="outline" asChild>
                            <Link href="/dashboard/staff/modules">
                                <BookOpen className="h-6 w-6" />
                                <span className="text-xs font-bold uppercase tracking-tighter">My Modules</span>
                            </Link>
                        </Button>
                        <Button className="h-24 flex-col gap-2 rounded-2xl hover:bg-accent/50 transition-all" variant="outline" asChild>
                            <Link href="/dashboard/staff/schedule">
                                <Calendar className="h-6 w-6" />
                                <span className="text-xs font-bold uppercase tracking-tighter">Global Schedule</span>
                            </Link>
                        </Button>
                        <Button className="h-24 flex-col gap-2 rounded-2xl hover:bg-accent/50 transition-all" variant="outline" asChild>
                            <Link href="/dashboard/staff/analytics">
                                <BarChart3 className="h-6 w-6" />
                                <span className="text-xs font-bold uppercase tracking-tighter">Academic Insights</span>
                            </Link>
                        </Button>
                        <Button className="h-24 flex-col gap-2 rounded-2xl hover:bg-accent/50 transition-all" variant="outline" disabled>
                            <Settings className="h-6 w-6" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Profile Settings</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Deadlines / Sessions - Premium List */}
            <Card className="rounded-3xl border-none shadow-xl shadow-muted/20">
                <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Upcoming Sessions
                    </CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-tight">Scheduled lectures and tutorials for this week</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {upcomingDeadlines.length > 0 ? (
                            upcomingDeadlines.map((deadline) => (
                                <div key={deadline.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{deadline.title}</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                                {deadline.date} • {deadline.type}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-tighter" asChild>
                                        <Link href={`/dashboard/staff/modules/${deadline.moduleId}`}>Prepare</Link>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-3 opacity-10" />
                                <p className="text-sm font-medium">No sessions recorded for this timeframe.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
