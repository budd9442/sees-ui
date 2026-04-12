'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';

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
                    registration: {
                        include: {
                            grade: true
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

        student.registration.forEach((reg: any) => {
            if (reg.grade) {
                const credits = 3;
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
            academicYear: student.current_level || "L1", // Real level
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
    const [goals, interventions, grades] = await Promise.all([
        prisma.academicGoal.findMany({ where: { student_id: studentId } }),
        prisma.intervention.findMany({ where: { student_id: studentId } }),
        prisma.grade.findMany({ 
            where: { student_id: studentId },
            include: { module: true, semester: true }
        })
    ]);

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

export async function createStudentIntervention(data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const intervention = await prisma.intervention.create({
        data: {
            student_id: data.studentId,
            advisor_id: session.user.id,
            type: data.type,
            title: data.title,
            description: data.description,
            severity: data.severity,
            status: 'ACTIVE',
            suggestions: data.suggestions || []
        }
    });

    return { success: true, intervention };
}

// ----------------------------------------------------------------------
// MESSAGES ACTIONS
// ----------------------------------------------------------------------

export async function getAdvisorMessagesData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const [adviseesResponse, dbMessages] = await Promise.all([
        getAdviseesData(),
        prisma.message.findMany({
            where: {
                OR: [
                    { sender_id: session.user.id },
                    { recipient_id: session.user.id }
                ]
            },
            orderBy: { sent_at: 'desc' },
            take: 50
        })
    ]);

    const messages = dbMessages.map(m => ({
        id: m.message_id,
        senderId: m.sender_id,
        senderName: m.sender_id === session.user.id ? (session.user.name || 'Advisor') : 'Student', 
        senderRole: m.sender_id === session.user.id ? 'advisor' : 'student',
        receiverId: m.recipient_id,
        receiverName: m.recipient_id === session.user.id ? (session.user.name || 'Advisor') : 'Student',
        subject: m.subject,
        content: m.content,
        isRead: !!m.read_at,
        createdAt: m.sent_at.toISOString(),
    }));

    return {
        students: adviseesResponse.students,
        messages
    };
}

export async function sendAdvisorMessage(data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const message = await prisma.message.create({
        data: {
            sender_id: session.user.id,
            recipient_id: data.receiverId,
            subject: data.subject,
            content: data.content,
        }
    });

    return { success: true, message };
}

export async function acknowledgeIntervention(interventionId: string, notes?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const result = await prisma.intervention.update({
        where: { intervention_id: interventionId },
        data: {
            status: 'RESOLVED',
            suggestions: {
                push: notes ? [`Student Acknowledgment: ${notes}`] : ['Student Acknowledged']
            }
        }
    });

    return { success: true, intervention: result };
}
