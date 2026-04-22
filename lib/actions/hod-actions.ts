'use server';

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { evaluateStudentEligibility } from '@/lib/graduation/student-eligibility';
import { resolveHodDepartmentScope } from '@/lib/hod-department-scope';
import {
    getAnalyticsEnabledOnboardingQuestions,
    pickAnalyticsMetadataValues,
} from '@/lib/onboarding/analytics-metadata';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

/** HoD lists: same classification as `AcademicEngine.calculateStudentGPA` — see `student-eligibility.ts`. */
async function attachEligibilityToStudents<T extends { id: string }>(students: T[]) {
    return Promise.all(
        students.map(async (s) => {
            const ev = await evaluateStudentEligibility(s.id);
            return { ...s, academicClass: ev.academicClass, currentGPA: ev.gpa, evaluation: ev };
        })
    );
}

/**
 * @swagger
 * /action/hod/getHODDashboardData:
 *   post:
 *     summary: "[Server Action] Get HOD Dashboard Data"
 *     description: Returns department-wide metrics including student totals, staff workload, and module performance for Heads of Department.
 *     tags:
 *       - HOD Actions
 *     responses:
 *       200:
 *         description: Successfully fetched dashboard data
 *       401:
 *         description: Unauthorized
 */
export async function getHODDashboardData() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;

    // Robust User Lookup
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }

    if (!u) throw new Error("HOD unauthenticated");
    userId = u.user_id;

    const staffRecord = await prisma.staff.findUnique({
        where: { staff_id: userId },
        include: { user: true }
    });

    if (!staffRecord) throw new Error("Staff profile not found");

    // Fetch department metrics based on assigned department
    // In a real application, HODs might be tied directly to a 'Department' table, but here it's string-based.
    const deptString = staffRecord.department;

    // In Prisma, we don't have department directly on Module. HOD oversees Programs or Staff.
    // Let's get all modules that belong to staff in the same department
    const deptStaff = await prisma.staff.findMany({
        where: { department: deptString },
        include: {
            user: true,
            assignments: {
                include: {
                    module: {
                        include: {
                            grades: true,
                            module_registrations: true
                        }
                    }
                }
            }
        }
    });

    const deptModulesMap = new Map();
    deptStaff.forEach(staff => {
        staff.assignments.forEach(assignment => {
            if (assignment.module && !deptModulesMap.has(assignment.module.module_id)) {
                deptModulesMap.set(assignment.module.module_id, assignment.module);
            }
        });
    });

    const deptModules = Array.from(deptModulesMap.values());

    // Extract all unique students taking modules in this department
    const departmentStudents = new Set();
    
    deptModules.forEach((m: any) => {
        m.module_registrations.forEach((r: any) => departmentStudents.add(r.student_id));
    });

    const totalStudents = departmentStudents.size;

    // Pathway Demand (Real tracking)
    const activePrograms = await prisma.degreeProgram.findMany({ 
        where: { active: true }, 
        include: { students: true } 
    });
    
    // Fetch capacities from ProgramIntake (fall back to 100)
    const intakes = await prisma.programIntake.findMany({ where: { status: 'OPEN' } });

    const pathwayDemandData = activePrograms.map(p => {
        const intake = intakes.find(i => i.program_id === p.program_id);
        return {
            name: p.name,
            applicants: p.students.length,
            capacity: intake?.max_students || 100
        };
    });

    // Build department-wide GPA summary using real grade data
    const academicPerformanceData = await Promise.all(activePrograms.map(async (p) => {
        const programStudents = await prisma.student.findMany({
            where: { degree_path_id: p.program_id },
            select: { current_gpa: true }
        });
        
        const avg = programStudents.length > 0 
            ? programStudents.reduce((acc, s) => acc + s.current_gpa, 0) / programStudents.length 
            : 0;

        return {
            program: p.name,
            avgGPA: parseFloat(avg.toFixed(2))
        };
    }));

    // Module Performance tracking
    const modulePerformanceData = deptModules.map(m => {
        const releasedGrades = m.grades.filter((g: any) => g.released_at !== null);
        const avg = releasedGrades.length > 0
            ? releasedGrades.reduce((acc: number, g: any) => acc + g.grade_point, 0) / releasedGrades.length
            : 0;
        return {
            module: m.name,
            code: m.code,
            avgGPA: parseFloat(avg.toFixed(2))
        };
    }).filter(m => m.avgGPA > 0);

    // Staff Workload tracking
    const staffWorkloadData = deptStaff.map(s => {
        const uniqueStudentIds = new Set<string>();
        s.assignments.forEach(a => {
            a.module?.module_registrations?.forEach(r => {
                uniqueStudentIds.add(r.student_id);
            });
        });

        return {
            name: `${s.user.firstName} ${s.user.lastName}`,
            modules: s.assignments.length,
            students: uniqueStudentIds.size
        };
    });

    // Selection workflow items awaiting HOD action (same queue as Selection Management)
    const [closedSelectionRounds, pendingAllocationChangeRequests] = await Promise.all([
        prisma.selectionRound.count({ where: { status: 'CLOSED' } }),
        prisma.selectionAllocationChangeRequest.count({ where: { status: 'PENDING' } }),
    ]);
    const pendingApprovals = closedSelectionRounds + pendingAllocationChangeRequests;

    return {
        hod: {
            firstName: staffRecord.user.firstName,
            lastName: staffRecord.user.lastName,
            department: deptString
        },
        totalStudents,
        totalStaff: await prisma.staff.count({ where: { department: deptString } }),
        totalModules: deptModules.length,
        pendingApprovals,
        pathwayDemandData,
        academicPerformanceData,
        modulePerformanceData,
        staffWorkloadData
    };
}

