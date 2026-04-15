import { gradeContributesToGpa } from '@/lib/gpa-utils';
import type { ConditionScope, DivisionId, GraduationCondition, GraduationRulesDocument } from './rule-schema';
import { parseGraduationRulesDocument } from './rule-schema';

export type ConditionResult = {
    condition: GraduationCondition;
    passed: boolean;
    detail: string;
};

export type DivisionEvaluation = {
    divisionId: DivisionId;
    label: string;
    passed: boolean;
    conditions: ConditionResult[];
};

export type EligibilityEvaluationResult = {
    gpa: number;
    totalGpaCredits: number;
    matchedDivisionId: DivisionId | null;
    matchedLabel: string;
    /** Human-readable class aligned with existing dashboards */
    academicClass: string;
    divisionEvaluations: DivisionEvaluation[];
};

type BestGrade = {
    module_id: string;
    grade_point: number;
    credits: number;
    countsTowardGpa: boolean;
    academic_year_id: string | null;
};

type StructureRow = {
    module_id: string;
    module_type: string;
    specialization_id: string | null;
};

function isCoreForStudent(row: StructureRow, studentSpecId: string | null): boolean {
    if (row.module_type !== 'CORE') return false;
    if (row.specialization_id == null) return true;
    return studentSpecId != null && row.specialization_id === studentSpecId;
}

function isStructuredForStudent(row: StructureRow, studentSpecId: string | null): boolean {
    if (row.specialization_id == null) return true;
    return studentSpecId != null && row.specialization_id === studentSpecId;
}

function buildBestGrades(
    grades: {
        module_id: string;
        grade_point: number;
        released_at: Date | null;
        module: { credits: number; counts_toward_gpa?: boolean | null };
        semester: { academic_year_id: string };
    }[]
): Map<string, BestGrade> {
    const map = new Map<string, BestGrade>();
    for (const g of grades) {
        if (!g.released_at) continue;
        const prev = map.get(g.module_id);
        const countsTowardGpa = gradeContributesToGpa(g.module);
        const entry: BestGrade = {
            module_id: g.module_id,
            grade_point: g.grade_point,
            credits: g.module.credits,
            countsTowardGpa,
            academic_year_id: g.semester?.academic_year_id ?? null,
        };
        if (!prev || g.grade_point > prev.grade_point) {
            map.set(g.module_id, entry);
        }
    }
    return map;
}

function computeGpaFromBest(best: Map<string, BestGrade>): { gpa: number; totalGpaCredits: number } {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const g of best.values()) {
        if (!g.countsTowardGpa) continue;
        totalPoints += g.grade_point * g.credits;
        totalCredits += g.credits;
    }
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return { gpa, totalGpaCredits: totalCredits };
}

function distinctProgramYears(best: Map<string, BestGrade>, admissionYear: number): number {
    const years = new Set<string>();
    for (const g of best.values()) {
        if (g.academic_year_id) years.add(g.academic_year_id);
    }
    if (years.size > 0) return years.size;
    return Math.max(1, new Date().getFullYear() - admissionYear + 1);
}

function creditsForScope(
    scope: ConditionScope,
    best: Map<string, BestGrade>,
    structure: StructureRow[],
    studentSpecId: string | null
): { modules: { module_id: string; credits: number; grade_point: number }[] } {
    const structured = structure.filter((s) => isStructuredForStudent(s, studentSpecId));
    const moduleIds = new Set(structured.map((s) => s.module_id));

    const list: { module_id: string; credits: number; grade_point: number }[] = [];

    if (scope === 'GPA_MODULES') {
        for (const [mid, g] of best) {
            if (!g.countsTowardGpa) continue;
            list.push({ module_id: mid, credits: g.credits, grade_point: g.grade_point });
        }
        return { modules: list };
    }

    if (scope === 'CORE_ONLY') {
        const coreIds = new Set(
            structured.filter((s) => isCoreForStudent(s, studentSpecId)).map((s) => s.module_id)
        );
        for (const mid of coreIds) {
            const g = best.get(mid);
            if (!g) continue;
            list.push({ module_id: mid, credits: g.credits, grade_point: g.grade_point });
        }
        return { modules: list };
    }

    // ALL_STRUCTURED: programme modules that have a grade (released already in best)
    for (const mid of moduleIds) {
        const g = best.get(mid);
        if (!g) continue;
        list.push({ module_id: mid, credits: g.credits, grade_point: g.grade_point });
    }
    return { modules: list };
}

