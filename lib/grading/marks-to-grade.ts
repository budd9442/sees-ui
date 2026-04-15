/**
 * Pure helpers for mapping percentage marks to letter grade + grade point.
 * Safe to import from client components (no server-only deps).
 */

export type GradingBandRow = {
    letter_grade: string;
    grade_point: number;
    min_marks: number;
    max_marks: number;
};

/**
 * Institution default mark → letter → points ladder.
 * Must stay in sync with admin GPA “Grade scale” defaults and with `ensureDefaultGradingSchemeInDb`.
 */
export const DEFAULT_INSTITUTION_GRADING_BANDS: GradingBandRow[] = [
    { letter_grade: 'A+', grade_point: 4.0, min_marks: 85, max_marks: 100 },
    { letter_grade: 'A', grade_point: 4.0, min_marks: 75, max_marks: 84 },
    { letter_grade: 'B+', grade_point: 3.3, min_marks: 70, max_marks: 74 },
    { letter_grade: 'B', grade_point: 3.0, min_marks: 65, max_marks: 69 },
    { letter_grade: 'C+', grade_point: 2.3, min_marks: 60, max_marks: 64 },
    { letter_grade: 'C', grade_point: 2.0, min_marks: 55, max_marks: 59 },
    { letter_grade: 'D', grade_point: 1.0, min_marks: 45, max_marks: 54 },
    { letter_grade: 'F', grade_point: 0.0, min_marks: 0, max_marks: 44 },
];

/** @deprecated Use DEFAULT_INSTITUTION_GRADING_BANDS — kept as alias for older imports */
export const FALLBACK_GRADING_BANDS = DEFAULT_INSTITUTION_GRADING_BANDS;

function coerceNumber(v: unknown): number | null {
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
        const n = parseFloat(v);
        return Number.isNaN(n) ? null : n;
    }
    return null;
}

/** Normalize admin/UI payload into GradingBandRow[]. */
export function normalizeBandsInput(raw: unknown): GradingBandRow[] | null {
    if (!Array.isArray(raw) || raw.length === 0) return null;
    const out: GradingBandRow[] = [];
    for (const item of raw) {
        if (!item || typeof item !== 'object') return null;
        const o = item as Record<string, unknown>;
        const letter =
            (typeof o.letter_grade === 'string' && o.letter_grade) ||
            (typeof o.letter === 'string' && o.letter) ||
            '';
        const gp = coerceNumber(o.grade_point ?? o.points);
        const min = coerceNumber(o.min_marks ?? o.minMarks);
        const max = coerceNumber(o.max_marks ?? o.maxMarks);
        if (!letter.trim() || gp === null || min === null || max === null) return null;
        out.push({
            letter_grade: letter.trim(),
            grade_point: gp,
            min_marks: min,
            max_marks: max,
        });
    }
    return out;
}

export function validateBands(raw: unknown): { ok: true; bands: GradingBandRow[] } | { ok: false; error: string } {
    const bands = normalizeBandsInput(raw);
    if (!bands) {
        return { ok: false, error: 'Bands must be a non-empty array of { letter_grade, grade_point, min_marks, max_marks }.' };
    }
    for (let i = 0; i < bands.length; i++) {
        const b = bands[i];
        if (b.min_marks < 0 || b.max_marks > 100) {
            return { ok: false, error: `Band ${i + 1}: min_marks/max_marks must stay within 0–100.` };
        }
        if (b.min_marks > b.max_marks) {
            return { ok: false, error: `Band ${i + 1}: min_marks cannot exceed max_marks.` };
        }
    }
    return { ok: true, bands };
}

/**
 * Pick letter + points using inclusive [min_marks, max_marks] ranges.
 * When multiple bands match (overlap), prefer the band with the highest min_marks.
 * If no band matches, use the band with the lowest min_marks (typically F), else F/0.
 */
export function resolveMarksToGrade(marks: number, bands: GradingBandRow[]): { letter_grade: string; grade_point: number } {
    if (!bands.length) {
        return { letter_grade: 'F', grade_point: 0 };
    }
    const sorted = [...bands].sort((a, b) => b.min_marks - a.min_marks);
    for (const b of sorted) {
        if (marks >= b.min_marks && marks <= b.max_marks) {
            return { letter_grade: b.letter_grade, grade_point: b.grade_point };
        }
    }
    const lowest = [...bands].sort((a, b) => a.min_marks - b.min_marks)[0];
    return { letter_grade: lowest.letter_grade, grade_point: lowest.grade_point };
}

export function letterFromMarksClient(marks: number, bands: GradingBandRow[]): string {
    return resolveMarksToGrade(marks, bands).letter_grade;
}

/** Match letter to a band (case-insensitive). Uses canonical `letter_grade` from the band. */
export function resolveLetterFromBands(
    letterInput: string,
    bands: GradingBandRow[]
): { letter_grade: string; grade_point: number } {
    const needle = letterInput.trim();
    if (!needle) {
        throw new Error('Letter grade is empty');
    }
    const hit = bands.find((b) => b.letter_grade.toLowerCase() === needle.toLowerCase());
    if (!hit) {
        throw new Error(`Letter grade "${letterInput.trim()}" is not in this module's grading scale.`);
    }
    return { letter_grade: hit.letter_grade, grade_point: hit.grade_point };
}

const NUMERIC_MARKS = /^-?\d+(\.\d+)?$/;

/** True if trimmed value should be treated as percentage marks (not a letter grade). */
export function isNumericMarksString(raw: string): boolean {
    const t = raw.trim();
    if (!t) return false;
    if (!NUMERIC_MARKS.test(t)) return false;
    const n = parseFloat(t);
    return !Number.isNaN(n);
}

/**
 * From a CSV / upload cell: numeric string → marks + derived letter; otherwise treat as letter grade.
 */
export function resolveGradeFromUploadCell(
    raw: string | number,
    bands: GradingBandRow[]
): { marks: number | null; letter_grade: string; grade_point: number } {
    if (typeof raw === 'number' && !Number.isNaN(raw)) {
        const r = resolveMarksToGrade(raw, bands);
        return { marks: raw, letter_grade: r.letter_grade, grade_point: r.grade_point };
    }
    const s = String(raw ?? '').trim();
    if (isNumericMarksString(s)) {
        const n = parseFloat(s);
        if (n < 0 || n > 100) {
            throw new Error('Marks must be between 0 and 100');
        }
        const r = resolveMarksToGrade(n, bands);
        return { marks: n, letter_grade: r.letter_grade, grade_point: r.grade_point };
    }
    const r = resolveLetterFromBands(s, bands);
    return { marks: null, letter_grade: r.letter_grade, grade_point: r.grade_point };
}
