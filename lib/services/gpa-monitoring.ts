'use server';

import { prisma } from '@/lib/db';

export interface SemesterGPA {
    semesterId: string;
    label: string;
    gpa: number;
    credits: number;
}

export interface GPATrend {
    currentGPA: number;
    previousGPA: number;
    dipDetected: boolean;
    dipAmount: number;
    semesterData: SemesterGPA[];
}

/**
 * Service to Monitor GPA Trajectories and Detect Academic Risk
 */
export class GPAMonitoringService {
    
    /**
     * Calculate GPA for each semester for a specific student
     */
    static async getStudentGPAGraph(studentId: string): Promise<GPATrend> {
        const grades = await prisma.grade.findMany({
            where: { student_id: studentId, released_at: { not: null } },
            include: { module: true, semester: true }
        }) as any[];

        if (grades.length === 0) {
            return { currentGPA: 0, previousGPA: 0, dipDetected: false, dipAmount: 0, semesterData: [] };
        }

        // Group by semester
        const semesterGroups = grades.reduce((acc, g) => {
            const sId = g.semester_id;
            if (!acc[sId]) acc[sId] = { points: 0, credits: 0, label: g.semester.label || 'Unknown' };
            
            const points = g.grade_point || 0;
            const credits = g.module.credits || 0;
            
            acc[sId].points += (points * credits);
            acc[sId].credits += credits;
            return acc;
        }, {} as Record<string, { points: number, credits: number, label: string }>);

        // Sort semesters by ID (assuming UUIDs are not sortable, I'd ideally use a date, but for now I'll use IDs or order by name)
        // Better: Fetch semesters and order by start_date
        const semesters = await prisma.semester.findMany({
            where: { semester_id: { in: Object.keys(semesterGroups) } },
            orderBy: { start_date: 'asc' }
        });

        const semesterData: SemesterGPA[] = semesters.map((s: any) => {
            const data = semesterGroups[s.semester_id];
            return {
                semesterId: s.semester_id,
                label: s.label,
                gpa: data.credits > 0 ? Number((data.points / data.credits).toFixed(2)) : 0,
                credits: data.credits
            };
        });

        if (semesterData.length < 2) {
            const current = semesterData[0]?.gpa || 0;
            return { currentGPA: current, previousGPA: 0, dipDetected: false, dipAmount: 0, semesterData };
        }

        const current = semesterData[semesterData.length - 1].gpa;
        const previous = semesterData[semesterData.length - 2].gpa;
        const dipAmount = previous - current;
        const dipDetected = dipAmount > 0.2; // Trigger threshold

        return {
            currentGPA: current,
            previousGPA: previous,
            dipDetected,
            dipAmount: dipAmount > 0 ? dipAmount : 0,
            semesterData
        };
    }
}
