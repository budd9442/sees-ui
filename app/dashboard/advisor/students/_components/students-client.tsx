'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    MessageCircle,
    Search,
    Calendar,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Eye,
    Mail,
    Filter,
    Download,
    Award,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ADVISOR_STUDENT_TABS = ['all', 'at-risk', 'excellent', 'recent'] as const;
type AdvisorStudentTab = (typeof ADVISOR_STUDENT_TABS)[number];

function normalizeAdvisorStudentTab(tab: string | undefined): AdvisorStudentTab {
    if (tab && (ADVISOR_STUDENT_TABS as readonly string[]).includes(tab)) {
        return tab as AdvisorStudentTab;
    }
    return 'all';
}

export default function AdvisorStudentsClient({
    initialData,
    initialTab,
}: {
    initialData: any;
    initialTab?: string;
}) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedPathway, setSelectedPathway] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const myStudents = initialData.students;
    const tabsDefault = normalizeAdvisorStudentTab(initialTab);

    const filteredStudents = myStudents.filter((student: any) => {
        const term = (searchTerm || '').toLowerCase();
        const name = `${student.firstName} ${student.lastName}`.toLowerCase();
        const studentId = (student.studentId || '').toLowerCase();
        const email = (student.email || '').toLowerCase();

        const matchesSearch = name.includes(term) || studentId.includes(term) || email.includes(term);
        const matchesYear = selectedYear === 'all' || student.academicYear === selectedYear;
        const matchesPathway = selectedPathway === 'all' || student.specialization === selectedPathway;
        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'at-risk' && student.currentGPA < 2.5) ||
            (selectedStatus === 'excellent' && student.currentGPA >= 3.7) ||
            (selectedStatus === 'good' && student.currentGPA >= 3.0 && student.currentGPA < 3.7) ||
            (selectedStatus === 'satisfactory' && student.currentGPA >= 2.5 && student.currentGPA < 3.0);

        return matchesSearch && matchesYear && matchesPathway && matchesStatus;
    });

    const totalStudents = myStudents.length;
    const atRiskStudents = myStudents.filter((s: any) => s.currentGPA < 2.5).length;
    const excellentStudents = myStudents.filter((s: any) => s.currentGPA >= 3.7).length;
    const averageGPA = myStudents.length > 0 ? myStudents.reduce((sum: number, s: any) => sum + s.currentGPA, 0) / myStudents.length : 0;

    const getPerformanceLevel = (gpa: number) => {
        if (gpa >= 3.7) return { level: 'Excellent', color: 'text-green-600 bg-green-50', badge: 'default' };
        if (gpa >= 3.0) return { level: 'Good', color: 'text-blue-600 bg-blue-50', badge: 'secondary' };
        if (gpa >= 2.5) return { level: 'Satisfactory', color: 'text-yellow-600 bg-yellow-50', badge: 'outline' };
        return { level: 'At Risk', color: 'text-red-600 bg-red-50', badge: 'destructive' };
    };

    const getGPATrend = (student: any) => {
        return Math.random() > 0.5 ? 'up' : 'down';
    };

    const handleViewStudent = (studentId: string) => {
        router.push(`/dashboard/advisor/students/${studentId}`);
    };

    const handleSendMessage = (studentId: string) => {
        router.push(`/dashboard/advisor/messages?student=${studentId}`);
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">My Students</h1>
                    <p className="text-muted-foreground mt-1">Manage and monitor your advisees' academic progress</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export List</Button>
                    <Button><MessageCircle className="mr-2 h-4 w-4" /> Send Message</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Link
                    href="/dashboard/advisor/students?tab=all"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStudents}</div>
                            <p className="text-xs text-muted-foreground">Active advisees</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link
                    href="/dashboard/advisor/students?tab=at-risk"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{atRiskStudents}</div>
                            <p className="text-xs text-muted-foreground">Need attention</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link
                    href="/dashboard/advisor/students?tab=excellent"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Excellent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{excellentStudents}</div>
                            <p className="text-xs text-muted-foreground">High performers</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link
                    href="/dashboard/advisor/records"
                    className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Card className="h-full transition-colors hover:border-primary/35 hover:bg-muted/30 cursor-pointer">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageGPA.toFixed(2)}</div>
                            <Progress value={(averageGPA / 4) * 100} className="mt-2 h-1" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <Card>
                <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search Students</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="search" placeholder="Search by name, ID, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Academic Year</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    <SelectItem value="L1">L1</SelectItem>
                                    <SelectItem value="L2">L2</SelectItem>
                                    <SelectItem value="L3">L3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pathway">Pathway</Label>
                            <Select value={selectedPathway} onValueChange={setSelectedPathway}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Pathways</SelectItem>
                                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                    <SelectItem value="Data Science">Data Science</SelectItem>
                                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Performance</Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Students</SelectItem>
                                    <SelectItem value="excellent">Excellent (≥3.7)</SelectItem>
                                    <SelectItem value="good">Good (3.0-3.69)</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory (2.5-2.99)</SelectItem>
                                    <SelectItem value="at-risk">At Risk (&lt;2.5)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Quick Actions</Label>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1"><Filter className="h-4 w-4" /></Button>
                                <Button variant="outline" size="sm" className="flex-1"><Download className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue={tabsDefault} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Students ({filteredStudents.length})</TabsTrigger>
                    <TabsTrigger value="at-risk">At Risk ({myStudents.filter((s: any) => s.currentGPA < 2.5).length})</TabsTrigger>
                    <TabsTrigger value="excellent">Excellent ({myStudents.filter((s: any) => s.currentGPA >= 3.7).length})</TabsTrigger>
                    <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>All Students</CardTitle><CardDescription>Complete list of your advisees</CardDescription></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead>Pathway</TableHead>
                                        <TableHead>GPA</TableHead>
                                        <TableHead>Performance</TableHead>
                                        <TableHead>Trend</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student: any) => {
                                        const performance = getPerformanceLevel(student.currentGPA);
                                        const trend = getGPATrend(student);
                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar><AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback></Avatar>
                                                        <div><div className="font-medium">{student.firstName} {student.lastName}</div><div className="text-sm text-muted-foreground">{student.studentId}</div></div>
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{student.academicYear}</Badge></TableCell>
                                                <TableCell><Badge variant="secondary">{student.specialization}</Badge></TableCell>
                                                <TableCell><div className="font-medium">{student.currentGPA.toFixed(2)}</div></TableCell>
                                                <TableCell><Badge variant={performance.badge as any}>{performance.level}</Badge></TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        {trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                                                        <span className="text-sm text-muted-foreground">{trend === 'up' ? 'Improving' : 'Declining'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button variant="outline" size="sm" onClick={() => handleViewStudent(student.id)}><Eye className="h-4 w-4" /></Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleSendMessage(student.studentId)}><Mail className="h-4 w-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="at-risk" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>At-Risk Students</CardTitle><CardDescription>Students requiring immediate attention (GPA &lt; 2.5)</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {myStudents.filter((s: any) => s.currentGPA < 2.5).map((student: any) => (
                                    <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
                                        <div className="flex items-center gap-4">
                                            <Avatar><AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback></Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{student.firstName} {student.lastName}</p>
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">GPA: {student.currentGPA.toFixed(2)} • {student.studentId} • {student.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleViewStudent(student.id)}>View Profile</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="excellent" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Excellent Students</CardTitle><CardDescription>High-performing students (GPA ≥ 3.7)</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {myStudents.filter((s: any) => s.currentGPA >= 3.7).map((student: any) => (
                                    <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border border-green-200 bg-green-50">
                                        <div className="flex items-center gap-4">
                                            <Avatar><AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback></Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{student.firstName} {student.lastName}</p>
                                                    <Award className="h-4 w-4 text-green-600" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">GPA: {student.currentGPA.toFixed(2)} • {student.studentId} • {student.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleViewStudent(student.id)}>View Profile</Button>
                                            <Button size="sm" variant="outline" onClick={() => handleSendMessage(student.studentId)}>Send Message</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>Latest updates from your students</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {myStudents.slice(0, 5).map((student: any, index: number) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <Avatar><AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback></Avatar>
                                            <div>
                                                <p className="font-medium">{student.firstName} {student.lastName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {index === 0 && 'Completed module registration'}
                                                    {index === 1 && 'Updated academic goals'}
                                                    {index === 2 && 'Submitted pathway selection'}
                                                    {index === 3 && 'Viewed grade report'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {index === 0 && '2 hours ago'}
                                            {index === 1 && '1 day ago'}
                                            {index === 2 && '3 days ago'}
                                            {index === 3 && '1 week ago'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
