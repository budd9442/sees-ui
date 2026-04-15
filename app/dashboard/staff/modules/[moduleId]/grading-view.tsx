'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    updateStudentGrade,
    setModuleCustomGradingBands,
    bulkUploadStaffGrades,
    releaseModuleGrades,
} from '@/lib/actions/staff-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Save, Download, Upload, CheckCircle, Clock, Send, AlertCircle, Plus, Trash2, Table2 } from 'lucide-react';
import type { GradingBandRow } from '@/lib/grading/marks-to-grade';
import { resolveGradeFromUploadCell, validateBands } from '@/lib/grading/marks-to-grade';

interface StudentGradingProps {
    students: any[];
    moduleId: string;
    initialScale: {
        bands: GradingBandRow[];
        institutionBands: GradingBandRow[];
        usesCustomOverride: boolean;
    };
}

type CsvPreviewRow = {
    line: number;
    studentId: string;
    rawGrade: string;
    /** Value sent to bulk upload: numeric marks or letter from scale */
    uploadGrade?: number | string;
    error?: string;
};

type EditableBand = { letter: string; points: string; minMarks: string; maxMarks: string };

function bandsToEditable(b: GradingBandRow[]): EditableBand[] {
    return b.map((x) => ({
        letter: x.letter_grade,
        points: String(x.grade_point),
        minMarks: String(x.min_marks),
        maxMarks: String(x.max_marks),
    }));
}

function editableToPayload(rows: EditableBand[]): unknown {
    return rows.map((r) => ({
        letter_grade: r.letter.trim(),
        grade_point: parseFloat(r.points),
        min_marks: parseFloat(r.minMarks),
        max_marks: parseFloat(r.maxMarks),
    }));
}

/** Split one CSV line respecting double-quoted fields (commas inside quotes). */
function parseCsvLine(line: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
            out.push(cur.trim());
            cur = '';
        } else {
            cur += c;
        }
    }
    out.push(cur.trim());
    return out;
}

function normalizeHeaderCell(h: string): string {
    return h.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, '');
}

function parseGradingCsv(
    text: string,
    bands: GradingBandRow[]
): { rows: CsvPreviewRow[]; headerError?: string } {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rawLines = normalized.split('\n').map((l) => l.trim());
    const lines = rawLines.filter((l) => l.length > 0);

    if (lines.length === 0) {
        return { rows: [], headerError: 'File is empty.' };
    }

    const headers = parseCsvLine(lines[0]).map(normalizeHeaderCell);
    const studentIdx = headers.findIndex(
        (h) =>
            h === 'studentid' ||
            h === 'student_id' ||
            h === 'studentnumber' ||
            h === 'studentno' ||
            h === 'id' ||
            h === 'student'
    );
    const gradeIdx = headers.findIndex(
        (h) =>
            h === 'grade' ||
            h === 'marks' ||
            h === 'mark' ||
            h === 'score' ||
            h === 'percentage' ||
            h === 'percent'
    );

    if (studentIdx === -1 || gradeIdx === -1) {
        return {
            rows: [],
            headerError:
                'The first row must name columns for student id and grade. Use headers like: StudentId, Grade (or Marks). Grade may be a number 0–100 or a letter on this module’s scale.',
        };
    }

    const rows: CsvPreviewRow[] = [];
    for (let i = 1; i < lines.length; i++) {
        const lineNum = i + 1;
        const parts = parseCsvLine(lines[i]);
        const studentId = parts[studentIdx] ?? '';
        const rawGrade = parts[gradeIdx] ?? '';

        if (!studentId && !rawGrade) continue;

        let error: string | undefined;
        let uploadGrade: number | string | undefined;

        if (!studentId) {
            error = 'Missing student id';
        } else if (rawGrade === '' || rawGrade === '-') {
            error = 'Missing grade';
        } else {
            try {
                const r = resolveGradeFromUploadCell(rawGrade.trim(), bands);
                uploadGrade = r.marks != null ? r.marks : r.letter_grade;
            } catch (e) {
                error = e instanceof Error ? e.message : 'Invalid grade';
            }
        }

        rows.push({ line: lineNum, studentId, rawGrade, uploadGrade, error });
    }

    if (rows.length === 0) {
        return { rows: [], headerError: 'No data rows found after the header.' };
    }

    return { rows };
}

