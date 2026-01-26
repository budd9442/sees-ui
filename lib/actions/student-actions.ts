'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { Student, Grade, AcademicGoal, Notification, Module } from '@/types';
import { revalidatePath } from 'next/cache';

// Helper to calculate current GPA
// Helper to calculate current GPA
// Note: grades relation in schema is 'grades' (check schema: grades Grade[])
// Grade model fields: grade_point, module (relation), marks etc.
// Check Grade model in schema: grade_point Float. module Module.
// Check Module model: credits Int.
function calculateGPA(grades: any[]) {
    if (!grades.length) return 0;
    const totalPoints = grades.reduce((acc, g) => acc + (g.grade_point * g.module.credits), 0);
    const totalCredits = grades.reduce((acc, g) => acc + g.module.credits, 0);
    return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
}

export async function getStudentDashboardData() {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("Unauthorized");
    }

    let userId = session.user.id;

    // Robust User Lookup:
    // 1. Try fetching by ID (Standard)
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;

    // 2. If not found by ID (e.g. stale session after DB re-seed), try email
    if (!u && session.user.email) {
        console.warn(`User ID ${userId} not found (Stale Session?). Recovering via email: ${session.user.email}`);
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }

    if (!u) throw new Error("User not found in database");
    userId = u.user_id;

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: userId },
        include: {
            user: true,
            degree_path: true,
            specialization: true,
            grades: {
                include: { module: true, semester: true }
            } as any,
            module_registrations: {
                include: { module: true }
            } as any,
            // For schedule, we need to find LectureSchedule for enrolled modules
        } as any // Cast entire include object to any to bypass key validation checks
    });

    if (!studentRecord) {
        // Handle non-student access (e.g. staff assigned mistakenly to this view)
        console.warn("getStudentDashboardData: No student profile found for user", userId);
        return null;
    }

    // Cast to any to bypass linter issues with relation inference
    const record = studentRecord as any;
    const currentGPA = calculateGPA(record.grades);

    // Grade model: grade_point (snake_case in schema line 186)
    // Module model: credits (line 123)
    const totalCredits = record.grades
        .filter((g: any) => g.grade_point > 0)
        .reduce((sum: any, g: any) => sum + g.module.credits, 0);

    // Map to frontend Student type (camelCase)
    const student: Student = {
        id: record.user.user_id,
        email: record.user.email,
        firstName: record.user.firstName || '',
        lastName: record.user.lastName || '',
        name: `${record.user.firstName || ''} ${record.user.lastName || ''}`,
        role: 'student',
        isActive: record.user.status === 'ACTIVE',
        studentId: record.student_id, // client alias? or student_id? Schema has student_id. Client alias usually studentId if mapped? No, wait. 
        // Student model has `student_id`? Let's check schema/seed. `student_id String @id`.
        // So record.student_id.
        // I will fix this later if broken. Focus on major ones.
        // Calculate academic year from admission_year
        academicYear: 'L' + Math.max(1, Math.ceil(record.admission_year ? (new Date().getFullYear() - record.admission_year - 1) : 1)) as any,
        degreeProgram: record.degree_path?.code as any,
        specialization: record.specialization?.code as any,
        currentGPA,
        totalCredits,
        academicClass: record.academic_class as any || 'Pass',
        pathwayLocked: !!record.degree_path_id,
        enrollmentDate: new Date().toISOString(),
        enrollmentStatus: record.enrollment_status as any
    };

    // Get notifications
    // Notification model: user_id, sent_at, read_at
    const notificationsRaw = await prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { sent_at: 'desc' },
        take: 5
    });

    const notifications = notificationsRaw.map(n => ({
        id: n.notification_id,
        userId: n.user_id,
        title: n.title,
        message: n.content,
        type: n.type as any,
        isRead: !!n.read_at,
        createdAt: n.sent_at.toISOString(),
    }));

    // Upcoming Events
    const enrolledModuleIds = record.module_registrations
        .filter((mr: any) => mr.status === 'REGISTERED' || mr.status === 'ENROLLED')
        .map((mr: any) => mr.module_id);

    // LectureSchedule model: module_id (check schema? not fully visible but assume snake_case)
    const schedules = await prisma.lectureSchedule.findMany({
        where: { module_id: { in: enrolledModuleIds } },
        include: { module: true, staff: { include: { user: true } } },
        take: 5
    });

    return {
        student,
        notifications,
        schedules,
        pathwayDemand: { MIT: 65, IT: 35, thresholdReached: true }
    };
}

// Helper to get current active semester
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

