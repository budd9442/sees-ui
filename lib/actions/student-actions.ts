'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { Student, Grade, AcademicGoal, Notification, Module } from '@/types';
import { revalidatePath } from 'next/cache';
import { AcademicEngine } from '@/lib/services/academic-engine';
import { gradeContributesToGpa } from '@/lib/gpa-utils';
import { getStudentModuleRegistrationWindow } from '@/lib/actions/module-registration-round-actions';
import { normalizeStudentLevel } from '@/lib/module-registration-round-utils';
import { assertStudentWriteAccess } from '@/lib/actions/student-access';

const programStructureInclude = {
    module: {
        include: {
            Module_A: true,
            module_registrations: true,
        },
    },
} as const;

function canonicalModuleCodeForEnrollment(raw: string | null | undefined) {
    const code = String(raw ?? '').trim().toUpperCase();
    // Treat variant suffixes as the same logical module for enrollment display:
    // e.g. "GNCT 11212a" and "GNCT 11212", "INTE 43216b" and "INTE 43216".
    return code.replace(/([0-9]{5})[A-Z]$/, '$1');
}

/** Program catalogue rows for registration: active year first, then legacy rows with null academic_year_id. */
async function fetchProgramStructuresForEnrollment(opts: {
    programId: string;
    specializationId: string | null;
    studentLevelRaw: string | null;
}) {
    const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
    if (!activeYear) return [];

    const academicLevel = normalizeStudentLevel(opts.studentLevelRaw) || 'L1';

    const buildWhere = (academicYearId: string | null) => {
        const w: Record<string, unknown> = {
            program_id: opts.programId,
            academic_level: academicLevel,
            academic_year_id: academicYearId,
        };
        if (opts.specializationId) {
            w.OR = [{ specialization_id: null }, { specialization_id: opts.specializationId }];
        }
        return w;
    };

    let structures = await prisma.programStructure.findMany({
        where: buildWhere(activeYear.academic_year_id) as any,
        include: programStructureInclude,
    });

    // Also include legacy catalogue rows (academic_year_id = null). Many datasets only have
    // partial active-year structures, and falling back only when active-year is empty can hide modules.
    const legacy = await prisma.programStructure.findMany({
        where: buildWhere(null) as any,
        include: programStructureInclude,
    });

    if (legacy.length) {
        const key = (s: any) => `${s.module_id}::${s.semester_number}::${s.specialization_id ?? 'null'}`;
        const seen = new Set(structures.map(key));
        for (const row of legacy) {
            const k = key(row);
            if (seen.has(k)) continue;
            structures.push(row);
            seen.add(k);
        }
    }

    return structures;
}

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
        firstName: record.user.firstName || '', // Corrected case
        lastName: record.user.lastName || '',   // Corrected case
        name: `${record.user.firstName || ''} ${record.user.lastName || ''}`,
        role: 'student',
        isActive: record.user.status === 'ACTIVE',
        studentId: record.student_id,
        academicYear: record.current_level || ('L' + Math.max(1, Math.ceil(record.admission_year ? (new Date().getFullYear() - record.admission_year - 1) : 1))) as any,
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
        // Only respect manual override when it points to the active academic year.
        if (manualSemester?.academic_year?.active) return manualSemester;
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

/**
 * Fetch Semesters for the Active Academic Year
 */
async function getAnnualSemesters() {
    const activeYear = await prisma.academicYear.findFirst({
        where: { active: true },
        include: { semesters: { orderBy: { label: 'asc' } } }
    });

    if (!activeYear) return [];
    return activeYear.semesters;
}

