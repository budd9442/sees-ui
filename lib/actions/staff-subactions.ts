'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function getStaffAnalytics() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // Find all modules assigned to this staff member
    const staffRecord = await prisma.staff.findUnique({
        where: { staff_id: userId },
        include: {
            assignments: {
                include: {
                    module: {
                        include: {
                            grades: {
                                include: {
                                    student: {
                                        include: {
                                            degree_path: true
                                        }
                                    }
                                }
                            },
                            module_registrations: {
                                include: {
                                    semester: true,
                                    student: {
                                        include: {
                                            degree_path: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!staffRecord) throw new Error("Staff profile not found");

    // Format the data to match what the analytics page needs
    const staffModulesMap = new Map();

    staffRecord.assignments.forEach(assignment => {
        if (assignment.module && !staffModulesMap.has(assignment.module.module_id)) {
            const m = assignment.module;
            staffModulesMap.set(m.module_id, {
                id: m.module_id,
                title: m.name,
                code: m.code,
                academicYear: m.level || 'L1',
                semester: m.module_registrations[0]?.semester?.label || 'S1', // Fetch from real DB record
                grades: m.grades.map(g => ({
                    studentId: g.student_id,
                    points: g.grade_point, // Use real grade_point from DB
                    letterGrade: g.letter_grade,
                    studentPathway: g.student.degree_path.name,
                    studentYear: g.student.current_level || 'L1'
                })),
                registrations: m.module_registrations.map(r => ({
                    studentId: r.student_id,
                    studentPathway: r.student.degree_path.name,
                    studentYear: r.student.current_level || 'L1'
                }))
            });
        }
    });

    return Array.from(staffModulesMap.values());
}

function getLetterGrade(marks: number) {
    if (marks >= 80) return 'A';
    if (marks >= 65) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
}

// ----------------------------------------------------------------------
// ROSTER ACTIONS
// ----------------------------------------------------------------------

export async function getStaffModuleRoster(moduleId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // First check if staff owns or is assigned to this module
    const assignment = await prisma.staffAssignment.findFirst({
        where: {
            staff_id: session.user.id,
            module_id: moduleId,
            active: true
        }
    });

    if (!assignment) throw new Error("Unauthorized access to this module roster");

    const moduleData = await prisma.module.findUnique({
        where: { module_id: moduleId },
        include: {
            module_registrations: {
                include: {
                    semester: true,
                    student: {
                        include: {
                            user: true,
                            degree_path: true,
                            specialization: true,
                            grades: {
                                where: { module_id: moduleId }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!moduleData) throw new Error("Module not found");

    // Format for client
    return {
        id: moduleData.module_id,
        title: moduleData.name,
        code: moduleData.code,
        credits: moduleData.credits,
        academicYear: moduleData.level || 'L1',
        semester: moduleData.module_registrations[0]?.semester?.label || 'S1',
        capacity: moduleData.max_students, // Use real capacity
        students: moduleData.module_registrations.map(reg => {
            const gradeRecord = reg.student.grades[0];
            return {
                id: reg.student.student_id,
                name: `${reg.student.user.first_name} ${reg.student.user.last_name}`,
                email: reg.student.user.email,
                academicYear: reg.student.current_level || 'L1',
                specialization: reg.student.specialization?.name || reg.student.degree_path.name,
                grade: gradeRecord ? {
                    points: gradeRecord.grade_point,
                    letterGrade: gradeRecord.letter_grade,
                    isReleased: !!gradeRecord.released_at
                } : null,
                attendance: 100, // Default to 100 to remove random fluctuations
                lastActive: reg.student.user.last_login_date?.toISOString() || null
            };
        })
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
                include: {
                    module: true
                }
            }
        }
    });

    if (!staffRecord) throw new Error("Staff not found");

    const modules = staffRecord.assignments
        .filter(a => a.module !== null)
        .map(a => ({
            id: a.module!.module_id,
            title: a.module!.name,
            code: a.module!.code,
        }));

    // Fetch schedules for these modules
    const moduleIds = modules.map(m => m.id);
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
                day: s.day_of_week,
                startTime: s.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                endTime: s.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                room: s.location || 'TBA',
                type: 'lecture', // Defaulting to lecture as schema lacks specific type
                capacity: 60,    // Standard room capacity
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
                    module: {
                        include: {
                            module_registrations: {
                                include: {
                                    semester: true,
                                    student: {
                                        include: { user: true }
                                    },
                                    grade: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!staffRecord) throw new Error("Staff not found");

    const modules = new Map<string, any>();
    const grades: any[] = [];
    const studentsMap = new Map<string, any>();

    staffRecord.assignments.forEach(assignment => {
        if (!assignment.module) return;

        const mod = assignment.module;
        if (!modules.has(mod.module_id)) {
            modules.set(mod.module_id, {
                id: mod.module_id,
                title: mod.name,
                code: mod.code,
                credits: mod.credits,
                academicYear: mod.level || "L1", // Use real level
                semester: mod.module_registrations[0]?.semester?.label || "S1" // Fetch from reg
            });
        }

        mod.module_registrations.forEach(reg => {
            if (!studentsMap.has(reg.student_id)) {
                studentsMap.set(reg.student_id, {
                    id: reg.student_id,
                    name: reg.student.user.first_name + " " + reg.student.user.last_name,
                    email: reg.student.user.email
                });
            }

            if (reg.grade) {
                grades.push({
                    id: reg.grade.grade_id,
                    studentId: reg.student_id,
                    moduleId: mod.module_id,
                    grade: reg.grade.marks,
                    letterGrade: reg.grade.letter_grade,
                    points: reg.grade.grade_point,
                    credits: mod.credits,
                    isReleased: reg.grade.released_at !== null,
                    releasedAt: reg.grade.released_at?.toISOString() || null
                });
            }
        });
    });

    return {
        modules: Array.from(modules.values()),
        grades,
        students: Array.from(studentsMap.values())
    };
}

export async function uploadStaffGrades(gradesData: any[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let count = 0;
    await prisma.$transaction(async (tx) => {
        for (const g of gradesData) {
            // Find module registration first
            const reg = await tx.moduleRegistration.findFirst({
                where: { 
                    student_id: g.studentId,
                    module_id: g.moduleId
                }
            });

            if (reg) {
                await tx.grade.upsert({
                    where: { reg_id: reg.reg_id },
                    update: {
                        marks: parseFloat(g.grade),
                        grade_point: parseFloat(g.points),
                        letter_grade: g.letterGrade,
                    },
                    create: {
                        reg_id: reg.reg_id,
                        student_id: g.studentId,
                        module_id: g.moduleId,
                        semester_id: reg.semester_id,
                        marks: parseFloat(g.grade),
                        grade_point: parseFloat(g.points),
                        letter_grade: g.letterGrade,
                    }
                });
                count++;
            }
        }
    });

    return { success: true, count };
}

export async function releaseStaffGrades(gradeIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const result = await prisma.grade.updateMany({
        where: { grade_id: { in: gradeIds } },
        data: { released_at: new Date() }
    });

    return { success: true, count: result.count };
}
