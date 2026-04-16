'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import {
    registrationAcademicYearScope,
    whereRegistrationsForStaffAssignment,
} from '@/lib/staff-module-enrollment';
import { resolveGradeFromUploadCell, type GradingBandRow } from '@/lib/grading/marks-to-grade';
import { getEffectiveGradingBandsForModule } from '@/lib/grading/module-bands';
import { dispatchNotificationEmail } from '@/lib/notifications/dispatch';
import { NotificationEventKey } from '@/lib/notifications/events';
import {
    captureStandingBeforeRelease,
    notifyAcademicStandingChangesAfterGradeRelease,
} from '@/lib/notifications/academic-standing-on-grade-release';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

export type StaffAnalyticsFilters = {
    academicYearId?: string | null;
    semesterId?: string | null;
};

export async function getStaffAnalyticsFilterOptions() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    if (!['staff', 'advisor', 'hod'].includes(session.user.role)) throw new Error('Unauthorized');

    return prisma.academicYear.findMany({
        select: {
            academic_year_id: true,
            label: true,
            semesters: { select: { semester_id: true, label: true }, orderBy: { start_date: 'asc' } },
        },
        orderBy: { start_date: 'desc' },
    });
}

export async function getStaffAnalytics(filters?: StaffAnalyticsFilters) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    const staffRecord = await prisma.staff.findUnique({
        where: { staff_id: userId },
        include: {
            assignments: {
                include: {
                    academic_year: true,
                    module: true,
                },
            },
        },
    });

    if (!staffRecord) throw new Error("Staff profile not found");

    const staffModulesMap = new Map<string, any>();

    for (const assignment of staffRecord.assignments) {
        if (!assignment.module || staffModulesMap.has(assignment.module.module_id)) continue;
        const m = assignment.module;
        const yearIds = await registrationAcademicYearScope(
            assignment.academic_year_id,
            m.academic_year_id,
            m.code
        );
        const regs = await prisma.moduleRegistration.findMany({
            where:
                yearIds.length > 0
                    ? whereRegistrationsForStaffAssignment({
                          assignmentModuleId: m.module_id,
                          moduleCode: m.code,
                          academicYearIds: yearIds,
                      })
                    : {
                          status: { not: 'DROPPED' },
                          OR: [{ module_id: m.module_id }, { module: { code: { equals: m.code.trim(), mode: 'insensitive' } } }],
                      },
            include: {
                semester: true,
                student: {
                    include: {
                        degree_path: true,
                        user: true,
                    },
                },
                grade: true,
            },
        });

        let regsFiltered = regs;
        if (filters?.academicYearId) {
            regsFiltered = regsFiltered.filter(
                (r) => r.semester.academic_year_id === filters.academicYearId
            );
        }
        if (filters?.semesterId) {
            regsFiltered = regsFiltered.filter((r) => r.semester_id === filters.semesterId);
        }

        staffModulesMap.set(m.module_id, {
            id: m.module_id,
            title: m.name,
            code: m.code,
            academicYear: m.level || 'L1',
            semester: regsFiltered[0]?.semester?.label || regs[0]?.semester?.label || 'S1',
            grades: regsFiltered
                .filter((r) => r.grade)
                .map((r) => ({
                    studentId: r.student_id,
                    points: r.grade!.grade_point,
                    letterGrade: r.grade!.letter_grade,
                    studentPathway: r.student.degree_path.name,
                    studentYear: r.student.current_level || 'L1',
                })),
            registrations: regsFiltered.map((r) => ({
                studentId: r.student_id,
                studentPathway: r.student.degree_path.name,
                studentYear: r.student.current_level || 'L1',
            })),
        });
    }

    return Array.from(staffModulesMap.values());
}

// ----------------------------------------------------------------------
// ROSTER ACTIONS
// ----------------------------------------------------------------------

