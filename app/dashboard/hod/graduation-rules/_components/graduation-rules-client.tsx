'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Sparkles, Search, CheckCircle2, XCircle, GraduationCap, Plus, Trash2 } from 'lucide-react';
import type { DivisionId, GraduationCondition, GraduationRulesDocument } from '@/lib/graduation/rule-schema';
import { getPresetRules, gpaOnlyPresetRules, type PresetId } from '@/lib/graduation/rule-presets';
import { describeCondition } from '@/lib/graduation/evaluate-eligibility';
import {
    upsertGraduationEligibilityProfile,
    applyGraduationPreset,
    previewGraduationEligibility,
    searchStudentsForGraduationPreview,
} from '@/lib/actions/graduation-eligibility-actions';

type ProgramRow = {
    program_id: string;
    code: string;
    name: string;
    hasProfile: boolean;
    rules: unknown;
    profileVersion: number | null;
    updated_at: string | null;
};

const PRESETS: { id: PresetId; label: string; description: string }[] = [
    { id: 'gpa_only', label: 'GPA thresholds only', description: 'First / 2:1 / 2:2 / Third by minimum GPA only.' },
    { id: 'honours_4yr_guide', label: 'Honours 4-year (guide)', description: 'Adds credit floors, GPA-module rules, and max years (4).' },
    { id: 'exit_bsc_3yr_guide', label: 'Exit BSc 3-year (guide)', description: 'Three-year exit pattern with stricter credit totals.' },
];

const CONDITION_TYPES: { value: GraduationCondition['type']; label: string }[] = [
    { value: 'min_gpa', label: 'Minimum cumulative GPA' },
    { value: 'min_credits_at_min_grade_point', label: 'Credits at a minimum grade' },
    { value: 'min_fraction_credits_at_min_grade_point', label: 'Share of credits at a minimum grade' },
    { value: 'all_gpa_modules_min_grade_point', label: 'Floor on every GPA module' },
    { value: 'max_program_years', label: 'Maximum years in programme' },
    { value: 'min_total_credits_attempted', label: 'Total credits attempted' },
    { value: 'compulsory_weak_grade_credit_cap', label: 'Weak compulsory grade cap' },
];

const SCOPES = ['GPA_MODULES', 'CORE_ONLY', 'ALL_STRUCTURED'] as const;

const SCOPE_LABELS: Record<(typeof SCOPES)[number], string> = {
    GPA_MODULES: 'GPA-counting modules',
    CORE_ONLY: 'Core (compulsory) only',
    ALL_STRUCTURED: 'All programme-structure modules',
};

const SCOPE_HINTS: Record<(typeof SCOPES)[number], string> = {
    GPA_MODULES: 'Modules whose grades count toward cumulative GPA.',
    CORE_ONLY: 'Programme modules marked core/compulsory for this pathway.',
    ALL_STRUCTURED: 'Modules on the programme structure that have a released grade.',
};

const inputSm = 'h-8 text-sm';
const selectSm = 'h-8 text-sm';

function conditionTypeTitle(type: GraduationCondition['type']): string {
    return CONDITION_TYPES.find((t) => t.value === type)?.label ?? type;
}

function FieldGroup({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <Label htmlFor={htmlFor} className="text-xs font-normal leading-none text-muted-foreground">
                {label}
            </Label>
            {children}
        </div>
    );
}

function cloneRules(r: GraduationRulesDocument): GraduationRulesDocument {
    return JSON.parse(JSON.stringify(r)) as GraduationRulesDocument;
}

function rulesFromProgramRow(p: ProgramRow | undefined): GraduationRulesDocument {
    if (!p) return gpaOnlyPresetRules();
    if (p.rules && typeof p.rules === 'object' && 'evaluationOrder' in (p.rules as object)) {
        return cloneRules(p.rules as GraduationRulesDocument);
    }
    return gpaOnlyPresetRules();
}

