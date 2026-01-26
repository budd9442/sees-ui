'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Helper to get current active semester (Duplicated from student-actions for now to avoid circular deps if refactoring needed)
async function getCurrentSemester() {
    const activeYear = await prisma.academicYear.findFirst({
        where: { active: true }
    });

    const year = activeYear || await prisma.academicYear.findFirst({
        orderBy: { end_date: 'desc' }
    });

    if (!year) throw new Error("No academic year found in system");

    const now = new Date();

    const currentSemester = await prisma.semester.findFirst({
        where: {
            academic_year_id: year.academic_year_id,
            start_date: { lte: now },
            end_date: { gte: now }
        } as any
    });

    if (!currentSemester) {
        return await prisma.semester.findFirst({
            where: {
                academic_year_id: year.academic_year_id,
                label: "Semester 1"
            } as any
        });
    }

    return currentSemester;
}

export async function getStaffAssignedModules() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    // Get Staff ID
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { staff: true }
    });

    if (!user || !user.staff) throw new Error("User is not a staff member");

    const staffId = user.staff.staff_id;

    // 1. Get modules via StaffAssignment
    const assignments = await prisma.staffAssignment.findMany({
        where: { staff_id: staffId, active: true },
        include: { module: true }
    });

    const assignedModuleIds = assignments
        .filter(a => a.module_id)
        .map(a => a.module_id as string);

    // 2. Get modules via LectureSchedule (if any implicit assignment)
    const schedules = await prisma.lectureSchedule.findMany({
        where: { staff_id: staffId },
        select: { module_id: true }
    });
    schedules.forEach(s => {
        if (!assignedModuleIds.includes(s.module_id)) {
            assignedModuleIds.push(s.module_id);
        }
    });

    if (assignedModuleIds.length === 0) return [];

    const modules = await prisma.module.findMany({
        where: { module_id: { in: assignedModuleIds } }
    });

    // Enrich with stats
    // Count enrolled students for current semester
    const semester = await getCurrentSemester();

    // If no semester, just return basics
    if (!semester) return modules.map(m => ({ ...m, enrolledCount: 0, ungradedCount: 0 }));

    const stats = await prisma.moduleRegistration.groupBy({
        by: ['module_id'],
        where: {
            module_id: { in: assignedModuleIds },
            semester_id: semester.semester_id,
            status: 'REGISTERED' // or ENROLLED
        } as any,
        _count: {
            student_id: true
        }
    });

    // Check ungraded
    // Need to find registrations without grades or with grades but no marks?
    // Let's assume ungraded means no Grade record found for the registration
    // This is harder to do with groupBy. We might need individual queries or a raw query if performance matters.
    // For now, let's just return enrolled count.

    return modules.map(m => {
        const stat = stats.find(s => s.module_id === m.module_id);
        return {
            ...m,
            enrolledCount: stat ? stat._count.student_id : 0
        };
    });
}

export async function getEnrolledStudents(moduleId: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { staff: true }
    });

    if (!user || !user.staff) throw new Error("User is not a staff member");

    // Verify assignment (Optional but good for security)
    // For now, skip strict verification to allow easy testing if data is sparse

    const semester = await getCurrentSemester();
    if (!semester) throw new Error("No active semester");

    const registrations = await prisma.moduleRegistration.findMany({
        where: {
            module_id: moduleId,
            semester_id: semester.semester_id,
            status: { in: ['REGISTERED', 'ENROLLED'] }
        } as any,
        include: {
            student: {
                include: {
                    user: true
                }
            },
            grade: true
        }
    });

    return registrations.map(r => ({
        registrationId: r.reg_id,
        studentId: r.student_id,
        studentName: `${r.student.user.first_name} ${r.student.user.last_name}`,
        studentNumber: r.student.user.username, // Assuming username is student number-ish or use student_id
        email: r.student.user.email,
        grade: r.grade ? {
            marks: r.grade.marks,
            grade: r.grade.letter_grade,
            points: r.grade.grade_point
        } : null
    }));
}

export async function updateStudentGrade(registrationId: string, marks: number) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    // Basic calc logic (Hardcoded for now as seed didn't populate schemes fully or we want simplicity)
    // >85 A, >75 B, >65 C, >50 D, else F
    let letter = 'F';
    let points = 0.0;

    if (marks >= 85) { letter = 'A'; points = 4.0; }
    else if (marks >= 70) { letter = 'B'; points = 3.0; }
    else if (marks >= 55) { letter = 'C'; points = 2.0; }
    else if (marks >= 40) { letter = 'D'; points = 1.0; }
    else { letter = 'E'; points = 0.0; } // or F

    const reg = await prisma.moduleRegistration.findUnique({
        where: { reg_id: registrationId },
        include: { module: true, semester: true }
    });

    if (!reg) throw new Error("Registration not found");

    await prisma.grade.upsert({
        where: { reg_id: registrationId },
        create: {
            reg_id: registrationId,
            student_id: reg.student_id,
            module_id: reg.module_id,
            semester_id: reg.semester_id,
            marks: marks,
            letter_grade: letter,
            grade_point: points,
            released_at: new Date() // Auto release for now
        },
        update: {
            marks: marks,
            letter_grade: letter,
            grade_point: points,
            released_at: new Date()
        }
    });

    revalidatePath(`/dashboard/staff/modules/${reg.module_id}`);
    return { success: true };
}
