'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
export async function getAllPrograms(query: string = '', yearId: string = 'active') {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

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

export async function getProgramById(programId: string) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

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
export async function createProgram(data: z.infer<typeof ProgramSchema>) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    const validated = ProgramSchema.parse(data);

    let academicYearId = validated.academicYearId;
    if (!academicYearId) {
        const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
        academicYearId = activeYear?.academic_year_id;
    }

    await prisma.degreeProgram.create({
        data: {
            code: validated.code,
            name: validated.name,
            description: validated.description || '',
            academic_year_id: academicYearId
        }
    });
    revalidatePath('/dashboard/admin/programs');
}

export async function updateProgram(programId: string, data: Partial<z.infer<typeof ProgramSchema>>) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    await prisma.degreeProgram.update({
        where: { program_id: programId },
        data: {
            ...data
        }
    });
    revalidatePath('/dashboard/admin/programs');
}

// CREATE / UPDATE Specializations
export async function createSpecialization(data: z.infer<typeof SpecializationSchema> & { academicYearId?: string }) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

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

    await prisma.specialization.create({
        data: {
            code: validated.code,
            name: validated.name,
            description: validated.description || '',
            degree_program: { connect: { program_id: validated.programId } },
            academic_year_id: academicYearId
        }
    });
    revalidatePath(`/dashboard/admin/programs`);
}

// STRUCTURE MANAGEMENT
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
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    let academicYearId = data.academicYearId;
    if (!academicYearId) {
        const program = await prisma.degreeProgram.findUnique({
            where: { program_id: data.programId },
            select: { academic_year_id: true }
        });
        academicYearId = program?.academic_year_id || undefined;
    }

    await prisma.programStructure.create({
        data: {
            degree_program: { connect: { program_id: data.programId } },
            module: { connect: { module_id: data.moduleId } },
            specialization: data.specializationId ? { connect: { specialization_id: data.specializationId } } : undefined,
            academic_year_id: academicYearId,
            academic_level: data.academicLevel,
            semester_number: data.semesterNumber,
            module_type: data.moduleType
        }
    });
    revalidatePath(`/dashboard/admin/programs`);
}

export async function removeModuleFromStructure(structureId: string) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

    await prisma.programStructure.delete({
        where: { structure_id: structureId }
    });
    // revalidate generic?
    revalidatePath(`/dashboard/admin/programs`);
}

export async function getAllModulesSimple() {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

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

export async function getAllAcademicYears() {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");
    return await prisma.academicYear.findMany({ orderBy: { start_date: 'desc' } });
}

export async function upsertProgramIntake(data: {
    programId: string,
    academicYearId: string,
    minStudents: number,
    maxStudents: number,
    status: 'OPEN' | 'CLOSED' | 'UPCOMING'
}) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Unauthorized");

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
    } else {
        await prisma.programIntake.create({
            data: {
                degree_program: { connect: { program_id: data.programId } },
                academic_year: { connect: { academic_year_id: data.academicYearId } },
                min_students: data.minStudents,
                max_students: data.maxStudents,
                status: data.status
            }
        });
    }
    revalidatePath(`/dashboard/admin/programs`);
}
