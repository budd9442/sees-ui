import type { AnalyticsDatasetId } from './schema';
import type { VisualSpec } from './schema';

export type GroupByOption = NonNullable<VisualSpec['groupBy']>;
export type ColumnKind = 'number' | 'string';

export const DATASET_LABELS: Record<AnalyticsDatasetId, string> = {
    staff_module_grades: 'Global Grade Distribution',
    hod_student_summary: 'Student Summary (HOD)',
    hod_module_grades: 'Module Grades (HOD)',
    hod_gpa_monthly: 'GPA Trend (Monthly)',
    admin_enrollment_trends: 'Enrollment Trends',
    admin_gpa_distribution: 'GPA Distribution',
    admin_module_performance: 'Module Performance (All)',
    admin_pass_fail_by_program: 'Pass/Fail by Program',
    admin_student_metadata: 'Student Metadata Analytics',
    admin_grade_heatmap: 'Grade Heatmap',
    admin_internship_stats: 'Internship Statistics',
    admin_academic_goals: 'Academic Goals',
    admin_gpa_by_admission_year: 'GPA by Admission Year (Cohort)',
    admin_at_risk_students: 'At-Risk Students',
    admin_ranking_trends: 'Ranking Trends',
    admin_module_yearly_trend: 'Module Historical Trend',
};

