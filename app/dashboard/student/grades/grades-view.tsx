'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import { calculateGPA } from '@/lib/gpa-utils';
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
import { exportTabularData } from '@/lib/export';
import { toast } from 'sonner';

interface Grade {
    id: string;
    moduleCode: string;
    moduleName: string;
    credits: number;
    grade: number | string;
    gradePoint: number;
    /** When false, excluded from GPA (matches server `gradeContributesToGpa`). */
    countsTowardGpa?: boolean;
    semester: string;
    level: string;
    isReleased: boolean;
}

interface GradesViewProps {
    initialGrades: Grade[];
    initialOverallGpa?: number;
}

export function GradesView({ initialGrades, initialOverallGpa }: GradesViewProps) {
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

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
    // Only released grades should contribute to GPA (server GPA does this too).
    const bestByModule = new Map<string, Grade>();
    const consider = (grades: Grade[]) => {
        for (const g of grades) {
            if (!g.isReleased) continue;
            const key = g.moduleCode;
            const prev = bestByModule.get(key);
            if (!prev || g.gradePoint > prev.gradePoint) bestByModule.set(key, g);
        }
    };

    // Overall GPA: best grade per module across all semesters.
    consider(initialGrades);
    const bestReleasedForCalc = [...bestByModule.values()].map((g) => ({
        ...g,
        // Map to structure expected by calculateGPA (needs 'points' instead of 'gradePoint')
        points: g.gradePoint,
    }));

    const overallGPA = initialOverallGpa ?? calculateGPA(bestReleasedForCalc as any);

    const filteredGrades =
        selectedSemester === 'all'
            ? initialGrades
            : gradesBySemester[selectedSemester] || [];

    const currentSemesterGPA =
        selectedSemester === 'all'
            ? overallGPA
            : (() => {
                  // Semester GPA: best grade per module within the selected semester scope.
                  const map = new Map<string, Grade>();
                  for (const g of gradesBySemester[selectedSemester] || []) {
                      if (!g.isReleased) continue;
                      const key = g.moduleCode;
                      const prev = map.get(key);
                      if (!prev || g.gradePoint > prev.gradePoint) map.set(key, g);
                  }
                  const best = [...map.values()].map((g) => ({ ...g, points: g.gradePoint }));
                  return calculateGPA(best as any);
              })();

    const totalCredits = filteredGrades.reduce((sum, g) => sum + g.credits, 0);

    const handleExportGrades = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const rows = filteredGrades.map((grade) => ({
                module_code: grade.moduleCode,
                module_name: grade.moduleName,
                credits: grade.credits,
                level: grade.level,
                semester: grade.semester,
                grade: grade.grade,
                grade_point: grade.gradePoint,
                released: grade.isReleased ? 'Yes' : 'No',
            }));

            await exportTabularData(rows as Record<string, unknown>[], 'csv', {
                filename: `grades_${selectedSemester === 'all' ? 'all' : selectedSemester.replace(/\s+/g, '_').toLowerCase()}`,
            });
            toast.success('Grades exported successfully.');
        } catch (e: any) {
            toast.error(e?.message || 'Failed to export grades');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Grades"
                description="View your academic performance and grade history"
            >
                <Button variant="outline" onClick={handleExportGrades} disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export Grades'}
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