export async function getStaffModuleRoster(moduleId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const assignment = await prisma.staffAssignment.findFirst({
        where: {
            staff_id: session.user.id,
            module_id: moduleId,
            active: true,
        },
        include: {
            module: true,
        },
    });

    if (!assignment?.module) throw new Error("Unauthorized access to this module roster");

    const moduleData = assignment.module;
    const yearIds = await registrationAcademicYearScope(
        assignment.academic_year_id,
        moduleData.academic_year_id,
        moduleData.code
    );

    const regInclude = {
        semester: true,
        student: {
            include: {
                user: true,
                degree_path: true,
                specialization: true,
            },
        },
        grade: true,
    };

    const regs =
        yearIds.length > 0
            ? await prisma.moduleRegistration.findMany({
                  where: whereRegistrationsForStaffAssignment({
                      assignmentModuleId: moduleData.module_id,
                      moduleCode: moduleData.code,
                      academicYearIds: yearIds,
                  }),
                  include: regInclude,
              })
            : await prisma.moduleRegistration.findMany({
                  where: {
                      module_id: moduleData.module_id,
                      status: { not: 'DROPPED' },
                  },
                  include: regInclude,
              });

    return {
        id: moduleData.module_id,
        title: moduleData.name,
        code: moduleData.code,
        credits: moduleData.credits,
        academicYear: moduleData.level || 'L1',
        semester: regs[0]?.semester?.label || 'S1',
        capacity: 60,
        students: regs.map((reg) => {
            const gradeRecord = reg.grade;
            return {
                id: reg.student.student_id,
                name: `${reg.student.user.firstName} ${reg.student.user.lastName}`,
                email: reg.student.user.email,
                academicYear: reg.student.current_level || 'L1',
                specialization: reg.student.specialization?.name || reg.student.degree_path.name,
                grade: gradeRecord
                    ? {
                          points: gradeRecord.grade_point,
                          letterGrade: gradeRecord.letter_grade,
                          isReleased: !!gradeRecord.released_at,
                      }
                    : null,
                attendance: 100,
                lastActive: reg.student.user.last_login_date?.toISOString() || null,
            };
        }),
    };
}

// ----------------------------------------------------------------------
// SCHEDULE ACTIONS
// ----------------------------------------------------------------------

export async function getStaffSchedules() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Fetch modules staff is assigned to
    const staffRecord = await prisma.staff.findUnique({
        where: { staff_id: session.user.id },
        include: {
            assignments: {
                where: { active: true },
                include: {
                    module: {
                        include: {
                            academic_year: { select: { academic_year_id: true, label: true } },
                        },
                    },
                    academic_year: { select: { academic_year_id: true, label: true } },
                },
            },
        },
    });

    if (!staffRecord) throw new Error("Staff not found");

    /** One row per staff assignment — keys stay unique even if module_id repeats in bad data; year disambiguates offerings. */
    const modules = staffRecord.assignments
        .filter((a) => a.module !== null)
        .map((a) => ({
            assignmentId: a.assignment_id,
            id: a.module!.module_id,
            title: a.module!.name,
            code: a.module!.code,
            academicYearLabel:
                a.module!.academic_year?.label ?? a.academic_year?.label ?? null,
        }));

    // Fetch schedules for these modules
    const moduleIds = [...new Set(modules.map((m) => m.id))];
    const schedules = await prisma.lectureSchedule.findMany({
        where: { module_id: { in: moduleIds } }
    });

    return {
        modules,
        schedules: schedules.map(s => {
            const module = modules.find(m => m.id === s.module_id);
            return {
                id: s.schedule_id,
                moduleId: s.module_id,
                module: module ? {
                    id: module.id,
                    name: module.title,
                    code: module.code
                } : null,
                day: s.day_of_week,
                startTime: s.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                endTime: s.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                start_time: s.start_time.toISOString(),
                end_time: s.end_time.toISOString(),
                room: s.location || 'TBA',
                type: 'lecture',
                capacity: 60,
                isActive: true,
                createdAt: s.start_time.toISOString(),
                updatedAt: s.end_time.toISOString(),
            };
        })
    };
}

