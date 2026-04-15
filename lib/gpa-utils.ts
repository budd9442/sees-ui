/**
 * GPA Calculation Utilities for Student Frontend
 */

/** Module row shape (or partial) for GPA inclusion checks */
export type ModuleGpaPolicy = { counts_toward_gpa?: boolean | null };

/**
 * Whether a grade on this module should contribute to GPA (numerator and denominator).
 * Undefined/null counts_toward_gpa is treated as true for backward compatibility.
 */
export function gradeContributesToGpa(module: ModuleGpaPolicy): boolean {
    return module.counts_toward_gpa !== false;
}

export interface GradeEntry {
    points: number;
    credits: number;
    /** When false, row is excluded from GPA (non-GPA modules). Omitted/true = include. */
    countsTowardGpa?: boolean;
    [key: string]: any;
}

/**
 * Calculates the weighted GPA for a set of grades.
 * (Sum of Grade Points * Credits) / (Total Credits)
 */
export function calculateGPA(grades: GradeEntry[]): number {
    if (!grades || grades.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    grades.forEach(g => {
        if (g.countsTowardGpa === false) return;
        // Only include released/valid grades
        if (g.credits > 0) {
            totalPoints += (g.points * g.credits);
            totalCredits += g.credits;
        }
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

/**
 * **GPA-only** class labels (no programme JSON, no DB). Default ladder matches
 * `ephemeralRulesFromThresholds` fallbacks in `lib/graduation/student-eligibility.ts` (3.7 / 3.3 / 3.0 / 2.5).
 *
 * **Used by:** admin `gpa-client` preview, `lib/calculations.ts`, advisor student-detail + records
 * (client-side). For authoritative class with programme rules, server code must call
 * `evaluateStudentEligibility` instead.
 */
export function getAcademicClass(
    gpa: number,
    t?: { firstClass?: number; secondUpper?: number; secondLower?: number; thirdPass?: number }
): string {
    const first = t?.firstClass ?? 3.7;
    const upper = t?.secondUpper ?? 3.3;
    const lower = t?.secondLower ?? 3.0;
    const third = t?.thirdPass ?? 2.5;
    if (gpa >= first) return 'First Class';
    if (gpa >= upper) return 'Second Upper';
    if (gpa >= lower) return 'Second Lower';
    if (gpa >= third) return 'Third/Pass';
    return 'Pass';
}