// ANALYTICS DATA (Aggregated from DB)

export type HODAnalyticsFilters = {
    pathway?: string | null;
    level?: string | null;
    metadataKey?: string | null;
    metadataValue?: string | null;
};

async function resolveHodUserId(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    if (session.user.role !== 'hod') throw new Error('Unauthorized');
    let userId = session.user.id;
    let u = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }
    if (!u) throw new Error('HOD unauthenticated');
    return u.user_id;
}

function monthKey(d: Date) {
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

function normalizeLevelFilter(level?: string | null) {
    const raw = String(level ?? '').trim().toUpperCase();
    if (!raw || raw === 'ALL') return undefined;
    if (raw === 'L1' || raw === 'LEVEL 1') return 'L1';
    if (raw === 'L2' || raw === 'LEVEL 2') return 'L2';
    if (raw === 'L3' || raw === 'LEVEL 3') return 'L3';
    if (raw === 'L4' || raw === 'LEVEL 4') return 'L4';
    return level ?? undefined;
}

/**
 * @swagger
 * /action/hod/getHODAnalyticsData:
 *   post:
 *     summary: "[Server Action] Get HOD Detailed Analytics"
 *     description: Returns in-depth department analytics including student demographics, grade distributions, and GPA trends.
 *     tags:
 *       - HOD Actions
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 properties:
 *                   pathway:
 *                     type: string
 *                   level:
 *                     type: string
 *     responses:
 *       200:
 *         description: Successfully fetched analytics
 */
export async function getHODAnalyticsData(filters?: HODAnalyticsFilters) {
    const userId = await resolveHodUserId();
    const scope = await resolveHodDepartmentScope(userId);

    type HodStudentRow = {
        id: string;
        name: string;
        currentGPA: number;
        specialization: string;
        academicYear: string;
        admissionYear: number;
        analyticsMetadata: Record<string, string>;
    };
    type HodGradeRow = {
        id: string;
        studentId: string;
        moduleId: string;
        credits: number;
        points: number;
        letterGrade: string;
        isReleased: boolean;
        semesterId: string;
        semesterLabel: string;
    };

    if (scope.deptModuleIds.length === 0) {
        return {
            students: [] as HodStudentRow[],
            modules: [] as { id: string; code: string; title: string }[],
            grades: [] as HodGradeRow[],
            enrollmentTrend: [] as { year: string; students: number }[],
            departmentGpaTrend: [] as { period: string; averageGPA: number }[],
            department: scope.department,
            pathwayOptions: [] as string[],
            levelOptions: [] as string[],
        };
    }

    const studentsRaw = await prisma.student.findMany({
        where: { student_id: { in: scope.departmentStudentIds } },
        include: {
            user: true,
            degree_path: true,
            specialization: true,
            gpa_history: { orderBy: { calculation_date: 'desc' }, take: 1 },
        },
    });
    const analyticsQuestions = await getAnalyticsEnabledOnboardingQuestions();
    const analyticsKeys = analyticsQuestions.map((q) => q.key);

    function mapStudent(s: (typeof studentsRaw)[0]) {
        return {
            id: s.student_id,
            name: `${s.user.firstName} ${s.user.lastName}`,
            currentGPA: s.gpa_history[0]?.gpa ?? s.current_gpa,
            pathway: s.degree_path?.name || 'Unassigned',
            specialization: s.specialization?.name || 'None',
            academicYear: s.current_level || 'Unknown',
            admissionYear: s.admission_year,
            analyticsMetadata: pickAnalyticsMetadataValues(s.metadata, analyticsKeys),
        };
    }

    const pathwayOptions = [
        ...new Set(studentsRaw.map((s) => s.degree_path?.name || 'Unassigned')),
    ].sort();
    const levelOptions = [
        ...new Set(studentsRaw.map((s) => s.current_level || 'Unknown')),
    ].sort();

    let students = studentsRaw.map(mapStudent);

    if (filters?.pathway && filters.pathway !== 'all') {
        students = students.filter((s) => s.pathway === filters.pathway);
    }
    const normalizedLevel = normalizeLevelFilter(filters?.level);
    if (normalizedLevel) {
        students = students.filter((s) => s.academicYear === normalizedLevel);
    }
    if (filters?.metadataKey && filters.metadataValue) {
        const key = filters.metadataKey;
        const expected = filters.metadataValue.toLowerCase();
        students = students.filter((s) => (s.analyticsMetadata[key] ?? '').toLowerCase() === expected);
    }

    const studentIdSet = new Set(students.map((s) => s.id));

    const modules = (
        await prisma.module.findMany({
            where: { module_id: { in: scope.deptModuleIds } },
            select: { module_id: true, code: true, name: true },
        })
    ).map((m) => ({ id: m.module_id, code: m.code, title: m.name }));

    const gradesRaw = await prisma.grade.findMany({
        where: {
            module_id: { in: scope.deptModuleIds },
            student_id: { in: scope.departmentStudentIds },
        },
        include: { module: true, semester: true },
    });

    function mapGrade(g: (typeof gradesRaw)[0]) {
        return {
            id: g.grade_id,
            studentId: g.student_id,
            moduleId: g.module_id,
            credits: g.module.credits,
            points: g.grade_point,
            letterGrade: g.letter_grade,
            isReleased: !!g.released_at,
            semesterId: g.semester_id,
            semesterLabel: g.semester?.label ?? '',
        };
    }

    const grades = gradesRaw.filter((g) => studentIdSet.has(g.student_id)).map(mapGrade);

    const admissionCounts = new Map<number, number>();
    for (const s of students) {
        admissionCounts.set(s.admissionYear, (admissionCounts.get(s.admissionYear) ?? 0) + 1);
    }
    const enrollmentTrend = [...admissionCounts.entries()]
        .sort(([a], [b]) => a - b)
        .map(([year, count]) => ({ year: String(year), students: count }));

    const historyForTrend = await prisma.gPAHistory.findMany({
        where: { student_id: { in: [...studentIdSet] } },
        orderBy: { calculation_date: 'asc' },
        select: { gpa: true, calculation_date: true },
    });

    const grouped = new Map<string, { total: number; n: number; ts: number }>();
    for (const row of historyForTrend) {
        const d = new Date(row.calculation_date);
        const key = monthKey(d);
        const cur = grouped.get(key) ?? { total: 0, n: 0, ts: d.getTime() };
        cur.total += row.gpa;
        cur.n += 1;
        grouped.set(key, cur);
    }
    const departmentGpaTrend = [...grouped.entries()]
        .sort((a, b) => a[1].ts - b[1].ts)
        .map(([period, v]) => ({
            period,
            averageGPA: v.n ? Math.round((v.total / v.n) * 100) / 100 : 0,
        }));

    return {
        students,
        modules,
        grades,
        enrollmentTrend,
        departmentGpaTrend,
        department: scope.department,
        pathwayOptions,
        levelOptions,
    };
}

// ----------------------------------------------------------------------
// PATHWAYS ACTIONS
// ----------------------------------------------------------------------

/**
 * @swagger
 * /action/hod/getHODPathwaysData:
 *   post:
 *     summary: "[Server Action] Get HOD Pathway Analytics"
 *     description: Returns student distribution and preference data for degree pathways within the HOD's department.
 *     tags:
 *       - HOD Actions
 *     responses:
 *       200:
 *         description: Successfully fetched pathway data
 */
export async function getHODPathwaysData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Fetch student analytics data for the department
    const data = await getHODAnalyticsData();
    return { students: data.students };
}

