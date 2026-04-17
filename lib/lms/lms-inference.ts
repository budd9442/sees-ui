import type { PrismaClient } from '@prisma/client';
import type { LmsYearResult } from './kln-science-faculty-client';

export type InferredAcademicContext = {
    currentLevel: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4';
    pathway?: {
        programId: string;
        pathwayCode: string;
    };
    specialization?: {
        specializationId: string;
        specializationCode: string;
    };
};

function normalizeCourseCode(code: string) {
    // Keep digits significant; only normalize whitespace and case.
    return String(code ?? '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function yearRowCount(year: LmsYearResult | undefined) {
    return year?.rows?.length ?? 0;
}

export function inferCurrentLevel(lmsYears: Record<1 | 2 | 3 | 4, LmsYearResult>): InferredAcademicContext['currentLevel'] {
    const y4 = yearRowCount(lmsYears[4]);
    const y3 = yearRowCount(lmsYears[3]);
    const y2 = yearRowCount(lmsYears[2]);

    if (y4 > 0) return 'Level 4';
    // Rule: Year4 rows=0 => user is in 3rd year (as long as Year3 has modules).
    if (y3 > 0) return 'Level 3';
    if (y2 > 0) return 'Level 2';
    return 'Level 1';
}

function lmsLevelToAcademicLevel(level: InferredAcademicContext['currentLevel']) {
    if (level === 'Level 1') return 'L1';
    if (level === 'Level 2') return 'L2';
    if (level === 'Level 3') return 'L3';
    return 'L4';
}

export async function inferStudentAcademicContext(params: {
    prisma: PrismaClient;
    lmsYears: Record<1 | 2 | 3 | 4, LmsYearResult>;
    // Optional: if pathway inference yields no match, fall back to these.
    fallbackPathwayProgramId?: string | null;
    fallbackSpecializationId?: string | null;
}): Promise<InferredAcademicContext> {
    const { prisma, lmsYears } = params;

    const currentLevel = inferCurrentLevel(lmsYears);
    const lmsLevel = lmsLevelToAcademicLevel(currentLevel);

    // Pathway inference only for Level 2+
    let pathway: InferredAcademicContext['pathway'] | undefined = undefined;
    if (currentLevel === 'Level 2' || currentLevel === 'Level 3' || currentLevel === 'Level 4') {
        const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
        const activeAcademicYearId = activeYear?.academic_year_id ?? null;

        const year2 = lmsYears[2];
        const year2Codes = new Set(year2.rows.map((r) => normalizeCourseCode(r.courseCode)));

        const candidates = await prisma.degreeProgram.findMany({
            where: { active: true },
            select: { program_id: true, code: true },
        });

        // Score each program by intersection size between imported Year2 codes and
        // ProgramStructure module codes for that program at academic level L2.
        let best: { programId: string; pathwayCode: string; score: number } | null = null;

        for (const c of candidates) {
            const academicYearOr =
                activeAcademicYearId != null
                    ? [{ academic_year_id: activeAcademicYearId }, { academic_year_id: null }]
                    : [{ academic_year_id: null }];

            const structures = await prisma.programStructure.findMany({
                where: {
                    program_id: c.program_id,
                    academic_level: 'L2',
                    OR: academicYearOr,
                } as any,
                include: { module: { select: { module_id: true, code: true, name: true } } },
            });

            const structureCodes = new Set(structures.map((s: any) => normalizeCourseCode(s.module.code)));
            let score = 0;
            for (const code of year2Codes) if (structureCodes.has(code)) score++;

            if (!best || score > best.score) best = { programId: c.program_id, pathwayCode: c.code, score };
        }

        if (best && best.score > 0) {
            pathway = { programId: best.programId, pathwayCode: best.pathwayCode };
        } else if (params.fallbackPathwayProgramId) {
            const prog = await prisma.degreeProgram.findUnique({
                where: { program_id: params.fallbackPathwayProgramId },
                select: { program_id: true, code: true },
            });
            if (prog) pathway = { programId: prog.program_id, pathwayCode: prog.code };
        } else {
            const first = candidates[0];
            if (first) pathway = { programId: first.program_id, pathwayCode: first.code };
        }
    } else if (params.fallbackPathwayProgramId) {
        const prog = await prisma.degreeProgram.findUnique({
            where: { program_id: params.fallbackPathwayProgramId },
            select: { program_id: true, code: true },
        });
        if (prog) pathway = { programId: prog.program_id, pathwayCode: prog.code };
    }

    // Specialization inference only for Level 3+
    let specialization: InferredAcademicContext['specialization'] | undefined = undefined;
    if (currentLevel === 'Level 3' || currentLevel === 'Level 4') {
        if (pathway) {
            const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
            const activeAcademicYearId = activeYear?.academic_year_id ?? null;

            const year3 = lmsYears[3];
            const year3Codes = new Set(year3.rows.map((r) => normalizeCourseCode(r.courseCode)));

            const specializations = await prisma.specialization.findMany({
                where: { active: true, program_id: pathway.programId },
                select: { specialization_id: true, code: true },
            });

            let best: { specializationId: string; specializationCode: string; score: number } | null = null;

            for (const s of specializations) {
                const academicYearOr =
                    activeAcademicYearId != null
                        ? [{ academic_year_id: activeAcademicYearId }, { academic_year_id: null }]
                        : [{ academic_year_id: null }];

                const structures = await prisma.programStructure.findMany({
                    where: {
                        program_id: pathway.programId,
                        academic_level: 'L3',
                        // include shared + specialization-specific modules
                        OR: [
                            ...academicYearOr.map((x: any) => ({ ...x, specialization_id: null })),
                            ...academicYearOr.map((x: any) => ({
                                ...x,
                                specialization_id: s.specialization_id,
                            })),
                        ],
                    } as any,
                    include: { module: { select: { module_id: true, code: true, name: true } } },
                });

                const structureCodes = new Set(structures.map((st: any) => normalizeCourseCode(st.module.code)));
                let score = 0;
                for (const code of year3Codes) if (structureCodes.has(code)) score++;

                if (!best || score > best.score) {
                    best = {
                        specializationId: s.specialization_id,
                        specializationCode: s.code,
                        score,
                    };
                }
            }

            if (best && best.score > 0) {
                specialization = { specializationId: best.specializationId, specializationCode: best.specializationCode };
            } else if (params.fallbackSpecializationId) {
                const spec = await prisma.specialization.findUnique({
                    where: { specialization_id: params.fallbackSpecializationId },
                    select: { specialization_id: true, code: true },
                });
                if (spec) specialization = { specializationId: spec.specialization_id, specializationCode: spec.code };
            } else if (specializations[0]) {
                specialization = {
                    specializationId: specializations[0].specialization_id,
                    specializationCode: specializations[0].code,
                };
            }
        }
    }

    return { currentLevel, pathway, specialization };
}

