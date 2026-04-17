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
    Trophy,
    Medal,
    Award,
    Crown,
    Target,
    AlertCircle,
    Download,
} from 'lucide-react';
import { toast } from 'sonner';
import type { RankingEntry } from '@/types';

export default function RankingsClient({ initialData }: { initialData: any }) {
    const { students, modules, grades } = initialData;
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [selectedSemester, setSelectedSemester] = useState('All');
    const [filterPathway, setFilterPathway] = useState('all');
    const [filterSpecialization, setFilterSpecialization] = useState('all');
    const [showTiebreakDialog, setShowTiebreakDialog] = useState(false);
    const [tiebreakWeights, setTiebreakWeights] = useState({
        gpa: 0.6,
        credits: 0.2,
        attendance: 0.1,
        participation: 0.1,
    });

    const batchOptions = Array.from(
        new Set<string>(
            students
                .map((student: any) => String(student.admissionYear))
                .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
        )
    ).sort();
    const pathwayOptions = Array.from(
        new Set<string>(
            students
                .map((student: any) => student.specialization)
                .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
        )
    ).sort();
    const specializationOptions = Array.from(
        new Set<string>(
            students
                .map((student: any) => student.academicYear)
                .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
        )
    ).sort();

    const calculateRankings = () => {
        const rankings: RankingEntry[] = students
            .filter((student: any) => selectedBatch === 'all' || String(student.admissionYear) === selectedBatch)
            .map((student: any) => {
            const studentGrades = grades.filter((g: any) => {
                if (g.studentId !== student.id || !g.isReleased) return false;
                if (selectedSemester === 'All') return true;
                if (selectedSemester === 'S1') return (g.semesterLabel || '').includes('1');
                if (selectedSemester === 'S2') return (g.semesterLabel || '').includes('2');
                return true;
            });

            const totalPoints = studentGrades.reduce((sum: number, grade: any) => sum + (grade.points * grade.credits), 0);
            const totalCredits = studentGrades.reduce((sum: number, grade: any) => sum + grade.credits, 0);
            const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

            const creditsEarned = studentGrades.filter((g: any) => g.points >= 2.0).reduce((sum: number, g: any) => sum + g.credits, 0);
            const attendance = 85;
            const participation = 85;

            const weightedScore =
                (gpa * tiebreakWeights.gpa) +
                ((creditsEarned / 120) * tiebreakWeights.credits) +
                ((attendance / 100) * tiebreakWeights.attendance) +
                ((participation / 100) * tiebreakWeights.participation);

                return {
                    id: student.id,
                    studentId: student.id,
                    studentName: student.name || `${student.firstName} ${student.lastName}`,
                    gpa: gpa,
                    weightedAverage: weightedScore,
                    rank: 0,
                    academicClass: student.academicClass || 'None',
                    pathway: student.degreeProgram || student.specialization || 'MIT',
                    specialization: student.academicYear,
                    semester: selectedSemester === 'All' ? 'All' : selectedSemester,
                    academicYear: student.academicYear,
                    tiebreakApplied: false,
                };
            });

        rankings.sort((a, b) => {
            if (Math.abs(a.gpa - b.gpa) < 0.01) {
                return b.weightedAverage! - a.weightedAverage!;
            }
            return b.gpa - a.gpa;
        });

        rankings.forEach((ranking, index) => {
            ranking.rank = index + 1;
        });

        return rankings;
    };

    const rankings = calculateRankings();

    const filteredRankings = rankings.filter(ranking => {
        const matchesPathway = filterPathway === 'all' || ranking.pathway === filterPathway;
        const matchesSpecialization = filterSpecialization === 'all' || ranking.specialization === filterSpecialization;
        return matchesPathway && matchesSpecialization;
    });

    const getTies = () => {
        const ties: { gpa: number; students: RankingEntry[] }[] = [];
        const gpaGroups = filteredRankings.reduce((acc, ranking) => {
            const gpaKey = ranking.gpa.toFixed(2);
            if (!acc[gpaKey]) {
                acc[gpaKey] = [];
            }
            acc[gpaKey].push(ranking);
            return acc;
        }, {} as Record<string, RankingEntry[]>);

        Object.entries(gpaGroups).forEach(([gpa, students]) => {
            if (students.length > 1) {
                ties.push({ gpa: parseFloat(gpa), students });
            }
        });

        return ties;
    };

    const ties = getTies();

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return Crown;
            case 2: return Trophy;
            case 3: return Medal;
            default: return Award;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'text-yellow-600 bg-yellow-50';
            case 2: return 'text-gray-600 bg-gray-50';
            case 3: return 'text-orange-600 bg-orange-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    const getAcademicClassDistribution = () => {
        const distribution = filteredRankings.reduce((acc, ranking) => {
            const academicClass = ranking.academicClass || 'Pass';
            acc[academicClass] = (acc[academicClass] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(distribution).map(([academicClass, count]) => ({
            academicClass,
            students: count,
            percentage: (count / filteredRankings.length) * 100,
        }));
    };

    const getPathwayDistribution = () => {
        const distribution = filteredRankings.reduce((acc, ranking) => {
            acc[ranking.pathway!] = (acc[ranking.pathway!] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(distribution).map(([pathway, count]) => ({
            pathway,
            students: count,
            percentage: (count / filteredRankings.length) * 100,
        }));
    };

    const exportRankings = () => {
        if (filteredRankings.length === 0) {
            toast.error('No ranking rows to export');
            return;
        }
        const headers = ['Rank', 'Student ID', 'Student Name', 'Academic Year', 'Pathway', 'GPA', 'Tiebreak Score'];
        const rows = filteredRankings.map((r) => [
            String(r.rank),
            r.studentId,
            r.studentName,
            r.academicYear,
            r.pathway || '',
            r.gpa.toFixed(2),
            (r.weightedAverage ?? 0).toFixed(3),
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hod-rankings-${selectedSemester}-${selectedBatch}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Rankings exported as CSV');
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">High Performer Rankings</h1>
                    <p className="text-muted-foreground mt-1">Academic rankings with weighted tiebreaker logic</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowTiebreakDialog(true)}><Target className="mr-2 h-4 w-4" /> Configure Tiebreakers</Button>
                    <Button variant="outline" onClick={exportRankings}><Download className="mr-2 h-4 w-4" /> Export Rankings (CSV)</Button>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Ranking Parameters</CardTitle><CardDescription>Configure batch, semester, and filters for rankings</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="batch">Academic Batch</Label>
                            <Select value={selectedBatch} onValueChange={setSelectedBatch}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Batches</SelectItem>{batchOptions.map((batch: string) => (<SelectItem key={batch} value={batch}>{batch}</SelectItem>))}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="semester">Semester</Label>
                            <Select value={selectedSemester} onValueChange={setSelectedSemester}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="S1">Semester 1</SelectItem><SelectItem value="S2">Semester 2</SelectItem><SelectItem value="All">All Semesters</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pathway">Pathway</Label>
                            <Select value={filterPathway} onValueChange={setFilterPathway}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Pathways</SelectItem>{pathwayOptions.map((pathway: string) => (<SelectItem key={pathway} value={pathway}>{pathway}</SelectItem>))}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization</Label>
                            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Levels</SelectItem>{specializationOptions.map((specialization: string) => (<SelectItem key={specialization} value={specialization}>{specialization}</SelectItem>))}</SelectContent></Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{filteredRankings.length}</div><p className="text-xs text-muted-foreground">In ranking</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Average GPA</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{filteredRankings.length > 0 ? (filteredRankings.reduce((sum, r) => sum + r.gpa, 0) / filteredRankings.length).toFixed(2) : '0.00'}</div><p className="text-xs text-muted-foreground">Cohort average</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Ties Detected</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{ties.length}</div><p className="text-xs text-muted-foreground">GPA groups</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Top Performers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{filteredRankings.filter(r => r.gpa >= 3.5).length}</div><p className="text-xs text-muted-foreground">GPA ≥ 3.5</p></CardContent></Card>
            </div>

            <Tabs defaultValue="rankings" className="space-y-4">
                <TabsList><TabsTrigger value="rankings">Rankings</TabsTrigger><TabsTrigger value="ties">Tie Analysis</TabsTrigger><TabsTrigger value="distribution">Distribution</TabsTrigger><TabsTrigger value="certificates">Certificates</TabsTrigger></TabsList>
                <TabsContent value="rankings" className="space-y-4">
                    <Card><CardHeader><CardTitle>Academic Rankings</CardTitle><CardDescription>Rankings based on GPA with weighted tiebreaker logic</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Student</TableHead><TableHead>Academic Year</TableHead><TableHead>Pathway</TableHead><TableHead>GPA</TableHead><TableHead>Tiebreak Score</TableHead><TableHead>Credits</TableHead><TableHead>Change</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filteredRankings.map((ranking) => { const RankIcon = getRankIcon(ranking.rank); const isTied = ties.some(tie => tie.students.some(s => s.id === ranking.id)); return (<TableRow key={ranking.id}><TableCell><div className="flex items-center gap-2"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getRankColor(ranking.rank)}`}><RankIcon className="h-4 w-4" /></div><span className="font-bold">#{ranking.rank}</span>{isTied && (<Badge variant="outline" className="text-xs">Tied</Badge>)}</div></TableCell><TableCell><div><div className="font-medium">{ranking.studentName}</div><div className="text-sm text-muted-foreground">{ranking.studentId}</div></div></TableCell><TableCell><Badge variant="outline">{ranking.academicYear}</Badge></TableCell><TableCell><Badge variant="secondary">{ranking.pathway}</Badge></TableCell><TableCell><div className="font-bold text-lg text-primary">{ranking.gpa.toFixed(2)}</div><div className="text-xs text-muted-foreground">GPA</div></TableCell><TableCell><div className="text-sm text-muted-foreground">{ranking.weightedAverage?.toFixed(3)}</div></TableCell><TableCell><div className="font-medium">-</div></TableCell><TableCell><div className="text-sm text-gray-600">-</div></TableCell><TableCell><Button variant="outline" size="sm"><Award className="h-4 w-4" /></Button></TableCell></TableRow>); })}</TableBody></Table></CardContent></Card>
                </TabsContent>
                <TabsContent value="ties" className="space-y-4">
                    <Card><CardHeader><CardTitle>Tie Analysis</CardTitle><CardDescription>Analysis of tied GPAs and tiebreaker resolution</CardDescription></CardHeader><CardContent><div className="space-y-4">{ties.length === 0 ? (<div className="text-center py-8 text-muted-foreground"><Target className="h-12 w-12 mx-auto mb-4" /><p>No ties detected in current rankings</p></div>) : (ties.map((tie, index) => (<div key={index} className="p-4 rounded-lg border"><div className="flex items-center gap-2 mb-3"><AlertCircle className="h-5 w-5 text-yellow-600" /><h4 className="font-semibold">Tied GPA: {tie.gpa.toFixed(2)}</h4><Badge variant="outline">{tie.students.length} students</Badge></div><div className="space-y-2">{tie.students.map((student) => (<div key={student.id} className="flex items-center justify-between p-2 rounded bg-muted"><div className="flex items-center gap-3"><span className="font-medium">#{student.rank}</span><span>{student.studentName}</span><Badge variant="secondary">{student.specialization}</Badge></div><div className="text-sm text-muted-foreground">Tiebreak: {student.weightedAverage?.toFixed(3)}</div></div>))}</div><div className="mt-3 text-sm text-muted-foreground"><strong>Tiebreaker factors:</strong> GPA ({tiebreakWeights.gpa}), Credits ({tiebreakWeights.credits}), Attendance ({tiebreakWeights.attendance}), Participation ({tiebreakWeights.participation})</div></div>)))}</div></CardContent></Card>
                </TabsContent>
                <TabsContent value="distribution" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card><CardHeader><CardTitle>Academic Class Distribution</CardTitle><CardDescription>Distribution of students by academic class</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={getAcademicClassDistribution()} cx="50%" cy="50%" labelLine={false} label={(props: any) => `${props.academicClass}: ${props.percentage?.toFixed(1)}%`} outerRadius={80} fill="#8884d8" dataKey="students">{getAcademicClassDistribution().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle>Pathway Distribution</CardTitle><CardDescription>Distribution of students by pathway</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={getPathwayDistribution()}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="pathway" /><YAxis /><Tooltip /><Bar dataKey="students" fill="#8884d8" /></BarChart></ResponsiveContainer></CardContent></Card>
                    </div>
                    <Card><CardHeader><CardTitle>Detailed Distribution</CardTitle></CardHeader><CardContent><div className="space-y-3">{getAcademicClassDistribution().map((item) => (<div key={item.academicClass} className="space-y-2"><div className="flex justify-between text-sm"><span>{item.academicClass}</span><span>{item.students} students ({item.percentage.toFixed(1)}%)</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }} /></div></div>))}</div></CardContent></Card>
                </TabsContent>
                <TabsContent value="certificates" className="space-y-4">
                    <Card><CardHeader><CardTitle>Recognition Certificates</CardTitle><CardDescription>Generate certificates for top performers</CardDescription></CardHeader><CardContent><div className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">First Class</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{filteredRankings.filter(r => r.gpa >= 3.7).length}</div><p className="text-xs text-muted-foreground">GPA ≥ 3.7</p></CardContent></Card><Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Second Upper</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{filteredRankings.filter(r => r.gpa >= 3.0 && r.gpa < 3.7).length}</div><p className="text-xs text-muted-foreground">GPA 3.0-3.69</p></CardContent></Card><Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Top 10</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{Math.min(10, filteredRankings.length)}</div><p className="text-xs text-muted-foreground">Overall ranking</p></CardContent></Card></div><div className="space-y-3"><h4 className="font-semibold">Certificate Templates</h4><div className="grid gap-3 md:grid-cols-2"><div className="p-3 rounded-lg border"><div className="flex items-center gap-2 mb-2"><Crown className="h-5 w-5 text-yellow-600" /><span className="font-medium">Academic Excellence</span></div><p className="text-sm text-muted-foreground">For students with GPA ≥ 3.7</p><Button size="sm" className="mt-2">Generate Certificates</Button></div><div className="p-3 rounded-lg border"><div className="flex items-center gap-2 mb-2"><Trophy className="h-5 w-5 text-blue-600" /><span className="font-medium">Top Performer</span></div><p className="text-sm text-muted-foreground">For top 10 students</p><Button size="sm" className="mt-2">Generate Certificates</Button></div></div></div></div></CardContent></Card>
                </TabsContent>
                <TabsContent value="archive" className="space-y-4">
                </TabsContent>
            </Tabs>

            <Dialog open={showTiebreakDialog} onOpenChange={setShowTiebreakDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Configure Tiebreaker Weights</DialogTitle><DialogDescription>Set the weights for tiebreaker factors when GPAs are tied</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Tiebreaker Logic</AlertTitle><AlertDescription>When students have the same GPA, these factors are used to determine ranking order. Weights must sum to 1.0.</AlertDescription></Alert>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="gpa-weight">GPA Weight</Label><Input id="gpa-weight" type="number" step="0.1" min="0" max="1" value={tiebreakWeights.gpa} onChange={(e) => setTiebreakWeights({ ...tiebreakWeights, gpa: parseFloat(e.target.value) })} /></div>
                            <div className="space-y-2"><Label htmlFor="credits-weight">Credits Weight</Label><Input id="credits-weight" type="number" step="0.1" min="0" max="1" value={tiebreakWeights.credits} onChange={(e) => setTiebreakWeights({ ...tiebreakWeights, credits: parseFloat(e.target.value) })} /></div>
                            <div className="space-y-2"><Label htmlFor="attendance-weight">Attendance Weight</Label><Input id="attendance-weight" type="number" step="0.1" min="0" max="1" value={tiebreakWeights.attendance} onChange={(e) => setTiebreakWeights({ ...tiebreakWeights, attendance: parseFloat(e.target.value) })} /></div>
                            <div className="space-y-2"><Label htmlFor="participation-weight">Participation Weight</Label><Input id="participation-weight" type="number" step="0.1" min="0" max="1" value={tiebreakWeights.participation} onChange={(e) => setTiebreakWeights({ ...tiebreakWeights, participation: parseFloat(e.target.value) })} /></div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                            <div className="text-sm font-medium">Total Weight: {(tiebreakWeights.gpa + tiebreakWeights.credits + tiebreakWeights.attendance + tiebreakWeights.participation).toFixed(1)}</div>
                            {(tiebreakWeights.gpa + tiebreakWeights.credits + tiebreakWeights.attendance + tiebreakWeights.participation) !== 1.0 && (<div className="text-sm text-red-600">Weights must sum to 1.0</div>)}
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowTiebreakDialog(false)}>Cancel</Button><Button onClick={() => { setShowTiebreakDialog(false); toast.success('Tiebreaker weights updated successfully!'); }} disabled={(tiebreakWeights.gpa + tiebreakWeights.credits + tiebreakWeights.attendance + tiebreakWeights.participation) !== 1.0}><Target className="mr-2 h-4 w-4" /> Update Weights</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
