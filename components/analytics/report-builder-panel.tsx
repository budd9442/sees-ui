'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportCanvas } from './report-canvas';
import { AnalyticsReportToolbar } from './analytics-report-toolbar';
import { GeminiAssistantPanel } from './gemini-assistant-panel';
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
} from '@/lib/analytics/builder-metadata';
import type { AnalyticsDatasetId } from '@/lib/analytics/schema';
import {
    duplicateAnalyticsReport,
    listAnalyticsReports,
    saveAnalyticsReport,
    getAnalyticsReport,
} from '@/lib/actions/analytics-actions';
import { toast } from 'sonner';
import { Plus, Trash2, Copy } from 'lucide-react';
import { VisualEncodingInspector } from './visual-encoding-inspector';

type Props = {
    /** Initial definition (cloned on mount). */
    defaultDefinition: ReportDefinition;
    filterContext: AnalyticsQueryFilters;
    /** Session role for dataset allowlist. */
    builderRole: string;
    aggregatesSummary?: string;
    variant?: 'embedded' | 'fullPage';
};

const VISUAL_TYPES: VisualSpec['type'][] = [
    'kpi',
    'bar',
    'line',
    'area',
    'pie',
    'table',
    'scatter',
    'gauge',
    'matrix',
];

function cloneDef(def: ReportDefinition): ReportDefinition {
    return reportDefinitionSchema.parse(JSON.parse(JSON.stringify(def)));
}

function updateVisualInDefinition(
    def: ReportDefinition,
    pageIndex: number,
    visualId: string,
    updater: (v: VisualSpec) => VisualSpec
): ReportDefinition {
    const pages = def.pages.map((p, pi) => {
        if (pi !== pageIndex) return p;
        return {
            ...p,
            visuals: p.visuals.map((v) => (v.id === visualId ? updater(v) : v)),
        };
    });
    return { ...def, pages };
}

function removeVisualFromDefinition(
    def: ReportDefinition,
    pageIndex: number,
    visualId: string
): ReportDefinition {
    const pages = def.pages.map((p, pi) => {
        if (pi !== pageIndex) return p;
        return { ...p, visuals: p.visuals.filter((v) => v.id !== visualId) };
    });
    return { ...def, pages };
}

