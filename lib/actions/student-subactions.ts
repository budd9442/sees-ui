'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

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
        grade: g.marks || 0,
        letterGrade: g.letter_grade,
        points: g.grade_point,
        semester: g.semester.label || 'Unknown',
        academicYear: g.module.level || 'L1', // Fallback to module level
        isReleased: !!g.released_at
    }));

    return { studentGrades };
}

export async function getGoals() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // We already trust session.user.id from the DB
    const goals = await prisma.academicGoal.findMany({
        where: { student_id: session.user.id },
        orderBy: { created_at: 'desc' }
    });

    return goals.map(g => ({
        id: g.goal_id,
        title: g.title,
        description: g.description,
        category: g.category,
        priority: g.priority,
        targetGPA: g.target_gpa,
        targetClass: g.target_class,
        targetValue: g.target_value,
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
    category: string;
    priority: string;
    targetGPA?: number | null;
    targetClass?: string | null;
    targetValue?: string | null;
    deadline?: Date | null;
    milestones?: string[];
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const goal = await prisma.academicGoal.create({
        data: {
            student_id: session.user.id,
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            target_gpa: data.targetGPA ?? undefined,
            target_class: data.targetClass ?? undefined,
            target_value: data.targetValue ?? undefined,
            deadline: data.deadline,
            milestones: data.milestones || [],
        }
    });

    return goal;
}

export async function updateGoal(goalId: string, data: Partial<{
    title: string;
    description: string;
    category: string;
    priority: string;
    targetGPA: number | null;
    targetClass: string | null;
    targetValue: string | null;
    deadline: Date | null;
    milestones: string[];
    progress: number;
    status: string;
}>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // verify ownership
    const goal = await prisma.academicGoal.findUnique({ where: { goal_id: goalId } });
    if (!goal || goal.student_id !== session.user.id) throw new Error("Goal not found or unauthorized");

    const updated = await prisma.academicGoal.update({
        where: { goal_id: goalId },
        data: {
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            target_gpa: data.targetGPA ?? undefined,
            target_class: data.targetClass ?? undefined,
            target_value: data.targetValue ?? undefined,
            deadline: data.deadline ?? undefined,
            milestones: data.milestones ?? undefined,
            progress: data.progress ?? undefined,
            status: data.status ?? undefined,
            achieved_at: data.status === 'COMPLETED' ? new Date() : undefined
        }
    });

    return updated;
}

export async function deleteGoal(goalId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // verify ownership
    const goal = await prisma.academicGoal.findUnique({ where: { goal_id: goalId } });
    if (!goal || goal.student_id !== session.user.id) throw new Error("Goal not found or unauthorized");

    await prisma.academicGoal.delete({
        where: { goal_id: goalId }
    });

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

    const mitProgram = await prisma.degreeProgram.findUnique({ where: { code: 'MIT' } });
    const itProgram = await prisma.degreeProgram.findUnique({ where: { code: 'IT' } });

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

    const studentRecord = await prisma.student.findUnique({
        where: { student_id: session.user.id }
    });

    if (!studentRecord) throw new Error("Student profile not found");
    if (studentRecord.pathway_locked) throw new Error("Pathway is already locked");

    const targetProgram = await prisma.degreeProgram.findUnique({ where: { code: programCode } });
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

    // Perform the entire operation in a transaction to handle capacity race conditions
    return await prisma.$transaction(async (tx) => {
        // 1. Get current student record
        const student = await tx.student.findUnique({
            where: { student_id: session.user.id }
        });

        if (!student) throw new Error("Student profile not found");

        // 2. Resolve specialization code to ID and verify it belongs to the same program
        const targetSpec = await tx.specialization.findUnique({
            where: { 
                code: specCode,
                program_id: student.degree_path_id // Ensure it belongs to the student's program
            }
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
            supervisorName: internship.supervisor_name,
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
                supervisor_name: data.supervisorName,
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
                supervisor_name: data.supervisorName,
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
            cumulativeCredits: grades.reduce((sum, g) => sum + (g.marks >= 50 ? 3 : 0), 0), // Use real credit weight if available
            completedCredits: grades.filter(g => g.marks >= 50).length * 3
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

    // Fetch all active students with their associated user and pathway information
    const students = await prisma.student.findMany({
        where: { enrollment_status: 'ENROLLED' },
        include: {
            user: true,
            degree_path: true,
            specialization: true,
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
    const rankings = students.map(student => {
        const studentGrades = student.grades;

        // Ensure GPA falls back to 0
        const gpa = student.current_gpa || 0;

        // Calculate other metrics
        const totalCreditsEarned = studentGrades.filter(g => g.marks >= 50).reduce((sum, g) => sum + g.module.credits, 0);
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
    });

    return rankings;
}

// ----------------------------------------------------------------------
// MESSAGE ACTIONS
// ----------------------------------------------------------------------

export async function getStudentMessages() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { sender_id: session.user.id },
                { recipient_id: session.user.id }
            ]
        },
        include: {
            sender: {
                select: {
                    user_id: true,
                    firstName: true,
                    lastName: true,
                    staff: true
                }
            },
            recipient: {
                select: {
                    user_id: true,
                    firstName: true,
                    lastName: true,
                    staff: true
                }
            }
        },
        orderBy: {
            sent_at: 'desc'
        }
    });

    const formattedMessages = messages.map(msg => ({
        id: msg.message_id,
        senderId: msg.sender_id,
        receiverId: msg.recipient_id,
        subject: msg.subject,
        content: msg.content,
        createdAt: msg.sent_at.toISOString(),
        isRead: !!msg.read_at,
        senderRole: msg.sender.staff ? msg.sender.staff.staff_type : 'student',
        senderName: `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim(),
        receiverRole: msg.recipient.staff ? msg.recipient.staff.staff_type : 'student',
        receiverName: `${msg.recipient.firstName || ''} ${msg.recipient.lastName || ''}`.trim()
    }));

    return formattedMessages;
}

export async function sendStudentMessage(recipientId: string, subject: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await prisma.message.create({
        data: {
            sender_id: session.user.id,
            recipient_id: recipientId,
            subject: subject,
            content: content
        }
    });
}
