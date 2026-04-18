'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Area,
    AreaChart,
    Scatter,
    ScatterChart,
    Legend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    LabelList,
} from 'recharts';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { runAnalyticsQueryAction } from '@/lib/actions/analytics-actions';
import type { AnalyticsQueryResult } from '@/lib/analytics/execute-analytics-query';
import type { VisualSpec } from '@/lib/analytics/schema';
import type { AnalyticsQueryFilters } from '@/lib/analytics/schema';
import type { KpiAggregation } from '@/lib/analytics/schema';
import { kindOfColumn } from '@/lib/analytics/builder-metadata';
import { ArrowUp, ArrowDown, Minus, AlertTriangle } from 'lucide-react';

// ─── Color Palettes ────────────────────────────────────────────────────────────
const PALETTES: Record<string, string[]> = {
    default: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5'],
    blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8', '#2563eb'],
    green: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#15803d', '#16a34a'],
    purple: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#7e22ce', '#9333ea'],
    warm: ['#f97316', '#fb923c', '#fca5a1', '#ef4444', '#dc2626', '#b91c1c'],
    cool: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#0284c7', '#0369a1'],
    monochrome: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'],
    traffic_light: ['#22c55e', '#eab308', '#ef4444', '#f97316', '#3b82f6', '#8b5cf6'],
};

function palette(scheme: string | undefined): string[] {
    return PALETTES[scheme ?? 'default'] ?? PALETTES.default;
}

// ─── Aggregations ──────────────────────────────────────────────────────────────
function aggregateMetric(rows: Record<string, unknown>[], col: string, agg: KpiAggregation | undefined): number {
    const nums = rows.map((r) => Number(r[col])).filter((n) => Number.isFinite(n));
    if (!nums.length) return NaN;
    const a = agg ?? 'avg';
    if (a === 'first') return nums[0]!;
    if (a === 'sum') return nums.reduce((s, n) => s + n, 0);
    if (a === 'avg') return nums.reduce((s, n) => s + n, 0) / nums.length;
    if (a === 'min') return Math.min(...nums);
    if (a === 'max') return Math.max(...nums);
    if (a === 'count') return nums.length;
    return nums[0]!;
}

// ─── Sorting ──────────────────────────────────────────────────────────────────
function sortRows(rows: Record<string, unknown>[], order: string | undefined, key: string | undefined): Record<string, unknown>[] {
    if (!order || order === 'none' || !key) return rows;
    const sorted = [...rows].sort((a, b) => {
        const av = Number(a[key]);
        const bv = Number(b[key]);
        if (Number.isFinite(av) && Number.isFinite(bv)) return order === 'asc' ? av - bv : bv - av;
        return String(a[key] ?? '').localeCompare(String(b[key] ?? ''));
    });
    return order === 'asc' ? sorted : sorted;
}

// ─── Pivot ────────────────────────────────────────────────────────────────────
function buildPivot(rows: Record<string, unknown>[], rowField: string, colField: string, valField: string): { columns: string[]; rows: Record<string, unknown>[] } {
    const colKeys = new Set<string>();
    const rowKeys = new Set<string>();
    for (const r of rows) {
        colKeys.add(String(r[colField] ?? ''));
        rowKeys.add(String(r[rowField] ?? ''));
    }
    const colArr = [...colKeys].sort();
    const rowArr = [...rowKeys].sort();
    const grid = new Map<string, number>();
    for (const r of rows) {
        const rk = String(r[rowField] ?? '');
        const ck = String(r[colField] ?? '');
        const v = Number(r[valField]);
        if (!Number.isFinite(v)) continue;
        const k = `${rk}||${ck}`;
        grid.set(k, (grid.get(k) ?? 0) + v);
    }
    const outRows = rowArr.map((rk) => {
        const o: Record<string, unknown> = { [rowField]: rk };
        for (const ck of colArr) {
            o[ck] = grid.get(`${rk}||${ck}`) ?? '';
        }
        return o;
    });
    return { columns: [rowField, ...colArr], rows: outRows };
}

