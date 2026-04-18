import type { AnalyticsDatasetId } from './schema';
import type { VisualSpec } from './schema';

export type GroupByOption = NonNullable<VisualSpec['groupBy']>;
export type ColumnKind = 'number' | 'string';

export const DATASET_LABELS: Record<AnalyticsDatasetId, string> = {
    core_student_metrics: 'Student Metrics & Demographics',
    core_module_metrics: 'Module Performance',
    core_grade_distribution: 'Grade Distribution Facts',
    core_career_goals: 'Career & Academic Goals',
};

/** Declared kinds for known query shapes (aligned with executeAnalyticsQuery). */
export function columnKindsForShape(
    datasetId: AnalyticsDatasetId,
    groupBy: GroupByOption | undefined
): { name: string; kind: ColumnKind }[] {
    const g = groupBy ?? 'none';
    switch (datasetId) {
        case 'core_student_metrics': {
            if (g === 'none') {
                return [
                    { name: 'student_id', kind: 'string' },
                    { name: 'name', kind: 'string' },
                    { name: 'email', kind: 'string' },
                    { name: 'gpa', kind: 'number' },
                    { name: 'level', kind: 'string' },
                    { name: 'program', kind: 'string' },
                    { name: 'admission_year', kind: 'string' },
                    { name: 'academic_class', kind: 'string' },
                    { name: 'enrollment_status', kind: 'string' }
                ];
            }
            const k = g === 'program' ? 'pathway' : g;
            return [
                { name: k, kind: 'string' },
                { name: 'student_count', kind: 'number' },
                { name: 'avg_gpa', kind: 'number' }
            ];
        }

        case 'core_module_metrics': {
            if (g === 'none' || g === 'module') {
                return [
                    { name: 'module_code', kind: 'string' },
                    { name: 'module_name', kind: 'string' },
                    { name: 'level', kind: 'string' },
                    { name: 'credits', kind: 'number' },
                    { name: 'academic_year', kind: 'string' },
                    { name: 'graded_count', kind: 'number' },
                    { name: 'avg_grade_point', kind: 'number' },
                    { name: 'pass_count', kind: 'number' },
                    { name: 'fail_count', kind: 'number' },
                    { name: 'pass_rate', kind: 'number' }
                ];
            }
            return [
                { name: g, kind: 'string' },
                { name: 'module_count', kind: 'number' },
                { name: 'graded_count', kind: 'number' },
                { name: 'avg_grade_point', kind: 'number' },
                { name: 'pass_count', kind: 'number' },
                { name: 'fail_count', kind: 'number' },
                { name: 'pass_rate', kind: 'number' }
            ];
        }

        case 'core_grade_distribution': {
            if (g === 'none') {
                return [
                    { name: 'letter_grade', kind: 'string' },
                    { name: 'grade_point', kind: 'number' },
                    { name: 'module_code', kind: 'string' },
                    { name: 'level', kind: 'string' },
                    { name: 'pathway', kind: 'string' }
                ];
            }
            const k = g === 'program' ? 'pathway' : g;
            return [
                { name: k, kind: 'string' },
                { name: 'count', kind: 'number' },
                { name: 'avg_grade_point', kind: 'number' }
            ];
        }

        case 'core_career_goals': {
            if (g === 'status' || g === 'company') {
                return [
                    { name: g, kind: 'string' },
                    { name: 'count', kind: 'number' }
                ];
            }
            return [
                { name: g === 'none' ? 'goal_type' : g, kind: 'string' },
                { name: 'total_goals', kind: 'number' },
                { name: 'achieved_count', kind: 'number' },
                { name: 'achievement_rate', kind: 'number' },
                { name: 'avg_progress', kind: 'number' }
            ];
        }

        default:
            return [];
    }
}

export function kindOfColumn(datasetId: AnalyticsDatasetId, groupBy: GroupByOption | undefined, col: string): ColumnKind {
    const row = columnKindsForShape(datasetId, groupBy).find((c) => c.name === col);
    return row?.kind ?? 'string';
}

