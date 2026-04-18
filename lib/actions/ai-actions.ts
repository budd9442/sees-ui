'use server';

import { auth } from '@/auth';
import { GrokService } from '@/lib/services/grok-service';

/**
 * AI Guidance Server Action
 * Fetches personalized pathway advice for the authenticated student.
 */
export async function getAIGuidance() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentId = session.user.id;
    return await GrokService.generatePathwayAdvice(studentId);
}