function pivotEncodingValid(e: VisualSpec['encodings']): e is NonNullable<typeof e> & { pivotRow: string; pivotCol: string; pivotValue: string } {
    if (!e?.pivotRow || !e.pivotCol || !e.pivotValue) return false;
    return new Set([e.pivotRow, e.pivotCol, e.pivotValue]).size === 3;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border bg-popover text-popover-foreground shadow-md p-2.5 text-xs space-y-1">
            {label && <p className="font-semibold text-foreground">{label}</p>}
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground">{p.name}:</span>
                    <span className="font-medium">{typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Empty / Error States ─────────────────────────────────────────────────────
function EmptyCard({ visual, message }: { visual: VisualSpec; message: string }) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{visual.title || visual.type}</CardTitle>
                {visual.subtitle && <CardDescription className="text-xs">{visual.subtitle}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-6 w-6 opacity-40" />
                <p className="text-xs">{message}</p>
            </CardContent>
        </Card>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Props = { visual: VisualSpec; filterContext?: AnalyticsQueryFilters };

export function VisualRenderer({ visual, filterContext }: Props) {
    const [data, setData] = useState<AnalyticsQueryResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setError(null);
        setLoading(true);
        runAnalyticsQueryAction({
            datasetId: visual.datasetId,
            filters: { ...filterContext, ...visual.filters },
            groupBy: visual.groupBy ?? 'none',
        })
            .then((r) => { if (!cancelled) { setData(r); setLoading(false); } })
            .catch((e: Error) => { if (!cancelled) { setError(e.message || 'Failed to load'); setLoading(false); } });
        return () => { cancelled = true; };
    }, [visual, filterContext]);

    const rawData = useMemo(() => data?.rows ?? [], [data]);
    const colors = palette(visual.encodings?.colorScheme ?? undefined);

    const gb = visual.groupBy ?? 'none';
    const showLabels = visual.encodings?.showDataLabels ?? false;
    const sortOrder = visual.encodings?.sortOrder ?? 'none';

    const xKey = visual.encodings?.x ?? visual.encodings?.category ?? data?.columns[0];
    const yKey = visual.encodings?.y ?? visual.encodings?.value ?? data?.columns[1];

    const pieCategoryKey = visual.encodings?.category ?? visual.encodings?.x ?? data?.columns[0];
    const pieValueKey = visual.encodings?.value ?? visual.encodings?.y ?? data?.columns[1];

    const metricCol = visual.encodings?.metric ?? visual.encodings?.value ?? visual.encodings?.y
        ?? (data?.columns.find((c) => rawData[0] && typeof rawData[0][c] === 'number') ?? data?.columns[1]);

    const chartData = useMemo(() => {
        return sortRows(rawData, sortOrder, yKey ?? undefined);
    }, [rawData, sortOrder, yKey]);

    // Table display
    const tableDisplay = useMemo(() => {
        if (!data?.columns.length) return { columns: [] as string[], rows: [] as Record<string, unknown>[] };
        if (visual.type === 'matrix' && pivotEncodingValid(visual.encodings)) {
            return buildPivot(rawData, visual.encodings.pivotRow, visual.encodings.pivotCol, visual.encodings.pivotValue);
        }
        const tc = visual.encodings?.tableColumns?.filter((c) => data.columns.includes(c));
        const cols = tc?.length ? tc : data.columns;
        return { columns: cols, rows: rawData };
    }, [data, rawData, visual.type, visual.encodings]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const tableColumns = useMemo<ColumnDef<Record<string, unknown>, unknown>[]>(() => {
        return tableDisplay.columns.map((c) => ({
            accessorKey: c,
            header: c.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            cell: ({ getValue }) => {
                const val = getValue();
                if (typeof val === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
                return String(val ?? '');
            },
        }));
    }, [tableDisplay.columns]);

    const table = useReactTable({
        data: tableDisplay.rows,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
    });

    if (loading) {
        return (
            <Card className="h-full">
                <CardContent className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <p className="text-xs text-muted-foreground">Loading…</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="h-full border-destructive/40">
                <CardHeader>
                    <CardTitle className="text-sm text-destructive">{visual.title || 'Visual'}</CardTitle>
                    <CardDescription className="text-xs">{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // ── KPI ────────────────────────────────────────────────────────────────────
    if (visual.type === 'kpi') {
        const col = metricCol ?? '';
        const val = aggregateMetric(chartData, col, visual.encodings?.kpiAggregation);
        const trendCol = visual.encodings?.trendCol;
        const trendVal = trendCol ? aggregateMetric(chartData, trendCol, visual.encodings?.kpiAggregation) : undefined;
        const diff = (trendVal !== undefined && Number.isFinite(trendVal) && Number.isFinite(val)) ? val - trendVal : undefined;
        return (
            <Card className="h-full group">
                <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{visual.title || 'KPI'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold tracking-tight text-foreground">
                        {Number.isFinite(val) ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
                    </div>
                    {diff !== undefined && (
                        <div className={`flex items-center gap-1 text-sm mt-1 font-medium ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {diff > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : diff < 0 ? <ArrowDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                            <span>{Math.abs(diff).toFixed(2)}</span>
                            <span className="text-muted-foreground font-normal text-xs">vs prev</span>
                        </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">{col.replace(/_/g, ' ')} · {visual.encodings?.kpiAggregation ?? 'avg'}</p>
                </CardContent>
            </Card>
        );
    }

    // ── GAUGE ──────────────────────────────────────────────────────────────────
    if (visual.type === 'gauge') {
        const col = metricCol ?? '';
        const val = aggregateMetric(chartData, col, visual.encodings?.kpiAggregation);
        const v = Number.isFinite(val) ? val : 0;
        const pct = Math.min(100, Math.max(0, v));
        const color = pct >= 70 ? 'text-green-500' : pct >= 40 ? 'text-amber-500' : 'text-red-500';
        return (
            <Card className="h-full">
                <CardHeader className="pb-1">
                    <CardTitle className="text-sm">{visual.title || 'Gauge'}</CardTitle>
                    {visual.subtitle && <CardDescription className="text-xs">{visual.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className={`text-3xl font-bold ${color}`}>{v.toFixed(1)}{col.includes('rate') || col.includes('pct') || col.includes('percent') ? '%' : ''}</div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-[10px] text-muted-foreground">{col.replace(/_/g, ' ')}</p>
                </CardContent>
            </Card>
        );
    }

    // ── TABLE / MATRIX ─────────────────────────────────────────────────────────
    if (visual.type === 'table' || visual.type === 'matrix') {
        return (
            <Card className="h-full overflow-hidden flex flex-col">
                <CardHeader className="pb-2 shrink-0">
                    <CardTitle className="text-sm">{visual.title || (visual.type === 'matrix' ? 'Matrix' : 'Table')}</CardTitle>
                    {visual.subtitle && <CardDescription className="text-xs">{visual.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1 overflow-auto text-xs p-0">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                            {table.getHeaderGroups().map((hg) => (
                                <tr key={hg.id}>
                                    {hg.headers.map((h) => (
                                        <th
                                            key={h.id}
                                            className="border-b p-2 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap"
                                            onClick={h.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-1">
                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                                {h.column.getIsSorted() === 'asc' && <ArrowUp className="h-3 w-3" />}
                                                {h.column.getIsSorted() === 'desc' && <ArrowDown className="h-3 w-3" />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row, ri) => (
                                <tr key={row.id} className={`border-b border-muted/40 transition-colors hover:bg-muted/30 ${ri % 2 === 0 ? '' : 'bg-muted/10'}`}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="p-2 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && (
                                <tr>
                                    <td colSpan={tableDisplay.columns.length} className="py-8 text-center text-muted-foreground">
                                        No data for this filter set.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        );
    }

    // ── SCATTER ────────────────────────────────────────────────────────────────
    if (visual.type === 'scatter') {
        const sx = visual.encodings?.x ?? data?.columns[0];
        const sy = visual.encodings?.y ?? data?.columns[1];
        const xNum = sx && kindOfColumn(visual.datasetId, gb, sx) === 'number';
        const yNum = sy && kindOfColumn(visual.datasetId, gb, sy) === 'number';
        if (!sx || !sy || !xNum || !yNum) return <EmptyCard visual={visual} message="Pick two numeric columns for X and Y in the inspector." />;
        if (!chartData.length) return <EmptyCard visual={visual} message="No rows for this filter." />;
        const scData = chartData.map((r) => ({ ...r, [sx]: Number(r[sx]) || 0, [sy]: Number(r[sy]) || 0 }));
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 shrink-0">
                    <CardTitle className="text-sm">{visual.title || 'Scatter'}</CardTitle>
                    {visual.subtitle && <CardDescription className="text-xs">{visual.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis type="number" dataKey={sx} name={sx} tick={{ fontSize: 10 }} />
                            <YAxis type="number" dataKey={sy} name={sy} tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Scatter data={scData as Record<string, unknown>[]} fill={colors[0]} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    }

    // ── RADAR ──────────────────────────────────────────────────────────────────
    if (visual.type === 'radar') {
        const catKey = visual.encodings?.category ?? data?.columns[0];
        const metrics = visual.encodings?.radarMetrics ?? (data?.columns.filter((c) => c !== catKey).slice(0, 5) ?? []);
        if (!catKey || !metrics.length || !chartData.length) return <EmptyCard visual={visual} message="Configure category and metrics in the inspector." />;
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 shrink-0">
                    <CardTitle className="text-sm">{visual.title || 'Radar'}</CardTitle>
                    {visual.subtitle && <CardDescription className="text-xs">{visual.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={chartData as Record<string, unknown>[]}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey={catKey} tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis tick={{ fontSize: 9 }} />
                            {metrics.map((m, i) => (
                                <Radar key={m} name={m} dataKey={m} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} />
                            ))}
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    }

    // ── PIE / DONUT ────────────────────────────────────────────────────────────
    if (visual.type === 'pie' || visual.type === 'donut') {
        const pk = pieCategoryKey;
        const vk = pieValueKey;
        if (!pk || !vk || !chartData.length) return <EmptyCard visual={visual} message="No rows for this filter." />;
        const pieData = chartData.map((r) => ({
            name: String(r[pk as string] ?? ''),
            value: Number(r[vk as string]) || 0,
        }));
        const innerRadius = visual.type === 'donut' ? '55%' : 0;
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 shrink-0">
                    <CardTitle className="text-sm">{visual.title || (visual.type === 'donut' ? 'Donut' : 'Pie')}</CardTitle>
                    {visual.subtitle && <CardDescription className="text-xs">{visual.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius="75%"
                                innerRadius={innerRadius}
                            >
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={colors[i % colors.length]} />
                                ))}
                                {showLabels && <LabelList dataKey="name" position="outside" style={{ fontSize: 10 }} />}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    }

    // ── NO DATA FALLBACK ───────────────────────────────────────────────────────
    if (!xKey || !yKey || !chartData.length) {
        return <EmptyCard visual={visual} message="No rows for this filter set." />;
    }

    const lineBarData = chartData.map((r) => ({
        ...r,
        [xKey as string]: String(r[xKey as string] ?? ''),
        [yKey as string]: Number(r[yKey as string]) || 0,
    }));

    // ── LINE / AREA ────────────────────────────────────────────────────────────
    if (visual.type === 'line' || visual.type === 'area') {
        const Chart = visual.type === 'area' ? AreaChart : LineChart;
        const Ser = visual.type === 'area' ? Area : Line;
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 shrink-0">
                    <CardTitle className="text-sm">{visual.title || visual.type}</CardTitle>
                    {visual.subtitle && <CardDescription className="text-xs">{visual.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <Chart data={lineBarData as Record<string, unknown>[]}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey={xKey as string} tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Ser
                                type="monotone"
                                dataKey={yKey as string}
                                stroke={colors[0]}
                                fill={colors[0]}
                                fillOpacity={visual.type === 'area' ? 0.2 : undefined}
                                strokeWidth={2}
                                dot={false}
                            >
                                {showLabels && <LabelList dataKey={yKey as string} position="top" style={{ fontSize: 9 }} />}
                            </Ser>
                        </Chart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    }

    // ── BAR (default) ─────────────────────────────────────────────────────────
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 shrink-0">
                <CardTitle className="text-sm">{visual.title || 'Bar'}</CardTitle>
                {visual.subtitle && <CardDescription className="text-xs">{visual.subtitle}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lineBarData as Record<string, unknown>[]}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey={xKey as string} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey={yKey as string} radius={[3, 3, 0, 0]}>
                            {lineBarData.map((_, i) => (
                                <Cell key={i} fill={colors[i % colors.length]} />
                            ))}
                            {showLabels && <LabelList dataKey={yKey as string} position="top" style={{ fontSize: 9 }} />}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