/**
 * @swagger
 * /action/hod/allocatePathway:
 *   post:
 *     summary: "[Server Action] Allocate Student Pathway"
 *     description: Manually assigns or reassigns students to a specific degree pathway or program.
 *     tags:
 *       - HOD Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               pathway:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully requested allocation
 */
export async function allocatePathway(studentIds: string[], pathway: string, reason: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Removing approval task creation as model is missing from schema
    // In future, this should re-enable once HOD approval workflow is formalised
    console.log(`[HOD] Pathway Allocation requested for ${studentIds.length} students to ${pathway}`);

    await writeAuditLog({
        adminId: session.user.id,
        action: 'HOD_PATHWAY_ALLOCATE_REQUEST',
        entityType: 'PATHWAY',
        entityId: pathway,
        category: 'STAFF',
        metadata: { studentCount: studentIds.length, reason: reason.slice(0, 500) },
    });

    return { success: true, allocated: studentIds.length, pathway };
}

// ----------------------------------------------------------------------
// REPORTS ACTIONS
// ----------------------------------------------------------------------

/**
 * @swagger
 * /action/hod/getHODReportsData:
 *   post:
 *     summary: "[Server Action] Get HOD Comprehensive Reports"
 *     description: Fetches all departmental reports including eligibility lists, academic goals, and intervention tracking.
 *     tags:
 *       - HOD Actions
 *     responses:
 *       200:
 *         description: Successfully fetched report data
 */
