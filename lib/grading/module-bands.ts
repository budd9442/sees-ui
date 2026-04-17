import { prisma } from '@/lib/db';
import {
    DEFAULT_INSTITUTION_GRADING_BANDS,
    GradingBandRow,
    normalizeBandsInput,
    validateBands,
} from '@/lib/grading/marks-to-grade';

/**
 * Ensures Postgres has an active `GradingScheme` with bands so staff grading and admin GPA
 * use the same institution ladder (not an in-memory-only admin UI vs a stale 4-band fallback).
 */
export async function ensureDefaultGradingSchemeInDb(): Promise<void> {
    const active = await prisma.gradingScheme.findFirst({
        where: { active: true },
        orderBy: { name: 'asc' },
        include: { bands: { orderBy: { min_marks: 'desc' } } },
    });

    const requiredLetters = DEFAULT_INSTITUTION_GRADING_BANDS.map((b) => b.letter_grade);
    if (active && active.bands.length > 0) {
        const existingLetters = new Set(active.bands.map((b) => b.letter_grade));
        const missing = requiredLetters.filter((l) => !existingLetters.has(l));
        if (missing.length === 0) return;

        // Add missing bands without changing existing ones.
        await prisma.gradingBand.createMany({
            data: missing.map((letter) => {
                const band = DEFAULT_INSTITUTION_GRADING_BANDS.find((b) => b.letter_grade === letter)!;
                return {
                    scheme_id: active.scheme_id,
                    letter_grade: band.letter_grade,
                    grade_point: band.grade_point,
                    min_marks: band.min_marks,
                    max_marks: band.max_marks,
                };
            }),
        });
        return;
    }

    if (active && active.bands.length === 0) {
        await prisma.gradingBand.createMany({
            data: DEFAULT_INSTITUTION_GRADING_BANDS.map((b) => ({
                scheme_id: active.scheme_id,
                letter_grade: b.letter_grade,
                grade_point: b.grade_point,
                min_marks: b.min_marks,
                max_marks: b.max_marks,
            })),
        });
        return;
    }

    const withBands = await prisma.gradingScheme.findFirst({
        where: { bands: { some: {} } },
        include: { bands: true },
        orderBy: { name: 'asc' },
    });

    if (withBands) {
        await prisma.$transaction(async (tx) => {
            await tx.gradingScheme.updateMany({ data: { active: false } });
            await tx.gradingScheme.update({
                where: { scheme_id: withBands.scheme_id },
                data: { active: true },
            });
        });
        return;
    }

    await prisma.$transaction(async (tx) => {
        await tx.gradingScheme.updateMany({ data: { active: false } });
        const scheme = await tx.gradingScheme.create({
            data: { name: 'Institution default', version: '1.0', active: true },
        });
        await tx.gradingBand.createMany({
            data: DEFAULT_INSTITUTION_GRADING_BANDS.map((b) => ({
                scheme_id: scheme.scheme_id,
                letter_grade: b.letter_grade,
                grade_point: b.grade_point,
                min_marks: b.min_marks,
                max_marks: b.max_marks,
            })),
        });
    });
}

function mapSchemeBands(bands: { letter_grade: string; grade_point: number; min_marks: number; max_marks: number }[]) {
    return bands.map((b) => ({
        letter_grade: b.letter_grade,
        grade_point: b.grade_point,
        min_marks: b.min_marks,
        max_marks: b.max_marks,
    }));
}

/**
 * Load bands for a module: custom JSON override if valid, else active GradingScheme bands.
 */
export async function getEffectiveGradingBandsForModule(moduleId: string): Promise<GradingBandRow[]> {
    const mod = await prisma.module.findUnique({
        where: { module_id: moduleId },
        select: { custom_grading_bands: true },
    });

    const custom = normalizeBandsInput(mod?.custom_grading_bands ?? null);
    if (custom && custom.length > 0) {
        const v = validateBands(custom);
        if (v.ok) return v.bands;
    }

    await ensureDefaultGradingSchemeInDb();

    const scheme = await prisma.gradingScheme.findFirst({
        where: { active: true },
        orderBy: { name: 'asc' },
        include: {
            bands: { orderBy: { min_marks: 'desc' } },
        },
    });

    if (scheme?.bands?.length) {
        return mapSchemeBands(scheme.bands);
    }

    return DEFAULT_INSTITUTION_GRADING_BANDS;
}

/** Active institution scheme only (ignores per-module override). */
export async function getInstitutionGradingBands(): Promise<GradingBandRow[]> {
    await ensureDefaultGradingSchemeInDb();

    const scheme = await prisma.gradingScheme.findFirst({
        where: { active: true },
        orderBy: { name: 'asc' },
        include: {
            bands: { orderBy: { min_marks: 'desc' } },
        },
    });

    if (scheme?.bands?.length) {
        return mapSchemeBands(scheme.bands);
    }

    return DEFAULT_INSTITUTION_GRADING_BANDS;
}

/** True when module stores a valid custom override array. */
export async function moduleUsesCustomGradingBands(moduleId: string): Promise<boolean> {
    const mod = await prisma.module.findUnique({
        where: { module_id: moduleId },
        select: { custom_grading_bands: true },
    });
    const custom = normalizeBandsInput(mod?.custom_grading_bands ?? null);
    if (!custom?.length) return false;
    return validateBands(custom).ok;
}
