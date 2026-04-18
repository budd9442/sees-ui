import type { AnalyticsDatasetId } from './schema';

const HOD_ONLY: AnalyticsDatasetId[] = [
    'hod_student_summary',
    'hod_module_grades',
    'hod_gpa_monthly',
];

const ADMIN_DATASETS: AnalyticsDatasetId[] = [
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

const STAFFISH_ROLES = new Set(['staff', 'advisor', 'hod', 'admin']);

export function assertDatasetAllowedForRole(datasetId: AnalyticsDatasetId, role: string) {
    if (!STAFFISH_ROLES.has(role)) {
        throw new Error('Analytics: role not permitted');
    }
    if (HOD_ONLY.includes(datasetId) && !['hod', 'admin'].includes(role)) {
        throw new Error('Analytics: dataset requires HOD or admin role');
    }
    if (ADMIN_DATASETS.includes(datasetId) && !['hod', 'admin'].includes(role)) {
        throw new Error('Analytics: dataset requires HOD or admin role');
    }
}

export const DATASET_DESCRIPTIONS: Record<AnalyticsDatasetId, string> = {
    staff_module_grades: 'Per-letter grade counts across assigned modules (scoped by year/semester filters).',
    hod_student_summary: 'Department students with GPA and pathway (scoped to HoD department).',
    hod_module_grades: 'Released grades aggregated by department module.',
    hod_gpa_monthly: 'Department mean GPA by calendar month from GPA history.',
    admin_enrollment_trends: 'Student enrollment counts over time, broken down by level and admission year.',
    admin_gpa_distribution: 'GPA distribution histogram across all students in 0.5-wide buckets.',
    admin_module_performance: 'All modules: pass rate, avg grade point, fail rate, graded count.',
    admin_pass_fail_by_program: 'Pass/fail student counts and rates broken down by degree program.',
    admin_student_metadata: 'Student analytics using onboarding metadata (first-login questions) as dimensions.',
    admin_grade_heatmap: 'Grade frequency matrix: module code × letter grade counts.',
    admin_internship_stats: 'Internship status distribution and company diversity across students.',
    admin_academic_goals: 'Academic goal types, completion rates, and progress distributions.',
    admin_gpa_by_admission_year: 'Cohort GPA tracking — current GPA grouped by student admission year.',
    admin_at_risk_students: 'Students with GPA below 2.0 (academic probation threshold).',
    admin_ranking_trends: 'Ranking distribution and correlation with GPA across programs.',
    admin_module_yearly_trend: 'Historical performance trend for a specific module across multiple academic years.',
};

export const DATASET_CATEGORIES: Record<string, AnalyticsDatasetId[]> = {
    'Grade Performance': ['staff_module_grades', 'hod_module_grades', 'admin_module_performance', 'admin_grade_heatmap', 'admin_module_yearly_trend'],
    'Student Overview': ['hod_student_summary', 'admin_enrollment_trends', 'admin_at_risk_students', 'admin_gpa_by_admission_year'],
    'GPA Analytics': ['hod_gpa_monthly', 'admin_gpa_distribution', 'admin_pass_fail_by_program', 'admin_ranking_trends'],
    'Metadata Intelligence': ['admin_student_metadata'],
    'Engagement & Goals': ['admin_internship_stats', 'admin_academic_goals'],
};
