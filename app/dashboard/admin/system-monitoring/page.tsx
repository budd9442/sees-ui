'use client';

import { useState, useEffect } from 'react';
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
import type { AuditLog, SystemConfiguration } from '@/types';

// Initial states will be populated by fetchMonitoringData

export default function SystemMonitoringPage() {
  const { user } = useAuthStore();
  const [systemMetrics, setSystemMetrics] = useState<any>({
    uptime: '0%', responseTime: '0ms', activeUsers: 0, totalRequests: 0,
    errorRate: '0%', cpuUsage: '0%', memoryUsage: '0%', diskUsage: '0%',
    databaseConnections: 0, cacheHitRate: '0%'
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemConfigs, setSystemConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [logFilter, setLogFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

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

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchMonitoringData().finally(() => setLoading(false));
    } else if (user) {
      setLoading(false); // Done checking role but they aren't authorized
    }
  }, [user]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchMonitoringData();
    setIsRefreshing(false);
  };

  if (!user || user.role !== 'admin' || loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return '🎓';
      case 'user_management': return '👥';
      case 'system_settings': return '⚙️';
      case 'security': return '🔒';
      case 'notifications': return '🔔';
      default: return '📋';
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    if (logFilter === 'all') return true;
    return log.status === logFilter;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Monitoring</h1>
            <p className="text-gray-600">
              Monitor system performance, logs, and configuration settings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={refreshData}
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {systemMetrics.uptime}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {systemMetrics.responseTime}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {systemMetrics.activeUsers.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {systemMetrics.errorRate}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>{systemMetrics.cpuUsage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: systemMetrics.cpuUsage }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>{systemMetrics.memoryUsage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: systemMetrics.memoryUsage }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk Usage</span>
                  <span>{systemMetrics.diskUsage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: systemMetrics.diskUsage }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Connections</span>
                <span className="font-medium">{systemMetrics.databaseConnections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cache Hit Rate</span>
                <span className="font-medium">{systemMetrics.cacheHitRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Requests</span>
                <span className="font-medium">{systemMetrics.totalRequests.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different monitoring views */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="config">System Configuration</TabsTrigger>
        </TabsList>

        {/* System Alerts */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Active and recent system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
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
                        <Badge variant="outline">
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
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
                      <SelectItem value="warning">Warning</SelectItem>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.userEmail}</div>
                          <div className="text-xs text-gray-500">{log.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <div>
                          <div>{log.resource}</div>
                          {log.resourceId && (
                            <div className="text-xs text-gray-500">{log.resourceId}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.ipAddress}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration */}
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
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Configuration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemConfigs.map((config) => (
                  <div key={config.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="text-2xl">{getCategoryIcon(config.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{config.key}</h4>
                        <Badge variant="outline">{config.category}</Badge>
                        <Badge variant="secondary">v{config.version}</Badge>
                        {config.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                      <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                        {config.value}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Last modified: {new Date(config.lastModified).toLocaleString()} by {config.modifiedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Health Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-800">All Systems Operational</h3>
              <p className="text-sm text-green-600">No critical issues detected</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-medium text-yellow-800">Minor Warnings</h3>
              <p className="text-sm text-yellow-600">2 non-critical alerts</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-blue-800">Performance Good</h3>
              <p className="text-sm text-blue-600">Response times within normal range</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
