import { z } from 'zod';

/**
 * The JSON the planner LLM returns.
 * canAnswer=false → return reason to user immediately, no SQL executed.
 * canAnswer=true  → sql is a validated SELECT query to run against the DB.
 */
export const SQLPlanSchema = z.object({
  canAnswer: z.boolean(),
  reason: z.string().nullable().optional(),
  sql: z.string().nullable().optional(),
});

export type SQLPlan = z.infer<typeof SQLPlanSchema>;
