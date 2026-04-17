'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Save,
    RefreshCw,
    Target,
    CheckCircle2,
    Download,
    Copy,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { saveAdminGradingBands } from '@/lib/actions/admin-actions';
import { exportTabularData } from '@/lib/export';

export default function GpaConfigClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);

    const [gradeScale, setGradeScale] = useState<any[]>(
        initialData.gradePointScale || [
            { id: '1', grade: 'A+', points: 4.0, minMarks: 85, maxMarks: 100 },
            { id: '2', grade: 'A', points: 4.0, minMarks: 75, maxMarks: 84 },
            { id: '3', grade: 'B+', points: 3.3, minMarks: 70, maxMarks: 74 },
            { id: '4', grade: 'B', points: 3.0, minMarks: 65, maxMarks: 69 },
            { id: '5', grade: 'C+', points: 2.3, minMarks: 60, maxMarks: 64 },
            { id: '6', grade: 'C', points: 2.0, minMarks: 55, maxMarks: 59 },
            { id: '7', grade: 'D', points: 1.0, minMarks: 45, maxMarks: 54 },
            { id: '8', grade: 'F', points: 0.0, minMarks: 0, maxMarks: 44 },
        ]
    );
    const [savedGradeScale, setSavedGradeScale] = useState<any[]>(
        (initialData.gradePointScale || []).map((b: any) => ({ ...b }))
    );
    const [savingBands, setSavingBands] = useState(false);

    const handleSaveGradingBands = async () => {
        setSavingBands(true);
        try {
            await saveAdminGradingBands(gradeScale);
            setSavedGradeScale(gradeScale.map((b: any) => ({ ...b })));
            toast.success('Grade bands saved. Staff grading uses this scale now.');
            router.refresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to save grade bands';
            toast.error(msg);
        } finally {
            setSavingBands(false);
        }
    };

    const handleUpdateBand = (id: string, field: string, value: string | number) => {
        setGradeScale(prev => prev.map(band => 
            band.id === id ? { ...band, [field]: value } : band
        ));
    };

    const handleResetGradeBandsTable = () => {
        setGradeScale(savedGradeScale.map((b: any) => ({ ...b })));
        toast.success('Grade bands table reset to last saved values');
    };

    const handleDeleteBand = (id: string) => {
        if (gradeScale.length <= 1) {
            toast.error('At least one grade band is required');
            return;
        }
        setGradeScale((prev) => prev.filter((band) => band.id !== id));
    };

    const calculateSampleGPA = () => {
        const sampleGrades = [
            { gradeCode: 'A', credits: 3 },
            { gradeCode: 'B+', credits: 3 },
            { gradeCode: 'C', credits: 3 },
            { gradeCode: 'A+', credits: 3 },
        ];
        
        let totalPoints = 0;
        let totalCredits = 0;

        sampleGrades.forEach(sg => {
            const band = gradeScale.find(b => b.grade === sg.gradeCode);
            if (band) {
                totalPoints += band.points * sg.credits;
                totalCredits += sg.credits;
            }
        });

        const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
        return {
            gpa: gpa.toFixed(2),
            sampleGrades,
        };
    };

    const sampleCalculation = calculateSampleGPA();

    const exportCurrentConfig = async () => {
        try {
            const rows = gradeScale.map((band: any) => ({
                grade: band.grade,
                minMarks: band.minMarks,
                maxMarks: band.maxMarks,
                points: band.points,
            }));
            await exportTabularData(rows, 'excel', { filename: `gpa-config-${Date.now()}` });
            toast.success('Configuration exported as Excel');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to export configuration');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 space-y-3">
                    <div>
                        <h1 className="text-3xl font-bold">Grading scheme defaults (institution)</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowPreviewDialog(true)}><Target className="mr-2 h-4 w-4" />Preview Calculation</Button>
                    <Button variant="outline" onClick={() => void exportCurrentConfig()}><Download className="mr-2 h-4 w-4" />Export Config</Button>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" />Current Configuration Status</CardTitle><CardDescription>Active default grading scheme used by staff grading</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2"><Label className="text-sm font-medium">Grade Scale</Label><Badge variant="outline">{gradeScale.length} grades</Badge></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Last Updated</Label><Badge variant="outline">{new Date().toLocaleDateString()}</Badge></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Scope</Label><Badge variant="outline">Institution defaults</Badge></div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Default grade point scale & mark bands</CardTitle>
                    <CardDescription>
                        Defines the institution default used for mapping marks to letters and points. Staff may
                        open "Grade bands" on a module's grading page to apply a one-off override for that module
                        only; overrides do not change these defaults.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Min Marks</TableHead>
                                    <TableHead>Max Marks</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gradeScale.map((band: any) => (
                                    <TableRow key={band.id}>
                                        <TableCell>
                                            <Input value={band.grade} onChange={(e) => handleUpdateBand(band.id, 'grade', e.target.value)} className="w-20 font-bold" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={band.minMarks} onChange={(e) => handleUpdateBand(band.id, 'minMarks', e.target.value)} className="w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={band.maxMarks} onChange={(e) => handleUpdateBand(band.id, 'maxMarks', e.target.value)} className="w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" step="0.1" value={band.points} onChange={(e) => handleUpdateBand(band.id, 'points', e.target.value)} className="w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteBand(band.id)}
                                                aria-label={`Delete grade band ${band.grade}`}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                onClick={() => void handleSaveGradingBands()}
                                disabled={savingBands}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {savingBands ? 'Saving…' : 'Save grade bands'}
                            </Button>
                            <Button variant="outline" type="button" onClick={handleResetGradeBandsTable}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset table to last saved
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() =>
                                    setGradeScale([
                                        ...gradeScale,
                                        {
                                            id: crypto.randomUUID(),
                                            grade: 'New',
                                            points: 0.0,
                                            minMarks: 0,
                                            maxMarks: 0,
                                        },
                                    ])
                                }
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Add row
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <strong>Save grade bands</strong> writes this table to the database for staff
                            grading (marks to letter) and LMS grade mapping.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Grade Scale Preview</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Sample Grades</Label>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Grade</TableHead><TableHead>Credits</TableHead><TableHead>Points</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {sampleCalculation.sampleGrades.map((sg, index) => {
                                            const band = gradeScale.find(b => b.grade === sg.gradeCode);
                                            const points = band ? band.points : 0;
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell><Badge variant="outline">{sg.gradeCode}</Badge></TableCell>
                                                    <TableCell>{sg.credits}</TableCell>
                                                    <TableCell>{points}</TableCell>
                                                    <TableCell>{(points * sg.credits).toFixed(1)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                        </div>
                        <div className="p-4 rounded-lg bg-muted">
                            <div className="space-y-2">
                                <div className="flex justify-between"><span className="font-medium">Calculated GPA:</span><span className="font-bold text-lg">{sampleCalculation.gpa}</span></div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