export async function getModuleRegistrationData() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) u = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!u) throw new Error("User not found");
    userId = u.user_id;

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: userId },
        include: {
            user: true,
            degree_path: true,
            specialization: true,
            grades: { include: { module: true } } as any,
            module_registrations: { include: { module: true } } as any
        } as any
    });

    if (!studentRecord) throw new Error("Student profile not found");
    const record = studentRecord as any;

    // 1. Get semesters for the active gear
    const semesters = await getAnnualSemesters();
    if (semesters.length === 0) throw new Error("No active semesters found for registration");

    // 2. Determine current level (normalize "Level 2" -> "L2" for ProgramStructure.academic_level)
    const studentYear =
        normalizeStudentLevel(record.current_level) ||
        'L' + Math.max(1, Math.ceil(record.admission_year ? new Date().getFullYear() - record.admission_year - 1 : 1));

    // 3. Fetch Program Structure for this level (scoped to active academic year when possible)
    const structures = await fetchProgramStructuresForEnrollment({
        programId: record.degree_path_id,
        specializationId: record.specialization_id,
        studentLevelRaw: record.current_level,
    });

    // 4. Fetch Credit Rules for both semesters
    const creditRules = await prisma.academicCreditRule.findMany({
        where: { level: studentYear }
    });

    const semesterIds = semesters.map((s) => s.semester_id);
    const activeAcademicYearId = semesters[0]?.academic_year_id ?? null;
    const programIntake = activeAcademicYearId
        ? await prisma.programIntake.findFirst({
              where: {
                  program_id: record.degree_path_id,
                  academic_year_id: activeAcademicYearId,
              },
              select: { max_students: true },
          })
        : null;
    const moduleCapacity = programIntake?.max_students ?? 0;
    const structureModuleCodes = Array.from(new Set(structures.map((s: any) => s.module?.code).filter(Boolean)));
    const structureCanonicalCodes = Array.from(
        new Set(structureModuleCodes.map((code) => canonicalModuleCodeForEnrollment(code)))
    );

    // Enrollment is displayed per "module offering", but seed/import history can create
    // multiple module_id rows for the same module code across academic years.
    // Count by module code + semester so numbers remain accurate for students.
    const codeSemesterRegistrations = structureModuleCodes.length
        ? await prisma.moduleRegistration.findMany({
              where: {
                  semester_id: { in: semesterIds },
                  status: { not: 'DROPPED' },
                  module: { code: { in: structureModuleCodes as string[] } },
              },
              select: {
                  semester_id: true,
                  module: { select: { code: true } },
              },
          } as any)
        : [];

    // Include variant module codes that map to the same canonical code (e.g. 11212 vs 11212A).
    const siblingModules = structureCanonicalCodes.length
        ? await prisma.module.findMany({
              where: {
                  OR: structureCanonicalCodes.map((canonical) => ({
                      code: {
                          startsWith: canonical,
                          mode: 'insensitive',
                      },
                  })),
              },
              select: { module_id: true, code: true },
          } as any)
        : [];

    const siblingCodeSet = new Set(siblingModules.map((m: any) => String(m.code ?? '').trim().toUpperCase()));
    const extraCodes = Array.from(siblingCodeSet).filter((c) => !structureModuleCodes.includes(c));

    const siblingRegistrations = extraCodes.length
        ? await prisma.moduleRegistration.findMany({
              where: {
                  semester_id: { in: semesterIds },
                  status: { not: 'DROPPED' },
                  module: { code: { in: extraCodes } },
              },
              select: {
                  semester_id: true,
                  module: { select: { code: true } },
              },
          } as any)
        : [];

    const enrolledByCodeAndSemester = new Map<string, number>();
    const allRows = [...(codeSemesterRegistrations as any[]), ...(siblingRegistrations as any[])];
    for (const row of allRows) {
        const code = canonicalModuleCodeForEnrollment(row.module?.code);
        if (!code) continue;
        const k = `${code}::${row.semester_id}`;
        enrolledByCodeAndSemester.set(k, (enrolledByCodeAndSemester.get(k) ?? 0) + 1);
    }

    // 5. Build Available Modules grouped by Semester Number
    const semestersData = semesters.map(sem => {
        // Find modules belonging to this semester number (heuristic: labels like "Semester 1")
        const semNum = sem.label.includes('1') ? 1 : 2;
        
        const semStructures = structures.filter(s => s.semester_number === semNum);
        const semStructureByCanonicalCode = new Map<string, (typeof semStructures)[number]>();
        for (const s of semStructures) {
            const canonicalCode = canonicalModuleCodeForEnrollment(s.module?.code);
            if (!canonicalCode) continue;
            const existing = semStructureByCanonicalCode.get(canonicalCode);
            if (!existing) {
                semStructureByCanonicalCode.set(canonicalCode, s);
                continue;
            }

            const existingCode = String(existing.module?.code ?? '').trim().toUpperCase();
            const currentCode = String(s.module?.code ?? '').trim().toUpperCase();
            const existingIsVariant = /[0-9]{5}[A-Z]$/.test(existingCode);
            const currentIsVariant = /[0-9]{5}[A-Z]$/.test(currentCode);

            // Prefer base (non-suffixed) code over variant code where both exist.
            if (existingIsVariant && !currentIsVariant) {
                semStructureByCanonicalCode.set(canonicalCode, s);
            }
        }
        const dedupedSemStructures = [...semStructureByCanonicalCode.values()];
        
        return {
            semesterId: sem.semester_id,
            label: sem.label,
            semesterNumber: semNum,
            rule: creditRules.find(r => r.semester_number === semNum) || { min_credits: 12, max_credits: 24 },
            modules: dedupedSemStructures.map(s => ({
                id: s.module.module_id,
                code: s.module.code,
                title: s.module.name,
                credits: s.module.credits,
                description: s.module.description,
                prerequisites: s.module.Module_A.map((p: any) => p.code),
                academicYear: s.academic_level,
                semester: sem.label,
                capacity: moduleCapacity,
                enrolled:
                    enrolledByCodeAndSemester.get(
                        `${canonicalModuleCodeForEnrollment(s.module.code)}::${sem.semester_id}`
                    ) ?? 0,
                isCompulsory: !!(s.module_type === 'CORE')
            }))
        };
    });

    const activeSemesterIds = new Set(semesters.map((sem) => sem.semester_id));
    const currentLevelModuleIds = new Set(
        semestersData.flatMap((sem) => sem.modules.map((mod) => mod.id))
    );
    const registeredModuleIds = record.module_registrations
        .filter(
            (mr: any) =>
                mr.status !== 'DROPPED' &&
                activeSemesterIds.has(mr.semester_id) &&
                currentLevelModuleIds.has(mr.module_id)
        )
        .map((mr: any) => mr.module_id);

    const completedModuleCodes = Array.from(
        new Set([
            ...record.grades
                .filter((g: any) => (g.grade_point ?? 0) >= 2.0 || (g.marks != null && g.marks >= 50))
                .map((g: any) => g.module.code),
            ...record.module_registrations
                .filter((mr: any) => mr.status !== 'DROPPED')
                .map((mr: any) => mr.module?.code)
                .filter(Boolean),
        ])
    );

    const regWindow = await getStudentModuleRegistrationWindow();

    return {
        student: {
            academicYear: record.current_level || studentYear,
            degreeProgram: record.degree_path?.code,
            specialization: record.specialization?.code,
        },
        semesters: semestersData,
        registeredModuleIds,
        completedModuleCodes,
        registrationWindow: {
            canEdit: regWindow.canEdit,
            windowOk: regWindow.windowOk,
            message: regWindow.message,
            label: regWindow.round?.label,
            status: regWindow.round?.status,
            opensAt: regWindow.round?.opens_at ? regWindow.round.opens_at.toISOString() : null,
            closesAt: regWindow.round?.closes_at ? regWindow.round.closes_at.toISOString() : null,
            studentMessage: regWindow.round?.student_message ?? null,
        },
    };
}


