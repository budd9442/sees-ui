'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { userSchema, CreateUserSchema, updateUserSchema, UpdateUserSchema, changePasswordSchema, ChangePasswordSchema } from '@/lib/validations/user';
import bcrypt, { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email/brevo';
import { getInvitationEmail } from '@/lib/email/templates';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';

/**
 * @swagger
 * /action/user/getUsers:
 *   post:
 *     summary: "[Server Action] List and Filter Users"
 *     description: Fetches a paginated list of users with optional filtering by role, level, and search query.
 *     tags:
 *       - User Actions
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: number
 *               limit:
 *                 type: number
 *               search:
 *                 type: string
 *               role:
 *                 type: string
 *               level:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully fetched users
 */
export async function getUsers({
    page = 1,
    limit = 10,
    search = '',
    role,
    level, // L1, L2, L3, L4, GRADUATE
}: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    level?: string;
}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Role filtering
    if (role) {
        if (role === 'student') {
            if (level) {
                if (level === 'GRADUATE') {
                    where.student = { enrollment_status: 'GRADUATED' };
                } else {
                    where.student = {
                        current_level: level,
                        enrollment_status: 'ENROLLED'
                    };
                }
            } else {
                where.student = { isNot: null };
            }
        } else if (role === 'staff') {
            where.staff = { isNot: null };
        } else if (role === 'admin') {
            // Admin doesn't have a separate relation table usually, or check email domain/attributes?
            // Based on previous logic:
            where.email = { contains: 'admin' }; // Simple check from existing logic
        }
    }

    try {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    student: {
                        include: {
                            degree_path: true
                        }
                    },
                    staff: {
                        include: {
                            hod: true,
                            advisor_profile: true,
                        }
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        // Map users to include flattened properties for UI
        const mappedUsers = users.map((u) => {
            let role = 'guest';
            let details: any = {};

            if (u.student) {
                role = 'student';
                details = {
                    gpa: u.student.current_gpa,
                    level: u.student.current_level,
                    degree: u.student.degree_path?.code,
                    degreeId: u.student.degree_path?.program_id,
                    admissionYear: u.student.admission_year,
                    enrollmentStatus: u.student.enrollment_status
                };
            }
            else if (u.staff) {
                role = 'staff';
                details = {
                    staffNumber: u.staff.staff_number,
                    department: u.staff.department,
                    type: u.staff.staff_type,
                    isHOD: !!u.staff.hod,
                    isAdvisor: !!u.staff.advisor_profile,
                    advisorAvailableForContact: u.staff.advisor_profile?.is_available_for_contact ?? true,
                    advisorSpecialties: Array.isArray(u.staff.advisor_profile?.specialty_areas)
                        ? (u.staff.advisor_profile?.specialty_areas as string[]).join(', ')
                        : '',
                    advisorBio: u.staff.advisor_profile?.bio ?? '',
                };
            }
            else if (u.email.includes('admin')) role = 'admin';

            return {
                ...u,
                role,
                ...details
            };
        });

        return {
            success: true,
            data: mappedUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return { success: false, error: 'Failed to fetch users' };
    }
}

/**
 * @swagger
 * /action/user/createUser:
 *   post:
 *     summary: "[Server Action] Create New User"
 *     description: Registers a new student or staff member, calculates academic level for students, and sends an invitation email with a registration token.
 *     tags:
 *       - Admin Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, staff]
 *               degreePathId:
 *                 type: string
 *               staffNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created user
 */
export async function createUser(data: CreateUserSchema) {
    const result = userSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    const session = await auth();
    const actorUserId = session?.user?.id ?? null;

    const { firstName, lastName, email, role, ...otherDetails } = result.data;

    console.log("Creating User:", { firstName, lastName, email, role, degreePathId: otherDetails.degreePathId });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
    }

    let username = `${email.split('@')[0]}_${Math.floor(1000 + Math.random() * 9000)}`;
    let finalLastName = lastName;
    let finalAdmissionYear = Number(otherDetails.admissionYear) || new Date().getFullYear();

    // Student Email Parsing Logic
    // Format: lastname-deptYearNo@domain (e.g., bandara-im22053@...)
    if (role === 'student') {
        const emailPrefix = email.split('@')[0];
        const parts = emailPrefix.split('-');

        if (parts.length >= 2) {
            // Assume last part is the ID part (e.g. im22053) and previous is name
            // simple check: last part contains numbers
            const idPart = parts[parts.length - 1];
            if (/\d+/.test(idPart)) {
                // Try to extract year from ID part (e.g. im22053 -> 22)
                const yearMatch = idPart.match(/\d{2}/); // Matches first 2 digits found
                if (yearMatch) {
                    const shortYear = parseInt(yearMatch[0], 10);
                    // Simple century logic: 90-99 -> 1990-1999, 00-89 -> 2000-2089
                    // Or just assume 2000s for current students
                    finalAdmissionYear = 2000 + shortYear;
                }

                // Override username to be exact email prefix
                username = emailPrefix;

                // Override Last Name from first part (capitalize first letter)
                // e.g. bandara -> Bandara
                const namePart = parts[0];
                finalLastName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            }
        }
    }

    // Generate registration token instead of temp password
    const token = randomBytes(32).toString('hex');
    const tokenExpiry = addDays(new Date(), 7); // 7 days expiry

    // Set a placeholder password hash that cannot be used to login
    // We use a specific prefix to identify these easily if needed, but standard bcrypt check will fail anyway
    const passwordHash = await hash(randomBytes(16).toString('hex'), 10);

    try {
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    username,
                    firstName: firstName,
                    lastName: finalLastName,
                    password_hash: passwordHash,
                    status: 'ACTIVE',
                    registrationTokens: {
                        create: {
                            token,
                            expires_at: tokenExpiry
                        }
                    }
                },
            });

            if (role === 'student') {
                // Calculate Level
                // Calculate Level or use provided
                let calculatedLevel = 'Level 1';

                if (otherDetails.currentLevel) {
                    calculatedLevel = otherDetails.currentLevel;
                } else {
                    const currentYear = new Date().getFullYear();
                    const diff = currentYear - finalAdmissionYear + 1;
                    if (diff >= 4) calculatedLevel = 'Level 4';
                    else if (diff === 3) calculatedLevel = 'Level 3';
                    else if (diff === 2) calculatedLevel = 'Level 2';
                }

                await tx.student.create({
                    data: {
                        student_id: user.user_id,
                        admission_year: finalAdmissionYear,
                        degree_path_id: otherDetails.degreePathId || '',
                        enrollment_status: 'ENROLLED',
                        current_level: calculatedLevel,
                    },
                });
            } else if (role === 'staff') {
                await tx.staff.create({
                    data: {
                        staff_id: user.user_id,
                        staff_number: otherDetails.staffNumber || `STF${Math.floor(Math.random() * 10000)}`,
                        staff_type: otherDetails.staffType || 'ACADEMIC',
                        department: otherDetails.department || 'General',
                    },
                });
                if (otherDetails.isAdvisor) {
                    const specialties =
                        typeof otherDetails.advisorSpecialties === 'string'
                            ? otherDetails.advisorSpecialties
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                            : [];
                    await tx.advisor.create({
                        data: {
                            advisor_id: user.user_id,
                            is_available_for_contact: otherDetails.advisorAvailableForContact !== false,
                            specialty_areas: specialties,
                            bio:
                                typeof otherDetails.advisorBio === 'string' && otherDetails.advisorBio.trim()
                                    ? otherDetails.advisorBio.trim()
                                    : null,
                        },
                    });
                }
            }
            return user;
        });

        // Send invitation email
        try {
            const invitationLink = `${process.env.NEXTAUTH_URL}/register?token=${token}`;
            const emailTemplate = getInvitationEmail(firstName, username, invitationLink);
            await sendEmail(
                {
                    to: email,
                    toName: firstName,
                    subject: emailTemplate.subject,
                    htmlContent: emailTemplate.htmlContent,
                },
                {
                    actorUserId,
                    action: 'EMAIL_USER_INVITATION',
                    entityType: 'EMAIL',
                    entityId: newUser.user_id,
                    metadata: { source: 'admin_createUser', role },
                }
            );
            console.log(`Invitation email sent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send invitation email:', emailError);
            // We don't fail the whole user creation if just email fails
        }

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to create user:', error);
        return { success: false, error: 'Failed to create user' };
    }
}

/**
 * @swagger
 * /action/user/updateUser:
 *   post:
 *     summary: "[Server Action] Update User Details"
 *     description: Updates a user's basic profile and role-specific details (student levels, staff departments) from the administrative dashboard.
 *     tags:
 *       - Admin Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated user
 */
export async function updateUser(updatedData: UpdateUserSchema) {
    const result = updateUserSchema.safeParse(updatedData);

    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    const { id } = updatedData as any;

    try {
        const { firstName, lastName, role, ...otherDetails } = updatedData as any;

        await prisma.$transaction(async (tx) => {
            // 1. Update basic User info
            await tx.user.update({
                where: { user_id: id },
                data: {
                    firstName: firstName,
                    lastName: lastName,
                },
            });

            // 2. Update Student specific info if role is student
            if (role === 'student' && otherDetails) {
                await tx.student.update({
                    where: { student_id: id },
                    data: {
                        current_level: otherDetails.currentLevel,
                        degree_path_id: otherDetails.degreePathId,
                        admission_year: otherDetails.admissionYear
                    }
                });
            }

            // 3. Update Staff specific info
            if (role === 'staff' && otherDetails) {
                await tx.staff.update({
                    where: { staff_id: id },
                    data: {
                        staff_number: otherDetails.staffNumber,
                        department: otherDetails.department,
                        staff_type: otherDetails.staffType
                    }
                });
                if (otherDetails.isAdvisor) {
                    const specialties =
                        typeof otherDetails.advisorSpecialties === 'string'
                            ? otherDetails.advisorSpecialties
                                  .split(',')
                                  .map((s: string) => s.trim())
                                  .filter(Boolean)
                            : [];
                    await tx.advisor.upsert({
                        where: { advisor_id: id },
                        update: {
                            is_available_for_contact: otherDetails.advisorAvailableForContact !== false,
                            specialty_areas: specialties,
                            bio:
                                typeof otherDetails.advisorBio === 'string' && otherDetails.advisorBio.trim()
                                    ? otherDetails.advisorBio.trim()
                                    : null,
                        },
                        create: {
                            advisor_id: id,
                            is_available_for_contact: otherDetails.advisorAvailableForContact !== false,
                            specialty_areas: specialties,
                            bio:
                                typeof otherDetails.advisorBio === 'string' && otherDetails.advisorBio.trim()
                                    ? otherDetails.advisorBio.trim()
                                    : null,
                        },
                    });
                } else {
                    await tx.advisor.deleteMany({ where: { advisor_id: id } });
                }
            }
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user:', error);
        return { success: false, error: 'Failed to update user' };
    }
}

/**
 * @swagger
 * /action/user/toggleUserStatus:
 *   post:
 *     summary: "[Server Action] Toggle User Activation"
 *     description: Switches a user's status between ACTIVE and INACTIVE to enable or disable system access.
 *     tags:
 *       - User Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               currentStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully toggled status
 */
export async function toggleUserStatus(userId: string, currentStatus: string) {
    try {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await prisma.user.update({
            where: { user_id: userId },
            data: { status: newStatus }
        });
        revalidatePath('/dashboard/admin/users');
        return { success: true, newStatus };
    } catch (error) {
        console.error('Failed to toggle status:', error);
        return { success: false, error: 'Failed to toggle status' };
    }
}

/**
 * @swagger
 * /action/user/deleteUser:
 *   post:
 *     summary: "[Server Action] Hard Delete User"
 *     description: Permanently removes a user and all associated academic/staff records from the system using a cascaded transaction.
 *     tags:
 *       - User Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 */
export async function deleteUser(userId: string) {
    try {
        // Deep cascade delete using a transaction to ensure data integrity
        await prisma.$transaction(async (tx) => {
            // 1. Identify user and relations
            const user = await tx.user.findUnique({
                where: { user_id: userId },
                include: { student: true, staff: true }
            });

            if (!user) return;

            // 2. Clean up common records (System-level)
            await tx.message.deleteMany({ where: { OR: [{ sender_id: userId }, { recipient_id: userId }] } });
            await tx.notification.deleteMany({ where: { user_id: userId } });
            await tx.registrationToken.deleteMany({ where: { user_id: userId } });
            await tx.passwordResetToken.deleteMany({ where: { user_id: userId } });

            // 3. Clean up role-specific records (Academic/Staff-level)
            if (user.student) {
                // Student-specific downstream relations
                await tx.grade.deleteMany({ where: { student_id: userId } });
                await tx.moduleRegistration.deleteMany({ where: { student_id: userId } });
                await tx.gPAHistory.deleteMany({ where: { student_id: userId } });
                await tx.academicGoal.deleteMany({ where: { student_id: userId } });
                await tx.ranking.deleteMany({ where: { student_id: userId } });
                await tx.anonymousReport.deleteMany({ where: { student_id: userId } });
            }

            if (user.staff) {
                // Staff-specific downstream relations
                await tx.staffAssignment.deleteMany({ where: { staff_id: userId } });
                await tx.lectureSchedule.deleteMany({ where: { staff_id: userId } });
                
                // HOD/Advisor roles (should cascade from Staff schema but ensuring safety)
                await tx.hOD.deleteMany({ where: { hod_id: userId } });
                await tx.advisor.deleteMany({ where: { advisor_id: userId } });
            }

            // 4. Finally delete the user (Downstream Staff/Student should also cascade from here as per schema)
            await tx.user.delete({
                where: { user_id: userId },
            });
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error(`Failed to delete user ${userId}:`, error);
        return { success: false, error: 'Database constraint or system error occurred during deletion.' };
    }
}

/**
 * @swagger
 * /action/user/validateRegistrationToken:
 *   post:
 *     summary: "[Server Action] Validate Invite Token"
 *     description: Checks if a registration token is valid, unused, and within its expiration period.
 *     tags:
 *       - Auth Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token validation result
 */
export async function validateRegistrationToken(token: string) {
    try {
        const registrationToken = await prisma.registrationToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!registrationToken) {
            return { success: false, error: 'Invalid token' };
        }

        if (registrationToken.used) {
            return { success: false, error: 'Token already used' };
        }

        if (new Date() > registrationToken.expires_at) {
            return { success: false, error: 'Token expired' };
        }

        return {
            success: true,
            data: {
                username: registrationToken.user.username,
                email: registrationToken.user.email,
                firstName: registrationToken.user.firstName,
                userId: registrationToken.user.user_id
            }
        };

    } catch (error) {
        console.error('Failed to validate token:', error);
        return { success: false, error: 'System error' };
    }
}

export async function completeRegistration(token: string, password: string) {
    try {
        // validate again
        const validation = await validateRegistrationToken(token);
        if (!validation.success) {
            return validation;
        }

        const userId = validation.data?.userId;
        if (!userId) return { success: false, error: 'User not found' };

        // Validate password strength server-side
        const passwordResult = setPasswordSchema.safeParse({ password, confirmPassword: password });
        if (!passwordResult.success) {
            return { success: false, error: 'Password does not meet security requirements' };
        }

        const hashedPassword = await hash(password, 10);

        await prisma.$transaction(async (tx) => {
            // Update user password and status (if we were using PENDING)
            await tx.user.update({
                where: { user_id: userId },
                data: {
                    password_hash: hashedPassword,
                    status: 'ACTIVE' // confirm active
                }
            });

            // Mark token as used
            await tx.registrationToken.update({
                where: { token },
                data: {
                    used: true,
                    used_at: new Date()
                }
            });
        });


        return { success: true };

    } catch (error) {
        console.error('Registration completion failed:', error);
        return { success: false, error: 'Failed to set password' };
    }
}

/**
 * @swagger
 * /action/user/changePassword:
 *   post:
 *     summary: "[Server Action] Change Password"
 *     description: Updates the authenticated user's password after verifying their current password.
 *     tags:
 *       - Auth Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 */
export async function changePassword(data: ChangePasswordSchema & { userId: string }) {
    const result = changePasswordSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    const { currentPassword, newPassword } = result.data;
    const { userId } = data;

    try {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const isValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isValid) {
            return { success: false, error: 'Current password is incorrect' };
        }

        const hashedPassword = await hash(newPassword, 10);

        await prisma.user.update({
            where: { user_id: userId },
            data: { password_hash: hashedPassword },
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to change password:', error);
        return { success: false, error: 'Failed to change password' };
    }
}

/**
 * @swagger
 * /action/user/updateProfile:
 *   post:
 *     summary: "[Server Action] Update Personal Profile"
 *     description: Updates the currently authenticated user's profile information, including contact details and social links.
 *     tags:
 *       - User Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               github:
 *                 type: string
 *               address:
 *                 type: string
 *               bio:
 *                 type: string
 *               emergency_contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated profile
 */
export async function updateProfile(userId: string, data: { 
    firstName: string; 
    lastName: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    address?: string;
    bio?: string;
    emergency_contact?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: No active session found" };
        }

        const targetId = session.user.id;

        await prisma.user.update({
            where: { user_id: targetId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone || null,
                linkedin: data.linkedin || null,
                github: data.github || null,
                address: data.address || null,
                bio: data.bio || null,
                emergency_contact: data.emergency_contact || null,
            },
        });

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to update profile:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update user profile' };
    }
}
/**
 * @swagger
 * /action/user/toggleHODStatus:
 *   post:
 *     summary: "[Server Action] Toggle HOD Role"
 *     description: Promotes or demotes a staff member to Head of Department (HOD) status for their assigned department.
 *     tags:
 *       - User Actions
 */
export async function toggleHODStatus(staffId: string) {
    try {
        const staff = await prisma.staff.findUnique({
            where: { staff_id: staffId },
            include: { hod: true }
        });

        if (!staff) throw new Error("Staff record not found");

        if (staff.hod) {
            // Remove HOD status
            await prisma.hOD.delete({
                where: { hod_id: staffId }
            });
        } else {
            // Set as HOD
            // 1. Check if there is already an HOD for this department
            const existingHOD = await prisma.hOD.findFirst({
                where: { department: staff.department }
            });

            await prisma.$transaction(async (tx) => {
                if (existingHOD) {
                    // Automatically remove previous HOD
                    await tx.hOD.delete({
                        where: { hod_id: existingHOD.hod_id }
                    });
                }

                // Create new HOD record
                await tx.hOD.create({
                    data: {
                        hod_id: staffId,
                        department: staff.department
                    }
                });
            });
        }

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle HOD status:', error);
        return { success: false, error: 'Failed to update HOD status' };
    }
}
export async function toggleAdvisorStatus(staffId: string) {
    try {
        const staff = await prisma.staff.findUnique({
            where: { staff_id: staffId },
            include: { advisor_profile: true }
        });

        if (!staff) throw new Error("Staff record not found");

        if (staff.advisor_profile) {
            // Remove Advisor status
            await prisma.advisor.delete({
                where: { advisor_id: staffId }
            });
        } else {
            // Create Advisor record
            await prisma.advisor.create({
                data: {
                    advisor_id: staffId,
                    is_available_for_contact: true,
                }
            });
        }

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle Advisor status:', error);
        return { success: false, error: 'Failed to update Advisor status' };
    }
}
export async function getLoginHistory() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const logs = await prisma.auditLog.findMany({
            where: {
                admin_id: session.user.id,
                action: "AUTH_LOGIN_SUCCESS"
            },
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        return { success: true, data: logs };
    } catch (error) {
        console.error('Failed to fetch login history:', error);
        return { success: false, error: 'Failed to fetch login history' };
    }
}
