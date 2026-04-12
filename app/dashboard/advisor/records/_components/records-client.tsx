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
import { csvUtils } from '@/lib/export';
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
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import {
    AlertTriangle,
    Search,
    Download,
    Eye,
    MessageSquare,
    Target,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RecordsClient({ initialData }: { initialData: any }) {
    const { students } = initialData;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [filterPathway, setFilterPathway] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [showStudentDialog, setShowStudentDialog] = useState(false);

    // Advisee records provided by server initial data
    const advisorStudents = students;

    // Calculate student statistics
    const getStudentStats = (student: any) => {
        // We already calculated this on the server for getAdviseesData
        const currentGPA = student.currentGPA || 0;
        const totalCredits = student.totalCredits || 0;
        const totalGrades = student.totalGrades || 0;

        const isAtRisk = currentGPA < 2.5;

        return {
            currentGPA,
            totalCredits,
            totalGrades,
            goalsCount: 0, // Need Goals table integration
            interventionsCount: isAtRisk ? 1 : 0,
            isAtRisk,
        };
    };

    // Filter students
    const filteredStudents = advisorStudents.filter((student: any) => {
        const term = (searchTerm || '').toLowerCase();
        const studentName = (student.firstName + ' ' + student.lastName).toLowerCase();
        const studentId = (student.studentId || '').toLowerCase();
        const matchesSearch = studentName.includes(term) || studentId.includes(term);

        const stats = getStudentStats(student);
        const matchesRisk = filterRisk === 'all' ||
            (filterRisk === 'at-risk' && stats.isAtRisk) ||
            (filterRisk === 'good-standing' && !stats.isAtRisk);

        const matchesYear = filterYear === 'all' || student.academicYear === filterYear;
        const matchesPathway = filterPathway === 'all' || student.specialization === filterPathway;

        return matchesSearch && matchesRisk && matchesYear && matchesPathway;
    });

    const handleViewStudent = (studentId: string) => {
        setSelectedStudent(studentId);
        setShowStudentDialog(true);
    };

    const handleContactStudent = (studentId: string) => {
        const student = students.find((s: any) => s.id === studentId);
        if (student) {
            toast.success(`Opening contact form for ${student.firstName}`);
        }
    };

    const exportRecords = () => {
        const exportData = filteredStudents.map((s: any) => {
            const stats = getStudentStats(s);
            return {
                Student_ID: s.studentId,
                Name: `${s.firstName} ${s.lastName}`,
                Email: s.email,
                Year: s.academicYear,
                Pathway: s.specialization || s.degreePath || 'N/A',
                GPA: stats.currentGPA.toFixed(2),
                Credits: stats.totalCredits,
                Risk_Status: stats.isAtRisk ? 'At Risk' : 'Good Standing'
            };
        });

        csvUtils.downloadCSV(exportData, { filename: `advisor_records_${new Date().toISOString().split('T')[0]}.csv` });
        toast.success('Academic records exported successfully!');
    };

    const getAcademicClass = (gpa: number) => {
        if (gpa >= 3.7) return 'First Class';
        if (gpa >= 3.0) return 'Second Upper';
        if (gpa >= 2.5) return 'Second Lower';
        return 'Third/Pass';
    };

    const getGpaTrendData = (studentId: string) => {
        const student = students.find((s: any) => s.id === studentId);
        // Trend data to be populated from GPA history table in future phases
        return [];
    };

    const getGradeDistribution = () => {
        // Aggregated distribution from grades table
        return [];
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Academic Records</h1>
                    <p className="text-muted-foreground mt-1">View and manage academic records for all your advisees</p>
                </div>
                <Button variant="outline" onClick={exportRecords}><Download className="mr-2 h-4 w-4" /> Export Records</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Advisees</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{advisorStudents.length}</div><p className="text-xs text-muted-foreground">Active students</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">At Risk</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{advisorStudents.filter((s: any) => getStudentStats(s).isAtRisk).length}</div><p className="text-xs text-muted-foreground">Need attention</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Good Standing</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{advisorStudents.filter((s: any) => !getStudentStats(s).isAtRisk).length}</div><p className="text-xs text-muted-foreground">On track</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Avg GPA</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{(() => { const totalGPA = advisorStudents.reduce((sum: number, s: any) => sum + getStudentStats(s).currentGPA, 0); return advisorStudents.length > 0 ? (totalGPA / advisorStudents.length).toFixed(2) : '0.00'; })()}</div><p className="text-xs text-muted-foreground">Cohort average</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Student Records</CardTitle><CardDescription>Filter and search through your advisees' academic records</CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="risk-filter">Risk:</Label>
                                <Select value={filterRisk} onValueChange={setFilterRisk}>
                                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="at-risk">At Risk</SelectItem><SelectItem value="good-standing">Good Standing</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="year-filter">Year:</Label>
                                <Select value={filterYear} onValueChange={setFilterYear}>
                                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="L1">L1</SelectItem><SelectItem value="L2">L2</SelectItem><SelectItem value="L3">L3</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="pathway-filter">Pathway:</Label>
                                <Select value={filterPathway} onValueChange={setFilterPathway}>
                                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="Software Engineering">Software Engineering</SelectItem><SelectItem value="Data Science">Data Science</SelectItem><SelectItem value="Cybersecurity">Cybersecurity</SelectItem><SelectItem value="Mobile Development">Mobile Development</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Table>
                            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway</TableHead><TableHead>Current GPA</TableHead><TableHead>Academic Class</TableHead><TableHead>Credits</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredStudents.map((student: any) => {
                                    const stats = getStudentStats(student);
                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell><div><div className="font-medium">{student.firstName} {student.lastName}</div><div className="text-sm text-muted-foreground">{student.studentId}</div></div></TableCell>
                                            <TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell>
                                            <TableCell><Badge variant="secondary">{student.specialization}</Badge></TableCell>
                                            <TableCell><div className="font-medium">{stats.currentGPA.toFixed(2)}</div></TableCell>
                                            <TableCell><div className="text-sm">{getAcademicClass(stats.currentGPA)}</div></TableCell>
                                            <TableCell><div className="font-medium">{stats.totalCredits}</div></TableCell>
                                            <TableCell>{stats.isAtRisk ? <Badge variant="destructive">At Risk</Badge> : <Badge variant="default">Good Standing</Badge>}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewStudent(student.id)}><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleContactStudent(student.id)}><MessageSquare className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Student Academic Record</DialogTitle><DialogDescription>Comprehensive academic record for {students.find((s: any) => s.id === selectedStudent)?.firstName}</DialogDescription></DialogHeader>
                    {selectedStudent && (() => {
                        const student = students.find((s: any) => s.id === selectedStudent);
                        if (!student) return null;
                        const stats = getStudentStats(student);
                        const gpaTrendData = getGpaTrendData(student.id);
                        const gradeDistribution = getGradeDistribution();

                        return (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-4">
                                    <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Current GPA</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.currentGPA.toFixed(2)}</div><p className="text-xs text-muted-foreground">Grade points</p></CardContent></Card>
                                    <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Academic Class</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{getAcademicClass(stats.currentGPA)}</div><p className="text-xs text-muted-foreground">Current standing</p></CardContent></Card>
                                    <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Credits Earned</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalCredits}</div><p className="text-xs text-muted-foreground">Out of 120 required</p></CardContent></Card>
                                    <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Risk Status</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.isAtRisk ? <Badge variant="destructive">At Risk</Badge> : <Badge variant="default">Good Standing</Badge>}</div><p className="text-xs text-muted-foreground">Academic status</p></CardContent></Card>
                                </div>
                                <Tabs defaultValue="overview" className="space-y-4">
                                    <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="grades">Grades</TabsTrigger><TabsTrigger value="goals">Goals</TabsTrigger><TabsTrigger value="interventions">Interventions</TabsTrigger></TabsList>
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Card><CardHeader><CardTitle>GPA Trend</CardTitle><CardDescription>Academic performance over time</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={gpaTrendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semester" /><YAxis domain={[0, 4]} /><Tooltip /><Line type="monotone" dataKey="gpa" stroke="#8884d8" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
                                            <Card><CardHeader><CardTitle>Grade Distribution</CardTitle><CardDescription>Distribution of grades earned</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={gradeDistribution}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="grade" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#8884d8" /></BarChart></ResponsiveContainer></CardContent></Card>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="grades" className="space-y-4">
                                        <Card><CardHeader><CardTitle>Academic Record</CardTitle><CardDescription>Complete grade history</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Code</TableHead><TableHead>Credits</TableHead><TableHead>Grade</TableHead><TableHead>Points</TableHead><TableHead>Semester</TableHead></TableRow></TableHeader><TableBody>
                                            {/* Records will be mapped from database grades */}
                                            {(!student.grades || student.grades.length === 0) && (
                                                <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No grades recorded for this student.</TableCell></TableRow>
                                            )}
                                        </TableBody></Table></CardContent></Card>
                                    </TabsContent>
                                    <TabsContent value="goals" className="space-y-4">
                                        <Card>
                                            <CardHeader><CardTitle>Academic Goals</CardTitle><CardDescription>Student's academic and personal goals</CardDescription></CardHeader>
                                            <CardContent><div className="text-center py-8 text-muted-foreground"><Target className="h-12 w-12 mx-auto mb-4" /><p>No goals set yet</p></div></CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="interventions" className="space-y-4">
                                        <Card>
                                            <CardHeader><CardTitle>Academic Interventions</CardTitle><CardDescription>History of academic support and interventions</CardDescription></CardHeader>
                                            <CardContent><div className="text-center py-8 text-muted-foreground"><AlertTriangle className="h-12 w-12 mx-auto mb-4" /><p>No interventions recorded</p></div></CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        );
                    })()}
                    <DialogFooter><Button variant="outline" onClick={() => setShowStudentDialog(false)}>Close</Button><Button onClick={() => { setShowStudentDialog(false); handleContactStudent(selectedStudent); }}><MessageSquare className="mr-2 h-4 w-4" /> Contact Student</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
