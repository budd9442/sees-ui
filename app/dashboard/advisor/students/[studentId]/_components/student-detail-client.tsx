'use client';

import { useState } from 'react';
import { getAcademicClass } from '@/lib/gpa-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Target,
    Download,
    Flag,
    Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { createStudentIntervention } from '@/lib/actions/advisor-subactions';
import { useRouter } from 'next/navigation';

export default function StudentDetailClient({ initialData, currentUserId }: { initialData: any, currentUserId: string }) {
    const router = useRouter();
    const { student, goals: initialGoals, interventions: initialInterventions, grades: initialGrades, modules } = initialData;
    const [interventions, setInterventions] = useState(initialInterventions);

    const [showInterventionDialog, setShowInterventionDialog] = useState(false);
    const [interventionData, setInterventionData] = useState({
        type: 'manual' as 'gpa_drop' | 'class_decline' | 'attendance_issue' | 'academic_warning' | 'manual',
        title: '',
        description: '',
        suggestions: [] as string[],
        severity: 'medium' as 'low' | 'medium' | 'high',
    });
    const [advisorNote, setAdvisorNote] = useState('');

    const studentGrades = initialGrades.filter((g: any) => g.isReleased);
    const totalPoints = studentGrades.reduce((sum: number, grade: any) => sum + (grade.points * grade.credits), 0);
    const totalCredits = studentGrades.reduce((sum: number, grade: any) => sum + grade.credits, 0);
    const currentGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

    const academicClass = getAcademicClass(currentGPA);

    const gpaTrendData = [
        { semester: 'S1 2023', gpa: 3.2 },
        { semester: 'S2 2023', gpa: 3.4 },
        { semester: 'S1 2025', gpa: 3.1 },
        { semester: 'S2 2025', gpa: currentGPA },
    ];

    const attendanceData = [
        { module: 'CS101', attendance: 95 },
        { module: 'CS102', attendance: 88 },
        { module: 'CS201', attendance: 92 },
        { module: 'CS202', attendance: 85 },
    ];

    const isAtRisk = currentGPA < 2.5 || studentGrades.some((g: any) => g.points < 2.0);

    const handleCreateIntervention = async () => {
        const newIntervention = {
            studentId: student.id,
            advisorId: currentUserId,
            type: interventionData.type,
            title: interventionData.title,
            description: interventionData.description,
            triggerReason: 'Manual intervention by advisor',
            severity: interventionData.severity,
            suggestions: interventionData.suggestions,
            resources: [],
            status: 'active',
            advisorNotes: advisorNote,
        };

        try {
            const _i = await createStudentIntervention(newIntervention);
            if (!_i.success) {
                toast.error(_i.error || 'Could not create intervention');
                return;
            }
            setShowInterventionDialog(false);
            setInterventionData({
                type: 'manual',
                title: '',
                description: '',
                suggestions: [],
                severity: 'medium',
            });
            setAdvisorNote('');
            toast.success('Intervention created successfully');
            router.refresh();
        } catch (e) {
            toast.error('Failed to create intervention');
        }
    };

    const handleAddSuggestion = () => {
        const suggestion = prompt('Enter a suggestion:');
        if (suggestion) {
            setInterventionData(prev => ({
                ...prev,
                suggestions: [...prev.suggestions, suggestion],
            }));
        }
    };

    const handleRemoveSuggestion = (index: number) => {
        setInterventionData(prev => ({
            ...prev,
            suggestions: prev.suggestions.filter((_, i) => i !== index),
        }));
    };

    const exportStudentRecord = () => {
        toast.success('Student record exported successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Student Detail View</h1>
                    <p className="text-muted-foreground mt-1">Comprehensive view of {student.firstName} {student.lastName}'s academic progress</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportStudentRecord}><Download className="mr-2 h-4 w-4" /> Export Record</Button>
                    <Button onClick={() => setShowInterventionDialog(true)}><Flag className="mr-2 h-4 w-4" /> Create Intervention</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Current GPA</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{currentGPA.toFixed(2)}</div><p className="text-xs text-muted-foreground">Grade points</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Academic Class</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{academicClass}</div><p className="text-xs text-muted-foreground">Current standing</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Credits Earned</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalCredits}</div><p className="text-xs text-muted-foreground">Out of 120 required</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Risk Status</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{isAtRisk ? <Badge variant="destructive">At Risk</Badge> : <Badge variant="default">Good Standing</Badge>}</div><p className="text-xs text-muted-foreground">Academic status</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2"><Label className="text-muted-foreground">Student ID</Label><div className="font-medium">{student.studentId}</div></div>
                        <div className="space-y-2"><Label className="text-muted-foreground">Academic Year</Label><div className="font-medium">{student.academicYear}</div></div>
                        <div className="space-y-2"><Label className="text-muted-foreground">Pathway</Label><div className="font-medium">{student.specialization}</div></div>
                        <div className="space-y-2"><Label className="text-muted-foreground">Email</Label><div className="font-medium">{student.email}</div></div>
                        <div className="space-y-2"><Label className="text-muted-foreground">Phone</Label><div className="font-medium">Not provided</div></div>
                        <div className="space-y-2"><Label className="text-muted-foreground">Advisor</Label><div className="font-medium">Dr. Smith (You)</div></div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="interventions">Interventions</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>GPA Trend</CardTitle><CardDescription>Academic performance over time</CardDescription></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={gpaTrendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semester" /><YAxis domain={[0, 4]} /><Tooltip /><Line type="monotone" dataKey="gpa" stroke="#8884d8" strokeWidth={2} /></LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Recent Performance</CardTitle><CardDescription>Latest module grades</CardDescription></CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {studentGrades.slice(-5).map((grade: any) => {
                                        const module = modules.find((m: any) => m.id === grade.moduleId);
                                        return (
                                            <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg border">
                                                <div>
                                                    <div className="font-medium">{module?.title}</div>
                                                    <div className="text-sm text-muted-foreground">{module?.code}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">{grade.grade}</div>
                                                    <div className="text-sm text-muted-foreground">{grade.points?.toFixed(1)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {isAtRisk && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Student At Risk</AlertTitle>
                            <AlertDescription>This student's academic performance indicates they may need additional support. Consider creating an intervention or scheduling a meeting to discuss their progress.</AlertDescription>
                        </Alert>
                    )}
                </TabsContent>

                <TabsContent value="grades" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Academic Record</CardTitle><CardDescription>Complete grade history for {student.firstName}</CardDescription></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Module</TableHead><TableHead>Code</TableHead><TableHead>Credits</TableHead><TableHead>Grade</TableHead><TableHead>Points</TableHead><TableHead>Semester</TableHead><TableHead>Status</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentGrades.map((grade: any) => {
                                        const module = modules.find((m: any) => m.id === grade.moduleId);
                                        return (
                                            <TableRow key={grade.id}>
                                                <TableCell className="font-medium">{module?.title}</TableCell>
                                                <TableCell>{module?.code}</TableCell>
                                                <TableCell>{grade.credits}</TableCell>
                                                <TableCell><Badge variant={grade.letterGrade === 'F' ? 'destructive' : 'default'}>{grade.letterGrade}</Badge></TableCell>
                                                <TableCell>{grade.points?.toFixed(1)}</TableCell>
                                                <TableCell>{grade.semester}</TableCell>
                                                <TableCell><Badge variant={grade.isReleased ? 'default' : 'secondary'}>{grade.isReleased ? 'Released' : 'Pending'}</Badge></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Academic Goals</CardTitle><CardDescription>Student's academic and personal goals</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {initialGoals.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground"><Target className="h-12 w-12 mx-auto mb-4" /><p>No goals set yet</p></div>
                                ) : (
                                    initialGoals.map((goal: any) => (
                                        <div key={goal.id} className="p-4 rounded-lg border">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold">{goal.title}</h4>
                                                    {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                                                </div>
                                                <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>{goal.priority}</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm"><span>Progress</span><span>{goal.currentProgress}%</span></div>
                                                <Progress value={goal.currentProgress} className="h-2" />
                                            </div>
                                            {goal.deadline && <div className="mt-2 text-sm text-muted-foreground">Deadline: {new Date(goal.deadline).toLocaleDateString()}</div>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="interventions" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Academic Interventions</CardTitle><CardDescription>History of academic support and interventions</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {interventions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground"><Flag className="h-12 w-12 mx-auto mb-4" /><p>No interventions recorded</p></div>
                                ) : (
                                    interventions.map((intervention: any) => (
                                        <div key={intervention.id} className="p-4 rounded-lg border">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold">{intervention.title}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">{intervention.description}</p>
                                                </div>
                                                <Badge variant={intervention.severity === 'high' ? 'destructive' : intervention.severity === 'medium' ? 'default' : 'secondary'}>{intervention.severity}</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm text-muted-foreground">Type: {intervention.type.replace('_', ' ')}</div>
                                                <div className="text-sm text-muted-foreground">Created: {new Date(intervention.createdAt).toLocaleDateString()}</div>
                                                <div className="text-sm text-muted-foreground">Status: {intervention.status}</div>
                                                {intervention.suggestions?.length > 0 && (
                                                    <div className="mt-2">
                                                        <h5 className="text-sm font-medium">Suggestions:</h5>
                                                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                                                            {intervention.suggestions.map((suggestion: string, index: number) => <li key={index}>{suggestion}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Attendance Record</CardTitle><CardDescription>Attendance across different modules</CardDescription></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={attendanceData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="module" /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="attendance" fill="#8884d8" /></BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showInterventionDialog} onOpenChange={setShowInterventionDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Create Academic Intervention</DialogTitle><DialogDescription>Create a new intervention for {student.firstName}</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type">Intervention Type</Label>
                                <Select value={interventionData.type} onValueChange={(value) => setInterventionData({ ...interventionData, type: value as any })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpa_drop">GPA Drop</SelectItem>
                                        <SelectItem value="class_decline">Class Decline</SelectItem>
                                        <SelectItem value="attendance_issue">Attendance Issue</SelectItem>
                                        <SelectItem value="academic_warning">Academic Warning</SelectItem>
                                        <SelectItem value="manual">Manual Intervention</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="severity">Severity</Label>
                                <Select value={interventionData.severity} onValueChange={(value) => setInterventionData({ ...interventionData, severity: value as any })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" value={interventionData.title} onChange={(e) => setInterventionData({ ...interventionData, title: e.target.value })} placeholder="Brief title for the intervention" /></div>
                        <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={interventionData.description} onChange={(e) => setInterventionData({ ...interventionData, description: e.target.value })} placeholder="Detailed description of the intervention" rows={4} /></div>
                        <div className="space-y-2">
                            <Label>Suggestions</Label>
                            <div className="space-y-2">
                                {interventionData.suggestions.map((suggestion, index) => (
                                    <div key={index} className="flex items-center gap-2"><span className="flex-1 text-sm">{suggestion}</span><Button variant="outline" size="sm" onClick={() => handleRemoveSuggestion(index)}>Remove</Button></div>
                                ))}
                                <Button variant="outline" onClick={handleAddSuggestion}><Plus className="mr-2 h-4 w-4" /> Add Suggestion</Button>
                            </div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="advisorNote">Advisor Notes</Label><Textarea id="advisorNote" value={advisorNote} onChange={(e) => setAdvisorNote(e.target.value)} placeholder="Internal notes for advisor use" rows={3} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowInterventionDialog(false)}>Cancel</Button><Button onClick={handleCreateIntervention}><Flag className="mr-2 h-4 w-4" /> Create Intervention</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
