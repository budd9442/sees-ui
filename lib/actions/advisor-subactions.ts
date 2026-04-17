'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { gradeContributesToGpa } from '@/lib/gpa-utils';

export async function getAdviseesData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const advisorRecord: any = await (prisma.advisor as any).findUnique({
        where: { advisor_id: session.user.id },
        include: {
            students: {
                include: {
                    user: true,
                    specialization: true,
                    module_registrations: {
                        include: {
                            grade: true,
                            module: true,
                        }
                    }
                }
            }
        }
    });

    if (!advisorRecord) {
        // Return empty if not an advisor or no students
        return { students: [] };
    }

    const students = advisorRecord.students.map((student: any) => {
        // Calculate GPA based on registration/grades
        let totalPoints = 0;
        let totalCredits = 0;
        let totalGrades = 0;

        student.module_registrations.forEach((reg: any) => {
            if (reg.grade && gradeContributesToGpa(reg.module)) {
                const credits = reg.module.credits;
                totalPoints += reg.grade.grade_point * credits;
                totalCredits += credits;
                totalGrades += 1;
            }
        });

        const currentGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

        return {
            id: student.student_id,
            studentId: student.student_id,
            firstName: student.user.firstName,
            lastName: student.user.lastName,
            email: student.user.email,
            academicYear: student.current_level || "Level 1", // Real level
            specialization: student.specialization?.name || "Undeclared",
            currentGPA: currentGPA || student.current_gpa || 0.0, // Real GPA
            totalCredits,
            totalGrades,
            avatar: student.user.avatar_url || null,
        };
    });

    return { students };
}

// ----------------------------------------------------------------------
// STUDENT DETAILS ACTIONS
// ----------------------------------------------------------------------

export async function getAdvisorStudentDetails(studentId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const adviseesResponse = await getAdviseesData();
    const student = adviseesResponse.students.find((s: any) => s.id === studentId);

    if (!student) throw new Error("Student not found");

    // Real data from DB
    const [goals, grades] = await Promise.all([
        prisma.academicGoal.findMany({ where: { student_id: studentId } }),
        prisma.grade.findMany({
            where: { student_id: studentId },
            include: { module: true, semester: true },
        }),
    ]);
    const interventions: Array<{
        intervention_id: string;
        student_id: string;
        type: string;
        title: string;
        description: string;
        severity: string;
        status: string;
        suggestions: string[];
        created_at: Date;
    }> = [];

    const formattedGrades = grades.map(g => ({
        id: g.grade_id,
        studentId,
        moduleId: g.module_id,
        credits: g.module.credits,
        points: g.grade_point,
        letterGrade: g.letter_grade,
        semester: g.semester.label,
        isReleased: !!g.released_at
    }));

    const modules = grades.map(g => ({
        id: g.module.module_id,
        code: g.module.code,
        title: g.module.name
    }));

    return {
        student,
        goals: goals.map(g => ({
            id: g.goal_id,
            studentId,
            title: g.title,
            description: g.description,
            priority: g.priority,
            currentProgress: g.progress
        })),
        interventions: interventions.map(i => ({
            id: i.intervention_id,
            studentId,
            type: i.type,
            title: i.title,
            description: i.description,
            severity: i.severity,
            status: i.status,
            createdAt: i.created_at.toISOString()
        })),
        grades: formattedGrades,
        modules
    };
}

export async function createStudentIntervention(_data: unknown) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    return { success: false as const, error: 'Interventions are not available in this deployment.' };
}

// ----------------------------------------------------------------------
// MESSAGES ACTIONS
// ----------------------------------------------------------------------

export async function getAdvisorMessagesData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const [{ getMyMessages }, adviseesResponse] = await Promise.all([
        import('@/lib/actions/message-actions'),
        getAdviseesData(),
    ]);
    const { messages, nextCursor } = await getMyMessages({ limit: 150 });

    return {
        students: adviseesResponse.students,
        messages,
        nextCursor,
    };
}

export async function sendAdvisorMessage(data: {
    receiverId: string;
    subject: string;
    content: string;
}) {
    const { sendDirectMessage } = await import('@/lib/actions/message-actions');
    const result = await sendDirectMessage({
        recipientId: data.receiverId,
        subject: data.subject,
        content: data.content,
    });
    return { success: true as const, message: result.message };
}

export async function acknowledgeIntervention(_interventionId: string, _notes?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    return { success: false as const, error: 'Interventions are not available in this deployment.' };
}
