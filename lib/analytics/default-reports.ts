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
                        datasetId: 'staff_module_grades',
                        layout: { i: 'v_grade_dist', x: 0, y: 0, w: 6, h: 5 },
                        groupBy: 'none',
                        encodings: { x: 'letter_grade', y: 'count' },
                    },
                    {
                        id: 'v_by_pathway',
                        type: 'bar',
                        title: 'Letter grades by pathway',
                        datasetId: 'staff_module_grades',
                        layout: { i: 'v_by_pathway', x: 6, y: 0, w: 6, h: 5 },
                        groupBy: 'pathway',
                        encodings: { x: 'pathway', y: 'total_count' },
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
                        datasetId: 'hod_student_summary',
                        layout: { i: 'v_students', x: 0, y: 0, w: 12, h: 6 },
                        groupBy: 'none',
                    },
                    {
                        id: 'v_modules',
                        type: 'bar',
                        title: 'Avg grade point by module',
                        datasetId: 'hod_module_grades',
                        layout: { i: 'v_modules', x: 0, y: 6, w: 12, h: 6 },
                        encodings: { category: 'code', value: 'avg_grade_point' },
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
                        title: 'Mean GPA by month',
                        datasetId: 'hod_gpa_monthly',
                        layout: { i: 'v_gpa_month', x: 0, y: 0, w: 12, h: 6 },
                        encodings: { x: 'month', y: 'avg_gpa' },
                    },
                ],
            },
        ],
    };
}
