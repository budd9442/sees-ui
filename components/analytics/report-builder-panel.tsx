'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportCanvas } from './report-canvas';
import { DatasetBrowserSidebar } from './dataset-browser-sidebar';
import { VisualEncodingInspector } from './visual-encoding-inspector';
import { AnalyticsAssistantPanel } from './assistant-panel';
import type { ReportDefinition, VisualSpec } from '@/lib/analytics/schema';
import type { AnalyticsQueryFilters } from '@/lib/analytics/schema';
import { reportDefinitionSchema, type ReportDefinitionPatch } from '@/lib/analytics/schema';
import { applyReportDefinitionPatch } from '@/lib/analytics/apply-report-patch';
import {
    analyticsDatasetsForRole,
    defaultEncodingsForShape,
    groupByOptionsForDataset,
    nextVisualLayoutY,
    type GroupByOption,
    DATASET_LABELS,
} from '@/lib/analytics/builder-metadata';
import type { AnalyticsDatasetId } from '@/lib/analytics/schema';
import {
    duplicateAnalyticsReport,
    listAnalyticsReports,
    saveAnalyticsReport,
    getAnalyticsReport,
    deleteAnalyticsReport,
} from '@/lib/actions/analytics-actions';
import { toast } from 'sonner';
import {
    Plus, Trash2, Copy, Save, RotateCcw, ChevronDown,
    LayoutTemplate, Layers, Database, Settings, FolderOpen,
    BarChart2, TrendingUp, Users, AlertTriangle, Target,
    PanelLeft, PanelRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    defaultDefinition: ReportDefinition;
    filterContext: AnalyticsQueryFilters;
    builderRole: string;
    aggregatesSummary?: string;
    variant?: 'embedded' | 'fullPage';
};

const VISUAL_TYPES: VisualSpec['type'][] = ['kpi', 'bar', 'line', 'area', 'pie', 'donut', 'table', 'scatter', 'gauge', 'matrix', 'radar'];

// ─── Report Templates ─────────────────────────────────────────────────────────
type Template = {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    roles: string[];
    definition: ReportDefinition;
};

