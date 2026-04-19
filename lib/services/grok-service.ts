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
                Act as the Senior Academic Advisor at the Department of Industrial Management (DIM). 
                Analyze the following student transcript for transitioning from Level 1 to Level 2 in the B.Sc. Honours in MIT/IT program:
                ${JSON.stringify(transcript, null, 2)}
                
                Advise between:
                1. MIT (Management & Information Technology): Stronger affinity for business logic, management, and optimization modules (MGTE).
                2. IT (Pure Information Technology): Stronger affinity for technical architecture, engineering, and programming modules (INTE).
                
                Consider their performance in L1 core modules like INTE 11223 (Programming Concepts) vs MGTE 11243 (Principles of Management).
                
                Return a JSON object:
                {
                    "primary_recommendation": "MIT" | "IT",
                    "fit_score": 0-100,
                    "insight": "Succinct DIM-specific advisor's insight mentioning specific modules performance.",
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
You are the Lead Academic Counselor for the Department of Industrial Management. 
Choose one pathway: MIT or IT for an L1 student transitioning to Level 2 (SLQF Level 6 Honours).

L1 Core Performance Markers:
- IT Affinity: High marks in INTE 11223 (Programming), INTE 12213 (OOP), INTE 12243 (Networking).
- MIT Affinity: High marks in MGTE 11233 (Statistics/Economics), MGTE 11243 (Management), MGTE 12263 (Optimization).

Current GPA: ${input.currentGpa}
Student profile/preferences: ${JSON.stringify(input.preferences)}
Transcript summary: ${JSON.stringify(input.transcript)}
Deterministic ranking evidence: ${JSON.stringify(input.deterministicBreakdown)}

Return strict JSON:
{
  "primary_recommendation": "MIT" | "IT",
  "fit_score": 0-100,
  "skill_vector": { "Technical": 0-100, "Strategic": 0-100, "Operations": 0-100 },
  "supporting_reasons": ["DIM-specific reason citing modules", "reason 2", "reason 3"]
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

    static async generateSpecializationDecision(input: {
        currentGpa: number;
        pathway: string;
        preferences: Record<string, unknown>;
        grades: any[];
    }) {
        const fallback = {
            recommendation: 'BSE' as 'BSE' | 'OSCM' | 'IS',
            confidence: 0.85,
            insight: "Based on your technical scores and stated interests, Software Engineering is your strongest fit.",
            supporting_reasons: ["Strong performance in programming modules", "Interest in system architecture"]
        };

        try {
            const prompt = `Student GPA: ${input.currentGpa}\nPathway: ${input.pathway}\nPreferences: ${JSON.stringify(input.preferences)}\nGrades: ${JSON.stringify(input.grades.slice(0, 5))}\n\nRecommend one specialization: BSE, OSCM, or IS. Return JSON with recommendation, confidence, insight, and supporting_reasons (string array).`;
            const res = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'grok-beta',
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' }
                })
            });

            const data = await res.json();
            const parsed = JSON.parse(data.choices[0].message.content);
            return {
                ...fallback,
                ...parsed,
                modelUsed: true,
                failureReason: null
            };
        } catch (error) {
            return { ...fallback, failureReason: 'EXCEPTION_UNKNOWN' };
        }
    }

    static async generateSpecializationGuidanceExplanation(input: {
        currentGpa: number;
        recommendedSpec: string;
        score: number;
        preferences: Record<string, unknown>;
    }) {
        try {
            const prompt = `Explain why ${input.recommendedSpec} is recommended for a student with ${input.currentGpa} GPA and these preferences: ${JSON.stringify(input.preferences)}. Keep it motivating and under 150 words.`;
            const res = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'grok-beta',
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await res.json();
            return data.choices[0].message.content;
        } catch (error) {
            return `Based on your academic profile, ${input.recommendedSpec} aligns best with your specialization criteria and performance.`;
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
                Suggest the optimal specialization (BSE, OSCM, or IS) for this MIT student at the Department of Industrial Management.
                
                Focus Tracks:
                - BSE (Business Systems Engineering): Focus on Industrial Engineering, CIM (MGTE 31293), and BPE (MGTE 41333).
                - OSCM (Operations and Supply Chain Management): Focus on Logistics, Warehouse Management (MGTE 31413), and Strategic Quality (MGTE 42323).
                - IS (Information Systems): Focus on Data Analytics (INTE 31413), Info Security (INTE 31393), and Enterprise Systems (MGTE 41303).

                TRANSCRIPT: ${JSON.stringify(transcript)}
                
                Return JSON:
                {
                    "recommended_specialization": "BSE" | "OSCM" | "IS",
                    "fit_score": 0-100,
                    "insight": "High-level advisor text referencing their aptitude for specific track-specific modules.",
                    "skill_vector": { "Technical": 0, "Strategic": 0, "Operations": 0 },
                    "reasons": ["DIM-aligned reason 1", "reason 2"]
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
                You are the DIM Supportive Academic Success Coach. 
                Analyze the following student context and provide personalized, encouraging feedback.
                
                CONTEXT: ${JSON.stringify(context)}
                
                Guidelines for your feedback:
                1. Role: Act as a supportive academic mentor from the Department of Industrial Management (DIM), not an analytics tool or report.
                2. Tone: Use conversational, friendly, and emotionally intelligent language. Sound like you are having a coffee with the student.
                3. Human Acknowledgement: Acknowledge what the student is doing well in a human way. Avoid just listing high grades.
                4. Empathy: Understand and acknowledge what the student might be struggling with (e.g., "It's completely normal to find programming-focused modules challenging early in an IT degree").
                5. Contextual Connection: Connect current performance to future goals and modules naturally. Explain *why* certain subjects matter (e.g., how programming foundations impact OOP and databases).
                6. Meaningful Recommendations: Provide only 2-3 personal and practical next steps instead of a long list.
                7. Academic Rules: Students cannot redo/repeat a module unless they have a 'C-' grade or lower. Focus your analysis on future pending or next semester modules, unless a C- is present.
                8. C- Handling: If a student has a 'C-' or lower, acknowledge it gently and encourage them to work harder in their next attempt (repeat).
                9. Avoid Jargon: Do not use raw course codes (like INTE 11223) or SLQF levels. Use descriptive names like "Programming" or "Management Concepts".
                
                Format your response as strict JSON:
                { 
                  "overallAssessment": "String (warm, professional, and mentor-like summary)", 
                  "strengths": ["Meaningful, human strength 1", ...], 
                  "riskAreas": ["Gentle, empathetic area for improvement 1", ...], 
                  "goalGuidance": ["Natural advice connecting current work to their ambitions"], 
                  "recommendedActions": ["Personal, practical next step 1 (max 3 items)", ...], 
                  "advisorEscalationSignals": [], 
                  "confidenceNotes": { "modelUsed": true, "summary": "Short internal summary" } 
                }
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
                You are the DIM Academic Recovery Coach. A student had a noticeable GPA dip of ${dipAmount.toFixed(2)}. 
                
                Guidelines:
                1. Provide a warm, empathetic message. Don't lead with cold statistics.
                2. Gently remind them that for the B.Sc. Honours degree, they need to aim for 'C' grades or better to stay on track for their class award.
                3. Focus on recovery and support rather than just warnings.
                
                Return JSON:
                { 
                  "message": "Warm, encouraging message", 
                  "recovery_actions": ["Practical, non-intimidating step 1", ...], 
                  "advisor_outreach_subject": "Quick chat about your progress", 
                  "advisor_outreach_body": "Friendly outreach template", 
                  "support_resources": ["DIM Student Support", "Peer Mentoring Group"] 
                }
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
