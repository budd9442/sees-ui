'use client';

import { useState } from 'react';
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
    Database,
    Settings,
    Calendar,
    Mail,
} from 'lucide-react';
import { toast } from 'sonner';

function safeLower(v: unknown): string {
    if (v == null) return '';
    return String(v).toLowerCase();
}

function logDetails(log: Record<string, unknown>): string {
    return String(log.details ?? log.message ?? '');
}

function logUserEmail(log: Record<string, unknown>): string {
    return String(log.userEmail ?? log.source ?? '');
}

function logUserId(log: Record<string, unknown>): string {
    return String(log.userId ?? log.userEmail ?? log.source ?? '');
}

function logResource(log: Record<string, unknown>): string {
    const m = log.metadata as { entity_type?: string; entity_id?: string } | undefined;
    return String(log.resource ?? m?.entity_type ?? 'audit');
}

function logAction(log: Record<string, unknown>): string {
    return String(log.action ?? 'audit');
}

function logStatus(log: Record<string, unknown>): string {
    return safeLower(log.status ?? log.level ?? 'info');
}

/** Audit `category` or merged feed `source` (e.g. NOTIFICATION_DISPATCH). */
function logCategory(log: Record<string, unknown>): string {
    const m = log.metadata as { category?: string } | undefined;
    return String(m?.category ?? log.source ?? '');
}

function logIpAddress(log: Record<string, unknown>): string {
    const m = log.metadata as { ip_address?: string } | undefined;
    return String(log.ipAddress ?? m?.ip_address ?? '');
}

function isUserActivityLog(log: Record<string, unknown>): boolean {
    const a = logAction(log);
    if (['login', 'logout', 'grade_view', 'module_register', 'pathway_select'].includes(a)) return true;
    return a.startsWith('AUTH_');
}

function isSystemEventLog(log: Record<string, unknown>): boolean {
    const a = logAction(log);
    if (['config_update', 'backup_create', 'user_create', 'grade_release', 'schedule_update', 'audit'].includes(a)) {
        return true;
    }
    if (a.startsWith('ADMIN_') || a.startsWith('SELECTION_') || a.startsWith('STAFF_') || a.startsWith('HOD_')) {
        return true;
    }
    if (a === 'email_dispatch' || a.startsWith('EMAIL_')) return true;
    return false;
}

