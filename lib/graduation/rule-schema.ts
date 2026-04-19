import { z } from 'zod';

/** Which modules/credits a credit-based condition applies to */
export const conditionScopeSchema = z.enum(['GPA_MODULES', 'CORE_ONLY', 'ALL_STRUCTURED']);

export type ConditionScope = z.infer<typeof conditionScopeSchema>;

export const divisionIdSchema = z.enum([
    'FIRST_CLASS',
    'SECOND_UPPER',
    'SECOND_LOWER',
    'BASE_DEGREE',
]);

export type DivisionId = z.infer<typeof divisionIdSchema>;

const idField = z.string().min(1).optional();

export const graduationConditionSchema = z.discriminatedUnion('type', [
    z.object({
        id: idField,
        type: z.literal('min_gpa'),
        minGpa: z.number(),
    }),
    z.object({
        id: idField,
        type: z.literal('min_credits_at_min_grade_point'),
        minCredits: z.number().nonnegative(),
        minGradePoint: z.number(),
        scope: conditionScopeSchema,
    }),
    z.object({
        id: idField,
        type: z.literal('min_fraction_credits_at_min_grade_point'),
        fraction: z.number().min(0).max(1),
        minGradePoint: z.number(),
        scope: conditionScopeSchema,
    }),
    z.object({
        id: idField,
        type: z.literal('all_gpa_modules_min_grade_point'),
        minGradePoint: z.number(),
    }),
    z.object({
        id: idField,
        type: z.literal('max_program_years'),
        maxYears: z.number().int().positive(),
    }),
    z.object({
        id: idField,
        type: z.literal('min_total_credits_attempted'),
        minCredits: z.number().nonnegative(),
        minGradePoint: z.number(),
        scope: conditionScopeSchema,
    }),
    z.object({
        id: idField,
        type: z.literal('compulsory_weak_grade_credit_cap'),
        maxCredits: z.number().nonnegative(),
        maxGradePoint: z.number(),
    }),
]);

export type GraduationCondition = z.infer<typeof graduationConditionSchema>;

export const graduationDivisionSchema = z.object({
    label: z.string().min(1),
    conditions: z.array(graduationConditionSchema),
});

export type GraduationDivision = z.infer<typeof graduationDivisionSchema>;

export const graduationRulesDocumentSchema = z
    .object({
        schemaVersion: z.number().int().positive().default(1),
        version: z.number().int().positive().default(1),
        evaluationOrder: z.array(divisionIdSchema).min(1),
        divisions: z.record(z.string(), graduationDivisionSchema),
    })
    .superRefine((doc, ctx) => {
        for (const id of doc.evaluationOrder) {
            if (!doc.divisions[id]) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `evaluationOrder references missing division "${id}"`,
                    path: ['evaluationOrder'],
                });
            }
        }
        for (const key of Object.keys(doc.divisions)) {
            if (!divisionIdSchema.safeParse(key).success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Unknown division key "${key}"`,
                    path: ['divisions'],
                });
            }
        }
    });

export type GraduationRulesDocument = z.infer<typeof graduationRulesDocumentSchema>;

export function parseGraduationRulesDocument(raw: unknown): GraduationRulesDocument {
    return graduationRulesDocumentSchema.parse(raw);
}

export function safeParseGraduationRulesDocument(raw: unknown) {
    return graduationRulesDocumentSchema.safeParse(raw);
}
