import type { AnalyticsDatasetId } from './schema';
import type { VisualSpec } from './schema';

export type GroupByOption = NonNullable<VisualSpec['groupBy']>;

export type ColumnKind = 'number' | 'string';

/** Declared kinds for known query shapes (aligned with executeAnalyticsQuery). */
export function columnKindsForShape(
    datasetId: AnalyticsDatasetId,
    groupBy: GroupByOption | undefined
): { name: string; kind: ColumnKind }[] {
    const g = groupBy ?? 'none';
    switch (datasetId) {
        case 'staff_module_grades':
            if (g === 'pathway') {
                return [
                    { name: 'pathway', kind: 'string' },
                    { name: 'total_count', kind: 'number' },
                ];
            }
            return [
                { name: 'letter_grade', kind: 'string' },
                { name: 'count', kind: 'number' },
            ];
        case 'hod_student_summary':
            if (g === 'pathway') {
                return [
                    { name: 'pathway', kind: 'string' },
                    { name: 'student_count', kind: 'number' },
                    { name: 'avg_gpa', kind: 'number' },
                ];
            }
            if (g === 'level') {
                return [
                    { name: 'level', kind: 'string' },
                    { name: 'student_count', kind: 'number' },
                    { name: 'avg_gpa', kind: 'number' },
                ];
            }
            if (g === 'metadata') {
                return [
                    { name: 'metadata_value', kind: 'string' },
                    { name: 'student_count', kind: 'number' },
                    { name: 'avg_gpa', kind: 'number' },
                ];
            }
            return [
                { name: 'student_id', kind: 'string' },
                { name: 'name', kind: 'string' },
                { name: 'gpa', kind: 'number' },
                { name: 'pathway', kind: 'string' },
                { name: 'level', kind: 'string' },
            ];
        case 'hod_module_grades':
            return [
                { name: 'module_id', kind: 'string' },
                { name: 'code', kind: 'string' },
                { name: 'title', kind: 'string' },
                { name: 'graded_count', kind: 'number' },
                { name: 'avg_grade_point', kind: 'number' },
                { name: 'pass_rate', kind: 'number' },
            ];
        case 'hod_gpa_monthly':
            return [
                { name: 'month', kind: 'string' },
                { name: 'avg_gpa', kind: 'number' },
                { name: 'sample_size', kind: 'number' },
            ];
        default:
            return [];
    }
}

export function kindOfColumn(datasetId: AnalyticsDatasetId, groupBy: GroupByOption | undefined, col: string): ColumnKind {
    const row = columnKindsForShape(datasetId, groupBy).find((c) => c.name === col);
    return row?.kind ?? 'string';
}

const STAFF_DATASETS: AnalyticsDatasetId[] = ['staff_module_grades'];
const HOD_DATASETS: AnalyticsDatasetId[] = [
    'staff_module_grades',
    'hod_student_summary',
    'hod_module_grades',
    'hod_gpa_monthly',
];

export function analyticsDatasetsForRole(role: string): AnalyticsDatasetId[] {
    if (role === 'hod') return HOD_DATASETS;
    if (role === 'staff' || role === 'advisor') return STAFF_DATASETS;
    return STAFF_DATASETS;
}

export function groupByOptionsForDataset(datasetId: AnalyticsDatasetId): { value: GroupByOption; label: string }[] {
    switch (datasetId) {
        case 'staff_module_grades':
            return [
                { value: 'none', label: 'Letter grade (stacked)' },
                { value: 'pathway', label: 'By pathway (totals)' },
            ];
        case 'hod_student_summary':
            return [
                { value: 'none', label: 'Student rows' },
                { value: 'pathway', label: 'By pathway' },
                { value: 'level', label: 'By level' },
                { value: 'metadata', label: 'By metadata value' },
            ];
        case 'hod_module_grades':
        case 'hod_gpa_monthly':
            return [{ value: 'none', label: 'Default aggregation' }];
        default:
            return [{ value: 'none', label: 'None' }];
    }
}

/** Column names returned for dataset + groupBy (for axis / value wells). */
export function columnsForDatasetShape(
    datasetId: AnalyticsDatasetId,
    groupBy: GroupByOption | undefined
): string[] {
    const g = groupBy ?? 'none';
    switch (datasetId) {
        case 'staff_module_grades':
            if (g === 'pathway') return ['pathway', 'total_count'];
            return ['letter_grade', 'count'];
        case 'hod_student_summary':
            if (g === 'pathway') return ['pathway', 'student_count', 'avg_gpa'];
            if (g === 'level') return ['level', 'student_count', 'avg_gpa'];
            if (g === 'metadata') return ['metadata_value', 'student_count', 'avg_gpa'];
            return ['student_id', 'name', 'gpa', 'pathway', 'level'];
        case 'hod_module_grades':
            return ['module_id', 'code', 'title', 'graded_count', 'avg_grade_point', 'pass_rate'];
        case 'hod_gpa_monthly':
            return ['month', 'avg_gpa', 'sample_size'];
        default:
            return [];
    }
}

function firstNumericColumn(datasetId: AnalyticsDatasetId, groupBy: GroupByOption | undefined): string | undefined {
    return columnKindsForShape(datasetId, groupBy).find((c) => c.kind === 'number')?.name;
}

export function defaultEncodingsForShape(
    datasetId: AnalyticsDatasetId,
    groupBy: GroupByOption | undefined,
    type: VisualSpec['type']
): VisualSpec['encodings'] {
    const cols = columnsForDatasetShape(datasetId, groupBy);
    const num = firstNumericColumn(datasetId, groupBy);
    const pick = (a: string, b: string) => {
        const xa = cols.includes(a) ? a : cols[0];
        const yb = cols.includes(b) ? b : cols[1] ?? cols[0];
        return { x: xa, y: yb, category: xa, value: yb };
    };
    if (type === 'kpi' || type === 'gauge') {
        const m = num ?? cols[1] ?? cols[0];
        return {
            metric: m,
            value: m,
            y: m,
            kpiAggregation: 'first',
        };
    }
    if (type === 'pie') {
        if (datasetId === 'staff_module_grades' && (groupBy ?? 'none') === 'none') {
            return { category: 'letter_grade', value: 'count' };
        }
        if (datasetId === 'hod_student_summary' && (groupBy ?? 'none') === 'pathway') {
            return { category: 'pathway', value: 'student_count' };
        }
        return pick(cols[0], cols[1] ?? cols[0]);
    }
    if (type === 'table' || type === 'matrix') {
        return undefined;
    }
    if (datasetId === 'hod_module_grades') {
        return { category: 'code', value: 'avg_grade_point' };
    }
    if (datasetId === 'hod_gpa_monthly') {
        return { x: 'month', y: 'avg_gpa' };
    }
    if (datasetId === 'staff_module_grades' && (groupBy ?? 'none') === 'pathway') {
        return { x: 'pathway', y: 'total_count' };
    }
    if (datasetId === 'hod_student_summary' && (groupBy ?? 'none') === 'pathway') {
        return { x: 'pathway', y: 'avg_gpa' };
    }
    if (datasetId === 'hod_student_summary' && (groupBy ?? 'none') === 'level') {
        return { x: 'level', y: 'avg_gpa' };
    }
    if (datasetId === 'hod_student_summary' && (groupBy ?? 'none') === 'metadata') {
        return { x: 'metadata_value', y: 'avg_gpa' };
    }
    return { x: 'letter_grade', y: 'count' };
}

export function nextVisualLayoutY(visuals: VisualSpec[]): number {
    if (!visuals.length) return 0;
    return Math.max(...visuals.map((v) => v.layout.y + v.layout.h));
}
