'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { assertStudentWriteAccess } from '@/lib/actions/student-access';
import { AcademicEngine } from '@/lib/services/academic-engine';

export async function getCreditsData() {
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
            grades: {
                include: {
                    module: true,
                    semester: {
                        include: { academic_year: true }
                    }
                }
            } as any
        }
    });

    if (!studentRecord) throw new Error("Student profile not found");

    const record = studentRecord as any;

    const studentGrades = record.grades.map((g: any) => ({
        id: g.grade_id,
        moduleId: g.module_id,
        moduleCode: g.module.code,
        moduleTitle: g.module.name,
        credits: g.module.credits,
        marks: g.marks ?? null,
        grade: g.marks ?? null,
        letterGrade: g.letter_grade,
        points: g.grade_point,
        gradePoint: g.grade_point,
        semester: g.semester.label || 'Unknown',
        academicYear: g.module.level || 'L1', // Fallback to module level
        isReleased: !!g.released_at
    }));

    return { studentGrades };
}

type QuantGoalType = 'GPA_TARGET' | 'CREDITS_TARGET' | 'MODULE_GRADE_TARGET' | 'CGPA_IMPROVEMENT';

function clampProgress(value: number) {
    return Math.max(0, Math.min(100, Math.round(value)));
}

async function getGoalMetrics(studentId: string, goalType: QuantGoalType, moduleId?: string | null) {
    const { gpa: currentGPA, totalCredits } = await AcademicEngine.calculateStudentGPA(studentId);
    let currentModuleGrade: number | null = null;

    if (goalType === 'MODULE_GRADE_TARGET') {
        if (!moduleId) throw new Error('Module is required for module-grade goals.');
        const moduleGrade = await prisma.grade.findFirst({
            where: { student_id: studentId, module_id: moduleId, released_at: { not: null } },
            orderBy: { released_at: 'desc' }
        });
        currentModuleGrade = moduleGrade?.marks ?? null;
    }

    return { currentGPA, totalCredits, currentModuleGrade };
}

function validateQuantGoalPayload(data: {
    goalType: QuantGoalType;
    targetValue: number;
    baselineValue?: number | null;
}) {
    if (!Number.isFinite(data.targetValue)) {
        throw new Error('Target value must be a number.');
    }
    if (data.goalType === 'GPA_TARGET' && (data.targetValue < 0 || data.targetValue > 4)) {
        throw new Error('GPA target must be between 0 and 4.');
    }
    if (data.goalType === 'CREDITS_TARGET' && data.targetValue < 1) {
        throw new Error('Credits target must be at least 1.');
    }
    if (data.goalType === 'MODULE_GRADE_TARGET' && (data.targetValue < 0 || data.targetValue > 100)) {
        throw new Error('Module grade target must be between 0 and 100.');
    }
    if (data.goalType === 'CGPA_IMPROVEMENT' && data.targetValue <= 0) {
        throw new Error('CGPA improvement target must be greater than 0.');
    }
    if (data.goalType === 'CGPA_IMPROVEMENT' && data.baselineValue != null && (data.baselineValue < 0 || data.baselineValue > 4)) {
        throw new Error('Baseline GPA must be between 0 and 4.');
    }
}

function computeProgress(args: {
    goalType: QuantGoalType;
    targetValue: number;
    baselineValue?: number | null;
    currentGPA: number;
    totalCredits: number;
    currentModuleGrade: number | null;
}) {
    const { goalType, targetValue, baselineValue, currentGPA, totalCredits, currentModuleGrade } = args;
    if (goalType === 'GPA_TARGET') return clampProgress((currentGPA / targetValue) * 100);
    if (goalType === 'CREDITS_TARGET') return clampProgress((totalCredits / targetValue) * 100);
    if (goalType === 'MODULE_GRADE_TARGET') return clampProgress(((currentModuleGrade ?? 0) / targetValue) * 100);
    const baseline = baselineValue ?? 0;
    const targetGpa = Math.min(4, baseline + targetValue);
    if (targetGpa <= baseline) return 0;
    return clampProgress(((currentGPA - baseline) / (targetGpa - baseline)) * 100);
}