export async function getHODReportsData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Robust User & Staff Lookup
    let userId = session.user.id;
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }
    if (!u) throw new Error("HOD unauthenticated");

    const staffRecord = await prisma.staff.findUnique({
        where: { staff_id: u.user_id }
    });
    if (!staffRecord) throw new Error("Staff profile not found");

    const data = await getHODAnalyticsData();
    const studentsWithEligibility = await attachEligibilityToStudents(data.students);

    // Fetch actual academic goals for students in this department
    const academicGoalsRaw = await prisma.academicGoal.findMany({
        where: {
            student: {
                module_registrations: {
                    some: {
                        module: {
                            staff_assignments: {
                                some: {
                                    staff: { department: staffRecord.department }
                                }
                            }
                        }
                    }
                }
            }
        },
        include: { student: { include: { user: true } } },
        take: 50
    });

    const academicGoals = academicGoalsRaw.map(g => ({
        id: g.goal_id,
        studentId: g.student_id,
        studentName: `${g.student.user.firstName} ${g.student.user.lastName}`,
        title: g.title,
        status: g.status
    }));

    // Interventions are currently missing from schema, returning empty list
    const interventions: any[] = [];

    return {
        ...data,
        students: studentsWithEligibility,
        interventions,
        academicGoals
    };
}