export function describeCondition(c: GraduationCondition): string {
    switch (c.type) {
        case 'min_gpa':
            return `Minimum GPA ≥ ${c.minGpa}`;
        case 'min_credits_at_min_grade_point':
            return `At least ${c.minCredits} credits at ≥ ${c.minGradePoint} GP (${c.scope})`;
        case 'min_fraction_credits_at_min_grade_point':
            return `At least ${(c.fraction * 100).toFixed(0)}% of credits at ≥ ${c.minGradePoint} GP (${c.scope})`;
        case 'all_gpa_modules_min_grade_point':
            return `All GPA modules ≥ ${c.minGradePoint} GP`;
        case 'max_program_years':
            return `Within ${c.maxYears} academic years of activity`;
        case 'min_total_credits_attempted':
            return `At least ${c.minCredits} credits attempted at ≥ ${c.minGradePoint} GP (${c.scope})`;
        case 'compulsory_weak_grade_credit_cap':
            return `Weak compulsory grades (≤${c.maxGradePoint} GP) over at most ${c.maxCredits} credits`;
        default:
            return 'Unknown condition';
    }
}

function evaluateCondition(
    c: GraduationCondition,
    ctx: {
        gpa: number;
        best: Map<string, BestGrade>;
        structure: StructureRow[];
        programId: string;
        studentSpecId: string | null;
        admissionYear: number;
    }
): ConditionResult {
    const { gpa, best, structure, studentSpecId, admissionYear } = ctx;

    switch (c.type) {
        case 'min_gpa': {
            const passed = gpa + 1e-9 >= c.minGpa;
            return {
                condition: c,
                passed,
                detail: passed ? `GPA ${gpa.toFixed(2)} meets minimum` : `GPA ${gpa.toFixed(2)} below ${c.minGpa}`,
            };
        }
        case 'min_credits_at_min_grade_point': {
            const { modules } = creditsForScope(c.scope, best, structure, studentSpecId);
            const sum = modules.filter((m) => m.grade_point + 1e-9 >= c.minGradePoint).reduce((s, m) => s + m.credits, 0);
            const passed = sum >= c.minCredits;
            return {
                condition: c,
                passed,
                detail: `${sum} credits meet threshold (need ${c.minCredits})`,
            };
        }
        case 'min_fraction_credits_at_min_grade_point': {
            const { modules } = creditsForScope(c.scope, best, structure, studentSpecId);
            const denom = modules.reduce((s, m) => s + m.credits, 0);
            const num = modules.filter((m) => m.grade_point + 1e-9 >= c.minGradePoint).reduce((s, m) => s + m.credits, 0);
            const frac = denom > 0 ? num / denom : 0;
            const passed = frac + 1e-9 >= c.fraction;
            return {
                condition: c,
                passed,
                detail: denom > 0 ? `${(frac * 100).toFixed(1)}% credits at target (need ${(c.fraction * 100).toFixed(0)}%)` : 'No credits in scope',
            };
        }
        case 'all_gpa_modules_min_grade_point': {
            const failures: string[] = [];
            for (const g of best.values()) {
                if (!g.countsTowardGpa) continue;
                if (g.grade_point + 1e-9 < c.minGradePoint) failures.push(g.module_id);
            }
            const passed = failures.length === 0;
            return {
                condition: c,
                passed,
                detail: passed ? 'All GPA modules meet floor' : `${failures.length} module(s) below floor`,
            };
        }
        case 'max_program_years': {
            const span = distinctProgramYears(best, admissionYear);
            const passed = span <= c.maxYears;
            return {
                condition: c,
                passed,
                detail: passed ? `${span} year(s) of activity within limit` : `${span} year(s) exceed max ${c.maxYears}`,
            };
        }
        case 'min_total_credits_attempted': {
            const { modules } = creditsForScope(c.scope, best, structure, studentSpecId);
            const sum = modules.filter((m) => m.grade_point + 1e-9 >= c.minGradePoint).reduce((s, m) => s + m.credits, 0);
            const passed = sum >= c.minCredits;
            return {
                condition: c,
                passed,
                detail: `${sum} credits attempted at threshold (need ${c.minCredits})`,
            };
        }
        case 'compulsory_weak_grade_credit_cap': {
            const structured = structure.filter((s) => isStructuredForStudent(s, studentSpecId));
            const coreIds = new Set(
                structured.filter((s) => isCoreForStudent(s, studentSpecId)).map((s) => s.module_id)
            );
            let weak = 0;
            for (const mid of coreIds) {
                const g = best.get(mid);
                if (!g) continue;
                if (g.grade_point <= c.maxGradePoint + 1e-9) weak += g.credits;
            }
            const passed = weak <= c.maxCredits + 1e-9;
            return {
                condition: c,
                passed,
                detail: `${weak.toFixed(0)} weak compulsory credits (cap ${c.maxCredits})`,
            };
        }
    }
}