function getMetricUnit(goalType: QuantGoalType) {
    if (goalType === 'CREDITS_TARGET') return 'CREDITS';
    if (goalType === 'MODULE_GRADE_TARGET') return 'MARKS';
    if (goalType === 'CGPA_IMPROVEMENT') return 'POINTS';
    return 'GPA';
}

export async function getGoals() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // We already trust session.user.id from the DB
    const goals = await prisma.academicGoal.findMany({
        where: { student_id: session.user.id },
        include: { module: true },
        orderBy: { created_at: 'desc' }
    });

    return goals.map(g => ({
        id: g.goal_id,
        title: g.title,
        description: g.description,
        goalType: g.goal_type as QuantGoalType,
        targetGPA: g.target_gpa,
        targetClass: g.target_class,
        targetValue: g.target_value_number,
        baselineValue: g.baseline_value,
        metricUnit: g.metric_unit,
        moduleId: g.module_id,
        moduleCode: g.module?.code ?? null,
        progress: g.progress,
        status: g.status,
        deadline: g.deadline,
        milestones: g.milestones,
        createdAt: g.created_at
    }));
}

export async function createGoal(data: {
    title: string;
    description?: string;
    goalType: QuantGoalType;
    targetValue: number;
    baselineValue?: number | null;
    moduleId?: string | null;
    deadline?: Date | null;
    milestones?: string[];
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    validateQuantGoalPayload({
        goalType: data.goalType,
        targetValue: data.targetValue,
        baselineValue: data.baselineValue
    });
    if (data.goalType === 'MODULE_GRADE_TARGET' && !data.moduleId) {
        throw new Error('Module grade goals require a module.');
    }

    const activeGoals = await prisma.academicGoal.count({
        where: { student_id: session.user.id, status: 'IN_PROGRESS' }
    });
    if (activeGoals > 0) {
        throw new Error('You can only have one active goal at a time.');
    }

    const metrics = await getGoalMetrics(session.user.id, data.goalType, data.moduleId);
    const progress = computeProgress({
        goalType: data.goalType,
        targetValue: data.targetValue,
        baselineValue: data.baselineValue,
        ...metrics
    });

    const goal = await prisma.academicGoal.create({
        data: {
            student_id: session.user.id,
            title: data.title,
            description: data.description,
            goal_type: data.goalType,
            metric_unit: getMetricUnit(data.goalType),
            target_value_number: data.targetValue,
            baseline_value: data.baselineValue ?? null,
            module_id: data.moduleId ?? null,
            target_gpa: data.goalType === 'GPA_TARGET' ? data.targetValue : undefined,
            target_value: String(data.targetValue),
            deadline: data.deadline,
            milestones: data.milestones || [],
            progress,
            status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
            achieved_at: progress >= 100 ? new Date() : null
        }
    });
    revalidatePath('/dashboard/student/goals');
    revalidatePath('/dashboard/student');
    return goal;
}

export async function updateGoal(goalId: string, data: Partial<{
    title: string;
    description: string;
    goalType: QuantGoalType;
    targetValue: number;
    baselineValue: number | null;
    moduleId: string | null;
    deadline: Date | null;
    milestones: string[];
}>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    // verify ownership
    const goal = await prisma.academicGoal.findUnique({ where: { goal_id: goalId } });
    if (!goal || goal.student_id !== session.user.id) throw new Error("Goal not found or unauthorized");

    const goalType = data.goalType ?? (goal.goal_type as QuantGoalType);
    const targetValue = data.targetValue ?? goal.target_value_number ?? goal.target_gpa;
    if (!targetValue) throw new Error('A numeric target value is required.');
    validateQuantGoalPayload({
        goalType,
        targetValue,
        baselineValue: data.baselineValue ?? goal.baseline_value
    });
    const moduleId = data.moduleId ?? goal.module_id;
    if (goalType === 'MODULE_GRADE_TARGET' && !moduleId) {
        throw new Error('Module grade goals require a module.');
    }
    const metrics = await getGoalMetrics(session.user.id, goalType, moduleId);
    const progress = computeProgress({
        goalType,
        targetValue,
        baselineValue: data.baselineValue ?? goal.baseline_value,
        ...metrics
    });

    const updated = await prisma.academicGoal.update({
        where: { goal_id: goalId },
        data: {
            title: data.title,
            description: data.description,
            goal_type: goalType,
            metric_unit: getMetricUnit(goalType),
            target_value_number: targetValue,
            baseline_value: data.baselineValue ?? undefined,
            module_id: moduleId,
            target_gpa: goalType === 'GPA_TARGET' ? targetValue : undefined,
            target_value: String(targetValue),
            deadline: data.deadline ?? undefined,
            milestones: data.milestones ?? undefined,
            progress,
            status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
            achieved_at: progress >= 100 ? new Date() : null
        }
    });
    revalidatePath('/dashboard/student/goals');
    revalidatePath('/dashboard/student');
    return updated;
}

export async function deleteGoal(goalId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    // verify ownership
    const goal = await prisma.academicGoal.findUnique({ where: { goal_id: goalId } });
    if (!goal || goal.student_id !== session.user.id) throw new Error("Goal not found or unauthorized");

    await prisma.academicGoal.delete({
        where: { goal_id: goalId }
    });
    revalidatePath('/dashboard/student/goals');
    revalidatePath('/dashboard/student');
    return { success: true };
}

export async function getPathwayData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: {
            degree_path: true,
        }
    });

    if (!studentRecord) throw new Error("Student profile not found");

    const mitProgram = await prisma.degreeProgram.findFirst({ where: { code: 'MIT' } });
    const itProgram = await prisma.degreeProgram.findFirst({ where: { code: 'IT' } });

    const totalL1 = await prisma.student.count({ where: { current_level: 'Level 1' } });
    const mitDemandCount = mitProgram ? await prisma.student.count({ where: { current_level: 'Level 1', degree_path_id: mitProgram.program_id } }) : 0;
    const itDemandCount = itProgram ? await prisma.student.count({ where: { current_level: 'Level 1', degree_path_id: itProgram.program_id } }) : 0;

    const mitDemand = totalL1 > 0 ? Math.round((mitDemandCount / totalL1) * 100) : 0;
    const itDemand = totalL1 > 0 ? Math.round((itDemandCount / totalL1) * 100) : 0;

    // Fetch capacity from ProgramIntake (default to 60 as mentioned in UI if not found)
    const mitIntake = mitProgram ? await prisma.programIntake.findFirst({
        where: { program_id: mitProgram.program_id, status: 'OPEN' }
    }) : null;
    const itIntake = itProgram ? await prisma.programIntake.findFirst({
        where: { program_id: itProgram.program_id, status: 'OPEN' }
    }) : null;

    const mitCapacity = mitIntake?.max_students || 60;
    const itCapacity = itIntake?.max_students || 60;

    // Provide ranking data based on current GPA among peers
    const studentRank = await prisma.student.count({
        where: {
            current_level: 'Level 1',
            current_gpa: { gt: studentRecord.current_gpa }
        }
    }) + 1;

    return {
        currentStudent: {
            studentId: studentRecord.student_id,
            academicYear: studentRecord.current_level === 'Level 1' ? 'L1' : studentRecord.current_level,
            degreeProgram: studentRecord.degree_path.code, // E.g., MIT, IT
            pathwayLocked: studentRecord.pathway_locked,
            currentGPA: studentRecord.current_gpa,
            preference1: studentRecord.pathway_preference_1_id,
            preference2: studentRecord.pathway_preference_2_id,
        },
        pathwayDemand: {
            MIT: mitDemand,
            IT: itDemand,
            mitCount: mitDemandCount,
            itCount: itDemandCount,
            mitCapacity,
            itCapacity,
            totalStudents: totalL1
        },
        studentRank
    };
}

