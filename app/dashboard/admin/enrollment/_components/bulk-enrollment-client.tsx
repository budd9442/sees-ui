'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertTriangle, Send, Loader2, Play, Search, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { uploadBulkEnrollment, processEnrollmentBatch, dispatchEnrollmentInvites } from '@/lib/actions/enrollment-bulk-actions';
import { validateEnrollmentCSV, ValidationResult } from '@/lib/actions/enrollment-validation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BulkEnrollmentClientProps {
    initialBatches: any[];
}

export function BulkEnrollmentClient({ initialBatches }: BulkEnrollmentClientProps) {
    const [batches, setBatches] = useState(initialBatches);
    const [uploading, setUploading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [confirmingBatch, setConfirmingBatch] = useState<any | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setSelectedFile(file);
        setUploading(true);
        try {
            const content = await file.text();
            const result = await validateEnrollmentCSV(content);
            setValidation(result);
            if (!result.isValid) {
                toast.warning(`Validation found ${result.errors.length} issues. Please review.`);
            } else {
                toast.success("CSV looks clean! Ready to upload.");
            }
        } catch (err) {
            toast.error("Failed to parse CSV file.");
        } finally {
            setUploading(false);
        }
    };

    const triggerUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await uploadBulkEnrollment(formData);
            if (res.success) {
                toast.success("Batch uploaded and ready for processing.");
                window.location.reload();
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUploading(false);
            setValidation(null);
            setSelectedFile(null);
        }
    };

    const handleProcess = async (batchId: string) => {
        setConfirmingBatch(null);
        setProcessingId(batchId);
        toast.info("Processing enrollment batch... this takes a few seconds.");
        try {
            const res = await processEnrollmentBatch(batchId);
            if (res.success) {
                toast.success(`Processed! ${res.successCount} success, ${res.failCount} failed.`);
                window.location.reload();
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleSendInvites = async (batchId: string) => {
        toast.loading("Dispatching activation emails...");
        try {
            await dispatchEnrollmentInvites(batchId);
            toast.success("Account activation invites dispatched.");
            window.location.reload();
        } catch (err: any) {
            toast.error("Failed to send some invites.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Upload Section */}
            <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold tracking-tight">Bulk Student Intake</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Upload a CSV with <code>firstName, lastName, email</code> to enroll students and invite them to setup their account.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-4 w-full">
                        <Input 
                            type="file" 
                            accept=".csv" 
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="w-full max-w-xs cursor-pointer" 
                        />
                        
                        {validation && (
                            <div className="w-full max-w-2xl space-y-4 animate-in slide-in-from-top-4 duration-300">
                                {validation.records && validation.records.length > 0 && (
                                    <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                                        <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pre-Import Audit List</span>
                                            <Badge variant="outline" className="text-[10px]">{validation.summary.total} Records Found</Badge>
                                        </div>
                                        <ScrollArea className="h-72">
                                            <Table>
                                                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                                    <TableRow>
                                                        <TableHead className="w-[80px] text-[10px] uppercase font-black">Status</TableHead>
                                                        <TableHead className="text-[10px] uppercase font-black">Email</TableHead>
                                                        <TableHead className="text-[10px] uppercase font-black">Name</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {validation.records.map((record, idx) => (
                                                        <TableRow key={idx} className={record.status === 'DUPLICATE' ? 'bg-amber-50/40' : record.status === 'INVALID' ? 'bg-red-50/40' : ''}>
                                                            <TableCell>
                                                                {record.status === 'READY' && <Badge className="bg-green-500 text-[9px] h-4 px-1 uppercase">Ready</Badge>}
                                                                {record.status === 'DUPLICATE' && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[9px] h-4 px-1 uppercase">Exists</Badge>}
                                                                {record.status === 'INVALID' && <Badge variant="destructive" className="text-[9px] h-4 px-1 uppercase">Error</Badge>}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-medium py-2">{record.email}</TableCell>
                                                            <TableCell className="text-xs py-2">{record.firstName} {record.lastName}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                )}

                                {!validation.isValid && validation.errors.length > 0 && (
                                    <Alert variant="destructive" className="text-left bg-red-50 border-red-200">
                                        <XCircle className="h-4 w-4" />
                                        <AlertTitle className="font-bold">Critical Errors Detected</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            Please correct the {validation.errors.length} formatting errors in your CSV before attempting to upload.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" size="sm" onClick={() => {setValidation(null); setSelectedFile(null);}}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        onClick={triggerUpload} 
                                        disabled={!validation.isValid || uploading}
                                        className="shadow-md"
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                        Commit Valid Batch
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {!validation && uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                </CardContent>
            </Card>

            {/* Batches Table */}
            <div className="grid gap-4">
                <h2 className="text-xl font-bold">Recent Enrollment Batches</h2>
                {batches.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground border rounded-lg italic">
                        No bulk enrollment history found.
                    </div>
                )}
                {batches.map((batch) => (
                    <Card key={batch.batch_id} className="overflow-hidden group hover:border-primary/40 transition-all">
                        <div className="flex flex-col md:flex-row items-center justify-between p-5 gap-4">
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-sm truncate max-w-[150px]">{batch.filename}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{new Date(batch.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex-1 max-w-sm space-y-2 px-4 border-x hidden lg:block">
                                <div className="flex justify-between text-[10px] font-medium">
                                    <span>{batch.successful_records + batch.failed_records} / {batch.total_records} processed</span>
                                    <span>{batch.status}</span>
                                </div>
                                <Progress value={(batch.successful_records / batch.total_records) * 100} className="h-1.5" />
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="text-[9px] h-4 bg-green-50/50 text-green-700 border-green-200">
                                        {batch.successful_records} Success
                                    </Badge>
                                    <Badge variant="outline" className="text-[9px] h-4 bg-red-50/50 text-red-700 border-red-200">
                                        {batch.failed_records} Failed
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {batch.status === 'PENDING' && (
                                    <Button 
                                        size="sm" 
                                        onClick={() => setConfirmingBatch(batch)}
                                        disabled={processingId === batch.batch_id}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {processingId === batch.batch_id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                                        Run Enrollment
                                    </Button>
                                )}
                                {batch.status === 'COMPLETED' && batch.successful_records > 0 && (
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleSendInvites(batch.batch_id)}
                                        className="text-primary hover:bg-primary/5"
                                    >
                                        <Send className="h-3 w-3 mr-1" />
                                        Send Invitations
                                    </Button>
                                )}
                                {batch.status === 'COMPLETED' && (
                                    <Badge className="bg-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Finalized
                                    </Badge>
                                )}
                                {batch.status === 'PROCESSING' && (
                                    <Badge className="bg-orange-500 animate-pulse">
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        In Progress
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Confirmation Modal */}
            <Dialog open={!!confirmingBatch} onOpenChange={(open) => !open && setConfirmingBatch(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" />
                            Verify Enrollment Data
                        </DialogTitle>
                        <DialogDescription>
                            Review the extracted records from <b>{confirmingBatch?.filename}</b>. 
                            {confirmingBatch?.records?.some((r: any) => r.status === 'DUPLICATE') && (
                                <span className="block mt-2 text-amber-600 font-medium">
                                    Warning: Some accounts already exist and will be skipped.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[300px] mt-4 rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>First Name</TableHead>
                                    <TableHead>Last Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {confirmingBatch?.records?.map((record: any, idx: number) => (
                                    <TableRow key={idx} className={record.status === 'DUPLICATE' ? 'bg-amber-50/30' : ''}>
                                        <TableCell>
                                            {record.status === 'READY' && (
                                                <Badge className="bg-green-500 hover:bg-green-600 text-[10px] h-5 uppercase px-1">Ready</Badge>
                                            )}
                                            {record.status === 'DUPLICATE' && (
                                                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px] h-5 uppercase px-1">Exists</Badge>
                                            )}
                                            {record.status === 'FAILED' && (
                                                <Badge variant="destructive" className="text-[10px] h-5 uppercase px-1">Error</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{record.email}</TableCell>
                                        <TableCell>{record.firstName}</TableCell>
                                        <TableCell>{record.lastName}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>

                    <DialogFooter className="mt-6">
                        <Button variant="ghost" onClick={() => setConfirmingBatch(null)}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleProcess(confirmingBatch.batch_id)}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm & Enroll
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