function createVisual(args: {
    type: VisualSpec['type'];
    datasetId: AnalyticsDatasetId;
    y: number;
}): VisualSpec {
    const id = `v_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const groupOpts = groupByOptionsForDataset(args.datasetId);
    const groupBy = (groupOpts[0]?.value ?? 'none') as GroupByOption;
    const encodings = defaultEncodingsForShape(args.datasetId, groupBy, args.type);
    const h = args.type === 'kpi' || args.type === 'gauge' ? 4 : args.type === 'table' || args.type === 'matrix' ? 7 : 5;
    const w = args.type === 'table' || args.type === 'matrix' ? 12 : 6;
    return {
        id,
        type: args.type,
        title: `New ${args.type}`,
        datasetId: args.datasetId,
        layout: { i: id, x: 0, y: args.y, w, h },
        groupBy,
        encodings: encodings ?? undefined,
    };
}

export function ReportBuilderPanel({
    defaultDefinition,
    filterContext,
    builderRole,
    aggregatesSummary,
    variant = 'embedded',
}: Props) {
    const [definition, setDefinition] = useState(() => cloneDef(defaultDefinition));
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reportTitle, setReportTitle] = useState('Untitled report');
    const [loadedReportId, setLoadedReportId] = useState<string | null>(null);
    const [savedList, setSavedList] = useState<{ report_id: string; title: string }[]>([]);
    const [pending, startTransition] = useTransition();

    const pageIndex = 0;
    const page = definition.pages[pageIndex];
    const selected = page?.visuals.find((v) => v.id === selectedId) ?? null;

    const allowedDatasets = useMemo(() => analyticsDatasetsForRole(builderRole), [builderRole]);

    const refreshList = useCallback(() => {
        startTransition(async () => {
            try {
                const rows = await listAnalyticsReports();
                setSavedList(rows.map((r) => ({ report_id: r.report_id, title: r.title })));
            } catch {
                /* ignore */
            }
        });
    }, []);

    useEffect(() => {
        refreshList();
    }, [refreshList]);

    const applyFromGemini = useCallback((patch: ReportDefinitionPatch) => {
        if (patch.updateTitle) setReportTitle(patch.updateTitle);
        setDefinition((d) => applyReportDefinitionPatch(d, patch));
        toast.success('Patch applied to report');
    }, []);

    const handleSave = () => {
        startTransition(async () => {
            try {
                const { reportId } = await saveAnalyticsReport({
                    reportId: loadedReportId ?? undefined,
                    title: reportTitle,
                    definition,
                });
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

    const handleDuplicateSaved = () => {
        if (!loadedReportId) {
            toast.message('Save the report first to duplicate on the server');
            return;
        }
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

    const addVisual = (type: VisualSpec['type']) => {
        const datasetId = allowedDatasets[0] ?? 'staff_module_grades';
        const y = nextVisualLayoutY(page?.visuals ?? []);
        const v = createVisual({ type, datasetId, y });
        setDefinition((d) => {
            const pages = d.pages.map((p, pi) =>
                pi === pageIndex ? { ...p, visuals: [...p.visuals, v] } : p
            );
            return { ...d, pages };
        });
        setSelectedId(v.id);
    };

    const duplicateVisual = () => {
        if (!selected) return;
        const y = nextVisualLayoutY(page?.visuals ?? []);
        const newId = `v_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
        const copy: VisualSpec = {
            ...selected,
            id: newId,
            layout: { i: newId, x: 0, y, w: selected.layout.w, h: selected.layout.h },
            title: `${selected.title ?? selected.type} (copy)`,
        };
        setDefinition((d) => {
            const pages = d.pages.map((p, pi) =>
                pi === pageIndex ? { ...p, visuals: [...p.visuals, copy] } : p
            );
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

    const exportQuery = useMemo(() => {
        if (selected) {
            return {
                datasetId: selected.datasetId,
                filters: { ...filterContext, ...selected.filters },
                groupBy: selected.groupBy ?? 'none',
            };
        }
        return {
            datasetId: allowedDatasets[0] ?? 'staff_module_grades',
            filters: filterContext,
            groupBy: 'none' as const,
        };
    }, [selected, filterContext, allowedDatasets]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2 flex-1 max-w-md">
                    <Label htmlFor="report-title">Report title</Label>
                    <Input
                        id="report-title"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        placeholder="Name this report"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" size="sm" variant="default">
                                <Plus className="h-4 w-4 mr-1" />
                                Add visual
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                            {VISUAL_TYPES.map((t) => (
                                <DropdownMenuItem key={t} onClick={() => addVisual(t)}>
                                    {t}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button type="button" size="sm" variant="outline" onClick={handleSave} disabled={pending}>
                        Save report
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={resetToTemplate} disabled={pending}>
                        Reset template
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={handleDuplicateSaved} disabled={pending}>
                        Duplicate saved
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Label className="shrink-0">Open saved</Label>
                <Select
                    value={loadedReportId ?? '__new__'}
                    onValueChange={(v) => {
                        if (v === '__new__') {
                            setLoadedReportId(null);
                            return;
                        }
                        handleLoad(v);
                    }}
                >
                    <SelectTrigger className="sm:w-80">
                        <SelectValue placeholder="Pick a saved report" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__new__">— New / not loaded —</SelectItem>
                        {savedList.map((r) => (
                            <SelectItem key={r.report_id} value={r.report_id}>
                                {r.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <AnalyticsReportToolbar exportQuery={exportQuery} />

            <div
                className={
                    variant === 'fullPage'
                        ? 'grid gap-4 lg:grid-cols-[1fr_minmax(300px,400px)]'
                        : 'grid gap-4 lg:grid-cols-[1fr_minmax(260px,320px)]'
                }
            >
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-2">
                        Drag the top bar of a tile to move; resize from corners. Click a tile to edit fields.
                    </p>
                    <ReportCanvas
                        definition={definition}
                        pageIndex={pageIndex}
                        filterContext={filterContext}
                        selectedVisualId={selectedId}
                        onSelectVisual={setSelectedId}
                        onDefinitionChange={setDefinition}
                    />
                </div>

                <Card className="h-fit lg:sticky lg:top-4">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Visual properties</CardTitle>
                        <CardDescription className="text-xs">
                            Dataset, grouping, and axes drive the query for this tile only.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {!selected ? (
                            <p className="text-muted-foreground text-xs">Select a visual on the canvas.</p>
                        ) : (
                            <>
                                <VisualEncodingInspector
                                    selected={selected}
                                    updateSelected={updateSelected}
                                    allowedDatasets={allowedDatasets}
                                />

                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button type="button" size="sm" variant="outline" onClick={duplicateVisual}>
                                        <Copy className="h-3.5 w-3.5 mr-1" />
                                        Duplicate tile
                                    </Button>
                                    <Button type="button" size="sm" variant="destructive" onClick={removeVisual}>
                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                        Remove
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <GeminiAssistantPanel aggregatesSummary={aggregatesSummary} onApplyPatch={applyFromGemini} />
        </div>
    );
}
