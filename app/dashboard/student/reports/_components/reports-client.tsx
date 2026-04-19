'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Send, History, AlertCircle } from 'lucide-react';
import { submitAnonymousReport } from '@/lib/actions/report-actions';

interface Category {
    id: string;
    name: string;
}

interface Report {
    id: string;
    subject: string | null;
    category: string;
    status: string;
    createdAt: string;
}

export default function ReportsClient({ categories, initialReports }: { categories: Category[], initialReports: Report[] }) {
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<Report[]>(initialReports);
    const [formData, setFormData] = useState({
        subject: '',
        categoryId: categories[0]?.id || '',
        content: '',
        priority: 'MEDIUM'
    });

    const handleSubmit = async () => {
        if (!formData.subject || !formData.content || !formData.categoryId) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const res = await submitAnonymousReport(formData);
            if (res.success) {
                toast.success("Report submitted successfully");
                setFormData({ subject: '', categoryId: categories[0]?.id || '', content: '', priority: 'MEDIUM' });
                
                // Add to local list
                const newReport: Report = {
                    id: res.id,
                    subject: formData.subject,
                    category: categories.find(c => c.id === formData.categoryId)?.name || 'Unknown',
                    status: 'PENDING',
                    createdAt: new Date().toISOString()
                };
                setReports(prev => [newReport, ...prev]);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to submit report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <PageHeader title="Anonymous Reports" description="Submit feedback or report issues confidentially" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5" /> New Report
                            </CardTitle>
                            <CardDescription>
                                Your identity will be protected. Please provide as much detail as possible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Subject <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="Brief summary"
                                        value={formData.subject}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category <span className="text-red-500">*</span></Label>
                                    <Select 
                                        value={formData.categoryId} 
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, categoryId: val }))}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.length > 0 ? (
                                                categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>No categories available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select 
                                        value={formData.priority} 
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Details <span className="text-red-500">*</span></Label>
                                <Textarea
                                    placeholder="Describe your concern or feedback..."
                                    rows={8}
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between border-t p-4 mt-4">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Responses will appear in your history once reviewed.
                            </p>
                            <Button onClick={handleSubmit} disabled={loading || categories.length === 0}>
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <History className="h-4 w-4" /> Your Recent Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[600px] overflow-y-auto">
                                {reports.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground italic">
                                        No reports submitted yet.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {reports.map((report) => (
                                            <div key={report.id} className="p-4 space-y-2 hover:bg-muted/50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-sm font-semibold truncate flex-1">{report.subject}</h4>
                                                    <Badge variant={report.status === 'PENDING' ? 'secondary' : 'outline'} className="ml-2 scale-75">
                                                        {report.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                                    <span>{report.category}</span>
                                                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
