'use server';

import { prisma } from '@/lib/db';
import { userSchema, CreateUserSchema, UpdateUserSchema } from '@/lib/validations/user';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function getUsers({
    page = 1,
    limit = 10,
    search = '',
    role,
}: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
        where.OR = [
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Role filtering
    if (role) {
        if (role === 'student') {
            where.student = { isNot: null };
        } else if (role === 'staff') {
            where.staff = { isNot: null };
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
                    student: true,
                    staff: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        // Map users to include a 'role' property for the UI
        const mappedUsers = users.map((u) => {
            let role = 'guest';
            if (u.student) role = 'student';
            else if (u.staff) role = 'staff';
            else if (u.email.includes('admin')) role = 'admin';

            return {
                ...u,
                role,
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

export async function createUser(data: CreateUserSchema) {
    const result = userSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    const { firstName, lastName, email, role, ...otherDetails } = result.data;

    console.log("Creating User:", { firstName, lastName, email, role, degreePathId: otherDetails.degreePathId });

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

    // Set initial password to match the username
    const passwordHash = await hash(username, 10);

    try {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    username,
                    first_name: firstName,
                    last_name: finalLastName,
                    password_hash: passwordHash,
                    status: 'ACTIVE',
                },
            });

            if (role === 'student') {
                await tx.student.create({
                    data: {
                        student_id: user.user_id,
                        admission_year: finalAdmissionYear,
                        degree_path_id: otherDetails.degreePathId || '', // Should validate exists, but foreign key constraint will catch if empty/invalid
                        enrollment_status: 'ENROLLED',
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
            }
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to create user:', error);
        return { success: false, error: 'Failed to create user' };
    }
}

export async function updateUser(updatedData: UpdateUserSchema) {
    const result = userSchema.safeParse(updatedData);

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
                    first_name: firstName,
                    last_name: lastName,
                },
            });

            // 2. Update Student specific info if role is student
            // Note: Currently Student model doesn't have partial update fields exposed in UI
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user:', error);
        return { success: false, error: 'Failed to update user' };
    }
}

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

export async function deleteUser(userId: string) {
    try {
        // Soft delete implementation
        await prisma.user.update({
            where: { user_id: userId },
            data: { status: 'DELETED' }
        });
        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete user' };
    }
}
