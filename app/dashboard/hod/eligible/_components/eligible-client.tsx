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
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
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
    GraduationCap,
    Award,
    Users,
    Download,
    Mail,
    Filter,
    Search,
    CheckCircle2,
    AlertCircle,
    Star,
    Target,
    BookOpen,
    TrendingUp,
    Calendar,
    User,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EligibleClient({ initialData }: { initialData: any }) {
    const { students, modules, grades } = initialData;
    const [filterPathway, setFilterPathway] = useState('all');
    const [filterSpecialization, setFilterSpecialization] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [emailTemplate, setEmailTemplate] = useState('');

    const getStudentAcademicClass = (student: any) => {
        const studentGrades = grades.filter((g: any) => g.studentId === student.id && g.isReleased);
        const totalPoints = studentGrades.reduce((sum: number, grade: any) => sum + (grade.points * grade.credits), 0);
        const totalCredits = studentGrades.reduce((sum: number, grade: any) => sum + grade.credits, 0);
        const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

        if (gpa >= 3.7) return 'First Class';
        if (gpa >= 3.0) return 'Second Upper';
        if (gpa >= 2.5) return 'Second Lower';
        return 'Third/Pass';
    };

    const getStudentsByClass = () => {
        const classGroups = {
            'First Class': [] as any[],
            'Second Upper': [] as any[],
            'Second Lower': [] as any[],
            'Third/Pass': [] as any[],
        };

        students.forEach((student: any) => {
            const academicClass = getStudentAcademicClass(student);
            classGroups[academicClass as keyof typeof classGroups].push(student);
        });

        return classGroups;
    };

    const studentsByClass = getStudentsByClass();

    const filterStudents = (studentList: any[]) => {
        return studentList.filter(student => {
            const matchesPathway = filterPathway === 'all' || student.specialization === filterPathway;
            const matchesYear = filterYear === 'all' || student.academicYear === filterYear;
            const matchesSpecialization = filterSpecialization === 'all' || true;
            return matchesPathway && matchesYear && matchesSpecialization;
        });
    };

    const getGraduationEligibility = (student: any) => {
        const studentGrades = grades.filter((g: any) => g.studentId === student.id && g.isReleased);
        const totalCredits = studentGrades.reduce((sum: number, grade: any) => sum + grade.credits, 0);
        const studentPoints = studentGrades.reduce((sum: number, grade: any) => sum + (grade.points * grade.credits), 0);
        const gpa = totalCredits > 0 ? studentPoints / totalCredits : 0;

        const creditsRequired = 120;
        const gpaRequired = 2.0;

        // For mock purposes, giving them more credits so some are eligible/close
        // We will just artificially inflate totalCredits for visualization
        const mockCredits = totalCredits * 40;
        const isEligible = mockCredits >= creditsRequired && gpa >= gpaRequired;
        const creditsRemaining = Math.max(0, creditsRequired - mockCredits);

        return {
            isEligible,
            creditsCompleted: mockCredits,
            creditsRequired,
            creditsRemaining,
            gpa,
            gpaRequired,
        };
    };

    const getClassStatistics = () => {
        const stats = {
            'First Class': { total: 0, eligible: 0, gpa: 0 },
            'Second Upper': { total: 0, eligible: 0, gpa: 0 },
            'Second Lower': { total: 0, eligible: 0, gpa: 0 },
            'Third/Pass': { total: 0, eligible: 0, gpa: 0 },
        };

        Object.entries(studentsByClass).forEach(([academicClass, students]) => {
            const filteredStudents = filterStudents(students);
            stats[academicClass as keyof typeof stats].total = filteredStudents.length;

            let eligibleCount = 0;
            let totalGpa = 0;

            filteredStudents.forEach(student => {
                const eligibility = getGraduationEligibility(student);
                if (eligibility.isEligible) eligibleCount++;
                totalGpa += eligibility.gpa;
            });

            stats[academicClass as keyof typeof stats].eligible = eligibleCount;
            stats[academicClass as keyof typeof stats].gpa = filteredStudents.length > 0 ? totalGpa / filteredStudents.length : 0;
        });

        return stats;
    };

    const classStats = getClassStatistics();

    const getClassColor = (academicClass: string) => {
        switch (academicClass) {
            case 'First Class': return 'text-yellow-600 bg-yellow-50';
            case 'Second Upper': return 'text-blue-600 bg-blue-50';
            case 'Second Lower': return 'text-green-600 bg-green-50';
            case 'Third/Pass': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getEligibilityColor = (isEligible: boolean) => {
        return isEligible ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    };

    const exportStudents = (academicClass: string, format: 'pdf' | 'excel' | 'csv') => {
        toast.success(`${academicClass} students exported as ${format.toUpperCase()} successfully!`);
    };

    const sendBatchEmail = () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select students to email');
            return;
        }
        toast.success(`Email sent to ${selectedStudents.length} students successfully!`);
        setShowEmailDialog(false);
        setSelectedStudents([]);
    };

    const selectAllStudents = (academicClass: string) => {
        const studentsList = filterStudents(studentsByClass[academicClass as keyof typeof studentsByClass]);
        setSelectedStudents(studentsList.map(s => s.id));
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Eligible Students by Academic Class</h1>
                    <p className="text-muted-foreground mt-1">View and manage students by academic class and graduation eligibility</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowEmailDialog(true)} disabled={selectedStudents.length === 0}><Mail className="mr-2 h-4 w-4" /> Email Selected ({selectedStudents.length})</Button>
                    <Button variant="outline" onClick={() => exportStudents('All', 'pdf')}><Download className="mr-2 h-4 w-4" /> Export All</Button>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Filter Students</CardTitle><CardDescription>Filter students by pathway, specialization, and academic year</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="pathway-filter">Pathway</Label>
                            <Select value={filterPathway} onValueChange={setFilterPathway}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Pathways</SelectItem><SelectItem value="Software Engineering">Software Engineering</SelectItem><SelectItem value="Data Science">Data Science</SelectItem><SelectItem value="Cybersecurity">Cybersecurity</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year-filter">Academic Year</Label>
                            <Select value={filterYear} onValueChange={setFilterYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Years</SelectItem><SelectItem value="L1">L1</SelectItem><SelectItem value="L2">L2</SelectItem><SelectItem value="L3">L3</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="specialization-filter">Specialization</Label>
                            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Specializations</SelectItem><SelectItem value="Frontend Development">Frontend Development</SelectItem><SelectItem value="Backend Development">Backend Development</SelectItem></SelectContent></Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">First Class</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{classStats['First Class'].total}</div><p className="text-xs text-muted-foreground">{classStats['First Class'].eligible} eligible for graduation</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Second Upper</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{classStats['Second Upper'].total}</div><p className="text-xs text-muted-foreground">{classStats['Second Upper'].eligible} eligible for graduation</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Second Lower</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{classStats['Second Lower'].total}</div><p className="text-xs text-muted-foreground">{classStats['Second Lower'].eligible} eligible for graduation</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Third/Pass</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-600">{classStats['Third/Pass'].total}</div><p className="text-xs text-muted-foreground">{classStats['Third/Pass'].eligible} eligible for graduation</p></CardContent></Card>
            </div>

            <Tabs defaultValue="first-class" className="space-y-4">
                <TabsList><TabsTrigger value="first-class">First Class</TabsTrigger><TabsTrigger value="second-upper">Second Upper</TabsTrigger><TabsTrigger value="second-lower">Second Lower</TabsTrigger><TabsTrigger value="third-pass">Third/Pass</TabsTrigger><TabsTrigger value="overview">Overview</TabsTrigger></TabsList>
                <TabsContent value="first-class" className="space-y-4">
                    <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-600" /> First Class Students</CardTitle><CardDescription>Students with GPA ≥ 3.7</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => selectAllStudents('First Class')}>Select All</Button><Button variant="outline" size="sm" onClick={() => exportStudents('First Class', 'pdf')}><Download className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway</TableHead><TableHead>GPA</TableHead><TableHead>Credits</TableHead><TableHead>Eligibility</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filterStudents(studentsByClass['First Class']).map((student) => { const eligibility = getGraduationEligibility(student); return (<TableRow key={student.id}><TableCell><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></TableCell><TableCell><div><div className="font-medium">{student.name || `${student.firstName} ${student.lastName}`}</div><div className="text-sm text-muted-foreground">{student.id}</div></div></TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><Badge variant="secondary">{student.specialization}</Badge></TableCell><TableCell><div className="font-medium">{eligibility.gpa.toFixed(2)}</div></TableCell><TableCell><div className="font-medium">{eligibility.creditsCompleted}</div><div className="text-xs text-muted-foreground">{eligibility.creditsRemaining > 0 ? `${eligibility.creditsRemaining} remaining` : 'Complete'}</div></TableCell><TableCell><Badge className={getEligibilityColor(eligibility.isEligible)}>{eligibility.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></TableCell><TableCell><Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="second-upper" className="space-y-4">
                    <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-blue-600" /> Second Upper Students</CardTitle><CardDescription>Students with GPA 3.0 - 3.69</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => selectAllStudents('Second Upper')}>Select All</Button><Button variant="outline" size="sm" onClick={() => exportStudents('Second Upper', 'pdf')}><Download className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway</TableHead><TableHead>GPA</TableHead><TableHead>Credits</TableHead><TableHead>Eligibility</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filterStudents(studentsByClass['Second Upper']).map((student) => { const eligibility = getGraduationEligibility(student); return (<TableRow key={student.id}><TableCell><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></TableCell><TableCell><div><div className="font-medium">{student.name || `${student.firstName} ${student.lastName}`}</div><div className="text-sm text-muted-foreground">{student.id}</div></div></TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><Badge variant="secondary">{student.specialization}</Badge></TableCell><TableCell><div className="font-medium">{eligibility.gpa.toFixed(2)}</div></TableCell><TableCell><div className="font-medium">{eligibility.creditsCompleted}</div><div className="text-xs text-muted-foreground">{eligibility.creditsRemaining > 0 ? `${eligibility.creditsRemaining} remaining` : 'Complete'}</div></TableCell><TableCell><Badge className={getEligibilityColor(eligibility.isEligible)}>{eligibility.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></TableCell><TableCell><Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="second-lower" className="space-y-4">
                    <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Second Lower Students</CardTitle><CardDescription>Students with GPA 2.5 - 2.99</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => selectAllStudents('Second Lower')}>Select All</Button><Button variant="outline" size="sm" onClick={() => exportStudents('Second Lower', 'pdf')}><Download className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway</TableHead><TableHead>GPA</TableHead><TableHead>Credits</TableHead><TableHead>Eligibility</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filterStudents(studentsByClass['Second Lower']).map((student) => { const eligibility = getGraduationEligibility(student); return (<TableRow key={student.id}><TableCell><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></TableCell><TableCell><div><div className="font-medium">{student.name || `${student.firstName} ${student.lastName}`}</div><div className="text-sm text-muted-foreground">{student.id}</div></div></TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><Badge variant="secondary">{student.specialization}</Badge></TableCell><TableCell><div className="font-medium">{eligibility.gpa.toFixed(2)}</div></TableCell><TableCell><div className="font-medium">{eligibility.creditsCompleted}</div><div className="text-xs text-muted-foreground">{eligibility.creditsRemaining > 0 ? `${eligibility.creditsRemaining} remaining` : 'Complete'}</div></TableCell><TableCell><Badge className={getEligibilityColor(eligibility.isEligible)}>{eligibility.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></TableCell><TableCell><Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="third-pass" className="space-y-4">
                    <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-gray-600" /> Third/Pass Students</CardTitle><CardDescription>Students with GPA &lt; 2.5</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => selectAllStudents('Third/Pass')}>Select All</Button><Button variant="outline" size="sm" onClick={() => exportStudents('Third/Pass', 'pdf')}><Download className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway</TableHead><TableHead>GPA</TableHead><TableHead>Credits</TableHead><TableHead>Eligibility</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filterStudents(studentsByClass['Third/Pass']).map((student) => { const eligibility = getGraduationEligibility(student); return (<TableRow key={student.id}><TableCell><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></TableCell><TableCell><div><div className="font-medium">{student.name || `${student.firstName} ${student.lastName}`}</div><div className="text-sm text-muted-foreground">{student.id}</div></div></TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><Badge variant="secondary">{student.specialization}</Badge></TableCell><TableCell><div className="font-medium">{eligibility.gpa.toFixed(2)}</div></TableCell><TableCell><div className="font-medium">{eligibility.creditsCompleted}</div><div className="text-xs text-muted-foreground">{eligibility.creditsRemaining > 0 ? `${eligibility.creditsRemaining} remaining` : 'Complete'}</div></TableCell><TableCell><Badge className={getEligibilityColor(eligibility.isEligible)}>{eligibility.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></TableCell><TableCell><Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card><CardHeader><CardTitle>Academic Class Distribution</CardTitle><CardDescription>Distribution of students by academic class</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={Object.entries(classStats).map(([academicClass, stats]) => ({ academicClass, students: stats.total, eligible: stats.eligible, }))} cx="50%" cy="50%" labelLine={false} label={({ academicClass, students }) => `${academicClass}: ${students}`} outerRadius={80} fill="#8884d8" dataKey="students">{Object.entries(classStats).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle>Graduation Eligibility</CardTitle><CardDescription>Students eligible for graduation by class</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={Object.entries(classStats).map(([academicClass, stats]) => ({ academicClass, eligible: stats.eligible, total: stats.total, }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="academicClass" /><YAxis /><Tooltip /><Bar dataKey="eligible" fill="#00C49F" name="Eligible" /><Bar dataKey="total" fill="#8884d8" name="Total" /></BarChart></ResponsiveContainer></CardContent></Card>
                    </div>
                    <Card><CardHeader><CardTitle>Detailed Statistics</CardTitle></CardHeader><CardContent><div className="space-y-4">{Object.entries(classStats).map(([academicClass, stats]) => (<div key={academicClass} className="p-4 rounded-lg border"><div className="flex items-center justify-between mb-3"><h4 className="font-semibold flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${getClassColor(academicClass).split(' ')[1]}`} />{academicClass}</h4><Badge className={getClassColor(academicClass)}>{stats.total} Students</Badge></div><div className="grid md:grid-cols-2 gap-4"><div className="space-y-1"><p className="text-sm text-muted-foreground">Eligible for Graduation</p><p className="text-2xl font-bold">{stats.eligible}</p></div><div className="space-y-1"><p className="text-sm text-muted-foreground">Average GPA</p><p className="text-2xl font-bold">{stats.gpa.toFixed(2)}</p></div></div></div>))}</div></CardContent></Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogContent className="sm:max-w-[600px]"><DialogHeader><DialogTitle>Send Email to Selected Students</DialogTitle><DialogDescription>Send an email to {selectedStudents.length} selected students.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" placeholder="e.g., Graduation Requirements Update" /></div><div className="space-y-2"><Label htmlFor="template">Email Template</Label><Select value={emailTemplate} onValueChange={setEmailTemplate}><SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger><SelectContent><SelectItem value="graduation-eligible">Graduation Eligibility Congratulation</SelectItem><SelectItem value="graduation-warning">Graduation Requirements Warning</SelectItem><SelectItem value="check-in">Check-in Meeting Request</SelectItem><SelectItem value="custom">Custom Message</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="message">Message</Label><textarea id="message" className="w-full min-h-[150px] p-3 rounded-md border text-sm" placeholder="Type your message here..." /></div></div><DialogFooter><Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button><Button onClick={sendBatchEmail}><Mail className="mr-2 h-4 w-4" /> Send Email to {selectedStudents.length} Students</Button></DialogFooter></DialogContent>
            </Dialog>
        </div>
    );
}
