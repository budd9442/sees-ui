'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { writeAuditLog } from '@/lib/audit/write-audit-log';
import { GUIDEBOOK_PREREQUISITE_CODES } from '@/lib/data/guidebook-prerequisites';

const ModuleSchema = z.object({
    code: z.string().min(2, "Code is required"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    credits: z.number().min(1, "Credits must be at least 1"),
    description: z.string().optional(),
    active: z.boolean().default(true),
    level: z.string().default("L1"),
    counts_toward_gpa: z.boolean().default(true),
    prerequisiteCodes: z.array(z.string()).default([]),
});

/**
 * @swagger
 * /action/admin-module/getModules:
 *   post:
 *     summary: "[Server Action] List and Search Modules"
 *     description: Returns a filtered list of academic modules, optionally filtered by search query and academic year.
 *     tags:
 *       - Admin Actions
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               academicYearId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully fetched modules
 */
export async function getModules(query?: string, academicYearId?: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    // If academicYearId is 'all', we don't filter by year
    // If not provided, we default to the currently active year
    let targetYearId = academicYearId;
    if (!targetYearId || targetYearId === 'active') {
        const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
        targetYearId = activeYear?.academic_year_id;
    }

    return await prisma.module.findMany({
        where: {
            AND: [
                academicYearId === 'all' ? {} : { academic_year_id: targetYearId || null },
                query ? {
                    OR: [
                        { code: { contains: query, mode: 'insensitive' } },
                        { name: { contains: query, mode: 'insensitive' } }
                    ]
                } : {}
            ]
        },
        orderBy: { code: 'asc' },
        include: {
            academic_year: true,
            Module_A: {
                select: {
                    module_id: true,
                    code: true,
                    name: true,
                },
            },
        }
    });
}

/**
 * @swagger
 * /action/admin-module/upsertModule:
 *   post:
 *     summary: "[Server Action] Create or Update Module"
 *     description: Creates a new academic module or updates an existing one, including prerequisites and academic year binding.
 *     tags:
 *       - Admin Actions
 */
export async function upsertModule(data: z.infer<typeof ModuleSchema> & { moduleId?: string, academicYearId?: string }) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const validated = ModuleSchema.parse(data);
    let targetYearId = data.academicYearId;

    if (!targetYearId && !data.moduleId) {
        const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
        targetYearId = activeYear?.academic_year_id;
    }

    if (data.moduleId) {
        await prisma.$transaction(async (tx) => {
            const existing = await tx.module.findUnique({
                where: { module_id: data.moduleId },
                select: { academic_year_id: true },
            });
            if (!existing) throw new Error("Module not found");

            const effectiveYearId = targetYearId === undefined ? existing.academic_year_id : targetYearId;
            const prerequisiteCandidates = await tx.module.findMany({
                where: {
                    code: { in: validated.prerequisiteCodes },
                    OR: [{ academic_year_id: effectiveYearId ?? null }, { academic_year_id: null }],
                },
                select: { module_id: true },
            });

            await tx.module.update({
                where: { module_id: data.moduleId },
                data: {
                    code: validated.code,
                    name: validated.name,
                    credits: validated.credits,
                    description: validated.description,
                    active: validated.active,
                    level: validated.level,
                    counts_toward_gpa: validated.counts_toward_gpa,
                    academic_year_id: effectiveYearId,
                    Module_A: {
                        set: [],
                        connect: prerequisiteCandidates
                            .filter((m) => m.module_id !== data.moduleId)
                            .map((m) => ({ module_id: m.module_id })),
                    },
                }
            });
        });
        
        await writeAuditLog({
            adminId: session.user.id,
            action: 'ADMIN_MODULE_UPDATE',
            entityType: 'MODULE',
            entityId: data.moduleId,
            category: 'ADMIN',
            metadata: { code: validated.code, prerequisiteCount: validated.prerequisiteCodes.length },
        });
    } else {
        // Check uniqueness of [code, academic_year_id]
        const existing = await prisma.module.findUnique({
            where: {
                code_academic_year_id: {
                    code: validated.code,
                    academic_year_id: targetYearId || null as any
                }
            }
        });
        if (existing) throw new Error("Module with this code already exists in this academic year");

        const mod = await prisma.$transaction(async (tx) => {
            const created = await tx.module.create({
                data: {
                    code: validated.code,
                    name: validated.name,
                    credits: validated.credits,
                    description: validated.description,
                    active: validated.active,
                    level: validated.level,
                    counts_toward_gpa: validated.counts_toward_gpa,
                    academic_year_id: targetYearId
                }
            });

            const prerequisiteCandidates = await tx.module.findMany({
                where: {
                    code: { in: validated.prerequisiteCodes },
                    OR: [{ academic_year_id: targetYearId ?? null }, { academic_year_id: null }],
                },
                select: { module_id: true },
            });

            await tx.module.update({
                where: { module_id: created.module_id },
                data: {
                    Module_A: {
                        set: [],
                        connect: prerequisiteCandidates
                            .filter((m) => m.module_id !== created.module_id)
                            .map((m) => ({ module_id: m.module_id })),
                    },
                },
            });
            return created;
        });

        await writeAuditLog({
            adminId: session.user.id,
            action: 'ADMIN_MODULE_CREATE',
            entityType: 'MODULE',
            entityId: mod.module_id,
            category: 'ADMIN',
            metadata: { code: validated.code, prerequisiteCount: validated.prerequisiteCodes.length },
        });
    }
    revalidatePath('/dashboard/admin/modules');
}

