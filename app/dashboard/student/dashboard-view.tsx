'use client';

import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/common/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    GraduationCap,
    BookOpen,
    TrendingUp,
    Award,
    Calendar,
    Bell,
    AlertTriangle,
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRelativeTime } from '@/lib/dateFormatters';
import { useRouter } from 'next/navigation';
import type { Student, Notification } from '@/types';

import { AcademicRecoveryCard } from '@/components/student/academic-recovery-card';

interface DashboardViewProps {
    student: Student;
    notifications: any[];
    schedules: any[];
    pathwayDemand: any;
    gpaHistory: { semester: string; gpa: number }[];
}

export function DashboardView({ student, notifications, schedules, pathwayDemand, gpaHistory }: DashboardViewProps) {
    const router = useRouter();

    // Use real semester-wise cumulative GPA history
    const gpaData = gpaHistory;

    // Calculate GPA Trend
    let trendValue = 0;
    let isPositive = true;

    if (gpaData.length >= 2) {
        const current = gpaData[gpaData.length - 1].gpa;
        const previous = gpaData[gpaData.length - 2].gpa;
        const diff = current - previous;
        trendValue = previous ? (Math.abs(diff) / previous) * 100 : 0;
        isPositive = diff >= 0;
    }

    // Credit distribution
    const totalRequired = 120;
    const creditData = [
        { name: 'Completed', value: student.totalCredits, color: '#16a34a' },
        {
            name: 'In Progress',
            value: Math.min(16, totalRequired - student.totalCredits),
            color: '#f59e0b',
        },
        {
            name: 'Remaining',
            value: Math.max(0, totalRequired - student.totalCredits - 16),
            color: '#e5e7eb',
        },
    ];

    const unreadNotifications = notifications.filter((n) => !n.isRead);

    const getClassColor = (academicClass: string) => {
        const colors: Record<string, string> = {
            'First Class': 'bg-green-100 text-green-800 border-green-200',
            'Second Class Upper': 'bg-blue-100 text-blue-800 border-blue-200',
            'Second Class Lower': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Third Class': 'bg-orange-100 text-orange-800 border-orange-200',
            'Pass': 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[academicClass] || colors['Pass'];
    };

    return (
        <div>
            <PageHeader
                title={`Welcome back, ${student.firstName}!`}
                description="Here's your academic overview and recent activity"
            />

            {/* AI Recovery Intervention (FR3.5c) */}
            <div className="mb-6">
                <AcademicRecoveryCard />
            </div>

            {/* Pathway Warning if applicable */}
            {student.academicYear === 'L1' &&
                !student.pathwayLocked &&
                pathwayDemand.thresholdReached && (
                    <Alert className="mb-6 border-orange-500 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            <strong>Action Required:</strong> MIT pathway demand has reached 60%. Selection will be based on GPA ranking.
                            <Button
                                variant="link"
                                className="ml-2 h-auto p-0 text-orange-800 underline"
                                onClick={() => router.push('/dashboard/student/pathway')}
                            >
                                Review your pathway selection
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                    title="Current GPA"
                    value={student.currentGPA.toFixed(2)}
                    icon={TrendingUp}
                    trend={{ value: Number(trendValue.toFixed(1)), isPositive }}
                />
                <StatCard
                    title="Credits Earned"
                    value={student.totalCredits}
                    icon={BookOpen}
                />
                <StatCard
                    title="Academic Year"
                    value={student.academicYear}
                    icon={GraduationCap}
                />
                <Card className="transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Academic Class
                                </p>
                                <Badge
                                    variant="outline"
                                    className={`text-base px-3 py-1 ${getClassColor(
                                        student.academicClass
                                    )}`}
                                >
                                    {student.academicClass}
                                </Badge>
                            </div>
                            <div className="p-3 rounded-full bg-primary/10">
                                <Award className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                {/* GPA Trend */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>GPA Trend</CardTitle>
                        <CardDescription>Your academic performance over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={gpaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="semester"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                                    padding={{ top: 20, bottom: 20 }}
                                />
                                <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                                <Tooltip
                                    cursor={{ stroke: 'var(--color-foreground)', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--color-popover)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-popover-foreground)',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    itemStyle={{ color: 'var(--color-chart-1)' }}
                                    labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '0.25rem' }}
                                    formatter={(value: number) => [`${value.toFixed(2)}`, 'GPA']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="gpa"
                                    stroke="var(--color-chart-1)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorGpa)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Credit Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Credit Progress</CardTitle>
                        <CardDescription>
                            {student.totalCredits} / {totalRequired} credits
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={creditData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    dataKey="value"
                                    label
                                >
                                    {creditData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {creditData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-muted-foreground">{entry.name}</span>
                                    </div>
                                    <span className="font-medium">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            className="w-full justify-start"
                            variant="outline"
                            onClick={() => router.push('/dashboard/student/modules')}
                        >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Register for Modules
                        </Button>
                        <Button
                            className="w-full justify-start"
                            variant="outline"
                            onClick={() => router.push('/dashboard/student/grades')}
                        >
                            <Award className="mr-2 h-4 w-4" />
                            View Grades
                        </Button>
                        <Button
                            className="w-full justify-start"
                            variant="outline"
                            onClick={() => router.push('/dashboard/student/schedule')}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            Check Schedule
                        </Button>
                        <Button
                            className="w-full justify-start"
                            variant="outline"
                            onClick={() => router.push('/dashboard/student/messages')}
                        >
                            <Bell className="mr-2 h-4 w-4" />
                            Contact Advisor
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                        <CardDescription>Important dates and deadlines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {schedules.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No upcoming events
                                </p>
                            ) : (
                                schedules.map((schedule, i) => (
                                    <div
                                        key={schedule.id || i}
                                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{schedule.module?.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {schedule.day} {schedule.startTime} - {schedule.endTime}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Notifications</CardTitle>
                        <CardDescription>
                            {unreadNotifications.length} unread notification
                            {unreadNotifications.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {notifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No notifications yet
                                </p>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border ${!notif.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card'
                                            }`}
                                    >
                                        <Bell
                                            className={`h-4 w-4 mt-0.5 ${!notif.isRead ? 'text-primary' : 'text-muted-foreground'
                                                }`}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{notif.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatRelativeTime(notif.createdAt)}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pathway Status */}
                {student.degreeProgram && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pathway Information</CardTitle>
                            <CardDescription>Your selected academic path</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Degree Program</p>
                                <Badge variant="outline" className="text-base px-3 py-1">
                                    {student.degreeProgram}
                                </Badge>
                            </div>
                            {student.specialization && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Specialization</p>
                                    <Badge variant="outline" className="text-base px-3 py-1">
                                        {student.specialization}
                                    </Badge>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Pathway Status
                                </p>
                                <Badge
                                    variant={student.pathwayLocked ? 'default' : 'secondary'}
                                    className="text-sm"
                                >
                                    {student.pathwayLocked ? 'Locked' : 'Can Change'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div >
    );
}
