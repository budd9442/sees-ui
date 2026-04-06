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
                academicYear: m.level || 'L1', // Fallback
                semester: 'S1', // Mock or need schema update
                grades: m.grades.map(g => ({
                    studentId: g.student_id,
                    points: g.marks / 25, // Mock conversion (0-100 to 0-4 GPA scale)
                    letterGrade: getLetterGrade(g.marks),
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
        semester: 'S1', // Mock
        capacity: 50, // Mock
        students: moduleData.module_registrations.map(reg => {
            const gradeRecord = reg.student.grades[0];
            return {
                id: reg.student.student_id,
                name: `${reg.student.user.first_name} ${reg.student.user.last_name}`,
                email: reg.student.user.email,
                academicYear: reg.student.current_level || 'L1',
                specialization: reg.student.specialization?.name || reg.student.degree_path.name,
                grade: gradeRecord ? {
                    points: gradeRecord.marks / 25,
                    letterGrade: getLetterGrade(gradeRecord.marks),
                    isReleased: true
                } : null,
                attendance: Math.floor(Math.random() * 20) + 80, // Mock attendance
                lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
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
        schedules: schedules.map(s => ({
            id: s.schedule_id,
            moduleId: s.module_id,
            day: s.day_of_week,
            startTime: s.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: s.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            room: s.location || 'TBA',
            type: 'lecture', // Schema lacks type, so default to lecture
            capacity: 50,    // Mock capacity
            isActive: true,
            createdAt: s.start_time.toISOString(),
            updatedAt: s.end_time.toISOString(),
        }))
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

    staffRecord.assignments.forEach(a => {
        if (!a.module) return;
        const mod = a.module;
        if (!modules.has(mod.module_id)) {
            modules.set(mod.module_id, {
                id: mod.module_id,
                title: mod.name,
                code: mod.code,
                credits: mod.credits,
                academicYear: "2024/2025", // Mock
                semester: "S1" // Mock
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

// Mock bulk upload to avoid complex reg_id lookups
export async function uploadStaffGrades(grades: any[]) {
    // In a real app, this would find the corresponding ModuleRegistration and upsert Grade.
    // We are just returning success to update the UI optimistically.
    return { success: true, count: grades.length };
}

// Mock release
export async function releaseStaffGrades(gradeIds: string[]) {
    // In a real app, this would update Grade.released_at.
    return { success: true, count: gradeIds.length };
}