const STAFF_DATASETS: AnalyticsDatasetId[] = ['core_module_metrics', 'core_grade_distribution'];
const HOD_DATASETS: AnalyticsDatasetId[] = ['core_student_metrics', 'core_module_metrics', 'core_grade_distribution'];
const ADMIN_DATASETS: AnalyticsDatasetId[] = [...HOD_DATASETS, 'core_career_goals'];

export function analyticsDatasetsForRole(role: string): AnalyticsDatasetId[] {
    if (role === 'admin') return ADMIN_DATASETS;
    if (role === 'hod') return HOD_DATASETS;
    return STAFF_DATASETS;
}

export function groupByOptionsForDataset(datasetId: AnalyticsDatasetId): { value: GroupByOption; label: string }[] {
    switch (datasetId) {
        case 'core_student_metrics':
            return [
                { value: 'none', label: 'Raw Student List' },
                { value: 'level', label: 'By Level' },
                { value: 'pathway', label: 'By Pathway/Program' },
                { value: 'admission_year', label: 'By Cohort Year' },
                { value: 'enrollment_status', label: 'By Enrollment Status' },
                { value: 'academic_class', label: 'By Class Honors' },
                { value: 'gpa_bucket', label: 'By GPA Target Range' },
                { value: 'metadata', label: 'By Custom Metadata' }
            ];
        case 'core_module_metrics':
            return [
                { value: 'none', label: 'Raw Modules' },
                { value: 'level', label: 'By Module Level' },
                { value: 'academic_year', label: 'By Academic Year' }
            ];
        case 'core_grade_distribution':
            return [
                { value: 'none', label: 'Raw Grades' },
                { value: 'letter_grade', label: 'By Letter Grade' },
                { value: 'module', label: 'By Module Code' },
                { value: 'level', label: 'By Student Level' },
                { value: 'pathway', label: 'By Student Pathway' }
            ];
        case 'core_career_goals':
            return [
                { value: 'none', label: 'By Goal Type' },
                { value: 'status', label: 'By Internship/Goal Status' },
                { value: 'company', label: 'By Internship Company' }
            ];
        default:
            return [{ value: 'none', label: 'None' }];
    }
}

/** Column names returned for dataset + groupBy (for axis / value wells). */
export function columnsForDatasetShape(
    datasetId: AnalyticsDatasetId,
    groupBy: GroupByOption | undefined
): string[] {
    return columnKindsForShape(datasetId, groupBy).map((c) => c.name);
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
    const str = columnKindsForShape(datasetId, groupBy).find((c) => c.kind === 'string')?.name;

    if (type === 'kpi' || type === 'gauge') {
        const m = num ?? cols[1] ?? cols[0];
        return { metric: m, value: m, y: m, kpiAggregation: 'avg' };
    }
    if (type === 'table' || type === 'matrix') return undefined;
    if (type === 'scatter') {
        const nums = columnKindsForShape(datasetId, groupBy).filter((c) => c.kind === 'number').map((c) => c.name);
        return { x: nums[0] ?? cols[0], y: nums[1] ?? cols[1] ?? cols[0] };
    }
    if (type === 'radar') {
        const nums = columnKindsForShape(datasetId, groupBy).filter((c) => c.kind === 'number').map((c) => c.name);
        return { category: str ?? cols[0], radarMetrics: nums.slice(0, 5) };
    }

    // Categorical charts (bar, line, area, pie, donut)
    const xKey = str ?? cols[0];
    const yKey = num ?? cols[1] ?? cols[0];

    if (type === 'pie' || type === 'donut') {
        return { category: xKey, value: yKey, x: xKey, y: yKey };
    }

    return { x: xKey, y: yKey, category: xKey, value: yKey };
}

export function nextVisualLayoutY(visuals: VisualSpec[]): number {
    if (!visuals.length) return 0;
    return Math.max(...visuals.map((v) => v.layout.y + v.layout.h));
}
