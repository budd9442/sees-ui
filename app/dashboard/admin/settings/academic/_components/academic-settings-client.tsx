'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Save, 
    RefreshCcw, 
    GraduationCap, 
    Award, 
    BarChart, 
    ShieldCheck, 
    AlertCircle,
    Plus,
    Trash2
} from 'lucide-react';
import { updateAcademicThresholds, updateGradingScheme } from '@/lib/actions/grading-actions';
import { toast } from 'sonner';

interface Band {
    letter: string;
    points: number;
    minMarks: number;
    maxMarks: number;
}

export default function AcademicSettingsClient({ initialSettings, initialScheme }: { initialSettings: any, initialScheme: any }) {
    const [thresholds, setThresholds] = useState({
        threshold_first_class: initialSettings.find((s: any) => s.key === 'threshold_first_class')?.value || '3.7',
        threshold_second_upper: initialSettings.find((s: any) => s.key === 'threshold_second_upper')?.value || '3.3',
        threshold_second_lower: initialSettings.find((s: any) => s.key === 'threshold_second_lower')?.value || '3.0',
        threshold_pass_class: initialSettings.find((s: any) => s.key === 'threshold_pass_class')?.value || '2.5'
    });

    const [bands, setBands] = useState<Band[]>(initialScheme?.bands.map((b: any) => ({
        letter: b.letter_grade,
        points: b.grade_point,
        minMarks: b.min_marks,
        maxMarks: b.max_marks
    })) || []);

    const [saving, setSaving] = useState(false);

    const handleSaveThresholds = async () => {
        setSaving(true);
        try {
            await updateAcademicThresholds(thresholds);
            toast.success("Academic thresholds updated successfully.");
        } catch (err) {
            toast.error("Failed to update thresholds.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBands = async () => {
        setSaving(true);
        try {
            await updateGradingScheme(initialScheme.scheme_id, bands);
            toast.success("Grading scheme updated successfully.");
        } catch (err) {
            toast.error("Failed to update bands.");
        } finally {
            setSaving(false);
        }
    };

    const addBand = () => {
        setBands([...bands, { letter: '', points: 0, minMarks: 0, maxMarks: 0 }]);
    };

    const removeBand = (index: number) => {
        setBands(bands.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Academic Intelligence Settings</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Define how the system calculates GPA and assigns honors.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* GPA Thresholds */}
                <Card className="border-blue-100 shadow-sm">
                    <CardHeader className="bg-blue-50/30">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Award className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Academic Class Thresholds</CardTitle>
                                <CardDescription>Set the minimum GPA required for each honor category.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label>First Class (Minimum GPA)</Label>
                            <Input 
                                type="number" 
                                step="0.1" 
                                value={thresholds.threshold_first_class}
                                onChange={(e) => setThresholds({...thresholds, threshold_first_class: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Second Upper</Label>
                                <Input 
                                    type="number" 
                                    step="0.1" 
                                    value={thresholds.threshold_second_upper}
                                    onChange={(e) => setThresholds({...thresholds, threshold_second_upper: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Second Lower</Label>
                                <Input 
                                    type="number" 
                                    step="0.1" 
                                    value={thresholds.threshold_second_lower}
                                    onChange={(e) => setThresholds({...thresholds, threshold_second_lower: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Pass Class (Minimum GPA)</Label>
                            <Input 
                                type="number" 
                                step="0.1" 
                                value={thresholds.threshold_pass_class}
                                onChange={(e) => setThresholds({...thresholds, threshold_pass_class: e.target.value})}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                        <Button className="w-full" onClick={handleSaveThresholds} disabled={saving}>
                            {saving ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Apply Threshold Changes
                        </Button>
                    </CardFooter>
                </Card>

                {/* Info Card */}
                <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-blue-400" />
                            Governance Logic
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-300">
                                <BarChart className="h-4 w-4" />
                                Real-time Propagation
                            </h4>
                            <p className="text-sm text-slate-300">
                                Adjusting these values will immediately update 'Academic Class' for all students on their next dashboard load. 
                            </p>
                        </div>
                        <div className="p-4 bg-amber-900/20 rounded-xl border border-amber-900/50">
                            <h4 className="font-bold flex items-center gap-2 mb-2 text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Critical Note
                            </h4>
                            <p className="text-sm text-amber-200/70">
                                Changing thresholds during a semester is discouraged as it affects student awards and pathway eligibility logic.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grading Bands */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <CardTitle>Grading Scheme Definition</CardTitle>
                                <CardDescription>Map percentage marks to letter grades and GPA points.</CardDescription>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={addBand}>
                            <Plus className="h-4 w-4 mr-2" /> Add Band
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-5 gap-4 font-bold text-xs uppercase text-muted-foreground px-2">
                            <div className="col-span-1">Letter Grade</div>
                            <div className="col-span-1">Grade Points</div>
                            <div className="col-span-1">Min Marks (%)</div>
                            <div className="col-span-1">Max Marks (%)</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>
                        <div className="space-y-2">
                            {bands.sort((a,b) => b.minMarks - a.minMarks).map((band, i) => (
                                <div key={i} className="grid grid-cols-5 gap-4 items-center p-3 bg-slate-50 border rounded-xl hover:border-slate-300 transition-colors">
                                    <Input 
                                        value={band.letter} 
                                        onChange={(e) => {
                                            const newBands = [...bands];
                                            newBands[i].letter = e.target.value;
                                            setBands(newBands);
                                        }}
                                        placeholder="A+"
                                    />
                                    <Input 
                                        type="number" 
                                        step="0.1"
                                        value={band.points} 
                                        onChange={(e) => {
                                            const newBands = [...bands];
                                            newBands[i].points = parseFloat(e.target.value);
                                            setBands(newBands);
                                        }}
                                    />
                                    <Input 
                                        type="number" 
                                        value={band.minMarks} 
                                        onChange={(e) => {
                                            const newBands = [...bands];
                                            newBands[i].minMarks = parseInt(e.target.value);
                                            setBands(newBands);
                                        }}
                                    />
                                    <Input 
                                        type="number" 
                                        value={band.maxMarks} 
                                        onChange={(e) => {
                                            const newBands = [...bands];
                                            newBands[i].maxMarks = parseInt(e.target.value);
                                            setBands(newBands);
                                        }}
                                    />
                                    <div className="flex justify-end">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeBand(i)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                    <Button onClick={handleSaveBands} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" /> Save Grading Scheme
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
