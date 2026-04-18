'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

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
}

export default function BulkEnrollHistoryPage() {
    const router = useRouter();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBatches();
    }, [page, search]);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search })
            });

            const response = await fetch(`/api/admin/bulk-enroll/history?${params}`);
            const data = await response.json();

            setBatches(data.batches || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-600">Completed</Badge>;
            case 'PROCESSING':
                return <Badge className="bg-blue-600">Processing</Badge>;
            case 'FAILED':
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Enrollment History</h1>
                    <p className="text-muted-foreground mt-1">
                        View all bulk enrollment batches and their processing status.
                    </p>
                </div>
                <Link href="/dashboard/admin/bulk-enroll">
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        New Enrollment
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Enrollment Batches</CardTitle>
                            <CardDescription>
                                All bulk enrollment uploads and their processing status
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by filename..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-8 w-64"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading...
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No enrollment batches found</p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Filename</TableHead>
                                            <TableHead>Program</TableHead>
                                            <TableHead>Level</TableHead>
                                            <TableHead className="text-center">Total</TableHead>
                                            <TableHead className="text-center">Success</TableHead>
                                            <TableHead className="text-center">Failed</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {batches.map((batch) => (
                                            <TableRow key={batch.batch_id}>
                                                <TableCell className="font-medium">
                                                    {format(new Date(batch.created_at), 'MMM dd, yyyy HH:mm')}
                                                </TableCell>
                                                <TableCell>{batch.filename}</TableCell>
                                                <TableCell>
                                                    {batch.program_id ? (
                                                        <Badge variant="outline">{batch.program_id.substring(0, 8)}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {batch.level ? (
                                                        <Badge variant="secondary">{batch.level}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">{batch.total_records}</TableCell>
                                                <TableCell className="text-center text-green-600 font-medium">
                                                    {batch.successful_records}
                                                </TableCell>
                                                <TableCell className="text-center text-red-600 font-medium">
                                                    {batch.failed_records}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(batch.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/admin/bulk-enroll/history/${batch.batch_id}`)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
