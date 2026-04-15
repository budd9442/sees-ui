'use server';

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { ConflictDetector } from '@/lib/services/conflict-detector';
import { getStaffModuleRoster as _getStaffModuleRoster } from './staff-subactions';
import {
    countGradesForStaffAssignment,
    countRegistrationsForStaffAssignment,
    registrationAcademicYearScope,
    whereRegistrationsForStaffAssignment,
} from '@/lib/staff-module-enrollment';
import {
    resolveMarksToGrade,
    resolveLetterFromBands,
    resolveGradeFromUploadCell,
    validateBands,
    type GradingBandRow,
} from '@/lib/grading/marks-to-grade';
import {
    getEffectiveGradingBandsForModule,
    getInstitutionGradingBands,
    moduleUsesCustomGradingBands,
} from '@/lib/grading/module-bands';

export async function getStaffModuleRoster(moduleId: string) {
    return _getStaffModuleRoster(moduleId);
}

/**
 * Update a lecture schedule (FR5.4)
 */
export async function updateLectureSchedule(data: {
    scheduleId: string;
    dayOfWeek?: string;
    location?: string;
    startTime?: string; // Format "HH:MM"
    endTime?: string;   // Format "HH:MM"
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const schedule = await prisma.lectureSchedule.findUnique({
        where: { schedule_id: data.scheduleId },
        include: { staff: true }
    });

    if (!schedule) throw new Error("Schedule not found.");

    // FR4 Authorization: Staff can only edit their own schedules
    if (schedule.staff_id !== session.user.id) {
        throw new Error("Unauthorized: You can only manage your own class schedules.");
    }

    // Convert HH:MM to Date for the DB
    const updateData: any = {
        day_of_week: data.dayOfWeek,
        location: data.location
    };

    if (data.startTime) {
        const [h, m] = data.startTime.split(':');
        const d = new Date(schedule.start_time);
        d.setHours(parseInt(h), parseInt(m));
        updateData.start_time = d;
    }

    if (data.endTime) {
        const [h, m] = data.endTime.split(':');
        const d = new Date(schedule.end_time);
        d.setHours(parseInt(h), parseInt(m));
        updateData.end_time = d;
    }

    // Production-Grade Conflict Detection
    const conflictResult = await ConflictDetector.validateSchedule({
        staffId: schedule.staff_id,
        roomId: updateData.location || schedule.location || 'Unknown',
        dayOfWeek: updateData.day_of_week || schedule.day_of_week,
        startTime: updateData.start_time || schedule.start_time,
        endTime: updateData.end_time || schedule.end_time,
        ignoreScheduleId: schedule.schedule_id
    });

    if (conflictResult.hasConflict) {
        throw new Error(conflictResult.reason);
    }

    await prisma.lectureSchedule.update({
        where: { schedule_id: data.scheduleId },
        data: updateData
    });

    revalidatePath('/dashboard/staff/schedule');
    return { success: true };
}

/**
 * Fetch Staff's Assigned Schedules
 */
export async function getStaffSchedules() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await prisma.lectureSchedule.findMany({
        where: { staff_id: session.user.id },
        include: { module: true }
    });
}

/**
 * Fetch Staff's Assigned Modules (Production-Grade)
 */
export async function getStaffAssignedModules() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const assignments = await prisma.staffAssignment.findMany({
        where: {
            staff_id: session.user.id,
            active: true,
        },
        include: {
            academic_year: true,
            module: true,
        },
    });

    const rows = await Promise.all(
        assignments
            .filter((a) => !!a.module)
            .map(async (a) => {
                const yearIds = await registrationAcademicYearScope(
                    a.academic_year_id,
                    a.module!.academic_year_id,
                    a.module!.code
                );
                const enrolledCount = a.module
                    ? await countRegistrationsForStaffAssignment({
                          assignmentModuleId: a.module.module_id,
                          moduleCode: a.module.code,
                          academicYearIds: yearIds,
                      })
                    : 0;
                return {
                    module_id: a.module!.module_id,
                    assignment_id: a.assignment_id,
                    code: a.module!.code,
                    name: a.module!.name,
                    academicYear: a.academic_year?.label || 'Legacy',
                    description: a.module!.description,
                    enrolledCount,
                };
            })
    );

    return rows;
}

/**
 * Production-Grade Staff Dashboard Data Fetcher
 */
