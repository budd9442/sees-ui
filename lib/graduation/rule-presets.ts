import type { GraduationRulesDocument } from './rule-schema';

/** Matches standard GPA-only SystemSetting thresholds used across the codebase */
export function gpaOnlyPresetRules(): GraduationRulesDocument {
    return {
        schemaVersion: 1,
        version: 1,
        evaluationOrder: ['FIRST_CLASS', 'SECOND_UPPER', 'SECOND_LOWER', 'THIRD_PASS', 'BASE_DEGREE'],
        divisions: {
            FIRST_CLASS: {
                label: 'First Class',
                conditions: [{ type: 'min_gpa', minGpa: 3.7 }],
            },
            SECOND_UPPER: {
                label: 'Second Class Upper',
                conditions: [{ type: 'min_gpa', minGpa: 3.3 }],
            },
            SECOND_LOWER: {
                label: 'Second Class Lower',
                conditions: [{ type: 'min_gpa', minGpa: 3.0 }],
            },
            THIRD_PASS: {
                label: 'Third Class',
                conditions: [{ type: 'min_gpa', minGpa: 2.5 }],
            },
            BASE_DEGREE: {
                label: 'Degree Eligible',
                conditions: [{ type: 'min_gpa', minGpa: 2.0 }],
            },
        },
    };
}

/**
 * BSc Honours (4-year) style from guide_book — MIT/IT share the same class numbers.
 * Board discretion clauses are not auto-enforced (manual exam board).
 */
export function honoursFourYearGuidePresetRules(): GraduationRulesDocument {
    return {
        schemaVersion: 1,
        version: 1,
        evaluationOrder: ['FIRST_CLASS', 'SECOND_UPPER', 'SECOND_LOWER', 'THIRD_PASS', 'BASE_DEGREE'],
        divisions: {
            FIRST_CLASS: {
                label: 'First Class',
                conditions: [
                    { type: 'min_gpa', minGpa: 3.7 },
                    { type: 'all_gpa_modules_min_grade_point', minGradePoint: 2.0 },
                    { type: 'min_fraction_credits_at_min_grade_point', fraction: 0.5, minGradePoint: 4.0, scope: 'GPA_MODULES' },
                    { type: 'max_program_years', maxYears: 4 },
                ],
            },
            SECOND_UPPER: {
                label: 'Second Class Upper',
                conditions: [
                    { type: 'min_gpa', minGpa: 3.3 },
                    {
                        type: 'min_credits_at_min_grade_point',
                        minCredits: 117,
                        minGradePoint: 2.0,
                        scope: 'GPA_MODULES',
                    },
                    { type: 'min_fraction_credits_at_min_grade_point', fraction: 0.5, minGradePoint: 3.0, scope: 'GPA_MODULES' },
                    { type: 'max_program_years', maxYears: 4 },
                ],
            },
            SECOND_LOWER: {
                label: 'Second Class Lower',
                conditions: [
                    { type: 'min_gpa', minGpa: 3.0 },
                    {
                        type: 'min_credits_at_min_grade_point',
                        minCredits: 117,
                        minGradePoint: 2.0,
                        scope: 'GPA_MODULES',
                    },
                    { type: 'min_fraction_credits_at_min_grade_point', fraction: 0.5, minGradePoint: 3.0, scope: 'GPA_MODULES' },
                    { type: 'max_program_years', maxYears: 4 },
                ],
            },
            THIRD_PASS: {
                label: 'Third Class',
                conditions: [{ type: 'min_gpa', minGpa: 2.5 }],
            },
            BASE_DEGREE: {
                label: 'Degree Eligible',
                conditions: [
                    { type: 'min_gpa', minGpa: 2.0 },
                    { type: 'min_total_credits_attempted', minCredits: 132, minGradePoint: 0.0, scope: 'ALL_STRUCTURED' }
                ],
            },
        },
    };
}

/** Exit BSc (3-year) class rules from guide_book */
export function exitBscThreeYearGuidePresetRules(): GraduationRulesDocument {
    return {
        schemaVersion: 1,
        version: 1,
        evaluationOrder: ['FIRST_CLASS', 'SECOND_UPPER', 'SECOND_LOWER', 'THIRD_PASS', 'BASE_DEGREE'],
        divisions: {
            FIRST_CLASS: {
                label: 'First Class',
                conditions: [
                    { type: 'min_gpa', minGpa: 3.7 },
                    { type: 'all_gpa_modules_min_grade_point', minGradePoint: 2.0 },
                    { type: 'min_fraction_credits_at_min_grade_point', fraction: 0.5, minGradePoint: 4.0, scope: 'GPA_MODULES' },
                    { type: 'max_program_years', maxYears: 3 },
                ],
            },
            SECOND_UPPER: {
                label: 'Second Class Upper',
                conditions: [
                    { type: 'min_gpa', minGpa: 3.3 },
                    {
                        type: 'min_credits_at_min_grade_point',
                        minCredits: 99,
                        minGradePoint: 2.0,
                        scope: 'GPA_MODULES',
                    },
                    { type: 'min_fraction_credits_at_min_grade_point', fraction: 0.5, minGradePoint: 3.0, scope: 'GPA_MODULES' },
                    { type: 'max_program_years', maxYears: 3 },
                ],
            },
            SECOND_LOWER: {
                label: 'Second Class Lower',
                conditions: [
                    { type: 'min_gpa', minGpa: 3.0 },
                    {
                        type: 'min_credits_at_min_grade_point',
                        minCredits: 99,
                        minGradePoint: 2.0,
                        scope: 'GPA_MODULES',
                    },
                    { type: 'min_fraction_credits_at_min_grade_point', fraction: 0.5, minGradePoint: 3.0, scope: 'GPA_MODULES' },
                    { type: 'max_program_years', maxYears: 3 },
                ],
            },
            THIRD_PASS: {
                label: 'Third Class',
                conditions: [{ type: 'min_gpa', minGpa: 2.5 }],
            },
            BASE_DEGREE: {
                label: 'Degree Eligible',
                conditions: [
                    { type: 'min_gpa', minGpa: 2.0 },
                    { type: 'min_total_credits_attempted', minCredits: 90, minGradePoint: 0.0, scope: 'ALL_STRUCTURED' }
                ],
            },
        },
    };
}

export const PRESET_IDS = ['gpa_only', 'honours_4yr_guide', 'exit_bsc_3yr_guide'] as const;

export type PresetId = (typeof PRESET_IDS)[number];

export function getPresetRules(presetId: PresetId): GraduationRulesDocument {
    switch (presetId) {
        case 'gpa_only':
            return gpaOnlyPresetRules();
        case 'honours_4yr_guide':
            return honoursFourYearGuidePresetRules();
        case 'exit_bsc_3yr_guide':
            return exitBscThreeYearGuidePresetRules();
        default:
            return gpaOnlyPresetRules();
    }
}