/**
 * @swagger
 * /action/admin-module/syncGuideBookPrerequisites:
 *   post:
 *     summary: "[Server Action] Sync Prereqs from Guidebook"
 *     description: Automatically populates module prerequisite links based on a predefined guidebook mapping.
 *     tags:
 *       - Admin Actions
 */
export async function syncGuideBookPrerequisites() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const modules = await prisma.module.findMany({
        select: { module_id: true, code: true, academic_year_id: true },
    });
    const modulesByYearCode = new Map<string, { module_id: string; code: string; academic_year_id: string | null }[]>();
    for (const mod of modules) {
        const key = `${mod.academic_year_id ?? 'null'}::${mod.code}`;
        const arr = modulesByYearCode.get(key) || [];
        arr.push(mod);
        modulesByYearCode.set(key, arr);
    }

    let updated = 0;
    for (const mod of modules) {
        const prereqCodes = GUIDEBOOK_PREREQUISITE_CODES[mod.code] || [];
        const connect = prereqCodes
            .flatMap((code) => {
                const sameYear = modulesByYearCode.get(`${mod.academic_year_id ?? 'null'}::${code}`) || [];
                const legacy = modulesByYearCode.get(`null::${code}`) || [];
                return [...sameYear, ...legacy];
            })
            .filter((candidate) => candidate.module_id !== mod.module_id)
            .map((candidate) => ({ module_id: candidate.module_id }));

        await prisma.module.update({
            where: { module_id: mod.module_id },
            data: {
                Module_A: {
                    set: [],
                    connect,
                },
            },
        });
        updated += 1;
    }

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_MODULE_PREREQ_SYNC_GUIDEBOOK',
        entityType: 'MODULE',
        entityId: 'bulk',
        category: 'ADMIN',
        metadata: { updatedModules: updated },
    });

    revalidatePath('/dashboard/admin/modules');
    // Server Actions used directly as a <form action>, so they must return void.
    return;
}

/**
 * @swagger
 * /action/admin-module/toggleModuleStatus:
 *   post:
 *     summary: "[Server Action] Toggle Module Visibility"
 *     description: Activates or deactivates a module, making it hidden or visible to students during registration.
 *     tags:
 *       - Admin Actions
 */
export async function toggleModuleStatus(moduleId: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const mod = await prisma.module.findUnique({ where: { module_id: moduleId } });
    if (!mod) throw new Error("Module not found");

    await prisma.module.update({
        where: { module_id: moduleId },
        data: { active: !mod.active }
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_MODULE_TOGGLE_ACTIVE',
        entityType: 'MODULE',
        entityId: moduleId,
        category: 'ADMIN',
        metadata: { active: !mod.active },
    });
    revalidatePath('/dashboard/admin/modules');
}

// STAFF ASSIGNMENT ACTIONS

/**
 * @swagger
 * /action/admin-module/getAllStaffList:
 *   post:
 *     summary: "[Server Action] List All Staff"
 *     description: Returns a list of all staff members in the system for module assignment purposes.
 *     tags:
 *       - Admin Actions
 */
export async function getAllStaffList() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

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

/**
 * @swagger
 * /action/admin-module/getModuleAssignments:
 *   post:
 *     summary: "[Server Action] List Staff Assigned to Module"
 *     description: Returns the staff members currently assigned to teach or manage a specific module.
 *     tags:
 *       - Admin Actions
 */
export async function getModuleAssignments(moduleId: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

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

/**
 * @swagger
 * /action/admin-module/assignStaffToModule:
 *   post:
 *     summary: "[Server Action] Assign Staff to Module"
 *     description: Links a staff member to a module with a specific role (e.g., Lecturer, Coordinator) for an academic year.
 *     tags:
 *       - Admin Actions
 */
export async function assignStaffToModule(moduleId: string, staffId: string, role: string, yearId?: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

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
            await writeAuditLog({
                adminId: session.user.id,
                action: 'ADMIN_STAFF_ASSIGNMENT_UPDATE_ROLE',
                entityType: 'STAFF_ASSIGNMENT',
                entityId: existing.assignment_id,
                category: 'ADMIN',
                metadata: { module_id: moduleId, staff_id: staffId, role },
            });
        }
        return;
    }

    const assignment = await prisma.staffAssignment.create({
        data: {
            module_id: moduleId,
            staff_id: staffId,
            role: role,
            academic_year_id: targetYearId
        }
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_STAFF_ASSIGNMENT_CREATE',
        entityType: 'STAFF_ASSIGNMENT',
        entityId: assignment.assignment_id,
        category: 'ADMIN',
        metadata: { module_id: moduleId, staff_id: staffId, role },
    });
    revalidatePath('/dashboard/admin/modules');
}

/**
 * @swagger
 * /action/admin-module/removeStaffAssignment:
 *   post:
 *     summary: "[Server Action] Remove Staff Assignment"
 *     description: Permanently removes a staff member's teaching assignment from a module.
 *     tags:
 *       - Admin Actions
 */
export async function removeStaffAssignment(assignmentId: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    await prisma.staffAssignment.delete({
        where: { assignment_id: assignmentId }
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_STAFF_ASSIGNMENT_DELETE',
        entityType: 'STAFF_ASSIGNMENT',
        entityId: assignmentId,
        category: 'ADMIN',
    });
    revalidatePath('/dashboard/admin/modules');
}