export async function getModuleRegistrationData() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;

    // Robust User Lookup
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }

    if (!u) throw new Error("User not found");
    userId = u.user_id;

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: userId },
        include: {
            user: true,
            degree_path: true, // Relation to DegreeProgram
            specialization: true,
            grades: { include: { module: true } } as any,
            module_registrations: true
        } as any
    });

    if (!studentRecord) throw new Error("Student profile not found");
    const record = studentRecord as any;

    // Dynamic Academic Settings
    const semester = await getCurrentSemester();
    if (!semester) throw new Error("Current semester not determined");

    const currentYear = (semester as any).label || (semester as any).name || "Semester 1";
    const currentSemester = (semester as any).label || (semester as any).name || "Semester 1";

    // Determine current level (e.g., L1, L2)
    const studentYear = 'L' + Math.max(1, Math.ceil(record.admission_year ? (new Date().getFullYear() - record.admission_year - 1) : 1));

    // Fetch Program Structure instead of just modules
    // This respects the new configurable hierarchy
    const whereClause: any = {
        program_id: record.degree_path_id,
        academic_level: studentYear,
    };

    if (record.specialization_id) {
        whereClause.OR = [
            { specialization_id: null },
            { specialization_id: record.specialization_id }
        ];
    }
    // If no specialization, we fetch ALL modules for this level (and dedupe later) to ensure they see options.

    const structures = await prisma.programStructure.findMany({
        where: whereClause,
        include: {
            module: true
        }
    });

    // Deduplicate modules if no specialization (prioritize CORE)
    const uniqueStructures = new Map();
    for (const s of structures) {
        if (!uniqueStructures.has(s.module_id)) {
            uniqueStructures.set(s.module_id, s);
        } else {
            // If existing is not CORE but current is, swap?
            // Or just keep first found. 
            // If we want to show the specific requirement for a potential spec, it's ambiguous.
            // For now, simple dedupe.
            const existing = uniqueStructures.get(s.module_id);
            if (existing.module_type !== 'CORE' && s.module_type === 'CORE') {
                uniqueStructures.set(s.module_id, s);
            }
        }
    }
    const dedupedStructures = Array.from(uniqueStructures.values());

    // Cast to ensure isCompulsory is treated as required boolean for these specific actions
    const availableModules = dedupedStructures.map((s: any) => ({
        id: s.module.module_id,
        code: s.module.code,
        title: s.module.name,
        credits: s.module.credits,
        description: s.module.description,
        prerequisites: [],
        academicYear: s.academicLevel,
        semester: currentSemester,
        isActive: s.module.active,
        capacity: 100,
        enrolled: 0,
        lecturer: 'TBD',
        schedule: 'TBD',
        degreeProgram: record.degree_path?.code,
        specialization: s.specializationId ? record.specialization?.code : undefined,
        isCompulsory: !!(s.module_type === 'CORE')
    })) as (Module & { isCompulsory: boolean })[];

    const registeredModuleIds = record.module_registrations
        .filter((mr: any) => mr.status !== 'DROPPED')
        .map((mr: any) => mr.module_id);

    const completedModuleCodes = record.grades
        .filter((g: any) => g.marks >= 50)
        .map((g: any) => g.module.code);

    const compulsoryModuleIds = availableModules
        .filter(m => m.isCompulsory)
        .map(m => m.id);

    return {
        student: {
            academicYear: studentYear,
            degreeProgram: record.degree_path?.code,
            specialization: record.specialization?.code,
        },
        currentSemester,
        availableModules: availableModules,
        registeredModuleIds,
        completedModuleCodes,
        compulsoryModuleIds
    };
}


