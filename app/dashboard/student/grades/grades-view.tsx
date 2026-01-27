'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import { calculateGPA } from '@/lib/gpaCalculations';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Grade {
    id: string;
    moduleCode: string;
    moduleName: string;
    credits: number;
    grade: number | string;
    gradePoint: number;
    semester: string;
    level: string;
    isReleased: boolean;
}

interface GradesViewProps {
    initialGrades: Grade[];
}

export function GradesView({ initialGrades }: GradesViewProps) {
    const [selectedSemester, setSelectedSemester] = useState('all');

    // Group grades by semester
    const gradesBySemester = initialGrades.reduce((acc, grade) => {
        const key = `${grade.level} - ${grade.semester}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(grade);
        return acc;
    }, {} as Record<string, Grade[]>);

    const semesters = Object.keys(gradesBySemester).sort();

    // Calculate GPAs
    // Map to structure expected by calculateGPA (needs 'points' instead of 'gradePoint')
    const gradesForCalc = initialGrades.map(g => ({
        ...g,
        points: g.gradePoint
    }));

    const overallGPA = calculateGPA(gradesForCalc as any);

    const filteredGrades =
        selectedSemester === 'all'
            ? initialGrades
            : gradesBySemester[selectedSemester] || [];

    const currentSemesterGPA =
        selectedSemester === 'all'
            ? overallGPA
            : calculateGPA(
                (gradesBySemester[selectedSemester] || []).map(g => ({ ...g, points: g.gradePoint })) as any
            );

    const totalCredits = filteredGrades.reduce((sum, g) => sum + g.credits, 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Grades"
                description="View your academic performance and grade history"
            >
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Transcript
                </Button>
            </PageHeader>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Cumulative GPA
                            </p>
                            <p className="text-3xl font-bold">{overallGPA.toFixed(2)}</p>
                            <div className="flex items-center gap-1 text-sm">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-green-600 font-medium">Good Standing</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                {selectedSemester === 'all' ? 'Overall GPA' : 'Semester GPA'}
                            </p>
                            <p className="text-3xl font-bold">{currentSemesterGPA.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Credits
                            </p>
                            <p className="text-3xl font-bold">{totalCredits}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex justify-end">
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {semesters.map((sem) => (
                            <SelectItem key={sem} value={sem}>
                                {sem}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Grades Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Module Code</TableHead>
                                <TableHead>Module Name</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Semester</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGrades.length > 0 ? (
                                filteredGrades.map((grade) => (
                                    <TableRow key={grade.id}>
                                        <TableCell className="font-medium">{grade.moduleCode}</TableCell>
                                        <TableCell>{grade.moduleName}</TableCell>
                                        <TableCell>{grade.credits}</TableCell>
                                        <TableCell>{grade.level}</TableCell>
                                        <TableCell>{grade.semester}</TableCell>
                                        <TableCell>
                                            <Badge variant={grade.gradePoint >= 2.0 ? 'default' : 'destructive'}>
                                                {grade.grade}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{grade.gradePoint}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                        No grades found for this selection.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
