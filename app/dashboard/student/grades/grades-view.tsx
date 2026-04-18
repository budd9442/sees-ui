'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Download,
    TrendingUp,
    AlertTriangle,
    Search,
    Award,
    CheckCircle,
    BookOpen,
    FileText,
    Sparkles,
    Plus,
    Trash2,
    X,
    Target,
    RotateCcw,
    ChevronUp,
    ChevronDown,
    ArrowRight,
} from 'lucide-react';
import { calculateGPA } from '@/lib/gpa-utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { exportTabularData } from '@/lib/export';
import { toast } from 'sonner';
import { StatCard } from '@/components/common/stat-card';
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ────────────────────────────────────────────────────────────────────────────

interface Grade {
    id: string;
    moduleCode: string;
    moduleName: string;
    credits: number;
    grade: number | string;
    gradePoint: number;
    countsTowardGpa?: boolean;
    semester: string;
    level: string;
    isReleased: boolean;
}

interface GradesViewProps {
    initialGrades: Grade[];
    initialOverallGpa?: number;
}

interface PlannedModule {
    id: string;
    moduleCode: string;
    moduleName: string;
    credits: number;
    gradePoint: number;
}

const GRADE_OPTIONS = [
    { label: 'A+', val: 4.0 },
    { label: 'A-', val: 3.7 },
    { label: 'B+', val: 3.3 },
    { label: 'B', val: 3.0 },
    { label: 'B-', val: 2.7 },
    { label: 'C+', val: 2.3 },
    { label: 'C', val: 2.0 },
    { label: 'C-', val: 1.7 },
    { label: 'D+', val: 1.3 },
    { label: 'D', val: 1.0 },
    { label: 'F', val: 0.0 },
];

const gpToLabel = (gp: number) => GRADE_OPTIONS.find(o => o.val === gp)?.label || gp.toFixed(1);

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────

