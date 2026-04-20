'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getSystemMonitoringData } from '@/lib/actions/admin-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Activity,
  Server,
  Database,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Filter,
  Search,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AuditLog, SystemConfiguration } from '@/types';

export default function SystemMonitoringPage() {
  const { user } = useAuthStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [metrics, setMetrics] = useState<any[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const [systemMetrics, setSystemMetrics] = useState<any>({
    uptime: '—',
    healthScore: 0,
    activeUsers: 0,
    errorRate: '0%',
    failedLoginCount: 0,
    cpuUsage: '0%',
    memoryUsage: '0%',
    diskUsage: '0%',
    databaseConnections: null as number | null,
    emailDispatchSuccessRate: '—',
    emailDispatches24h: 0,
    auditEvents24h: 0,
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemConfigs, setSystemConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logFilter, setLogFilter] = useState('all');

  const fetchMonitoringData = async () => {
    try {
      const data = await getSystemMonitoringData();
      setSystemMetrics(data.metrics);
      setAlerts(data.alerts);
      setAuditLogs(data.logs);
      setSystemConfigs(data.configs);
    } catch (err) {
      console.error('Failed to load system monitoring data:', err);
    }
  };

  const fetchMetricsHistory = async () => {
    try {
      setMetricsLoading(true);
      const response = await fetch(`/api/admin/metrics?window=${selectedTimeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to fetch metrics history:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchMonitoringData(), fetchMetricsHistory()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchMetricsHistory();
    }
  }, [selectedTimeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchMonitoringData(), fetchMetricsHistory()]);
    setIsRefreshing(false);
  };

  const filteredAuditLogs = useMemo(() => {
    if (logFilter === 'all') return auditLogs;
    return auditLogs.filter((log) => log.status === logFilter);
  }, [auditLogs, logFilter]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'healthy':
      case 'info':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'critical':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'gpa':
        return '🎓';
      case 'notifications':
        return '🔔';
      case 'security':
        return '🔒';
      default:
        return '⚙️';
    }
  };

  const performanceData = useMemo(() => {
    if (!metrics) return [];
    return metrics.map((m: any) => ({
      time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: m.cpu,
      memory: m.memory,
      activeUsers: m.activeUsers,
      health: m.health,
    }));
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading system monitoring...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system health, performance metrics, and audit logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last 1 Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Performance Graph Card */}
      <Card>
        <CardHeader>
          <CardTitle>System Resource Utilization</CardTitle>
          <CardDescription>
            CPU, Memory, and Active Users over the selected time range ({selectedTimeRange})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {metricsLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCpu)"
                    name="CPU Usage %"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMem)"
                    name="Memory Usage %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No performance data available for this range.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4" />
              System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.uptime}</div>
            <p className="text-xs text-green-600 mt-1">Operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Current sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <div className="text-xl font-bold">{systemMetrics.cpuUsage}</div>
                <p className="text-[10px] text-muted-foreground">CPU</p>
              </div>
              <div>
                <div className="text-xl font-bold">{systemMetrics.memoryUsage}</div>
                <p className="text-[10px] text-muted-foreground">MEM</p>
              </div>
              <div>
                <div className="text-xl font-bold">{systemMetrics.diskUsage}</div>
                <p className="text-[10px] text-muted-foreground">DISK</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Email Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.emailDispatchSuccessRate}</div>
            <p className="text-xs text-muted-foreground mt-1">Success rate (24h)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active DB connections</span>
                <span className="font-medium">
                  {systemMetrics.databaseConnections != null
                    ? systemMetrics.databaseConnections
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email dispatch success (24h)</span>
                <span className="font-medium">{systemMetrics.emailDispatchSuccessRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Audit events (24h)</span>
                <span className="font-medium">
                  {(systemMetrics.auditEvents24h ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email dispatches (24h)</span>
                <span className="font-medium">
                  {(systemMetrics.emailDispatches24h ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts
              </CardTitle>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <p>All systems operational. No active alerts.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {alert.type === 'error' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : alert.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge className={getAlertColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="config">System Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Audit Logs
                  </CardTitle>
                  <CardDescription>
                    System activity logs and user actions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={logFilter} onValueChange={setLogFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No audit logs found matching the filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[150px] truncate">
                              <div className="font-medium">{log.userEmail}</div>
                              <div className="text-xs text-gray-500">{log.userId}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{log.action}</TableCell>
                          <TableCell className="whitespace-nowrap">{log.resource}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">{log.metadata?.ip_address || '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>
                    Current system settings and configuration values
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemConfigs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No system settings found.
                  </p>
                ) : (
                  systemConfigs.map((config) => (
                    <div key={config.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="text-2xl">{getCategoryIcon(config.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{config.key}</h4>
                          <Badge variant="outline">{config.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                        <div className="bg-gray-50 p-2 rounded text-sm font-mono break-all">
                          {config.value}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
