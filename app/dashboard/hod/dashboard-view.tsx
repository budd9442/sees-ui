'use client';

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
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface HodDashboardViewProps {
    hod: any;
    totalStudents: number;
    totalStaff: number;
    totalModules: number;
    pendingApprovals: number;
    pathwayDemandData: any[];
    academicPerformanceData: any[];
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
    staffWorkloadData
}: HodDashboardViewProps) {

    // Department alerts will be populated by real-time monitoring in future phases
    const departmentAlerts: any[] = [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Department Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, Dr. {hod.lastName}! Overview for {hod.department} Department.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Config
                    </Button>
                    <Button>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                    </Button>
                </div>
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
                        <p className="text-xs text-muted-foreground">+5% from last year</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Teaching Staff</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStaff}</div>
                        <p className="text-xs text-muted-foreground">Active faculty</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalModules}</div>
                        <p className="text-xs text-muted-foreground">Across all programs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingApprovals}</div>
                        <p className="text-xs text-muted-foreground">Require your attention</p>
                        {pendingApprovals > 0 && (
                            <Badge variant="destructive" className="mt-2">Action Required</Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Department Alerts */}
            {departmentAlerts.length > 0 && (
                <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            {departmentAlerts.map(alert => (
                                <div key={alert.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className={`h-4 w-4 ${alert.type === 'critical' ? 'text-red-600' :
                                                alert.type === 'warning' ? 'text-orange-500' : 'text-blue-500'
                                            }`} />
                                        <span className="text-sm font-medium">{alert.message}</span>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-8">{alert.action}</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Academic Overview</TabsTrigger>
                    <TabsTrigger value="staff">Staff Workload</TabsTrigger>
                    <TabsTrigger value="pathways">Pathway Demand</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Academic Performance */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Average GPA by Program</CardTitle>
                                <CardDescription>Current semester performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={academicPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="program" />
                                        <YAxis domain={[2.0, 4.0]} />
                                        <Tooltip />
                                        <Bar dataKey="avgGPA" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>

                <TabsContent value="staff" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Workload Distribution</CardTitle>
                            <CardDescription>Modules and students per faculty member</CardDescription>
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
                                        <Progress value={(staff.students / 250) * 100} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pathways" className="space-y-4">
                    <Card>
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