export function GradesView({ initialGrades, initialOverallGpa }: GradesViewProps) {
    const [isPlanningMode, setIsPlanningMode] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // Planning State
    const [overriddenGrades, setOverriddenGrades] = useState<Record<string, number>>({});
    const [plannedModules, setPlannedModules] = useState<PlannedModule[]>([]);
    const [targetGPA, setTargetGPA] = useState(3.5);

    // Group by semester for the filter
    const semesters = useMemo(() => {
        const set = new Set(initialGrades.map(g => `${g.level} - ${g.semester}`));
        return Array.from(set).sort();
    }, [initialGrades]);

    // Data Processing for GPA
    const processedData = useMemo(() => {
        // 1. Identify best released grades per module (standard GPA logic)
        const bestByModule = new Map<string, Grade>();
        for (const g of initialGrades) {
            if (!g.isReleased) continue;
            const prev = bestByModule.get(g.moduleCode);
            if (!prev || g.gradePoint > prev.gradePoint) bestByModule.set(g.moduleCode, g);
        }

        const baselineGrades = [...bestByModule.values()].map(g => ({
            ...g,
            points: g.gradePoint
        }));

        // 2. Projected calculations (applying overrides)
        const projectedGrades = baselineGrades.map(g => ({
            ...g,
            points: overriddenGrades[g.id] ?? g.gradePoint
        }));

        // 3. Planned additions
        const plannedForCalc = plannedModules.map(m => ({
            id: m.id,
            credits: m.credits,
            points: m.gradePoint
        }));

        const currentGPA = initialOverallGpa ?? calculateGPA(baselineGrades as any);
        const projectedGPA = calculateGPA([...projectedGrades, ...plannedForCalc] as any);

        const totalCredits = initialGrades.reduce((s, g) => s + g.credits, 0);
        const projectedTotalCredits = totalCredits + plannedModules.reduce((s, m) => s + m.credits, 0);

        return {
            currentGPA,
            projectedGPA,
            totalCredits,
            projectedTotalCredits,
            baselineGrades
        };
    }, [initialGrades, initialOverallGpa, overriddenGrades, plannedModules]);

    const { currentGPA, projectedGPA, totalCredits, projectedTotalCredits } = processedData;

    // Table Filtering
    const filteredGrades = useMemo(() => {
        let list = initialGrades;
        if (selectedSemester !== 'all') {
            list = list.filter(g => `${g.level} - ${g.semester}` === selectedSemester);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(g =>
                g.moduleCode.toLowerCase().includes(q) ||
                g.moduleName.toLowerCase().includes(q)
            );
        }
        return list;
    }, [initialGrades, selectedSemester, searchQuery]);

    // Actions
    const handleAddPlanned = () => {
        const id = `planned-${Date.now()}`;
        setPlannedModules(prev => [...prev, {
            id,
            moduleCode: 'NEW-MOD',
            moduleName: 'Planned Module',
            credits: 3,
            gradePoint: 4.0
        }]);
    };

    const updatePlanned = (id: string, patch: Partial<PlannedModule>) => {
        setPlannedModules(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
    };

    const removePlanned = (id: string) => {
        setPlannedModules(prev => prev.filter(m => m.id !== id));
    };

    const resetPlanning = () => {
        setOverriddenGrades({});
        setPlannedModules([]);
        toast.info('Planning session reset');
    };

    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const rows = filteredGrades.map(g => ({
                module_code: g.moduleCode,
                module_name: g.moduleName,
                credits: g.credits,
                grade: g.grade,
                grade_point: g.gradePoint,
            }));
            await exportTabularData(rows as any, 'csv', { filename: 'grades' });
            toast.success('Grades exported');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Grades"
                description="View and simulate your academic performance"
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant={isPlanningMode ? 'default' : 'outline'}
                        onClick={() => setIsPlanningMode(!isPlanningMode)}
                        className="gap-2"
                    >
                        <Sparkles className={cn("h-4 w-4", isPlanningMode && "fill-current animate-pulse")} />
                        {isPlanningMode ? 'Planning Active' : 'GPA Planner'}
                    </Button>
                    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </PageHeader>

            {/* Metrics */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                    title="Overall GPA"
                    value={isPlanningMode ? projectedGPA.toFixed(2) : currentGPA.toFixed(2)}
                    icon={Award}
                />
                <StatCard
                    title="Total Credits"
                    value={isPlanningMode ? projectedTotalCredits : totalCredits}
                    icon={BookOpen}
                />
                <StatCard
                    title="Target GPA"
                    value={targetGPA.toFixed(2)}
                    icon={Target}
                />
            </div>

            {/* Simulation Controls - Sticky Bar */}
            {isPlanningMode && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Live Simulation</span>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-muted-foreground leading-none">Actual</span>
                                    <span className="text-sm font-semibold">{currentGPA.toFixed(2)}</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-muted-foreground leading-none">Projected</span>
                                    <span className={cn("text-lg font-black", projectedGPA >= targetGPA ? "text-green-600" : "text-primary")}>
                                        {projectedGPA.toFixed(2)}
                                    </span>
                                </div>
                                <Badge variant={projectedGPA >= targetGPA ? 'default' : 'secondary'} className="ml-2 font-bold px-3">
                                    {projectedGPA >= targetGPA ? (
                                        'Target Met!'
                                    ) : (
                                        `Gap: ${(targetGPA - projectedGPA).toFixed(2)}`
                                    )}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-background rounded-lg border p-1 pr-3 gap-3">
                            <span className="text-xs font-bold pl-2 text-muted-foreground uppercase">Target</span>
                            <button onClick={() => setTargetGPA(t => Math.max(0, t - 0.1))} className="p-1 hover:bg-muted rounded"><ChevronDown className="h-4 w-4" /></button>
                            <span className="text-sm font-black w-8 text-center">{targetGPA.toFixed(1)}</span>
                            <button onClick={() => setTargetGPA(t => Math.min(4, t + 0.1))} className="p-1 hover:bg-muted rounded"><ChevronUp className="h-4 w-4" /></button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetPlanning} className="text-muted-foreground">
                            <RotateCcw className="h-3 w-3 mr-1" /> Reset
                        </Button>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative w-full md:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search module code or name..."
                        className="pl-10 h-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            {semesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grades Table */}
            <Card className="overflow-hidden border-none shadow-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[40%]">Module</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Academic Term</TableHead>
                                <TableHead className="text-right pr-8">Grade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Add Planned Module Row */}
                            {isPlanningMode && (
                                <TableRow
                                    className="cursor-pointer bg-primary/5 hover:bg-primary/10 border-b-2 border-primary/20 transition-colors"
                                    onClick={handleAddPlanned}
                                >
                                    <TableCell colSpan={4} className="py-4 text-center text-primary text-sm font-bold">
                                        <div className="flex items-center justify-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add a simulated module
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Planned Modules */}
                            {isPlanningMode && plannedModules.map(m => (
                                <TableRow key={m.id} className="bg-green-50/30 dark:bg-green-950/10 border-l-4 border-l-green-500 animate-in fade-in slide-in-from-left-2 transition-all">
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button onClick={() => removePlanned(m.id)} className="text-destructive p-1 hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
                                            <Input
                                                value={m.moduleName}
                                                onChange={e => updatePlanned(m.id, { moduleName: e.target.value })}
                                                className="h-8 text-sm font-medium bg-transparent border-none focus-visible:ring-0 p-0"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={m.credits.toString()}
                                            onValueChange={v => updatePlanned(m.id, { credits: parseInt(v) })}
                                        >
                                            <SelectTrigger className="h-8 w-20 bg-background font-mono text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6].map(c => <SelectItem key={c} value={c.toString()}>{c} Credits</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="opacity-70">Simulation</Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <Select
                                            value={m.gradePoint.toString()}
                                            onValueChange={v => updatePlanned(m.id, { gradePoint: parseFloat(v) })}
                                        >
                                            <SelectTrigger className="h-8 w-24 bg-background font-bold ml-auto border-green-500/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GRADE_OPTIONS.map(o => (
                                                    <SelectItem key={o.val} value={o.val.toString()}>{o.label} ({o.val})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Existing Grades */}
                            {filteredGrades.map(grade => {
                                const isOverridden = overriddenGrades[grade.id] !== undefined;
                                const currentGP = overriddenGrades[grade.id] ?? grade.gradePoint;

                                return (
                                    <TableRow key={grade.id} className={cn("transition-colors", isOverridden && "bg-primary/5 hover:bg-primary/10")}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary">{grade.moduleCode}</span>
                                                <span className="text-sm text-muted-foreground line-clamp-1">{grade.moduleName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">{grade.credits} Credits</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">{grade.level} • {grade.semester}</span>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            {isPlanningMode ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    {isOverridden && (
                                                        <button
                                                            onClick={() => {
                                                                const next = { ...overriddenGrades };
                                                                delete next[grade.id];
                                                                setOverriddenGrades(next);
                                                            }}
                                                            className="text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                    <Select
                                                        value={currentGP.toString()}
                                                        onValueChange={(val) => setOverriddenGrades(p => ({ ...p, [grade.id]: parseFloat(val) }))}
                                                    >
                                                        <SelectTrigger className="h-8 w-24 bg-background font-bold">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {GRADE_OPTIONS.map(o => (
                                                                <SelectItem key={o.val} value={o.val.toString()}>{o.label} ({o.val})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ) : (
                                                <Badge variant={grade.gradePoint >= 2.0 ? 'default' : 'destructive'} className="font-bold px-3 py-1">
                                                    {grade.grade} ({grade.gradePoint.toFixed(1)})
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {filteredGrades.length === 0 && !isPlanningMode && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                                        No grades found for this selection.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {isPlanningMode && (
                <p className="text-[10px] text-muted-foreground text-center">
                    Planning mode is temporary. No changes will be saved to your official record.
                </p>
            )}
        </div>
    );
}
