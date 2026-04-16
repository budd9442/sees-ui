'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from 'recharts';
import {
    BarChart3,
    TrendingUp,
    Download,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportTabularData } from '@/lib/export';

type ModuleData = {
    id: string;
    title: string;
    code: string;
    academicYear: string;
    semester: string;
    grades: any[];
    registrations: any[];
};

type FilterYear = {
    academic_year_id: string;
    label: string;
    semesters: { semester_id: string; label: string }[];
};

export default function AnalyticsClient({
    initialModules,
    filterYears,
    initialAcademicYearId = 'all',
    initialSemesterId = 'all',
}: {
    initialModules: ModuleData[];
    filterYears: FilterYear[];
    initialAcademicYearId?: string;
    initialSemesterId?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [selectedModule, setSelectedModule] = useState<string>('');

    const staffModules = initialModules;

    const semestersForYear = useMemo(() => {
        if (initialAcademicYearId === 'all') {
            return filterYears.flatMap((y) =>
                y.semesters.map((s) => ({
                    ...s,
                    yearLabel: y.label,
                    academic_year_id: y.academic_year_id,
                }))
            );
        }
        const y = filterYears.find((x) => x.academic_year_id === initialAcademicYearId);
        return y
            ? y.semesters.map((s) => ({
                  ...s,
                  yearLabel: y.label,
                  academic_year_id: y.academic_year_id,
              }))
            : [];
    }, [filterYears, initialAcademicYearId]);

    const pushFilters = (year: string, semester: string) => {
        const p = new URLSearchParams();
        if (year !== 'all') p.set('year', year);
        if (semester !== 'all') p.set('semester', semester);
        const q = p.toString();
        router.push(q ? `${pathname}?${q}` : pathname);
    };
    const currentModule = staffModules.find(m => m.id === selectedModule);

    const getAnalyticsData = () => {
        if (!selectedModule || !currentModule) return null;

        const moduleGrades = currentModule.grades;
        const enrolledStudents = currentModule.registrations;

        const gradedStudents = moduleGrades;
        const totalStudents = enrolledStudents.length;
        const avgGrade = gradedStudents.length > 0
            ? gradedStudents.reduce((sum, g) => sum + g.points, 0) / gradedStudents.length
            : 0;

        const passRate = gradedStudents.length > 0
            ? (gradedStudents.filter(g => g.points >= 2.0).length / gradedStudents.length) * 100
            : 0;

        const gradeDistribution = ['A', 'B', 'C', 'D', 'F'].map(grade => ({
            grade,
            count: gradedStudents.filter(g => g.letterGrade === grade).length,
            percentage: gradedStudents.length > 0
                ? (gradedStudents.filter(g => g.letterGrade === grade).length / gradedStudents.length) * 100
                : 0,
        }));

        const pathwayPerformance = moduleGrades.reduce((acc, grade) => {
            const specialization = grade.studentPathway || 'Unknown';
            if (!acc[specialization]) {
                acc[specialization] = { total: 0, sum: 0, count: 0 };
            }
            acc[specialization].total += grade.points;
            acc[specialization].sum += grade.points;
            acc[specialization].count += 1;
            return acc;
        }, {} as Record<string, { total: number; sum: number; count: number }>);

        const pathwayData = Object.entries(pathwayPerformance).map(([pathway, data]: [string, any]) => ({
            pathway,
            average: data.count > 0 ? data.sum / data.count : 0,
            students: data.count,
        }));

        const academicYearPerformance = moduleGrades.reduce((acc, grade) => {
            const year = grade.studentYear || 'L1';
            if (!acc[year]) {
                acc[year] = { total: 0, sum: 0, count: 0 };
            }
            acc[year].total += grade.points;
            acc[year].sum += grade.points;
            acc[year].count += 1;
            return acc;
        }, {} as Record<string, { total: number; sum: number; count: number }>);

        const yearData = Object.entries(academicYearPerformance).map(([year, data]: [string, any]) => ({
            year,
            average: data.count > 0 ? data.sum / data.count : 0,
            students: data.count,
        }));

        return {
            totalStudents,
            gradedStudents: gradedStudents.length,
            avgGrade,
            passRate,
            gradeDistribution,
            pathwayData,
            yearData,
        };
    };

    const analyticsData = getAnalyticsData();

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const exportAnalytics = async () => {
        if (!analyticsData || !currentModule) {
            toast.error('Select a module to export analytics');
            return;
        }
        try {
            const rows = analyticsData.gradeDistribution.map((item) => ({
                moduleCode: currentModule.code,
                moduleTitle: currentModule.title,
                grade: item.grade,
                count: item.count,
                percentage: item.percentage.toFixed(1),
                averageGrade: analyticsData.avgGrade.toFixed(2),
                passRate: analyticsData.passRate.toFixed(1),
            }));
            await exportTabularData(rows, 'excel', { filename: `module-analytics-${currentModule.code}-${Date.now()}` });
            toast.success('Analytics report exported as Excel');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to export analytics');
        }
    };

    const builderParams = new URLSearchParams();
    if (initialAcademicYearId !== 'all') builderParams.set('year', initialAcademicYearId);
    if (initialSemesterId !== 'all') builderParams.set('semester', initialSemesterId);
    const builderHref = `/dashboard/staff/analytics/builder${builderParams.toString() ? `?${builderParams.toString()}` : ''}`;

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium">Report builder</p>
                        <p className="text-xs text-muted-foreground">
                            Full-page canvas: add visuals, map fields, save reports. Current filters carry over.
                        </p>
                    </div>
                    <Button variant="default" size="sm" asChild>
                        <Link href={builderHref}>Open report builder</Link>
                    </Button>
                </CardContent>
            </Card>
            <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Module Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Performance statistics and insights for your modules
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportAnalytics}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Module</CardTitle>
                    <CardDescription>
                        Choose a module to view detailed analytics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="module">Module</Label>
                            <Select value={selectedModule} onValueChange={setSelectedModule}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a module" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staffModules.map((module) => (
                                        <SelectItem key={module.id} value={module.id}>
                                            {module.title} - {module.academicYear} {module.semester}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Academic year</Label>
                            <Select
                                value={initialAcademicYearId}
                                onValueChange={(y) => pushFilters(y, 'all')}
                            >
                                <SelectTrigger id="year">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All years</SelectItem>
                                    {filterYears.map((y) => (
                                        <SelectItem key={y.academic_year_id} value={y.academic_year_id}>
                                            {y.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="semester">Semester</Label>
                            <Select
                                value={initialSemesterId}
                                onValueChange={(s) => pushFilters(initialAcademicYearId, s)}
                                disabled={initialAcademicYearId === 'all' && semestersForYear.length === 0}
                            >
                                <SelectTrigger id="semester">
                                    <SelectValue placeholder="All semesters" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All semesters</SelectItem>
                                    {semestersForYear.map((s) => (
                                        <SelectItem key={s.semester_id} value={s.semester_id}>
                                            {s.yearLabel ? `${s.yearLabel} · ` : ''}
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedModule && currentModule && analyticsData && (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analyticsData.totalStudents}</div>
                                <p className="text-xs text-muted-foreground">Enrolled</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analyticsData.avgGrade.toFixed(1)}</div>
                                <p className="text-xs text-muted-foreground">Grade points</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analyticsData.passRate.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">Students passed</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Graded Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analyticsData.gradedStudents}</div>
                                <p className="text-xs text-muted-foreground">Out of {analyticsData.totalStudents}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="distribution">Grade Distribution</TabsTrigger>
                            <TabsTrigger value="pathway">By Pathway</TabsTrigger>
                            <TabsTrigger value="year">By Academic Year</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Grade Distribution</CardTitle>
                                        <CardDescription>
                                            Distribution of grades across all students
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={analyticsData.gradeDistribution}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="grade" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Grade Distribution (Pie)</CardTitle>
                                        <CardDescription>
                                            Percentage breakdown by grade
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={analyticsData.gradeDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ grade, percentage }) => `${grade}: ${(percentage as number).toFixed(1)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                >
                                                    {analyticsData.gradeDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="distribution" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Grade Distribution</CardTitle>
                                    <CardDescription>
                                        Comprehensive breakdown of student performance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analyticsData.gradeDistribution.map((item) => (
                                            <div key={item.grade} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Grade {item.grade}</span>
                                                    <span>{item.count} students ({item.percentage.toFixed(1)}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${item.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pathway" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance by Pathway</CardTitle>
                                    <CardDescription>
                                        Average grades across different academic pathways
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analyticsData.pathwayData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="pathway" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="average" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="year" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance by Academic Year</CardTitle>
                                    <CardDescription>
                                        Average grades across different academic years
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={analyticsData.yearData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="average" stroke="#8884d8" fill="#8884d8" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}

            {!selectedModule && (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">Select a Module</h3>
                            <p className="text-muted-foreground">
                                Choose a module from the dropdown above to view detailed analytics and performance insights.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
            </div>
        </div>
    );
}
