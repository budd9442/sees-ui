'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

// Zod Schemas
const ProgramSchema = z.object({
    code: z.string().min(2),
    name: z.string().min(3),
    description: z.string().optional(),
    academicYearId: z.string().optional(),
});

const SpecializationSchema = z.object({
    code: z.string().min(2),
    name: z.string().min(3),
    description: z.string().optional(),
    programId: z.string(),
});

// GET Actions
/**
 * @swagger
 * /action/admin-program/getAllPrograms:
 *   post:
 *     summary: "[Server Action] List All Degree Programs"
 *     description: Returns a filtered list of degree programs, including specializations and academic year information.
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
 *               yearId:
 *                 type: string
 *                 default: active
 *     responses:
 *       200:
 *         description: Successfully fetched programs
 */
export async function getAllPrograms(query: string = '', yearId: string = 'active') {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    let academicYearId = yearId;
    if (yearId === 'active') {
        const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
        academicYearId = activeYear?.academic_year_id || '';
    }

    const where: any = {};
    if (academicYearId && yearId !== 'all') {
        where.academic_year_id = academicYearId;
    }
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } }
        ];
    }

    return await prisma.degreeProgram.findMany({
        where,
        include: {
            specializations: true,
            academic_year: true
        },
        orderBy: { code: 'asc' }
    });
}

/**
 * @swagger
 * /action/admin-program/getProgramById:
 *   post:
 *     summary: "[Server Action] Get Program Details"
 *     description: Returns a complete program definition, including specializations, curriculum structure, and intakes.
 *     tags:
 *       - Admin Actions
 */
export async function getProgramById(programId: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    return await prisma.degreeProgram.findUnique({
        where: { program_id: programId },
        include: {
            specializations: true,
            structure: {
                include: { module: true }
            },
            intakes: {
                include: { academic_year: true }
            }
        }
    });
}

// CREATE / UPDATE Programs
/**
 * @swagger
 * /action/admin-program/createProgram:
 *   post:
 *     summary: "[Server Action] Create Degree Program"
 *     description: Registers a new degree program in the system for a specific academic year.
 *     tags:
 *       - Admin Actions
 */
export async function createProgram(data: z.infer<typeof ProgramSchema>) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const validated = ProgramSchema.parse(data);

    let academicYearId = validated.academicYearId;
    if (!academicYearId) {
        const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
        academicYearId = activeYear?.academic_year_id;
    }

    const created = await prisma.degreeProgram.create({
        data: {
            code: validated.code,
            name: validated.name,
            description: validated.description || '',
            academic_year_id: academicYearId
        }
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_PROGRAM_CREATE',
        entityType: 'DEGREE_PROGRAM',
        entityId: created.program_id,
        category: 'ADMIN',
        metadata: { code: validated.code },
    });
    revalidatePath('/dashboard/admin/programs');
    revalidatePath('/dashboard/admin/config/programs');
    return { success: true as const, programId: created.program_id };
}

export type ProgramConfigUpdate = Partial<{
    code: string;
    name: string;
    description: string;
    active: boolean;
    academicYearId: string;
}>;

/**
 * @swagger
 * /action/admin-program/updateProgram:
 *   post:
 *     summary: "[Server Action] Update Degree Program"
 *     description: Modifies program metadata or academic year binding.
 *     tags:
 *       - Admin Actions
 */
export async function updateProgram(programId: string, data: ProgramConfigUpdate) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.code !== undefined) patch.code = data.code;
    if (data.description !== undefined) patch.description = data.description;
    if (data.active !== undefined) patch.active = data.active;
    if (data.academicYearId !== undefined) patch.academic_year_id = data.academicYearId;

    await prisma.degreeProgram.update({
        where: { program_id: programId },
        data: patch as { name?: string; code?: string; description?: string; active?: boolean; academic_year_id?: string },
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_PROGRAM_UPDATE',
        entityType: 'DEGREE_PROGRAM',
        entityId: programId,
        category: 'ADMIN',
    });
    revalidatePath('/dashboard/admin/programs');
    revalidatePath('/dashboard/admin/config/programs');
}

