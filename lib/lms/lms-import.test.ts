import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_INSTITUTION_GRADING_BANDS } from '../grading/marks-to-grade';
import { resolveLmsLetterToGradePoint } from './lms-letter-to-grade-point';
import { inferCurrentLevel } from './lms-inference';
import { matchByCodeOrName, normalizeLmsCourseCode, normalizeLmsCourseName } from './lms-matching';

const mkDummyRow = () =>
    ({
        courseCode: 'X',
        courseName: 'Y',
        acYear: '1',
        attempt: '1',
        examStatus: '',
        examNote: '',
        grade: '',
    }) as any;

test('grade-letter resolution: A- / B- / Pass', () => {
    const aMinus = resolveLmsLetterToGradePoint({ letterInput: 'A-', bands: DEFAULT_INSTITUTION_GRADING_BANDS });
    assert.equal(aMinus.letter_grade, 'A-');
    assert.equal(aMinus.grade_point, 3.7);

    const bMinus = resolveLmsLetterToGradePoint({ letterInput: 'B-', bands: DEFAULT_INSTITUTION_GRADING_BANDS });
    assert.equal(bMinus.letter_grade, 'B-');
    assert.equal(bMinus.grade_point, 2.7);

    const pass = resolveLmsLetterToGradePoint({ letterInput: 'Pass', bands: DEFAULT_INSTITUTION_GRADING_BANDS });
    assert.equal(pass.letter_grade, 'Pass');
    assert.equal(pass.grade_point, 0);
});

test('current-level inference: Year4 rows=0 => Level3', () => {
    const lmsYears = {
        1: { year: 1, rows: [] },
        2: { year: 2, rows: [] },
        3: { year: 3, rows: [mkDummyRow()] },
        4: { year: 4, rows: [] },
    } as any;

    assert.equal(inferCurrentLevel(lmsYears), 'Level 3');
});

test('module matching: preserves digits so PPD 1 != PPD 2', () => {
    assert.notEqual(normalizeLmsCourseCode('PPD 1'), normalizeLmsCourseCode('PPD 2'));
    assert.notEqual(normalizeLmsCourseName('PPD 1'), normalizeLmsCourseName('PPD 2'));

    const catalog = [
        { module_id: 'm1', code: 'PPD 1', name: 'PPD 1 Some Module', semester_number: 1, semester_id: 's1' },
    ];

    const hit2 = matchByCodeOrName({
        lmsCourseCode: 'PPD 2',
        lmsCourseName: 'PPD 2 Some Module',
        catalog,
    });

    assert.equal(hit2.matched, false);
});

