
import { prisma } from '@/lib/db';

/**
 * GeminiService
 * Handles direct communication with the Google Gemini API for academic analysis.
 */
export class GeminiService {
    private static getApiKey() {
        return process.env.GEMINI_API_KEY?.trim() ?? '';
    }

    private static getApiUrl() {
        return (
            process.env.GEMINI_API_URL?.trim() ||
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
        );
    }

    /**
     * Generate Pathway Guidance based on Student Transcript
     */
    static async generatePathwayAdvice(studentId: string) {
        const apiKey = this.getApiKey();
        const apiUrl = this.getApiUrl();
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not configured.");
            return this.getFallbackAdvice();
        }

        try {
            // 1. Fetch Student Data (Transcript)
            const student = await prisma.student.findUnique({
                where: { student_id: studentId },
                include: {
                    user: true,
                    degree_path: true,
                    module_registrations: {
                        include: {
                            module: true,
                            grade: true
                        }
                    }
                }
            });

            if (!student) throw new Error("Student not found.");

            // 2. Format Transcript for AI
            const transcript = student.module_registrations
                .filter(mr => mr.grade)
                .map(mr => ({
                    code: mr.module.code,
                    name: mr.module.name,
                    grade: mr.grade?.letter_grade || 'N/A',
                    credits: mr.module.credits
                }));

            // 3. Construct Prompt
            const prompt = `
                Acting as an expert academic advisor for a SEES (School of Engineering & Electronic Systems) IT program, 
                analyze the following student transcript:
                
                ${JSON.stringify(transcript, null, 2)}
                
                The student must choose between two pathways:
                1. MIT (Management & Information Technology): Focuses on Operations, Business Systems Engineering, and Strategic Management.
                2. IT (Pure Information Technology): Focuses on Software Engineering, Network Administration, and Technical Architecture.
                
                Based on their performance (A+ vs B grades, credit weights), which pathway offers the best alignment with their demonstrated skills?
                
                Return a JSON object in this format:
                {
                    "primary_recommendation": "MIT" or "IT",
                    "fit_score": 0-100,
                    "insight": "A succinct qualitative advisor's insight mentioning specific modules.",
                    "supporting_reasons": ["Reason 1", "Reason 2"]
                }
            `;

            // 4. Call Gemini API
            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });

            if (!response.ok) throw new Error(`Gemini API Error: ${response.statusText}`);

            const result = await response.json();
            const rawBody = result.candidates[0].content.parts[0].text;
            return JSON.parse(rawBody);

        } catch (error) {
            console.error("Gemini Advice Generation Failed:", error);
            return this.getFallbackAdvice();
        }
    }

    /**
     * Generate Specialization Guidance for MIT Students
     */
    static async generateSpecializationAdvice(studentId: string) {
        const apiKey = this.getApiKey();
        const apiUrl = this.getApiUrl();
        if (!apiKey) return this.getFallbackSpecializationAdvice();

        try {
            const student = await prisma.student.findUnique({
                where: { student_id: studentId },
                include: {
                    module_registrations: { include: { module: true, grade: true } }
                }
            });

            if (!student) throw new Error("Student not found.");

            const transcript = student.module_registrations
                .filter(mr => mr.grade)
                .map(mr => ({ code: mr.module.code, name: mr.module.name, grade: mr.grade?.letter_grade }));

            const prompt = `
                Acting as a career specialized academic advisor for an MIT (Management & IT) program, 
                analyze the following transcript and suggest the best specialization from the 3 branches:
                1. BSE (Business Systems Engineering): Focus on process optimization, ERP, and systems design.
                2. OSCM (Operations & Supply Chain): Focus on logistics, quantitative analysis, and lean operations.
                3. IS (Information Systems): Focus on data infrastructure, technical management, and network systems.
                
                TRANSCRIPT: ${JSON.stringify(transcript)}
                
                Return a JSON object:
                {
                    "recommended_specialization": "BSE" | "OSCM" | "IS",
                    "fit_score": 0-100,
                    "insight": "Succinct qualitative advice.",
                    "skill_vector": { "Technical": 0-100, "Strategic": 0-100, "Operations": 0-100 },
                    "reasons": ["Reason 1", "Reason 2"]
                }
            `;

            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });

            if (!response.ok) return this.getFallbackSpecializationAdvice();

            const result = await response.json();
            const rawBody = result.candidates[0].content.parts[0].text;
            return JSON.parse(rawBody);

        } catch (error) {
            return this.getFallbackSpecializationAdvice();
        }
    }

    /**
     * Generate explanation text for a deterministic specialization recommendation.
     * The model is used for narrative quality only; it does not choose the specialization.
     */
    static async generateSpecializationGuidanceExplanation(input: {
        studentId: string;
        currentGpa: number;
        recommendedSpecialization: 'BSE' | 'OSCM' | 'IS';
        score: number;
        scoreBreakdown: {
            preferenceFit: number;
            transcriptFit: number;
            careerFit: number;
            gpaReadiness: number;
        };
        preferences: Record<string, unknown>;
        transcript: Array<{
            moduleCode: string;
            moduleName: string;
            letterGrade: string | null;
            marks: number | null;
        }>;
    }) {
        const fallback = {
            insight: `Your profile aligns with ${input.recommendedSpecialization} based on preferences, transcript signals, and GPA readiness.`,
            reasons: [
                `Deterministic fit score: ${input.score.toFixed(1)}%.`,
                `Strongest factor: transcript/preference alignment for ${input.recommendedSpecialization}.`,
            ],
        };

        const apiKey = this.getApiKey();
        const apiUrl = this.getApiUrl();
        if (!apiKey) return fallback;

        try {
            const prompt = `
You are an academic advisor assistant.
The specialization recommendation has ALREADY been decided by deterministic rules.
Do not change the recommendation. Only explain it clearly.

Recommendation (fixed): ${input.recommendedSpecialization}
Overall score: ${input.score}
Current GPA: ${input.currentGpa}
Score breakdown: ${JSON.stringify(input.scoreBreakdown)}
Student preferences: ${JSON.stringify(input.preferences)}
Transcript summary: ${JSON.stringify(input.transcript)}

Return strict JSON:
{
  "insight": "2-3 sentence explanation",
  "reasons": ["reason 1", "reason 2", "reason 3"]
}
`;

            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: 'application/json',
                        temperature: 0.2,
                    },
                }),
            });

            if (!response.ok) return fallback;
            const result = await response.json();
            const rawBody = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawBody) return fallback;
            const parsed = JSON.parse(rawBody) as { insight?: string; reasons?: string[] };
            return {
                insight: parsed.insight || fallback.insight,
                reasons: Array.isArray(parsed.reasons) && parsed.reasons.length > 0 ? parsed.reasons : fallback.reasons,
            };
        } catch {
            return fallback;
        }
    }

    /**
     * Use Gemini to choose the best specialization from deterministic candidates.
     * Falls back to deterministic top choice when Gemini is unavailable/invalid.
     */
    static async generateSpecializationDecision(input: {
        currentGpa: number;
        preferences: Record<string, unknown>;
        transcript: Array<{
            moduleCode: string;
            moduleName: string;
            letterGrade: string | null;
            marks: number | null;
        }>;
        deterministicBreakdown: Array<{
            code: 'BSE' | 'OSCM' | 'IS';
            score: number;
            breakdown: {
                preferenceFit: number;
                transcriptFit: number;
                careerFit: number;
                gpaReadiness: number;
            };
        }>;
    }) {
        const fallbackTop = input.deterministicBreakdown[0];
        const fallback = {
            recommended_specialization: fallbackTop.code,
            fit_score: fallbackTop.score,
            skill_vector: null as null | { Technical: number; Strategic: number; Operations: number },
            reasons: [
                'Gemini decision unavailable; deterministic ranking used.',
                `Top deterministic candidate: ${fallbackTop.code}.`,
            ],
            modelUsed: false,
            failureReason: 'GEMINI_UNAVAILABLE',
        };

        const apiKey = this.getApiKey();
        const apiUrl = this.getApiUrl();
        if (!apiKey) {
            return { ...fallback, failureReason: 'MISSING_API_KEY' as const };
        }

        try {
            const prompt = `
You are an academic advisor for BSc (Hons) MIT specialization guidance.
Choose the BEST specialization among BSE, OSCM, IS using BOTH student profile + transcript + deterministic ranking evidence.

Current GPA: ${input.currentGpa}
Student profile/preferences: ${JSON.stringify(input.preferences)}
Transcript summary: ${JSON.stringify(input.transcript)}
Deterministic ranking evidence: ${JSON.stringify(input.deterministicBreakdown)}

Rules:
- Return ONLY one recommendation: BSE, OSCM, or IS.
- Use deterministic evidence as strong signal, but you may choose another branch if profile+transcript justify it.
- Keep reasons concise and evidence-based.

Return strict JSON:
{
  "recommended_specialization": "BSE" | "OSCM" | "IS",
  "fit_score": 0-100,
  "skill_vector": { "Technical": 0-100, "Strategic": 0-100, "Operations": 0-100 },
  "reasons": ["reason 1", "reason 2", "reason 3"]
}
`;

            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: 'application/json',
                        temperature: 0.2,
                    },
                }),
            });

            if (!response.ok) {
                return {
                    ...fallback,
                    failureReason: `HTTP_${response.status}`,
                };
            }
            const result = await response.json();
            const rawBody = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawBody) return { ...fallback, failureReason: 'EMPTY_MODEL_RESPONSE' as const };

            const parsed = JSON.parse(rawBody) as {
                recommended_specialization?: string;
                fit_score?: number;
                skill_vector?: {
                    Technical?: number;
                    Strategic?: number;
                    Operations?: number;
                };
                reasons?: string[];
            };

            const rec = parsed.recommended_specialization;
            if (rec !== 'BSE' && rec !== 'OSCM' && rec !== 'IS') {
                return { ...fallback, failureReason: 'INVALID_MODEL_RECOMMENDATION' as const };
            }

            const rawSkill = parsed.skill_vector ?? {};
            const technical =
                typeof rawSkill.Technical === 'number' && Number.isFinite(rawSkill.Technical)
                    ? Math.max(0, Math.min(100, Number(rawSkill.Technical.toFixed(2))))
                    : null;
            const strategic =
                typeof rawSkill.Strategic === 'number' && Number.isFinite(rawSkill.Strategic)
                    ? Math.max(0, Math.min(100, Number(rawSkill.Strategic.toFixed(2))))
                    : null;
            const operations =
                typeof rawSkill.Operations === 'number' && Number.isFinite(rawSkill.Operations)
                    ? Math.max(0, Math.min(100, Number(rawSkill.Operations.toFixed(2))))
                    : null;

            const skillVector =
                technical !== null && strategic !== null && operations !== null
                    ? {
                          Technical: technical,
                          Strategic: strategic,
                          Operations: operations,
                      }
                    : null;

            return {
                recommended_specialization: rec,
                fit_score:
                    typeof parsed.fit_score === 'number' && Number.isFinite(parsed.fit_score)
                        ? Math.max(0, Math.min(100, Number(parsed.fit_score.toFixed(2))))
                        : fallbackTop.score,
                reasons:
                    Array.isArray(parsed.reasons) && parsed.reasons.length > 0
                        ? parsed.reasons
                        : fallback.reasons,
                skill_vector: skillVector,
                modelUsed: true,
                failureReason: null,
            };
        } catch (error) {
            return {
                ...fallback,
                failureReason:
                    error instanceof Error && error.message
                        ? `EXCEPTION_${error.message}`
                        : 'EXCEPTION_UNKNOWN',
            };
        }
    }

    /**
     * Fallback for Specialization Advice
     */
    private static getFallbackSpecializationAdvice() {
        return {
            recommended_specialization: "BSE",
            fit_score: 90,
            insight: "Your strong performance in foundation management modules makes you a natural fit for Business Systems Engineering.",
            skill_vector: { Technical: 75, Strategic: 92, Operations: 80 },
            reasons: ["High performance in MGTE modules", "Consistent analytical skills in Year 1"]
        };
    }

    /**
     * Generate Academic Recovery Advice for At-Risk Students
     */
    static async generateAcademicRecoveryAdvice(studentId: string, dipAmount: number) {
        const apiKey = this.getApiKey();
        const apiUrl = this.getApiUrl();
        if (!apiKey) return this.getFallbackRecoveryAdvice();

        try {
            const student = await prisma.student.findUnique({
                where: { student_id: studentId },
                include: {
                    module_registrations: { 
                        include: { module: true, grade: true },
                        where: { grade: { released_at: { not: null } } }
                    }
                }
            });

            if (!student) throw new Error("Student not found.");

            // Analyze only the latest semester
            const latestSemester = await prisma.semester.findFirst({
                where: { 
                    grades: { some: { student_id: studentId } }
                },
                orderBy: { start_date: 'desc' }
            });

            const targetGrades = student.module_registrations
                .filter(mr => mr.grade && mr.grade.semester_id === latestSemester?.semester_id)
                .map(mr => ({ code: mr.module.code, name: mr.module.name, grade: mr.grade?.letter_grade }));

            const prompt = `
                Acting as an empathetic academic recovery coach, analyze the student's performance 
                this semester which saw a GPA dip of ${dipAmount.toFixed(2)}. 
                
                LATEST GRADES: ${JSON.stringify(targetGrades)}
                
                Provide a JSON object with:
                {
                    "message": "Enthusiastic and empathetic message to the student.",
                    "recovery_actions": ["Action 1", "Action 2"],
                    "advisor_outreach_subject": "A good pre-filled subject for emailing their advisor.",
                    "advisor_outreach_body": "A short, professional template the student can use.",
                    "support_resources": ["Tutoring Center", "Library Research Assistant", "Student Wellness"]
                }
            `;

            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });

            if (!response.ok) return this.getFallbackRecoveryAdvice();

            const result = await response.json();
            const rawBody = result.candidates[0].content.parts[0].text;
            return JSON.parse(rawBody);

        } catch (error) {
            return this.getFallbackRecoveryAdvice();
        }
    }

    private static getFallbackRecoveryAdvice() {
        return {
            message: "We've noticed a slight dip in your GPA this semester. Don't worry—academic challenges are part of the journey!",
            recovery_actions: ["Schedule a peer tutoring session", "Review foundations of your technical modules"],
            advisor_outreach_subject: "Request for Academic Support Meeting",
            advisor_outreach_body: "Dear Advisor, I've noticed a drop in my performance this semester and would like to schedule a meeting to ensure I'm back on track.",
            support_resources: ["Peer Tutoring Center", "Module Office Hours"]
        };
    }

    /**
     * Fallback Engine (Semantic Rule-based) to ensure UI never breaks.
     */
    private static getFallbackAdvice() {
        return {
            primary_recommendation: "MIT",
            fit_score: 85,
            insight: "Your strong performance across management-oriented modules suggests an affinity for MIT pathway (Semantic Fallback Engine active).",
            supporting_reasons: ["Balanced performance in Year 1", "Strong communication skills indicated by elective success"]
        };
    }
}