export async function getSpecializationData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: session.user.id }
    });

    if (!studentRecord) throw new Error("Student profile not found");

    // Only students with a degree program (e.g. MIT) have specializations
    if (studentRecord.degree_path_id) {
        const specializations = await prisma.specialization.findMany({
            where: { program_id: studentRecord.degree_path_id, active: true }
        });

        const specsWithCounts = await Promise.all(specializations.map(async (spec) => {
            const count = await prisma.student.count({
                where: { specialization_id: spec.specialization_id }
            });

            // Default capacity to 60 for now (can be made configurable in the future via ProgramIntake)
            const capacity = 60; 

            return {
                id: spec.code,
                name: spec.name,
                description: spec.description || '',
                count,
                capacity,
                isFull: count >= capacity
            };
        }));

        return {
            specializations: specsWithCounts,
            currentSpecializationId: studentRecord.specialization_id,
            // Find current specialization code for comparison in client
            currentSpecialization: specializations.find(s => s.specialization_id === studentRecord.specialization_id)?.code || null
        };
    }

    return { specializations: [], currentSpecialization: null };
}

export async function updateStudentPathway(programCode: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: session.user.id }
    });

    if (!studentRecord) throw new Error("Student profile not found");
    if (studentRecord.pathway_locked) throw new Error("Pathway is already locked");

    const targetProgram = await prisma.degreeProgram.findFirst({ where: { code: programCode } });
    if (!targetProgram) throw new Error("Invalid program code");

    await prisma.student.update({
        where: { student_id: session.user.id },
        data: {
            degree_path_id: targetProgram.program_id,
            pathway_selection_date: new Date()
        }
    });

    revalidatePath('/dashboard/student/pathway');
    revalidatePath('/dashboard/student/specialization'); // Might affect specs
    return { success: true };
}