const TEMPLATES: Template[] = [
    {
        id: 'tpl_at_risk',
        label: 'At-Risk Student Dashboard',
        description: 'Students below 2.0 GPA with table view + GPA distribution chart.',
        icon: AlertTriangle,
        roles: ['admin', 'hod'],
        definition: {
            version: 1,
            pages: [{
                id: 'main', title: 'At-Risk Students',
                visuals: [
                    { id: 'v1', type: 'kpi', title: 'At-Risk Count', datasetId: 'admin_at_risk_students', layout: { i: 'v1', x: 0, y: 0, w: 3, h: 4 }, groupBy: 'none', encodings: { metric: 'gpa', kpiAggregation: 'count' } },
                    { id: 'v2', type: 'kpi', title: 'Avg GPA (At-Risk)', datasetId: 'admin_at_risk_students', layout: { i: 'v2', x: 3, y: 0, w: 3, h: 4 }, groupBy: 'none', encodings: { metric: 'gpa', kpiAggregation: 'avg' } },
                    { id: 'v3', type: 'bar', title: 'GPA Distribution', datasetId: 'admin_gpa_distribution', layout: { i: 'v3', x: 6, y: 0, w: 6, h: 5 }, groupBy: 'none', encodings: { x: 'gpa_range', y: 'student_count', colorScheme: 'traffic_light' } },
                    { id: 'v4', type: 'table', title: 'At-Risk Students', datasetId: 'admin_at_risk_students', layout: { i: 'v4', x: 0, y: 5, w: 12, h: 7 }, groupBy: 'none', encodings: { sortOrder: 'asc' } },
                ],
            }],
        },
    },
    {
        id: 'tpl_module_perf',
        label: 'Module Performance Report',
        description: 'Pass rates, average grade points, and grade heatmap across all modules.',
        icon: BarChart2,
        roles: ['admin', 'hod', 'staff'],
        definition: {
            version: 1,
            pages: [{
                id: 'main', title: 'Module Performance',
                visuals: [
                    { id: 'v1', type: 'bar', title: 'Avg Grade Point by Module', datasetId: 'admin_module_performance', layout: { i: 'v1', x: 0, y: 0, w: 7, h: 6 }, groupBy: 'none', encodings: { x: 'module_code', y: 'avg_grade_point', colorScheme: 'blue', sortOrder: 'desc' } },
                    { id: 'v2', type: 'bar', title: 'Pass Rate by Module (%)', datasetId: 'admin_module_performance', layout: { i: 'v2', x: 7, y: 0, w: 5, h: 6 }, groupBy: 'none', encodings: { x: 'module_code', y: 'pass_rate', colorScheme: 'green' } },
                    { id: 'v3', type: 'table', title: 'Module Detail', datasetId: 'admin_module_performance', layout: { i: 'v3', x: 0, y: 6, w: 12, h: 6 }, groupBy: 'none', encodings: { sortOrder: 'desc' } },
                ],
            }],
        },
    },
    {
        id: 'tpl_cohort',
        label: 'Cohort GPA Analysis',
        description: 'GPA trends by admission year — see how each cohort is performing.',
        icon: TrendingUp,
        roles: ['admin', 'hod'],
        definition: {
            version: 1,
            pages: [{
                id: 'main', title: 'Cohort Analysis',
                visuals: [
                    { id: 'v1', type: 'line', title: 'Avg GPA by Admission Year', datasetId: 'admin_gpa_by_admission_year', layout: { i: 'v1', x: 0, y: 0, w: 8, h: 5 }, groupBy: 'none', encodings: { x: 'admission_year', y: 'avg_gpa', colorScheme: 'purple' } },
                    { id: 'v2', type: 'bar', title: 'Enrollment per Cohort', datasetId: 'admin_gpa_by_admission_year', layout: { i: 'v2', x: 8, y: 0, w: 4, h: 5 }, groupBy: 'none', encodings: { x: 'admission_year', y: 'student_count', colorScheme: 'cool' } },
                    { id: 'v3', type: 'bar', title: 'Pass/Fail by Program', datasetId: 'admin_pass_fail_by_program', layout: { i: 'v3', x: 0, y: 5, w: 12, h: 6 }, groupBy: 'none', encodings: { x: 'program_code', y: 'pass_rate', colorScheme: 'green', sortOrder: 'desc' } },
                ],
            }],
        },
    },
    {
        id: 'tpl_enrollment',
        label: 'Enrollment Overview',
        description: 'Student enrollment trends by year, level, and status.',
        icon: Users,
        roles: ['admin', 'hod'],
        definition: {
            version: 1,
            pages: [{
                id: 'main', title: 'Enrollment Overview',
                visuals: [
                    { id: 'v1', type: 'bar', title: 'Students by Admission Year', datasetId: 'admin_enrollment_trends', layout: { i: 'v1', x: 0, y: 0, w: 6, h: 5 }, groupBy: 'none', encodings: { x: 'admission_year', y: 'student_count', colorScheme: 'blue' } },
                    { id: 'v2', type: 'pie', title: 'Distribution by Level', datasetId: 'admin_enrollment_trends', layout: { i: 'v2', x: 6, y: 0, w: 3, h: 5 }, groupBy: 'level', encodings: { category: 'level', value: 'student_count' } },
                    { id: 'v3', type: 'donut', title: 'By Enrollment Status', datasetId: 'admin_enrollment_trends', layout: { i: 'v3', x: 9, y: 0, w: 3, h: 5 }, groupBy: 'enrollment_status', encodings: { category: 'enrollment_status', value: 'student_count' } },
                ],
            }],
        },
    },
    {
        id: 'tpl_metadata',
        label: 'Metadata Intelligence',
        description: 'Analyse student demographics from onboarding answers.',
        icon: Database,
        roles: ['admin', 'hod'],
        definition: {
            version: 1,
            pages: [{
                id: 'main', title: 'Metadata Analytics',
                visuals: [
                    { id: 'v1', type: 'bar', title: 'Avg GPA by Metadata Segment', datasetId: 'admin_student_metadata', layout: { i: 'v1', x: 0, y: 0, w: 6, h: 5 }, groupBy: 'metadata', filters: { metadataKey: '' }, encodings: { x: 'metadata_value', y: 'avg_gpa', colorScheme: 'cool', sortOrder: 'desc' } },
                    { id: 'v2', type: 'bar', title: 'Students by Metadata Segment', datasetId: 'admin_student_metadata', layout: { i: 'v2', x: 6, y: 0, w: 6, h: 5 }, groupBy: 'metadata', filters: { metadataKey: '' }, encodings: { x: 'metadata_value', y: 'student_count', colorScheme: 'purple' } },
                ],
            }],
        },
    },
    {
        id: 'tpl_goals',
        label: 'Goals & Internships',
        description: 'Academic goal achievement rates and internship partnership diversity.',
        icon: Target,
        roles: ['admin', 'hod'],
        definition: {
            version: 1,
            pages: [{
                id: 'main', title: 'Engagement Analytics',
                visuals: [
                    { id: 'v1', type: 'bar', title: 'Goal Achievement by Type', datasetId: 'admin_academic_goals', layout: { i: 'v1', x: 0, y: 0, w: 6, h: 5 }, groupBy: 'goal_type', encodings: { x: 'goal_type', y: 'achievement_rate', colorScheme: 'green' } },
                    { id: 'v2', type: 'donut', title: 'Goal Status', datasetId: 'admin_academic_goals', layout: { i: 'v2', x: 6, y: 0, w: 3, h: 5 }, groupBy: 'none', encodings: { category: 'status', value: 'count' } },
                    { id: 'v3', type: 'bar', title: 'Top Internship Companies', datasetId: 'admin_internship_stats', layout: { i: 'v3', x: 0, y: 5, w: 9, h: 5 }, groupBy: 'none', encodings: { x: 'company', y: 'student_count', colorScheme: 'blue' } },
                    { id: 'v4', type: 'donut', title: 'Internship Status', datasetId: 'admin_internship_stats', layout: { i: 'v4', x: 9, y: 5, w: 3, h: 5 }, groupBy: 'internship_status', encodings: { category: 'status', value: 'count' } },
                ],
            }],
        },
    },
];

