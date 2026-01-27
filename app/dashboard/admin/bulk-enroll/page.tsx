'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle2, AlertCircle, Info, ArrowLeft, History } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Program {
    program_id: string;
    code: string;
    name: string;
}

export default function BulkEnrollPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [programId, setProgramId] = useState<string>('');
    const [level, setLevel] = useState<string>('');
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        // Fetch programs
        fetch('/api/admin/programs')
            .then(res => res.json())
            .then(data => setPrograms(data))
            .catch(err => console.error('Failed to fetch programs:', err));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a CSV file');
            return;
        }

        if (!programId) {
            toast.error('Please select a program');
            return;
        }

        if (!level) {
            toast.error('Please select a level');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('programId', programId);
        formData.append('level', level);

        try {
            const response = await fetch('/api/admin/bulk-enroll', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process enrollment');
            }

            const data = await response.json();
            setResults(data);
            toast.success(`Processed ${data.total} records. ${data.success} succeeded.`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Bulk Enrollment</h1>
                </div>
                <Link href="/dashboard/admin/bulk-enroll/history">
                    <Button variant="outline">
                        <History className="mr-2 h-4 w-4" />
                        View History
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Upload CSV File</CardTitle>
                        <CardDescription>
                            Create multiple student accounts at once by uploading a CSV file.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="program">Degree Program *</Label>
                                <Select value={programId} onValueChange={setProgramId} disabled={isUploading}>
                                    <SelectTrigger id="program">
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map((program) => (
                                            <SelectItem key={program.program_id} value={program.program_id}>
                                                {program.code} - {program.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="level">Academic Level *</Label>
                                <Select value={level} onValueChange={setLevel} disabled={isUploading}>
                                    <SelectTrigger id="level">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="L1">Level 1 (L1)</SelectItem>
                                        <SelectItem value="L2">Level 2 (L2)</SelectItem>
                                        <SelectItem value="L3">Level 3 (L3)</SelectItem>
                                        <SelectItem value="L4">Level 4 (L4)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="csv-file">CSV File *</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="csv-file"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                                {file && (
                                    <Badge variant="secondary" className="px-3 py-1">
                                        {Math.round(file.size / 1024)} KB
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 rounded-md border bg-muted/30 p-4">
                            <Info className="h-5 w-5 text-primary" />
                            <div className="grid gap-1.5 leading-none">
                                <label className="text-sm font-medium leading-none">
                                    Automatic Email Notifications
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    All enrolled students will automatically receive an email with their credentials.
                                </p>
                            </div>
                        </div>

                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Processing records...</span>
                                    <span className="animate-pulse">Please wait</span>
                                </div>
                                <Progress value={45} className="h-2" />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6">
                        <Button variant="outline" onClick={() => {
                            setFile(null);
                            setProgramId('');
                            setLevel('');
                        }} disabled={isUploading}>
                            Clear
                        </Button>
                        <Button onClick={handleUpload} disabled={!file || !programId || !level || isUploading}>
                            {isUploading ? (
                                <>
                                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Start Enrollment
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">CSV Format Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Required Columns</AlertTitle>
                            <AlertDescription className="text-xs">
                                email, firstName, lastName
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Column Definitions:</h4>
                            <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                                <li><strong>email</strong>: Student's email address</li>
                                <li><strong>firstName</strong>: Student's first name</li>
                                <li><strong>lastName</strong>: Student's last name</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Note:</h4>
                            <p className="text-xs text-muted-foreground">
                                Program and level are selected above and will be applied to all students in the CSV.
                            </p>
                        </div>

                        <Button variant="ghost" className="w-full text-xs justify-start" asChild>
                            <a href="/templates/bulk-enrollment-template.csv" download>
                                <FileText className="mr-2 h-4 w-4" />
                                Download Template CSV
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {results && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Enrollment Summary</CardTitle>
                            <div className="flex gap-2">
                                <Badge variant="default" className="bg-green-600">
                                    {results.success} Success
                                </Badge>
                                {results.failed > 0 && (
                                    <Badge variant="destructive">
                                        {results.failed} Failed
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {results.errors.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium flex items-center gap-2 text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    Errors Encountered
                                </h3>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Error Message</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.errors.map((err: any, idx: number) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="font-medium">{err.email}</TableCell>
                                                    <TableCell className="text-red-500 text-xs">{err.error}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                                <h3 className="text-lg font-semibold">All Students Enrolled Successfully</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Successfully created {results.success} student accounts and initiated welcome emails for each.
                                </p>
                                <div className="flex gap-2">
                                    <Button onClick={() => router.push('/dashboard/admin/users')}>
                                        Go to User Management
                                    </Button>
                                    {results.batchId && (
                                        <Button variant="outline" onClick={() => router.push(`/dashboard/admin/bulk-enroll/history/${results.batchId}`)}>
                                            View Batch Details
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
