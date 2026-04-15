'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from 'recharts';
import {
    TrendingUp,
    Award,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';

type TrendsSummary = {
    performanceDeltaPct: number;
    highAchieversPct: number;
    departmentMeanGpa: number;
    trendDirection: 'up' | 'down' | 'flat';
};

interface HODTrendsClientProps {
    initialData: {
        history: any[];
        summary: TrendsSummary;
        department: string;
        pathwayOptions: string[];
        levelOptions: string[];
    };
    initialPathway?: string;
    initialLevel?: string;
}

export default function HODTrendsClient({
    initialData,
    initialPathway = 'all',
    initialLevel = 'all',
}: HODTrendsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { history, summary, department, pathwayOptions, levelOptions } = initialData;

    const pushFilters = (pathway: string, level: string) => {
        const p = new URLSearchParams();
        if (pathway !== 'all') p.set('pathway', pathway);
        if (level !== 'all') p.set('level', level);
        const q = p.toString();
        router.push(q ? `${pathname}?${q}` : pathname);
    };

    const trendData = useMemo(() => {
        if (!history || history.length === 0) return [];

        const grouped = history.reduce(
            (acc: Record<string, { name: string; totalGPA: number; count: number; timestamp: number }>, curr: any) => {
                const date = new Date(curr.calculation_date);
                const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

                if (!acc[key]) {
                    acc[key] = { name: key, totalGPA: 0, count: 0, timestamp: date.getTime() };
                }

                acc[key].totalGPA += curr.gpa;
                acc[key].count += 1;
                return acc;
            },
            {}
        );

        return Object.values(grouped)
            .sort((a: any, b: any) => a.timestamp - b.timestamp)
            .map((item: any) => ({
                name: item.name,
                avgGPA: parseFloat((item.totalGPA / item.count).toFixed(2)),
            }));
    }, [history]);

    const distributionData = useMemo(() => {
        const ranges = [
            { name: '< 2.0', count: 0, color: '#ef4444' },
            { name: '2.0 - 2.5', count: 0, color: '#f97316' },
            { name: '2.5 - 3.0', count: 0, color: '#eab308' },
            { name: '3.0 - 3.5', count: 0, color: '#22c55e' },
            { name: '3.5 - 4.0', count: 0, color: '#3b82f6' },
        ];

        history.forEach((h: any) => {
            if (h.gpa < 2.0) ranges[0].count++;
            else if (h.gpa < 2.5) ranges[1].count++;
            else if (h.gpa < 3.0) ranges[2].count++;
            else if (h.gpa < 3.5) ranges[3].count++;
            else ranges[4].count++;
        });

        return ranges;
    }, [history]);

    const deltaLabel =
        summary.trendDirection === 'up'
            ? 'Improving'
            : summary.trendDirection === 'down'
              ? 'Declining'
              : 'Steady';
    const DeltaIcon = summary.performanceDeltaPct >= 0 ? ArrowUpRight : ArrowDownRight;

    const builderParams = new URLSearchParams();
    if (initialPathway !== 'all') builderParams.set('pathway', initialPathway);
    if (initialLevel !== 'all') builderParams.set('level', initialLevel);
    const builderHref = `/dashboard/hod/trends/builder${builderParams.toString() ? `?${builderParams.toString()}` : ''}`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card>
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium">Report builder</p>
                        <p className="text-xs text-muted-foreground">
                            Time-focused default layout on a full page. Filters carry over.
                        </p>
                    </div>
                    <Button variant="default" size="sm" asChild>
                        <Link href={builderHref}>Open report builder</Link>
                    </Button>
                </CardContent>
            </Card>
            <div className="space-y-8">
            <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Trend Analysis</h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Longitudinal academic performance for{' '}
                            <span className="font-semibold text-foreground">{department || 'your department'}</span>.
                            Monitor GPA drift and distribution from GPA history.
                        </p>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Refine data</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 max-w-xl">
                        <div className="space-y-2">
                            <Label>Pathway</Label>
                            <Select value={initialPathway} onValueChange={(v) => pushFilters(v, initialLevel)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All pathways</SelectItem>
                                    {pathwayOptions.map((p) => (
                                        <SelectItem key={p} value={p}>
                                            {p}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Level</Label>
                            <Select value={initialLevel} onValueChange={(v) => pushFilters(initialPathway, v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All levels</SelectItem>
                                    {levelOptions.map((l) => (
                                        <SelectItem key={l} value={l}>
                                            {l}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-none shadow-xl shadow-muted/20 overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase tracking-widest text-[10px] font-black flex items-center gap-2">
                            <Activity className="h-3 w-3 text-primary" />
                            Dept. mean GPA change
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black">
                                {summary.performanceDeltaPct >= 0 ? '+' : ''}
                                {summary.performanceDeltaPct}%
                            </span>
                            <Badge className="mb-1.5 bg-muted border-none rounded-lg px-2 py-0.5 text-[10px] uppercase font-black flex items-center gap-0.5">
                                <DeltaIcon className="h-3 w-3" />
                                {deltaLabel}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">
                            Last vs prior month bucket (department mean GPA)
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-xl shadow-muted/20 overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase tracking-widest text-[10px] font-black flex items-center gap-2">
                            <Award className="h-3 w-3 text-amber-500" />
                            High achievers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black">{summary.highAchieversPct}%</span>
                            <span className="mb-2 text-xs font-bold text-muted-foreground">of cohort</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">Current GPA &gt; 3.5</p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-xl shadow-muted/20 overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase tracking-widest text-[10px] font-black flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-blue-500" />
                            Cohort mean GPA
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black">{summary.departmentMeanGpa.toFixed(2)}</span>
                            <Badge className="mb-1.5 bg-blue-500/10 text-blue-600 border-none rounded-lg px-2 py-0.5 text-[10px] uppercase font-black">
                                Current
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">From student.current_gpa</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-3xl border-none shadow-2xl shadow-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            Academic performance timeline
                        </CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-tight">
                            Average GPA by month (GPA history)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        {trendData.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No GPA history for this filter.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorGPA" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[2.0, 4.0]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="avgGPA"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorGPA)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-2xl shadow-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg font-black">Snapshot distribution</CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-tight">
                            GPA history rows in selected cohort
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        {history.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No rows to chart.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distributionData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
            </div>
        </div>
    );
}
