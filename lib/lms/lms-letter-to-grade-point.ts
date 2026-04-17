import type { GradingBandRow } from '@/lib/grading/marks-to-grade';
import { DEFAULT_INSTITUTION_GRADING_BANDS, resolveLetterFromBands } from '@/lib/grading/marks-to-grade';

export function resolveLmsLetterToGradePoint(params: {
    letterInput: string;
    bands?: GradingBandRow[];
}): { letter_grade: string; grade_point: number } {
    const raw = String(params.letterInput ?? '').trim();
    if (!raw) {
        throw new Error('Letter grade is empty');
    }

    if (raw.toLowerCase() === 'pass') {
        return { letter_grade: 'Pass', grade_point: 0 };
    }

    const bands = params.bands ?? DEFAULT_INSTITUTION_GRADING_BANDS;
    return resolveLetterFromBands(raw, bands);
}

