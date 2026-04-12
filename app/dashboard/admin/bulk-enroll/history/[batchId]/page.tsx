'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Mail, AlertTriangle, History } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Record {
    record_id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    error_message: string | null;
    email_sent: boolean;
    email_sent_at: string | null;
    email_resend_count: number;
    last_email_sent_at: string | null;
}

interface Batch {
    batch_id: string;
    filename: string;
    uploaded_by: string;
    program_id: string | null;
    level: string | null;
    total_records: number;
    successful_records: number;
    failed_records: number;
    status: string;
    created_at: string;
    records: Record[];
}

export default function BatchDetailsPage({ params }: { params: Promise<{ batchId: string }> }) {
    const [batch, setBatch] = useState<Batch | null>(null);
    const [loading, setLoading] = useState(true);
    const [resendDialog, setResendDialog] = useState<{ open: boolean; record: Record | null }>({
        open: false,
        record: null
    });
    const [resending, setResending] = useState(false);
    const [batchId, setBatchId] = useState<string>('');

    useEffect(() => {
        params.then(p => {
            setBatchId(p.batchId);
            fetchBatchDetails(p.batchId);
        });
    }, [params]);

    const fetchBatchDetails = async (id: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/bulk-enroll/history/${id}`);
            const data = await response.json();
            setBatch(data);
        } catch (error) {
            console.error('Failed to fetch batch details:', error);
            toast.error('Failed to load batch details');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!resendDialog.record) return;

        setResending(true);
        try {
            const response = await fetch('/api/admin/bulk-enroll/resend-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recordId: resendDialog.record.record_id })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to resend email');
            }

            toast.success('Registration email resent successfully');
            setResendDialog({ open: false, record: null });

            // Refresh batch details
            fetchBatchDetails(batchId);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setResending(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <Badge className="bg-green-600">Success</Badge>;
            case 'FAILED':
                return <Badge variant="destructive">Failed</Badge>;
            case 'PENDING':
                return <Badge className="bg-blue-600">Pending</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                    Loading batch details...
                </div>
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                    Batch not found
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Batch Details</h1>
                    <p className="text-muted-foreground mt-1">
                        View individual enrollment records for this batch.
                    </p>
                </div>
                <Link href="/dashboard/admin/bulk-enroll/history">
                    <Button variant="outline">
                        <History className="mr-2 h-4 w-4" />
                        Back to History
                    </Button>
                </Link>
            </div>

            {/* Batch Summary */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Records</CardDescription>
                        <CardTitle className="text-3xl">{batch.total_records}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Successful</CardDescription>
                        <CardTitle className="text-3xl text-green-600">{batch.successful_records}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Failed</CardDescription>
                        <CardTitle className="text-3xl text-red-600">{batch.failed_records}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Success Rate</CardDescription>
                        <CardTitle className="text-3xl">
                            {batch.total_records > 0
                                ? Math.round((batch.successful_records / batch.total_records) * 100)
                                : 0}%
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Batch Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Batch Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt className="font-medium text-muted-foreground">Filename</dt>
                            <dd className="mt-1">{batch.filename}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Upload Date</dt>
                            <dd className="mt-1">{format(new Date(batch.created_at), 'MMM dd, yyyy HH:mm')}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Program</dt>
                            <dd className="mt-1">{batch.program_id || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Level</dt>
                            <dd className="mt-1">{batch.level || 'N/A'}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            {/* Records Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Records</CardTitle>
                    <CardDescription>
                        Individual student enrollment details and email status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Email Sent</TableHead>
                                    <TableHead>Resend Count</TableHead>
                                    <TableHead>Error</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batch.records.map((record) => (
                                    <TableRow key={record.record_id}>
                                        <TableCell className="font-medium">{record.email}</TableCell>
                                        <TableCell>{record.firstName} {record.lastName}</TableCell>
                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        <TableCell>
                                            {record.email_sent ? (
                                                <div className="flex flex-col">
                                                    <Badge variant="outline" className="w-fit">
                                                        Sent
                                                    </Badge>
                                                    {record.email_sent_at && (
                                                        <span className="text-xs text-muted-foreground mt-1">
                                                            {format(new Date(record.email_sent_at), 'MMM dd, HH:mm')}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge variant="secondary">Not Sent</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {record.email_resend_count > 0 ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{record.email_resend_count}</span>
                                                    {record.last_email_sent_at && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Last: {format(new Date(record.last_email_sent_at), 'MMM dd')}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {record.error_message ? (
                                                <span className="text-xs text-red-600">{record.error_message}</span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {record.status === 'SUCCESS' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setResendDialog({ open: true, record })}
                                                >
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Resend Email
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Resend Email Dialog */}
            <Dialog open={resendDialog.open} onOpenChange={(open) => setResendDialog({ open, record: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resend Registration Email</DialogTitle>
                        <DialogDescription>
                            This will generate a new password and send a registration email to the student.
                        </DialogDescription>
                    </DialogHeader>
                    {resendDialog.record && (
                        <div className="space-y-4">
                            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                                <div className="flex">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Password will be reset
                                        </h3>
                                        <p className="mt-2 text-sm text-yellow-700">
                                            The student's current password will be replaced with a new temporary password.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm"><strong>Email:</strong> {resendDialog.record.email}</p>
                                <p className="text-sm"><strong>Name:</strong> {resendDialog.record.firstName} {resendDialog.record.lastName}</p>
                                {resendDialog.record.email_resend_count > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        This email has been resent {resendDialog.record.email_resend_count} time(s) before.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setResendDialog({ open: false, record: null })}
                            disabled={resending}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleResendEmail} disabled={resending}>
                            {resending ? 'Sending...' : 'Resend Email'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