export default function GraduationRulesClient({ initialPrograms }: { initialPrograms: ProgramRow[] }) {
    const router = useRouter();
    const [programId, setProgramId] = useState(initialPrograms[0]?.program_id ?? '');
    const [rules, setRules] = useState<GraduationRulesDocument>(() =>
        rulesFromProgramRow(initialPrograms[0])
    );
    const [activeDivision, setActiveDivision] = useState<DivisionId>('FIRST_CLASS');
    const [saving, setSaving] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [newType, setNewType] = useState<GraduationCondition['type']>('min_gpa');
    const [previewQuery, setPreviewQuery] = useState('');
    const [previewHits, setPreviewHits] = useState<{ student_id: string; label: string }[]>([]);
    const [, setPreviewId] = useState<string | null>(null);
    const [previewResult, setPreviewResult] = useState<Awaited<ReturnType<typeof previewGraduationEligibility>> | null>(null);

    useEffect(() => {
        const p = initialPrograms.find((x) => x.program_id === programId);
        setRules(rulesFromProgramRow(p));
    }, [initialPrograms, programId]);

    const onProgramChange = (id: string) => {
        setProgramId(id);
        setPreviewId(null);
        setPreviewResult(null);
    };

    const updateDivisionConditions = (divisionId: DivisionId, conditions: GraduationCondition[]) => {
        setRules((prev) => ({
            ...prev,
            divisions: {
                ...prev.divisions,
                [divisionId]: {
                    ...prev.divisions[divisionId],
                    conditions,
                },
            },
        }));
    };

    const removeCondition = (divisionId: DivisionId, index: number) => {
        const list = [...(rules.divisions[divisionId]?.conditions ?? [])];
        list.splice(index, 1);
        updateDivisionConditions(divisionId, list);
    };

    const addCondition = () => {
        const div = activeDivision;
        const base = rules.divisions[div];
        if (!base) return;
        let c: GraduationCondition;
        switch (newType) {
            case 'min_gpa':
                c = { type: 'min_gpa', minGpa: 3.0 };
                break;
            case 'min_credits_at_min_grade_point':
                c = { type: 'min_credits_at_min_grade_point', minCredits: 30, minGradePoint: 2.0, scope: 'GPA_MODULES' };
                break;
            case 'min_fraction_credits_at_min_grade_point':
                c = { type: 'min_fraction_credits_at_min_grade_point', fraction: 0.5, minGradePoint: 3.0, scope: 'GPA_MODULES' };
                break;
            case 'all_gpa_modules_min_grade_point':
                c = { type: 'all_gpa_modules_min_grade_point', minGradePoint: 2.0 };
                break;
            case 'max_program_years':
                c = { type: 'max_program_years', maxYears: 4 };
                break;
            case 'min_total_credits_attempted':
                c = { type: 'min_total_credits_attempted', minCredits: 120, minGradePoint: 1.0, scope: 'GPA_MODULES' };
                break;
            case 'compulsory_weak_grade_credit_cap':
                c = { type: 'compulsory_weak_grade_credit_cap', maxCredits: 4, maxGradePoint: 2.0 };
                break;
            default:
                c = { type: 'min_gpa', minGpa: 3.0 };
        }
        updateDivisionConditions(div, [...base.conditions, c]);
        setAddOpen(false);
        toast.success('Condition added');
    };

    const handleSave = async () => {
        if (!programId) return;
        setSaving(true);
        try {
            await upsertGraduationEligibilityProfile(programId, rules);
            toast.success('Graduation rules saved');
            router.refresh();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handlePreset = async (preset: PresetId) => {
        if (!programId) return;
        setSaving(true);
        try {
            const r = await applyGraduationPreset(programId, preset);
            const doc = getPresetRules(preset);
            setRules({ ...doc, version: r.version });
            toast.success('Preset applied and saved');
            router.refresh();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Preset failed');
        } finally {
            setSaving(false);
        }
    };

    const runSearch = useCallback(async () => {
        if (previewQuery.trim().length < 2) {
            setPreviewHits([]);
            return;
        }
        try {
            const hits = await searchStudentsForGraduationPreview(previewQuery);
            setPreviewHits(hits);
        } catch {
            setPreviewHits([]);
        }
    }, [previewQuery]);

    useEffect(() => {
        const t = setTimeout(runSearch, 300);
        return () => clearTimeout(t);
    }, [previewQuery, runSearch]);

    const runPreview = async (studentId: string) => {
        setPreviewId(studentId);
        try {
            const res = await previewGraduationEligibility(studentId);
            setPreviewResult(res);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Preview failed');
            setPreviewResult(null);
        }
    };

    const renderConditionEditor = (divisionId: DivisionId, c: GraduationCondition, index: number) => {
        const patch = (next: GraduationCondition) => {
            const list = [...(rules.divisions[divisionId]?.conditions ?? [])];
            list[index] = next;
            updateDivisionConditions(divisionId, list);
        };

        const id = (field: string) => `${divisionId}-${index}-${field}`;

        const scopeSelect = (value: (typeof SCOPES)[number], onChange: (v: (typeof SCOPES)[number]) => void) => (
            <FieldGroup label="Applies to" htmlFor={id('scope')}>
                <Select value={value} onValueChange={(v) => onChange(v as (typeof SCOPES)[number])}>
                    <SelectTrigger id={id('scope')} className={`${selectSm} w-full min-w-[12rem] max-w-[22rem]`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SCOPES.map((s) => (
                            <SelectItem key={s} value={s} className="text-sm" title={SCOPE_HINTS[s]}>
                                {SCOPE_LABELS[s]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FieldGroup>
        );

        return (
            <div
                key={index}
                className="rounded-lg border border-border/80 bg-card px-3 py-2 shadow-sm"
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-sm font-medium leading-snug">{conditionTypeTitle(c.type)}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{describeCondition(c)}</p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeCondition(divisionId, index)}
                        aria-label="Remove condition"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2 border-t border-border/60 pt-2">
                    {c.type === 'min_gpa' && (
                        <FieldGroup label="Required GPA" htmlFor={id('gpa')}>
                            <Input
                                id={id('gpa')}
                                type="number"
                                step="0.01"
                                className={`${inputSm} w-[5.5rem]`}
                                value={c.minGpa}
                                onChange={(e) => patch({ ...c, minGpa: parseFloat(e.target.value) || 0 })}
                            />
                        </FieldGroup>
                    )}
                    {c.type === 'min_credits_at_min_grade_point' && (
                        <>
                            <FieldGroup label="Minimum credits" htmlFor={id('mc')}>
                                <Input
                                    id={id('mc')}
                                    type="number"
                                    className={`${inputSm} w-[5.5rem]`}
                                    value={c.minCredits}
                                    onChange={(e) => patch({ ...c, minCredits: parseInt(e.target.value, 10) || 0 })}
                                />
                            </FieldGroup>
                            <FieldGroup label="Minimum grade points (per module)" htmlFor={id('mgp')}>
                                <Input
                                    id={id('mgp')}
                                    type="number"
                                    step="0.1"
                                    className={`${inputSm} w-[5.5rem]`}
                                    value={c.minGradePoint}
                                    onChange={(e) => patch({ ...c, minGradePoint: parseFloat(e.target.value) || 0 })}
                                />
                            </FieldGroup>
                            {scopeSelect(c.scope, (v) => patch({ ...c, scope: v }))}
                        </>
                    )}
                    {c.type === 'min_fraction_credits_at_min_grade_point' && (
                        <>
                            <FieldGroup label="Minimum share of credits (0 to 1)" htmlFor={id('fr')}>
                                <Input
                                    id={id('fr')}
                                    type="number"
                                    step="0.05"
                                    className={`${inputSm} w-[5.5rem]`}
                                    value={c.fraction}
                                    onChange={(e) => patch({ ...c, fraction: parseFloat(e.target.value) || 0 })}
                                />
                            </FieldGroup>
                            <FieldGroup label="Grade points floor" htmlFor={id('fgp')}>
                                <Input
                                    id={id('fgp')}
                                    type="number"
                                    step="0.1"
                                    className={`${inputSm} w-[5.5rem]`}
                                    value={c.minGradePoint}
                                    onChange={(e) => patch({ ...c, minGradePoint: parseFloat(e.target.value) || 0 })}
                                />
                            </FieldGroup>
                            {scopeSelect(c.scope, (v) => patch({ ...c, scope: v }))}
                        </>
                    )}
                    {c.type === 'all_gpa_modules_min_grade_point' && (
                        <FieldGroup label="Minimum grade points on every GPA module" htmlFor={id('allgp')}>
                            <Input
                                id={id('allgp')}
                                type="number"
                                step="0.1"
                                className={`${inputSm} w-[5.5rem]`}
                                value={c.minGradePoint}
                                onChange={(e) => patch({ ...c, minGradePoint: parseFloat(e.target.value) || 0 })}
                            />
                        </FieldGroup>
                    )}
                    {c.type === 'max_program_years' && (
                        <FieldGroup label="Maximum distinct academic years (from graded activity)" htmlFor={id('yrs')}>
                            <Input
                                id={id('yrs')}
                                type="number"
                                className={`${inputSm} w-[5.5rem]`}
                                value={c.maxYears}
                                onChange={(e) => patch({ ...c, maxYears: parseInt(e.target.value, 10) || 1 })}
                            />
                        </FieldGroup>
                    )}
                    {c.type === 'min_total_credits_attempted' && (
                        <>
                            <FieldGroup label="Minimum credits attempted" htmlFor={id('tc')}>
                                <Input
                                    id={id('tc')}
                                    type="number"
                                    className={`${inputSm} w-[5.5rem]`}
                                    value={c.minCredits}
                                    onChange={(e) => patch({ ...c, minCredits: parseInt(e.target.value, 10) || 0 })}
                                />
                            </FieldGroup>
                            <FieldGroup label="Minimum grade points" htmlFor={id('tgp')}>
                                <Input
                                    id={id('tgp')}
                                    type="number"
                                    step="0.1"
                                    className={`${inputSm} w-[5.5rem]`}
                                    value={c.minGradePoint}
                                    onChange={(e) => patch({ ...c, minGradePoint: parseFloat(e.target.value) || 0 })}
                                />
                            </FieldGroup>
                            {scopeSelect(c.scope, (v) => patch({ ...c, scope: v }))}
                        </>
                    )}
                    {c.type === 'compulsory_weak_grade_credit_cap' && (
                        <>
                            <FieldGroup label="Max compulsory credits counted as weak" htmlFor={id('wc')}>
                                <Input
                                    id={id('wc')}
                                    type="number"
                                    className={`${inputSm} w-[5.5rem]`}
                                    value={c.maxCredits}
                                    onChange={(e) => patch({ ...c, maxCredits: parseInt(e.target.value, 10) || 0 })}
                                />
                            </FieldGroup>
                            <FieldGroup label="Weak means grade points ≤" htmlFor={id('wgp')}>
                                <Input
                                    id={id('wgp')}
                                    type="number"
                                    step="0.1"
                                    className={`${inputSm} w-[5.5rem]`}
                                    value={c.maxGradePoint}
                                    onChange={(e) => patch({ ...c, maxGradePoint: parseFloat(e.target.value) || 0 })}
                                />
                            </FieldGroup>
                        </>
                    )}
                </div>
            </div>
        );
    };

    if (!initialPrograms.length) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">No active degree programmes found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <GraduationCap className="h-7 w-7" />
                        Graduation &amp; class rules
                    </h1>
                    <p className="text-muted-foreground mt-1 max-w-2xl">
                        Configure how divisions (First, Second Upper, etc.) are awarded per degree programme. Rules are evaluated in order;
                        the first division where every condition passes is assigned. Students without a programme profile fall back to system GPA
                        thresholds.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="shrink-0">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving…' : 'Save programme rules'}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Programme</CardTitle>
                    <CardDescription>Select the degree programme whose rules you are editing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-2">
                            <Label>Degree programme</Label>
                            <Select value={programId} onValueChange={onProgramChange}>
                                <SelectTrigger className="max-w-md">
                                    <SelectValue placeholder="Select programme" />
                                </SelectTrigger>
                                <SelectContent>
                                    {initialPrograms.map((p) => (
                                        <SelectItem key={p.program_id} value={p.program_id}>
                                            {p.code} — {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map((p) => (
                                <Button key={p.id} type="button" variant="outline" size="sm" disabled={saving} onClick={() => handlePreset(p.id)}>
                                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                                    {p.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Presets load guide-style patterns where applicable; adjust values before publishing. Version increments on each save.
                    </p>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Divisions &amp; conditions</CardTitle>
                        <CardDescription>Evaluation order: {rules.evaluationOrder.join(' → ')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeDivision} onValueChange={(v) => setActiveDivision(v as DivisionId)}>
                            <TabsList className="flex flex-wrap h-auto gap-1">
                                {rules.evaluationOrder.map((id) => (
                                    <TabsTrigger key={id} value={id} className="text-xs sm:text-sm">
                                        {rules.divisions[id]?.label ?? id}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {rules.evaluationOrder.map((id) => (
                                <TabsContent key={id} value={id} className="mt-3 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs text-muted-foreground max-w-xl">
                                            Every condition in this division must pass for a student to be assigned “{rules.divisions[id]?.label}”.
                                            Each rule shows a short title, a plain-language summary, then the values you can edit.
                                        </p>
                                        <Button type="button" size="sm" variant="secondary" className="h-8 shrink-0" onClick={() => setAddOpen(true)}>
                                            <Plus className="mr-1 h-3.5 w-3.5" />
                                            Add condition
                                        </Button>
                                    </div>
                                    <div className="space-y-1.5">
                                        {(rules.divisions[id]?.conditions ?? []).length === 0 ? (
                                            <p className="text-xs text-muted-foreground border rounded-md px-3 py-2">No conditions — division always passes.</p>
                                        ) : (
                                            (rules.divisions[id]?.conditions ?? []).map((c, i) => renderConditionEditor(id, c, i))
                                        )}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preview student</CardTitle>
                        <CardDescription>Search by name or email, then run against saved rules for their programme.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="Search…" value={previewQuery} onChange={(e) => setPreviewQuery(e.target.value)} />
                        </div>
                        <ScrollArea className="h-40 rounded-md border">
                            <div className="p-1 space-y-0.5">
                                {previewHits.map((h) => (
                                    <button
                                        key={h.student_id}
                                        type="button"
                                        className="w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
                                        onClick={() => runPreview(h.student_id)}
                                    >
                                        {h.label}
                                    </button>
                                ))}
                                {previewQuery.length >= 2 && previewHits.length === 0 && (
                                    <p className="p-2 text-xs text-muted-foreground">No matches</p>
                                )}
                            </div>
                        </ScrollArea>
                        {previewResult && (
                            <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Result</span>
                                    <Badge variant="secondary">{previewResult.academicClass}</Badge>
                                </div>
                                <p className="text-muted-foreground">GPA (GPA modules): {previewResult.gpa.toFixed(2)} · {previewResult.totalGpaCredits} credits</p>
                                <Separator />
                                <p className="text-xs font-medium text-muted-foreground">Divisions</p>
                                <ul className="space-y-1 text-xs">
                                    {previewResult.divisionEvaluations.map((d) => (
                                        <li key={d.divisionId} className="flex items-center gap-2">
                                            {d.passed ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                                            ) : (
                                                <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            )}
                                            <span>{d.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add condition</DialogTitle>
                        <DialogDescription>Adds to “{rules.divisions[activeDivision]?.label}”.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label>Type</Label>
                        <Select value={newType} onValueChange={(v) => setNewType(v as GraduationCondition['type'])}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CONDITION_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={addCondition}>Add</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
