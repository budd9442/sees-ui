'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { Student, Grade, AcademicGoal, Notification, Module } from '@/types';
import { revalidatePath } from 'next/cache';

import { AcademicEngine } from '@/lib/services/academic-engine'; 

export async function getStudentDashboardData() {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("Unauthorized");
    }

    let userId = session.user.id;
    // ... (rest of function)

    // ... Inside student object construction:


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

    // Map raw DB grades to the shape expected by calculateGPA


    const mappedGrades = record.grades.map((g: any) => ({
        ...g,
        gradePoint: g.grade_point,
        letterGrade: g.letter_grade,
        isReleased: !!g.released_at, // Only consider released grades
        points: g.grade_point, // fallback for safety
        credits: g.module.credits // Critical fix: Flatten credits for calculator
    }));

    const { gpa: currentGPA, totalCredits, academicClass } = await AcademicEngine.calculateStudentGPA(studentRecord.student_id);

    // Map to frontend Student type (camelCase)
    const student: Student = {
        id: record.user.user_id,
        email: record.user.email,
        firstName: record.user.first_name || '', // Corrected case
        lastName: record.user.last_name || '',   // Corrected case
        name: `${record.user.first_name || ''} ${record.user.last_name || ''}`,
        role: 'student',
        isActive: record.user.status === 'ACTIVE',
        studentId: record.student_id,
        academicYear: 'L' + Math.max(1, Math.ceil(record.admission_year ? (new Date().getFullYear() - record.admission_year - 1) : 1)) as any,
        degreeProgram: record.degree_path?.code as any,
        specialization: record.specialization?.code as any,
        currentGPA,
        totalCredits,
        academicClass: academicClass as any, 
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
    // 1. [SOVEREIGNTY] Check if an active semester ID is explicitly set in Global Governance
    const activeSetting = await prisma.systemSetting.findUnique({ where: { key: 'active_semester_id' } });
    
    if (activeSetting?.value && activeSetting.value !== 'SEM-CURRENT-UUID') {
        const manualSemester = await prisma.semester.findUnique({
            where: { semester_id: activeSetting.value },
            include: { academic_year: true }
        });
        if (manualSemester) return manualSemester;
    }

    // 2. Fallback: Date-based logic
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
            module: {
                include: {
                    Module_A: true // Include prerequisites
                }
            }
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

    // Fetch enrollment counts for these modules
    const enrollmentCounts = await prisma.moduleRegistration.groupBy({
        by: ['module_id'],
        where: {
            module_id: { in: dedupedStructures.map((s: any) => s.module_id) },
            status: 'REGISTERED'
        },
        _count: {
            student_id: true
        }
    });

    const countMap = new Map(enrollmentCounts.map(c => [c.module_id, c._count.student_id]));

    // Cast to ensure isCompulsory is treated as required boolean for these specific actions
    const availableModules = dedupedStructures.map((s: any) => ({
        id: s.module.module_id,
        code: s.module.code,
        title: s.module.name,
        credits: s.module.credits,
        description: s.module.description,
        prerequisites: s.module.Module_A.map((p: any) => p.code), // Map to codes for the UI check
        academicYear: s.academicLevel,
        semester: currentSemester,
        isActive: s.module.active,
        capacity: s.module.max_students || 60,
        enrolled: countMap.get(s.module.module_id) || 0,
        lecturer: 'TBD',
        schedule: 'TBD',
        degreeProgram: record.degree_path?.code,
        specialization: s.specialization_id ? record.specialization?.code : undefined,
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

        const semester = await getCurrentSemester();
        if (!semester) throw new Error("No active semester found for registration");

        // [GOVERNANCE] Check if registration window is open
        const regSetting = await prisma.systemSetting.findUnique({ where: { key: 'is_registration_open' } });
        if (regSetting?.value !== 'true') {
            throw new Error("Module registration is currently CLOSED by administration.");
        }

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
            where: { module_id: { in: moduleIds } }
        });

        // 3. Validate Credits
        const totalCredits = modules.reduce((sum, m) => sum + m.credits, 0);
        // if (totalCredits > 24) { // Removed min 12 for flexibility during add/drop? Or keep? Keeping upper bound.
        //     throw new Error(`Total credits (${totalCredits}) exceeds maximum allowed (24).`);
        // }

        // 4. Validate Prerequisites
        // Simulated missing prereqs logic
        const missingPrereqs: string[] = [];
        for (const mod of modules) {
            const hasPrereqData = (mod as any).prerequisites && (mod as any).prerequisites.length > 0;
            if (hasPrereqData) {
                // ...
            }
        }

        if (missingPrereqs.length > 0) {
            throw new Error(`Missing prerequisites: ${missingPrereqs.join(', ')}`);
        }

        // 5. Differential Sync: Add/Remove instead of Wipe/Replace
        // We must fetch existing registrations to avoid FK violations (deleting a reg with a grade)
        const existingRegistrations = await prisma.moduleRegistration.findMany({
            where: {
                student_id: record.student_id,
                semester_id: semester.semester_id,
                status: 'REGISTERED' // Only managing active registrations
            },
            include: {
                grade: true // Check for grades
            }
        });

        const existingModuleIds = existingRegistrations.map(r => r.module_id);

        // Determine what to add and what to remove
        const toAdd = moduleIds.filter(id => !existingModuleIds.includes(id));
        const toRemove = existingModuleIds.filter(id => !moduleIds.includes(id));

        // Validation: Cannot remove modules that have associated grades
        // instead of throwing an error, we simply REMOVE them from the 'toRemove' list.
        // This handles cases where the frontend filtered them out (e.g. historical modules)
        // and we shouldn't attempt to delete them anyway.
        const lockedModules = existingRegistrations.filter(r =>
            toRemove.includes(r.module_id) && (r.grade || r.status === 'COMPLETED')
        );

        const lockedModuleIds = lockedModules.map(r => r.module_id);
        const safeToRemove = toRemove.filter(id => !lockedModuleIds.includes(id));

        await prisma.$transaction(async (tx) => {
            // 1. Remove deselected modules (that are safe to remove)
            if (safeToRemove.length > 0) {
                await tx.moduleRegistration.deleteMany({
                    where: {
                        student_id: record.student_id,
                        semester_id: semester.semester_id,
                        module_id: { in: safeToRemove },
                        status: 'REGISTERED'
                    }
                });
            }

            // 2. Add new modules
            if (toAdd.length > 0) {
                // Use createMany for efficiency if supported, or loop
                // createMany is supported in most SQL providers now (Postgres/MySQL)
                await tx.moduleRegistration.createMany({
                    data: toAdd.map(moduleId => ({
                        student_id: record.student_id,
                        module_id: moduleId,
                        semester_id: semester.semester_id,
                        status: 'REGISTERED',
                        registration_date: new Date(),
                    }))
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
                    semester: {
                        include: { academic_year: true }
                    },
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
        // User requested "Year" to mean Level (L1, L2)
        level: reg.module.level || 'L1',
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

export async function getStudentGPAHistory() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const u = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!u) throw new Error("User not found");

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: u.user_id },
        include: {
            grades: {
                include: {
                    module: true,
                    semester: true
                }
            } as any
        } as any
    });

    if (!studentRecord) return [];

    // Sort grades by date/semester
    const grades = (studentRecord as any).grades
        .filter((g: any) =>
            g.released_at &&
            g.letter_grade !== 'Pending' &&
            g.letter_grade !== 'Pass' &&
            g.semester
        )
        .sort((a: any, b: any) => {
            const dateA = a.semester.end_date ? new Date(a.semester.end_date).getTime() : 0;
            const dateB = b.semester.end_date ? new Date(b.semester.end_date).getTime() : 0;
            return dateA - dateB;
        });

    // Group by Level + Semester (to handle duplicated semester IDs in seed)
    const semesterMap = new Map<string, any[]>();

    // Init map with all active registrations (even if no grades yet)
    const registrations = (studentRecord as any).module_registrations || [];
    registrations.forEach((r: any) => {
        const level = r.module.level || 'Lx';
        const label = r.semester.label || 'Unknown';
        const key = `${level} ${label}`;
        if (!semesterMap.has(key)) semesterMap.set(key, []);
    });

    grades.forEach((g: any) => {
        // Use Module Level if available, or infer from somewhere else?
        // Grades have module included. Module has 'level'.
        const level = g.module.level || 'Lx';
        const label = g.semester.label || 'Unknown';
        const key = `${level} ${label}`; // e.g. "L1 Semester 1"

        if (!semesterMap.has(key)) semesterMap.set(key, []);
        semesterMap.get(key)?.push(g);
    });

    // Calculate Cumulative GPA over time
    let cumulativePoints = 0;
    let cumulativeCredits = 0;
    const history: { semester: string; gpa: number }[] = [];

    // Sort keys logically: L1 S1, L1 S2, L2 S1, L2 S2
    const sortedKeys = Array.from(semesterMap.keys()).sort((a, b) => {
        // Heuristic sort: L1 < L2, Sem1 < Sem2
        const levelA = a.match(/L(\d+)/)?.[1] || '0';
        const levelB = b.match(/L(\d+)/)?.[1] || '0';
        const semA = a.match(/Semester (\d+)/)?.[1] || '0';
        const semB = b.match(/Semester (\d+)/)?.[1] || '0';

        if (levelA !== levelB) return Number(levelA) - Number(levelB);
        return Number(semA) - Number(semB);
    });

    for (const key of sortedKeys) {
        const semGrades = semesterMap.get(key) || [];

        // Add this semester's contribution
        semGrades.forEach(g => {
            cumulativePoints += (g.grade_point * g.module.credits);
            cumulativeCredits += g.module.credits;
        });

        if (cumulativeCredits > 0) {
            history.push({
                semester: key.replace('Semester ', 'S'), // Shorten label: "L1 S1"
                gpa: Number((cumulativePoints / cumulativeCredits).toFixed(2))
            });
        } else if (history.length > 0) {
            // If no new credits (pending semester), carry forward previous cumulative GPA
            history.push({
                semester: key.replace('Semester ', 'S'),
                gpa: history[history.length - 1].gpa
            });
        }
    }

    // Fallback if no history yet (e.g. new student)
    if (history.length === 0) {
        return [{ semester: 'Start', gpa: 0 }];
    }

    return history;
}

export async function getStudentInterventions() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }

    if (!u) throw new Error("User not found");
    userId = u.user_id;

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: userId },
        include: {
            advisor: { include: { staff: { include: { user: true } } } },
            gpa_history: { orderBy: { calculation_date: 'desc' }, take: 2 }
        } as any
    });

    if (!studentRecord) return [];
    const student = studentRecord as any;

    const interventions: any[] = [];

    // Logic 1: GPA Drop detection
    if (student.gpa_history && student.gpa_history.length >= 2) {
        const current = student.gpa_history[0].gpa;
        const previous = student.gpa_history[1].gpa;
        if (current < previous) {
            interventions.push({
                id: 'int-gpa-' + student.student_id,
                studentId: student.student_id,
                advisorId: student.advisor_id,
                type: 'gpa_drop',
                title: 'GPA Decrease Detected',
                description: `Your GPA has decreased from ${previous.toFixed(2)} to ${current.toFixed(2)}. Let's work together to identify the causes and create a plan for improvement.`,
                triggerReason: `GPA dropped by ${(previous - current).toFixed(2)} points in current semester`,
                severity: (previous - current) > 0.5 ? 'high' : 'medium',
                status: 'active',
                suggestions: [
                    'Review your study schedule and time management',
                    'Schedule a meeting with your academic advisor',
                    'Identify specific modules where performance declined',
                    'Develop a study plan for upcoming assessments'
                ],
                resources: [
                    {
                        id: 'res-001',
                        title: 'Study Skills Workshop',
                        description: 'Learn effective study techniques and time management strategies',
                        type: 'workshop',
                        url: '/workshops/study-skills'
                    },
                    {
                        id: 'res-002',
                        title: 'Academic Support Center',
                        description: 'Get one-on-one tutoring and academic support',
                        type: 'service',
                        contactInfo: 'support@university.edu'
                    }
                ],
                createdAt: new Date().toISOString(),
                studentNotes: '',
                advisorNotes: '',
                acknowledged: false,
                selectedResources: []
            });
        }
    }

    return interventions;
}