export async function registerForModules(moduleIds: string[]) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) u = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!u) throw new Error("User not found");
    userId = u.user_id;

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: userId },
    });
    if (!studentRecord) throw new Error("Student profile not found");
    await assertStudentWriteAccess(studentRecord.student_id);
    const record = studentRecord as any;

    try {
        const regWindow = await getStudentModuleRegistrationWindow();
        if (!regWindow.canEdit) {
            throw new Error(regWindow.message || 'Module registration is closed.');
        }

        // 1. Resolve Active Year and Semesters
        const semesters = await getAnnualSemesters();
        if (semesters.length === 0) throw new Error("No active academic year found for registration.");

        const studentYear =
            normalizeStudentLevel(record.current_level) ||
            'L' + Math.max(1, Math.ceil(record.admission_year ? new Date().getFullYear() - record.admission_year - 1 : 1));

        const catalogueStructures = await fetchProgramStructuresForEnrollment({
            programId: record.degree_path_id,
            specializationId: record.specialization_id,
            studentLevelRaw: record.current_level,
        });
        const allowedModuleIds = new Set(catalogueStructures.map((s) => s.module_id));
        const uniqueSelected = [...new Set(moduleIds)];
        if (uniqueSelected.some((id) => !allowedModuleIds.has(id))) {
            throw new Error("One or more modules do not belong to your academic program.");
        }

        const structures = catalogueStructures.filter((s) => uniqueSelected.includes(s.module_id));
        if (structures.length !== uniqueSelected.length) {
            throw new Error("One or more modules do not belong to your academic program.");
        }

        const passingGrades = await prisma.grade.findMany({
            where: {
                student_id: record.student_id,
                OR: [{ grade_point: { gte: 2.0 } }, { marks: { gte: 50 } }, { letter_grade: 'Pass' }],
            },
            include: { module: true },
        });
        const activeRegistrations = await prisma.moduleRegistration.findMany({
            where: {
                student_id: record.student_id,
                status: { not: 'DROPPED' },
            },
            include: { module: true },
        });
        const completedModuleCodes = new Set([
            ...passingGrades.map((g) => g.module.code),
            ...activeRegistrations.map((mr) => mr.module.code),
        ]);
        const selectedModuleSemestersByCode = new Map<string, number[]>();
        for (const structure of structures) {
            const code = structure.module.code as string;
            const semesterNumber = structure.semester_number as number;
            const existing = selectedModuleSemestersByCode.get(code) || [];
            existing.push(semesterNumber);
            selectedModuleSemestersByCode.set(code, existing);
        }
        for (const structure of structures) {
            const missingPrereqs = (structure.module.Module_A || [])
                .map((p: any) => p.code)
                .filter((code: string) => {
                    if (completedModuleCodes.has(code)) {
                        return false;
                    }

                    const selectedSemesters = selectedModuleSemestersByCode.get(code) || [];
                    const satisfiedByEarlierSemester = selectedSemesters.some(
                        (semesterNumber) => semesterNumber < structure.semester_number
                    );
                    return !satisfiedByEarlierSemester;
                });
            if (missingPrereqs.length > 0) {
                throw new Error(
                    `${structure.module.code}: Missing prerequisites (${missingPrereqs.join(', ')}).`
                );
            }
        }

        // 3. Fetch Credit Rules
        const creditRules = await prisma.academicCreditRule.findMany({
            where: { level: studentYear }
        });

        // 4. Validate Per Semester
        const semesterMapping = semesters.map(sem => {
            const semNum = sem.label.includes('1') ? 1 : 2;
            const semMods = structures.filter(s => s.semester_number === semNum);
            const semesterCatalogueModuleIds = catalogueStructures
                .filter((s) => s.semester_number === semNum)
                .map((s) => s.module_id);
            const totalCredits = semMods.reduce((sum, s) => sum + (s.module.credits || 0), 0);
            
            const rule = creditRules.find(r => r.semester_number === semNum) || { min_credits: 12, max_credits: 24 };

            if (totalCredits < rule.min_credits) throw new Error(`${sem.label}: Minimum ${rule.min_credits} credits required (current: ${totalCredits})`);
            if (totalCredits > rule.max_credits) throw new Error(`${sem.label}: Maximum ${rule.max_credits} credits exceeded (current: ${totalCredits})`);

            return {
                semesterId: sem.semester_id,
                moduleIds: semMods.map(s => s.module_id),
                semesterCatalogueModuleIds
            };
        });

        // 5. Transactional Sync for both semesters
        await prisma.$transaction(async (tx) => {
            for (const map of semesterMapping) {
                // Remove existing registrations for this specific semester (registered status only)
                await tx.moduleRegistration.deleteMany({
                    where: {
                        student_id: record.student_id,
                        semester_id: map.semesterId,
                        status: 'REGISTERED',
                        module_id: { in: map.semesterCatalogueModuleIds },
                        // Keep graded registrations to avoid FK violations from Grade.reg_id
                        grade: { is: null }
                    }
                });

                // Batch insert new registrations
                if (map.moduleIds.length > 0) {
                    await tx.moduleRegistration.createMany({
                        data: map.moduleIds.map(mid => ({
                            student_id: record.student_id,
                            module_id: mid,
                            semester_id: map.semesterId,
                            status: 'REGISTERED',
                            registration_date: new Date()
                        }))
                    });
                }
            }
        });

        revalidatePath('/dashboard/student/modules');
        return { success: true };

    } catch (e: any) {
        console.error("Annual Registration Failed:", e);
        throw new Error(e.message || "Submission failed");
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

    return record.module_registrations.map((reg: any) => {
        const isReleased = !!reg.grade?.released_at;
        return {
        id: reg.grade?.grade_id || reg.reg_id, // Use reg_id if no grade yet
        moduleCode: reg.module.code,
        moduleName: reg.module.name,
        credits: reg.module.credits,
        grade: isReleased ? reg.grade?.letter_grade : 'Pending',
        gradePoint: isReleased ? reg.grade?.grade_point || 0.0 : 0.0,
        countsTowardGpa: gradeContributesToGpa(reg.module),
        semester: reg.semester?.label || 'Unknown',
        // User requested "Year" to mean Level (L1, L2)
        level: reg.module.level || 'L1',
        date: reg.grade?.released_at || reg.registration_date,
        isReleased
    };
    });
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
                    status: { in: ['REGISTERED', 'ENROLLED'] }
                },
                include: { module: true }
            } as any
        } as any
    });

    if (!studentRecord) throw new Error("Student not found");
    const record = studentRecord as any;

    const moduleIds = record.module_registrations.map((mr: any) => mr.module_id);
    if (moduleIds.length === 0) return [];

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

    const formatScheduleClock = (value: Date) => {
        // Keep timetable clock stable (HH:mm) without local timezone shifting.
        const h = String(value.getUTCHours()).padStart(2, '0');
        const m = String(value.getUTCMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    };

    return schedules.map((s: any) => ({
        id: s.schedule_id,
        moduleCode: s.module.code,
        moduleName: s.module.name,
        type: s.type, // LECTURE, LAB, etc.
        day: s.day_of_week,
        startTime: formatScheduleClock(s.start_time),
        endTime: formatScheduleClock(s.end_time),
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
            g.semester &&
            gradeContributesToGpa(g.module)
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

export async function getStudentGoalsSummary() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) u = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!u) throw new Error("User not found");
    userId = u.user_id;

    const goals = await (prisma.academicGoal.findMany as any)({
        where: { student_id: userId },
        include: { module: true },
        orderBy: { created_at: 'desc' }
    }) as any[];
    const activeGoal = goals.find((g) => g.status === 'IN_PROGRESS') ?? null;
    const completedCount = goals.filter((g) => g.status === 'COMPLETED').length;
    const overdueCount = goals.filter((g) => g.deadline && g.deadline < new Date() && g.status !== 'COMPLETED').length;

    const graphTargets = {
        gpaTargetLine: goals
            .filter((g) => g.goal_type === 'GPA_TARGET' && g.target_value_number != null)
            .map((g) => ({ value: g.target_value_number as number, goalId: g.goal_id })),
        creditsTargetLine: goals
            .filter((g) => g.goal_type === 'CREDITS_TARGET' && g.target_value_number != null)
            .map((g) => ({ value: g.target_value_number as number, goalId: g.goal_id })),
        cgpaImprovementLine: goals
            .filter((g) => g.goal_type === 'CGPA_IMPROVEMENT' && g.target_value_number != null)
            .map((g) => ({
                value: Math.min(4, (g.baseline_value ?? 0) + (g.target_value_number as number)),
                baseline: g.baseline_value ?? 0,
                goalId: g.goal_id
            })),
    };

    return {
        totalGoals: goals.length,
        completedGoals: completedCount,
        overdueGoals: overdueCount,
        activeGoal: activeGoal ? {
            id: activeGoal.goal_id,
            title: activeGoal.title,
            goalType: activeGoal.goal_type,
            progress: activeGoal.progress,
            targetValue: activeGoal.target_value_number,
            moduleCode: activeGoal.module?.code ?? null,
            deadline: activeGoal.deadline ? activeGoal.deadline.toISOString() : null
        } : null,
        graphTargets
    };
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