export async function updateStudentSpecialization(specCode: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    // Perform the entire operation in a transaction to handle capacity race conditions
    return await prisma.$transaction(async (tx) => {
        // 1. Get current student record
        const student = await tx.student.findUnique({
            where: { student_id: session.user.id }
        });

        if (!student) throw new Error("Student profile not found");

        // 2. Resolve specialization code to ID and verify it belongs to the same program
        const targetSpec = await tx.specialization.findFirst({
            where: {
                code: specCode,
                program_id: student.degree_path_id,
            },
        });

        if (!targetSpec) throw new Error("Invalid specialization for your program");
        if (!targetSpec.active) throw new Error("Specialization is currently closed");

        // 3. Check capacity (only if changing or selecting for the first time)
        if (student.specialization_id !== targetSpec.specialization_id) {
            const currentEnrollment = await tx.student.count({
                where: { specialization_id: targetSpec.specialization_id }
            });

            const maxCapacity = 60; // Hardcoded default, same as getSpecializationData
            if (currentEnrollment >= maxCapacity) {
                throw new Error("This specialization has reached its maximum capacity. Please choose another.");
            }

            // 4. Update the student record
            await tx.student.update({
                where: { student_id: session.user.id },
                data: {
                    specialization_id: targetSpec.specialization_id
                }
            });
        }

        revalidatePath('/dashboard/student/specialization');
        revalidatePath('/dashboard/student/pathway');
        return { success: true };
    });
}

// ----------------------------------------------------------------------
// INTERNSHIP ACTIONS
// ----------------------------------------------------------------------

export async function getInternshipData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: {
            internships: {
                include: {
                    milestones: { orderBy: { due_date: 'asc' } },
                    documents: { orderBy: { uploaded_at: 'desc' } }
                }
            }
        }
    });

    if (!studentRecord) throw new Error("Student profile not found");

    // Internship eligibility: Level 3 or 4
    const isEligible = studentRecord.current_level === 'Level 3' || studentRecord.current_level === 'Level 4';

    const internship = studentRecord.internships.length > 0 ? studentRecord.internships[0] : null;

    return {
        isEligible,
        internship: internship ? {
            id: internship.internship_id,
            company: internship.company,
            role: internship.role,
            startDate: internship.start_date.toISOString(),
            endDate: internship.end_date.toISOString(),
            status: internship.status as any,
            supervisorName: internship.supervisorName,
            supervisorEmail: internship.supervisor_email,
            supervisorPhone: internship.supervisor_phone,
            description: internship.description,
            progress: internship.progress,
            milestones: internship.milestones.map(m => ({
                id: m.milestone_id,
                title: m.title,
                description: m.description,
                dueDate: m.due_date.toISOString(),
                completed: m.completed,
                completedDate: m.completed_date ? m.completed_date.toISOString() : undefined,
            })),
            documents: internship.documents.map(d => ({
                id: d.document_id,
                name: d.name,
                type: d.type as any,
                uploadedAt: d.uploaded_at.toISOString(),
                url: d.url
            }))
        } : null
    };
}