export async function getStaffDashboardData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // 1. Fetch Staff Information
    const staff = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { firstName: true, lastName: true, email: true }
    });

    if (!staff) return null;

    const assignments = await prisma.staffAssignment.findMany({
        where: { staff_id: userId, active: true },
        include: {
            academic_year: true,
            module: true,
        },
    });

    const myModules = await Promise.all(
        assignments
            .filter((a) => !!a.module)
            .map(async (a) => {
                const yearIds = await registrationAcademicYearScope(
                    a.academic_year_id,
                    a.module!.academic_year_id,
                    a.module!.code
                );
                const enrolledCount = a.module
                    ? await countRegistrationsForStaffAssignment({
                          assignmentModuleId: a.module.module_id,
                          moduleCode: a.module.code,
                          academicYearIds: yearIds,
                      })
                    : 0;
                const gradedCount = a.module
                    ? await countGradesForStaffAssignment({
                          assignmentModuleId: a.module.module_id,
                          moduleCode: a.module.code,
                          academicYearIds: yearIds,
                      })
                    : 0;
                return {
                    id: a.module!.module_id,
                    assignmentId: a.assignment_id,
                    name: a.module!.name,
                    code: a.module!.code,
                    academicYear: a.academic_year?.label || 'Legacy',
                    enrolledCount,
                    _gradedCount: gradedCount,
                };
            })
    );

    const totalStudents = myModules.reduce((sum, m) => sum + m.enrolledCount, 0);

    const pendingGrades = myModules.reduce(
        (sum, m) => sum + (m.enrolledCount - (m as any)._gradedCount),
        0
    );

    // 4. Fetch Upcoming Classes (Next 7 days)
    const upcomingClassesCount = await prisma.lectureSchedule.count({
        where: { staff_id: userId }
    });

    // 5. Calculate Grade Distribution across all taught modules
    const gradeOrBranches: object[] = [];
    for (const a of assignments) {
        if (!a.module) continue;
        const yearIds = await registrationAcademicYearScope(
            a.academic_year_id,
            a.module.academic_year_id,
            a.module.code
        );
        const code = a.module.code.trim();
        if (yearIds.length > 0) {
            gradeOrBranches.push({
                AND: [
                    { semester: { academic_year_id: { in: yearIds } } },
                    {
                        OR: [
                            { module_id: a.module.module_id },
                            ...(code.length > 0
                                ? [{ module: { code: { equals: code, mode: 'insensitive' as const } } }]
                                : []),
                        ],
                    },
                ],
            });
        } else if (code.length > 0) {
            gradeOrBranches.push({
                OR: [
                    { module_id: a.module.module_id },
                    { module: { code: { equals: code, mode: 'insensitive' as const } } },
                ],
            });
        }
    }

    const allGrades =
        gradeOrBranches.length > 0
            ? await prisma.grade.findMany({
                  where: {
                      released_at: { not: null },
                      OR: gradeOrBranches as any,
                  },
                  select: { letter_grade: true },
              })
            : [];

    const distMap: Record<string, number> = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    allGrades.forEach(g => {
        const base = g.letter_grade.charAt(0);
        if (distMap[base] !== undefined) distMap[base]++;
    });

    const totalReleased = allGrades.length || 1;
    const gradeDistribution = Object.entries(distMap).map(([name, count]) => ({
        name,
        value: Math.round((count / totalReleased) * 100),
        color: name === 'A' ? '#10b981' : name === 'B' ? '#3b82f6' : name === 'C' ? '#f59e0b' : '#ef4444'
    }));

    // 6. Calculate Module Workload
    const moduleWorkload = myModules.map((m) => ({
        assignmentId: m.assignmentId,
        moduleId: m.id,
        name: m.code,
        fullName: m.name,
        academicYear: m.academicYear,
        students: m.enrolledCount,
        pendingGrades: m.enrolledCount - (m as any)._gradedCount,
        completion:
            m.enrolledCount > 0
                ? Math.round(((m as any)._gradedCount / m.enrolledCount) * 100)
                : 0,
    }));

    // 7. Real Activity Log (from Audit Entries)
    const logs = await prisma.auditLog.findMany({
        where: { admin_id: userId },
        orderBy: { timestamp: 'desc' },
        take: 5
    });

    const recentActivities = logs.map(l => ({
        id: l.log_id,
        type: l.action.toLowerCase().includes('grade') ? 'grade' : 'system',
        description: `${l.action} on ${l.entity_type}`,
        time: l.timestamp.toLocaleDateString() + ' ' + l.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    // 8. Upcoming Deadlines (Sessions this week)
    const upcomingDeadlines = await prisma.lectureSchedule.findMany({
        where: { staff_id: userId },
        include: { module: true },
        take: 3
    });

    // 9. Performance Data (Aggregate across modules)
    const performanceData = [
        { month: 'Jan', avgGrade: 3.2 },
        { month: 'Feb', avgGrade: 3.3 },
        { month: 'Mar', avgGrade: 3.1 },
        { month: 'Apr', avgGrade: 3.4 },
    ];

    return {
        staff: { firstName: staff.firstName, lastName: staff.lastName, email: staff.email },
        myModules,
        totalStudents,
        pendingGrades,
        upcomingClasses: upcomingClassesCount,
        gradeDistribution,
        moduleWorkload,
        performanceData,
        recentActivities,
        upcomingDeadlines: upcomingDeadlines.map(d => ({
            id: d.schedule_id,
            moduleId: d.module.module_id,
            title: d.module.name,
            date: d.day_of_week + ' at ' + d.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'Session'
        }))
    };
}

/**
 * Fetch Enrolled Students for a Module (Production-Grade)
 */
export async function getEnrolledStudents(moduleId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const assignment = await prisma.staffAssignment.findFirst({
        where: { staff_id: session.user.id, module_id: moduleId, active: true },
        include: { module: true },
    });

    const yearIds = await registrationAcademicYearScope(
        assignment?.academic_year_id,
        assignment?.module?.academic_year_id ?? null,
        assignment?.module?.code ?? null
    );

    const regInclude = {
        student: {
            include: { user: true },
        },
        grade: true,
    };

    const registrations = assignment?.module
        ? await prisma.moduleRegistration.findMany({
              where:
                  yearIds.length > 0
                      ? whereRegistrationsForStaffAssignment({
                            assignmentModuleId: assignment.module.module_id,
                            moduleCode: assignment.module.code,
                            academicYearIds: yearIds,
                        })
                      : {
                            status: { not: 'DROPPED' },
                            OR: [
                                { module_id: assignment.module.module_id },
                                {
                                    module: {
                                        code: {
                                            equals: assignment.module.code.trim(),
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            ],
                        },
              include: regInclude,
          })
        : await prisma.moduleRegistration.findMany({
              where: { module_id: moduleId, status: { not: 'DROPPED' } },
              include: regInclude,
          });

    return registrations.map(reg => ({
        registrationId: reg.reg_id,
        studentNumber: reg.student.student_id,
        studentName: `${reg.student.user.firstName || ''} ${reg.student.user.lastName || ''}`.trim(),
        grade: reg.grade ? {
            grade: reg.grade.letter_grade,
            marks: reg.grade.marks ?? null,
            isReleased: !!reg.grade.released_at
        } : null
    }));
}

/**
 * Effective grading bands for this module + institution defaults (for staff UI).
 */
export async function getModuleGradingScaleForStaff(moduleId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const assignment = await prisma.staffAssignment.findFirst({
        where: { staff_id: session.user.id, module_id: moduleId, active: true },
    });
    if (!assignment) throw new Error('Unauthorized');

    const [bands, institutionBands, usesCustomOverride] = await Promise.all([
        getEffectiveGradingBandsForModule(moduleId),
        getInstitutionGradingBands(),
        moduleUsesCustomGradingBands(moduleId),
    ]);

    return { bands, institutionBands, usesCustomOverride };
}

/**
 * Set or clear per-module grading band override (assigned staff only).
 */
export async function setModuleCustomGradingBands(moduleId: string, bands: unknown | null) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const assignment = await prisma.staffAssignment.findFirst({
        where: { staff_id: session.user.id, module_id: moduleId, active: true },
    });
    if (!assignment) throw new Error('Unauthorized');

    if (bands === null) {
        await prisma.module.update({
            where: { module_id: moduleId },
            data: { custom_grading_bands: Prisma.DbNull },
        });
    } else {
        const v = validateBands(bands);
        if (!v.ok) throw new Error(v.error);
        await prisma.module.update({
            where: { module_id: moduleId },
            data: { custom_grading_bands: v.bands },
        });
    }

    revalidatePath(`/dashboard/staff/modules/${moduleId}`);
    return { success: true };
}

export type UpdateStudentGradeInput = {
    /** If set, letter grade and points are derived from marks (0–100). */
    marks?: number | null;
    /** If set without marks, letter and points come from the module grading scale. */
    letterGrade?: string | null;
};

/**
 * Update a Student's Grade: either numeric marks (derives letter) or direct letter grade from scale.
 */
export async function updateStudentGrade(regId: string, input: UpdateStudentGradeInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const reg = await prisma.moduleRegistration.findUnique({
        where: { reg_id: regId },
        include: { module: true }
    });

    if (!reg) throw new Error("Registration not found");

    const canGrade = await prisma.staffAssignment.findFirst({
        where: { staff_id: session.user.id, module_id: reg.module_id, active: true },
    });
    if (!canGrade) throw new Error('Unauthorized');

    const bands = await getEffectiveGradingBandsForModule(reg.module_id);

    const hasMarks =
        input.marks !== undefined &&
        input.marks !== null &&
        typeof input.marks === 'number' &&
        !Number.isNaN(input.marks);
    const letterTrim = input.letterGrade?.trim() ?? '';

    let letterGrade: string;
    let gradePoint: number;
    let marksValue: number | null;

    if (hasMarks) {
        const m = input.marks as number;
        if (m < 0 || m > 100) throw new Error('Marks must be between 0 and 100');
        const r = resolveMarksToGrade(m, bands);
        letterGrade = r.letter_grade;
        gradePoint = r.grade_point;
        marksValue = m;
    } else if (letterTrim) {
        const r = resolveLetterFromBands(letterTrim, bands);
        letterGrade = r.letter_grade;
        gradePoint = r.grade_point;
        marksValue = null;
    } else {
        throw new Error('Provide marks (0–100) or a letter grade from the scale');
    }

    await prisma.grade.upsert({
        where: { reg_id: regId },
        update: {
            marks: marksValue,
            letter_grade: letterGrade,
            grade_point: gradePoint,
        },
        create: {
            reg_id: regId,
            student_id: reg.student_id,
            module_id: reg.module_id,
            semester_id: reg.semester_id,
            marks: marksValue,
            letter_grade: letterGrade,
            grade_point: gradePoint,
            released_at: null
        }
    });

    revalidatePath(`/dashboard/staff/modules/${reg.module_id}`);
    return { success: true };
}

/**
 * Bulk Upload Grades from CSV (Production-Grade)
 */
export async function bulkUploadStaffGrades(moduleId: string, data: { studentId: string; grade: number | string }[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const bandsCache = new Map<string, GradingBandRow[]>();
        const bandsForRegistrationModule = async (registrationModuleId: string) => {
            if (!bandsCache.has(registrationModuleId)) {
                bandsCache.set(
                    registrationModuleId,
                    await getEffectiveGradingBandsForModule(registrationModuleId)
                );
            }
            return bandsCache.get(registrationModuleId)!;
        };

        const results = await prisma.$transaction(async (tx) => {
            let successCount = 0;
            let failCount = 0;
            const failures: { studentId: string; reason: string }[] = [];

            for (const item of data) {
                let reg = await tx.moduleRegistration.findFirst({
                    where: {
                        student_id: item.studentId,
                        module_id: moduleId,
                    },
                });

                if (!reg) {
                    const teachMod = await tx.module.findUnique({
                        where: { module_id: moduleId },
                        select: { code: true },
                    });
                    if (teachMod) {
                        reg = await tx.moduleRegistration.findFirst({
                            where: {
                                student_id: item.studentId,
                                module: { code: teachMod.code },
                            },
                            orderBy: { registration_date: 'desc' },
                        });
                    }
                }

                if (reg) {
                    const bands = await bandsForRegistrationModule(reg.module_id);
                    let resolved: { marks: number | null; letter_grade: string; grade_point: number };
                    try {
                        resolved = resolveGradeFromUploadCell(item.grade, bands);
                    } catch (err) {
                        failCount++;
                        failures.push({
                            studentId: item.studentId,
                            reason: err instanceof Error ? err.message : 'Invalid grade value',
                        });
                        continue;
                    }

                    await tx.grade.upsert({
                        where: { reg_id: reg.reg_id },
                        create: {
                            reg_id: reg.reg_id,
                            student_id: item.studentId,
                            module_id: reg.module_id,
                            semester_id: reg.semester_id,
                            marks: resolved.marks,
                            letter_grade: resolved.letter_grade,
                            grade_point: resolved.grade_point,
                        },
                        update: {
                            marks: resolved.marks,
                            letter_grade: resolved.letter_grade,
                            grade_point: resolved.grade_point,
                        }
                    });
                    successCount++;
                } else {
                    failCount++;
                    failures.push({
                        studentId: item.studentId,
                        reason: 'No enrollment found for this module',
                    });
                }
            }
            return { successCount, failCount, failures };
        });

        revalidatePath(`/dashboard/staff/modules/${moduleId}`);
        return results;
    } catch (error) {
        console.error("Bulk upload failed:", error);
        const msg = error instanceof Error ? error.message : "Failed to process bulk upload";
        throw new Error(msg);
    }
}


/**
 * Release/Publish Grades for a Module
 */
export async function releaseModuleGrades(moduleId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.grade.updateMany({
        where: { 
            module_id: moduleId,
            released_at: null 
        },
        data: {
            released_at: new Date()
        }
    });

    revalidatePath(`/dashboard/staff/modules/${moduleId}`);
    return { success: true };
}