// ─── Utility ──────────────────────────────────────────────────────────────────
function cloneDef(def: ReportDefinition): ReportDefinition {
    return reportDefinitionSchema.parse(JSON.parse(JSON.stringify(def)));
}

function updateVisualInDefinition(def: ReportDefinition, pageIndex: number, visualId: string, updater: (v: VisualSpec) => VisualSpec): ReportDefinition {
    const pages = def.pages.map((p, pi) =>
        pi !== pageIndex ? p : { ...p, visuals: p.visuals.map((v) => (v.id === visualId ? updater(v) : v)) }
    );
    return { ...def, pages };
}

function removeVisualFromDefinition(def: ReportDefinition, pageIndex: number, visualId: string): ReportDefinition {
    const pages = def.pages.map((p, pi) =>
        pi !== pageIndex ? p : { ...p, visuals: p.visuals.filter((v) => v.id !== visualId) }
    );
    return { ...def, pages };
}

function createVisual(args: { type: VisualSpec['type']; datasetId: AnalyticsDatasetId; y: number }): VisualSpec {
    const id = `v_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const groupOpts = groupByOptionsForDataset(args.datasetId);
    const groupBy = (groupOpts[0]?.value ?? 'none') as GroupByOption;
    const encodings = defaultEncodingsForShape(args.datasetId, groupBy, args.type);
    const h = args.type === 'kpi' || args.type === 'gauge' ? 4 : args.type === 'table' || args.type === 'matrix' ? 7 : 5;
    const w = args.type === 'table' || args.type === 'matrix' ? 12 : 6;
    return {
        id,
        type: args.type,
        title: `${DATASET_LABELS[args.datasetId] ?? args.datasetId}`,
        datasetId: args.datasetId,
        layout: { i: id, x: 0, y: args.y, w, h },
        groupBy,
        encodings: encodings ?? undefined,
    };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ReportBuilderPanel({ defaultDefinition, filterContext, builderRole, aggregatesSummary, variant = 'embedded' }: Props) {
    const [definition, setDefinition] = useState(() => cloneDef(defaultDefinition));
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reportTitle, setReportTitle] = useState('Untitled report');
    const [loadedReportId, setLoadedReportId] = useState<string | null>(null);
    const [savedList, setSavedList] = useState<{ report_id: string; title: string }[]>([]);
    const [pending, startTransition] = useTransition();
    const [showTemplates, setShowTemplates] = useState(false);
    const [leftPanel, setLeftPanel] = useState(true);
    const [rightPanel, setRightPanel] = useState(true);

    const pageIndex = 0;
    const page = definition.pages[pageIndex];
    const selected = page?.visuals.find((v) => v.id === selectedId) ?? null;
    const allowedDatasets = useMemo(() => analyticsDatasetsForRole(builderRole), [builderRole]);

    const refreshList = useCallback(() => {
        startTransition(async () => {
            try {
                const rows = await listAnalyticsReports();
                setSavedList(rows.map((r) => ({ report_id: r.report_id, title: r.title })));
            } catch { /* ignore */ }
        });
    }, []);

    useEffect(() => { refreshList(); }, [refreshList]);

    const applyFromAssistant = useCallback((patch: ReportDefinitionPatch) => {
        if (patch.updateTitle) setReportTitle(patch.updateTitle);
        setDefinition((d) => applyReportDefinitionPatch(d, patch));
        toast.success('Changes applied by Grok');
    }, []);

    const handleSave = () => {
        startTransition(async () => {
            try {
                const { reportId } = await saveAnalyticsReport({ reportId: loadedReportId ?? undefined, title: reportTitle, definition });
                setLoadedReportId(reportId);
                toast.success('Report saved');
                refreshList();
            } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : 'Save failed');
            }
        });
    };

    const handleLoad = (reportId: string) => {
        startTransition(async () => {
            try {
                const row = await getAnalyticsReport(reportId);
                setDefinition(cloneDef(row.definition));
                setReportTitle(row.title);
                setLoadedReportId(row.report_id);
                setSelectedId(null);
                toast.success('Report loaded');
            } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : 'Load failed');
            }
        });
    };

    const handleDelete = (reportId: string) => {
        startTransition(async () => {
            try {
                await deleteAnalyticsReport(reportId);
                if (loadedReportId === reportId) {
                    setLoadedReportId(null);
                    setDefinition(cloneDef(defaultDefinition));
                    setReportTitle('Untitled report');
                    setSelectedId(null);
                }
                toast.success('Report deleted');
                refreshList();
            } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : 'Delete failed');
            }
        });
    };

    const handleDuplicate = () => {
        if (!loadedReportId) { toast.message('Save first to duplicate.'); return; }
        startTransition(async () => {
            try {
                const { reportId } = await duplicateAnalyticsReport(loadedReportId);
                const row = await getAnalyticsReport(reportId);
                setDefinition(cloneDef(row.definition));
                setReportTitle(row.title);
                setLoadedReportId(reportId);
                toast.success('Duplicate created');
                refreshList();
            } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : 'Duplicate failed');
            }
        });
    };

    const resetToTemplate = () => {
        setDefinition(cloneDef(defaultDefinition));
        setLoadedReportId(null);
        setSelectedId(null);
        setReportTitle('Untitled report');
        toast.message('Reset to default template');
    };

    const applyTemplate = (tpl: Template) => {
        setDefinition(cloneDef(tpl.definition));
        setReportTitle(tpl.label);
        setLoadedReportId(null);
        setSelectedId(null);
        setShowTemplates(false);
        toast.success(`Template "${tpl.label}" applied`);
    };

    const addVisualFromDataset = (datasetId: AnalyticsDatasetId, type: VisualSpec['type'] = 'bar') => {
        const y = nextVisualLayoutY(page?.visuals ?? []);
        const v = createVisual({ type, datasetId, y });
        setDefinition((d) => {
            const pages = d.pages.map((p, pi) => pi === pageIndex ? { ...p, visuals: [...p.visuals, v] } : p);
            return { ...d, pages };
        });
        setSelectedId(v.id);
    };

    const addVisualByType = (type: VisualSpec['type']) => {
        const datasetId = allowedDatasets[0] ?? 'staff_module_grades';
        addVisualFromDataset(datasetId, type);
    };

    const duplicateVisual = () => {
        if (!selected) return;
        const y = nextVisualLayoutY(page?.visuals ?? []);
        const newId = `v_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
        const copy: VisualSpec = { ...selected, id: newId, layout: { i: newId, x: 0, y, w: selected.layout.w, h: selected.layout.h }, title: `${selected.title ?? selected.type} (copy)` };
        setDefinition((d) => {
            const pages = d.pages.map((p, pi) => pi === pageIndex ? { ...p, visuals: [...p.visuals, copy] } : p);
            return { ...d, pages };
        });
        setSelectedId(newId);
    };

    const removeVisual = () => {
        if (!selected) return;
        setDefinition((d) => removeVisualFromDefinition(d, pageIndex, selected.id));
        setSelectedId(null);
    };

    const updateSelected = (fn: (v: VisualSpec) => VisualSpec) => {
        if (!selected) return;
        setDefinition((d) => updateVisualInDefinition(d, pageIndex, selected.id, fn));
    };

    const visuals = page?.visuals ?? [];
    const exportQuery = useMemo(() => ({
        datasetId: selected?.datasetId ?? allowedDatasets[0] ?? 'staff_module_grades',
        filters: { ...filterContext, ...selected?.filters },
        groupBy: selected?.groupBy ?? 'none',
    }), [selected, filterContext, allowedDatasets]);

    const availableTemplates = TEMPLATES.filter((t) => t.roles.includes(builderRole));

    return (
        <div className="flex flex-col h-full flex-1 overflow-hidden">
            {/* ── Toolbar ───────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 pb-3 flex-wrap border-b mb-3">
                <div className="flex-1 min-w-0 max-w-xs">
                    <Input
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        placeholder="Report title..."
                        className="h-8 text-sm font-semibold"
                    />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Toggle panels */}
                    <Button type="button" size="icon" variant={leftPanel ? 'secondary' : 'ghost'} className="h-8 w-8" onClick={() => setLeftPanel((p) => !p)} title="Toggle dataset browser">
                        <PanelLeft className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="icon" variant={rightPanel ? 'secondary' : 'ghost'} className="h-8 w-8" onClick={() => setRightPanel((p) => !p)} title="Toggle inspector">
                        <PanelRight className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Add visual */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" size="sm" className="h-8 gap-1">
                                <Plus className="h-3.5 w-3.5" />
                                Add visual
                                <ChevronDown className="h-3 w-3 opacity-60" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                            {VISUAL_TYPES.map((t) => (
                                <DropdownMenuItem key={t} onClick={() => addVisualByType(t)} className="text-xs">
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Templates */}
                    {availableTemplates.length > 0 && (
                        <Button type="button" size="sm" variant="outline" className="h-8 gap-1" onClick={() => setShowTemplates(true)}>
                            <LayoutTemplate className="h-3.5 w-3.5" />
                            Templates
                        </Button>
                    )}

                    <Separator orientation="vertical" className="h-6" />

                    {/* Save */}
                    <Button type="button" size="sm" variant="outline" className="h-8 gap-1" onClick={handleSave} disabled={pending}>
                        <Save className="h-3.5 w-3.5" />
                        Save
                    </Button>

                    {/* Saved reports menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" size="sm" variant="outline" className="h-8 gap-1" disabled={pending}>
                                <FolderOpen className="h-3.5 w-3.5" />
                                Open
                                {savedList.length > 0 && (
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 ml-0.5">{savedList.length}</Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 max-h-72 overflow-y-auto">
                            {savedList.length === 0 ? (
                                <DropdownMenuItem disabled className="text-xs text-muted-foreground">No saved reports yet</DropdownMenuItem>
                            ) : (
                                savedList.map((r) => (
                                    <DropdownMenuItem
                                        key={r.report_id}
                                        className="text-xs flex items-center justify-between"
                                        onSelect={() => handleLoad(r.report_id)}
                                    >
                                        <span className="flex-1 truncate">{r.title}</span>
                                        <button
                                            type="button"
                                            className="ml-2 text-muted-foreground hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(r.report_id); }}
                                            title="Delete this report"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </DropdownMenuItem>
                                ))
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs" onClick={handleDuplicate} disabled={!loadedReportId || pending}>
                                <Copy className="h-3 w-3 mr-2" />
                                Duplicate current
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-muted-foreground" onClick={resetToTemplate} disabled={pending}>
                                <RotateCcw className="h-3 w-3 mr-2" />
                                Reset to default
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{visuals.length} visual{visuals.length !== 1 ? 's' : ''}</span>
                    {loadedReportId && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5">Saved</Badge>
                    )}
                </div>
            </div>

            {/* ── 3-Panel Layout ──────────────────────────────────────────── */}
            <div className="flex flex-1 gap-3 h-0 overflow-hidden">
                {/* Left: Dataset browser */}
                {leftPanel && (
                    <div className="w-64 shrink-0 flex flex-col rounded-xl border bg-card shadow-sm h-full min-h-0 overflow-hidden">
                        <DatasetBrowserSidebar
                            builderRole={builderRole}
                            onAddVisual={(dsId) => addVisualFromDataset(dsId)}
                        />
                    </div>
                )}

                {/* Centre: Canvas */}
                <div className="flex-1 min-w-0 flex flex-col gap-2 h-full">
                    <p className="text-[10px] text-muted-foreground px-1 shrink-0">
                        Drag tiles to rearrange · Resize from corners · Click a tile to edit
                    </p>
                    <div className="flex-1 overflow-y-auto pr-1">
                        <ReportCanvas
                            definition={definition}
                            pageIndex={pageIndex}
                            filterContext={filterContext}
                            selectedVisualId={selectedId}
                            onSelectVisual={setSelectedId}
                            onDefinitionChange={setDefinition}
                        />
                    </div>
                </div>

                {/* Right: Inspector */}
                {rightPanel && (
                    <div className="w-80 shrink-0 flex flex-col rounded-xl border bg-card shadow-sm h-full min-h-0 overflow-hidden">
                        <Tabs defaultValue="visual" className="flex flex-col h-full overflow-hidden">
                            <div className="px-3 pt-3 pb-0 border-b shrink-0">
                                <TabsList className="h-8 w-full bg-muted/50 p-1">
                                    <TabsTrigger value="visual" className="flex-1 text-[10px] h-6 data-[state=active]:bg-background">
                                        <Settings className="h-3 w-3 mr-1" />
                                        Visual
                                    </TabsTrigger>
                                    <TabsTrigger value="gemini" className="flex-1 text-[10px] h-6 data-[state=active]:bg-background">
                                        ✨ AI Assistant
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="visual" className="flex-1 overflow-hidden m-0 p-3">
                                {!selected ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground/60">
                                        <div className="p-3 rounded-full bg-muted/30">
                                            <Layers className="h-8 w-8 opacity-40" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold">No visual selected</p>
                                            <p className="text-[10px] mt-1">Select a tile on the canvas or<br/>add a new one from the sidebar.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 shrink-0 px-1">
                                            <Badge variant="secondary" className="text-[9px] font-mono uppercase tracking-wider bg-primary/10 text-primary border-none">
                                                {selected.type}
                                            </Badge>
                                            <span className="text-xs font-medium text-foreground truncate flex-1">{selected.title ?? selected.id}</span>
                                        </div>
                                        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                                            <VisualEncodingInspector
                                                selected={selected}
                                                updateSelected={updateSelected}
                                                allowedDatasets={allowedDatasets}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-4 border-t mt-4 shrink-0">
                                            <Button type="button" size="sm" variant="outline" className="flex-1 h-8 text-[10px]" onClick={duplicateVisual}>
                                                <Copy className="h-3 w-3 mr-1.5" />
                                                Duplicate
                                            </Button>
                                            <Button type="button" size="sm" variant="destructive" className="flex-1 h-8 text-[10px]" onClick={removeVisual}>
                                                <Trash2 className="h-3 w-3 mr-1.5" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="gemini" className="flex-1 overflow-hidden m-0 p-0 h-full">
                                <AnalyticsAssistantPanel aggregatesSummary={aggregatesSummary} onApplyPatch={applyFromAssistant} />
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>


            {/* ── Templates Dialog ──────────────────────────────────────── */}
            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <LayoutTemplate className="h-5 w-5" />
                            Report Templates
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                        {availableTemplates.map((tpl) => {
                            const Icon = tpl.icon;
                            return (
                                <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => applyTemplate(tpl)}
                                    className={cn(
                                        'text-left p-4 rounded-xl border-2 transition-all group',
                                        'hover:border-primary hover:shadow-md hover:bg-primary/5'
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm leading-tight">{tpl.label}</p>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tpl.description}</p>
                                            <div className="flex items-center gap-1 mt-2">
                                                <Badge variant="outline" className="text-[9px] px-1.5">
                                                    {tpl.definition.pages[0]?.visuals.length} visuals
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
