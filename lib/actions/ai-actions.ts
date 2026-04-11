'use server';

import { auth } from '@/auth';
import { GeminiService } from '@/lib/services/gemini-service';

/**
 * AI Guidance Server Action
 * Fetches personalized pathway advice for the authenticated student.
 */
export async function getAIGuidance() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentId = session.user.id;
    return await GeminiService.generatePathwayAdvice(studentId);
}
