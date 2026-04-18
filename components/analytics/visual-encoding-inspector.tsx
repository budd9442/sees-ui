'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { VisualSpec } from '@/lib/analytics/schema';
import type { AnalyticsDatasetId } from '@/lib/analytics/schema';
import type { KpiAggregation } from '@/lib/analytics/schema';
import {
    columnKindsForShape,
    columnsForDatasetShape,
    defaultEncodingsForShape,
    groupByOptionsForDataset,
    type GroupByOption,
} from '@/lib/analytics/builder-metadata';
import { ChevronDown, ChevronUp, Filter, Palette, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    selected: VisualSpec;
    updateSelected: (fn: (v: VisualSpec) => VisualSpec) => void;
    allowedDatasets: AnalyticsDatasetId[];
};

const VISUAL_TYPES: VisualSpec['type'][] = ['kpi', 'bar', 'line', 'area', 'pie', 'donut', 'table', 'scatter', 'gauge', 'matrix', 'radar'];

const VISUAL_TYPE_ICONS: Record<VisualSpec['type'], string> = {
    kpi: '🔢', bar: '📊', line: '📈', area: '📉', pie: '🥧', donut: '🍩',
    table: '🗃️', scatter: '✦', gauge: '🎯', matrix: '⊞', radar: '🕸️',
};

const KPI_AGG: { value: KpiAggregation; label: string }[] = [
    { value: 'first', label: 'First row' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'count', label: 'Count rows' },
];

const COLOR_SCHEMES = [
    { value: 'default', label: 'Default (Indigo)', swatch: '#6366f1' },
    { value: 'blue', label: 'Blue', swatch: '#3b82f6' },
    { value: 'green', label: 'Green', swatch: '#22c55e' },
    { value: 'purple', label: 'Purple', swatch: '#a855f7' },
    { value: 'warm', label: 'Warm (Orange/Red)', swatch: '#f97316' },
    { value: 'cool', label: 'Cool (Cyan)', swatch: '#06b6d4' },
    { value: 'monochrome', label: 'Monochrome', swatch: '#6b7280' },
    { value: 'traffic_light', label: 'Traffic Light', swatch: '#22c55e' },
];

function SectionHeader({ icon: Icon, label, count, open, onClick }: { icon: React.ElementType; label: string; count?: number; open: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center justify-between py-1.5 px-1 rounded hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                {count !== undefined && count > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">{count}</Badge>
                )}
            </div>
            {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
    );
}

