'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
    Scatter,
    ScatterChart,
} from 'recharts';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { runAnalyticsQueryAction } from '@/lib/actions/analytics-actions';
import type { AnalyticsQueryResult } from '@/lib/analytics/execute-analytics-query';
import type { VisualSpec } from '@/lib/analytics/schema';
import type { AnalyticsQueryFilters } from '@/lib/analytics/schema';
import type { KpiAggregation } from '@/lib/analytics/schema';
import { kindOfColumn } from '@/lib/analytics/builder-metadata';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

type Props = {
    visual: VisualSpec;
    filterContext?: AnalyticsQueryFilters;
};

function aggregateMetric(
    rows: Record<string, unknown>[],
    col: string,
    agg: KpiAggregation | undefined
): number {
    const nums = rows.map((r) => Number(r[col])).filter((n) => Number.isFinite(n));
    if (!nums.length) return NaN;
    const a = agg ?? 'first';
    if (a === 'first') return nums[0]!;
    if (a === 'sum') return nums.reduce((s, n) => s + n, 0);
    if (a === 'avg') return nums.reduce((s, n) => s + n, 0) / nums.length;
    if (a === 'min') return Math.min(...nums);
    if (a === 'max') return Math.max(...nums);
    return nums[0]!;
}

function buildPivot(
    rows: Record<string, unknown>[],
    rowField: string,
    colField: string,
    valField: string
): { columns: string[]; rows: Record<string, unknown>[] } {
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
            const sum = grid.get(`${rk}||${ck}`);
            o[ck] = sum === undefined ? '' : sum;
        }
        return o;
    });
    return { columns: [rowField, ...colArr], rows: outRows };
}

function pivotEncodingValid(e: VisualSpec['encodings']): e is NonNullable<typeof e> & {
    pivotRow: string;
    pivotCol: string;
    pivotValue: string;
} {
    if (!e?.pivotRow || !e.pivotCol || !e.pivotValue) return false;
    return new Set([e.pivotRow, e.pivotCol, e.pivotValue]).size === 3;
}

