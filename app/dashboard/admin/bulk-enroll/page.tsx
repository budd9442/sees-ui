'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, CheckCircle2, AlertCircle, Info, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BulkEnrollPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState<any>(null);

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

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

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
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Bulk Enrollment</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Upload CSV File</CardTitle>
                        <CardDescription>
                            Create multiple user accounts at once by uploading a CSV file.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="csv-file">CSV File</Label>
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
                                    All enrolled users will automatically receive an email with their credentials.
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
                        <Button variant="outline" onClick={() => setFile(null)} disabled={isUploading}>
                            Clear
                        </Button>
                        <Button onClick={handleUpload} disabled={!file || isUploading}>
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
                                email, firstName, lastName, role
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Column Definitions:</h4>
                            <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                                <li><strong>email</strong>: User's primary email</li>
                                <li><strong>firstName/lastName</strong>: Display names</li>
                                <li><strong>role</strong>: student, staff, or admin</li>
                                <li><strong>degreePathId</strong>: Program ID (optional)</li>
                                <li><strong>admissionYear</strong>: Year (optional)</li>
                            </ul>
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
                                <h3 className="text-lg font-semibold">All Users Enrolled Successfully</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Successfully created {results.success} user accounts and initiated welcome emails for each.
                                </p>
                                <Button onClick={() => router.push('/dashboard/admin/users')}>
                                    Go to User Management
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