export function VisualEncodingInspector({ selected, updateSelected, allowedDatasets }: Props) {
    const [openSections, setOpenSections] = useState({ config: true, mapping: true, filters: false, appearance: false });

    const toggleSection = (k: keyof typeof openSections) =>
        setOpenSections((s) => ({ ...s, [k]: !s[k] }));

    const kinds = columnKindsForShape(selected.datasetId, selected.groupBy);
    const encodingColumns = columnsForDatasetShape(selected.datasetId, selected.groupBy);
    const numericCols = kinds.filter((k) => k.kind === 'number').map((k) => k.name);
    const allCols = encodingColumns;

    const mergeEnc = (partial: NonNullable<VisualSpec['encodings']>) =>
        updateSelected((v) => ({ ...v, encodings: { ...v.encodings, ...partial } }));

    const mergeFilters = (partial: NonNullable<VisualSpec['filters']>) =>
        updateSelected((v) => ({ ...v, filters: { ...(v.filters ?? {}), ...partial } }));

    // Count active filters
    const activeFilters = Object.values(selected.filters ?? {}).filter(Boolean).length;

    // Table column helpers
    const effectiveTableColumns = selected.encodings?.tableColumns?.length
        ? selected.encodings.tableColumns
        : allCols;
    const tableColIncluded = (col: string) => effectiveTableColumns.includes(col);
    const setTableColumnChecked = (col: string, checked: boolean) => {
        const base = selected.encodings?.tableColumns;
        if (!base?.length) {
            if (!checked) mergeEnc({ tableColumns: allCols.filter((c) => c !== col) });
            return;
        }
        let next = checked ? [...base, col] : base.filter((c) => c !== col);
        next = [...new Set(next)].filter((c) => allCols.includes(c));
        const ordered = allCols.filter((c) => next.includes(c));
        if (!ordered.length || ordered.length === allCols.length) {
            mergeEnc({ tableColumns: undefined });
        } else {
            mergeEnc({ tableColumns: ordered });
        }
    };
    const moveTableColumn = (col: string, dir: -1 | 1) => {
        const cols = [...effectiveTableColumns];
        const i = cols.indexOf(col);
        if (i < 0) return;
        const j = i + dir;
        if (j < 0 || j >= cols.length) return;
        [cols[i], cols[j]] = [cols[j]!, cols[i]!];
        mergeEnc({ tableColumns: cols });
    };

    const metricKey = selected.encodings?.metric ?? numericCols[0] ?? encodingColumns[1] ?? encodingColumns[0];
    const catKey = selected.encodings?.category ?? selected.encodings?.x ?? kinds.find((k) => k.kind === 'string')?.name ?? encodingColumns[0];
    const valKey = selected.encodings?.value ?? selected.encodings?.y ?? numericCols[0] ?? encodingColumns[1];
    const agg = selected.encodings?.kpiAggregation ?? 'avg';

    const radarMetrics = selected.encodings?.radarMetrics ?? numericCols.slice(0, 4);

    return (
        <ScrollArea className="flex-1 h-0">
            <div className="space-y-4 pr-3">

                {/* ── CONFIG ──────────────────────────────────────────────── */}
                <SectionHeader icon={Settings2} label="Configuration" open={openSections.config} onClick={() => toggleSection('config')} />
                {openSections.config && (
                    <div className="space-y-2 pl-1">
                        <div className="space-y-1">
                            <Label className="text-xs">Title</Label>
                            <Input
                                value={selected.title ?? ''}
                                onChange={(e) => updateSelected((v) => ({ ...v, title: e.target.value || undefined }))}
                                placeholder="Visual title..."
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Subtitle</Label>
                            <Input
                                value={selected.subtitle ?? ''}
                                onChange={(e) => updateSelected((v) => ({ ...v, subtitle: e.target.value || undefined }))}
                                placeholder="Optional subtitle..."
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Chart type</Label>
                            <Select
                                value={selected.type}
                                onValueChange={(val) => {
                                    const newType = val as VisualSpec['type'];
                                    updateSelected((v) => ({
                                        ...v,
                                        type: newType,
                                        encodings: defaultEncodingsForShape(v.datasetId, v.groupBy, newType) ?? v.encodings,
                                    }));
                                }}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {VISUAL_TYPES.map((t) => (
                                        <SelectItem key={t} value={t} className="text-xs">
                                            {VISUAL_TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Dataset</Label>
                            <Select
                                value={selected.datasetId}
                                onValueChange={(val) => {
                                    const ds = val as AnalyticsDatasetId;
                                    const gb = (groupByOptionsForDataset(ds)[0]?.value ?? 'none') as GroupByOption;
                                    updateSelected((v) => ({
                                        ...v,
                                        datasetId: ds,
                                        groupBy: gb,
                                        encodings: defaultEncodingsForShape(ds, gb, v.type) ?? undefined,
                                    }));
                                }}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {allowedDatasets.map((d) => (
                                        <SelectItem key={d} value={d} className="text-xs">{d.replace(/_/g, ' ')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Group by</Label>
                            <Select
                                value={selected.groupBy ?? 'none'}
                                onValueChange={(val) => {
                                    const gb = val as GroupByOption;
                                    updateSelected((v) => ({
                                        ...v,
                                        groupBy: gb,
                                        encodings: defaultEncodingsForShape(v.datasetId, gb, v.type) ?? v.encodings,
                                    }));
                                }}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {groupByOptionsForDataset(selected.datasetId).map((o) => (
                                        <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                <Separator />

                {/* ── DATA MAPPING ────────────────────────────────────────── */}
                <SectionHeader icon={Settings2} label="Data mapping" open={openSections.mapping} onClick={() => toggleSection('mapping')} />
                {openSections.mapping && (
                    <div className="space-y-2 pl-1">
                        {(selected.type === 'kpi' || selected.type === 'gauge') && (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">Metric (numeric)</Label>
                                    <Select value={metricKey} onValueChange={(m) => mergeEnc({ metric: m, value: m, y: m })}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{numericCols.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Aggregation</Label>
                                    <Select value={agg} onValueChange={(v) => mergeEnc({ kpiAggregation: v as KpiAggregation })}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{KPI_AGG.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                {selected.type === 'kpi' && (
                                    <div className="space-y-1">
                                        <Label className="text-xs">Trend col (optional)</Label>
                                        <Select value={selected.encodings?.trendCol ?? '__none__'} onValueChange={(v) => mergeEnc({ trendCol: v === '__none__' ? undefined : v })}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__" className="text-xs">None</SelectItem>
                                                {numericCols.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </>
                        )}

                        {(selected.type === 'bar' || selected.type === 'line' || selected.type === 'area') && (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">Category (X axis)</Label>
                                    <Select value={String(catKey)} onValueChange={(x) => mergeEnc({ x, category: x })}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{encodingColumns.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Value (Y axis)</Label>
                                    <Select value={String(valKey)} onValueChange={(y) => mergeEnc({ y, value: y })}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {(numericCols.length ? numericCols : encodingColumns).map((c) => (
                                                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        {(selected.type === 'pie' || selected.type === 'donut') && (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">Slice labels</Label>
                                    <Select value={String(selected.encodings?.category ?? catKey)} onValueChange={(category) => mergeEnc({ category, x: category })}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{encodingColumns.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Slice size (numeric)</Label>
                                    <Select value={String(selected.encodings?.value ?? valKey)} onValueChange={(value) => mergeEnc({ value, y: value })}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {(numericCols.length ? numericCols : encodingColumns).map((c) => (
                                                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        {selected.type === 'scatter' && (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">X (numeric)</Label>
                                    <Select value={String(selected.encodings?.x ?? numericCols[0])} onValueChange={(x) => mergeEnc({ x })}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{numericCols.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Y (numeric)</Label>
                                    <Select value={String(selected.encodings?.y ?? numericCols[1] ?? numericCols[0])} onValueChange={(y) => mergeEnc({ y })}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{numericCols.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        {selected.type === 'radar' && (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">Category axis</Label>
                                    <Select value={String(selected.encodings?.category ?? catKey)} onValueChange={(c) => mergeEnc({ category: c })}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{encodingColumns.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Metrics (up to 5)</Label>
                                    <div className="space-y-1.5">
                                        {numericCols.map((c) => (
                                            <div key={c} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`radar-${c}`}
                                                    checked={radarMetrics.includes(c)}
                                                    onCheckedChange={(checked) => {
                                                        const next = checked
                                                            ? [...radarMetrics, c].slice(0, 5)
                                                            : radarMetrics.filter((m) => m !== c);
                                                        mergeEnc({ radarMetrics: next });
                                                    }}
                                                />
                                                <label htmlFor={`radar-${c}`} className="text-xs cursor-pointer">{c}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {(selected.type === 'table' || selected.type === 'matrix') && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Columns</Label>
                                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => mergeEnc({ tableColumns: undefined })}>Reset all</Button>
                                </div>
                                <ScrollArea className="h-36 rounded-md border p-2">
                                    <div className="space-y-1.5 pr-2">
                                        {allCols.map((col) => (
                                            <div key={col} className="flex items-center gap-2 text-xs">
                                                <Checkbox
                                                    id={`col-${col}`}
                                                    checked={tableColIncluded(col)}
                                                    onCheckedChange={(c) => setTableColumnChecked(col, Boolean(c))}
                                                />
                                                <label htmlFor={`col-${col}`} className="flex-1 cursor-pointer truncate">{col}</label>
                                                {selected.encodings?.tableColumns?.includes(col) && (
                                                    <div className="flex gap-0.5">
                                                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveTableColumn(col, -1)}><ChevronUp className="h-3 w-3" /></Button>
                                                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveTableColumn(col, 1)}><ChevronDown className="h-3 w-3" /></Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {selected.type === 'matrix' && (
                                    <>
                                        <Separator />
                                        <p className="text-[10px] text-muted-foreground">Pivot configuration (optional)</p>
                                        {(['pivotRow', 'pivotCol', 'pivotValue'] as const).map((field) => (
                                            <div key={field} className="space-y-1">
                                                <Label className="text-xs">{field === 'pivotRow' ? 'Pivot row' : field === 'pivotCol' ? 'Pivot column' : 'Pivot value (numeric)'}</Label>
                                                <Select
                                                    value={selected.encodings?.[field] ?? '__none__'}
                                                    onValueChange={(v) => mergeEnc({ [field]: v === '__none__' ? undefined : v })}
                                                >
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="__none__" className="text-xs">None</SelectItem>
                                                        {(field === 'pivotValue' ? numericCols : encodingColumns).map((c) => (
                                                            <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <Separator />

                {/* ── FILTERS ──────────────────────────────────────────────── */}
                <SectionHeader icon={Filter} label="Filters" count={activeFilters} open={openSections.filters} onClick={() => toggleSection('filters')} />
                {openSections.filters && (
                    <div className="space-y-2 pl-1">
                        {/* Metadata filters */}
                        {(selected.datasetId === 'hod_student_summary' || selected.datasetId === 'admin_student_metadata') && (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">Metadata key</Label>
                                    <Input
                                        value={selected.filters?.metadataKey ?? ''}
                                        placeholder="e.g. al_subject_stream"
                                        className="h-8 text-xs"
                                        onChange={(e) => mergeFilters({ metadataKey: e.target.value || undefined })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Metadata value</Label>
                                    <Input
                                        value={selected.filters?.metadataValue ?? ''}
                                        placeholder="e.g. Physical Science"
                                        className="h-8 text-xs"
                                        onChange={(e) => mergeFilters({ metadataValue: e.target.value || undefined })}
                                    />
                                </div>
                            </>
                        )}

                        {/* Level filter */}
                        <div className="space-y-1">
                            <Label className="text-xs">Level filter</Label>
                            <Select
                                value={selected.filters?.level ?? '__all__'}
                                onValueChange={(v) => mergeFilters({ level: v === '__all__' ? undefined : v })}
                            >
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All levels" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__" className="text-xs">All levels</SelectItem>
                                    {['L1', 'L2', 'L3', 'L4'].map((l) => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* GPA range (for student summary datasets) */}
                        {(selected.datasetId.startsWith('admin_') || selected.datasetId.startsWith('hod_student')) && (
                            <div className="grid grid-cols-2 gap-1.5">
                                <div className="space-y-1">
                                    <Label className="text-xs">GPA min</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={4}
                                        step={0.1}
                                        value={selected.filters?.gpaMin ?? ''}
                                        placeholder="0.0"
                                        className="h-8 text-xs"
                                        onChange={(e) => mergeFilters({ gpaMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">GPA max</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={4}
                                        step={0.1}
                                        value={selected.filters?.gpaMax ?? ''}
                                        placeholder="4.0"
                                        className="h-8 text-xs"
                                        onChange={(e) => mergeFilters({ gpaMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Enrollment status */}
                        {(selected.datasetId === 'admin_enrollment_trends' || selected.datasetId === 'admin_at_risk_students') && (
                            <div className="space-y-1">
                                <Label className="text-xs">Enrollment status</Label>
                                <Select
                                    value={selected.filters?.enrollmentStatus ?? '__all__'}
                                    onValueChange={(v) => mergeFilters({ enrollmentStatus: v === '__all__' ? undefined : v })}
                                >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__" className="text-xs">All</SelectItem>
                                        {['ENROLLED', 'SUSPENDED', 'WITHDRAWN', 'GRADUATED'].map((s) => (
                                            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Admission year */}
                        <div className="space-y-1">
                            <Label className="text-xs">Admission year</Label>
                            <Input
                                type="number"
                                min={2000}
                                max={2100}
                                value={selected.filters?.admissionYear ?? ''}
                                placeholder="e.g. 2022"
                                className="h-8 text-xs"
                                onChange={(e) => mergeFilters({ admissionYear: e.target.value ? parseInt(e.target.value) : undefined })}
                            />
                        </div>

                        {activeFilters > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-full text-xs text-muted-foreground hover:text-destructive"
                                onClick={() => updateSelected((v) => ({ ...v, filters: {} }))}
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}

                <Separator />

                {/* ── APPEARANCE ───────────────────────────────────────────── */}
                <SectionHeader icon={Palette} label="Appearance" open={openSections.appearance} onClick={() => toggleSection('appearance')} />
                {openSections.appearance && (
                    <div className="space-y-2 pl-1">
                        <div className="space-y-1">
                            <Label className="text-xs">Color scheme</Label>
                            <Select
                                value={selected.encodings?.colorScheme ?? 'default'}
                                onValueChange={(v) => mergeEnc({ colorScheme: v as NonNullable<VisualSpec['encodings']>['colorScheme'] })}
                            >
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {COLOR_SCHEMES.map((cs) => (
                                        <SelectItem key={cs.value} value={cs.value} className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cs.swatch }} />
                                                {cs.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Sort order</Label>
                            <Select
                                value={selected.encodings?.sortOrder ?? 'none'}
                                onValueChange={(v) => mergeEnc({ sortOrder: v as 'none' | 'asc' | 'desc' })}
                            >
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" className="text-xs">No sort</SelectItem>
                                    <SelectItem value="asc" className="text-xs">Ascending</SelectItem>
                                    <SelectItem value="desc" className="text-xs">Descending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Show data labels</Label>
                            <Switch
                                checked={selected.encodings?.showDataLabels ?? false}
                                onCheckedChange={(c) => mergeEnc({ showDataLabels: c })}
                            />
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