export function VisualRenderer({ visual, filterContext }: Props) {
    const [data, setData] = useState<AnalyticsQueryResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setError(null);
        runAnalyticsQueryAction({
            datasetId: visual.datasetId,
            filters: { ...filterContext, ...visual.filters },
            groupBy: visual.groupBy ?? 'none',
        })
            .then((r) => {
                if (!cancelled) setData(r);
            })
            .catch((e: Error) => {
                if (!cancelled) setError(e.message || 'Failed to load');
            });
        return () => {
            cancelled = true;
        };
    }, [visual, filterContext]);

    const chartData = useMemo(() => data?.rows ?? [], [data]);

    const gb = visual.groupBy ?? 'none';

    const xKey =
        visual.encodings?.x ??
        visual.encodings?.category ??
        (visual.type === 'pie' ? undefined : data?.columns[0]) ??
        data?.columns[0];
    const yKey =
        visual.encodings?.y ??
        visual.encodings?.value ??
        (visual.type === 'pie' ? undefined : data?.columns[1]) ??
        data?.columns[1];

    const pieCategoryKey = visual.encodings?.category ?? visual.encodings?.x ?? data?.columns[0];
    const pieValueKey = visual.encodings?.value ?? visual.encodings?.y ?? data?.columns[1];

    const metricCol =
        visual.encodings?.metric ??
        visual.encodings?.value ??
        visual.encodings?.y ??
        (data?.columns.find((c) => chartData[0] && typeof chartData[0][c] === 'number') ?? data?.columns[1]);

    const tableDisplay = useMemo(() => {
        if (!data?.columns.length) return { columns: [] as string[], rows: [] as Record<string, unknown>[] };
        const raw = chartData;
        if (visual.type === 'matrix' && pivotEncodingValid(visual.encodings)) {
            return buildPivot(raw, visual.encodings.pivotRow, visual.encodings.pivotCol, visual.encodings.pivotValue);
        }
        const tc = visual.encodings?.tableColumns?.filter((c) => data.columns.includes(c));
        const cols = tc?.length ? tc : data.columns;
        return { columns: cols, rows: raw };
    }, [data, chartData, visual.type, visual.encodings]);

    const tableColumns = useMemo<ColumnDef<Record<string, unknown>, unknown>[]>(() => {
        return tableDisplay.columns.map((c) => ({
            accessorKey: c,
            header: c,
        }));
    }, [tableDisplay.columns]);

    const table = useReactTable({
        data: tableDisplay.rows,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (error) {
        return (
            <Card className="h-full border-destructive/40">
                <CardHeader>
                    <CardTitle className="text-sm text-destructive">{visual.title || 'Visual'}</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className="h-full">
                <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                    Loading…
                </CardContent>
            </Card>
        );
    }

    if (visual.type === 'kpi') {
        const col = metricCol ?? '';
        const val = aggregateMetric(chartData, col, visual.encodings?.kpiAggregation);
        return (
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{visual.title || 'KPI'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{Number.isFinite(val) ? val.toFixed(2) : '—'}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {col} ({visual.encodings?.kpiAggregation ?? 'first'})
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (visual.type === 'gauge') {
        const col = metricCol ?? '';
        const val = aggregateMetric(chartData, col, visual.encodings?.kpiAggregation);
        const v = Number.isFinite(val) ? val : 0;
        return (
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{visual.title || 'Gauge'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-semibold mb-2">{v.toFixed(1)}%</div>
                    <Progress value={Math.min(100, Math.max(0, v))} />
                </CardContent>
            </Card>
        );
    }

    if (visual.type === 'table' || visual.type === 'matrix') {
        return (
            <Card className="h-full overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{visual.title || (visual.type === 'matrix' ? 'Matrix' : 'Table')}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto text-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            {table.getHeaderGroups().map((hg) => (
                                <tr key={hg.id}>
                                    {hg.headers.map((h) => (
                                        <th key={h.id} className="border-b p-2 text-left font-medium">
                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="border-b border-muted/50">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="p-2">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        );
    }

    if (visual.type === 'scatter') {
        const sx = visual.encodings?.x ?? data.columns[0];
        const sy = visual.encodings?.y ?? data.columns[1];
        const xNum = sx && kindOfColumn(visual.datasetId, gb, sx) === 'number';
        const yNum = sy && kindOfColumn(visual.datasetId, gb, sy) === 'number';
        if (!sx || !sy || !xNum || !yNum) {
            return (
                <Card className="h-full border-amber-500/40">
                    <CardHeader>
                        <CardTitle className="text-sm">{visual.title || 'Scatter'}</CardTitle>
                        <CardDescription>
                            Pick two numeric columns for X and Y in the inspector.
                        </CardDescription>
                    </CardHeader>
                </Card>
            );
        }
        if (chartData.length === 0) {
            return (
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-sm">{visual.title || 'Scatter'}</CardTitle>
                        <CardDescription>No rows for this visual.</CardDescription>
                    </CardHeader>
                </Card>
            );
        }
        const cartData = chartData.map((r) => ({
            ...r,
            [sx]: Number(r[sx]) || 0,
            [sy]: Number(r[sy]) || 0,
        }));
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{visual.title || 'Scatter'}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey={sx} name={sx} />
                            <YAxis type="number" dataKey={sy} name={sy} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter data={cartData as Record<string, unknown>[]} fill="#8884d8" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    }

    if (visual.type === 'pie') {
        const pk = pieCategoryKey;
        const vk = pieValueKey;
        if (!pk || !vk || chartData.length === 0) {
            return (
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-sm">{visual.title || 'Pie'}</CardTitle>
                        <CardDescription>No rows for this visual.</CardDescription>
                    </CardHeader>
                </Card>
            );
        }
        const cartData = chartData.map((r) => ({
            ...r,
            [pk as string]: String(r[pk as string] ?? ''),
            [vk as string]: Number(r[vk as string]) || 0,
        }));
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{visual.title || 'Pie'}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={cartData as Record<string, unknown>[]}
                                dataKey={vk as string}
                                nameKey={pk as string}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {cartData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    }

    if (!xKey || !yKey || chartData.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-sm">{visual.title || visual.type}</CardTitle>
                    <CardDescription>No rows for this visual.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const cartData = chartData.map((r) => ({
        ...r,
        [xKey as string]: String(r[xKey as string] ?? ''),
        [yKey as string]: Number(r[yKey as string]) || 0,
    }));

    if (visual.type === 'line' || visual.type === 'area') {
        const Chart = visual.type === 'area' ? AreaChart : LineChart;
        const Ser = visual.type === 'area' ? Area : Line;
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{visual.title || visual.type}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <Chart data={cartData as Record<string, unknown>[]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xKey as string} />
                            <YAxis />
                            <Tooltip />
                            <Ser
                                type="monotone"
                                dataKey={yKey as string}
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={visual.type === 'area' ? 0.25 : undefined}
                            />
                        </Chart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{visual.title || 'Bar'}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cartData as Record<string, unknown>[]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey as string} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey={yKey as string} fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
