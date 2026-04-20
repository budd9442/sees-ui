'use client';

import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import {
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
import { useEffect, useState } from 'react';

interface SystemMetrics {
  cpu: number;
  cores: number;
  memory: number;
  storageUsed: string;
  storageTotal: string;
  storagePercentage: number;
  uptime: number;
  health: number;
  activeUsers: number;
  timestamp: string;
}

interface MetricHistoryPoint {
  time: string;
  cpu: number;
  memory: number;
  storage: number;
}

interface AdminDashboardProps {
  metrics: {
    users: {
      total: number;
      active: number;
      activeRecently: number;
    };
    modules: {
      active: number;
    };
    system: {
      health: number;
      uptime: number;
      cpu: number;
      memory: number;
    };
  };
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    time: string;
    status: string;
  }>;
  settingsCount: number;
}

export default function AdminDashboardClient({ metrics, recentActivity, settingsCount }: AdminDashboardProps) {
  const { user } = useAuthStore();

  const [timeRange, setTimeRange] = useState('1h');
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<MetricHistoryPoint[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics from API
  const fetchMetrics = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/metrics?window=${timeRange}`);

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data: SystemMetrics[] = await response.json();

      // Use latest metric for cards (last in array)
      if (data.length > 0) {
        const latest = data[data.length - 1];
        setCurrentMetrics(latest);
        setError(null);

        // Transform all data for graph
        const historyPoints: MetricHistoryPoint[] = data.map(metric => {
          const timestamp = new Date(metric.timestamp);
          const timeStr = timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          return {
            time: timeStr,
            cpu: metric.cpu,
            memory: metric.memory,
            storage: metric.storagePercentage
          };
        });

        setMetricsHistory(historyPoints);
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Poll metrics every 30 seconds
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const totalUsers = currentMetrics?.activeUsers ?? metrics.users.total;
  const activeUsers = currentMetrics?.activeUsers ?? metrics.users.active;
  const systemHealth = currentMetrics?.health ?? metrics.system.health;
  const pendingActions = 3; // Placeholder until we have actionable alerts

  // User activity data (Placeholder/Simulated)
  const userActivity = [
    { day: 'Mon', logins: 145, active: 120 },
    { day: 'Tue', logins: 158, active: 135 },
    { day: 'Wed', logins: 162, active: 140 },
    { day: 'Today', logins: metrics.users.activeRecently, active: activeUsers }, // Injected real data point
  ];

  // System components status
  const systemComponents = [
    { name: 'Database Server', status: 'operational', uptime: 99.9, response: '12ms' },
    { name: 'Application Server', status: 'operational', uptime: 99.8, response: '45ms' },
    { name: 'Authentication Service', status: 'operational', uptime: 100, response: '8ms' },
  ];

  // Audit log entries (Mapped from recentActivity)
  const auditLogs = recentActivity;

  // Configuration items
  const configItems = [
    { category: 'Academic', items: 12, lastModified: '2 days ago' },
    { category: 'User Management', items: 8, lastModified: '1 week ago' },
    { category: 'System Settings', items: settingsCount, lastModified: '3 days ago' },
    { category: 'Security', items: 6, lastModified: '1 day ago' },
    { category: 'Notifications', items: 10, lastModified: '5 days ago' },
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
          <Activity className="h-4 w-4" />
          <AlertTitle>System Update</AlertTitle>
          <AlertDescription>
            You have {pendingActions} pending system actions.
            Email service is now active and ready for user enrollments.
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
            <div className="text-2xl font-bold">{currentMetrics?.cpu ?? 72}%</div>
            <p className="text-xs text-muted-foreground">{currentMetrics?.cores ?? 4} cores active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics?.storageUsed ?? '2.3TB'}</div>
            <p className="text-xs text-muted-foreground">Of {currentMetrics?.storageTotal ?? '5TB'} used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics?.uptime ?? 99.9}%</div>
            <Badge variant="default" className="mt-1">
              {(currentMetrics?.uptime ?? 99.9) >= 99.5 ? 'Excellent' : (currentMetrics?.uptime ?? 99.9) >= 95 ? 'Good' : 'Fair'}
            </Badge>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Performance Metrics</CardTitle>
                <CardDescription>
                  Real-time system resource utilization
                  {metricsHistory.length > 0 && ` (${metricsHistory.length} data points)`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="6h">6 Hours</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fetchMetrics()} disabled={isUpdating}>
                  <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {metricsHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={metricsHistory}>
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
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading performance data...</p>
                  </div>
                </div>
              )}
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
            <Link href="/dashboard/admin/users">
              <Button className="h-24 flex-col gap-2 w-full" variant="outline">
                <Users className="h-6 w-6" />
                <span className="text-xs">User Management</span>
              </Button>
            </Link>
            <Link href="/dashboard/admin/bulk-enroll">
              <Button className="h-24 flex-col gap-2 w-full" variant="outline">
                <Upload className="h-6 w-6" />
                <span className="text-xs">Bulk Enrollment</span>
              </Button>
            </Link>
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
