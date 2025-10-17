'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  User,
  Activity,
  AlertCircle,
  CheckCircle2,
  Info,
  Shield,
  Database,
  Settings,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AuditLog } from '@/types';

export default function LogsPage() {
  const { user } = useAuthStore();
  const { auditLogs } = useAppStore();
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Mock audit logs data
  const mockLogs: AuditLog[] = [
    {
      id: 'LOG001',
      userId: 'ADMIN001',
      userEmail: 'admin@university.edu',
      action: 'config_update',
      resource: 'gpa_formula',
      details: 'Updated GPA calculation method to weighted average',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'success',
    },
    {
      id: 'LOG002',
      userId: 'STU001',
      userEmail: 'john.doe@student.edu',
      action: 'grade_view',
      resource: 'grades',
      details: 'Viewed grades for CS101 module',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2024-01-15T14:25:00Z',
      status: 'success',
    },
    {
      id: 'LOG003',
      userId: 'STAFF001',
      userEmail: 'dr.smith@staff.edu',
      action: 'grade_release',
      resource: 'grades',
      details: 'Released grades for CS101 module to students',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T14:20:00Z',
      status: 'success',
    },
    {
      id: 'LOG004',
      userId: 'ADMIN001',
      userEmail: 'admin@university.edu',
      action: 'user_create',
      resource: 'users',
      details: 'Created new user account for student',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T14:15:00Z',
      status: 'success',
    },
    {
      id: 'LOG005',
      userId: 'STU001',
      userEmail: 'john.doe@student.edu',
      action: 'login',
      resource: 'auth',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2024-01-15T14:10:00Z',
      status: 'success',
    },
    {
      id: 'LOG006',
      userId: 'ADMIN001',
      userEmail: 'admin@university.edu',
      action: 'backup_create',
      resource: 'backup',
      details: 'Created full system backup',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T02:00:00Z',
      status: 'success',
    },
    {
      id: 'LOG007',
      userId: 'STU001',
      userEmail: 'john.doe@student.edu',
      action: 'module_register',
      resource: 'modules',
      details: 'Registered for CS102 module',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2024-01-14T16:30:00Z',
      status: 'success',
    },
    {
      id: 'LOG008',
      userId: 'ADMIN001',
      userEmail: 'admin@university.edu',
      action: 'config_error',
      resource: 'gpa_formula',
      details: 'Failed to update GPA formula due to validation error',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-14T15:45:00Z',
      status: 'failed',
    },
    {
      id: 'LOG009',
      userId: 'STAFF001',
      userEmail: 'dr.smith@staff.edu',
      action: 'schedule_update',
      resource: 'schedule',
      details: 'Updated lecture schedule for CS101',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-14T15:30:00Z',
      status: 'success',
    },
    {
      id: 'LOG010',
      userId: 'STU001',
      userEmail: 'john.doe@student.edu',
      action: 'pathway_select',
      resource: 'pathway',
      details: 'Selected Software Engineering pathway',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2024-01-14T14:20:00Z',
      status: 'success',
    },
  ];

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDialog(true);
  };

  const handleExportLogs = (format: 'csv' | 'json' | 'pdf') => {
    toast.success(`Logs exported as ${format.toUpperCase()} successfully!`);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return User;
      case 'logout': return User;
      case 'config_update': return Settings;
      case 'grade_release': return FileText;
      case 'grade_view': return Eye;
      case 'user_create': return User;
      case 'backup_create': return Database;
      case 'module_register': return Calendar;
      case 'schedule_update': return Calendar;
      case 'pathway_select': return Activity;
      case 'config_error': return AlertCircle;
      default: return Activity;
    }
  };

  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'auth': return 'text-purple-600 bg-purple-50';
      case 'grades': return 'text-green-600 bg-green-50';
      case 'users': return 'text-blue-600 bg-blue-50';
      case 'config': return 'text-orange-600 bg-orange-50';
      case 'backup': return 'text-gray-600 bg-gray-50';
      case 'modules': return 'text-indigo-600 bg-indigo-50';
      case 'schedule': return 'text-pink-600 bg-pink-50';
      case 'pathway': return 'text-teal-600 bg-teal-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Filter logs
  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === 'all' || log.userId === filterUser;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesLevel = filterLevel === 'all' || log.status === filterLevel;
    
    const logDate = new Date(log.timestamp);
    const now = new Date();
    let matchesDate = true;
    
    if (dateRange === 'today') {
      matchesDate = logDate.toDateString() === now.toDateString();
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = logDate >= weekAgo;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = logDate >= monthAgo;
    }
    
    return matchesSearch && matchesUser && matchesAction && matchesLevel && matchesDate;
  });

  const getLogStats = () => {
    const total = mockLogs.length;
    const errors = mockLogs.filter(l => l.status === 'failed').length;
    const warnings = mockLogs.filter(l => l.status === 'warning').length;
    const today = mockLogs.filter(l => {
      const logDate = new Date(l.timestamp);
      const now = new Date();
      return logDate.toDateString() === now.toDateString();
    }).length;
    
    return { total, errors, warnings, today };
  };

  const stats = getLogStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze system audit logs and activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportLogs('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">Error level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
            <p className="text-xs text-muted-foreground">Warning level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            <p className="text-xs text-muted-foreground">Today's entries</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">All Logs</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="system">System Events</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                Complete audit trail of system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="user-filter">User:</Label>
                    <Select value={filterUser} onValueChange={setFilterUser}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="ADMIN001">Admin User</SelectItem>
                        <SelectItem value="STU001">John Doe</SelectItem>
                        <SelectItem value="STAFF001">Dr. Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="action-filter">Action:</Label>
                    <Select value={filterAction} onValueChange={setFilterAction}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="config_update">Config Update</SelectItem>
                        <SelectItem value="grade_release">Grade Release</SelectItem>
                        <SelectItem value="user_create">User Create</SelectItem>
                        <SelectItem value="backup_create">Backup Create</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="level-filter">Level:</Label>
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="date-filter">Date:</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const ActionIcon = getActionIcon(log.action);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.userEmail}</div>
                              <div className="text-xs text-muted-foreground">{log.userId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ActionIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{log.action.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getResourceColor(log.resource)}>
                              {log.resource}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getLevelColor(log.status)}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-xs truncate">
                              {log.details}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>
                System errors and exceptions that require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLogs.filter(log => log.status === 'failed').map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <div key={log.id} className="p-4 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <ActionIcon className="h-5 w-5 text-red-600" />
                          <div>
                            <div className="font-medium text-red-900">{log.details}</div>
                            <div className="text-sm text-red-700">
                              {log.userEmail} • {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Badge className="text-red-600 bg-red-100">
                          Error
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>
                User login, logout, and activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLogs.filter(log => ['login', 'logout', 'grade_view', 'module_register', 'pathway_select'].includes(log.action)).map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <div key={log.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ActionIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{log.userEmail}</div>
                            <div className="text-sm text-muted-foreground">{log.details}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Events</CardTitle>
              <CardDescription>
                Configuration changes, backups, and system maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLogs.filter(log => ['config_update', 'backup_create', 'user_create', 'grade_release', 'schedule_update'].includes(log.action)).map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <div key={log.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ActionIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{log.details}</div>
                            <div className="text-sm text-muted-foreground">
                              {log.userEmail} • {log.resource}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Details Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about log entry
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <div className="text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Level</Label>
                  <Badge className={getLevelColor(selectedLog.status)}>
                    {selectedLog.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">User</Label>
                  <div className="text-sm">
                    <div>{selectedLog.userEmail}</div>
                    <div className="text-muted-foreground">{selectedLog.userId}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Action</Label>
                  <div className="text-sm">{selectedLog.action.replace('_', ' ')}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Resource</Label>
                  <Badge className={getResourceColor(selectedLog.resource)}>
                    {selectedLog.resource}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">IP Address</Label>
                  <div className="text-sm font-mono">{selectedLog.ipAddress}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">User Agent</Label>
                  <div className="text-sm font-mono text-xs break-all">{selectedLog.userAgent}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Details</Label>
                <div className="p-3 rounded-lg bg-muted text-sm">
                  {selectedLog.details}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
