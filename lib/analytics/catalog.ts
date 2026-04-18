import type { AnalyticsDatasetId } from './schema';

const HOD_ONLY: AnalyticsDatasetId[] = [
    'core_student_metrics',
    'core_module_metrics',
    'core_grade_distribution',
];

const ADMIN_DATASETS: AnalyticsDatasetId[] = [
    'core_student_metrics',
    'core_module_metrics',
    'core_grade_distribution',
    'core_career_goals',
];

const STAFFISH_ROLES = new Set(['staff', 'advisor', 'hod', 'admin']);

export function assertDatasetAllowedForRole(datasetId: AnalyticsDatasetId, role: string) {
    if (!STAFFISH_ROLES.has(role)) {
        throw new Error('Analytics: role not permitted');
    }
    if (HOD_ONLY.includes(datasetId) && !['hod', 'admin'].includes(role)) {
        throw new Error('Analytics: dataset requires HOD or admin role');
    }
    if (datasetId === 'core_career_goals' && role !== 'admin') {
        throw new Error('Analytics: dataset requires admin role');
    }
}

export const DATASET_DESCRIPTIONS: Record<AnalyticsDatasetId, string> = {
    core_student_metrics: 'Unified multi-dimensional student facts. Includes GPA, academic standing, and metadata questions. Group by level, pathway, admission_year, metadata, enrollment_status, etc to generate distributions.',
    core_module_metrics: 'Unified module performance facts. Includes pass rates, credit sizes, and grade averages. Group by academic_year or level to view module history.',
    core_grade_distribution: 'Highly granular grade facts spanning letters and point values. Group by letter_grade, module, pathway, or level to generate heatmaps and histograms.',
    core_career_goals: 'Career engagement rollups including academic-goal states and student internship placements. Group by company, status, or goal_type.',
};

export const DATASET_CATEGORIES: Record<string, AnalyticsDatasetId[]> = {
    'Student Intelligence': ['core_student_metrics', 'core_career_goals'],
    'Academic Performance': ['core_module_metrics', 'core_grade_distribution'],
};
