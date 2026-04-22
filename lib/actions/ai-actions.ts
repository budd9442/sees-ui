'use server';

import { auth } from '@/auth';
import { AIService } from '@/lib/services/ai-service';

/**
 * AI Guidance Server Action
 * Fetches personalized pathway advice for the authenticated student.
 */
/**
 * @swagger
 * /action/ai/getAIGuidance:
 *   post:
 *     summary: "[Server Action] Get AI Academic Guidance"
 *     description: Generates personalized academic and career guidance for the student using Grok AI.
 *     tags:
 *       - AI Actions
 *     responses:
 *       200:
 *         description: Successfully generated guidance
 */
export async function getAIGuidance() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentId = session.user.id;
    return await AIService.generatePathwayAdvice(studentId);
}
