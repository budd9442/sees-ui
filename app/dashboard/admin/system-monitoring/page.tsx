'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
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

// Mock data for system monitoring
const mockSystemMetrics = {
  uptime: '99.9%',
  responseTime: '245ms',
  activeUsers: 1247,
  totalRequests: 45678,
  errorRate: '0.2%',
  cpuUsage: '45%',
  memoryUsage: '67%',
  diskUsage: '78%',
  databaseConnections: 23,
  cacheHitRate: '94%'
};

const mockAlerts = [
  {
    id: 'alert-001',
    type: 'warning',
    title: 'High Memory Usage',
    description: 'Memory usage has exceeded 80% threshold',
    timestamp: '2025-12-15T14:30:00Z',
    severity: 'medium',
    status: 'active'
  },
  {
    id: 'alert-002',
    type: 'error',
    title: 'Database Connection Pool Exhausted',
    description: 'All database connections are in use',
    timestamp: '2025-12-15T14:25:00Z',
    severity: 'high',
    status: 'resolved'
  },
  {
    id: 'alert-003',
    type: 'info',
    title: 'Scheduled Maintenance',
    description: 'System maintenance scheduled for tonight',
    timestamp: '2025-12-15T10:00:00Z',
    severity: 'low',
    status: 'scheduled'
  }
];

const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    userId: 'ADMIN001',
    userEmail: 'admin@university.edu',
    action: 'USER_CREATED',
    resource: 'User',
    resourceId: 'STU123',
    details: { email: 'newstudent@university.edu', role: 'student' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2025-12-15T15:30:00Z',
    status: 'success'
  },
  {
    id: 'audit-002',
    userId: 'STAFF001',
    userEmail: 'staff@university.edu',
    action: 'GRADE_UPLOADED',
    resource: 'Grade',
    resourceId: 'GRD456',
    details: { moduleId: 'MOD001', studentCount: 45 },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: '2025-12-15T15:25:00Z',
    status: 'success'
  },
  {
    id: 'audit-003',
    userId: 'STU001',
    userEmail: 'student@university.edu',
    action: 'LOGIN_FAILED',
    resource: 'Authentication',
    details: { reason: 'Invalid password' },
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    timestamp: '2025-12-15T15:20:00Z',
    status: 'failed'
  }
];

const mockSystemConfigs: SystemConfiguration[] = [
  {
    id: 'config-001',
    category: 'academic',
    key: 'gpa_calculation_formula',
    value: 'weighted_average',
    description: 'Formula used for GPA calculation',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T10:00:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-002',
    category: 'user_management',
    key: 'max_login_attempts',
    value: '5',
    description: 'Maximum login attempts before account lockout',
    isActive: true,
    version: 2,
    lastModified: '2025-12-15T09:30:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-003',
    category: 'system_settings',
    key: 'session_timeout',
    value: '3600',
    description: 'Session timeout in seconds',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T08:00:00Z',
    modifiedBy: 'ADMIN001'
  }
];

export default function SystemMonitoringPage() {
  const { user } = useAuthStore();
  const [systemMetrics, setSystemMetrics] = useState(mockSystemMetrics);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [systemConfigs, setSystemConfigs] = useState(mockSystemConfigs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [logFilter, setLogFilter] = useState('all');

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

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
