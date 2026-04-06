'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Calculator,
    Save,
    RefreshCw,
    History,
    Target,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Download,
    Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateAdminGpaConfigData } from '@/lib/actions/admin-actions';

export default function GpaConfigClient({ initialData }: { initialData: any }) {
    const { user } = useAuthStore();
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);

    const [gpaConfig, setGpaConfig] = useState({
        calculationMethod: initialData.calculationMethod || 'weighted_average',
        gradePointScale: initialData.gradePointScale || [
            { id: '1', grade: 'A+', points: 4.0, minMarks: 85, maxMarks: 100 },
            { id: '2', grade: 'A', points: 4.0, minMarks: 75, maxMarks: 84 },
            { id: '3', grade: 'B+', points: 3.3, minMarks: 70, maxMarks: 74 },
            { id: '4', grade: 'B', points: 3.0, minMarks: 65, maxMarks: 69 },
            { id: '5', grade: 'C+', points: 2.3, minMarks: 60, maxMarks: 64 },
            { id: '6', grade: 'C', points: 2.0, minMarks: 55, maxMarks: 59 },
            { id: '7', grade: 'D', points: 1.0, minMarks: 45, maxMarks: 54 },
            { id: '8', grade: 'F', points: 0.0, minMarks: 0, maxMarks: 44 },
        ],
        academicClassThresholds: initialData.academicClassThresholds || { firstClass: 3.7, secondUpper: 3.0, secondLower: 2.5, thirdPass: 2.0 },
        tiebreakerFormula: initialData.tiebreakerFormula || { gpa: 0.6, credits: 0.2, attendance: 0.1, participation: 0.1 },
        customFormula: initialData.customFormula || '',
        roundingRules: initialData.roundingRules || { decimalPlaces: 2, roundingMethod: 'round' },
    });

    const [gradeScale, setGradeScale] = useState<any[]>(gpaConfig.gradePointScale);
    const [thresholds, setThresholds] = useState(gpaConfig.academicClassThresholds);
    const [tiebreaker, setTiebreaker] = useState(gpaConfig.tiebreakerFormula);

    const handleSaveConfiguration = async () => {
        const config = {
            ...gpaConfig,
            gradePointScale: gradeScale,
            academicClassThresholds: thresholds,
            tiebreakerFormula: tiebreaker,
        };

        try {
            await updateAdminGpaConfigData(config);
            setGpaConfig(config);
            toast.success('GPA configuration saved successfully!');
        } catch (e: any) {
            toast.error('Failed to save GPA configuration');
        }
    };

    const handleUpdateBand = (id: string, field: string, value: string | number) => {
        setGradeScale(prev => prev.map(band => 
            band.id === id ? { ...band, [field]: value } : band
        ));
    };

    const handleResetToDefault = () => {
        setGradeScale(gpaConfig.gradePointScale);
        setThresholds(gpaConfig.academicClassThresholds);
        setTiebreaker(gpaConfig.tiebreakerFormula);
        toast.success('Configuration reset to default values');
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
            academicClass: getAcademicClass(gpa),
            sampleGrades,
        };
    };

    const getAcademicClass = (gpa: number) => {
        if (gpa >= thresholds.firstClass) return 'First Class';
        if (gpa >= thresholds.secondUpper) return 'Second Upper';
        if (gpa >= thresholds.secondLower) return 'Second Lower';
        return 'Third/Pass';
    };

    const sampleCalculation = calculateSampleGPA();

    const configurationHistory = [
        { id: '1', version: 'v2.1', description: 'Updated grade point scale for A+ grade', changedBy: 'Admin User', changedAt: '2025-01-15 10:30:00', changes: ['Added A+ grade with 4.0 points', 'Updated thresholds'] },
        { id: '2', version: 'v2.0', description: 'Major GPA calculation overhaul', changedBy: 'System Admin', changedAt: '2025-01-01 09:00:00', changes: ['Changed to weighted average method', 'Updated tiebreaker formula'] },
        { id: '3', version: 'v1.5', description: 'Minor threshold adjustments', changedBy: 'Admin User', changedAt: '2023-12-15 14:20:00', changes: ['Adjusted Second Lower threshold to 2.5'] },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">GPA Formula & Thresholds Configuration</h1>
                    <p className="text-muted-foreground mt-1">Configure GPA calculation methods, grade scales, and academic class thresholds</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowHistoryDialog(true)}><History className="mr-2 h-4 w-4" />Version History</Button>
                    <Button variant="outline" onClick={() => setShowPreviewDialog(true)}><Target className="mr-2 h-4 w-4" />Preview Calculation</Button>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Config</Button>
                    <Button onClick={handleSaveConfiguration}><Save className="mr-2 h-4 w-4" />Save Configuration</Button>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" />Current Configuration Status</CardTitle><CardDescription>Active GPA calculation settings</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2"><Label className="text-sm font-medium">Calculation Method</Label><Badge variant="outline" className="capitalize">{gpaConfig.calculationMethod.replace('_', ' ')}</Badge></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Grade Scale</Label><Badge variant="outline">{gradeScale.length} grades</Badge></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Academic Classes</Label><Badge variant="outline">4 classes</Badge></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Last Updated</Label><Badge variant="outline">{new Date().toLocaleDateString()}</Badge></div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="calculation" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calculation">Calculation Method</TabsTrigger>
                    <TabsTrigger value="gradescale">Grade Scale</TabsTrigger>
                    <TabsTrigger value="thresholds">Academic Classes</TabsTrigger>
                    <TabsTrigger value="tiebreaker">Tiebreaker Formula</TabsTrigger>
                </TabsList>

                <TabsContent value="calculation" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>GPA Calculation Method</CardTitle><CardDescription>Configure how GPA is calculated for students</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="calculation-method">Calculation Method</Label>
                                    <Select value={gpaConfig.calculationMethod} onValueChange={(value) => setGpaConfig({ ...gpaConfig, calculationMethod: value as any })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="weighted_average">Weighted Average</SelectItem><SelectItem value="cumulative">Cumulative</SelectItem><SelectItem value="custom">Custom Formula</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                {gpaConfig.calculationMethod === 'weighted_average' && (<Alert><Calculator className="h-4 w-4" /><AlertTitle>Weighted Average Method</AlertTitle><AlertDescription>GPA = Σ(Grade Points × Credits) / Σ(Credits)<br />This method weights each grade by the number of credits for that module.</AlertDescription></Alert>)}
                                {gpaConfig.calculationMethod === 'cumulative' && (<Alert><TrendingUp className="h-4 w-4" /><AlertTitle>Cumulative Method</AlertTitle><AlertDescription>GPA = Σ(Grade Points) / Number of Modules<br />This method treats all modules equally regardless of credit value.</AlertDescription></Alert>)}
                                {gpaConfig.calculationMethod === 'custom' && (<div className="space-y-2"><Label htmlFor="custom-formula">Custom Formula</Label><Textarea id="custom-formula" value={gpaConfig.customFormula} onChange={(e) => setGpaConfig({ ...gpaConfig, customFormula: e.target.value })} placeholder="Enter custom GPA calculation formula..." rows={4} /><Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Custom Formula</AlertTitle><AlertDescription>Use variables like: totalPoints, totalCredits, moduleCount<br />Example: (totalPoints / totalCredits) * 0.9 + (moduleCount * 0.1)</AlertDescription></Alert></div>)}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2"><Label htmlFor="decimal-places">Decimal Places</Label><Input id="decimal-places" type="number" min="0" max="4" value={gpaConfig.roundingRules.decimalPlaces} onChange={(e) => setGpaConfig({ ...gpaConfig, roundingRules: { ...gpaConfig.roundingRules, decimalPlaces: parseInt(e.target.value) } })} /></div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rounding-method">Rounding Method</Label>
                                        <Select value={gpaConfig.roundingRules.roundingMethod} onValueChange={(value) => setGpaConfig({ ...gpaConfig, roundingRules: { ...gpaConfig.roundingRules, roundingMethod: value as any } })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="round">Round</SelectItem><SelectItem value="floor">Floor</SelectItem><SelectItem value="ceil">Ceiling</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gradescale" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Grade Point Scale & Mark Bands</CardTitle><CardDescription>Configure the mark ranges and point values for each letter grade</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Grade</TableHead>
                                            <TableHead>Min Marks</TableHead>
                                            <TableHead>Max Marks</TableHead>
                                            <TableHead>Points</TableHead>
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
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleResetToDefault}><RefreshCw className="mr-2 h-4 w-4" />Reset to Default</Button>
                                    <Button variant="outline" onClick={() => setGradeScale([...gradeScale, { id: Math.random().toString(), grade: 'New', points: 0.0, minMarks: 0, maxMarks: 0 }])}><Copy className="mr-2 h-4 w-4" />Add New Grade</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="thresholds" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Academic Class Thresholds</CardTitle><CardDescription>Set GPA thresholds for academic class classifications</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2"><Label>First Class</Label><div className="flex items-center gap-2"><Input type="number" step="0.1" min="0" max="4" value={thresholds.firstClass} onChange={(e) => setThresholds({ ...thresholds, firstClass: parseFloat(e.target.value) })} /><span className="text-sm text-muted-foreground">and above</span></div></div>
                                    <div className="space-y-2"><Label>Second Upper</Label><div className="flex items-center gap-2"><Input type="number" step="0.1" min="0" max="4" value={thresholds.secondUpper} onChange={(e) => setThresholds({ ...thresholds, secondUpper: parseFloat(e.target.value) })} /><span className="text-sm text-muted-foreground">to {thresholds.firstClass - 0.01}</span></div></div>
                                    <div className="space-y-2"><Label>Second Lower</Label><div className="flex items-center gap-2"><Input type="number" step="0.1" min="0" max="4" value={thresholds.secondLower} onChange={(e) => setThresholds({ ...thresholds, secondLower: parseFloat(e.target.value) })} /><span className="text-sm text-muted-foreground">to {thresholds.secondUpper - 0.01}</span></div></div>
                                    <div className="space-y-2"><Label>Third/Pass</Label><div className="flex items-center gap-2"><Input type="number" step="0.1" min="0" max="4" value={thresholds.thirdPass} onChange={(e) => setThresholds({ ...thresholds, thirdPass: parseFloat(e.target.value) })} /><span className="text-sm text-muted-foreground">to {thresholds.secondLower - 0.01}</span></div></div>
                                </div>
                                <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Threshold Validation</AlertTitle><AlertDescription>Ensure thresholds are in descending order: First Class ≥ Second Upper ≥ Second Lower ≥ Third/Pass</AlertDescription></Alert>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setThresholds(gpaConfig.academicClassThresholds)}><RefreshCw className="mr-2 h-4 w-4" />Reset to Default</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tiebreaker" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Tiebreaker Formula</CardTitle><CardDescription>Configure weights for tiebreaker factors when GPAs are tied</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Alert><Target className="h-4 w-4" /><AlertTitle>Tiebreaker Logic</AlertTitle><AlertDescription>When students have the same GPA, these factors are used to determine ranking order. Weights must sum to 1.0.</AlertDescription></Alert>
                                <div className="space-y-4">
                                    <div className="space-y-2"><Label>GPA Weight</Label><Input type="number" step="0.1" min="0" max="1" value={tiebreaker.gpa} onChange={(e) => setTiebreaker({ ...tiebreaker, gpa: parseFloat(e.target.value) })} /></div>
                                    <div className="space-y-2"><Label>Credits Weight</Label><Input type="number" step="0.1" min="0" max="1" value={tiebreaker.credits} onChange={(e) => setTiebreaker({ ...tiebreaker, credits: parseFloat(e.target.value) })} /></div>
                                    <div className="space-y-2"><Label>Attendance Weight</Label><Input type="number" step="0.1" min="0" max="1" value={tiebreaker.attendance} onChange={(e) => setTiebreaker({ ...tiebreaker, attendance: parseFloat(e.target.value) })} /></div>
                                    <div className="space-y-2"><Label>Participation Weight</Label><Input type="number" step="0.1" min="0" max="1" value={tiebreaker.participation} onChange={(e) => setTiebreaker({ ...tiebreaker, participation: parseFloat(e.target.value) })} /></div>
                                </div>
                                <div className="p-3 rounded-lg bg-muted">
                                    <div className="text-sm font-medium">Total Weight: {(tiebreaker.gpa + tiebreaker.credits + tiebreaker.attendance + tiebreaker.participation).toFixed(1)}</div>
                                    {(tiebreaker.gpa + tiebreaker.credits + tiebreaker.attendance + tiebreaker.participation) !== 1.0 && (<div className="text-sm text-red-600">Weights must sum to 1.0</div>)}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setTiebreaker(gpaConfig.tiebreakerFormula)}><RefreshCw className="mr-2 h-4 w-4" />Reset to Default</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Configuration History</DialogTitle><DialogDescription>Version history of GPA configuration changes</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        {configurationHistory.map((version) => (
                            <div key={version.id} className="p-4 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2"><Badge variant="outline">{version.version}</Badge><span className="font-medium">{version.description}</span></div><span className="text-sm text-muted-foreground">{version.changedAt}</span>
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">Changed by: {version.changedBy}</div>
                                <div className="space-y-1">{version.changes.map((change, index) => (<div key={index} className="text-sm">• {change}</div>))}</div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowHistoryDialog(false)}>Close</Button><Button variant="outline"><Download className="mr-2 h-4 w-4" />Export History</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>GPA Calculation Preview</DialogTitle><DialogDescription>Preview how GPA is calculated with current settings</DialogDescription></DialogHeader>
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
                                <div className="flex justify-between"><span className="font-medium">Academic Class:</span><Badge variant="outline">{sampleCalculation.academicClass}</Badge></div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
