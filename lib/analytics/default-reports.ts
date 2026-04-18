import type { ReportDefinition } from './schema';

export function defaultStaffReportDefinition(): ReportDefinition {
    return {
        version: 1,
        pages: [
            {
                id: 'main',
                title: 'Module performance',
                visuals: [
                    {
                        id: 'v_grade_dist',
                        type: 'bar',
                        title: 'Grade distribution (all assigned modules)',
                        datasetId: 'core_grade_distribution',
                        layout: { i: 'v_grade_dist', x: 0, y: 0, w: 6, h: 5 },
                        groupBy: 'none',
                        encodings: { x: 'letter_grade', y: 'count' },
                    },
                    {
                        id: 'v_by_pathway',
                        type: 'bar',
                        title: 'Letter grades by pathway',
                        datasetId: 'core_grade_distribution',
                        layout: { i: 'v_by_pathway', x: 6, y: 0, w: 6, h: 5 },
                        groupBy: 'pathway',
                        encodings: { x: 'pathway', y: 'count' },
                    },
                ],
            },
        ],
    };
}

export function defaultHodReportDefinition(): ReportDefinition {
    return {
        version: 1,
        pages: [
            {
                id: 'main',
                title: 'Department overview',
                visuals: [
                    {
                        id: 'v_students',
                        type: 'table',
                        title: 'Students (scoped)',
                        datasetId: 'core_student_metrics',
                        layout: { i: 'v_students', x: 0, y: 0, w: 12, h: 6 },
                        groupBy: 'none',
                    },
                    {
                        id: 'v_modules',
                        type: 'bar',
                        title: 'Avg grade point by module',
                        datasetId: 'core_module_metrics',
                        layout: { i: 'v_modules', x: 0, y: 6, w: 12, h: 6 },
                        encodings: { category: 'module_code', value: 'avg_grade_point' },
                    },
                ],
            },
        ],
    };
}

export function defaultHodTrendsReportDefinition(): ReportDefinition {
    return {
        version: 1,
        pages: [
            {
                id: 'trends',
                title: 'GPA trajectory',
                visuals: [
                    {
                        id: 'v_gpa_month',
                        type: 'line',
                        title: 'Mean GPA by admission year',
                        datasetId: 'core_student_metrics',
                        layout: { i: 'v_gpa_month', x: 0, y: 0, w: 12, h: 6 },
                        groupBy: 'admission_year',
                        encodings: { x: 'admission_year', y: 'avg_gpa' },
                    },
                ],
            },
        ],
    };
}