// ----------------------------------------------------------------------
// RANKINGS ACTIONS
// ----------------------------------------------------------------------

/**
 * @swagger
 * /action/hod/getHODRankingsData:
 *   post:
 *     summary: "[Server Action] Get HOD Student Rankings"
 *     description: Returns a ranked list of students within the department based on weighted GPA and pass rate metrics.
 *     tags:
 *       - HOD Actions
 *     responses:
 *       200:
 *         description: Successfully fetched rankings data
 */
export async function getHODRankingsData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const data = await getHODAnalyticsData();
    const students = await attachEligibilityToStudents(data.students);

    return {
        students,
        grades: data.grades,
        modules: data.modules
    };
}

// ----------------------------------------------------------------------
// ELIGIBLE ACTIONS
// ----------------------------------------------------------------------

/**
 * @swagger
 * /action/hod/getHODEligibleData:
 *   post:
 *     summary: "[Server Action] Get HOD Graduation Eligibility"
 *     description: Fetches graduation eligibility status for all students in the HOD's department.
 *     tags:
 *       - HOD Actions
 *     responses:
 *       200:
 *         description: Successfully fetched eligibility data
 */
export async function getHODEligibleData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const data = await getHODAnalyticsData();
    const students = await attachEligibilityToStudents(data.students);

    return {
        students,
        grades: data.grades,
        modules: data.modules
    };
}

// ----------------------------------------------------------------------
// SYSTEM SETTINGS (Rankings Weights)
// ----------------------------------------------------------------------

/**
 * @swagger
 * /action/hod/getRankingWeights:
 *   post:
 *     summary: "[Server Action] Get Ranking Formula Weights"
 *     description: Returns the current weights used for GPA and pass rate in the student ranking calculation.
 *     tags:
 *       - HOD Actions
 *     responses:
 *       200:
 *         description: Successfully fetched weights
 */
export async function getRankingWeights() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const gpaWeightSetting = await prisma.systemSetting.findUnique({ where: { key: 'ranking_weight_gpa' } });
    const passRateWeightSetting = await prisma.systemSetting.findUnique({ where: { key: 'ranking_weight_pass_rate' } });

    return {
        gpaWeight: gpaWeightSetting ? parseFloat(gpaWeightSetting.value) : 0.6,
        passRateWeight: passRateWeightSetting ? parseFloat(passRateWeightSetting.value) : 0.4
    };
}

export async function updateRankingWeights(gpaWeight: number, passRateWeight: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.systemSetting.upsert({
        where: { key: 'ranking_weight_gpa' },
        update: { value: gpaWeight.toString(), updated_at: new Date() },
        create: {
            setting_id: randomUUID(),
            key: 'ranking_weight_gpa',
            value: gpaWeight.toString(),
            category: 'Rankings',
            description: 'Weight of GPA in student rankings score',
            updated_at: new Date(),
        },
    });

    await prisma.systemSetting.upsert({
        where: { key: 'ranking_weight_pass_rate' },
        update: { value: passRateWeight.toString(), updated_at: new Date() },
        create: {
            setting_id: randomUUID(),
            key: 'ranking_weight_pass_rate',
            value: passRateWeight.toString(),
            category: 'Rankings',
            description: 'Weight of Pass Rate in student rankings score',
            updated_at: new Date(),
        },
    });

    await writeAuditLog({
        adminId: session.user.id,
        action: 'HOD_RANKING_WEIGHTS_UPDATE',
        entityType: 'SYSTEM_SETTING',
        entityId: 'ranking_weights',
        category: 'STAFF',
        metadata: { gpaWeight, passRateWeight },
    });

    return { success: true };
}

// ----------------------------------------------------------------------
// TRENDS ACTIONS
// ----------------------------------------------------------------------

export type HODTrendsFilters = HODAnalyticsFilters;

