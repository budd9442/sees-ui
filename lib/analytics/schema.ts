import { z } from 'zod';

/** Semantic datasets exposed to the query engine (allowlisted). */
export const analyticsDatasetIdSchema = z.enum([
    'staff_module_grades',
    'hod_student_summary',
    'hod_module_grades',
    'hod_gpa_monthly',
]);

export type AnalyticsDatasetId = z.infer<typeof analyticsDatasetIdSchema>;

export const analyticsQueryFiltersSchema = z.object({
    academicYearId: z.string().optional(),
    semesterId: z.string().optional(),
    pathway: z.string().optional(),
    level: z.string().optional(),
    moduleId: z.string().optional(),
    metadataKey: z.string().optional(),
    metadataValue: z.string().optional(),
});

export type AnalyticsQueryFilters = z.infer<typeof analyticsQueryFiltersSchema>;

export const analyticsQueryInputSchema = z.object({
    datasetId: analyticsDatasetIdSchema,
    filters: analyticsQueryFiltersSchema.optional(),
    /** Server-side grouping for pivot-style results */
    groupBy: z.enum(['none', 'pathway', 'level', 'letter_grade', 'module', 'month', 'metadata']).optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQueryInputSchema>;

export const layoutItemSchema = z.object({
    i: z.string(),
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().positive(),
    h: z.number().int().positive(),
});

export const kpiAggregationSchema = z.enum(['first', 'sum', 'avg', 'min', 'max']);

export type KpiAggregation = z.infer<typeof kpiAggregationSchema>;

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
});

export type VisualEncodings = z.infer<typeof visualEncodingsSchema>;

export const visualSpecSchema = z.object({
    id: z.string(),
    type: z.enum(['kpi', 'bar', 'line', 'area', 'pie', 'table', 'scatter', 'gauge', 'matrix']),
    title: z.string().optional(),
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

export const geminiAssistantResponseSchema = z.object({
    narrative: z.string().max(8000).optional(),
    patch: reportDefinitionPatchSchema.optional(),
});

export type GeminiAssistantResponse = z.infer<typeof geminiAssistantResponseSchema>;