export async function createStaffSchedule(data: {
    moduleId: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    type: string;
    capacity: number;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Convert time strings to Date objects (using Jan 1, 2000 as base)
    const startDate = new Date(`2000-01-01T${data.startTime}:00Z`);
    const endDate = new Date(`2000-01-01T${data.endTime}:00Z`);

    const schedule = await prisma.lectureSchedule.create({
        data: {
            module_id: data.moduleId,
            staff_id: session.user.id,
            day_of_week: data.day,
            start_time: startDate,
            end_time: endDate,
            location: data.room,
        }
    });

    await writeAuditLog({
        adminId: session.user.id,
        action: 'STAFF_LECTURE_SCHEDULE_CREATE',
        entityType: 'LECTURE_SCHEDULE',
        entityId: schedule.schedule_id,
        category: 'STAFF',
        metadata: { module_id: data.moduleId },
    });

    return {
        id: schedule.schedule_id,
        moduleId: schedule.module_id,
        day: schedule.day_of_week,
        startTime: data.startTime,
        endTime: data.endTime,
        room: schedule.location || 'TBA',
        type: data.type,
        capacity: data.capacity,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

// ----------------------------------------------------------------------
// GRADES ACTIONS
// ----------------------------------------------------------------------

export async function getStaffGradesData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const staffRecord = await prisma.staff.findUnique({
        where: { staff_id: session.user.id },
        include: {
            assignments: {
                include: {
                    academic_year: true,
                    module: true,
                },
            },
        },
    });

    if (!staffRecord) throw new Error("Staff not found");

    const modules = new Map<string, any>();
    const grades: any[] = [];
    const studentsMap = new Map<string, any>();

    for (const assignment of staffRecord.assignments) {
        if (!assignment.module) continue;

        const mod = assignment.module;
        const yearIds = await registrationAcademicYearScope(
            assignment.academic_year_id,
            mod.academic_year_id,
            mod.code
        );

        const regs = await prisma.moduleRegistration.findMany({
            where:
                yearIds.length > 0
                    ? whereRegistrationsForStaffAssignment({
                          assignmentModuleId: mod.module_id,
                          moduleCode: mod.code,
                          academicYearIds: yearIds,
                      })
                    : {
                          status: { not: 'DROPPED' },
                          OR: [
                              { module_id: mod.module_id },
                              { module: { code: { equals: mod.code.trim(), mode: 'insensitive' } } },
                          ],
                      },
            include: {
                semester: true,
                student: { include: { user: true } },
                grade: true,
            },
        });

        if (!modules.has(mod.module_id)) {
            modules.set(mod.module_id, {
                id: mod.module_id,
                title: mod.name,
                code: mod.code,
                credits: mod.credits,
                academicYear: mod.level || 'L1',
                semester: regs[0]?.semester?.label || 'S1',
            });
        }

        for (const reg of regs) {
            if (!studentsMap.has(reg.student_id)) {
                studentsMap.set(reg.student_id, {
                    id: reg.student_id,
                    name: reg.student.user.firstName + ' ' + reg.student.user.lastName,
                    email: reg.student.user.email,
                });
            }

            if (reg.grade) {
                grades.push({
                    id: reg.grade.grade_id,
                    gradeId: reg.grade.grade_id,
                    registrationId: reg.reg_id,
                    studentId: reg.student_id,
                    moduleId: mod.module_id,
                    grade: reg.grade.marks ?? null,
                    letterGrade: reg.grade.letter_grade,
                    points: reg.grade.grade_point,
                    credits: mod.credits,
                    isReleased: reg.grade.released_at !== null,
                    releasedAt: reg.grade.released_at?.toISOString() || null,
                    hasGradeRecord: true,
                });
            } else {
                // Roster has registrations but Grade row not created yet — UI still needs a row
                grades.push({
                    id: `reg:${reg.reg_id}`,
                    gradeId: null,
                    registrationId: reg.reg_id,
                    studentId: reg.student_id,
                    moduleId: mod.module_id,
                    grade: null,
                    letterGrade: '—',
                    points: 0,
                    credits: mod.credits,
                    isReleased: false,
                    releasedAt: null,
                    hasGradeRecord: false,
                });
            }
        }
    }

    return {
        modules: Array.from(modules.values()),
        grades,
        students: Array.from(studentsMap.values()),
    };
}

export async function uploadStaffGrades(gradesData: any[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const bandsCache = new Map<string, GradingBandRow[]>();
    const bandsForModule = async (mid: string) => {
        if (!bandsCache.has(mid)) {
            bandsCache.set(mid, await getEffectiveGradingBandsForModule(mid));
        }
        return bandsCache.get(mid)!;
    };

    let count = 0;
    await prisma.$transaction(async (tx) => {
        for (const g of gradesData) {
            // g format: { studentId, moduleId, grade: number (marks) | string (letter from scale) }

            let reg = await tx.moduleRegistration.findFirst({
                where: {
                    student_id: g.studentId,
                    module_id: g.moduleId,
                },
            });

            if (!reg && g.moduleId) {
                const teachMod = await tx.module.findUnique({
                    where: { module_id: g.moduleId },
                    select: { code: true },
                });
                if (teachMod) {
                    reg = await tx.moduleRegistration.findFirst({
                        where: {
                            student_id: g.studentId,
                            module: { code: teachMod.code },
                        },
                        orderBy: { registration_date: 'desc' },
                    });
                }
            }

            if (reg) {
                const bands = await bandsForModule(reg.module_id);
                let resolved: { marks: number | null; letter_grade: string; grade_point: number };
                try {
                    resolved = resolveGradeFromUploadCell(g.grade as string | number, bands);
                } catch {
                    continue;
                }

                await tx.grade.upsert({
                    where: { reg_id: reg.reg_id },
                    update: {
                        marks: resolved.marks,
                        grade_point: resolved.grade_point,
                        letter_grade: resolved.letter_grade,
                    },
                    create: {
                        reg_id: reg.reg_id,
                        student_id: g.studentId,
                        module_id: reg.module_id,
                        semester_id: reg.semester_id,
                        marks: resolved.marks,
                        grade_point: resolved.grade_point,
                        letter_grade: resolved.letter_grade,
                    },
                });
                count++;
            }
        }
    });

    await writeAuditLog({
        adminId: session.user.id,
        action: 'STAFF_GRADE_BULK_UPLOAD_LEGACY',
        entityType: 'GRADE',
        entityId: 'bulk',
        category: 'STAFF',
        metadata: { rowsUpdated: count, inputRows: gradesData.length },
    });

    return { success: true, count };
}

export async function releaseStaffGrades(gradeIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const gradesToRelease = await prisma.grade.findMany({
        where: { grade_id: { in: gradeIds }, released_at: null },
        include: {
            module: { select: { name: true, code: true } },
            student: { include: { user: { select: { email: true, firstName: true, lastName: true } } } },
        },
    });

    const releaseBatchId = Date.now();
    const affectedStudentIds = [...new Set(gradesToRelease.map((g) => g.student_id))];
    const standingBefore = await captureStandingBeforeRelease(affectedStudentIds);

    const result = await prisma.grade.updateMany({
        where: { grade_id: { in: gradeIds } },
        data: { released_at: new Date() }
    });

    for (const g of gradesToRelease) {
        const email = g.student.user?.email;
        if (!email) continue;
        const studentName = `${g.student.user.firstName} ${g.student.user.lastName}`.trim();
        const dedupe = `${NotificationEventKey.GRADE_RELEASED}:${g.student_id}:${g.module_id}`;
        await dispatchNotificationEmail({
            eventKey: NotificationEventKey.GRADE_RELEASED,
            dedupeKey: dedupe,
            to: email,
            toName: studentName,
            recipientUserId: g.student_id,
            entityType: 'grade',
            entityId: g.grade_id,
            vars: {
                studentName,
                moduleName: g.module.name,
                moduleCode: g.module.code,
                letterGrade: g.letter_grade,
            },
        });
    }

    await notifyAcademicStandingChangesAfterGradeRelease(affectedStudentIds, standingBefore, releaseBatchId);

    await writeAuditLog({
        adminId: session.user.id,
        action: 'STAFF_GRADES_RELEASE',
        entityType: 'GRADE',
        entityId: 'batch',
        category: 'STAFF',
        metadata: { gradeIds: gradeIds.length, releasedCount: result.count, batchId: releaseBatchId },
    });

    return { success: true, count: result.count };
}
