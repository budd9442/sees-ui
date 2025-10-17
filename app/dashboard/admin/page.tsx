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
  Database,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  Settings,
  Server,
  HardDrive,
  Cpu,
  Clock,
  RefreshCw,
  Lock,
  Key,
  FileText,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { students, staff, modules } = useAppStore();

  const totalUsers = students.length + staff.length;
  const activeUsers = students.filter((s) => s.isActive).length + staff.length;
  const systemHealth = 98.5;
  const pendingActions = 3;

  // System metrics over time
  const systemMetrics = [
    { time: '00:00', cpu: 45, memory: 62, requests: 120 },
    { time: '04:00', cpu: 35, memory: 58, requests: 80 },
    { time: '08:00', cpu: 65, memory: 70, requests: 250 },
    { time: '12:00', cpu: 78, memory: 75, requests: 380 },
    { time: '16:00', cpu: 72, memory: 73, requests: 320 },
    { time: '20:00', cpu: 55, memory: 65, requests: 180 },
  ];

  // User activity data
  const userActivity = [
    { day: 'Mon', logins: 145, active: 120 },
    { day: 'Tue', logins: 158, active: 135 },
    { day: 'Wed', logins: 162, active: 140 },
    { day: 'Thu', logins: 155, active: 130 },
    { day: 'Fri', logins: 148, active: 125 },
    { day: 'Sat', logins: 85, active: 65 },
    { day: 'Sun', logins: 72, active: 55 },
  ];

  // System components status
  const systemComponents = [
    { name: 'Database Server', status: 'operational', uptime: 99.9, response: '12ms' },
    { name: 'Application Server', status: 'operational', uptime: 99.8, response: '45ms' },
    { name: 'Authentication Service', status: 'operational', uptime: 100, response: '8ms' },
    { name: 'File Storage', status: 'operational', uptime: 99.7, response: '25ms' },
    { name: 'Email Service', status: 'maintenance', uptime: 95.5, response: '150ms' },
    { name: 'Backup Service', status: 'operational', uptime: 100, response: '30ms' },
  ];

  // Configuration items
  const configItems = [
    { category: 'Academic', items: 12, lastModified: '2 days ago' },
    { category: 'User Management', items: 8, lastModified: '1 week ago' },
    { category: 'System Settings', items: 15, lastModified: '3 days ago' },
    { category: 'Security', items: 6, lastModified: '1 day ago' },
    { category: 'Notifications', items: 10, lastModified: '5 days ago' },
  ];

  // Audit log entries
  const auditLogs = [
    { id: 1, action: 'User Login', user: 'admin@university.edu', time: '10 minutes ago', status: 'success' },
    { id: 2, action: 'Configuration Changed', user: 'admin@university.edu', time: '1 hour ago', status: 'success' },
    { id: 3, action: 'Bulk User Import', user: 'sarah.wilson@university.edu', time: '3 hours ago', status: 'success' },
    { id: 4, action: 'Failed Login Attempt', user: 'unknown', time: '5 hours ago', status: 'failed' },
    { id: 5, action: 'System Backup', user: 'system', time: '1 day ago', status: 'success' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Administration</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {user?.firstName}! Monitor and manage the SEES platform.
        </p>
      </div>

      {/* System Alerts */}
      {pendingActions > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>System Notifications</AlertTitle>
          <AlertDescription>
            You have {pendingActions} pending system actions requiring attention.
            Email service is currently under maintenance.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{activeUsers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth}%</div>
            <Progress value={systemHealth} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">4 cores active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3TB</div>
            <p className="text-xs text-muted-foreground">Of 5TB used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <Badge variant="default" className="mt-1">Excellent</Badge>
          </CardContent>
        </Card>
      </div>

      {/* System Monitoring Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Metrics</CardTitle>
              <CardDescription>Real-time system resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={systemMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="CPU %"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Memory %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Overview</CardTitle>
              <CardDescription>Login and active user statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="logins" fill="#3b82f6" name="Total Logins" />
                  <Bar dataKey="active" fill="#10b981" name="Active Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Components Status</CardTitle>
              <CardDescription>Monitor critical system services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemComponents.map((component) => (
                  <div key={component.name} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Server className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{component.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Response: {component.response} • Uptime: {component.uptime}%
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(component.status)}>
                      {component.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Manage system settings and parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {configItems.map((item) => (
                  <div key={item.category} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">{item.category}</h4>
                      </div>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.items} configuration items
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last modified: {item.lastModified}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Configuration
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>System activity and security logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.user} • {log.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Full Audit Log
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Actions</CardTitle>
          <CardDescription>Common system administration tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Users className="h-6 w-6" />
              <span className="text-xs">User Management</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Database className="h-6 w-6" />
              <span className="text-xs">Database Backup</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Shield className="h-6 w-6" />
              <span className="text-xs">Security Settings</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Key className="h-6 w-6" />
              <span className="text-xs">API Keys</span>
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline">
              <Lock className="h-6 w-6" />
              <span className="text-xs">Access Control</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