/** Map division to dashboard-friendly labels */
export function academicClassFromDivision(divisionId: DivisionId | null, divisionLabel: string): string {
    if (!divisionId) return 'Pass';
    switch (divisionId) {
        case 'FIRST_CLASS':
            return 'First Class';
        case 'SECOND_UPPER':
            return 'Second Upper';
        case 'SECOND_LOWER':
            return 'Second Lower';
        case 'THIRD_PASS':
            return 'Third/Pass';
        case 'BASE_DEGREE':
            return divisionLabel || 'Degree eligible';
        default:
            return divisionLabel || 'Pass';
    }
}

/**
 * Pure evaluation: rules JSON + in-memory grades/structure → GPA, division pass/fail, `academicClass`.
 * Callers load data from DB in `evaluateStudentEligibility` (`./student-eligibility.ts`).
 */
export function evaluateGraduationRules(
    rulesInput: unknown,
    input: {
        grades: {
            module_id: string;
            grade_point: number;
            released_at: Date | null;
            module: { credits: number; counts_toward_gpa?: boolean | null };
            semester: { academic_year_id: string };
        }[];
        programStructure: StructureRow[];
        programId: string;
        studentSpecializationId: string | null;
        admissionYear: number;
    }
): EligibilityEvaluationResult {
    const rules = parseGraduationRulesDocument(rulesInput);
    const best = buildBestGrades(input.grades);
    const { gpa, totalGpaCredits } = computeGpaFromBest(best);

    const ctx = {
        gpa,
        best,
        structure: input.programStructure,
        programId: input.programId,
        studentSpecId: input.studentSpecializationId,
        admissionYear: input.admissionYear,
    };

    const divisionEvaluations: DivisionEvaluation[] = [];

    for (const divisionId of rules.evaluationOrder) {
        const div = rules.divisions[divisionId];
        if (!div) continue;
        const conditions: ConditionResult[] = div.conditions.map((c) => evaluateCondition(c, ctx));
        const passed = conditions.every((r) => r.passed);
        divisionEvaluations.push({
            divisionId,
            label: div.label,
            passed,
            conditions,
        });
    }

    const winner = divisionEvaluations.find((d) => d.passed);
    const matchedDivisionId = winner?.divisionId ?? null;
    const matchedLabel = winner?.label ?? 'Pass';
    const academicClass = academicClassFromDivision(matchedDivisionId, matchedLabel);

    return {
        gpa: parseFloat(gpa.toFixed(2)),
        totalGpaCredits,
        matchedDivisionId,
        matchedLabel,
        academicClass,
        divisionEvaluations,
    };
}

/** Ephemeral rules from flat GPA thresholds (when no DB profile exists). */
export function ephemeralRulesFromThresholds(first: number, upper: number, lower: number, third: number): GraduationRulesDocument {
    return {
        schemaVersion: 1,
        version: 1,
        evaluationOrder: ['FIRST_CLASS', 'SECOND_UPPER', 'SECOND_LOWER', 'THIRD_PASS'],
        divisions: {
            FIRST_CLASS: { label: 'First Class', conditions: [{ type: 'min_gpa', minGpa: first }] },
            SECOND_UPPER: { label: 'Second Class Upper', conditions: [{ type: 'min_gpa', minGpa: upper }] },
            SECOND_LOWER: { label: 'Second Class Lower', conditions: [{ type: 'min_gpa', minGpa: lower }] },
            THIRD_PASS: { label: 'Third Class', conditions: [{ type: 'min_gpa', minGpa: third }] },
        },
    };
}
