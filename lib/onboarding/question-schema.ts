import { z } from 'zod';

export const ONBOARDING_QUESTIONS_SETTING_KEY = 'student_onboarding_questions_v1';

export const onboardingQuestionTypeSchema = z.enum([
    'text',
    'textarea',
    'select',
    'radio',
]);

export type OnboardingQuestionType = z.infer<typeof onboardingQuestionTypeSchema>;

export const onboardingQuestionSchema = z.object({
    key: z
        .string()
        .trim()
        .min(2)
        .max(64)
        .regex(/^[a-z][a-z0-9_]*$/, 'Use snake_case, starting with a letter.'),
    label: z.string().trim().min(1).max(120),
    type: onboardingQuestionTypeSchema,
    required: z.boolean().default(false),
    includeInAnalytics: z.boolean().default(false),
    options: z.array(z.string().trim().min(1).max(80)).default([]),
    placeholder: z.string().trim().max(120).optional(),
});

export type OnboardingQuestion = z.infer<typeof onboardingQuestionSchema>;

export const onboardingQuestionsDocumentSchema = z.object({
    version: z.literal(1),
    updatedAt: z.string().optional(),
    questions: z.array(onboardingQuestionSchema).max(40),
});

export type OnboardingQuestionsDocument = z.infer<typeof onboardingQuestionsDocumentSchema>;

export function normalizeOnboardingQuestions(raw: unknown): OnboardingQuestionsDocument {
    const parsed = onboardingQuestionsDocumentSchema.parse(raw);
    return {
        ...parsed,
        questions: parsed.questions.map((q) => {
            const normalizedOptions = q.options
                .map((x) => x.trim())
                .filter(Boolean);
            return {
                ...q,
                options: (q.type === 'select' || q.type === 'radio') ? normalizedOptions : [],
            };
        }),
    };
}

export const onboardingAnswersSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));
