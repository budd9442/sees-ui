'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    GraduationCap,
    BookOpen,
    Award,
    Download,
    CheckCircle2,
    Clock,
    FileText,
    Target,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportTabularData } from '@/lib/export';

interface CreditsClientProps {
    studentGrades: any[];
}

/** Released module counts toward credit using grade points (letter-only ok) or legacy marks ≥ 50. */
function earnsModuleCredit(g: any) {
    if (!g.isReleased) return false;
    const pts = g.gradePoint ?? g.points ?? 0;
    if (pts >= 2) return true;
    const m = g.marks ?? (typeof g.grade === 'number' ? g.grade : null);
    return m != null && typeof m === 'number' && m >= 50;
}

export function CreditsClient({ studentGrades }: CreditsClientProps) {
    const [selectedSemester, setSelectedSemester] = useState('all');

    // Calculate credit totals
    const totalCreditsEarned = studentGrades.filter(earnsModuleCredit).reduce((sum, g) => sum + g.credits, 0);

    const totalCreditsAttempted = studentGrades
        .filter(g => g.isReleased)
        .reduce((sum, g) => sum + g.credits, 0);

    const totalCreditsRequired = 132; // Honours graduation requirement per guide
    const creditsRemaining = totalCreditsRequired - totalCreditsEarned;
    const progressPercentage = Math.round((totalCreditsEarned / totalCreditsRequired) * 100);

    // Group by academic year and semester
    const creditsByYear = studentGrades.reduce((acc, grade) => {
        const year = grade.academicYear;
        const semester = grade.semester;
        const key = `${year}-${semester}`;

        if (!acc[key]) {
            acc[key] = {
                year,
                semester,
                creditsEarned: 0,
                creditsAttempted: 0,
                gpa: 0,
                grades: [],
            };
        }

        if (grade.isReleased) {
            acc[key].creditsAttempted += grade.credits;
            if (earnsModuleCredit(grade)) {
                acc[key].creditsEarned += grade.credits;
            }
            acc[key].grades.push(grade);
        }

        return acc;
    }, {} as Record<string, any>);

    // Calculate GPA for each semester
    Object.values(creditsByYear).forEach((semester: any) => {
        if (semester.grades.length > 0) {
            const totalPoints = semester.grades.reduce((sum: number, grade: any) => {
                return sum + (grade.points * grade.credits);
            }, 0);
            const totalCredits = semester.grades.reduce((sum: number, grade: any) => {
                return sum + grade.credits;
            }, 0);
            semester.gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
        }
    });

    // Academic year requirements
    const yearRequirements = {
        L1: { min: 24, max: 30, description: 'Foundation year modules' },
        L2: { min: 24, max: 30, description: 'Core degree modules' },
        L3: { min: 24, max: 30, description: 'Advanced modules and project' },
        L4: { min: 24, max: 30, description: 'Final year and research project' },
    } as const;

    const getGradeColor = (grade: number) => {
        if (grade >= 80) return 'text-green-600';
        if (grade >= 70) return 'text-blue-600';
        if (grade >= 60) return 'text-yellow-600';
        if (grade >= 50) return 'text-orange-600';
        return 'text-red-600';
    };

    const getLetterGradeColor = (letterGrade: string) => {
        switch (letterGrade) {
            case 'A': case 'A+': return 'text-green-600';
            case 'B': case 'B+': return 'text-blue-600';
            case 'C': case 'C+': return 'text-yellow-600';
            case 'D': case 'D+': return 'text-orange-600';
            case 'F': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const handleExportTranscript = async () => {
        try {
            const rows = studentGrades
                .filter((g) => g.isReleased)
                .map((grade) => ({
                    moduleCode: grade.moduleCode,
                    moduleTitle: grade.moduleTitle,
                    credits: grade.credits,
                    marks: grade.marks ?? '',
                    letterGrade: grade.letterGrade,
                    semester: grade.semester,
                    academicYear: grade.academicYear,
                }));
            await exportTabularData(rows, 'pdf', { filename: `transcript-${Date.now()}`, title: 'Academic Transcript' });
            toast.success('Transcript exported as PDF');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to export transcript');
        }
    };

    const handleExportProgress = async () => {
        try {
            const rows = Object.values(creditsByYear).map((semester: any) => ({
                academicYear: semester.year,
                semester: semester.semester,
                creditsEarned: semester.creditsEarned,
                creditsAttempted: semester.creditsAttempted,
                gpa: semester.gpa.toFixed(2),
            }));
            await exportTabularData(rows, 'csv', { filename: `credit-progress-${Date.now()}` });
            toast.success('Credit progress exported as CSV');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to export progress');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Credit Progress</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your academic progress and credit requirements
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => void handleExportProgress()}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export Progress
                    </Button>
                    <Button onClick={() => void handleExportTranscript()}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Transcript
                    </Button>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCreditsEarned}</div>
                        <p className="text-xs text-muted-foreground">out of {totalCreditsRequired} required</p>
                        <Progress value={progressPercentage} className="mt-2 h-1" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{creditsRemaining}</div>
                        <p className="text-xs text-muted-foreground">to graduation</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Credits Attempted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCreditsAttempted}</div>
                        <p className="text-xs text-muted-foreground">total attempted</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalCreditsAttempted > 0 ? Math.round((totalCreditsEarned / totalCreditsAttempted) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">pass rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Progress */}
            <Tabs defaultValue="semester" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="semester">By Semester</TabsTrigger>
                    <TabsTrigger value="year">By Academic Year</TabsTrigger>
                    <TabsTrigger value="transcript">Full Transcript</TabsTrigger>
                </TabsList>

                <TabsContent value="semester" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Semester Progress</CardTitle>
                            <CardDescription>Credit progress by semester</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.values(creditsByYear).map((semester: any) => (
                                    <div key={`${semester.year}-${semester.semester}`} className="p-4 rounded-lg border">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold">
                                                    {semester.year} - {semester.semester}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {semester.grades.length} modules completed
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">{semester.gpa.toFixed(2)}</div>
                                                <p className="text-xs text-muted-foreground">GPA</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Credits Earned</div>
                                                <div className="font-semibold">{semester.creditsEarned}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Credits Attempted</div>
                                                <div className="font-semibold">{semester.creditsAttempted}</div>
                                            </div>
                                        </div>
                                        <Progress
                                            value={semester.creditsAttempted > 0 ? (semester.creditsEarned / semester.creditsAttempted) * 100 : 0}
                                            className="h-2"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="year" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Year Progress</CardTitle>
                            <CardDescription>Credit requirements by academic year</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(yearRequirements).map(([year, req]) => {
                                    const yearCredits = studentGrades
                                        .filter((g) => g.academicYear === year && earnsModuleCredit(g))
                                        .reduce((sum, g) => sum + g.credits, 0);

                                    const isComplete = yearCredits >= req.min;

                                    return (
                                        <div key={year} className="p-4 rounded-lg border">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold">{year} Requirements</h4>
                                                    <p className="text-sm text-muted-foreground">{req.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isComplete ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Clock className="h-5 w-5 text-yellow-600" />
                                                    )}
                                                    <Badge variant={isComplete ? 'default' : 'secondary'}>
                                                        {isComplete ? 'Complete' : 'In Progress'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 mb-3">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Earned</div>
                                                    <div className="font-semibold">{yearCredits}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Required</div>
                                                    <div className="font-semibold">{req.min}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Maximum</div>
                                                    <div className="font-semibold">{req.max}</div>
                                                </div>
                                            </div>
                                            <Progress
                                                value={Math.min((yearCredits / req.min) * 100, 100)}
                                                className="h-2"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transcript" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Transcript</CardTitle>
                            <CardDescription>Complete record of all completed modules</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Module Code</TableHead>
                                        <TableHead>Module Title</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Letter Grade</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Year</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentGrades
                                        .filter(g => g.isReleased)
                                        .sort((a, b) => {
                                            // Sort by year, then semester, then module code
                                            if (a.academicYear !== b.academicYear) {
                                                return a.academicYear.localeCompare(b.academicYear);
                                            }
                                            if (a.semester !== b.semester) {
                                                return a.semester.localeCompare(b.semester);
                                            }
                                            return a.moduleCode.localeCompare(b.moduleCode);
                                        })
                                        .map((grade) => (
                                            <TableRow key={grade.id}>
                                                <TableCell className="font-medium">{grade.moduleCode}</TableCell>
                                                <TableCell>{grade.moduleTitle}</TableCell>
                                                <TableCell>{grade.credits}</TableCell>
                                                <TableCell
                                                    className={
                                                        grade.marks != null && typeof grade.marks === 'number'
                                                            ? getGradeColor(grade.marks)
                                                            : 'text-muted-foreground'
                                                    }
                                                >
                                                    {grade.marks != null && typeof grade.marks === 'number'
                                                        ? grade.marks
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className={getLetterGradeColor(grade.letterGrade)}>
                                                    {grade.letterGrade}
                                                </TableCell>
                                                <TableCell>{grade.semester}</TableCell>
                                                <TableCell>{grade.academicYear}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Graduation Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Graduation Timeline</CardTitle>
                    <CardDescription>Estimated timeline to graduation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold">Current Progress</h4>
                                <p className="text-sm text-muted-foreground">
                                    {totalCreditsEarned} of {totalCreditsRequired} credits completed
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold">{progressPercentage}%</div>
                                <p className="text-xs text-muted-foreground">complete</p>
                            </div>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />

                        {creditsRemaining > 0 && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-semibold text-blue-900">Next Steps</h4>
                                </div>
                                <p className="text-sm text-blue-800">
                                    You need {creditsRemaining} more credits to graduate.
                                    At your current pace, you should be able to complete your degree requirements
                                    within the next {Math.ceil(creditsRemaining / 24)} semesters.
                                </p>
                            </div>
                        )}

                        {creditsRemaining <= 0 && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap className="h-5 w-5 text-green-600" />
                                    <h4 className="font-semibold text-green-900">Congratulations!</h4>
                                </div>
                                <p className="text-sm text-green-800">
                                    You have completed all credit requirements for graduation!
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