export default function StudentGradingClient({ students, moduleId, initialScale }: StudentGradingProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [marksMap, setMarksMap] = useState<Record<string, string>>({});
    const [letterMap, setLetterMap] = useState<Record<string, string>>({});
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [csvPreviewRows, setCsvPreviewRows] = useState<CsvPreviewRow[]>([]);
    const [csvHeaderError, setCsvHeaderError] = useState<string | null>(null);

    const [bands, setBands] = useState<GradingBandRow[]>(initialScale.bands);
    const [usesOverride, setUsesOverride] = useState(initialScale.usesCustomOverride);
    const [bandsModalOpen, setBandsModalOpen] = useState(false);
    const [editingScale, setEditingScale] = useState(false);
    const [editedRows, setEditedRows] = useState<EditableBand[]>([]);
    const [scaleSaving, setScaleSaving] = useState(false);

    useEffect(() => {
        setBands(initialScale.bands);
        setUsesOverride(initialScale.usesCustomOverride);
    }, [initialScale.bands, initialScale.usesCustomOverride]);

    const letterOptions = useMemo(
        () => [...new Set(bands.map((b) => b.letter_grade))].sort((a, b) => a.localeCompare(b)),
        [bands]
    );

    const openScaleEditor = () => {
        const source = usesOverride ? bands : initialScale.institutionBands;
        setEditedRows(bandsToEditable(source.map((b) => ({ ...b }))));
        setEditingScale(true);
    };

    const handleSaveCustomScale = async () => {
        const payload = editableToPayload(editedRows);
        const v = validateBands(payload);
        if (!v.ok) {
            toast.error(v.error);
            return;
        }
        setScaleSaving(true);
        try {
            await setModuleCustomGradingBands(moduleId, v.bands);
            toast.success('Custom grading scale saved');
            setEditingScale(false);
            setBandsModalOpen(false);
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to save scale');
        } finally {
            setScaleSaving(false);
        }
    };

    const handleResetInstitution = async () => {
        setScaleSaving(true);
        try {
            await setModuleCustomGradingBands(moduleId, null);
            toast.success('Now using institution default scale');
            setEditingScale(false);
            setBandsModalOpen(false);
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to reset');
        } finally {
            setScaleSaving(false);
        }
    };

    const updateEditedRow = (index: number, field: keyof EditableBand, value: string) => {
        setEditedRows((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    };

    const addBandRow = () => {
        setEditedRows((rows) => [...rows, { letter: '', points: '0', minMarks: '0', maxMarks: '100' }]);
    };

    const removeBandRow = (index: number) => {
        setEditedRows((rows) => rows.filter((_, i) => i !== index));
    };

    const handleMarkChange = (regId: string, val: string) => {
        setMarksMap((prev) => ({ ...prev, [regId]: val }));
        if (val.trim() !== '') {
            setLetterMap((prev) => {
                const next = { ...prev };
                delete next[regId];
                return next;
            });
        }
    };

    const handleLetterChange = (regId: string, val: string) => {
        setLetterMap((prev) => ({ ...prev, [regId]: val }));
        if (val) {
            setMarksMap((prev) => {
                const next = { ...prev };
                delete next[regId];
                return next;
            });
        }
    };

    const handleSave = async (regId: string, student: (typeof students)[0]) => {
        const marksStr = (marksMap[regId] ?? '').trim();
        let letterPick = '';
        if (letterMap[regId] !== undefined) {
            letterPick = letterMap[regId].trim();
        } else if (!marksStr && student.grade?.marks == null && student.grade?.grade) {
            letterPick = String(student.grade.grade).trim();
        }

        const hasMarks = marksStr !== '';
        let marksNum: number | undefined;
        if (hasMarks) {
            marksNum = parseFloat(marksStr);
            if (Number.isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
                toast.error('Marks must be a number from 0 to 100.');
                return;
            }
        }

        if (!hasMarks && !letterPick) {
            toast.error('Enter marks (0–100) or choose a letter grade from the scale.');
            return;
        }

        setLoadingMap((prev) => ({ ...prev, [regId]: true }));
        try {
            if (hasMarks) {
                await updateStudentGrade(regId, { marks: marksNum as number });
            } else {
                await updateStudentGrade(regId, { letterGrade: letterPick });
            }
            toast.success('Grade saved as draft');
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to save grade');
        } finally {
            setLoadingMap((prev) => ({ ...prev, [regId]: false }));
        }
    };

    const handlePublishAll = async () => {
        setIsPublishing(true);
        try {
            await releaseModuleGrades(moduleId);
            toast.success('All grades published successfully');
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to publish grades');
        } finally {
            setIsPublishing(false);
        }
    };

    const downloadTemplate = () => {
        const headers = 'StudentId,Grade\n';
        const rows = students.map((s) => `${s.studentNumber},`).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `grading_template_${moduleId}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const resetFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onerror = () => {
            toast.error('Could not read the file. Try a UTF-8 CSV export.');
            resetFileInput();
        };
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const { rows, headerError } = parseGradingCsv(text, bands);
            setCsvHeaderError(headerError ?? null);
            setCsvPreviewRows(rows);
            setUploadDialogOpen(true);
            resetFileInput();
        };
        reader.readAsText(file);
    };

    const validUploadPayload = csvPreviewRows
        .filter((r) => r.uploadGrade !== undefined && !r.error)
        .map((r) => ({ studentId: r.studentId, grade: r.uploadGrade as number | string }));

    const handleConfirmCsvUpload = async () => {
        if (validUploadPayload.length === 0) {
            toast.error('No valid rows to upload. Fix errors in the preview or choose another file.');
            return;
        }

        setIsUploading(true);
        try {
            const res = await bulkUploadStaffGrades(moduleId, validUploadPayload);
            const { successCount, failCount, failures } = res;

            if (successCount > 0 && failCount === 0) {
                toast.success(`Successfully uploaded ${successCount} grade${successCount === 1 ? '' : 's'}.`);
                setUploadDialogOpen(false);
                setCsvPreviewRows([]);
                setCsvHeaderError(null);
                router.refresh();
            } else if (successCount > 0 && failCount > 0) {
                const sample = failures.slice(0, 5).map((f) => `${f.studentId} (${f.reason})`).join('; ');
                const more = failures.length > 5 ? ` …and ${failures.length - 5} more` : '';
                toast.warning(`Uploaded ${successCount}. ${failCount} row(s) not matched: ${sample}${more}`);
                setUploadDialogOpen(false);
                setCsvPreviewRows([]);
                setCsvHeaderError(null);
                router.refresh();
            } else {
                const sample = failures.slice(0, 8).map((f) => f.studentId).join(', ');
                toast.error(
                    `No grades were saved (${failCount} unmatched). Check student ids match enrollment (e.g. ${sample || 'n/a'}).`
                );
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed';
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    const closeUploadDialog = (open: boolean) => {
        setUploadDialogOpen(open);
        if (!open) {
            setCsvPreviewRows([]);
            setCsvHeaderError(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <Badge variant={usesOverride ? 'default' : 'secondary'} className="w-fit shrink-0">
                        {usesOverride ? 'Custom bands (this module)' : 'Institution default bands'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                        Marks and CSV grades use these letter ranges. This is separate from{' '}
                        <span className="font-medium text-foreground">Admin → GPA Config</span> (institution policy).
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 self-start sm:self-auto"
                    onClick={() => setBandsModalOpen(true)}
                >
                    <Table2 className="mr-2 h-4 w-4" />
                    Grade bands…
                </Button>
            </div>

            <Dialog
                open={bandsModalOpen}
                onOpenChange={(open) => {
                    setBandsModalOpen(open);
                    if (!open) setEditingScale(false);
                }}
            >
                <DialogContent className="flex max-h-[min(85vh,720px)] w-[calc(100vw-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                    <div className="min-h-0 space-y-4 overflow-y-auto p-6">
                        <DialogHeader className="space-y-2 text-left">
                            <DialogTitle>Grade bands for this module</DialogTitle>
                            <DialogDescription className="text-pretty">
                                View or edit how percentage marks map to letter grades and points for{' '}
                                <strong>this module only</strong>. New saves and CSV uploads use the active bands;
                                already released grades are not recalculated. Institution defaults are maintained under{' '}
                                <strong>Admin → GPA Config</strong> (not here).
                            </DialogDescription>
                        </DialogHeader>

                        {!editingScale ? (
                            <>
                                <div className="overflow-x-auto rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Letter</TableHead>
                                                <TableHead>Grade points</TableHead>
                                                <TableHead>Min %</TableHead>
                                                <TableHead>Max %</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bands.map((b, i) => (
                                                <TableRow key={`${b.letter_grade}-${i}`}>
                                                    <TableCell className="font-medium">{b.letter_grade}</TableCell>
                                                    <TableCell>{b.grade_point}</TableCell>
                                                    <TableCell>{b.min_marks}</TableCell>
                                                    <TableCell>{b.max_marks}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={openScaleEditor}>
                                        Customize for this module
                                    </Button>
                                    {usesOverride && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={scaleSaving}
                                            onClick={handleResetInstitution}
                                        >
                                            Use institution default
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {editedRows.map((row, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-5 sm:items-end"
                                        >
                                            <div className="space-y-1">
                                                <Label className="text-xs">Letter</Label>
                                                <Input
                                                    value={row.letter}
                                                    onChange={(e) => updateEditedRow(index, 'letter', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Points</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={row.points}
                                                    onChange={(e) => updateEditedRow(index, 'points', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Min %</Label>
                                                <Input
                                                    type="number"
                                                    value={row.minMarks}
                                                    onChange={(e) => updateEditedRow(index, 'minMarks', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Max %</Label>
                                                <Input
                                                    type="number"
                                                    value={row.maxMarks}
                                                    onChange={(e) => updateEditedRow(index, 'maxMarks', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="flex sm:justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => removeBandRow(index)}
                                                    disabled={editedRows.length <= 1}
                                                    aria-label="Remove band"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addBandRow}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add band
                                </Button>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" size="sm" disabled={scaleSaving} onClick={handleSaveCustomScale}>
                                        {scaleSaving ? 'Saving…' : 'Save custom scale'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={scaleSaving}
                                        onClick={() => setEditingScale(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                        <Download className="mr-2 h-4 w-4" />
                        Download template
                    </Button>
                    <div className="relative">
                        <Button variant="outline" size="sm" type="button" disabled={isUploading}>
                            <Upload className="mr-2 h-4 w-4" />
                            Bulk CSV
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,text/csv"
                            onChange={handleFileSelected}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            disabled={isUploading}
                            aria-label="Upload grades CSV"
                        />
                    </div>
                </div>

                <Button size="sm" onClick={handlePublishAll} disabled={isPublishing}>
                    <Send className="mr-2 h-4 w-4" />
                    {isPublishing ? 'Publishing…' : 'Release all grades'}
                </Button>
            </div>

            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Student</TableHead>
                            <TableHead className="min-w-[220px]">Grade entry</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="pr-6 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => {
                            const rid = student.registrationId;
                            const letterVal =
                                letterMap[rid] !== undefined
                                    ? letterMap[rid]
                                    : student.grade?.marks == null && student.grade?.grade
                                      ? student.grade.grade
                                      : '';
                            const selectValue =
                                letterVal && letterOptions.includes(letterVal) ? letterVal : '__none__';
                            return (
                            <TableRow key={rid}>
                                <TableCell className="pl-6 py-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium">{student.studentName}</span>
                                        <span className="text-xs text-muted-foreground">{student.studentNumber}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">% marks (optional)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                className="h-9 w-24"
                                                placeholder="—"
                                                value={marksMap[rid] ?? (student.grade?.marks ?? '')}
                                                onChange={(e) => handleMarkChange(rid, e.target.value)}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <Label className="text-xs text-muted-foreground">Or letter (scale)</Label>
                                            <Select
                                                value={selectValue}
                                                onValueChange={(v) =>
                                                    handleLetterChange(rid, v === '__none__' ? '' : v)
                                                }
                                            >
                                                <SelectTrigger className="h-9 w-full sm:max-w-[140px]">
                                                    <SelectValue placeholder="Letter" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="__none__">None</SelectItem>
                                                    {letterOptions.map((lg) => (
                                                        <SelectItem key={lg} value={lg}>
                                                            {lg}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {student.grade ? (
                                        student.grade.isReleased ? (
                                            <Badge variant="outline" className="gap-1 border-green-600/30 text-green-700">
                                                <CheckCircle className="h-3 w-3" />
                                                Published
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="gap-1">
                                                <Clock className="h-3 w-3" />
                                                Draft
                                            </Badge>
                                        )
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No grade yet</span>
                                    )}
                                </TableCell>
                                <TableCell className="pr-6 text-right">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSave(rid, student)}
                                        disabled={loadingMap[rid]}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {loadingMap[rid] ? 'Saving…' : 'Save draft'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={uploadDialogOpen} onOpenChange={closeUploadDialog}>
                <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
                    <div className="min-h-0 space-y-4 overflow-y-auto p-6 pb-2">
                        <DialogHeader className="space-y-2 text-left">
                            <DialogTitle>Review CSV upload</DialogTitle>
                            <DialogDescription className="text-pretty">
                                Rows with errors are skipped; only valid rows are uploaded. Each grade cell may be a
                                <span className="font-medium text-foreground"> numeric mark (0–100)</span> or a
                                <span className="font-medium text-foreground"> letter</span> from this module's scale
                                (same as bulk rules on this page).
                            </DialogDescription>
                        </DialogHeader>

                        {csvHeaderError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Could not parse file</AlertTitle>
                                <AlertDescription className="text-pretty">{csvHeaderError}</AlertDescription>
                            </Alert>
                        )}

                        {!csvHeaderError && csvPreviewRows.length > 0 && (
                            <div className="min-w-0 space-y-2">
                                <p className="text-sm text-muted-foreground text-pretty">
                                    <span className="font-medium text-foreground">{validUploadPayload.length}</span>{' '}
                                    valid row{validUploadPayload.length === 1 ? '' : 's'}
                                    {csvPreviewRows.length !== validUploadPayload.length && (
                                        <>
                                            {' '}
                                            ·{' '}
                                            <span className="text-destructive">
                                                {csvPreviewRows.length - validUploadPayload.length} with errors
                                            </span>
                                        </>
                                    )}
                                </p>
                                <div className="max-h-52 min-w-0 overflow-auto rounded-md border">
                                    <Table className="w-full min-w-[280px] table-fixed">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12 shrink-0">Line</TableHead>
                                                <TableHead className="w-[32%]">Student id</TableHead>
                                                <TableHead className="w-20">Mark / letter</TableHead>
                                                <TableHead className="w-[38%]">Note</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {csvPreviewRows.slice(0, 50).map((r) => (
                                                <TableRow key={r.line}>
                                                    <TableCell className="align-top text-muted-foreground">
                                                        {r.line}
                                                    </TableCell>
                                                    <TableCell
                                                        className="align-top font-mono text-xs break-all"
                                                        title={r.studentId || undefined}
                                                    >
                                                        {r.studentId || '—'}
                                                    </TableCell>
                                                    <TableCell className="align-top font-mono text-xs break-all">
                                                        {r.rawGrade || '—'}
                                                    </TableCell>
                                                    <TableCell className="align-top text-xs break-words whitespace-normal">
                                                        {r.error ? (
                                                            <span className="text-destructive">{r.error}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">OK</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {csvPreviewRows.length > 50 && (
                                    <p className="text-center text-xs text-muted-foreground">
                                        Showing first 50 of {csvPreviewRows.length} rows
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="shrink-0 gap-2 border-t p-4 sm:gap-0 sm:px-6">
                        <Button type="button" variant="outline" onClick={() => closeUploadDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmCsvUpload}
                            disabled={isUploading || !!csvHeaderError || validUploadPayload.length === 0}
                        >
                            {isUploading ? 'Uploading…' : `Upload ${validUploadPayload.length} row(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
