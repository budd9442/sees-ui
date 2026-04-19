import { z } from 'zod';

/** Semantic datasets exposed to the query engine (allowlisted). */
export const analyticsDatasetIdSchema = z.enum([
    'core_student_metrics',
    'core_module_metrics',
    'core_grade_distribution',
    'core_career_goals',
    'core_audit_logs',
    'core_system_health',
]);

export type AnalyticsDatasetId = z.infer<typeof analyticsDatasetIdSchema>;

export const analyticsQueryFiltersSchema = z.object({
    // Time scope
    academicYearId: z.string().optional(),
    semesterId: z.string().optional(),
    // Student scope
    pathway: z.string().optional(),
    level: z.string().optional(),
    programId: z.string().optional(),
    admissionYear: z.coerce.number().optional(),
    enrollmentStatus: z.string().optional(),
    graduationStatus: z.string().optional(),
    failRateMin: z.coerce.number().optional(),
    goalType: z.string().optional(),
    // Grade scope
    moduleId: z.string().optional(),
    gpaMin: z.coerce.number().min(0).max(4).optional(),
    gpaMax: z.coerce.number().min(0).max(4).optional(),
    letterGrade: z.string().optional(),
    // Engagement / Career
    status: z.string().optional(),

    // Staff scope
    department: z.string().optional(),
    staffType: z.string().optional(),
    // Metadata scope
    metadataKey: z.string().optional(),
    metadataValue: z.string().optional(),
    // Secondary metadata dimension
    metadataKey2: z.string().optional(),
    metadataValue2: z.string().optional(),
});

export type AnalyticsQueryFilters = z.infer<typeof analyticsQueryFiltersSchema>;

export const analyticsQueryInputSchema = z.object({
    datasetId: analyticsDatasetIdSchema,
    filters: analyticsQueryFiltersSchema.optional(),
    /** Server-side grouping for pivot-style results */
    groupBy: z.enum([
        'none',
        'level',
        'pathway',
        'admission_year',
        'enrollment_status',
        'academic_class',
        'gpa_bucket',
        'metadata',
        'module',
        'academic_year',
        'letter_grade',
        'program',
        'status',
        'goal_type',
        'month',
        'category',
        'graduation_status',
    ]).optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQueryInputSchema>;

export const layoutItemSchema = z.object({
    i: z.string(),
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().positive(),
    h: z.number().int().positive(),
});

export const kpiAggregationSchema = z.enum(['first', 'sum', 'avg', 'min', 'max', 'count']);

export type KpiAggregation = z.infer<typeof kpiAggregationSchema>;

export const colorSchemeSchema = z.enum([
    'default',
    'blue',
    'green',
    'purple',
    'warm',
    'cool',
    'monochrome',
    'traffic_light',
]).optional();

export const visualEncodingsSchema = z.object({
    x: z.string().optional(),
    y: z.string().optional(),
    category: z.string().optional(),
    value: z.string().optional(),
    /** Primary numeric field for KPI / gauge (falls back to value / y). */
    metric: z.string().optional(),
    kpiAggregation: kpiAggregationSchema.optional(),
    /** Ordered visible columns for table/matrix; omit for all columns. */
    tableColumns: z.array(z.string()).optional(),
    /** Client-side pivot for matrix visual when all three are set. */
    pivotRow: z.string().optional(),
    pivotCol: z.string().optional(),
    pivotValue: z.string().optional(),
    // --- Appearance ---
    colorScheme: colorSchemeSchema.default('default').optional(),
    showDataLabels: z.boolean().optional(),
    sortOrder: z.enum(['none', 'asc', 'desc']).optional(),
    /** Field to sort by (defaults to primary metric if not set). */
    sortBy: z.string().optional(),
    /** Limit the number of records/groups returned. */
    limit: z.coerce.number().int().positive().optional(),
    /** KPI trend indicator column name (numeric, compared to metric) */
    trendCol: z.string().optional(),
    /** Calculated measure expression using [field] syntax, e.g. "[pass_rate] * 100" */
    calculatedMeasure: z.string().optional(),
    // Radar / multi-series
    radarMetrics: z.array(z.string()).optional(),
    color: z.string().optional(),
});

export type VisualEncodings = z.infer<typeof visualEncodingsSchema>;

export const visualSpecSchema = z.object({
    id: z.string(),
    type: z.enum(['kpi', 'bar', 'line', 'area', 'pie', 'table', 'scatter', 'gauge', 'matrix', 'radar', 'donut']),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    datasetId: analyticsDatasetIdSchema,
    layout: layoutItemSchema,
    filters: analyticsQueryFiltersSchema.optional(),
    groupBy: analyticsQueryInputSchema.shape.groupBy.optional(),
    encodings: visualEncodingsSchema.optional(),
});

export const reportPageSchema = z.object({
    id: z.string(),
    title: z.string(),
    visuals: z.array(visualSpecSchema),
});

export const reportDefinitionSchema = z.object({
    version: z.literal(1),
    pages: z.array(reportPageSchema),
});

export type ReportDefinition = z.infer<typeof reportDefinitionSchema>;
export type VisualSpec = z.infer<typeof visualSpecSchema>;

/** Gemini / NL assistant: validated patch to merge into a report (no raw SQL). */
export const reportDefinitionPatchSchema = z.object({
    targetPageId: z.string().optional(),
    addVisuals: z.array(visualSpecSchema).optional(),
    removeVisualIds: z.array(z.string()).optional(),
    updateTitle: z.string().optional(),
});

export type ReportDefinitionPatch = z.infer<typeof reportDefinitionPatchSchema>;

/** NL assistant: validated patch to merge into a report. */
export const assistantResponseSchema = z.object({
    narrative: z.string().max(8000).optional(),
    patch: reportDefinitionPatchSchema.optional(),
});

export type AssistantResponse = z.infer<typeof assistantResponseSchema>;