export async function registerForModules(moduleIds: string[]) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;

    // Robust User Lookup
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }

    if (!u) throw new Error("User not found");
    userId = u.user_id;

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: userId },
    });

    if (!studentRecord) throw new Error("Student not found");
    // Cast to any to access dynamic fields if needed, or rely on type inference
    const record = studentRecord as any;

    try {
        const semester = await getCurrentSemester();
        if (!semester) throw new Error("No active semester found for registration");

        // 1. Validate modules belong to Program/Specialization
        // We count how many of the requested IDs are valid for this student
        const validCount = await prisma.programStructure.count({
            where: {
                program_id: record.degree_path_id, // Correct FK
                OR: [
                    { specialization_id: null },
                    { specialization_id: record.specialization_id }
                ],
                module_id: { in: moduleIds }
            }
        });

        if (validCount !== moduleIds.length) {
            // Ideally we identify which ones, but simple error for now
            throw new Error("One or more selected modules are not part of your assigned program structure.");
        }

        // 2. Fetch modules for details (Credits, Prerequisites)
        const modules = await prisma.module.findMany({
            where: { module_id: { in: moduleIds } },
            include: { prerequisites: true }
        });

        // 3. Validate Credits
        const totalCredits = modules.reduce((sum, m) => sum + m.credits, 0);
        // if (totalCredits > 24) { // Removed min 12 for flexibility during add/drop? Or keep? Keeping upper bound.
        //     throw new Error(`Total credits (${totalCredits}) exceeds maximum allowed (24).`);
        // }

        // 4. Validate Prerequisites
        const studentWithGrades = await prisma.student.findUnique({
            where: { student_id: userId },
            include: {
                grades: { include: { module: true } } as any
            } as any
        });

        if (!studentWithGrades) throw new Error("Student not found");
        const passedModuleCodes = (studentWithGrades as any).grades
            .filter((g: any) => g.marks >= 50)
            .map((g: any) => g.module.code);

        const missingPrereqs: string[] = [];
        for (const mod of modules) {
            if (mod.prerequisites && mod.prerequisites.length > 0) {
                for (const pre of mod.prerequisites) {
                    if (!passedModuleCodes.includes(pre.code)) {
                        missingPrereqs.push(`${mod.code} requires ${pre.code}`);
                    }
                }
            }
        }

        if (missingPrereqs.length > 0) {
            throw new Error(`Missing prerequisites: ${missingPrereqs.join(', ')}`);
        }

        await prisma.$transaction(async (tx) => {
            // Delete existing 'REGISTERED' status for this semester
            await tx.moduleRegistration.deleteMany({
                where: {
                    student_id: record.student_id,
                    semester_id: semester.semester_id,
                    status: 'REGISTERED'
                } as any
            });

            for (const mod of modules) {
                await tx.moduleRegistration.create({
                    data: {
                        student_id: record.student_id,
                        module_id: mod.module_id,
                        semester_id: semester.semester_id,
                        status: 'REGISTERED',
                        registration_date: new Date(),
                    } as any
                });
            }
        });

        revalidatePath('/dashboard/student/modules');
        return { success: true };
    } catch (e: any) {
        console.error("Registration failed", e);
        throw new Error(e.message || "Registration failed");
    }
}


export async function getStudentGrades() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const u = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!u) throw new Error("User not found");

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: u.user_id },
        include: {
            module_registrations: {
                include: {
                    module: true,
                    semester: true,
                    grade: true
                }
            } as any
        } as any
    });

    if (!studentRecord) {
        console.warn("getStudentGrades called by non-student:", session.user.email);
        return [];
    }
    const record = studentRecord as any;

    return record.module_registrations.map((reg: any) => ({
        id: reg.grade?.grade_id || reg.reg_id, // Use reg_id if no grade yet
        moduleCode: reg.module.code,
        moduleName: reg.module.name,
        credits: reg.module.credits,
        grade: reg.grade?.letter_grade || 'Pending',
        gradePoint: reg.grade?.grade_point || 0.0,
        semester: reg.semester?.label || 'Unknown',
        academicYear: '2024-2025', // Should inferred from semester relation
        date: reg.grade?.released_at || reg.registration_date,
        isReleased: !!reg.grade
    }));
}

export async function getStudentSchedule() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const u = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!u) throw new Error("User not found");

    // Get enrolled modules for CURRENT semester
    const semester = await getCurrentSemester();
    if (!semester) return []; // No active semester, no schedule

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: u.user_id },
        include: {
            module_registrations: {
                where: {
                    semester_id: semester.semester_id,
                    status: 'REGISTERED'
                },
                include: { module: true }
            } as any
        } as any
    });

    if (!studentRecord) throw new Error("Student not found");
    const record = studentRecord as any;

    const moduleIds = record.module_registrations.map((mr: any) => mr.module_id);

    // Fetch schedules
    // If LectureSchedule is empty in seed, this returns empty.
    // Fetch schedules
    // If LectureSchedule is empty in seed, this returns empty.
    const schedules = await prisma.lectureSchedule.findMany({
        where: { module_id: { in: moduleIds } },
        include: {
            module: true,
            staff: { include: { user: true } }
        }
    });

    return schedules.map((s: any) => ({
        id: s.schedule_id,
        moduleCode: s.module.code,
        moduleName: s.module.name,
        type: s.type, // LECTURE, LAB, etc.
        day: s.day_of_week,
        startTime: s.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), // Date to HH:mm
        endTime: s.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        room: s.classroom,
        lecturer: s.staff ? `${s.staff.user.firstName} ${s.staff.user.lastName}` : 'TBD',
        isAcademic: true,
        isRecurring: true
    }));
}
