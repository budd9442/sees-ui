import { prisma } from '@/lib/db';

/**
 * GrokService
 * Handles communication with the x.ai Grok API for academic analysis.
 */
export class GrokService {
    private static getApiKey() {
        return process.env.XAI_API_KEY?.trim() ?? '';
    }

    private static getApiUrl() {
        return "https://api.x.ai/v1/responses";
    }

    private static getModel() {
        return process.env.XAI_MODEL || "grok-beta";
    }

    /**
     * Helper to call x.ai Responses API
     */
    private static async callGrok(prompt: string, temperature = 0.2) {
        const apiKey = this.getApiKey();
        const apiUrl = this.getApiUrl();
        if (!apiKey) throw new Error("XAI_API_KEY is not configured.");

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: this.getModel(),
                input: prompt,
                // The Responses API might not support temperature directly in some versions, 
                // but we include it if expected. Adjusting if needed based on spec.
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`Grok API Error (${response.status}): ${err.error?.message || response.statusText}`);
        }

        const result = await response.json();
        // Format based on x.ai Responses API: result.output[0].content[0].text
        const text = result?.output?.[0]?.content?.[0]?.text;
        if (!text) throw new Error("Empty response from Grok");
        return text;
    }

    /**
     * Generate Pathway Guidance based on Student Transcript
     */
    static async generatePathwayAdvice(studentId: string) {
        try {
            const student = await prisma.student.findUnique({
                where: { student_id: studentId },
                include: {
                    user: true,
                    degree_path: true,
                    module_registrations: {
                        include: { module: true, grade: true }
                    }
                }
            });

            if (!student) throw new Error("Student not found.");

            const transcript = student.module_registrations
                .filter(mr => mr.grade)
                .map(mr => ({
                    code: mr.module.code,
                    name: mr.module.name,
                    grade: mr.grade?.letter_grade || 'N/A',
                    credits: mr.module.credits
                }));

            const prompt = `
                Acting as an expert academic advisor for a SEES IT program, analyze the following student transcript:
                ${JSON.stringify(transcript, null, 2)}
                
                Choose between:
                1. MIT (Management & Information Technology)
                2. IT (Pure Information Technology)
                
                Return a JSON object:
                {
                    "primary_recommendation": "MIT" | "IT",
                    "fit_score": 0-100,
                    "insight": "Succinct advisor's insight mentioning specific modules.",
                    "supporting_reasons": ["Reason 1", "Reason 2"]
                }
            `;

            const raw = await this.callGrok(prompt);
            return JSON.parse(raw);
        } catch (error) {
            console.error("Grok Advice Generation Failed:", error);
            return this.getFallbackAdvice();
        }
    }

    static async generatePathwayDecision(input: {
        currentGpa: number;
        preferences: Record<string, unknown>;
        transcript: Array<{
            moduleCode: string;
            moduleName: string;
            letterGrade: string | null;
            marks: number | null;
        }>;
        deterministicBreakdown: Array<{
            code: 'MIT' | 'IT';
            score: number;
            breakdown: {
                preferenceFit: number;
                transcriptFit: number;
            };
        }>;
    }) {
        const fallbackTop = input.deterministicBreakdown[0];
        const fallback = {
            primary_recommendation: fallbackTop.code,
            fit_score: fallbackTop.score,
            skill_vector: null as null | { Technical: number; Strategic: number; Operations: number },
            supporting_reasons: [
                'Grok decision unavailable; deterministic ranking used.',
                `Top deterministic candidate: ${fallbackTop.code}.`,
            ],
            modelUsed: false,
            failureReason: 'GROK_UNAVAILABLE',
        };

        try {
            const prompt = `
You are an academic advisor for L1 pathway selection.
Choose one pathway: MIT or IT using student preferences, transcript, and deterministic evidence.

Current GPA: ${input.currentGpa}
Student profile/preferences: ${JSON.stringify(input.preferences)}
Transcript summary: ${JSON.stringify(input.transcript)}
Deterministic ranking evidence: ${JSON.stringify(input.deterministicBreakdown)}

Return strict JSON:
{
  "primary_recommendation": "MIT" | "IT",
  "fit_score": 0-100,
  "skill_vector": { "Technical": 0-100, "Strategic": 0-100, "Operations": 0-100 },
  "supporting_reasons": ["reason 1", "reason 2", "reason 3"]
}
`;
            const raw = await this.callGrok(prompt, 0.2);
            const parsed = JSON.parse(raw);

            const rec = parsed.primary_recommendation;
            if (rec !== 'MIT' && rec !== 'IT') return { ...fallback, failureReason: 'INVALID_MODEL_RECOMMENDATION' as const };

            const rawSkill = parsed.skill_vector ?? {};
            return {
                primary_recommendation: rec,
                fit_score: Math.max(0, Math.min(100, Number(parsed.fit_score || 0))),
                skill_vector: {
                    Technical: Math.max(0, Math.min(100, Number(rawSkill.Technical || 0))),
                    Strategic: Math.max(0, Math.min(100, Number(rawSkill.Strategic || 0))),
                    Operations: Math.max(0, Math.min(100, Number(rawSkill.Operations || 0)))
                },
                supporting_reasons: Array.isArray(parsed.supporting_reasons) ? parsed.supporting_reasons : fallback.supporting_reasons,
                modelUsed: true,
                failureReason: null,
            };
        } catch (error) {
            return { ...fallback, failureReason: 'EXCEPTION_UNKNOWN' };
        }
    }

    static async generatePathwayGuidanceExplanation(input: {
        currentGpa: number;
        recommendedPathway: 'MIT' | 'IT';
        score: number;
        preferences: Record<string, unknown>;
        transcript: Array<{
            moduleCode: string;
            moduleName: string;
            letterGrade: string | null;
            marks: number | null;
        }>;
    }) {
        const fallback = {
            insight: `Your profile aligns with ${input.recommendedPathway} based on preferences and transcript signals.`,
            supporting_reasons: [`Recommendation score: ${input.score.toFixed(1)}.`]
        };

        try {
            const prompt = `
Explain clearly the recommendation: ${input.recommendedPathway} (Score: ${input.score}) for a student with GPA ${input.currentGpa}.
Preferences: ${JSON.stringify(input.preferences)}
Transcript: ${JSON.stringify(input.transcript)}

Return JSON:
{ "insight": "2-3 sentence explanation", "supporting_reasons": ["reason 1", "reason 2"] }
`;
            const raw = await this.callGrok(prompt, 0.2);
            const parsed = JSON.parse(raw);
            return {
                insight: parsed.insight || fallback.insight,
                supporting_reasons: parsed.supporting_reasons || fallback.supporting_reasons
            };
        } catch {
            return fallback;
        }
    }

    static async generateSpecializationAdvice(studentId: string) {
        try {
            const student = await prisma.student.findUnique({
                where: { student_id: studentId },
                include: { module_registrations: { include: { module: true, grade: true } } }
            });

            if (!student) throw new Error("Student not found.");

            const transcript = student.module_registrations
                .filter(mr => mr.grade)
                .map(mr => ({ code: mr.module.code, name: mr.module.name, grade: mr.grade?.letter_grade }));

            const prompt = `
                Suggest best specialization (BSE, OSCM, or IS) for this MIT student:
                TRANSCRIPT: ${JSON.stringify(transcript)}
                
                Return JSON:
                {
                    "recommended_specialization": "BSE" | "OSCM" | "IS",
                    "fit_score": 0-100,
                    "insight": "advice text",
                    "skill_vector": { "Technical": 0, "Strategic": 0, "Operations": 0 },
                    "reasons": ["reason 1", "reason 2"]
                }
            `;
            const raw = await this.callGrok(prompt);
            return JSON.parse(raw);
        } catch {
            return this.getFallbackSpecializationAdvice();
        }
    }

    static async generatePersonalizedFeedback(context: Record<string, unknown>) {
        try {
            const prompt = `
            Analyze the student context and return feedback JSON.
            CONTEXT: ${JSON.stringify(context)}
            
            Format:
            { "overallAssessment": "string", "strengths": [], "riskAreas": [], "goalGuidance": [], "recommendedActions": [], "next30DayPlan": [], "advisorEscalationSignals": [], "confidenceNotes": { "modelUsed": true, "summary": "" } }
            `;
            const raw = await this.callGrok(prompt, 0.2);
            return JSON.parse(raw);
        } catch (error) {
            throw new Error("Grok failed to generate feedback.");
        }
    }

    static async generateAcademicRecoveryAdvice(studentId: string, dipAmount: number) {
        try {
            const student = await prisma.student.findUnique({
                where: { student_id: studentId },
                include: { module_registrations: { include: { module: true, grade: true } } }
            });
            if (!student) throw new Error("Student not found.");

            const prompt = `
                Academic recovery coach: student had GPA dip of ${dipAmount.toFixed(2)}.
                Return JSON:
                { "message": "Empathetic message", "recovery_actions": [], "advisor_outreach_subject": "", "advisor_outreach_body": "", "support_resources": [] }
            `;
            const raw = await this.callGrok(prompt);
            return JSON.parse(raw);
        } catch {
            return this.getFallbackRecoveryAdvice();
        }
    }

    private static getFallbackSpecializationAdvice() {
        return {
            recommended_specialization: "BSE",
            fit_score: 90,
            insight: "Fallback advice for BSE.",
            skill_vector: { Technical: 75, Strategic: 92, Operations: 80 },
            reasons: ["Performance in management modules"]
        };
    }

    private static getFallbackRecoveryAdvice() {
        return {
            message: "We've noticed a dip in your GPA. Don't worry!",
            recovery_actions: ["Meet with advisor"],
            advisor_outreach_subject: "Support Meeting",
            advisor_outreach_body: "Hi help me",
            support_resources: ["Tutoring"]
        };
    }

    private static getFallbackAdvice() {
        return { primary_recommendation: "MIT", fit_score: 85, insight: "Fallback MIT.", supporting_reasons: ["Good grades"] };
    }
}
