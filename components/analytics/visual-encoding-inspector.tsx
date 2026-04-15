'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { ChevronDown, ChevronUp } from 'lucide-react';

type Props = {
    selected: VisualSpec;
    updateSelected: (fn: (v: VisualSpec) => VisualSpec) => void;
    allowedDatasets: AnalyticsDatasetId[];
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

const KPI_AGG: { value: KpiAggregation; label: string }[] = [
    { value: 'first', label: 'First row' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
];

export function VisualEncodingInspector({ selected, updateSelected, allowedDatasets }: Props) {
    const kinds = columnKindsForShape(selected.datasetId, selected.groupBy);
    const encodingColumns = columnsForDatasetShape(selected.datasetId, selected.groupBy);
    const numericCols = kinds.filter((k) => k.kind === 'number').map((k) => k.name);
    const allCols = encodingColumns;

    const mergeEnc = (partial: NonNullable<VisualSpec['encodings']>) =>
        updateSelected((v) => ({
            ...v,
            encodings: { ...v.encodings, ...partial },
        }));

    const effectiveTableColumns =
        selected.encodings?.tableColumns && selected.encodings.tableColumns.length > 0
            ? selected.encodings.tableColumns
            : allCols;

    const tableColIncluded = (col: string) => effectiveTableColumns.includes(col);

    const setTableColumnChecked = (col: string, checked: boolean) => {
        const base = selected.encodings?.tableColumns;
        if (base === undefined || base.length === 0) {
            if (!checked) {
                mergeEnc({ tableColumns: allCols.filter((c) => c !== col) });
            }
            return;
        }
        let next = checked ? [...base, col] : base.filter((c) => c !== col);
        next = [...new Set(next)].filter((c) => allCols.includes(c));
        const ordered = allCols.filter((c) => next.includes(c));
        if (ordered.length === 0 || ordered.length === allCols.length) {
            mergeEnc({ tableColumns: undefined, pivotRow: undefined, pivotCol: undefined, pivotValue: undefined });
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
        const a = cols[i]!;
        const b = cols[j]!;
        cols[i] = b;
        cols[j] = a;
        mergeEnc({ tableColumns: cols });
    };

    const resetTableColumns = () => {
        mergeEnc({
            tableColumns: undefined,
            pivotRow: undefined,
            pivotCol: undefined,
            pivotValue: undefined,
        });
    };

    const metricKey =
        selected.encodings?.metric ??
        selected.encodings?.value ??
        selected.encodings?.y ??
        numericCols[0] ??
        encodingColumns[1] ??
        encodingColumns[0];

    const agg = selected.encodings?.kpiAggregation ?? 'first';

    const catKey =
        selected.encodings?.category ??
        selected.encodings?.x ??
        kinds.find((k) => k.kind === 'string')?.name ??
        encodingColumns[0];
    const valKey =
        selected.encodings?.value ??
        selected.encodings?.y ??
        numericCols[0] ??
        encodingColumns[1];

    const pr = selected.encodings?.pivotRow;
    const pc = selected.encodings?.pivotCol;
    const pv = selected.encodings?.pivotValue;
    const pivotIncomplete =
        Boolean(pr || pc || pv) && !(Boolean(pr && pc && pv) && new Set([pr, pc, pv]).size === 3);

    return (
        <>
            <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                    value={selected.title ?? ''}
                    onChange={(e) =>
                        updateSelected((v) => ({ ...v, title: e.target.value || undefined }))
                    }
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
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {VISUAL_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
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
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {allowedDatasets.map((d) => (
                            <SelectItem key={d} value={d}>
                                {d}
                            </SelectItem>
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
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {groupByOptionsForDataset(selected.datasetId).map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {selected.datasetId === 'hod_student_summary' && (
                <div className="space-y-2 rounded-md border p-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Metadata filter
                    </p>
                    <div className="space-y-1">
                        <Label className="text-xs">Metadata key</Label>
                        <Input
                            value={selected.filters?.metadataKey ?? ''}
                            placeholder="al_subject_stream"
                            onChange={(e) =>
                                updateSelected((v) => ({
                                    ...v,
                                    filters: {
                                        ...(v.filters ?? {}),
                                        metadataKey: e.target.value || undefined,
                                    },
                                }))
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Metadata value</Label>
                        <Input
                            value={selected.filters?.metadataValue ?? ''}
                            placeholder="Physical Science"
                            onChange={(e) =>
                                updateSelected((v) => ({
                                    ...v,
                                    filters: {
                                        ...(v.filters ?? {}),
                                        metadataValue: e.target.value || undefined,
                                    },
                                }))
                            }
                        />
                    </div>
                </div>
            )}

            <Separator />
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Data mapping</p>

            {(selected.type === 'kpi' || selected.type === 'gauge') && (
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Metric (numeric)</Label>
                        <Select
                            value={metricKey}
                            onValueChange={(m) =>
                                mergeEnc({ metric: m, value: m, y: m, x: selected.encodings?.x, category: selected.encodings?.category })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {numericCols.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Aggregation</Label>
                        <Select
                            value={agg}
                            onValueChange={(v) => mergeEnc({ kpiAggregation: v as KpiAggregation })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {KPI_AGG.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {(selected.type === 'bar' || selected.type === 'line' || selected.type === 'area') && (
                <div className="grid gap-2 grid-cols-1">
                    <div className="space-y-1">
                        <Label className="text-xs">Category (X)</Label>
                        <Select
                            value={String(catKey)}
                            onValueChange={(x) => mergeEnc({ x, category: x })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {encodingColumns.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Value (Y)</Label>
                        <Select
                            value={String(valKey)}
                            onValueChange={(y) => mergeEnc({ y, value: y })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {numericCols.length
                                    ? numericCols.map((c) => (
                                          <SelectItem key={c} value={c}>
                                              {c}
                                          </SelectItem>
                                      ))
                                    : encodingColumns.map((c) => (
                                          <SelectItem key={c} value={c}>
                                              {c}
                                          </SelectItem>
                                      ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {selected.type === 'pie' && (
                <div className="grid gap-2 grid-cols-1">
                    <div className="space-y-1">
                        <Label className="text-xs">Slice labels</Label>
                        <Select
                            value={String(selected.encodings?.category ?? catKey)}
                            onValueChange={(category) => mergeEnc({ category, x: category })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {encodingColumns.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Slice size (numeric)</Label>
                        <Select
                            value={String(selected.encodings?.value ?? valKey)}
                            onValueChange={(value) => mergeEnc({ value, y: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(numericCols.length ? numericCols : encodingColumns).map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {selected.type === 'scatter' && (
                <div className="grid gap-2 grid-cols-1">
                    <div className="space-y-1">
                        <Label className="text-xs">X (numeric)</Label>
                        <Select
                            value={String(selected.encodings?.x ?? numericCols[0])}
                            onValueChange={(x) => mergeEnc({ x })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {numericCols.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Y (numeric)</Label>
                        <Select
                            value={String(selected.encodings?.y ?? numericCols[1] ?? numericCols[0])}
                            onValueChange={(y) => mergeEnc({ y })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {numericCols.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {(selected.type === 'table' || selected.type === 'matrix') && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">Columns</Label>
                        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={resetTableColumns}>
                            Reset all
                        </Button>
                    </div>
                    <ScrollArea className="h-40 rounded-md border p-2">
                        <div className="space-y-2 pr-2">
                            {allCols.map((col) => (
                                <div key={col} className="flex items-center gap-2 text-xs">
                                    <Checkbox
                                        id={`col-${col}`}
                                        checked={tableColIncluded(col)}
                                        onCheckedChange={(c) => setTableColumnChecked(col, Boolean(c))}
                                    />
                                    <label htmlFor={`col-${col}`} className="flex-1 cursor-pointer truncate">
                                        {col}
                                    </label>
                                    {selected.encodings?.tableColumns &&
                                        selected.encodings.tableColumns.length > 0 &&
                                        selected.encodings.tableColumns.includes(col) && (
                                            <div className="flex gap-0.5">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => moveTableColumn(col, -1)}
                                                >
                                                    <ChevronUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => moveTableColumn(col, 1)}
                                                >
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {selected.type === 'matrix' && (
                        <>
                            <Separator />
                            <p className="text-[10px] text-muted-foreground">Optional pivot (distinct row, col, value)</p>
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Pivot row</Label>
                                    <Select
                                        value={selected.encodings?.pivotRow ?? '__none__'}
                                        onValueChange={(v) =>
                                            mergeEnc({
                                                pivotRow: v === '__none__' ? undefined : v,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">None</SelectItem>
                                            {encodingColumns.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Pivot column</Label>
                                    <Select
                                        value={selected.encodings?.pivotCol ?? '__none__'}
                                        onValueChange={(v) =>
                                            mergeEnc({
                                                pivotCol: v === '__none__' ? undefined : v,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">None</SelectItem>
                                            {encodingColumns.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Pivot value (numeric)</Label>
                                    <Select
                                        value={selected.encodings?.pivotValue ?? '__none__'}
                                        onValueChange={(v) =>
                                            mergeEnc({
                                                pivotValue: v === '__none__' ? undefined : v,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">None</SelectItem>
                                            {numericCols.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {pivotIncomplete && (
                                        <p className="text-[10px] text-amber-600">
                                            Pick three different fields for pivot mode.
                                        </p>
                                    )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
