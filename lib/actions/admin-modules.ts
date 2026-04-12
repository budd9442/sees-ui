'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ModuleSchema = z.object({
    code: z.string().min(2, "Code is required"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    credits: z.number().min(1, "Credits must be at least 1"),
    description: z.string().optional(),
    active: z.boolean().default(true),
    level: z.string().default("L1")
});

export async function getModules(query?: string) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    return await prisma.module.findMany({
        where: {
            OR: query ? [
                { code: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } }
            ] : undefined
        },
        orderBy: { code: 'asc' }
    });
}

export async function upsertModule(data: z.infer<typeof ModuleSchema> & { moduleId?: string }) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const validated = ModuleSchema.parse(data);

    if (data.moduleId) {
        await prisma.module.update({
            where: { module_id: data.moduleId },
            data: {
                code: validated.code,
                name: validated.name,
                credits: validated.credits,
                description: validated.description,
                active: validated.active,
                level: validated.level
            }
        });
    } else {
        // Check uniqueness of code
        const existing = await prisma.module.findUnique({
            where: { code: validated.code }
        });
        if (existing) throw new Error("Module with this code already exists");

        await prisma.module.create({
            data: {
                code: validated.code,
                name: validated.name,
                credits: validated.credits,
                description: validated.description,
                active: validated.active,
                level: validated.level
            }
        });
    }
    revalidatePath('/dashboard/admin/modules');
}

export async function toggleModuleStatus(moduleId: string) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const mod = await prisma.module.findUnique({ where: { module_id: moduleId } });
    if (!mod) throw new Error("Module not found");

    await prisma.module.update({
        where: { module_id: moduleId },
        data: { active: !mod.active }
    });
    revalidatePath('/dashboard/admin/modules');
}

// STAFF ASSIGNMENT ACTIONS

export async function getAllStaffList() {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    // Fetch all staff
    const staff = await prisma.staff.findMany({
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    });

    return staff.map(s => ({
        staffId: s.staff_id,
        name: `${s.user.firstName} ${s.user.lastName}`,
        email: s.user.email,
        staffNumber: s.staff_number
    }));
}

export async function getModuleAssignments(moduleId: string) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const assignments = await prisma.staffAssignment.findMany({
        where: { module_id: moduleId, active: true },
        include: {
            academic_year: true,
            staff: {
                include: {
                    user: true
                }
            }
        }
    });

    return assignments.map(a => ({
        assignmentId: a.assignment_id,
        staffId: a.staff_id,
        name: `${a.staff.user.firstName} ${a.staff.user.lastName}`,
        role: a.role,
        academicYear: a.academic_year?.label || 'Legacy'
    }));
}

export async function assignStaffToModule(moduleId: string, staffId: string, role: string, yearId?: string) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    // 1. Resolve target Academic Year (default to active)
    let targetYearId = yearId;
    if (!targetYearId) {
        const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
        if (!activeYear) throw new Error("No active academic year found to bind assignment.");
        targetYearId = activeYear.academic_year_id;
    }

    // 2. Check if already assigned for THIS specific year
    const existing = await prisma.staffAssignment.findFirst({
        where: {
            module_id: moduleId,
            staff_id: staffId,
            academic_year_id: targetYearId,
            active: true
        }
    });

    if (existing) {
        if (existing.role !== role) {
            await prisma.staffAssignment.update({
                where: { assignment_id: existing.assignment_id },
                data: { role }
            });
        }
        return;
    }

    await prisma.staffAssignment.create({
        data: {
            module_id: moduleId,
            staff_id: staffId,
            role: role,
            academic_year_id: targetYearId
        }
    });
    revalidatePath('/dashboard/admin/modules');
}

export async function removeStaffAssignment(assignmentId: string) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    await prisma.staffAssignment.delete({
        where: { assignment_id: assignmentId }
    });
    revalidatePath('/dashboard/admin/modules');
}