export async function saveInternship(data: {
    id?: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    status: string;
    supervisorName?: string;
    supervisorEmail?: string;
    supervisorPhone?: string;
    description?: string;
    progress: number;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    if (data.id) {
        // Update existing
        return await prisma.internship.update({
            where: { internship_id: data.id },
            data: {
                company: data.company,
                role: data.role,
                start_date: new Date(data.startDate),
                end_date: new Date(data.endDate),
                status: data.status,
                supervisorName: data.supervisorName,
                supervisor_email: data.supervisorEmail,
                supervisor_phone: data.supervisorPhone,
                description: data.description,
                progress: data.progress
            }
        });
    } else {
        // Create new
        const newInt = await prisma.internship.create({
            data: {
                student_id: session.user.id,
                company: data.company,
                role: data.role,
                start_date: new Date(data.startDate),
                end_date: new Date(data.endDate),
                status: data.status,
                supervisorName: data.supervisorName,
                supervisor_email: data.supervisorEmail,
                supervisor_phone: data.supervisorPhone,
                description: data.description,
                progress: data.progress
            }
        });
        return newInt;
    }
}

export async function addInternshipMilestone(internshipId: string, data: {
    title: string;
    description?: string;
    dueDate: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    // verify ownership
    const internship = await prisma.internship.findUnique({ where: { internship_id: internshipId } });
    if (!internship || internship.student_id !== session.user.id) throw new Error("Unauthorized");

    return await prisma.internshipMilestone.create({
        data: {
            internship_id: internshipId,
            title: data.title,
            description: data.description,
            due_date: new Date(data.dueDate),
            completed: false
        }
    });
}

export async function toggleInternshipMilestone(milestoneId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    const milestone = await prisma.internshipMilestone.findUnique({
        where: { milestone_id: milestoneId },
        include: { internship: true }
    });

    if (!milestone || milestone.internship.student_id !== session.user.id) throw new Error("Unauthorized");

    const newCompleted = !milestone.completed;
    return await prisma.internshipMilestone.update({
        where: { milestone_id: milestoneId },
        data: {
            completed: newCompleted,
            completed_date: newCompleted ? new Date() : null
        }
    });
}

export async function addInternshipDocument(internshipId: string, data: {
    name: string;
    type: string;
    url: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    // verify ownership
    const internship = await prisma.internship.findUnique({ where: { internship_id: internshipId } });
    if (!internship || internship.student_id !== session.user.id) throw new Error("Unauthorized");

    return await prisma.internshipDocument.create({
        data: {
            internship_id: internshipId,
            name: data.name,
            type: data.type,
            url: data.url
        }
    });
}

// ----------------------------------------------------------------------
// PROFILE ACTIONS
// ----------------------------------------------------------------------

export async function getStudentProfile() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { user_id: session.user.id }
    });

    if (!user) throw new Error("User not found");

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: {
            degree_path: true,
            specialization: true,
            advisor: {
                include: { staff: { include: { user: true } } }
            }
        }
    });

    if (!studentRecord) throw new Error("Student profile not found");

    const grades = await prisma.grade.findMany({
        where: { student_id: session.user.id }
    });

    return {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        emergencyContact: user.emergency_contact || '',
        linkedIn: user.linkedin || '',
        github: user.github || '',
        avatar: user.avatar || '',
        academicInfo: {
            studentId: studentRecord.student_id,
            level: studentRecord.current_level || 'Level 1',
            pathway: studentRecord.degree_path.name,
            specialization: studentRecord.specialization?.name || 'None',
            advisor: studentRecord.advisor ? `${studentRecord.advisor.staff.user.firstName} ${studentRecord.advisor.staff.user.lastName}` : 'Unassigned',
            enrollmentDate: new Date(studentRecord.admission_year, 8, 1).toISOString(),
            expectedGraduation: new Date(studentRecord.admission_year + 4, 5, 1).toISOString(),
            currentGPA: studentRecord.current_gpa,
            cumulativeCredits: grades.reduce(
                (sum, g) => sum + ((g.grade_point ?? 0) >= 2.0 || (g.marks != null && g.marks >= 50) ? 3 : 0),
                0
            ),
            completedCredits:
                grades.filter(
                    (g) => (g.grade_point ?? 0) >= 2.0 || (g.marks != null && g.marks >= 50)
                ).length * 3
        }
    };
}

