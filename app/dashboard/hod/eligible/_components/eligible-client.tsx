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
import { exportTabularData } from '@/lib/export';

export default function EligibleClient({ initialData }: { initialData: any }) {
    const { students, modules, grades } = initialData;
    const [filterPathway, setFilterPathway] = useState('all');
    const [filterSpecialization, setFilterSpecialization] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [emailTemplate, setEmailTemplate] = useState('');

    const getStudentsByClass = () => {
        const classGroups = {
            'First Class': [] as any[],
            'Second Upper': [] as any[],
            'Second Lower': [] as any[],
            'Pass': [] as any[],
            'In-Progress': [] as any[],
        };

        students.forEach((student: any) => {
            const academicClass = student.evaluation?.academicClass || 'Unassigned';
            
            // Explicit routing based on rules
            if (academicClass === 'First Class') classGroups['First Class'].push(student);
            else if (academicClass === 'Second Upper') classGroups['Second Upper'].push(student);
            else if (academicClass === 'Second Lower') classGroups['Second Lower'].push(student);
            else if (academicClass === 'Pass') {
                classGroups['Pass'].push(student);
            } else {
                // Inprogress, Unassigned, or Incomplete graduates-to-be
                classGroups['In-Progress'].push(student);
            }
        });

        return classGroups;
    };

    const studentsByClass = getStudentsByClass();

    const pathwayOptions = Array.from(
        new Set<string>(
            students
                .map((s: any) => s.pathway)
                .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
        )
    ).sort();

    const specializationOptions = Array.from(
        new Set<string>(
            students
                .map((s: any) => s.specialization)
                .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0 && value !== 'None')
        )
    ).sort();
    
    const yearOptions = Array.from(
        new Set<string>(
            students
                .map((s: any) => s.academicYear)
                .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
        )
    ).sort();

    const filterStudents = (studentList: any[]) => {
        return studentList.filter(student => {
            const matchesPathway = filterPathway === 'all' || student.pathway === filterPathway;
            const matchesYear = filterYear === 'all' || student.academicYear === filterYear;
            const matchesSpecialization = filterSpecialization === 'all' || student.specialization === filterSpecialization;
            return matchesPathway && matchesYear && matchesSpecialization;
        });
    };

    const getClassStatistics = () => {
        const stats = {
            'First Class': { total: 0, eligible: 0, gpa: 0 },
            'Second Upper': { total: 0, eligible: 0, gpa: 0 },
            'Second Lower': { total: 0, eligible: 0, gpa: 0 },
            'Pass': { total: 0, eligible: 0, gpa: 0 },
            'In-Progress': { total: 0, eligible: 0, gpa: 0 },
        };

        Object.entries(studentsByClass).forEach(([academicClass, students]) => {
            const filteredStudents = filterStudents(students);
            stats[academicClass as keyof typeof stats].total = filteredStudents.length;

            let eligibleCount = 0;
            let totalGpa = 0;

            filteredStudents.forEach(student => {
                const evalResult = student.evaluation;
                if (evalResult?.isEligible) eligibleCount++;
                totalGpa += evalResult?.gpa || 0;
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
            case 'Pass': return 'text-gray-600 bg-gray-50';
            case 'In-Progress': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getEligibilityColor = (isEligible: boolean) => {
        return isEligible ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    };

    const exportStudents = async (academicClass: string, format: 'pdf' | 'excel' | 'csv') => {
        try {
            const source = academicClass === 'All'
                ? students
                : studentsByClass[academicClass as keyof typeof studentsByClass] || [];
            const rows = filterStudents(source).map((student: any) => {
                const evalResult = student.evaluation;
                return {
                    studentId: student.id,
                    name: student.name || `${student.firstName} ${student.lastName}`,
                    academicYear: student.academicYear,
                    pathway: student.pathway,
                    specialization: student.specialization,
                    gpa: (evalResult?.gpa || 0).toFixed(2),
                    creditsCompleted: evalResult?.creditDetail?.completed || 0,
                    eligibility: evalResult?.isEligible ? 'Eligible' : 'Not Eligible',
                };
            });
            await exportTabularData(rows, format, { filename: `eligible-${academicClass}-${Date.now()}` });
            toast.success(`${academicClass} students exported as ${format.toUpperCase()}`);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to export students');
        }
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
                            <Select value={filterPathway} onValueChange={setFilterPathway}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Pathways</SelectItem>{pathwayOptions.map((pathway) => (<SelectItem key={pathway} value={pathway}>{pathway}</SelectItem>))}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year-filter">Academic Year</Label>
                            <Select value={filterYear} onValueChange={setFilterYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Years</SelectItem>{yearOptions.map((year) => (<SelectItem key={year} value={year}>{year}</SelectItem>))}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="specialization-filter">Specialization</Label>
                            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Specializations</SelectItem>{specializationOptions.map((spec) => (<SelectItem key={`spec-${spec}`} value={spec}>{spec}</SelectItem>))}</SelectContent></Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">First Class</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{classStats['First Class'].total}</div><p className="text-xs text-muted-foreground">{classStats['First Class'].eligible} eligible for graduation</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Second Upper</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{classStats['Second Upper'].total}</div><p className="text-xs text-muted-foreground">{classStats['Second Upper'].eligible} eligible for graduation</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Second Lower</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{classStats['Second Lower'].total}</div><p className="text-xs text-muted-foreground">{classStats['Second Lower'].eligible} eligible for graduation</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">In-Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{classStats['In-Progress'].total}</div><p className="text-xs text-muted-foreground">Students completing requirements</p></CardContent></Card>
            </div>

            <Tabs defaultValue="first-class" className="space-y-4">
                <TabsList><TabsTrigger value="first-class">First Class</TabsTrigger><TabsTrigger value="second-upper">Second Upper</TabsTrigger><TabsTrigger value="second-lower">Second Lower</TabsTrigger><TabsTrigger value="pass">Pass</TabsTrigger><TabsTrigger value="in-progress">In-Progress</TabsTrigger><TabsTrigger value="overview">Overview</TabsTrigger></TabsList>
                <TabsContent value="first-class" className="space-y-4">
                    <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-600" /> First Class Students</CardTitle><CardDescription>Students meeting First Class Honours criteria</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => selectAllStudents('First Class')}>Select All</Button><Button variant="outline" size="sm" onClick={() => exportStudents('First Class', 'pdf')}><Download className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway & Spec</TableHead><TableHead>GPA</TableHead><TableHead>Credits</TableHead><TableHead>Eligibility</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filterStudents(studentsByClass['First Class']).map((student) => { const ev = student.evaluation; return (<TableRow key={student.id}><TableCell><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></TableCell><TableCell><div><div className="font-medium">{student.name || `${student.firstName} ${student.lastName}`}</div><div className="text-sm text-muted-foreground">{student.id}</div></div></TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><div className="flex flex-col gap-1"><Badge variant="secondary" className="w-fit">{student.pathway}</Badge>{student.specialization !== 'None' && <Badge variant="outline" className="w-fit">{student.specialization}</Badge>}</div></TableCell><TableCell><div className="font-medium">{(ev?.gpa || 0).toFixed(2)}</div></TableCell><TableCell><div className="font-medium">{ev?.creditDetail?.completed || 0}</div><div className="text-xs text-muted-foreground">{(ev?.creditDetail?.remaining || 0) > 0 ? `${ev.creditDetail.remaining} remaining` : 'Complete'}</div></TableCell><TableCell><Badge className={getEligibilityColor(ev?.isEligible)}>{ev?.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></TableCell><TableCell><Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="second-upper" className="space-y-4">
                    <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-blue-600" /> Second Upper Students</CardTitle><CardDescription>Students meeting Second Class Upper criteria</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => selectAllStudents('Second Upper')}>Select All</Button><Button variant="outline" size="sm" onClick={() => exportStudents('Second Upper', 'pdf')}><Download className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway & Spec</TableHead><TableHead>GPA</TableHead><TableHead>Credits</TableHead><TableHead>Eligibility</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filterStudents(studentsByClass['Second Upper']).map((student) => { const ev = student.evaluation; return (<TableRow key={student.id}><TableCell><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></TableCell><TableCell><div><div className="font-medium">{student.name || `${student.firstName} ${student.lastName}`}</div><div className="text-sm text-muted-foreground">{student.id}</div></div></TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><div className="flex flex-col gap-1"><Badge variant="secondary" className="w-fit">{student.pathway}</Badge>{student.specialization !== 'None' && <Badge variant="outline" className="w-fit">{student.specialization}</Badge>}</div></TableCell><TableCell><div className="font-medium">{(ev?.gpa || 0).toFixed(2)}</div></TableCell><TableCell><div className="font-medium">{ev?.creditDetail?.completed || 0}</div><div className="text-xs text-muted-foreground">{(ev?.creditDetail?.remaining || 0) > 0 ? `${ev.creditDetail.remaining} remaining` : 'Complete'}</div></TableCell><TableCell><Badge className={getEligibilityColor(ev?.isEligible)}>{ev?.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></TableCell><TableCell><Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="second-lower" className="space-y-4">
                    <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Second Lower Students</CardTitle><CardDescription>Students meeting Second Class Lower criteria</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => selectAllStudents('Second Lower')}>Select All</Button><Button variant="outline" size="sm" onClick={() => exportStudents('Second Lower', 'pdf')}><Download className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway & Spec</TableHead><TableHead>GPA</TableHead><TableHead>Credits</TableHead><TableHead>Eligibility</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filterStudents(studentsByClass['Second Lower']).map((student) => { const ev = student.evaluation; return (<TableRow key={student.id}><TableCell><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></TableCell><TableCell><div><div className="font-medium">{student.name || `${student.firstName} ${student.lastName}`}</div><div className="text-sm text-muted-foreground">{student.id}</div></div></TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><div className="flex flex-col gap-1"><Badge variant="secondary" className="w-fit">{student.pathway}</Badge>{student.specialization !== 'None' && <Badge variant="outline" className="w-fit">{student.specialization}</Badge>}</div></TableCell><TableCell><div className="font-medium">{(ev?.gpa || 0).toFixed(2)}</div></TableCell><TableCell><div className="font-medium">{ev?.creditDetail?.completed || 0}</div><div className="text-xs text-muted-foreground">{(ev?.creditDetail?.remaining || 0) > 0 ? `${ev.creditDetail.remaining} remaining` : 'Complete'}</div></TableCell><TableCell><Badge className={getEligibilityColor(ev?.isEligible)}>{ev?.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></TableCell><TableCell><Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="pass" className="space-y-4">
                    <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-gray-600" /> Pass Students</CardTitle><CardDescription>Students meeting Pass criteria</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => selectAllStudents('Pass')}>Select All</Button><Button variant="outline" size="sm" onClick={() => exportStudents('Pass', 'pdf')}><Download className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway & Spec</TableHead><TableHead>GPA</TableHead><TableHead>Credits</TableHead><TableHead>Eligibility</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filterStudents(studentsByClass['Pass']).map((student) => { const ev = student.evaluation; return (<TableRow key={student.id}><TableCell><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></TableCell><TableCell><div><div className="font-medium">{student.name || `${student.firstName} ${student.lastName}`}</div><div className="text-sm text-muted-foreground">{student.id}</div></div></TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><div className="flex flex-col gap-1"><Badge variant="secondary" className="w-fit">{student.pathway}</Badge>{student.specialization !== 'None' && <Badge variant="outline" className="w-fit">{student.specialization}</Badge>}</div></TableCell><TableCell><div className="font-medium">{(ev?.gpa || 0).toFixed(2)}</div></TableCell><TableCell><div className="font-medium">{ev?.creditDetail?.completed || 0}</div><div className="text-xs text-muted-foreground">{(ev?.creditDetail?.remaining || 0) > 0 ? `${ev.creditDetail.remaining} remaining` : 'Complete'}</div></TableCell><TableCell><Badge className={getEligibilityColor(ev?.isEligible)}>{ev?.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></TableCell><TableCell><Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="in-progress" className="space-y-4">
                    <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-orange-600" /> In-Progress Students</CardTitle><CardDescription>Students currently completing their degree requirements</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => selectAllStudents('In-Progress')}>Select All</Button><Button variant="outline" size="sm" onClick={() => exportStudents('In-Progress', 'pdf')}><Download className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway & Spec</TableHead><TableHead>GPA</TableHead><TableHead>Credits</TableHead><TableHead>Eligibility</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filterStudents(studentsByClass['In-Progress']).map((student) => { const ev = student.evaluation; return (<TableRow key={student.id}><TableCell><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></TableCell><TableCell><div><div className="font-medium">{student.name || `${student.firstName} ${student.lastName}`}</div><div className="text-sm text-muted-foreground">{student.id}</div></div></TableCell><TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell><TableCell><div className="flex flex-col gap-1"><Badge variant="secondary" className="w-fit">{student.pathway}</Badge>{student.specialization !== 'None' && <Badge variant="outline" className="w-fit">{student.specialization}</Badge>}</div></TableCell><TableCell><div className="font-medium">{(ev?.gpa || 0).toFixed(2)}</div></TableCell><TableCell><div className="font-medium">{ev?.creditDetail?.completed || 0}</div><div className="text-xs text-muted-foreground">{(ev?.creditDetail?.remaining || 0) > 0 ? `${ev.creditDetail.remaining} remaining` : 'Complete'}</div></TableCell><TableCell><Badge className={getEligibilityColor(ev?.isEligible)}>{ev?.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></TableCell><TableCell><Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
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