export default function LogsClient({ initialData }: { initialData: any }) {
    const logs = Array.isArray(initialData?.logs) ? initialData.logs : [];
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUser, setFilterUser] = useState('all');
    const [filterAction, setFilterAction] = useState('all');
    const [filterLevel, setFilterLevel] = useState('all');
    const [dateRange, setDateRange] = useState('all');

    const handleViewLog = (log: any) => {
        setSelectedLog(log);
        setShowLogDialog(true);
    };

    const handleExportLogs = (format: 'csv' | 'json' | 'pdf') => {
        toast.success(`Logs exported as ${format.toUpperCase()} successfully!`);
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'failed': return 'text-red-600 bg-red-50';
            case 'error': return 'text-red-600 bg-red-50';
            case 'warning': return 'text-yellow-600 bg-yellow-50';
            case 'success': return 'text-green-600 bg-green-50';
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
            case 'email_dispatch': return Mail;
            case 'AUTH_LOGIN_SUCCESS':
            case 'AUTH_LOGIN_FAILED': return User;
            default:
                if (action.startsWith('EMAIL_') || action.startsWith('ADMIN_NOTIFICATION')) return Mail;
                if (action.startsWith('AUTH_')) return User;
                if (action.startsWith('SELECTION_') || action.startsWith('STAFF_') || action.startsWith('HOD_')) return Activity;
                if (action.startsWith('ADMIN_')) return Settings;
                return Activity;
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
            case 'gpa_formula': return 'text-amber-600 bg-amber-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const filteredLogs = logs.filter((log: Record<string, unknown>) => {
        const q = safeLower(searchTerm);
        const matchesSearch =
            safeLower(logDetails(log)).includes(q) ||
            safeLower(logUserEmail(log)).includes(q) ||
            safeLower(logResource(log)).includes(q) ||
            safeLower(logCategory(log)).includes(q) ||
            safeLower(logAction(log)).includes(q);

        const matchesUser = filterUser === 'all' || logUserId(log) === filterUser;
        const matchesAction = filterAction === 'all' || logAction(log) === filterAction;
        const matchesLevel = filterLevel === 'all' || logStatus(log) === safeLower(filterLevel);

        const logDate = new Date(String(log.timestamp ?? 0));
        const now = new Date();
        let matchesDate = true;

        if (Number.isNaN(logDate.getTime())) {
            matchesDate = dateRange === 'all';
        } else if (dateRange === 'today') {
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
        const total = logs.length;
        const errors = logs.filter((l: Record<string, unknown>) => {
            const s = logStatus(l);
            return s === 'failed' || s === 'error';
        }).length;
        const warnings = logs.filter((l: Record<string, unknown>) => logStatus(l) === 'warning').length;
        const today = logs.filter((l: Record<string, unknown>) => {
            const logDate = new Date(String(l.timestamp ?? 0));
            const now = new Date();
            return !Number.isNaN(logDate.getTime()) && logDate.toDateString() === now.toDateString();
        }).length;

        return { total, errors, warnings, today };
    };

    const stats = getLogStats();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">System Logs</h1>
                    <p className="text-muted-foreground mt-1">View and analyze system audit logs and activities</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExportLogs('csv')}><Download className="mr-2 h-4 w-4" /> Export Logs</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Logs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div><p className="text-xs text-muted-foreground">All entries</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Errors</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.errors}</div><p className="text-xs text-muted-foreground">Error level</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Warnings</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div><p className="text-xs text-muted-foreground">Warning level</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{stats.today}</div><p className="text-xs text-muted-foreground">Today's entries</p></CardContent></Card>
            </div>

            <Tabs defaultValue="logs" className="space-y-4">
                <TabsList><TabsTrigger value="logs">All Logs</TabsTrigger><TabsTrigger value="errors">Errors</TabsTrigger><TabsTrigger value="users">User Activity</TabsTrigger><TabsTrigger value="system">System Events</TabsTrigger></TabsList>
                <TabsContent value="logs" className="space-y-4">
                    <Card><CardHeader><CardTitle>System Logs</CardTitle><CardDescription>Complete audit trail of system activities</CardDescription></CardHeader><CardContent><div className="space-y-4"><div className="flex items-center gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div><div className="flex items-center gap-2"><Label htmlFor="user-filter">User:</Label><Select value={filterUser} onValueChange={setFilterUser}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Users</SelectItem><SelectItem value="ADMIN001">Admin User</SelectItem><SelectItem value="STU001">John Doe</SelectItem><SelectItem value="STAFF001">Dr. Smith</SelectItem></SelectContent></Select></div><div className="flex items-center gap-2"><Label htmlFor="action-filter">Action:</Label><Select value={filterAction} onValueChange={setFilterAction}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Actions</SelectItem><SelectItem value="audit">Audit</SelectItem><SelectItem value="login">Login</SelectItem><SelectItem value="config_update">Config Update</SelectItem><SelectItem value="grade_release">Grade Release</SelectItem><SelectItem value="user_create">User Create</SelectItem><SelectItem value="backup_create">Backup Create</SelectItem></SelectContent></Select></div><div className="flex items-center gap-2"><Label htmlFor="level-filter">Level:</Label><Select value={filterLevel} onValueChange={setFilterLevel}><SelectTrigger className="w-24"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="failed">Failed/Error</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="info">Info</SelectItem></SelectContent></Select></div><div className="flex items-center gap-2"><Label htmlFor="date-filter">Date:</Label><Select value={dateRange} onValueChange={setDateRange}><SelectTrigger className="w-24"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="today">Today</SelectItem><SelectItem value="week">Week</SelectItem><SelectItem value="month">Month</SelectItem></SelectContent></Select></div></div><Table><TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Resource</TableHead><TableHead>Level</TableHead><TableHead>Details</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filteredLogs.map((log: Record<string, unknown>, idx: number) => {
                                        const ActionIcon = getActionIcon(logAction(log));
                                        const ts = new Date(String(log.timestamp ?? 0));
                                        const st = logStatus(log);
                                        return (
                                            <TableRow key={String(log.id ?? `row-${idx}`)}>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{Number.isNaN(ts.getTime()) ? '—' : ts.toLocaleDateString()}</div>
                                                        <div className="text-muted-foreground">{Number.isNaN(ts.getTime()) ? '' : ts.toLocaleTimeString()}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{logUserEmail(log) || '—'}</div>
                                                        <div className="text-xs text-muted-foreground">{logUserId(log) || '—'}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <ActionIcon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{logAction(log).replace(/_/g, ' ')}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getResourceColor(logResource(log))}>{logResource(log)}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getLevelColor(st)}>{st}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm max-w-xs truncate">{logDetails(log)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" onClick={() => handleViewLog(log)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}</TableBody></Table></div></CardContent></Card>
                </TabsContent>
                <TabsContent value="errors" className="space-y-4">
                    <Card><CardHeader><CardTitle>Error Logs</CardTitle><CardDescription>System errors and exceptions that require attention</CardDescription></CardHeader><CardContent><div className="space-y-4">{logs.filter((log: Record<string, unknown>) => { const s = logStatus(log); return s === 'failed' || s === 'error'; }).map((log: Record<string, unknown>) => { const ActionIcon = getActionIcon(logAction(log)); const ts = new Date(String(log.timestamp ?? 0)); return (<div key={String(log.id)} className="p-4 rounded-lg border border-red-200 bg-red-50"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><ActionIcon className="h-5 w-5 text-red-600" /><div><div className="font-medium text-red-900">{logDetails(log)}</div><div className="text-sm text-red-700">{logUserEmail(log)} • {Number.isNaN(ts.getTime()) ? '—' : ts.toLocaleString()}</div></div></div><Badge className="text-red-600 bg-red-100">Error</Badge></div></div>); })}</div></CardContent></Card>
                </TabsContent>
                <TabsContent value="users" className="space-y-4">
                    <Card><CardHeader><CardTitle>User Activity</CardTitle><CardDescription>User login, logout, and activity logs</CardDescription></CardHeader><CardContent><div className="space-y-4">{logs.filter((log: Record<string, unknown>) => isUserActivityLog(log)).map((log: Record<string, unknown>) => { const ActionIcon = getActionIcon(logAction(log)); const ts = new Date(String(log.timestamp ?? 0)); return (<div key={String(log.id)} className="p-3 rounded-lg border"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><ActionIcon className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium">{logUserEmail(log)}</div><div className="text-sm text-muted-foreground">{logDetails(log)}</div></div></div><div className="text-sm text-muted-foreground">{Number.isNaN(ts.getTime()) ? '—' : ts.toLocaleString()}</div></div></div>); })}</div></CardContent></Card>
                </TabsContent>
                <TabsContent value="system" className="space-y-4">
                    <Card><CardHeader><CardTitle>System Events</CardTitle><CardDescription>Configuration changes, backups, and system maintenance</CardDescription></CardHeader><CardContent><div className="space-y-4">{logs.filter((log: Record<string, unknown>) => isSystemEventLog(log)).map((log: Record<string, unknown>) => { const ActionIcon = getActionIcon(logAction(log)); const ts = new Date(String(log.timestamp ?? 0)); return (<div key={String(log.id)} className="p-3 rounded-lg border"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><ActionIcon className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium">{logDetails(log)}</div><div className="text-sm text-muted-foreground">{logUserEmail(log)} • {logResource(log)}</div></div></div><div className="text-sm text-muted-foreground">{Number.isNaN(ts.getTime()) ? '—' : ts.toLocaleString()}</div></div></div>); })}</div></CardContent></Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Log Details</DialogTitle><DialogDescription>Detailed information about log entry</DialogDescription></DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label className="text-sm font-medium">Timestamp</Label><div className="text-sm">{(() => { const t = new Date(String(selectedLog.timestamp ?? 0)); return Number.isNaN(t.getTime()) ? '—' : t.toLocaleString(); })()}</div></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">Level</Label><Badge className={getLevelColor(logStatus(selectedLog))}>{logStatus(selectedLog)}</Badge></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">Category / source</Label><div className="text-sm">{logCategory(selectedLog) || '—'}</div></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">User</Label><div className="text-sm"><div>{logUserEmail(selectedLog) || '—'}</div><div className="text-muted-foreground">{logUserId(selectedLog) || '—'}</div></div></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">Action</Label><div className="text-sm">{logAction(selectedLog).replace(/_/g, ' ')}</div></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">Resource</Label><Badge className={getResourceColor(logResource(selectedLog))}>{logResource(selectedLog)}</Badge></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">IP Address</Label><div className="text-sm font-mono">{logIpAddress(selectedLog) || '—'}</div></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">User Agent</Label><div className="text-sm font-mono text-xs break-all">{(selectedLog as Record<string, unknown>).userAgent != null ? String((selectedLog as Record<string, unknown>).userAgent) : ((selectedLog.metadata as { user_agent?: string } | undefined)?.user_agent ?? '—')}</div></div>
                            </div>
                            <div className="space-y-2"><Label className="text-sm font-medium">Details</Label><div className="p-3 rounded-lg bg-muted text-sm">{logDetails(selectedLog)}</div></div>
                        </div>
                    )}
                    <DialogFooter><Button variant="outline" onClick={() => setShowLogDialog(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
