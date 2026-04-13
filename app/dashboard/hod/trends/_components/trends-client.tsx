'use client';

import React, { useMemo } from 'react';
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell 
} from 'recharts';
import { 
    TrendingUp, Users, Award, Calendar, ChevronRight, 
    Filter, ArrowUpRight, ArrowDownRight, Activity 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HODTrendsClientProps {
    initialData: {
        history: any[];
    };
}

export default function HODTrendsClient({ initialData }: HODTrendsClientProps) {
    // Process history data for the chart
    const trendData = useMemo(() => {
        if (!initialData.history || initialData.history.length === 0) return [];
        
        // Group by month/year and calculate average GPA
        const grouped = initialData.history.reduce((acc: any, curr: any) => {
            const date = new Date(curr.calculation_date);
            const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            
            if (!acc[key]) {
                acc[key] = { name: key, totalGPA: 0, count: 0, timestamp: date.getTime() };
            }
            
            acc[key].totalGPA += curr.gpa;
            acc[key].count += 1;
            return acc;
        }, {});

        return Object.values(grouped)
            .sort((a: any, b: any) => a.timestamp - b.timestamp)
            .map((item: any) => ({
                name: item.name,
                avgGPA: parseFloat((item.totalGPA / item.count).toFixed(2))
            }));
    }, [initialData.history]);

    // Calculate distributions
    const distributionData = useMemo(() => {
        const ranges = [
            { name: '< 2.0', count: 0, color: '#ef4444' },
            { name: '2.0 - 2.5', count: 0, color: '#f97316' },
            { name: '2.5 - 3.0', count: 0, color: '#eab308' },
            { name: '3.0 - 3.5', count: 0, color: '#22c55e' },
            { name: '3.5 - 4.0', count: 0, color: '#3b82f6' }
        ];

        initialData.history.forEach(h => {
            if (h.gpa < 2.0) ranges[0].count++;
            else if (h.gpa < 2.5) ranges[1].count++;
            else if (h.gpa < 3.0) ranges[2].count++;
            else if (h.gpa < 3.5) ranges[3].count++;
            else ranges[4].count++;
        });

        return ranges;
    }, [initialData.history]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section with glassmorphism */}
            <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Trend Analysis</h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Longitudinal academic performance tracking for your department. Monitor GPA variations, batch progress, and distribution trends.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase tracking-tighter text-[10px]">
                            <Calendar className="mr-2 h-3.5 w-3.5" />
                            Global Session
                        </Button>
                        <Button size="sm" className="rounded-xl font-bold uppercase tracking-tighter text-[10px] shadow-lg shadow-primary/20">
                            <Filter className="mr-2 h-3.5 w-3.5" />
                            Refine Data
                        </Button>
                    </div>
                </div>
                
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-none shadow-xl shadow-muted/20 overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase tracking-widest text-[10px] font-black flex items-center gap-2">
                            <Activity className="h-3 w-3 text-primary" />
                            Performance Delta
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black">+4.2%</span>
                            <Badge className="mb-1.5 bg-green-500/10 text-green-600 border-none rounded-lg px-2 py-0.5 text-[10px] uppercase font-black">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                Optimal
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">Growth compared to previous semester</p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-xl shadow-muted/20 overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase tracking-widest text-[10px] font-black flex items-center gap-2">
                            <Award className="h-3 w-3 text-amber-500" />
                            High Achievers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black">28%</span>
                            <span className="mb-2 text-xs font-bold text-muted-foreground">of Dept.</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">Students with GPA {'>'} 3.5</p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-xl shadow-muted/20 overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase tracking-widest text-[10px] font-black flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-blue-500" />
                            Target Baseline
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black">3.12</span>
                            <Badge className="mb-1.5 bg-blue-500/10 text-blue-600 border-none rounded-lg px-2 py-0.5 text-[10px] uppercase font-black">
                                Steady
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">Maintained departmental average</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Trend Chart */}
                <Card className="rounded-3xl border-none shadow-2xl shadow-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            Academic Performance Timeline
                        </CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-tight">Average GPA drift over the last 12 months</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorGPA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 700}} 
                                    dy={10}
                                />
                                <YAxis 
                                    domain={[2.0, 4.0]} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 700}} 
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
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
                    </CardContent>
                </Card>

                {/* Performance Distribution */}
                <Card className="rounded-3xl border-none shadow-2xl shadow-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg font-black">Student Distribution</CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-tight">GPA segment allocation for all departmental cohorts</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 700}} 
                                />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
