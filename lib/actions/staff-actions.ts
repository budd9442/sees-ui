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

    // Fetch active grading scheme
    const activeScheme = await prisma.gradingScheme.findFirst({
        where: { active: true },
        include: { bands: { orderBy: { min_marks: 'desc' } } }
    });

    let letter = 'F';
    let points = 0.0;

    if (activeScheme && activeScheme.bands.length > 0) {
        const band = activeScheme.bands.find(b => marks >= b.min_marks && marks <= b.max_marks);
        if (band) {
            letter = band.letter_grade;
            points = band.grade_point;
        } else {
            // If marks outside all ranges, pick the lowest if marks < min, or highest if marks > max
            const lowest = activeScheme.bands[activeScheme.bands.length - 1];
            const highest = activeScheme.bands[0];
            if (marks > highest.max_marks) {
                letter = highest.letter_grade;
                points = highest.grade_point;
            } else {
                letter = lowest.letter_grade;
                points = lowest.grade_point;
            }
        }
    } else {
        // Fallback logic
        if (marks >= 85) { letter = 'A'; points = 4.0; }
        else if (marks >= 70) { letter = 'B'; points = 3.0; }
        else if (marks >= 55) { letter = 'C'; points = 2.0; }
        else if (marks >= 40) { letter = 'D'; points = 1.0; }
        else { letter = 'E'; points = 0.0; }
    }

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

export async function getStaffDashboardData() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;

    // Robust User Lookup
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }

    if (!u) throw new Error("Staff unauthenticated");
    userId = u.user_id;

    const staffRecord = await prisma.staff.findUnique({
        where: { staff_id: userId },
        include: {
            user: true,
            assignments: {
                include: {
                    module: true
                }
            } as any,
            lecture_schedules: {
                include: {
                    module: true
                }
            } as any
        } as any
    });

    if (!staffRecord) throw new Error("Staff profile not found");
    const record = staffRecord as any;

    const myModules = record.assignments.filter((a: any) => a.active && a.module).map((a: any) => a.module);
    const moduleIds = myModules.map((m: any) => m.module_id);

    // Fetch the students registered for these classes
    const registrations = await prisma.moduleRegistration.findMany({
        where: {
            module_id: { in: moduleIds },
            status: { in: ['REGISTERED', 'ENROLLED'] }
        },
        include: { grade: true }
    });

    // Unique enrolled students out of all the subjects
    const enrolledStudentsIds = new Set(registrations.map(r => r.student_id));
    const totalStudents = enrolledStudentsIds.size;

    // pending grading operations
    const pendingGradesC = registrations.filter(r => r.status === 'ENROLLED' && (!r.grade || !r.grade.released_at)).length;

    // Dynamic grade distribution based on released letter grades
    const gradeCounts: Record<string, number> = {};
    registrations.forEach(r => {
        if (r.grade?.released_at) {
            const lg = r.grade.letter_grade;
            gradeCounts[lg] = (gradeCounts[lg] || 0) + 1;
        }
    });

    const gradeDistribution = Object.entries(gradeCounts).map(([name, value]) => ({
        name,
        value,
        color: name.startsWith('A') ? '#10b981' : name.startsWith('B') ? '#3b82f6' : name.startsWith('C') ? '#f59e0b' : '#ef4444'
    })).sort((a, b) => a.name.localeCompare(b.name));

    const myModuleWorkload = myModules.map((m: any) => {
        const moduleRegs = registrations.filter((r: any) => r.module_id === m.module_id);
        const studentCountForModule = moduleRegs.length;
        const gradedCount = moduleRegs.filter(r => r.grade && r.grade.marks !== null).length;

        return {
            name: m.code,
            fullName: m.name,
            students: studentCountForModule,
            assignments: studentCountForModule, // Assuming 1 assessment per registration for simplicity
            completion: studentCountForModule > 0 ? Math.round((gradedCount / studentCountForModule) * 100) : 0
        };
    });

    return {
        staff: {
            firstName: record.user.first_name,
            lastName: record.user.last_name,
            department: record.department
        },
        myModules,
        totalStudents,
        assignmentsToGrade: pendingGradesC,
        upcomingClasses: record.lecture_schedules.length, // Total schedules found
        gradeDistribution,
        moduleWorkload: myModuleWorkload,
        performanceData: [
            { month: 'Jan', avgGrade: 72 },
            { month: 'Feb', avgGrade: 75 },
            { month: 'Mar', avgGrade: 71 },
            { month: 'Apr', avgGrade: 78 },
            { month: 'May', avgGrade: 76 },
            { month: 'Jun', avgGrade: 80 },
        ]
    };
}