export async function updateStudentProfile(data: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    bio: string;
    emergencyContact: string;
    linkedIn: string;
    github: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    await prisma.user.update({
        where: { user_id: session.user.id },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address: data.address,
            bio: data.bio,
            emergency_contact: data.emergencyContact,
            linkedin: data.linkedIn,
            github: data.github
        }
    });

    return { success: true };
}

// ----------------------------------------------------------------------
// RANKINGS ACTIONS
// ----------------------------------------------------------------------

export async function getRankingsData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let userId = session.user.id;
    let userRecord = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!userRecord && session.user.email) {
        userRecord = await prisma.user.findUnique({ where: { email: session.user.email } });
    }
    if (!userRecord) throw new Error("User not found");
    userId = userRecord.user_id;

    const currentStudent = await prisma.student.findUnique({
        where: { student_id: userId },
        select: { current_level: true },
    });
    if (!currentStudent) throw new Error("Student profile not found");

    // Fetch all active students with their associated user and pathway information
    const students = await prisma.student.findMany({
        where: {
            enrollment_status: 'ENROLLED',
            current_level: currentStudent.current_level,
        },
        include: {
            user: true,
            degree_path: true,
            specialization: true,
            gpa_history: {
                orderBy: { calculation_date: 'desc' },
                take: 1,
            },
            grades: {
                include: {
                    module: true // To get credits
                }
            },
        }
    });

    // Fetch ranking settings or apply defaults
    const gpaWeightSetting = await prisma.systemSetting.findUnique({ where: { key: 'ranking_weight_gpa' } });
    const passRateWeightSetting = await prisma.systemSetting.findUnique({ where: { key: 'ranking_weight_pass_rate' } });

    const gpaWeight = gpaWeightSetting ? parseFloat(gpaWeightSetting.value) : 0.6;
    const passRateWeight = passRateWeightSetting ? parseFloat(passRateWeightSetting.value) : 0.4;

    // Compute rankings logic
    const rankings = await Promise.all(students.map(async (student) => {
        const studentGrades = student.grades;

        // Keep rankings aligned with dashboard GPA source.
        const { gpa } = await AcademicEngine.calculateStudentGPA(student.student_id);

        // Calculate other metrics
        const totalCreditsEarned = studentGrades
            .filter(
                (g) => (g.grade_point ?? 0) >= 2.0 || (g.marks != null && g.marks >= 50)
            )
            .reduce((sum, g) => sum + g.module.credits, 0);
        const totalCreditsAttempted = studentGrades.reduce((sum, g) => sum + g.module.credits, 0);
        const passRate = totalCreditsAttempted > 0 ? (totalCreditsEarned / totalCreditsAttempted) * 100 : 0;

        // Use normalized pass rate (out of 4.0) to mix with GPA, or just flat points
        const weightedScore = (gpa * gpaWeight) + ((passRate / 100) * 4.0 * passRateWeight);

        return {
            id: student.student_id,
            studentId: student.student_id,
            studentName: `${student.user.firstName} ${student.user.lastName}`,
            academicYear: student.current_level || 'L1',
            pathway: student.degree_path.name,
            specialization: student.specialization?.name || null,
            gpa: gpa,
            totalCredits: totalCreditsEarned,
            passRate: passRate,
            academicClass: student.academic_class || null,
            weightedOverallScore: weightedScore
        };
    }));

    return rankings;
}

// ----------------------------------------------------------------------
// MESSAGE ACTIONS
// ----------------------------------------------------------------------

export async function getStudentMessages() {
    const { getMyMessages } = await import('@/lib/actions/message-actions');
    const { messages } = await getMyMessages({ limit: 200 });
    return messages;
}

export async function sendStudentMessage(recipientId: string, subject: string, content: string) {
    const { sendDirectMessage } = await import('@/lib/actions/message-actions');
    const result = await sendDirectMessage({ recipientId, subject, content });
    const row = await prisma.message.findUniqueOrThrow({
        where: { message_id: result.message_id },
    });
    return row;
}
