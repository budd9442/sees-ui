'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';

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

    // Staff Workload tracking
    const staffWorkloadData = deptStaff.map(s => ({
        name: `${s.user.first_name} ${s.user.last_name}`,
        modules: s.assignments.length,
        students: s.assignments.reduce((acc, a) => acc + (a.module?.module_registrations?.length || 0), 0)
    }));

    // Real pending approvals
    const pendingApprovals = await prisma.approvalTask.count({
        where: { target_role: 'HOD', status: 'PENDING' }
    });

    return {
        hod: {
            firstName: staffRecord.user.first_name,
            lastName: staffRecord.user.last_name,
            department: deptString
        },
        totalStudents,
        totalStaff: await prisma.staff.count({ where: { department: deptString } }),
        totalModules: deptModules.length,
        pendingApprovals,
        pathwayDemandData,
        academicPerformanceData,
        staffWorkloadData
    };
}

// ----------------------------------------------------------------------
// ANALYTICS DATA (MOCK - Aggregated from DB where possible)
// ----------------------------------------------------------------------

export async function getHODAnalyticsData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // For HOD, we need real data for students in their department's programs
    const allStudents = await prisma.student.findMany({
        include: {
            user: true,
            degree_path: true,
            gpa_history: { orderBy: { calculation_date: 'desc' }, take: 1 }
        }
    });

    const students = allStudents.map(s => ({
        id: s.student_id,
        name: `${s.user.first_name} ${s.user.last_name}`,
        currentGPA: s.gpa_history[0]?.gpa || 0,
        specialization: s.degree_path?.name || "Unassigned",
        academicYear: s.current_level
    }));

    const allModules = await prisma.module.findMany();
    const modules = allModules.map(m => ({
        id: m.module_id,
        code: m.code,
        title: m.name
    }));

    const allGrades = await prisma.grade.findMany();
    const grades = allGrades.map(g => ({
        id: g.grade_id,
        studentId: g.student_id,
        moduleId: g.module_id,
        credits: 3, // Simplification
        points: g.grade_point,
        letterGrade: g.letter_grade,
        isReleased: !!g.released_at
    }));

    return {
        students,
        modules,
        grades
    };
}

// ----------------------------------------------------------------------
// PATHWAYS ACTIONS
// ----------------------------------------------------------------------

export async function getHODPathwaysData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Fetch student analytics data for the department
    const data = await getHODAnalyticsData();
    return { students: data.students };
}

export async function allocatePathway(studentIds: string[], pathway: string, reason: string) {
    // Mock save allocation
    return { success: true, allocated: studentIds.length, pathway };
}

// ----------------------------------------------------------------------
// REPORTS ACTIONS
// ----------------------------------------------------------------------

export async function getHODReportsData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Robust User & Staff Lookup
    const u = await prisma.user.findFirst({
        where: { OR: [{ user_id: session.user.id }, { email: session.user.email || '' }] }
    });
    if (!u) throw new Error("HOD unauthenticated");

    const staffRecord = await prisma.staff.findUnique({
        where: { staff_id: u.user_id }
    });
    if (!staffRecord) throw new Error("Staff profile not found");

    const data = await getHODAnalyticsData();

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
        studentName: `${g.student.user.first_name} ${g.student.user.last_name}`,
        title: g.title,
        status: g.status
    }));

    // Fetch actual interventions for students in this department
    const interventionsRaw = await prisma.intervention.findMany({
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

    const interventions = interventionsRaw.map(i => ({
        id: i.intervention_id,
        studentId: i.student_id,
        studentName: `${i.student.user.first_name} ${i.student.user.last_name}`,
        type: i.type,
        status: i.status
    }));

    return {
        ...data,
        interventions,
        academicGoals
    };
}

// ----------------------------------------------------------------------
// RANKINGS ACTIONS
// ----------------------------------------------------------------------

export async function getHODRankingsData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const data = await getHODAnalyticsData();

    return {
        students: data.students,
        grades: data.grades,
        modules: data.modules
    };
}

// ----------------------------------------------------------------------
// ELIGIBLE ACTIONS
// ----------------------------------------------------------------------

export async function getHODEligibleData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const data = await getHODAnalyticsData();

    return {
        students: data.students,
        grades: data.grades,
        modules: data.modules
    };
}

// ----------------------------------------------------------------------
// SYSTEM SETTINGS (Rankings Weights)
// ----------------------------------------------------------------------

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
        update: { value: gpaWeight.toString() },
        create: {
            key: 'ranking_weight_gpa',
            value: gpaWeight.toString(),
            category: 'Rankings',
            description: 'Weight of GPA in student rankings score'
        }
    });

    await prisma.systemSetting.upsert({
        where: { key: 'ranking_weight_pass_rate' },
        update: { value: passRateWeight.toString() },
        create: {
            key: 'ranking_weight_pass_rate',
            value: passRateWeight.toString(),
            category: 'Rankings',
            description: 'Weight of Pass Rate in student rankings score'
        }
    });

    return { success: true };
}
