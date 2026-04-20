'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    BookOpen,
    GraduationCap,
    TrendingUp,
    AlertTriangle,
    FileText,
    UserCheck,
    BarChart3,
    Settings,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HodDashboardViewProps {
    hod: any;
    totalStudents: number;
    totalStaff: number;
    totalModules: number;
    pendingApprovals: number;
    pathwayDemandData: any[];
    academicPerformanceData: any[];
    modulePerformanceData: any[];
    staffWorkloadData: any[];
}

export function HodDashboardView({
    hod,
    totalStudents,
    totalStaff,
    totalModules,
    pendingApprovals,
    pathwayDemandData,
    academicPerformanceData,
    modulePerformanceData,
    staffWorkloadData,
}: HodDashboardViewProps) {
    const totalPathwayApplicants = pathwayDemandData.reduce((acc, row) => acc + Number(row.applicants ?? 0), 0);
    const totalPathwayCapacity = pathwayDemandData.reduce((acc, row) => acc + Number(row.capacity ?? 0), 0);
    const pathwayUtilizationPct =
        totalPathwayCapacity > 0 ? Math.round((totalPathwayApplicants / totalPathwayCapacity) * 100) : 0;

    const overSubscribedPathways = pathwayDemandData
        .filter((row) => Number(row.applicants ?? 0) > Number(row.capacity ?? 0))
        .map((row) => ({
            ...row,
            overflow: Number(row.applicants ?? 0) - Number(row.capacity ?? 0),
        }))
        .sort((a, b) => b.overflow - a.overflow);

    const sortedPerformance = [...academicPerformanceData].sort(
        (a, b) => Number(b.avgGPA ?? 0) - Number(a.avgGPA ?? 0)
    );
    const nonZeroPerformance = sortedPerformance.filter((row) => Number(row.avgGPA ?? 0) > 0);
    const topProgram = nonZeroPerformance[0];

    const sortedModules = [...modulePerformanceData].sort(
        (a, b) => Number(a.avgGPA ?? 0) - Number(b.avgGPA ?? 0)
    );
    const lowestModule = sortedModules[0];

    const highlightNames = new Set([topProgram?.program].filter(Boolean));
    const rankedPrograms = nonZeroPerformance.filter((row) => !highlightNames.has(row.program));
    const avgDepartmentGpa =
        academicPerformanceData.length > 0
            ? (
                academicPerformanceData.reduce((acc, row) => acc + Number(row.avgGPA ?? 0), 0) /
                academicPerformanceData.length
            ).toFixed(2)
            : '0.00';

    const sortedWorkload = [...staffWorkloadData].sort((a, b) => Number(b.modules ?? 0) - Number(a.modules ?? 0));
    const highestLoadStaff = sortedWorkload[0];
    const workloadBaseline =
        staffWorkloadData.length > 0
            ? staffWorkloadData.reduce((acc, row) => acc + Number(row.modules ?? 0), 0) / staffWorkloadData.length
            : 0;
    const maxStaffModules = Math.max(...staffWorkloadData.map(s => Number(s.modules ?? 0)), 1);

    const quickInsights = [
        {
            label: 'Department Avg GPA',
            value: avgDepartmentGpa,
            helper: 'Across active programs',
            icon: TrendingUp,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Department Dashboard</h1>
                    <p className="mt-1 text-muted-foreground">
                        Welcome back, Dr. {hod.lastName}! Overview for {hod.department} Department.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/hod/module-registration" className="inline-flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Config
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/hod/analytics" className="inline-flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Open Analytics
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Link
                    href="/dashboard/hod/analytics"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full cursor-pointer transition-colors hover:border-primary/35 hover:bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStudents}</div>
                            <p className="text-xs text-muted-foreground">Department cohort in active modules</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/hod/analytics"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full cursor-pointer transition-colors hover:border-primary/35 hover:bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Teaching Staff</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStaff}</div>
                            <p className="text-xs text-muted-foreground">Active department staff</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/hod/analytics"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full cursor-pointer transition-colors hover:border-primary/35 hover:bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalModules}</div>
                            <p className="text-xs text-muted-foreground">Across all assigned programs</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/hod/pathways#hod-pending-approvals"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full cursor-pointer transition-colors hover:border-primary/35 hover:bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingApprovals}</div>
                            <p className="text-xs text-muted-foreground">Selection rounds and change requests</p>
                            {pendingApprovals > 0 && (
                                <Badge variant="destructive" className="mt-2">
                                    Action Required
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {quickInsights.map((insight) => {
                    const Icon = insight.icon;
                    return (
                        <Card key={insight.label}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{insight.label}</CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{insight.value}</div>
                                <p className="mt-1 text-xs text-muted-foreground">{insight.helper}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Academic Overview</TabsTrigger>
                    <TabsTrigger value="staff">Staff Workload</TabsTrigger>
                    <TabsTrigger value="pathways">Pathway Demand</TabsTrigger>
                    <TabsTrigger value="actions">Action Queue</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Average GPA by Program</CardTitle>
                                <CardDescription>Current semester performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={academicPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="program" />
                                        <YAxis domain={[0, 4]} />
                                        <Tooltip />
                                        <Bar dataKey="avgGPA" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Department Health Summary</CardTitle>
                                <CardDescription>Quick leadership indicators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="rounded-md border p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top Program</p>
                                    <p className="mt-1 text-sm font-medium">{topProgram?.program || 'Not available'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        GPA {topProgram ? Number(topProgram.avgGPA ?? 0).toFixed(2) : 'N/A'}
                                    </p>
                                </div>

                                <div className="rounded-md border p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lowest GPA Module</p>
                                    <p className="mt-1 text-sm font-medium">{lowestModule ? `${lowestModule.code}: ${lowestModule.module}` : 'Not available'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        GPA {lowestModule ? Number(lowestModule.avgGPA ?? 0).toFixed(2) : 'N/A'}
                                    </p>
                                </div>

                                <div className="rounded-md border p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operational Flags</p>
                                    <div className="mt-1 space-y-1 text-sm">
                                        <p>Pending approvals: <span className="font-semibold">{pendingApprovals}</span></p>
                                        <p>Heaviest workload: <span className="font-semibold">{highestLoadStaff?.name || 'N/A'}</span></p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="staff" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Workload Distribution</CardTitle>
                            <CardDescription>Modules and students per staff member</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {staffWorkloadData.map((staff, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{staff.name}</span>
                                                <Badge variant="outline">{staff.modules} Modules</Badge>
                                            </div>
                                            <span className="text-sm text-muted-foreground">{staff.students} Students total</span>
                                        </div>
                                        <Progress value={(staff.modules / maxStaffModules) * 100} className="h-2" />
                                        {Number(staff.modules ?? 0) > workloadBaseline * 1.25 && (
                                            <p className="text-xs text-amber-600">Above department average load</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pathways" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Specialization Demand vs Capacity</CardTitle>
                                <CardDescription>Current L1 student pathway preferences</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={pathwayDemandData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="applicants" name="Applicants" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="capacity" name="Available Seats" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Capacity Pressure</CardTitle>
                                <CardDescription>Pathways exceeding available seats</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {overSubscribedPathways.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No oversubscribed pathways currently.</p>
                                ) : (
                                    overSubscribedPathways.slice(0, 6).map((row) => (
                                        <div key={row.name} className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{row.name}</p>
                                                <Badge variant="destructive">+{row.overflow}</Badge>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {row.applicants} applicants / {row.capacity} seats
                                            </p>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Approval Queue</CardTitle>
                                <CardDescription>Items requiring HOD decision</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Pending approvals</span>
                                        <Badge variant={pendingApprovals > 0 ? 'destructive' : 'secondary'}>
                                            {pendingApprovals}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Includes closed selection rounds and pending allocation change requests.
                                    </p>
                                </div>
                                <Button asChild className="w-full">
                                    <Link href="/dashboard/hod/pathways#hod-pending-approvals">Review Approval Queue</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Operational Shortcuts</CardTitle>
                                <CardDescription>Frequently used HOD actions</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <Button variant="outline" asChild className="justify-start">
                                    <Link href="/dashboard/hod/eligible">Open Eligible Students</Link>
                                </Button>
                                <Button variant="outline" asChild className="justify-start">
                                    <Link href="/dashboard/hod/rankings">Open Department Rankings</Link>
                                </Button>
                                <Button variant="outline" asChild className="justify-start">
                                    <Link href="/dashboard/hod/analytics">Open Full Analytics</Link>
                                </Button>
                                <Button variant="outline" asChild className="justify-start">
                                    <Link href="/dashboard/hod/module-registration">Manage Module Registration</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
