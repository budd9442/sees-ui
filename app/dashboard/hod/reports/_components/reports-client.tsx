'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    FileText,
    Download,
    TrendingUp,
    BarChart3,
    GraduationCap,
    Award,
    AlertCircle,
    BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportTabularData } from '@/lib/export';

export default function ReportsClient({ initialData }: { initialData: any }) {
    const { students, modules, grades, academicGoals, interventions } = initialData;
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [filters, setFilters] = useState({ pathway: 'all', academicYear: 'all', specialization: 'all' });
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<any>(null);

    const reportTemplates = [
        { id: 'overall-performance', name: 'Overall Performance Summary', description: 'Comprehensive overview of department performance metrics', icon: BarChart3 },
        { id: 'pathway-demand', name: 'Pathway Demand Analysis', description: 'Analysis of pathway selection trends and capacity utilization', icon: TrendingUp },
        { id: 'academic-class-distribution', name: 'Academic Class Distribution', description: 'Distribution of students across academic classes', icon: GraduationCap },
        { id: 'module-performance', name: 'Module Performance Comparison', description: 'Performance comparison across different modules', icon: BookOpen },
        { id: 'retention-graduation', name: 'Retention & Graduation Rates', description: 'Student retention and graduation rate analysis', icon: Award },
        { id: 'at-risk-students', name: 'At-Risk Students Report', description: 'Students requiring academic intervention', icon: AlertCircle },
    ];

    const getDepartmentStats = () => {
        const totalStudents = students.length;
        const totalModules = modules.length;

        const allGrades = grades.filter((g: any) => g.isReleased);
        const totalPoints = allGrades.reduce((sum: number, grade: any) => sum + (grade.points * grade.credits), 0);
        const totalCredits = allGrades.reduce((sum: number, grade: any) => sum + grade.credits, 0);
        const avgGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

        const passRate = allGrades.length > 0
            ? (allGrades.filter((g: any) => g.points >= 2.0).length / allGrades.length) * 100
            : 0;

        const atRiskStudents = students.filter((student: any) => {
            const studentGrades = grades.filter((g: any) => g.studentId === student.id && g.isReleased);
            const studentPoints = studentGrades.reduce((sum: number, grade: any) => sum + (grade.points * grade.credits), 0);
            const studentCredits = studentGrades.reduce((sum: number, grade: any) => sum + grade.credits, 0);
            const studentGPA = studentCredits > 0 ? studentPoints / studentCredits : 0;
            return studentGPA < 2.5 || studentGrades.some((g: any) => g.points < 2.0);
        }).length;

        return { totalStudents, totalModules, avgGPA, passRate, atRiskStudents };
    };

    const getPathwayDemandData = () => {
        const pathwayCounts = students.reduce((acc: any, student: any) => {
            const specialization = student.specialization || 'Unassigned';
            acc[specialization] = (acc[specialization] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(pathwayCounts).map(([pathway, count]) => ({
            pathway, students: count as number, percentage: ((count as number) / students.length) * 100,
        }));
    };

    const getAcademicClassData = () => {
        const classCounts = students.reduce((acc: any, student: any) => {
            const studentGrades = grades.filter((g: any) => g.studentId === student.id && g.isReleased);
            const studentPoints = studentGrades.reduce((sum: number, grade: any) => sum + (grade.points * grade.credits), 0);
            const studentCredits = studentGrades.reduce((sum: number, grade: any) => sum + grade.credits, 0);
            const studentGPA = studentCredits > 0 ? studentPoints / studentCredits : 0;

            let academicClass = student.academicClass as string | undefined;
            if (!academicClass) {
                academicClass = 'Third/Pass';
                if (studentGPA >= 3.7) academicClass = 'First Class';
                else if (studentGPA >= 3.3) academicClass = 'Second Upper';
                else if (studentGPA >= 3.0) academicClass = 'Second Lower';
                else if (studentGPA >= 2.5) academicClass = 'Third/Pass';
                else academicClass = 'Pass';
            }

            acc[academicClass] = (acc[academicClass] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(classCounts).map(([academicClass, count]) => ({
            academicClass, students: count as number, percentage: ((count as number) / (students.length || 1)) * 100,
        }));
    };

    const getModulePerformanceData = () => {
        return modules.map((module: any) => {
            const moduleGrades = grades.filter((g: any) => g.moduleId === module.id && g.isReleased);
            const avgGrade = moduleGrades.length > 0
                ? moduleGrades.reduce((sum: number, g: any) => sum + g.points, 0) / moduleGrades.length
                : 0;
            const passRate = moduleGrades.length > 0
                ? (moduleGrades.filter((g: any) => g.points >= 2.0).length / moduleGrades.length) * 100
                : 0;

            return { module: module.title, code: module.code, avgGrade, passRate, enrolledStudents: moduleGrades.length };
        });
    };

    const getAtRiskStudentsData = () => {
        return students.filter((student: any) => {
            const studentGrades = grades.filter((g: any) => g.studentId === student.id && g.isReleased);
            const studentPoints = studentGrades.reduce((sum: number, grade: any) => sum + (grade.points * grade.credits), 0);
            const studentCredits = studentGrades.reduce((sum: number, grade: any) => sum + grade.credits, 0);
            const studentGPA = studentCredits > 0 ? studentPoints / studentCredits : 0;
            return studentGPA < 2.5 || studentGrades.some((g: any) => g.points < 2.0);
        }).map((student: any) => {
            const studentGrades = grades.filter((g: any) => g.studentId === student.id && g.isReleased);
            const studentPoints = studentGrades.reduce((sum: number, grade: any) => sum + (grade.points * grade.credits), 0);
            const studentCredits = studentGrades.reduce((sum: number, grade: any) => sum + grade.credits, 0);
            const studentGPA = studentCredits > 0 ? studentPoints / studentCredits : 0;
            const interventionsCount = interventions.filter((i: any) => i.studentId === student.id).length;

            return { id: student.id, name: student.name || `${student.firstName} ${student.lastName}`, academicYear: student.academicYear, pathway: student.specialization, gpa: studentGPA, interventionsCount };
        });
    };

    const generateReport = () => {
        if (!selectedTemplate) {
            toast.error('Please select a report template');
            return;
        }

        const reportData = {
            template: selectedTemplate,
            generatedAt: new Date().toISOString(),
            dateRange,
            filters,
            departmentStats: getDepartmentStats(),
            pathwayDemand: getPathwayDemandData(),
            academicClassDistribution: getAcademicClassData(),
            modulePerformance: getModulePerformanceData(),
            atRiskStudents: getAtRiskStudentsData(),
        };

        setGeneratedReport(reportData);
        setShowPreviewDialog(true);
        toast.success('Report generated successfully!');
    };

    const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
        if (!generatedReport) {
            toast.error('Generate a report first');
            return;
        }
        try {
            const rows = generatedReport.atRiskStudents?.length
                ? generatedReport.atRiskStudents.map((student: any) => ({
                    studentId: student.id,
                    name: student.name,
                    academicYear: student.academicYear,
                    pathway: student.pathway,
                    gpa: student.gpa?.toFixed?.(2) ?? student.gpa,
                    interventions: student.interventionsCount,
                }))
                : [{
                    totalStudents: generatedReport.departmentStats.totalStudents,
                    averageGPA: generatedReport.departmentStats.avgGPA.toFixed(2),
                    passRate: generatedReport.departmentStats.passRate.toFixed(1),
                    atRiskStudents: generatedReport.departmentStats.atRiskStudents,
                }];
            await exportTabularData(rows, format, {
                filename: `hod-report-${generatedReport.template}-${Date.now()}`,
                title: 'HOD Report Export',
            });
            toast.success(`Report exported as ${format.toUpperCase()}`);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to export report');
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Reports Generator</h1>
                    <p className="text-muted-foreground mt-1">Generate comprehensive reports for department analysis</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{getDepartmentStats().totalStudents}</div><p className="text-xs text-muted-foreground">Active students</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Average GPA</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{getDepartmentStats().avgGPA.toFixed(2)}</div><p className="text-xs text-muted-foreground">Department average</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Pass Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{getDepartmentStats().passRate.toFixed(1)}%</div><p className="text-xs text-muted-foreground">Overall pass rate</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">At Risk</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{getDepartmentStats().atRiskStudents}</div><p className="text-xs text-muted-foreground">Students needing support</p></CardContent></Card>
            </div>

            <Tabs defaultValue="templates" className="space-y-4">
                <TabsList><TabsTrigger value="templates">Report Templates</TabsTrigger><TabsTrigger value="analytics">Live Analytics</TabsTrigger><TabsTrigger value="archive">Report Archive</TabsTrigger></TabsList>
                <TabsContent value="templates" className="space-y-4">
                    <Card><CardHeader><CardTitle>Generate Report</CardTitle><CardDescription>Select a template and configure parameters to generate a report</CardDescription></CardHeader><CardContent><div className="space-y-6"><div className="space-y-2"><Label>Report Template</Label><div className="grid gap-3 md:grid-cols-2">{reportTemplates.map((template) => { const Icon = template.icon; return (<Card key={template.id} className={`cursor-pointer transition-colors ${selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedTemplate(template.id)}><CardHeader className="pb-3"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><Icon className="h-5 w-5 text-blue-600" /></div><div><CardTitle className="text-lg">{template.name}</CardTitle><CardDescription className="text-sm">{template.description}</CardDescription></div></div></CardHeader></Card>); })}</div></div><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} /></div></div><div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label htmlFor="pathway-filter">Pathway</Label><Select value={filters.pathway} onValueChange={(value) => setFilters({ ...filters, pathway: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Pathways</SelectItem><SelectItem value="Software Engineering">Software Engineering</SelectItem><SelectItem value="Data Science">Data Science</SelectItem><SelectItem value="Cybersecurity">Cybersecurity</SelectItem><SelectItem value="Mobile Development">Mobile Development</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="year-filter">Academic Year</Label><Select value={filters.academicYear} onValueChange={(value) => setFilters({ ...filters, academicYear: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Years</SelectItem><SelectItem value="L1">L1</SelectItem><SelectItem value="L2">L2</SelectItem><SelectItem value="L3">L3</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="specialization-filter">Specialization</Label><Select value={filters.specialization} onValueChange={(value) => setFilters({ ...filters, specialization: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Specializations</SelectItem><SelectItem value="Frontend Development">Frontend Development</SelectItem><SelectItem value="Backend Development">Backend Development</SelectItem><SelectItem value="Full-Stack Development">Full-Stack Development</SelectItem><SelectItem value="Mobile Development">Mobile Development</SelectItem></SelectContent></Select></div></div><div className="flex gap-2"><Button onClick={generateReport}><FileText className="mr-2 h-4 w-4" /> Generate Report</Button></div></div></CardContent></Card>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card><CardHeader><CardTitle>Pathway Demand</CardTitle><CardDescription>Student distribution across pathways</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={getPathwayDemandData()}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="pathway" /><YAxis /><Tooltip /><Bar dataKey="students" fill="#8884d8" /></BarChart></ResponsiveContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle>Academic Class Distribution</CardTitle><CardDescription>Distribution of students by academic class</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={getAcademicClassData()} cx="50%" cy="50%" labelLine={false} label={({ academicClass, percentage }) => `${academicClass}: ${Number(percentage).toFixed(1)}%`} outerRadius={80} fill="#8884d8" dataKey="students">{getAcademicClassData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
                    </div>
                    <Card><CardHeader><CardTitle>Module Performance Comparison</CardTitle><CardDescription>Average grades and pass rates across modules</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={400}><BarChart data={getModulePerformanceData()}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="code" /><YAxis yAxisId="left" /><YAxis yAxisId="right" orientation="right" /><Tooltip /><Bar yAxisId="left" dataKey="avgGrade" fill="#8884d8" name="Avg Grade" /><Bar yAxisId="right" dataKey="passRate" fill="#82ca9d" name="Pass Rate %" /></BarChart></ResponsiveContainer></CardContent></Card>
                </TabsContent>
                <TabsContent value="archive" className="space-y-4">
                    <Card><CardHeader><CardTitle>Report Archive</CardTitle><CardDescription>Previously generated reports</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Report Name</TableHead><TableHead>Generated Date</TableHead><TableHead>Template</TableHead><TableHead>Format</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell className="font-medium">Overall Performance Q1 2025</TableCell><TableCell>2025-01-15</TableCell><TableCell>Overall Performance Summary</TableCell><TableCell>PDF</TableCell><TableCell><div className="flex gap-1"><Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button><Button variant="outline" size="sm"><FileText className="h-4 w-4" /></Button></div></TableCell></TableRow><TableRow><TableCell className="font-medium">Pathway Analysis 2025</TableCell><TableCell>2025-01-10</TableCell><TableCell>Pathway Demand Analysis</TableCell><TableCell>Excel</TableCell><TableCell><div className="flex gap-1"><Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button><Button variant="outline" size="sm"><FileText className="h-4 w-4" /></Button></div></TableCell></TableRow></TableBody></Table></CardContent></Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Report Preview</DialogTitle><DialogDescription>Preview of the generated report</DialogDescription></DialogHeader>
                    {generatedReport && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div><h3 className="text-lg font-semibold">{reportTemplates.find(t => t.id === generatedReport.template)?.name}</h3><p className="text-sm text-muted-foreground">Generated on {new Date(generatedReport.generatedAt).toLocaleDateString()}</p></div>
                                <div className="flex gap-2"><Button variant="outline" onClick={() => exportReport('pdf')}><Download className="mr-2 h-4 w-4" /> PDF</Button><Button variant="outline" onClick={() => exportReport('excel')}><Download className="mr-2 h-4 w-4" /> Excel</Button><Button variant="outline" onClick={() => exportReport('csv')}><Download className="mr-2 h-4 w-4" /> CSV</Button></div>
                            </div>

                            {generatedReport.template === 'overall-performance' && (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{generatedReport.departmentStats.totalStudents}</div></CardContent></Card>
                                        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Average GPA</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{generatedReport.departmentStats.avgGPA.toFixed(2)}</div></CardContent></Card>
                                        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Pass Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{generatedReport.departmentStats.passRate.toFixed(1)}%</div></CardContent></Card>
                                        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">At Risk</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{generatedReport.departmentStats.atRiskStudents}</div></CardContent></Card>
                                    </div>
                                </div>
                            )}

                            {generatedReport.template === 'at-risk-students' && (
                                <div className="space-y-4">
                                    <Table><TableHeader><TableRow><TableHead>Student ID</TableHead><TableHead>Name</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway</TableHead><TableHead>GPA</TableHead><TableHead>Interventions</TableHead></TableRow></TableHeader><TableBody>{generatedReport.atRiskStudents.map((student: any) => (<TableRow key={student.id}><TableCell className="font-medium">{student.id}</TableCell><TableCell>{student.name}</TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><Badge variant="secondary">{student.pathway}</Badge></TableCell><TableCell className={student.gpa < 2.5 ? 'text-red-600 font-bold' : ''}>{student.gpa.toFixed(2)}</TableCell><TableCell>{student.interventionsCount}</TableCell></TableRow>))}</TableBody></Table>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter><Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Close</Button><Button onClick={() => exportReport('pdf')}><Download className="mr-2 h-4 w-4" /> Export Report</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