/** Soft-disable a program (preferred over delete when enrollments may exist). */
/**
 * @swagger
 * /action/admin-program/deactivateProgram:
 *   post:
 *     summary: "[Server Action] Deactivate Program"
 *     description: Soft-deletes a program by setting its active status to false.
 *     tags:
 *       - Admin Actions
 */
export async function deactivateProgram(programId: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error('Unauthorized');
    await prisma.degreeProgram.update({
        where: { program_id: programId },
        data: { active: false },
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_PROGRAM_DEACTIVATE',
        entityType: 'DEGREE_PROGRAM',
        entityId: programId,
        category: 'ADMIN',
    });
    revalidatePath('/dashboard/admin/programs');
    revalidatePath('/dashboard/admin/config/programs');
}

function mapDegreeProgramForConfigClient(p: {
    program_id: string;
    name: string;
    code: string;
    description: string | null;
    active: boolean;
    specializations: { code: string; name: string }[];
}) {
    const specializations: Record<string, string[]> = {};
    for (const s of p.specializations) {
        if (!specializations[s.code]) specializations[s.code] = [];
        specializations[s.code].push(s.name);
    }
    return {
        id: p.program_id,
        name: p.name,
        code: p.code,
        description: p.description || '',
        totalCredits: 132,
        duration: 4,
        pathways: [] as string[],
        specializations,
        capacityLimits: {} as Record<string, number>,
        moduleMappings: [] as string[],
        status: p.active ? 'active' : 'inactive',
    };
}

/**
 * @swagger
 * /action/admin-program/getProgramsForAdminConfig:
 *   post:
 *     summary: "[Server Action] List All Programs (Config)"
 *     description: Returns a flat list of programs mapped for the administrative configuration interface.
 *     tags:
 *       - Admin Actions
 */
export async function getProgramsForAdminConfig() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error('Unauthorized');
    const rows = await prisma.degreeProgram.findMany({
        include: { specializations: true },
        orderBy: { code: 'asc' },
    });
    return { programs: rows.map(mapDegreeProgramForConfigClient) };
}

// CREATE / UPDATE Specializations
/**
 * @swagger
 * /action/admin-program/createSpecialization:
 *   post:
 *     summary: "[Server Action] Create Specialization"
 *     description: Adds a new specialized path under an existing degree program.
 *     tags:
 *       - Admin Actions
 */
export async function createSpecialization(data: z.infer<typeof SpecializationSchema> & { academicYearId?: string }) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const validated = SpecializationSchema.parse(data);

    let academicYearId = data.academicYearId;
    if (!academicYearId) {
        // Try to get from program if not provided
        const program = await prisma.degreeProgram.findUnique({
            where: { program_id: validated.programId },
            select: { academic_year_id: true }
        });
        academicYearId = program?.academic_year_id || undefined;
    }

    const spec = await prisma.specialization.create({
        data: {
            code: validated.code,
            name: validated.name,
            description: validated.description || '',
            program_id: validated.programId,
            ...(academicYearId ? { academic_year_id: academicYearId } : {}),
        },
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_SPECIALIZATION_CREATE',
        entityType: 'SPECIALIZATION',
        entityId: spec.specialization_id,
        category: 'ADMIN',
        metadata: { code: validated.code, programId: validated.programId },
    });
    revalidatePath(`/dashboard/admin/programs`);
}

// STRUCTURE MANAGEMENT
/**
 * @swagger
 * /action/admin-program/addModuleToStructure:
 *   post:
 *     summary: "[Server Action] Add Module to Curriculum"
 *     description: Links a module to a program's academic level and semester, designating it as Core or Elective.
 *     tags:
 *       - Admin Actions
 */
