'use client';

import { useState, useRef } from 'react';
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
    Upload,
    Download,
    CheckCircle2,
    AlertCircle,
    Eye,
    Edit,
    Send,
    Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadStaffGrades, releaseStaffGrades } from '@/lib/actions/staff-subactions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GradesClient({ initialData, currentUserId }: { initialData: any, currentUserId: string }) {
    const router = useRouter();
    const { modules, grades: initialGrades, students } = initialData;
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadErrors, setUploadErrors] = useState<any[]>([]);
    const [uploadData, setUploadData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showReleaseDialog, setShowReleaseDialog] = useState(false);
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentGrades, setCurrentGrades] = useState(initialGrades);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getLetterGrade = (grade: number): string => {
        if (grade >= 90) return 'A+';
        if (grade >= 85) return 'A';
        if (grade >= 80) return 'A-';
        if (grade >= 75) return 'B+';
        if (grade >= 70) return 'B';
        if (grade >= 65) return 'B-';
        if (grade >= 60) return 'C+';
        if (grade >= 55) return 'C';
        if (grade >= 50) return 'C-';
        if (grade >= 45) return 'D+';
        if (grade >= 40) return 'D';
        return 'F';
    };

    const moduleGrades = currentGrades.filter((g: any) => g.moduleId === selectedModule);
    const currentModule = modules.find((m: any) => m.id === selectedModule);
    const gradingHref = selectedModule ? `/dashboard/staff/modules/${selectedModule}` : '#';
    const rosterHref = selectedModule ? `/dashboard/staff/roster/${selectedModule}` : '#';

    const hasRecord = (g: any) => g.hasGradeRecord === true;
    const gradesEnteredCount = moduleGrades.filter(hasRecord).length;
    const releasedGrades = moduleGrades.filter((g: any) => hasRecord(g) && g.isReleased);
    const pendingReleaseGrades = moduleGrades.filter((g: any) => hasRecord(g) && !g.isReleased);
    const awaitingMarksGrades = moduleGrades.filter((g: any) => g.hasGradeRecord === false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadFile(file);
            parseCSVFile(file);
        }
    };

    const parseCSVFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\\n');
            const headers = lines[0].split(',').map(h => h.trim());

            const errors: any[] = [];
            const data: any[] = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const values = line.split(',').map(v => v.trim());
                const rowData: any = {};

                headers.forEach((header, index) => {
                    rowData[header.toLowerCase().replace(/\\s+/g, '')] = values[index];
                });

                const rowErrors: string[] = [];
                if (!rowData.studentid) rowErrors.push('Student Id is required');
                if (!rowData.grade || isNaN(parseFloat(rowData.grade))) rowErrors.push('Grade must be a valid number (0-100)');

                if (rowErrors.length > 0) {
                    errors.push({
                        row: i + 1,
                        studentId: rowData.studentid || '',
                        field: 'general',
                        error: rowErrors.join(', '),
                    });
                } else {
                    const marks = parseFloat(rowData.grade);
                    data.push({
                        id: `UPLOAD_${i}`,
                        studentId: rowData.studentid,
                        studentName: '', // Will be matched on server
                        grade: marks,
                        moduleId: selectedModule,
                    });
                }
            }
            setUploadErrors(errors);
            setUploadData(data);
        };
        reader.readAsText(file);
    };

    const handleBulkUpload = async () => {
        if (uploadErrors.length > 0) {
            toast.error('Please fix all errors before uploading');
            return;
        }

        setIsUploading(true);
        try {
            await uploadStaffGrades(uploadData);
            const newGrades = uploadData.map(g => ({
                id: `GRADE_${Date.now()}_${Math.random()}`,
                studentId: g.studentId,
                moduleId: g.moduleId,
                grade: g.grade,
                letterGrade: getLetterGrade(g.grade), // Placeholder utility
                isReleased: false
            }));
            setCurrentGrades((prev: any) => [...prev, ...newGrades]);
            setIsUploading(false);
            setShowUploadDialog(false);
            setUploadFile(null);
            setUploadData([]);
            setUploadErrors([]);
            toast.success(`Successfully uploaded ${uploadData.length} grades`);
            router.refresh();
        } catch (e) {
            setIsUploading(false);
            toast.error("Failed to upload grades");
        }
    };

    const handleReleaseGrades = async () => {
        const gradeIds = selectedGrades
            .map((sid) => currentGrades.find((g: any) => g.id === sid))
            .filter((g: any) => g?.hasGradeRecord && g?.gradeId)
            .map((g: any) => g.gradeId as string);
        if (gradeIds.length === 0) {
            toast.error('No draft grades to release. Enter marks under My modules → Grading (or upload) first.');
            setShowReleaseDialog(false);
            return;
        }
        try {
            await releaseStaffGrades(gradeIds);
            setCurrentGrades((prev: any) =>
                prev.map((g: any) => (gradeIds.includes(g.gradeId) ? { ...g, isReleased: true } : g))
            );
            setShowReleaseDialog(false);
            toast.success(`Released ${gradeIds.length} grades`);
            setSelectedGrades([]);
            router.refresh();
        } catch (e) {
            toast.error("Failed to release grades");
        }
    };

    const handleSelectAllGrades = () => {
        const allSelected =
            moduleGrades.length > 0 && moduleGrades.every((g: any) => selectedGrades.includes(g.id));
        if (allSelected) setSelectedGrades([]);
        else setSelectedGrades(moduleGrades.map((g: any) => g.id));
    };

    const handleSelectGrade = (gradeId: string) => {
        setSelectedGrades(prev => prev.includes(gradeId) ? prev.filter(id => id !== gradeId) : [...prev, gradeId]);
    };

    const downloadTemplate = () => {
        if (!selectedModule || !currentModule) {
            toast.error('Select a module first to download its template.');
            return;
        }

        const rows = moduleGrades.map((g: any) => {
            const student = students.find((s: any) => s.id === g.studentId);
            const studentName = student?.name || '';
            const gradeCell = g.hasGradeRecord ? (g.grade ?? '') : '';
            return [g.studentId, studentName, gradeCell];
        });

        const csvRows = [
            ['Student Id', 'Student Name', 'Grade'],
            ...rows,
        ];
        const csvContent = csvRows
            .map((row) => row.map((cell: any) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeCode = String(currentModule.code || 'module').replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `grades_${safeCode}_student_list.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Downloaded template for ${currentModule.title}`);
    };

    const filteredGrades = moduleGrades.filter((grade: any) => {
        const student = students.find((s: any) => s.id === grade.studentId);
        const term = (searchTerm || '').toLowerCase();
        const studentName = (student?.name || '').toLowerCase();
        const studentId = (grade.studentId || '').toLowerCase();
        return studentName.includes(term) || studentId.includes(term);
    });

    const releasableSelectedCount = selectedGrades.filter((sid) => {
        const g = currentGrades.find((x: any) => x.id === sid);
        return g?.hasGradeRecord && g?.gradeId;
    }).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Grade Management</h1>
                    <p className="text-muted-foreground mt-1">Upload, manage, and release student grades</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadTemplate} disabled={!selectedModule}>
                        <Download className="mr-2 h-4 w-4" /> Download Module Template
                    </Button>
                    <Button onClick={() => setShowUploadDialog(true)} disabled={!selectedModule}>
                        <Upload className="mr-2 h-4 w-4" /> Upload Grades
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Module</CardTitle>
                    <CardDescription>Choose a module to manage grades for</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="module">Module</Label>
                            <Select value={selectedModule} onValueChange={setSelectedModule}>
                                <SelectTrigger><SelectValue placeholder="Select a module" /></SelectTrigger>
                                <SelectContent>
                                    {modules.map((module: any) => (
                                        <SelectItem key={module.id} value={module.id}>
                                            {module.title} - {module.academicYear} {module.semester}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {currentModule && (
                            <div className="space-y-2">
                                <Label>Module Information</Label>
                                <div className="p-3 rounded-lg bg-muted">
                                    <div className="font-medium">{currentModule.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {currentModule.academicYear} {currentModule.semester} • {currentModule.credits} credits
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedModule && (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Students</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{moduleGrades.length}</div>
                                <p className="text-xs text-muted-foreground">Enrolled students</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Marks entered</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{gradesEnteredCount}</div>
                                <p className="text-xs text-muted-foreground">Grade records in DB</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Released</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{releasedGrades.length}</div>
                                <p className="text-xs text-muted-foreground">Grades released</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Pending release</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingReleaseGrades.length}</div>
                                <p className="text-xs text-muted-foreground">Draft grades not released</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="grades" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="grades">All Grades</TabsTrigger>
                            <TabsTrigger value="pending">Pending Release</TabsTrigger>
                            <TabsTrigger value="released">Released</TabsTrigger>
                        </TabsList>

                        <TabsContent value="grades" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>All Grades</CardTitle>
                                    <CardDescription>Manage all grades for {currentModule?.title}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search students..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            <Button variant="outline" onClick={handleSelectAllGrades}>
                                                {moduleGrades.length > 0 &&
                                                moduleGrades.every((g: any) => selectedGrades.includes(g.id))
                                                    ? 'Deselect All'
                                                    : 'Select All'}
                                            </Button>
                                            {selectedGrades.length > 0 && (
                                                <Button onClick={() => setShowReleaseDialog(true)}>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Release Selected ({releasableSelectedCount})
                                                </Button>
                                            )}
                                        </div>

                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                moduleGrades.length > 0 &&
                                                                moduleGrades.every((g: any) => selectedGrades.includes(g.id))
                                                            }
                                                            onChange={handleSelectAllGrades}
                                                        />
                                                    </TableHead>
                                                    <TableHead>Student</TableHead>
                                                    <TableHead>Grade</TableHead>
                                                    <TableHead>Points</TableHead>
                                                    <TableHead>Credits</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredGrades.map((grade: any) => {
                                                    const student = students.find((s: any) => s.id === grade.studentId);
                                                    return (
                                                        <TableRow key={grade.id}>
                                                            <TableCell>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedGrades.includes(grade.id)}
                                                                    onChange={() => handleSelectGrade(grade.id)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium">{student?.name || 'Unknown User'}</div>
                                                                    <div className="text-sm text-muted-foreground">{grade.studentId}</div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={
                                                                        grade.letterGrade === 'F'
                                                                            ? 'destructive'
                                                                            : grade.hasGradeRecord === false
                                                                              ? 'outline'
                                                                              : 'default'
                                                                    }
                                                                >
                                                                    {grade.letterGrade}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{grade.hasGradeRecord === false ? '—' : grade.points}</TableCell>
                                                            <TableCell>{grade.credits}</TableCell>
                                                            <TableCell>
                                                                {grade.hasGradeRecord === false ? (
                                                                    <Badge variant="outline">No marks</Badge>
                                                                ) : (
                                                                    <Badge variant={grade.isReleased ? 'default' : 'secondary'}>
                                                                        {grade.isReleased ? 'Released' : 'Draft'}
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-1">
                                                                    <Button variant="outline" size="sm" asChild title="View roster">
                                                                        <Link href={rosterHref}>
                                                                            <Eye className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                    <Button variant="outline" size="sm" asChild title="Edit in Grading">
                                                                        <Link href={gradingHref}>
                                                                            <Edit className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pending" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pending Release</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {pendingReleaseGrades.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                {awaitingMarksGrades.length > 0 ? (
                                                    <>
                                                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                                                        <p className="font-medium text-foreground">No draft grades to release yet</p>
                                                        <p className="mt-2 max-w-md mx-auto text-sm">
                                                            {awaitingMarksGrades.length} enrolled student{awaitingMarksGrades.length === 1 ? '' : 's'} have no grade record. Enter marks under <span className="text-foreground font-medium">My modules → Grading</span> (or upload a CSV), then return here to release.
                                                        </p>
                                                        <Button className="mt-4" variant="outline" asChild>
                                                            <Link href={gradingHref}>Open grading</Link>
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
                                                        <p>Nothing waiting for release — all entered grades are published, or there are no students.</p>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-4">
                                                    <Button variant="outline" onClick={() => setSelectedGrades(pendingReleaseGrades.map((g: any) => g.id))}>
                                                        Select All Pending
                                                    </Button>
                                                    {selectedGrades.length > 0 && (
                                                        <Button onClick={() => setShowReleaseDialog(true)}>
                                                            <Send className="mr-2 h-4 w-4" /> Release Selected (
                                                            {releasableSelectedCount})
                                                        </Button>
                                                    )}
                                                </div>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-12">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        pendingReleaseGrades.length > 0 &&
                                                                        pendingReleaseGrades.every((g: any) => selectedGrades.includes(g.id))
                                                                    }
                                                                    onChange={() =>
                                                                        pendingReleaseGrades.every((g: any) => selectedGrades.includes(g.id))
                                                                            ? setSelectedGrades([])
                                                                            : setSelectedGrades(pendingReleaseGrades.map((g: any) => g.id))
                                                                    }
                                                                />
                                                            </TableHead>
                                                            <TableHead>Student</TableHead>
                                                            <TableHead>Grade</TableHead>
                                                            <TableHead>Points</TableHead>
                                                            <TableHead>Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {pendingReleaseGrades.map((grade: any) => {
                                                            const student = students.find((s: any) => s.id === grade.studentId);
                                                            return (
                                                                <TableRow key={grade.id}>
                                                                    <TableCell>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedGrades.includes(grade.id)}
                                                                            onChange={() => handleSelectGrade(grade.id)}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div>
                                                                            <div className="font-medium">{student?.name || 'Unknown User'}</div>
                                                                            <div className="text-sm text-muted-foreground">{grade.studentId}</div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={grade.letterGrade === 'F' ? 'destructive' : 'default'}>
                                                                            {grade.letterGrade}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>{grade.points}</TableCell>
                                                                    <TableCell>
                                                                        <div className="flex gap-1">
                                                                            <Button variant="outline" size="sm" asChild title="Edit in Grading">
                                                                                <Link href={gradingHref}>
                                                                                    <Edit className="h-4 w-4" />
                                                                                </Link>
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline" size="sm"
                                                                                onClick={() => { setSelectedGrades([grade.id]); setShowReleaseDialog(true); }}
                                                                            >
                                                                                <Send className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="released" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Released Grades</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Grade</TableHead>
                                                <TableHead>Points</TableHead>
                                                <TableHead>Released Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {releasedGrades.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                        No released grades for this module yet.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                releasedGrades.map((grade: any) => {
                                                    const student = students.find((s: any) => s.id === grade.studentId);
                                                    return (
                                                        <TableRow key={grade.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium">{student?.name || 'Unknown User'}</div>
                                                                    <div className="text-sm text-muted-foreground">{grade.studentId}</div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={grade.letterGrade === 'F' ? 'destructive' : 'default'}>{grade.letterGrade}</Badge>
                                                            </TableCell>
                                                            <TableCell>{grade.points}</TableCell>
                                                            <TableCell>Released</TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Upload Grades</DialogTitle>
                        <DialogDescription>Upload grades from a CSV file for {currentModule?.title || 'the selected module'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">CSV File</Label>
                            <div className="flex items-center gap-2">
                                <Input ref={fileInputRef} id="file" type="file" accept=".csv" onChange={handleFileUpload} className="flex-1" />
                                <Button variant="outline" onClick={downloadTemplate}><Download className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        {uploadErrors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Upload Errors</AlertTitle>
                                <AlertDescription>
                                    <div className="space-y-1">
                                        {uploadErrors.map((error, index) => (
                                            <div key={index} className="text-sm">Row {error.row}: {error.error}</div>
                                        ))}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                        {uploadData.length > 0 && (
                            <div className="space-y-2">
                                <Label>Preview ({uploadData.length} records)</Label>
                                <div className="max-h-40 overflow-y-auto border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student ID</TableHead>
                                                <TableHead>Grade</TableHead>
                                                <TableHead>Points</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {uploadData.slice(0, 5).map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.studentId}</TableCell>
                                                    <TableCell>{item.grade}</TableCell>
                                                    <TableCell>{item.points}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
                        <Button onClick={handleBulkUpload} disabled={uploadErrors.length > 0 || uploadData.length === 0 || isUploading || !selectedModule}>
                            {isUploading ? "Uploading..." : "Upload Grades"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Release Dialog */}
            <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Release Grades</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to release {releasableSelectedCount} grade
                            {releasableSelectedCount === 1 ? '' : 's'} to students?
                            {releasableSelectedCount < selectedGrades.length && (
                                <span className="block mt-2 text-muted-foreground">
                                    ({selectedGrades.length - releasableSelectedCount} selected row
                                    {selectedGrades.length - releasableSelectedCount === 1 ? '' : 's'} have no marks yet and will be skipped.)
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>Cancel</Button>
                        <Button onClick={handleReleaseGrades}>Release Grades</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
