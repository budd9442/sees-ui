'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    Server,
    Database,
    ShieldAlert,
    Activity,
    Settings,
    RefreshCw,
    HardDrive,
    Cpu,
    Clock,
    AlertTriangle,
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
    featureFlags: any[];
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
    featureFlags,
    systemMetrics,
    performanceData,
    recentLogs
}: AdminDashboardViewProps) {

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
                    <Button variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Data
                    </Button>
                    <Button>
                        <Settings className="mr-2 h-4 w-4" />
                        Global Settings
                    </Button>
                </div>
            </div>

            {/* Primary Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">{activeSessions} active sessions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Server Status</CardTitle>
                        <Server className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Healthy</div>
                        <p className="text-xs text-muted-foreground">Uptime: {systemMetrics.uptime}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{databaseSize}</div>
                        <p className="text-xs text-muted-foreground">Last backup: {systemMetrics.lastBackup}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Errors</CardTitle>
                        <ShieldAlert className={`h-4 w-4 ${systemErrors > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemErrors}</div>
                        <p className="text-xs text-muted-foreground">In the last 24 hours</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="monitoring" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
                    <TabsTrigger value="users">User Distribution</TabsTrigger>
                    <TabsTrigger value="configuration">Feature Flags</TabsTrigger>
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
                                        <span className="font-medium">{systemMetrics.cpuUsage}%</span>
                                    </div>
                                    <Progress value={systemMetrics.cpuUsage} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> Memory Usage</span>
                                        <span className="font-medium">{systemMetrics.memoryUsage}%</span>
                                    </div>
                                    <Progress value={systemMetrics.memoryUsage} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2"><Database className="h-4 w-4" /> DB Connections</span>
                                        <span className="font-medium">{systemMetrics.dbConnections} / 100</span>
                                    </div>
                                    <Progress value={(systemMetrics.dbConnections / 100) * 100} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Chart */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>System Performance</CardTitle>
                                <CardDescription>Throughput and Response Time over 24h</CardDescription>
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
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Legend />
                                        <Area yAxisId="left" type="monotone" dataKey="throughput" name="Requests/min" stroke="#3b82f6" fillOpacity={1} fill="url(#colorThroughput)" />
                                        <Line yAxisId="right" type="monotone" dataKey="responseTime" name="Response Time (ms)" stroke="#ef4444" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
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
                                <Button className="w-full justify-start mt-2" variant="outline">
                                    <Users className="mr-2 h-4 w-4" /> Manage Student Accounts
                                </Button>
                                <Button className="w-full justify-start mt-2" variant="outline">
                                    <Users className="mr-2 h-4 w-4" /> Manage Staff Accounts
                                </Button>
                                <Button className="w-full justify-start mt-2" variant="outline">
                                    <Users className="mr-2 h-4 w-4" /> Manage Admin Accounts
                                </Button>
                                <Button className="w-full justify-start mt-2 text-red-600 border-red-200 hover:bg-red-50" variant="outline">
                                    <ShieldAlert className="mr-2 h-4 w-4" /> View Suspended Accounts
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Configuration Tab */}
                <TabsContent value="configuration" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Flags</CardTitle>
                            <CardDescription>Toggle system features and modules globally</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {featureFlags.map(flag => (
                                    <div key={flag.flag_id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-base">{flag.name}</span>
                                                <Badge variant={flag.enabled ? 'default' : 'secondary'} className="text-xs">
                                                    {flag.enabled ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{flag.description}</p>
                                        </div>
                                        <Switch checked={flag.enabled} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Logs Tab */}
                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent System Events</CardTitle>
                                <CardDescription>Latest system logs and alerts</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">View All Logs</Button>
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
