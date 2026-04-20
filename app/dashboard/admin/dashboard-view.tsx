'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    Server,
    Database,
    ShieldAlert,
    Activity,
    RefreshCw,
    HardDrive,
    Cpu,
    Clock,
    AlertTriangle,
    Mail,
    FileUp,
    Calculator,
    LineChart as ChartIcon,
} from 'lucide-react';

import {
    LineChart,
    Line,
    AreaChart,
    Area,
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

interface AdminDashboardViewProps {
    admin: any;
    totalUsers: number;
    activeSessions: number;
    systemErrors: number;
    databaseSize: string;
    roleDistribution: any[];
    systemMetrics: any;
    performanceData: any[];
    recentLogs: any[];
}

export function AdminDashboardView({
    admin,
    totalUsers,
    activeSessions,
    systemErrors,
    databaseSize,
    roleDistribution,
    systemMetrics,
    performanceData,
    recentLogs
}: AdminDashboardViewProps) {
    const status = systemMetrics?.serverStatusLabel ?? 'Unknown';
    const health = systemMetrics?.healthScore ?? 0;
    const statusIconClass =
        !systemMetrics || health >= 80
            ? 'text-green-500'
            : health >= 50
              ? 'text-amber-500'
              : 'text-red-500';

    const dbConn = systemMetrics?.dbConnections;
    const dbMax = systemMetrics?.dbConnectionsMax ?? 100;
    const connProgress = systemMetrics?.connProgress ?? 0;
    const emailSvc = systemMetrics?.serviceStatus?.email;
    const importSvc = systemMetrics?.serviceStatus?.import;
    const calcSvc = systemMetrics?.serviceStatus?.calculations;
    const monitorSvc = systemMetrics?.serviceStatus?.monitoring;

    const serviceBadgeClass = (statusText?: string) =>
        statusText === 'Healthy'
            ? 'bg-green-100 text-green-800'
            : statusText === 'Processing'
              ? 'bg-blue-100 text-blue-800'
              : statusText === 'Degraded'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-700';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">System Administration</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {admin.firstName}. System status and configuration overview.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/admin" className="inline-flex items-center">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Data
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Primary Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Link
                    href="/dashboard/admin/users"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">{activeSessions} active sessions</p>
                    </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/admin/logs"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Server Status</CardTitle>
                        <Server className={`h-4 w-4 ${statusIconClass}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{status}</div>
                        <p className="text-xs text-muted-foreground">Uptime: {systemMetrics?.uptime ?? 'N/A'}</p>
                    </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/admin/backup"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{databaseSize}</div>
                        <p className="text-xs text-muted-foreground">Last snapshot: {systemMetrics?.lastBackup ?? 'N/A'}</p>
                    </CardContent>
                    </Card>
                </Link>

                <Link
                    href="/dashboard/admin/logs"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Errors</CardTitle>
                        <ShieldAlert className={`h-4 w-4 ${systemErrors > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemErrors}</div>
                        <p className="text-xs text-muted-foreground">In the last 24 hours</p>
                    </CardContent>
                    </Card>
                </Link>
            </div>

            <Tabs defaultValue="monitoring" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
                    <TabsTrigger value="users">User Distribution</TabsTrigger>
                    <TabsTrigger value="logs">System Logs</TabsTrigger>
                </TabsList>

                {/* System Monitoring Tab */}
                <TabsContent value="monitoring" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Real-time metrics */}
                        <Card className="col-span-1 border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Live Resource Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2"><Cpu className="h-4 w-4" /> CPU Usage</span>
                                        <span className="font-medium">{systemMetrics?.cpuUsage ?? 0}%</span>
                                    </div>
                                    <Progress value={systemMetrics?.cpuUsage ?? 0} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> Memory Usage</span>
                                        <span className="font-medium">{systemMetrics?.memoryUsage ?? 0}%</span>
                                    </div>
                                    <Progress value={systemMetrics?.memoryUsage ?? 0} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2"><Database className="h-4 w-4" /> DB Connections</span>
                                        <span className="font-medium">
                                            {dbConn != null ? `${dbConn} / ${dbMax}` : '—'}
                                        </span>
                                    </div>
                                    {dbConn != null ? (
                                        <Progress value={connProgress} className="h-2" />
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Connection stats unavailable</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Chart */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>System Performance</CardTitle>
                                <CardDescription>
                                    Active users and health score (last 24h, hourly samples)
                                </CardDescription>

                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={performanceData}>
                                        <defs>
                                            <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="time" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="activeUsers"
                                            name="Active users (DB)"
                                            stroke="#3b82f6"
                                            fillOpacity={1}
                                            fill="url(#colorThroughput)"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="healthScore"
                                            name="Health score"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Email Service
                                </CardTitle>
                                <CardDescription>Dispatch pipeline status and recent delivery reliability</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge className={serviceBadgeClass(emailSvc?.status)}>{emailSvc?.status ?? 'Unknown'}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Dispatches (1h)</span>
                                    <span className="font-medium">{emailSvc?.dispatches1h ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Success Rate (24h)</span>
                                    <span className="font-medium">{emailSvc?.successRate ?? '—'}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <FileUp className="h-5 w-5" />
                                    LMS Import Service
                                </CardTitle>
                                <CardDescription>Background import queue health and throughput</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge className={serviceBadgeClass(importSvc?.status)}>{importSvc?.status ?? 'Unknown'}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Running Imports</span>
                                    <span className="font-medium">{importSvc?.running ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Completed / Failed (24h)</span>
                                    <span className="font-medium">{importSvc?.ready24h ?? 0} / {importSvc?.failed24h ?? 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Calculation Service
                                </CardTitle>
                                <CardDescription>GPA and academic class background processing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge className={serviceBadgeClass(calcSvc?.status)}>{calcSvc?.status ?? 'Unknown'}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Recalculations (24h)</span>
                                    <span className="font-medium">{(calcSvc?.total24h ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Last Action</span>
                                    <span className="font-medium text-xs truncate">{(calcSvc?.total24h ?? 0) > 0 ? 'Recently active' : 'Idle'}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <ChartIcon className="h-5 w-5" />
                                    Monitoring Service
                                </CardTitle>
                                <CardDescription>Real-time system metrics collection and analysis</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge className={serviceBadgeClass(monitorSvc?.status)}>{monitorSvc?.status ?? 'Unknown'}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Samples Collected (24h)</span>
                                    <span className="font-medium">{(monitorSvc?.samples24h ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Resolution</span>
                                    <span className="font-medium">1 sample / min</span>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>

                {/* User Distribution Tab */}
                <TabsContent value="users" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Distribution</CardTitle>
                                <CardDescription>Breakdown of all registered users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={roleDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                                        >
                                            {roleDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>User Management Actions</CardTitle>
                                <CardDescription>Quick actions for user administration</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button className="w-full justify-start mt-2" variant="outline" asChild>
                                    <Link href="/dashboard/admin/users?tab=students" className="inline-flex items-center">
                                        <Users className="mr-2 h-4 w-4" /> Manage Student Accounts
                                    </Link>
                                </Button>
                                <Button className="w-full justify-start mt-2" variant="outline" asChild>
                                    <Link href="/dashboard/admin/users?tab=staff" className="inline-flex items-center">
                                        <Users className="mr-2 h-4 w-4" /> Manage Staff Accounts
                                    </Link>
                                </Button>
                                <Button className="w-full justify-start mt-2" variant="outline" asChild>
                                    <Link href="/dashboard/admin/users?tab=admins" className="inline-flex items-center">
                                        <Users className="mr-2 h-4 w-4" /> Manage Admin Accounts
                                    </Link>
                                </Button>
                                <Button className="w-full justify-start mt-2 text-red-600 border-red-200 hover:bg-red-50" variant="outline" asChild>
                                    <Link href="/dashboard/admin/users" className="inline-flex items-center">
                                        <ShieldAlert className="mr-2 h-4 w-4" /> View Suspended Accounts
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* System Logs Tab */}
                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent System Events</CardTitle>
                                <CardDescription>Latest system logs and alerts</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/dashboard/admin/logs">View All Logs</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentLogs.map(log => (
                                    <div key={log.id} className={`flex items-start gap-4 p-4 rounded-lg border ${log.level === 'ERROR' ? 'bg-red-50 border-red-200' :
                                        log.level === 'WARN' ? 'bg-orange-50 border-orange-200' : 'bg-card'
                                        }`}>
                                        <div className="mt-0.5">
                                            {log.level === 'ERROR' && <ShieldAlert className="h-5 w-5 text-red-600" />}
                                            {log.level === 'WARN' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                                            {log.level === 'INFO' && <Activity className="h-5 w-5 text-blue-500" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium ${log.level === 'ERROR' ? 'text-red-800' :
                                                    log.level === 'WARN' ? 'text-orange-800' : ''
                                                    }`}>
                                                    {log.message}
                                                </p>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {log.time}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {log.source}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
