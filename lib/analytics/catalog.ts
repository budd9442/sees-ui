import type { AnalyticsDatasetId } from './schema';

const HOD_ONLY: AnalyticsDatasetId[] = [
    'hod_student_summary',
    'hod_module_grades',
    'hod_gpa_monthly',
];

const STAFFISH_ROLES = new Set(['staff', 'advisor', 'hod']);

export function assertDatasetAllowedForRole(datasetId: AnalyticsDatasetId, role: string) {
    if (!STAFFISH_ROLES.has(role)) {
        throw new Error('Analytics: role not permitted');
    }
    if (HOD_ONLY.includes(datasetId) && role !== 'hod') {
        throw new Error('Analytics: dataset requires HOD role');
    }
}

export const DATASET_DESCRIPTIONS: Record<AnalyticsDatasetId, string> = {
    staff_module_grades: 'Per-letter grade counts across assigned modules (scoped by year/semester filters).',
    hod_student_summary: 'Department students with GPA and pathway (scoped to HoD department).',
    hod_module_grades: 'Released grades aggregated by department module.',
    hod_gpa_monthly: 'Department mean GPA by calendar month from GPA history.',
};
