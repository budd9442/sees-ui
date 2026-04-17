import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

type MissingProgramStructure = {
    code: string;
    name: string;
    level: 'L1' | 'L2';
    credits: number;
    // Semester mapping within the academic year.
    semester_number: 1 | 2;
};

const MISSING: MissingProgramStructure[] = [
    { code: 'ACLT 11013', name: 'Academic Literacy I', level: 'L1', credits: 3, semester_number: 1 },
    { code: 'MGTE 11243', name: 'Principles of Management & Organizational Behaviour', level: 'L1', credits: 3, semester_number: 1 },
    { code: 'GNCT 23212', name: 'Personal Progress Development II', level: 'L2', credits: 2, semester_number: 1 },
    // LMS-only code; guidebook parsing appears missing from DB seed.
    { code: 'INTE 22213', name: 'INTE 22213', level: 'L2', credits: 3, semester_number: 2 },
];

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const activeYear = await prisma.academicYear.findFirst({ where: { active: true }, select: { academic_year_id: true } });
    if (!activeYear?.academic_year_id) throw new Error('No active academic_year found.');
    const academicYearId = activeYear.academic_year_id;

    // Determine target program ids for each academic level based on existing structures.
    const programIdsByLevel: Record<'L1' | 'L2', string[]> = { L1: [], L2: [] };
    for (const level of ['L1', 'L2'] as const) {
        const ps = await prisma.programStructure.findMany({
            where: {
                academic_level: level,
                AND: [{ academic_year_id: academicYearId }],
                specialization_id: null,
            },
            select: { program_id: true },
        });
        programIdsByLevel[level] = [...new Set(ps.map((p) => p.program_id))];
    }

    if (programIdsByLevel.L1.length === 0) {
        // Fallback: use any existing L1 programStructure (even if academic_year_id differs).
        const ps = await prisma.programStructure.findMany({
            where: { academic_level: 'L1', specialization_id: null },
            select: { program_id: true },
            take: 200,
        });
        programIdsByLevel.L1 = [...new Set(ps.map((p) => p.program_id))];
    }

    if (programIdsByLevel.L2.length === 0) {
        const ps = await prisma.programStructure.findMany({
            where: { academic_level: 'L2', specialization_id: null },
            select: { program_id: true },
            take: 200,
        });
        programIdsByLevel.L2 = [...new Set(ps.map((p) => p.program_id))];
    }

    if (programIdsByLevel.L1.length === 0 || programIdsByLevel.L2.length === 0) {
        throw new Error(
            `Could not determine target program ids (L1=${programIdsByLevel.L1.length}, L2=${programIdsByLevel.L2.length}).`
        );
    }

    for (const item of MISSING) {
        const countsTowardGpa = !item.code.startsWith('GNCT');

        const existingModule = await prisma.module.findFirst({
            where: { code: item.code },
            select: { module_id: true },
        });

        let moduleId = existingModule?.module_id;
        if (!moduleId) {
            const created = await prisma.module.create({
                data: {
                    code: item.code,
                    name: item.name,
                    credits: item.credits,
                    level: item.level,
                    description: item.name,
                    counts_toward_gpa: countsTowardGpa,
                    academic_year_id: null,
                },
                select: { module_id: true },
            });
            moduleId = created.module_id;
            console.log(`[CATALOG] Created Module ${item.code} (${moduleId})`);
        }

        const targetPrograms = programIdsByLevel[item.level];
        if (!targetPrograms?.length) throw new Error(`No target program ids for ${item.level}`);

        for (const programId of targetPrograms) {
            const exists = await prisma.programStructure.findFirst({
                where: {
                    program_id: programId,
                    specialization_id: null,
                    module_id: moduleId,
                    academic_year_id: academicYearId,
                },
                select: { structure_id: true },
            });

            if (exists) continue;

            await prisma.programStructure.create({
                data: {
                    program_id: programId,
                    specialization_id: null,
                    module_id: moduleId,
                    academic_level: item.level,
                    semester_number: item.semester_number,
                    module_type: 'CORE',
                    academic_year_id: academicYearId,
                },
            });
            console.log(`[CATALOG] Added ProgramStructure ${item.level} sem${item.semester_number} ${item.code} -> program ${programId}`);
        }
    }

    console.log('[CATALOG] Done.');
    await prisma.$disconnect();
    await pool.end();
}

void main().catch((e) => {
    console.error(e);
    process.exit(1);
});

