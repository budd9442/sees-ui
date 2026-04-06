'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    PieChart,
    LineChart,
    BarChart,
    Pie,
    Line,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Download } from 'lucide-react';

export default function HODAnalyticsClient({ initialData }: { initialData: any }) {
    const { students, modules, grades } = initialData;
    const [selectedPeriod, setSelectedPeriod] = useState('current');
    const [selectedPathway, setSelectedPathway] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');

    const totalStudents = students.length;
    const totalModules = modules.length;
    const averageGPA = students.reduce((sum: number, s: any) => sum + s.currentGPA, 0) / (totalStudents || 1);
    const atRiskStudents = students.filter((s: any) => s.currentGPA < 2.5).length;
    const excellentStudents = students.filter((s: any) => s.currentGPA >= 3.7).length;

    const pathwayDistribution = students.reduce((acc: any, student: any) => {
        const pathway = student.specialization || 'Undecided';
        acc[pathway] = (acc[pathway] || 0) + 1;
        return acc;
    }, {});

    const pathwayData = Object.keys(pathwayDistribution).map((pathway) => ({
        pathway,
        students: pathwayDistribution[pathway],
        percentage: Math.round((pathwayDistribution[pathway] / (totalStudents || 1)) * 100),
    }));

    const yearDistribution = students.reduce((acc: any, student: any) => {
        const year = student.academicYear || 'Unknown';
        acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {});

    const yearData = Object.keys(yearDistribution).map((year) => ({
        year,
        students: yearDistribution[year],
    }));

    const gpaDistribution = students.reduce((acc: any, student: any) => {
        const gpa = student.currentGPA;
        let range = '';
        if (gpa >= 3.7) range = 'Excellent (3.7+)';
        else if (gpa >= 3.0) range = 'Good (3.0-3.69)';
        else if (gpa >= 2.5) range = 'Satisfactory (2.5-2.99)';
        else range = 'At Risk (<2.5)';

        acc[range] = (acc[range] || 0) + 1;
        return acc;
    }, {});

    const gpaData = Object.keys(gpaDistribution).map((range) => ({
        range,
        students: gpaDistribution[range],
        percentage: Math.round((gpaDistribution[range] / (totalStudents || 1)) * 100),
    }));

    const modulePerformance = modules.map((module: any) => {
        const moduleGrades = grades.filter((g: any) => g.moduleId === module.id && g.isReleased);
        const averageGrade = moduleGrades.length > 0
            ? moduleGrades.reduce((sum: number, g: any) => sum + g.points, 0) / moduleGrades.length
            : 0;
        const passRate = moduleGrades.length > 0
            ? (moduleGrades.filter((g: any) => g.points >= 2.0).length / moduleGrades.length) * 100
            : 0;

        return {
            module: module.title,
            code: module.code,
            averageGrade: averageGrade.toFixed(2),
            passRate: passRate.toFixed(1),
            students: moduleGrades.length,
        };
    }).sort((a: any, b: any) => parseFloat(b.averageGrade) - parseFloat(a.averageGrade));

    const enrollmentTrend = [
        { year: '2020', students: 120 },
        { year: '2021', students: 135 },
        { year: '2022', students: 142 },
        { year: '2023', students: 158 },
        { year: '2025', students: totalStudents },
    ];

    const gpaTrend = [
        { semester: 'S1 2023', averageGPA: 3.1 },
        { semester: 'S2 2023', averageGPA: 3.2 },
        { semester: 'S1 2025', averageGPA: 3.15 },
        { semester: 'S2 2025', averageGPA: averageGPA },
    ];

    const pathwayPerformance = Object.keys(pathwayDistribution).map(pathway => {
        const pathwayStudents = students.filter((s: any) => s.specialization === pathway);
        const avgGPA = pathwayStudents.length > 0
            ? pathwayStudents.reduce((sum: number, s: any) => sum + s.currentGPA, 0) / pathwayStudents.length
            : 0;
        const atRisk = pathwayStudents.filter((s: any) => s.currentGPA < 2.5).length;

        return {
            pathway,
            students: pathwayStudents.length,
            averageGPA: avgGPA.toFixed(2),
            atRisk,
            retentionRate: pathwayStudents.length > 0 ? ((pathwayStudents.length - atRisk) / pathwayStudents.length * 100).toFixed(1) : "0.0",
        };
    });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const exportAnalytics = () => {
        console.log('Exporting analytics data...');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Department Analytics</h1>
                    <p className="text-muted-foreground mt-1">Comprehensive insights into department performance and trends</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportAnalytics}><Download className="mr-2 h-4 w-4" /> Export Report</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalStudents}</div><p className="text-xs text-muted-foreground">Active enrollment</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Average GPA</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{averageGPA.toFixed(2)}</div><Progress value={(averageGPA / 4) * 100} className="mt-2 h-1" /></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">At Risk</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{atRiskStudents}</div><p className="text-xs text-muted-foreground">{totalStudents ? ((atRiskStudents / totalStudents) * 100).toFixed(1) : 0}% of students</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Excellent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{excellentStudents}</div><p className="text-xs text-muted-foreground">{totalStudents ? ((excellentStudents / totalStudents) * 100).toFixed(1) : 0}% of students</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Modules</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalModules}</div><p className="text-xs text-muted-foreground">Active modules</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="period">Time Period</Label>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="current">Current Semester</SelectItem><SelectItem value="year">Academic Year</SelectItem><SelectItem value="all">All Time</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pathway">Pathway</Label>
                            <Select value={selectedPathway} onValueChange={setSelectedPathway}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Pathways</SelectItem>
                                    {Object.keys(pathwayDistribution).map(pathway => <SelectItem key={pathway} value={pathway}>{pathway}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Academic Year</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="all">All Years</SelectItem><SelectItem value="L1">L1</SelectItem><SelectItem value="L2">L2</SelectItem><SelectItem value="L3">L3</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="pathways">Pathways</TabsTrigger><TabsTrigger value="performance">Performance</TabsTrigger><TabsTrigger value="trends">Trends</TabsTrigger><TabsTrigger value="modules">Modules</TabsTrigger></TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card><CardHeader><CardTitle>Student Distribution by Pathway</CardTitle><CardDescription>Current enrollment</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={pathwayData} cx="50%" cy="50%" labelLine={false} label={({ pathway, percentage }) => `${pathway}: ${percentage}%`} outerRadius={80} fill="#8884d8" dataKey="students">{pathwayData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle>GPA Distribution</CardTitle><CardDescription>Academic performance breakdown</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={gpaData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="range" /><YAxis /><Tooltip /><Bar dataKey="students" fill="#8884d8" /></BarChart></ResponsiveContainer></CardContent></Card>
                    </div>
                    <Card><CardHeader><CardTitle>Enrollment by Academic Year</CardTitle><CardDescription>Student distribution</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={yearData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip /><Bar dataKey="students" fill="#8884d8" /></BarChart></ResponsiveContainer></CardContent></Card>
                </TabsContent>
                <TabsContent value="pathways" className="space-y-4">
                    <Card><CardHeader><CardTitle>Pathway Performance Analysis</CardTitle><CardDescription>Detailed performance metrics by pathway</CardDescription></CardHeader><CardContent><div className="space-y-4">{pathwayPerformance.map((pathway) => (<div key={pathway.pathway} className="p-4 rounded-lg border"><div className="flex items-center justify-between mb-3"><h4 className="font-semibold">{pathway.pathway}</h4><Badge variant="outline">{pathway.students} students</Badge></div><div className="grid gap-4 md:grid-cols-4"><div><p className="text-sm text-muted-foreground">Average GPA</p><p className="text-lg font-semibold">{pathway.averageGPA}</p></div><div><p className="text-sm text-muted-foreground">At Risk</p><p className="text-lg font-semibold text-red-600">{pathway.atRisk}</p></div><div><p className="text-sm text-muted-foreground">Retention Rate</p><p className="text-lg font-semibold text-green-600">{pathway.retentionRate}%</p></div><div><Progress value={parseFloat(pathway.retentionRate)} className="h-2" /></div></div></div>))}</div></CardContent></Card>
                </TabsContent>
                <TabsContent value="performance" className="space-y-4">
                    <Card><CardHeader><CardTitle>Academic Performance Metrics</CardTitle><CardDescription>Key performance indicators</CardDescription></CardHeader><CardContent><div className="grid gap-4 md:grid-cols-3"><div className="text-center p-4 rounded-lg border"><div className="text-3xl font-bold text-green-600">{totalStudents ? ((excellentStudents / totalStudents) * 100).toFixed(1) : 0}%</div><p className="text-sm text-muted-foreground">Excellent Performance</p><p className="text-xs">GPA ≥ 3.7</p></div><div className="text-center p-4 rounded-lg border"><div className="text-3xl font-bold text-blue-600">{totalStudents ? ((students.filter((s: any) => s.currentGPA >= 3.0 && s.currentGPA < 3.7).length / totalStudents) * 100).toFixed(1) : 0}%</div><p className="text-sm text-muted-foreground">Good Performance</p><p className="text-xs">GPA 3.0-3.69</p></div><div className="text-center p-4 rounded-lg border"><div className="text-3xl font-bold text-red-600">{totalStudents ? ((atRiskStudents / totalStudents) * 100).toFixed(1) : 0}%</div><p className="text-sm text-muted-foreground">At Risk</p><p className="text-xs">GPA &lt; 2.5</p></div></div></CardContent></Card>
                </TabsContent>
                <TabsContent value="trends" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card><CardHeader><CardTitle>Enrollment Trend</CardTitle><CardDescription>Student enrollment</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={enrollmentTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip /><Line type="monotone" dataKey="students" stroke="#8884d8" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle>Average GPA Trend</CardTitle><CardDescription>GPA performance</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={gpaTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semester" /><YAxis domain={[2.5, 4]} /><Tooltip /><Line type="monotone" dataKey="averageGPA" stroke="#8884d8" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
                    </div>
                </TabsContent>
                <TabsContent value="modules" className="space-y-4">
                    <Card><CardHeader><CardTitle>Module Performance Analysis</CardTitle><CardDescription>Performance metrics across modules</CardDescription></CardHeader><CardContent><div className="space-y-4">{modulePerformance.slice(0, 10).map((module: any) => (<div key={module.code} className="flex items-center justify-between p-3 rounded-lg border"><div className="flex-1"><h4 className="font-medium">{module.module}</h4><p className="text-sm text-muted-foreground">{module.code}</p></div><div className="flex items-center gap-6"><div className="text-center"><p className="text-sm text-muted-foreground">Avg Grade</p><p className="font-semibold">{module.averageGrade}</p></div><div className="text-center"><p className="text-sm text-muted-foreground">Pass Rate</p><p className="font-semibold">{module.passRate}%</p></div><div className="text-center"><p className="text-sm text-muted-foreground">Students</p><p className="font-semibold">{module.students}</p></div></div></div>))}</div></CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