export async function addModuleToStructure(data: {
    programId: string,
    moduleId: string,
    specializationId?: string | null,
    academicLevel: string,
    semesterNumber: number,
    moduleType: 'CORE' | 'ELECTIVE',
    academicYearId?: string
}) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    let academicYearId = data.academicYearId;
    if (!academicYearId) {
        const program = await prisma.degreeProgram.findUnique({
            where: { program_id: data.programId },
            select: { academic_year_id: true }
        });
        academicYearId = program?.academic_year_id || undefined;
    }

    const row = await prisma.programStructure.create({
        data: {
            program_id: data.programId,
            module_id: data.moduleId,
            specialization_id: data.specializationId ?? null,
            academic_level: data.academicLevel,
            semester_number: data.semesterNumber,
            module_type: data.moduleType,
            ...(academicYearId ? { academic_year_id: academicYearId } : {}),
        },
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_PROGRAM_STRUCTURE_ADD',
        entityType: 'PROGRAM_STRUCTURE',
        entityId: row.structure_id,
        category: 'ADMIN',
        metadata: { program_id: data.programId, module_id: data.moduleId },
    });
    revalidatePath(`/dashboard/admin/programs`);
}

/**
 * @swagger
 * /action/admin-program/removeModuleFromStructure:
 *   post:
 *     summary: "[Server Action] Remove Module from Curriculum"
 *     description: Unlinks a module from a program's academic structure.
 *     tags:
 *       - Admin Actions
 */
export async function removeModuleFromStructure(structureId: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    await prisma.programStructure.delete({
        where: { structure_id: structureId }
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_PROGRAM_STRUCTURE_REMOVE',
        entityType: 'PROGRAM_STRUCTURE',
        entityId: structureId,
        category: 'ADMIN',
    });
    revalidatePath(`/dashboard/admin/programs`);
}

/**
 * @swagger
 * /action/admin-program/getAllModulesSimple:
 *   post:
 *     summary: "[Server Action] List Modules (Basic)"
 *     description: Returns a simplified list of active modules for selection in curriculum management.
 *     tags:
 *       - Admin Actions
 */
export async function getAllModulesSimple() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    return await prisma.module.findMany({
        where: { active: true },
        select: {
            module_id: true,
            code: true,
            name: true,
            credits: true
        },
        orderBy: { code: 'asc' }
    });
}

// INTAKE MANAGEMENT

/**
 * @swagger
 * /action/admin-program/getAllAcademicYears:
 *   post:
 *     summary: "[Server Action] List All Academic Years"
 *     description: Returns all academic cycles for intake configuration.
 *     tags:
 *       - Admin Actions
 */
export async function getAllAcademicYears() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");
    return await prisma.academicYear.findMany({ orderBy: { start_date: 'desc' } });
}

/**
 * @swagger
 * /action/admin-program/upsertProgramIntake:
 *   post:
 *     summary: "[Server Action] Save Program Intake"
 *     description: Configures student capacity limits and status for a program's intake in a specific year.
 *     tags:
 *       - Admin Actions
 */
export async function upsertProgramIntake(data: {
    programId: string,
    academicYearId: string,
    minStudents: number,
    maxStudents: number,
    status: 'OPEN' | 'CLOSED' | 'UPCOMING'
}) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    // Check if exists
    const existing = await prisma.programIntake.findFirst({
        where: {
            program_id: data.programId,
            academic_year_id: data.academicYearId
        }
    });

    if (existing) {
        await prisma.programIntake.update({
            where: { intake_id: existing.intake_id },
            data: {
                min_students: data.minStudents,
                max_students: data.maxStudents,
                status: data.status
            }
        });
        await writeAuditLog({
            adminId: session.user.id,
            action: 'ADMIN_PROGRAM_INTAKE_UPSERT',
            entityType: 'PROGRAM_INTAKE',
            entityId: existing.intake_id,
            category: 'ADMIN',
            metadata: { program_id: data.programId, status: data.status },
        });
    } else {
        const intake = await prisma.programIntake.create({
            data: {
                degree_program: { connect: { program_id: data.programId } },
                academic_year: { connect: { academic_year_id: data.academicYearId } },
                min_students: data.minStudents,
                max_students: data.maxStudents,
                status: data.status
            }
        });
        await writeAuditLog({
            adminId: session.user.id,
            action: 'ADMIN_PROGRAM_INTAKE_UPSERT',
            entityType: 'PROGRAM_INTAKE',
            entityId: intake.intake_id,
            category: 'ADMIN',
            metadata: { program_id: data.programId, status: data.status },
        });
    }
    revalidatePath(`/dashboard/admin/programs`);
}
