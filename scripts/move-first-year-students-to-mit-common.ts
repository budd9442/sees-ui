import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment.');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function getLatestAcademicYearId() {
    const latest = await prisma.academicYear.findFirst({
        orderBy: { end_date: 'desc' },
        select: { academic_year_id: true, label: true },
    });
    if (!latest) throw new Error('No academic year found.');
    return latest.academic_year_id;
}

async function ensureMitCommonProgram(academicYearId: string) {
    const existing = await prisma.degreeProgram.findFirst({
        where: { code: 'MIT-COMMON', academic_year_id: academicYearId },
        select: { program_id: true },
    });

    if (existing) return existing.program_id;

    const created = await prisma.degreeProgram.create({
        data: {
            code: 'MIT-COMMON',
            name: 'MIT Common Program',
            description: 'Common curriculum for MIT first-year (Level 1).',
            is_common: true,
            academic_year_id: academicYearId,
            active: true,
        },
        select: { program_id: true },
    });

    return created.program_id;
}

async function ensureMitCommonProgramStructure() {
    const latestAcademicYearId = await getLatestAcademicYearId();

    const mitProgram = await prisma.degreeProgram.findFirst({
        where: { code: 'MIT' },
        orderBy: [{ academic_year_id: 'desc' }, { name: 'asc' }],
        select: { program_id: true },
    });
    if (!mitProgram) {
        console.warn('MIT program (code=MIT) not found. Skipping structure copy.');
        return { copied: 0 };
    }

    const mitCommon = await prisma.degreeProgram.findFirst({
        where: { code: 'MIT-COMMON', academic_year_id: latestAcademicYearId },
        select: { program_id: true },
    });
    if (!mitCommon) {
        throw new Error('MIT-COMMON program not found after ensure.');
    }

    const sourceRows = await prisma.programStructure.findMany({
        where: {
            program_id: mitProgram.program_id,
            specialization_id: null,
            academic_level: 'L1',
            OR: [{ academic_year_id: latestAcademicYearId }, { academic_year_id: null }],
        } as any,
        select: {
            module_id: true,
            semester_id: true,
            academic_level: true,
            semester_number: true,
            module_type: true,
            credits: true,
            academic_year_id: true,
        },
    });

    if (sourceRows.length === 0) {
        console.warn('No MIT L1 ProgramStructure rows found to copy.');
        return { copied: 0 };
    }

    const createData = sourceRows.map((r) => ({
        program_id: mitCommon.program_id,
        specialization_id: null as any,
        module_id: r.module_id,
        semester_id: r.semester_id,
        academic_level: r.academic_level,
        semester_number: r.semester_number,
        module_type: r.module_type,
        credits: r.credits,
        academic_year_id: r.academic_year_id,
    }));

    const created = await prisma.programStructure.createMany({
        data: createData as any,
        skipDuplicates: true,
    });

    console.log(`Copied MIT L1 ProgramStructure rows into MIT-COMMON: ${created.count}/${createData.length}`);
    return { copied: created.count };
}

async function main() {
    const latestAcademicYearId = await getLatestAcademicYearId();
    const mitCommonProgramId = await ensureMitCommonProgram(latestAcademicYearId);
    await ensureMitCommonProgramStructure();

    const level1Where = {
        OR: [{ current_level: 'Level 1' }, { current_level: 'L1' }, { current_level: 'Level1' }],
    } as const;

    const before = await prisma.student.count({ where: level1Where as any });

    const res = await prisma.student.updateMany({
        where: level1Where as any,
        data: {
            degree_path_id: mitCommonProgramId,
            specialization_id: null,
        },
    });

    console.log(`Matched Level 1 students: ${before}`);
    console.log(`Updated students: ${res.count}`);
    console.log(`Academic year: ${latestAcademicYearId}`);
    console.log(`MIT-COMMON program_id: ${mitCommonProgramId}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

