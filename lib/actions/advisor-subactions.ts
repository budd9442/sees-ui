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
                // assume each module is 3 credits for mock setup unless fetched
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
            firstName: student.user.first_name,
            lastName: student.user.last_name,
            email: student.user.email,
            academicYear: "2024", // Mock
            specialization: student.specialization_rel?.name || "Undeclared",
            currentGPA: currentGPA || 3.5, // Mock default if no grades
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

    // Mock data for goals, interventions, grades, modules
    const goals = [
        { id: "GOAL1", studentId, title: "Improve GPA", description: "Target 3.8", priority: "high", currentProgress: 60 }
    ];

    const interventions = [
        { id: "INT1", studentId, type: "academic_warning", title: "Low grades", description: "Failing two subjects", severity: "high", status: "active", suggestions: ["Attend tutoring"], createdAt: new Date().toISOString() }
    ];

    const grades = [
        { id: "G1", studentId, moduleId: "MOD1", credits: 3, points: 4.0, letterGrade: "A", semester: "S1", isReleased: true },
        { id: "G2", studentId, moduleId: "MOD2", credits: 3, points: 2.0, letterGrade: "C", semester: "S1", isReleased: true }
    ];

    const modules = [
        { id: "MOD1", code: "CS101", title: "Intro to CS" },
        { id: "MOD2", code: "Math101", title: "Calculus" }
    ];

    return {
        student,
        goals,
        interventions,
        grades,
        modules
    };
}

export async function createStudentIntervention(data: any) {
    // Mock save intervention
    return { success: true, intervention: { id: `INT_${Date.now()}`, ...data, createdAt: new Date().toISOString() } };
}

// ----------------------------------------------------------------------
// MESSAGES ACTIONS
// ----------------------------------------------------------------------

export async function getAdvisorMessagesData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const adviseesResponse = await getAdviseesData();
    const myStudents = adviseesResponse.students.slice(0, 24);

    // Mock messages for testing
    const messages = [
        {
            id: `MSG1`,
            senderId: session.user.id,
            senderName: session.user.name || 'Advisor',
            senderRole: 'advisor',
            receiverId: myStudents[0]?.id || 'STU1',
            receiverName: myStudents[0]?.firstName || 'Student',
            subject: 'Meeting Setup',
            content: 'Hello, please schedule a meeting with me.',
            isRead: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
        }
    ];

    return {
        students: myStudents,
        messages
    };
}

export async function sendAdvisorMessage(data: any) {
    // Mock send message
    return { success: true, message: { id: `MSG_${Date.now()}`, ...data, isRead: false, createdAt: new Date().toISOString() } };
}
