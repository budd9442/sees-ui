'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    FileText,
    Eye,
    CheckCircle2,
    AlertCircle,
    Clock,
    Download,
    Search,
    MessageSquare,
    Shield,
    Flag,
    Send,
    UserCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { updateAdminAnonymousReport } from '@/lib/actions/admin-actions';
import { exportTabularData } from '@/lib/export';

interface Report {
    id: string;
    studentId: string;
    category: string;
    categoryId?: string;
    title: string;
    description: string;
    status: string;
    submittedAt: string;
    priority: string;
    assignedTo: string;
    responseNotes: string;
    reviewedAt: string;
}

interface Category {
    id: string;
    name: string;
    assignedTo: string;
}

interface Staff {
    id: string;
    name: string;
    email: string;
}

interface PageData {
    reports: Report[];
    categories: Category[];
    staffMembers: Staff[];
}

export default function ReportsReviewClient({ initialData }: { initialData: PageData }) {
    const { user } = useAuthStore();

    const [reports, setReports] = useState(initialData.reports || []);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [responseNotes, setResponseNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
        setResponseNotes(report.responseNotes || '');
        setShowReportDialog(true);
    };

    const handleUpdateStatus = async (reportId: string, status: string) => {
        setLoading(true);
        try {
            const updateData = {
                status,
                responseNotes: responseNotes || undefined,
            };
            const res = await updateAdminAnonymousReport(reportId, updateData);

            if (res.success) {
                setReports(prev => prev.map((r: any) => r.id === reportId ? { ...r, ...res.data } : r));
                toast.success(`Report updated successfully`);
                setShowReportDialog(false);
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed to update report.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignReport = async (reportId: string, assignedTo: string) => {
        try {
            const res = await updateAdminAnonymousReport(reportId, { assignedTo });
            if (res.success) {
                setReports(prev => prev.map((r: any) => r.id === reportId ? { ...r, ...res.data } : r));
                if (selectedReport?.id === reportId) {
                    setSelectedReport(prev => prev ? { ...prev, ...res.data } : null);
                }
                toast.success(`Report assigned`);
            }
        } catch (e: any) {
            toast.error('Failed to assign report.');
        }
    };

    const handleExportReports = async (format: 'pdf' | 'excel' | 'csv') => {
        try {
            const rows = filteredReports.map((report: any) => ({
                id: report.id,
                title: report.title,
                category: report.category,
                priority: report.priority,
                status: report.status,
                assignedTo: report.assignedTo || '',
                submittedAt: report.submittedAt,
            }));
            await exportTabularData(rows, format, { filename: `anonymous-reports-${Date.now()}` });
            toast.success(`Reports exported as ${format.toUpperCase()}`);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to export reports');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'submitted': return 'bg-blue-100 text-blue-700';
            case 'in_review': return 'bg-yellow-100 text-yellow-700';
            case 'in_progress': return 'bg-orange-100 text-orange-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredReports = reports.filter((report: Report) => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getReportStats = () => {
        const total = reports.length;
        const submitted = reports.filter((r: Report) => r.status === 'submitted').length;
        const inReview = reports.filter((r: Report) => r.status === 'in_review').length;
        const resolved = reports.filter((r: Report) => r.status === 'resolved').length;
        return { total, submitted, inReview, resolved };
    };

    const stats = getReportStats();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Report Review</h1>
                    <p className="text-muted-foreground mt-1">Review and manage anonymous reports submitted by students</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => void handleExportReports('pdf')}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Reports</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{stats.submitted}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">In Review</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.inReview}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">Resolved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.resolved}</div></CardContent></Card>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Management</CardTitle>
                            <CardDescription>Search, filter, and respond to reports</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search content..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="pl-9 h-9" 
                                />
                            </div>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Category" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {initialData.categories.map(c => (
                                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="in_review">In Review</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[40%]">Content</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReports.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">No reports found matching criteria.</TableCell></TableRow>
                                ) : (
                                    filteredReports.map((report) => (
                                        <TableRow key={report.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-sm">{report.title}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{report.description}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal">{report.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getPriorityColor(report.priority)} font-bold text-[10px]`}>
                                                    {report.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(report.status)} font-medium`}>
                                                    {report.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-[11px] leading-tight">
                                                    <div className="font-medium">{new Date(report.submittedAt).toLocaleDateString()}</div>
                                                    <div className="text-muted-foreground">{new Date(report.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleViewReport(report)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" /> View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(selectedReport?.status || '')}>
                                {selectedReport?.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(selectedReport?.priority || '')}>
                                {selectedReport?.priority} Priority
                            </Badge>
                        </div>
                        <DialogTitle className="text-xl">{selectedReport?.title}</DialogTitle>
                        <DialogDescription>
                            Submitted on {selectedReport && new Date(selectedReport.submittedAt).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedReport && (
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                                <div className="text-sm font-medium">{selectedReport.category}</div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Report Content</Label>
                                <div className="p-4 rounded-xl border bg-muted/20 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                                    {selectedReport.description}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Assignment</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                                        <UserCircle className="h-4 w-4 text-primary" />
                                        <div className="text-sm">
                                            {selectedReport.assignedTo ? (
                                                <span className="font-medium text-primary">{selectedReport.assignedTo}</span>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">Awaiting automatic assignment or manual claim</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Label className="text-[10px] mb-1 block">Re-delegate to:</Label>
                                        <Select 
                                            onValueChange={(value) => handleAssignReport(selectedReport.id, value)}
                                            defaultValue={selectedReport.assignedTo}
                                        >
                                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Assigned to..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">System Admins</SelectItem>
                                                {initialData.staffMembers.map(staff => (
                                                    <SelectItem key={staff.id} value={staff.id}>
                                                        {staff.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status Update</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button 
                                            size="sm" 
                                            variant={selectedReport.status === 'in_review' ? 'default' : 'outline'}
                                            onClick={() => handleUpdateStatus(selectedReport.id, 'in_review')}
                                            disabled={loading}
                                        >
                                            <Clock className="mr-2 h-3.5 w-3.5" /> Reviewing
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant={selectedReport.status === 'resolved' ? 'default' : 'outline'}
                                            onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                                            disabled={loading}
                                            className={selectedReport.status !== 'resolved' ? "border-green-200 text-green-700 hover:bg-green-50" : "bg-green-600 hover:bg-green-700"}
                                        >
                                            <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Resolve
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant={selectedReport.status === 'closed' ? 'default' : 'outline'}
                                            onClick={() => handleUpdateStatus(selectedReport.id, 'closed')}
                                            disabled={loading}
                                        >
                                            Dismiss
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label htmlFor="response-notes" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resolution Notes / Internal Remarks</Label>
                                <Textarea 
                                    id="response-notes" 
                                    value={responseNotes} 
                                    onChange={(e) => setResponseNotes(e.target.value)} 
                                    placeholder="Document the actions taken or findings here..." 
                                    rows={4} 
                                    className="resize-none"
                                />
                                <div className="flex justify-end">
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleUpdateStatus(selectedReport.id, selectedReport.status)}
                                        disabled={loading || responseNotes === selectedReport.responseNotes}
                                    >
                                        Update Notes Only
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="border-t pt-4">
                        <Button variant="outline" onClick={() => setShowReportDialog(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
