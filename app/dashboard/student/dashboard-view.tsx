'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    Target,
    Calendar,
    Bell,
    AlertTriangle,
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatRelativeTime } from '@/lib/dateFormatters';
import type { Student, StudentGoalsSummary } from '@/types';

import { AcademicRecoveryCard } from '@/components/student/academic-recovery-card';

interface DashboardViewProps {
    student: Student;
    notifications: any[];
    schedules: any[];
    pathwayDemand: any;
    gpaHistory: { semester: string; gpa: number }[];
    goalsSummary: StudentGoalsSummary;
    graduationRequiredCredits: number;
}

export function DashboardView({ student, notifications, schedules, pathwayDemand, gpaHistory, goalsSummary, graduationRequiredCredits }: DashboardViewProps) {
    const router = useRouter();
    // Use real semester-wise cumulative GPA history
    const gpaData = gpaHistory;

    // Calculate GPA Trend
    let trendPercent = 0;
    let trendAbsolute = 0;
    let isPositive = true;

    if (gpaData.length >= 2) {
        const current = gpaData[gpaData.length - 1].gpa;
        const previous = gpaData[gpaData.length - 2].gpa;
        const diff = current - previous;
        trendAbsolute = Number(Math.abs(diff).toFixed(2));
        trendPercent = previous > 0 ? Number(((Math.abs(diff) / previous) * 100).toFixed(1)) : 0;
        isPositive = diff >= 0;
    }

    // Credit distribution
    const totalRequired = graduationRequiredCredits || 132;
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
            'Second Upper': 'bg-blue-100 text-blue-800 border-blue-200',
            'Second Class Lower': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Second Lower': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Pass': 'bg-gray-100 text-gray-800 border-gray-200',
            Unassigned: 'bg-gray-100 text-gray-800 border-gray-200',
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
            {student.academicYear === "L1" &&
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
                    trend={gpaData.length >= 2 ? { value: trendPercent, absolute: trendAbsolute, isPositive } : undefined}
                    href="/dashboard/student/grades"
                />
                <StatCard
                    title="Credits Earned"
                    value={student.totalCredits}
                    icon={BookOpen}
                    href="/dashboard/student/credits"
                />
                <StatCard
                    title="Academic Year"
                    value={student.academicYear}
                    icon={GraduationCap}
                    href="/dashboard/student/schedule"
                />
                <Link
                    href="/dashboard/student/goals"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/35 cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Active Goal
                                    </p>
                                    <p className="text-base font-semibold">{goalsSummary.activeGoal?.title ?? 'No active goal'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {goalsSummary.completedGoals}/{goalsSummary.totalGoals} completed
                                        {goalsSummary.overdueGoals > 0 ? ` • ${goalsSummary.overdueGoals} overdue` : ''}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                {/* GPA Trend */}
                <Link
                    href="/dashboard/student/grades"
                    className="md:col-span-2 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/35 cursor-pointer">
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
                                {goalsSummary.graphTargets.gpaTargetLine.map((target) => (
                                    <ReferenceLine key={target.goalId} y={target.value} stroke="var(--color-chart-3)" strokeDasharray="6 4" />
                                ))}
                                {goalsSummary.graphTargets.cgpaImprovementLine.map((target) => (
                                    <ReferenceLine key={target.goalId} y={target.value} stroke="var(--color-chart-4)" strokeDasharray="3 3" />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                    </Card>
                </Link>

                {/* Credit Distribution */}
                <Link
                    href="/dashboard/student/credits"
                    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/35 cursor-pointer">
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
                            {goalsSummary.graphTargets.creditsTargetLine.map((target) => (
                                <div key={target.goalId} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Goal Target</span>
                                    <span className="font-medium">{target.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Notifications */}
                <Link
                    href="/dashboard/student/messages"
                    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/35 cursor-pointer">
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
                </Link>

                {/* Pathway Status */}
                {student.degreeProgram && (
                    <Link
                        href="/dashboard/student/pathway"
                        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <Card className="h-full transition-all hover:shadow-lg hover:border-primary/35 cursor-pointer">
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
                    </Link>
                )}
            </div>
        </div >
    );
}
