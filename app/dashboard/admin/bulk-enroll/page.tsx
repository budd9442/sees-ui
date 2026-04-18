'use client';
export const dynamic = "force-dynamic";

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
import { Upload, FileText, CheckCircle2, AlertCircle, Info, History, Search, Settings } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { validateEnrollmentCSV, ValidationResult } from '@/lib/actions/enrollment-validation';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    getOnboardingQuestionsForAdmin,
    saveOnboardingQuestionsForAdmin,
} from '@/lib/actions/student-onboarding-actions';
import type { OnboardingQuestion } from '@/lib/onboarding/question-schema';

interface Program {
    program_id: string;
    code: string;
    name: string;
}

type OnboardingUiQuestion = OnboardingQuestion & {
    uiId: string;
    optionsInput: string;
};

function parseOptionsInput(input: string) {
    return input
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
}

export default function BulkEnrollPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [programId, setProgramId] = useState<string>('');
    const [level, setLevel] = useState<string>('');
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [editableRecords, setEditableRecords] = useState<ValidationResult['records']>([]);
    const [isValidating, setIsValidating] = useState(false);
    const [customPrefix, setCustomPrefix] = useState<string>('');
    const [showSettings, setShowSettings] = useState(false);
    const [onboardingQuestions, setOnboardingQuestions] = useState<OnboardingUiQuestion[]>([]);
    const [savingQuestions, setSavingQuestions] = useState(false);

    useEffect(() => {
        // Fetch programs
        fetch('/api/admin/programs')
            .then(res => res.json())
            .then(data => setPrograms(data))
            .catch(err => console.error('Failed to fetch programs:', err));
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const doc = await getOnboardingQuestionsForAdmin();
                setOnboardingQuestions(
                    doc.questions.map((q) => ({
                        ...q,
                        includeInAnalytics: true,
                        uiId: crypto.randomUUID(),
                        optionsInput: q.options.join(', '),
                    }))
                );
            } catch (e) {
                console.error('Failed to load onboarding questions', e);
            }
        };
        void load();
    }, []);

    useEffect(() => {
        if (file) {
            handleFileChange({ target: { files: [file] } } as any);
        }
    }, [customPrefix]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsValidating(true);
        setResults(null); // Clear previous results

        try {
            const content = await selectedFile.text();
            const scanResult = await validateEnrollmentCSV(content, customPrefix);
            setValidation(scanResult);
            setEditableRecords(scanResult.records);

            if (scanResult.isValid) {
                toast.success("CSV Scan Complete: File looks healthy.");
            } else {
                toast.warning(`Found ${scanResult.errors.length} data issues. Please review the audit list.`);
            }
        } catch (err) {
            toast.error("Failed to read CSV file for validation.");
        } finally {
            setIsValidating(false);
        }
    };

    const handleUsernameChange = (rowIdx: number, newUsername: string) => {
        const updated = [...editableRecords];
        updated[rowIdx] = { ...updated[rowIdx], username: newUsername };
        setEditableRecords(updated);
    };

    const handleStudentIdChange = (rowIdx: number, newId: string) => {
        const updated = [...editableRecords];
        updated[rowIdx] = { ...updated[rowIdx], studentId: newId };
        setEditableRecords(updated);
    };

    const handleUpload = async () => {
        if (!editableRecords || editableRecords.length === 0) {
            toast.error('No valid records to enroll');
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
        try {
            const response = await fetch('/api/admin/bulk-enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    records: editableRecords,
                    programId,
                    level,
                    filename: file?.name || 'manual_entry.csv'
                }),
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

    const addQuestion = () => {
        const suffix = onboardingQuestions.length + 1;
        setOnboardingQuestions((prev) => [
            ...prev,
            {
                uiId: crypto.randomUUID(),
                key: `custom_field_${suffix}`,
                label: `Custom field ${suffix}`,
                type: 'text',
                required: false,
                includeInAnalytics: true,
                options: [],
                optionsInput: '',
            },
        ]);
    };

    const updateQuestion = (idx: number, next: Partial<OnboardingUiQuestion>) => {
        setOnboardingQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...next } : q)));
    };

    const removeQuestion = (idx: number) => {
        setOnboardingQuestions((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateQuestionOption = (idx: number, optionsText: string) => {
        updateQuestion(idx, {
            optionsInput: optionsText,
            options: parseOptionsInput(optionsText),
        });
    };

    const saveQuestions = async () => {
        setSavingQuestions(true);
        try {
            await saveOnboardingQuestionsForAdmin({
                version: 1,
                questions: onboardingQuestions.map(({ uiId: _uiId, optionsInput, ...q }) => ({
                    ...q,
                    includeInAnalytics: true,
                    options: parseOptionsInput(optionsInput),
                })),
            });
            toast.success('Onboarding questions saved');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to save onboarding questions');
        } finally {
            setSavingQuestions(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bulk Student Enrollment</h1>
                    <p className="text-muted-foreground mt-1">
                        Create multiple student accounts at once by uploading a CSV file.
                    </p>
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
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Upload CSV File</CardTitle>
                                <CardDescription>
                                    Create multiple student accounts at once by uploading a CSV file.
                                </CardDescription>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowSettings(!showSettings)}
                                className={showSettings ? "text-primary bg-primary/10" : ""}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Format Settings
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {showSettings && (
                            <div className="p-4 rounded-lg border bg-muted/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center gap-2">
                                    <Settings className="h-3 w-3 text-primary" />
                                    <h4 className="text-xs font-bold uppercase tracking-tight">ID Format Configuration</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pre-override" className="text-[10px] uppercase font-bold text-muted-foreground">Custom Prefix (PRE)</Label>
                                        <Input 
                                            id="pre-override"
                                            placeholder="e.g. IM, CS, ME"
                                            value={customPrefix}
                                            onChange={(e) => setCustomPrefix(e.target.value.toUpperCase())}
                                            className="h-8 text-xs font-bold"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Forces all student IDs to start with this prefix.</p>
                                    </div>
                                    <div className="flex items-end pb-2">
                                        <div className="text-[10px] border px-2 py-1 rounded bg-white">
                                            Preview: <span className="text-primary font-bold">{customPrefix || 'PRE'}/2022/001</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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

                        {validation && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                                    <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Search className="h-4 w-4 text-primary" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pre-Import Audit List</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">{validation.summary.total} Records Found</Badge>
                                    </div>
                                    <ScrollArea className="h-64">
                                        <Table>
                                            <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="w-[80px] text-[10px] uppercase font-black">Status</TableHead>
                                                    <TableHead className="text-[10px] uppercase font-black">Email</TableHead>
                                                    <TableHead className="text-[10px] uppercase font-black w-[150px]">ID / Username</TableHead>
                                                    {editableRecords.some(r => r.firstName || r.lastName) && (
                                                        <TableHead className="text-[10px] uppercase font-black">Full Name</TableHead>
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editableRecords.map((record, idx) => (
                                                    <TableRow key={idx} className={record.status === 'DUPLICATE' ? 'bg-amber-50/40' : record.status === 'INVALID' ? 'bg-red-50/40' : ''}>
                                                        <TableCell className="py-2">
                                                            {record.status === 'READY' && <Badge className="bg-green-500 text-[9px] h-4 px-1 uppercase">Ready</Badge>}
                                                            {record.status === 'DUPLICATE' && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[9px] h-4 px-1 uppercase">Exists</Badge>}
                                                            {record.status === 'INVALID' && <Badge variant="destructive" className="text-[9px] h-4 px-1 uppercase">Error</Badge>}
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium py-2 text-primary">{record.email}</TableCell>
                                                        <TableCell className="py-1">
                                                            <div className="flex flex-col gap-1">
                                                                <Input 
                                                                    value={record.studentId} 
                                                                    onChange={(e) => handleStudentIdChange(idx, e.target.value)}
                                                                    className="h-6 text-[10px] px-2 font-bold bg-muted/30 focus-visible:bg-white border-primary/20"
                                                                    placeholder="Student ID"
                                                                />
                                                                <Input 
                                                                    value={record.username} 
                                                                    onChange={(e) => handleUsernameChange(idx, e.target.value)}
                                                                    className="h-6 text-[10px] px-2 font-mono bg-muted/10 focus-visible:bg-white text-muted-foreground"
                                                                    placeholder="Username"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        {editableRecords.some(r => r.firstName || r.lastName) && (
                                                            <TableCell className="text-xs py-2">{[record.firstName, record.lastName].filter(Boolean).join(' ')}</TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                                {validation.summary.duplicates > 0 && (
                                    <Alert className="bg-amber-50 border-amber-200 py-2">
                                        <Info className="h-4 w-4 text-amber-600" />
                                        <AlertDescription className="text-xs text-amber-700">
                                            <b>Note:</b> {validation.summary.duplicates} existing accounts were detected and will be automatically skipped or linked.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {(isUploading || isValidating) && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{isValidating ? 'Performing diagnostic scan...' : 'Processing records...'}</span>
                                    <span className="animate-pulse">Please wait</span>
                                </div>
                                <Progress value={isValidating ? 100 : 45} className="h-2" />
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
                        <Button 
                            onClick={handleUpload} 
                            disabled={!file || !programId || !level || isUploading || isValidating || (!!validation && !validation.isValid)}
                        >
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

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg">First-Login Onboarding Questions</CardTitle>
                        <CardDescription>
                            Configure student questions asked after first sign-in. All fields are used for analytics.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {onboardingQuestions.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                No questions configured yet.
                            </p>
                        )}
                        {onboardingQuestions.map((q, idx) => (
                            <div key={q.uiId} className="rounded-md border p-3 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Field key</Label>
                                        <Input
                                            value={q.key}
                                            onChange={(e) => updateQuestion(idx, { key: e.target.value })}
                                            className="h-8 text-xs"
                                            placeholder="al_subject_stream"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Question label</Label>
                                        <Input
                                            value={q.label}
                                            onChange={(e) => updateQuestion(idx, { label: e.target.value })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Input type</Label>
                                        <Select
                                            value={q.type}
                                            onValueChange={(v) => updateQuestion(idx, { type: v as OnboardingQuestion['type'] })}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="textarea">Textarea</SelectItem>
                                                <SelectItem value="select">Dropdown</SelectItem>
                                                <SelectItem value="radio">Radio</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Placeholder</Label>
                                        <Input
                                            value={q.placeholder ?? ''}
                                            onChange={(e) => updateQuestion(idx, { placeholder: e.target.value })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                                {(q.type === 'select' || q.type === 'radio') && (
                                    <div className="space-y-1">
                                        <Label className="text-xs">Options (comma-separated)</Label>
                                        <Input
                                            value={q.optionsInput}
                                            onChange={(e) => updateQuestionOption(idx, e.target.value)}
                                            onBlur={(e) => {
                                                const normalized = parseOptionsInput(e.target.value).join(', ');
                                                updateQuestion(idx, {
                                                    optionsInput: normalized,
                                                    options: parseOptionsInput(normalized),
                                                });
                                            }}
                                            className="h-8 text-xs"
                                            placeholder="Physical Science, Biology"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={q.required}
                                            onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                                        />
                                        Required on first login
                                    </label>
                                    <span className="text-xs text-muted-foreground">Included in analytics</span>
                                </div>
                                <Button variant="ghost" className="h-7 text-xs" onClick={() => removeQuestion(idx)}>
                                    Remove question
                                </Button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={addQuestion}>
                                Add question
                            </Button>
                            <Button size="sm" onClick={saveQuestions} disabled={savingQuestions}>
                                {savingQuestions ? 'Saving...' : 'Save questions'}
                            </Button>
                        </div>
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