/** Declared kinds for known query shapes (aligned with executeAnalyticsQuery). */
export function columnKindsForShape(
    datasetId: AnalyticsDatasetId,
    groupBy: GroupByOption | undefined
): { name: string; kind: ColumnKind }[] {
    const g = groupBy ?? 'none';
    switch (datasetId) {
        case 'staff_module_grades':
            if (g === 'pathway') return [{ name: 'pathway', kind: 'string' }, { name: 'total_count', kind: 'number' }];
            return [{ name: 'letter_grade', kind: 'string' }, { name: 'count', kind: 'number' }];

        case 'hod_student_summary':
            if (g === 'pathway') return [{ name: 'pathway', kind: 'string' }, { name: 'student_count', kind: 'number' }, { name: 'avg_gpa', kind: 'number' }];
            if (g === 'level') return [{ name: 'level', kind: 'string' }, { name: 'student_count', kind: 'number' }, { name: 'avg_gpa', kind: 'number' }];
            if (g === 'metadata') return [{ name: 'metadata_value', kind: 'string' }, { name: 'student_count', kind: 'number' }, { name: 'avg_gpa', kind: 'number' }];
            return [{ name: 'student_id', kind: 'string' }, { name: 'name', kind: 'string' }, { name: 'gpa', kind: 'number' }, { name: 'pathway', kind: 'string' }, { name: 'level', kind: 'string' }];

        case 'hod_module_grades':
            return [{ name: 'module_id', kind: 'string' }, { name: 'code', kind: 'string' }, { name: 'title', kind: 'string' }, { name: 'graded_count', kind: 'number' }, { name: 'avg_grade_point', kind: 'number' }, { name: 'pass_rate', kind: 'number' }];

        case 'hod_gpa_monthly':
            return [{ name: 'month', kind: 'string' }, { name: 'avg_gpa', kind: 'number' }, { name: 'sample_size', kind: 'number' }];

        case 'admin_enrollment_trends':
            if (g === 'level') return [{ name: 'level', kind: 'string' }, { name: 'student_count', kind: 'number' }];
            if (g === 'enrollment_status') return [{ name: 'enrollment_status', kind: 'string' }, { name: 'student_count', kind: 'number' }];
            return [{ name: 'admission_year', kind: 'string' }, { name: 'student_count', kind: 'number' }];

        case 'admin_gpa_distribution':
            return [{ name: 'gpa_range', kind: 'string' }, { name: 'student_count', kind: 'number' }];

        case 'admin_module_performance':
            return [
                { name: 'module_code', kind: 'string' },
                { name: 'module_name', kind: 'string' },
                { name: 'level', kind: 'string' },
                { name: 'credits', kind: 'number' },
                { name: 'graded_count', kind: 'number' },
                { name: 'avg_grade_point', kind: 'number' },
                { name: 'pass_count', kind: 'number' },
                { name: 'fail_count', kind: 'number' },
                { name: 'pass_rate', kind: 'number' },
            ];

        case 'admin_pass_fail_by_program':
            return [
                { name: 'program_code', kind: 'string' },
                { name: 'program_name', kind: 'string' },
                { name: 'pass_count', kind: 'number' },
                { name: 'fail_count', kind: 'number' },
                { name: 'total', kind: 'number' },
                { name: 'pass_rate', kind: 'number' },
            ];

        case 'admin_student_metadata':
            if (g === 'metadata') return [{ name: 'metadata_value', kind: 'string' }, { name: 'student_count', kind: 'number' }, { name: 'avg_gpa', kind: 'number' }];
            return [{ name: 'metadata_key', kind: 'string' }, { name: 'question_label', kind: 'string' }, { name: 'type', kind: 'string' }];

        case 'admin_grade_heatmap':
            return [{ name: 'module_code', kind: 'string' }]; // dynamic columns per letter

        case 'admin_internship_stats':
            if (g === 'internship_status') return [{ name: 'status', kind: 'string' }, { name: 'count', kind: 'number' }];
            return [{ name: 'company', kind: 'string' }, { name: 'student_count', kind: 'number' }];

        case 'admin_academic_goals':
            if (g === 'goal_type') return [
                { name: 'goal_type', kind: 'string' },
                { name: 'total_goals', kind: 'number' },
                { name: 'achieved_count', kind: 'number' },
                { name: 'achievement_rate', kind: 'number' },
                { name: 'avg_progress', kind: 'number' },
            ];
            return [{ name: 'status', kind: 'string' }, { name: 'count', kind: 'number' }];

        case 'admin_gpa_by_admission_year':
            return [{ name: 'admission_year', kind: 'string' }, { name: 'avg_gpa', kind: 'number' }, { name: 'student_count', kind: 'number' }];

        case 'admin_at_risk_students':
            return [
                { name: 'student_id', kind: 'string' },
                { name: 'name', kind: 'string' },
                { name: 'email', kind: 'string' },
                { name: 'gpa', kind: 'number' },
                { name: 'level', kind: 'string' },
                { name: 'program', kind: 'string' },
                { name: 'admission_year', kind: 'number' },
                { name: 'academic_class', kind: 'string' },
            ];

        case 'admin_ranking_trends':
            if (g === 'level') return [{ name: 'level', kind: 'string' }, { name: 'avg_gpa', kind: 'number' }, { name: 'avg_rank', kind: 'number' }, { name: 'student_count', kind: 'number' }];
            return [{ name: 'rank', kind: 'number' }, { name: 'gpa', kind: 'number' }, { name: 'weighted_average', kind: 'number' }, { name: 'level', kind: 'string' }, { name: 'program', kind: 'string' }];

        case 'admin_module_yearly_trend':
            return [
                { name: 'academic_year', kind: 'string' },
                { name: 'graded_count', kind: 'number' },
                { name: 'avg_grade_point', kind: 'number' },
                { name: 'pass_rate', kind: 'number' },
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
    'admin_enrollment_trends',
    'admin_gpa_distribution',
    'admin_module_performance',
    'admin_pass_fail_by_program',
    'admin_student_metadata',
    'admin_grade_heatmap',
    'admin_internship_stats',
    'admin_academic_goals',
    'admin_gpa_by_admission_year',
    'admin_at_risk_students',
    'admin_ranking_trends',
];
const ADMIN_DATASETS: AnalyticsDatasetId[] = [...HOD_DATASETS];

export function analyticsDatasetsForRole(role: string): AnalyticsDatasetId[] {
    if (role === 'admin') return ADMIN_DATASETS;
    if (role === 'hod') return HOD_DATASETS;
    if (role === 'staff' || role === 'advisor') return STAFF_DATASETS;
    return STAFF_DATASETS;
}

export function groupByOptionsForDataset(datasetId: AnalyticsDatasetId): { value: GroupByOption; label: string }[] {
    switch (datasetId) {
        case 'staff_module_grades':
            return [{ value: 'none', label: 'Letter grade (stacked)' }, { value: 'pathway', label: 'By pathway (totals)' }];
        case 'hod_student_summary':
            return [{ value: 'none', label: 'Student rows' }, { value: 'pathway', label: 'By pathway' }, { value: 'level', label: 'By level' }, { value: 'metadata', label: 'By metadata value' }];
        case 'hod_module_grades':
        case 'hod_gpa_monthly':
            return [{ value: 'none', label: 'Default aggregation' }];
        case 'admin_enrollment_trends':
            return [{ value: 'none', label: 'By admission year' }, { value: 'level', label: 'By level' }, { value: 'enrollment_status', label: 'By status' }];
        case 'admin_gpa_distribution':
        case 'admin_module_performance':
        case 'admin_pass_fail_by_program':
        case 'admin_grade_heatmap':
        case 'admin_gpa_by_admission_year':
        case 'admin_at_risk_students':
            return [{ value: 'none', label: 'Default' }];
        case 'admin_student_metadata':
            return [{ value: 'none', label: 'Question catalog' }, { value: 'metadata', label: 'Group by metadata value' }];
        case 'admin_internship_stats':
            return [{ value: 'none', label: 'By company' }, { value: 'internship_status', label: 'By status' }];
        case 'admin_academic_goals':
            return [{ value: 'none', label: 'By status' }, { value: 'goal_type', label: 'By goal type' }];
        case 'admin_ranking_trends':
            return [{ value: 'none', label: 'Individual rankings' }, { value: 'level', label: 'By level' }];
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