/**
 * @swagger
 * /action/hod/getHODTrendsData:
 *   post:
 *     summary: "[Server Action] Get HOD Performance Trends"
 *     description: Returns historical GPA trends and performance deltas for the department's student cohorts.
 *     tags:
 *       - HOD Actions
 *     responses:
 *       200:
 *         description: Successfully fetched trends data
 */
export async function getHODTrendsData(filters?: HODTrendsFilters) {
    const userId = await resolveHodUserId();
    const scope = await resolveHodDepartmentScope(userId);

    let scopedStudentIds = [...scope.departmentStudentIds];

    if (filters?.pathway && filters.pathway !== 'all') {
        const rows = await prisma.student.findMany({
            where: {
                student_id: { in: scope.departmentStudentIds },
                degree_path: { name: filters.pathway },
            },
            select: { student_id: true },
        });
        scopedStudentIds = rows.map((r) => r.student_id);
    }
    if (filters?.level && filters.level !== 'all') {
        const rows = await prisma.student.findMany({
            where: {
                student_id: { in: scopedStudentIds },
                current_level: filters.level,
            },
            select: { student_id: true },
        });
        scopedStudentIds = rows.map((r) => r.student_id);
    }

    const history =
        scopedStudentIds.length === 0
            ? []
            : await prisma.gPAHistory.findMany({
                  where: { student_id: { in: scopedStudentIds } },
                  orderBy: { calculation_date: 'asc' },
                  include: {
                      student: {
                          include: { degree_path: true },
                      },
                  },
              });

    const latestStudents =
        scopedStudentIds.length === 0
            ? []
            : await prisma.student.findMany({
                  where: { student_id: { in: scopedStudentIds } },
                  select: { current_gpa: true },
              });

    const departmentMeanGpa = latestStudents.length
        ? latestStudents.reduce((acc, s) => acc + s.current_gpa, 0) / latestStudents.length
        : 0;
    const highAchieversPct = latestStudents.length
        ? (latestStudents.filter((s) => s.current_gpa > 3.5).length / latestStudents.length) * 100
        : 0;

    const bucket = new Map<string, { total: number; n: number; ts: number }>();
    for (const row of history) {
        const d = new Date(row.calculation_date);
        const key = monthKey(d);
        const cur = bucket.get(key) ?? { total: 0, n: 0, ts: d.getTime() };
        cur.total += row.gpa;
        cur.n += 1;
        bucket.set(key, cur);
    }
    const series = [...bucket.entries()]
        .sort((a, b) => a[1].ts - b[1].ts)
        .map(([name, v]) => ({
            name,
            avgGPA: v.n ? v.total / v.n : 0,
        }));

    let performanceDeltaPct = 0;
    let trendDirection: 'up' | 'down' | 'flat' = 'flat';
    if (series.length >= 2) {
        const last = series[series.length - 1].avgGPA;
        const prev = series[series.length - 2].avgGPA;
        performanceDeltaPct = prev ? ((last - prev) / prev) * 100 : 0;
        if (performanceDeltaPct > 0.5) trendDirection = 'up';
        else if (performanceDeltaPct < -0.5) trendDirection = 'down';
    }

    const cohortForOptions = await prisma.student.findMany({
        where: { student_id: { in: scope.departmentStudentIds } },
        include: { degree_path: true },
    });
    const pathwayOptions = [
        ...new Set(cohortForOptions.map((s) => s.degree_path?.name || 'Unassigned')),
    ].sort();
    const levelOptions = [
        ...new Set(cohortForOptions.map((s) => s.current_level || 'Unknown')),
    ].sort();

    return {
        history,
        department: scope.department,
        pathwayOptions,
        levelOptions,
        summary: {
            performanceDeltaPct: Math.round(performanceDeltaPct * 10) / 10,
            highAchieversPct: Math.round(highAchieversPct * 10) / 10,
            departmentMeanGpa: Math.round(departmentMeanGpa * 100) / 100,
            trendDirection,
        },
    };
}
