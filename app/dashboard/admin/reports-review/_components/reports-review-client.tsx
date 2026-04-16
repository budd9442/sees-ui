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
} from 'lucide-react';
import { toast } from 'sonner';
import { updateAdminAnonymousReport } from '@/lib/actions/admin-actions';
import { exportTabularData } from '@/lib/export';

export default function ReportsReviewClient({ initialData }: { initialData: any }) {
    const { user } = useAuthStore();

    const [reports, setReports] = useState(initialData.reports || []);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [responseNotes, setResponseNotes] = useState('');

    const handleViewReport = (report: any) => {
        setSelectedReport(report);
        setShowReportDialog(true);
    };

    const handleUpdateStatus = async (reportId: string, status: string) => {
        try {
            const updateData = {
                status,
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.name || 'Admin',
                responseNotes: responseNotes || undefined,
            };
            await updateAdminAnonymousReport(reportId, updateData);

            setReports(reports.map((r: any) => r.id === reportId ? { ...r, ...updateData } : r));

            toast.success(`Report status updated to ${status}`);
            setShowReportDialog(false);
            setResponseNotes('');
        } catch (e: any) {
            toast.error('Failed to update report.');
        }
    };

    const handleAssignReport = async (reportId: string, assignedTo: string) => {
        try {
            const updateData = {
                assignedTo,
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.name || 'Admin',
            };
            await updateAdminAnonymousReport(reportId, updateData);

            setReports(reports.map((r: any) => r.id === reportId ? { ...r, ...updateData } : r));
            toast.success(`Report assigned to ${assignedTo}`);
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
        switch (status) {
            case 'submitted': return 'text-blue-600 bg-blue-50';
            case 'in_review': return 'text-yellow-600 bg-yellow-50';
            case 'in_progress': return 'text-orange-600 bg-orange-50';
            case 'resolved': return 'text-green-600 bg-green-50';
            case 'closed': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'academic_misconduct': return 'text-red-600 bg-red-50';
            case 'harassment': return 'text-purple-600 bg-purple-50';
            case 'discrimination': return 'text-orange-600 bg-orange-50';
            case 'safety_concern': return 'text-yellow-600 bg-yellow-50';
            case 'facility_issue': return 'text-blue-600 bg-blue-50';
            case 'other': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'academic_misconduct': return Flag;
            case 'harassment': return AlertCircle;
            case 'discrimination': return Shield;
            case 'safety_concern': return AlertCircle;
            case 'facility_issue': return MessageSquare;
            case 'other': return FileText;
            default: return FileText;
        }
    };

    const filteredReports = reports.filter((report: any) => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getReportStats = () => {
        const total = reports.length;
        const submitted = reports.filter((r: any) => r.status === 'submitted').length;
        const inReview = reports.filter((r: any) => r.status === 'in_review').length;
        const resolved = reports.filter((r: any) => r.status === 'resolved').length;
        return { total, submitted, inReview, resolved };
    };

    const stats = getReportStats();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Anonymous Reports Review</h1>
                    <p className="text-muted-foreground mt-1">Review and manage anonymous reports submitted by students</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => void handleExportReports('pdf')}><Download className="mr-2 h-4 w-4" /> Export Reports</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Reports</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div><p className="text-xs text-muted-foreground">All reports</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Submitted</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{stats.submitted}</div><p className="text-xs text-muted-foreground">Awaiting review</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Under Review</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.inReview}</div><p className="text-xs text-muted-foreground">In progress</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Resolved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.resolved}</div><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Report Management</CardTitle><CardDescription>Search, filter, and manage anonymous reports</CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="category-filter">Category:</Label>
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="academic_misconduct">Academic Misconduct</SelectItem>
                                        <SelectItem value="harassment">Harassment</SelectItem>
                                        <SelectItem value="discrimination">Discrimination</SelectItem>
                                        <SelectItem value="safety_concern">Safety Concern</SelectItem>
                                        <SelectItem value="facility_issue">Facility Issue</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="status-filter">Status:</Label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="in_review">In Review</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="escalated">Escalated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Table>
                            <TableHeader><TableRow><TableHead>Report</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead>Assigned To</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredReports.map((report: any) => { const CategoryIcon = getCategoryIcon(report.category); return (<TableRow key={report.id}><TableCell><div><div className="font-medium">{report.title}</div><div className="text-sm text-muted-foreground">{report.description.substring(0, 100)}...</div>{report.attachments && report.attachments.length > 0 && (<div className="flex items-center gap-1 mt-1"><FileText className="h-3 w-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">{report.attachments.length} attachment(s)</span></div>)}</div></TableCell><TableCell><Badge className={getCategoryColor(report.category)}><CategoryIcon className="h-3 w-3 mr-1" />{report.category.replace('_', ' ')}</Badge></TableCell><TableCell><Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge></TableCell><TableCell><Badge className={getStatusColor(report.status)}>{report.status.replace('_', ' ')}</Badge></TableCell><TableCell><div className="text-sm"><div>{new Date(report.submittedAt).toLocaleDateString()}</div><div className="text-muted-foreground">{new Date(report.submittedAt).toLocaleTimeString()}</div></div></TableCell><TableCell><div className="text-sm">{report.assignedTo ? (<Badge variant="outline">{report.assignedTo}</Badge>) : (<span className="text-muted-foreground">Unassigned</span>)}</div></TableCell><TableCell><div className="flex gap-1"><Button variant="outline" size="sm" onClick={() => handleViewReport(report)}><Eye className="h-4 w-4" /></Button>{report.status === 'submitted' && (<Button variant="outline" size="sm" onClick={() => handleAssignReport(report.id, 'HR Department')}><Send className="h-4 w-4" /></Button>)}</div></TableCell></TableRow>); })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Report Details</DialogTitle><DialogDescription>Review anonymous report details and take action</DialogDescription></DialogHeader>
                    {selectedReport && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label className="text-sm font-medium">Title</Label><div className="text-sm">{selectedReport.title}</div></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">Category</Label><Badge className={getCategoryColor(selectedReport.category)}>{selectedReport.category.replace('_', ' ')}</Badge></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">Priority</Label><Badge className={getPriorityColor(selectedReport.priority)}>{selectedReport.priority}</Badge></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">Status</Label><Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status.replace('_', ' ')}</Badge></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">Submitted</Label><div className="text-sm">{new Date(selectedReport.submittedAt).toLocaleString()}</div></div>
                                <div className="space-y-2"><Label className="text-sm font-medium">Consent to Contact</Label><div className="text-sm">{selectedReport.consentToContact ? 'Yes' : 'No'}</div></div>
                            </div>
                            <div className="space-y-2"><Label className="text-sm font-medium">Description</Label><div className="p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap">{selectedReport.description}</div></div>
                            {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Attachments</Label>
                                    <div className="space-y-2">{selectedReport.attachments.map((attachment: any) => (<div key={attachment.id} className="flex items-center justify-between p-2 rounded border"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{attachment.fileName}</span><span className="text-xs text-muted-foreground">({(attachment.fileSize / 1024).toFixed(1)} KB)</span></div><Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button></div>))}</div>
                                </div>
                            )}
                            {selectedReport.reviewedAt && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Review Information</Label>
                                    <div className="p-3 rounded-lg bg-muted">
                                        <div className="text-sm"><strong>Reviewed by:</strong> {selectedReport.reviewedBy}</div>
                                        <div className="text-sm"><strong>Reviewed at:</strong> {new Date(selectedReport.reviewedAt).toLocaleString()}</div>
                                        {selectedReport.responseNotes && (<div className="text-sm mt-2"><strong>Response Notes:</strong><div className="mt-1 p-2 rounded bg-background text-sm">{selectedReport.responseNotes}</div></div>)}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2"><Label htmlFor="response-notes">Response Notes</Label><Textarea id="response-notes" value={responseNotes} onChange={(e) => setResponseNotes(e.target.value)} placeholder="Add internal notes about this report..." rows={3} /></div>
                            <div className="space-y-2"><Label htmlFor="assign-to">Assign To</Label><Select onValueChange={(value) => handleAssignReport(selectedReport.id, value)}><SelectTrigger><SelectValue placeholder="Select department or person" /></SelectTrigger><SelectContent><SelectItem value="HR Department">HR Department</SelectItem><SelectItem value="Academic Affairs">Academic Affairs</SelectItem><SelectItem value="Security Team">Security Team</SelectItem><SelectItem value="Facilities Team">Facilities Team</SelectItem><SelectItem value="IT Support">IT Support</SelectItem></SelectContent></Select></div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReportDialog(false)}>Close</Button>
                        {selectedReport?.status === 'submitted' && (<><Button variant="outline" onClick={() => handleUpdateStatus(selectedReport.id, 'in_review')}><Clock className="mr-2 h-4 w-4" /> Mark Under Review</Button><Button onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}><CheckCircle2 className="mr-2 h-4 w-4" /> Mark Resolved</Button></>)}
                        {selectedReport?.status === 'in_review' && (<Button onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}><CheckCircle2 className="mr-2 h-4 w-4" /> Mark Resolved</Button>)}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
