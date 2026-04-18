import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateGraduationRules, ephemeralRulesFromThresholds } from './evaluate-eligibility';
import { gpaOnlyPresetRules } from './rule-presets';

const mkGrade = (
    module_id: string,
    gp: number,
    credits: number,
    counts = true,
    academic_year_id = 'y1'
) => ({
    module_id,
    grade_point: gp,
    released_at: new Date(),
    module: { credits, counts_toward_gpa: counts },
    semester: { academic_year_id },
});

test('GPA only preset: 3.75 maps to First Class', () => {
    const rules = gpaOnlyPresetRules();
    const r = evaluateGraduationRules(rules, {
        grades: [mkGrade('m1', 4, 3), mkGrade('m2', 3.5, 3)],
        programStructure: [],
        programId: 'p1',
        studentSpecializationId: null,
        admissionYear: 2022,
    });
    assert.equal(r.matchedDivisionId, 'FIRST_CLASS');
    assert.equal(r.academicClass, 'First Class');
});

test('GPA only preset: 3.2 maps to Second Lower', () => {
    const rules = gpaOnlyPresetRules();
    const r = evaluateGraduationRules(rules, {
        grades: [mkGrade('m1', 3.2, 6)],
        programStructure: [],
        programId: 'p1',
        studentSpecializationId: null,
        admissionYear: 2022,
    });
    assert.equal(r.matchedDivisionId, 'SECOND_LOWER');
});

test('below third threshold maps to Pass', () => {
    const rules = gpaOnlyPresetRules();
    const r = evaluateGraduationRules(rules, {
        grades: [mkGrade('m1', 2.0, 6)],
        programStructure: [],
        programId: 'p1',
        studentSpecializationId: null,
        admissionYear: 2022,
    });
    assert.equal(r.matchedDivisionId, null);
    assert.equal(r.academicClass, 'Pass');
});

test('ephemeral thresholds match evaluateGraduationRules', () => {
    const rules = ephemeralRulesFromThresholds(3.7, 3.3, 3.0, 2.5);
    const r = evaluateGraduationRules(rules, {
        grades: [mkGrade('m1', 3.35, 10)],
        programStructure: [],
        programId: 'p1',
        studentSpecializationId: null,
        admissionYear: 2022,
    });
    assert.equal(r.matchedDivisionId, 'SECOND_UPPER');
});

test('all_gpa_modules_min_grade_point fails when one module is weak', () => {
    const rules = {
        schemaVersion: 1,
        version: 1,
        evaluationOrder: ['FIRST_CLASS' as const],
        divisions: {
            FIRST_CLASS: {
                label: 'First',
                conditions: [{ type: 'all_gpa_modules_min_grade_point' as const, minGradePoint: 2.0 }],
            },
        },
    };
    const r = evaluateGraduationRules(rules, {
        grades: [mkGrade('m1', 4, 3), mkGrade('m2', 1.5, 3)],
        programStructure: [],
        programId: 'p1',
        studentSpecializationId: null,
        admissionYear: 2022,
    });
    assert.equal(r.matchedDivisionId, null);
    assert.ok(r.divisionEvaluations[0].conditions.some((c) => !c.passed));
});

test('max_program_years uses distinct academic_year_id', () => {
    const rules = {
        schemaVersion: 1,
        version: 1,
        evaluationOrder: ['FIRST_CLASS' as const],
        divisions: {
            FIRST_CLASS: {
                label: 'First',
                conditions: [
                    { type: 'min_gpa' as const, minGpa: 0 },
                    { type: 'max_program_years' as const, maxYears: 2 },
                ],
            },
        },
    };
    const ok = evaluateGraduationRules(rules, {
        grades: [mkGrade('a', 4, 3, true, 'y1'), mkGrade('b', 4, 3, true, 'y1')],
        programStructure: [],
        programId: 'p1',
        studentSpecializationId: null,
        admissionYear: 2022,
    });
    assert.equal(ok.matchedDivisionId, 'FIRST_CLASS');

    const fail = evaluateGraduationRules(rules, {
        grades: [
            mkGrade('a', 4, 3, true, 'y1'),
            mkGrade('b', 4, 3, true, 'y2'),
            mkGrade('c', 4, 3, true, 'y3'),
        ],
        programStructure: [],
        programId: 'p1',
        studentSpecializationId: null,
        admissionYear: 2022,
    });
    assert.equal(fail.matchedDivisionId, null);
});
