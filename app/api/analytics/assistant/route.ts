import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { assistantResponseSchema } from '@/lib/analytics/schema';
import { isAnalyticsAssistantEnabled } from '@/lib/analytics/feature-env';
import { DATASET_DESCRIPTIONS } from '@/lib/analytics/catalog';
import type { ReportDefinition } from '@/lib/analytics/schema';

export const runtime = 'nodejs';

const SYSTEM = `You are the Official AI Analytics Expert for the Department of Industrial Management (DIM), SEES platform.
Your task is to help staff and HODs (Head of Department) visualize institutional academic data for Level 1-4 students across MIT and IT programs.
Respond ONLY with valid JSON.

Output Schema:
{ 
  "narrative"?: "A brief, professional analysis or explanation of the changes", 
  "patch"?: { 
    "updateTitle"?: "string (new report title if requested)", 
    "addVisuals"?: Visual[], 
    "removeVisualIds"?: string[] 
  } 
}

Visual Object Definition:
{
  "id": "random 6-char string",
  "type": "kpi" | "bar" | "line" | "area" | "pie" | "donut" | "table" | "scatter" | "gauge" | "matrix" | "radar",
  "title": "string",
  "subtitle": "string",
  "datasetId": "string",
  "layout": { "i": "matches id", "x": 0-11, "y": number, "w": 1-12, "h": number },
  "groupBy": "none" | "level" | "pathway" | "admission_year" | "enrollment_status" | "academic_class" | "module" | "academic_year" | "letter_grade" | "program" | "status" | "goal_type" | "month",
  "encodings": { 
    "x": "field", "y": "field", "metric": "field", "category": "field", "value": "field", 
    "kpiAggregation": "avg"|"sum"|"count"|"min"|"max",
    "sortOrder": "asc"|"desc"|"none",
    "sortBy": "field name",
    "limit": number
  }
}

CRITICAL RULES:
1. IDs: Always generate a random 6-character string for \`id\` and \`layout.i\`.
2. Layout: The canvas is 12 columns wide (x: 0-11). Ensure visuals don't overlap significantly with the current report definition provided.
3. Remove: To clear or delete views, you must explicitly include their IDs in removeVisualIds.
4. Professionalism: Narratives should be objective and data-driven.
5. Top N / Ranking: For requests like "top modules", "best performing", "lowest pass rates", or "top 5 students", you MUST explicitly set "encodings.sortOrder" (asc/desc), "encodings.sortBy" (the field being ranked), and "encodings.limit" (the count, e.g., 5 or 10).

Available Datasets & Columns:
- core_student_metrics: [student_id, name, email, gpa, level, program, admission_year, academic_class, enrollment_status]
- core_module_metrics: [module_code, module_name, level, credits, academic_year, graded_count, avg_grade_point, pass_count, fail_count, pass_rate]
- core_grade_distribution: [letter_grade, grade_point, module_code, level, pathway]
- core_career_goals: [goal_type, total_goals, achieved_count, achievement_rate, avg_progress, status]

Keep patches helpful and concise. If adding visuals, ensure they fit neatly. Do not leave visuals unsorted if the user asks for rankings.`;

export async function POST(req: Request) {
    if (!isAnalyticsAssistantEnabled()) {
        return NextResponse.json({ error: 'Assistant disabled' }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { 
        prompt?: string; 
        aggregatesSummary?: string; 
        currentVisualIds?: string[];
        definition?: ReportDefinition;
    };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const prompt = (body.prompt || '').trim().slice(0, 4000);
    if (!prompt) {
        return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }

    const key = process.env.XAI_API_KEY!;
    if (!key) return NextResponse.json({ error: 'AI API Key missing' }, { status: 500 });

    const catalog = JSON.stringify(DATASET_DESCRIPTIONS);
    const currentReport = body.definition ? JSON.stringify(body.definition) : 'Empty report';
    
    const fullPrompt = `
Dataset catalog descriptions: ${catalog}
User role: ${session.user.role}
Current Report State: ${currentReport}
Aggregates context (metrics summary): ${(body.aggregatesSummary || '').slice(0, 2000)}

User request: ${prompt}
    `.trim();

    try {
        console.log('[AI Assistant API] Starting request');
        
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`
            },
            body: JSON.stringify({
                model: process.env.XAI_MODEL || "grok-beta",
                messages: [
                    { role: "system", content: SYSTEM },
                    { role: "user", content: fullPrompt }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[AI Assistant API] HTTP Error: ${errText}`);
            return NextResponse.json({ error: `AI Service Error: ${res.statusText}` }, { status: res.status });
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        
        if (!text) {
            return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 });
        }

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            return NextResponse.json({ error: 'Could not parse response text as JSON' }, { status: 502 });
        }
        
        const safe = assistantResponseSchema.safeParse(parsed);
        if (!safe.success) {
            return NextResponse.json({ error: 'Invalid assistant JSON schema returned from AI', issues: safe.error.flatten() }, { status: 502 });
        }
        
        return NextResponse.json(safe.data);
    } catch (e: unknown) {
        console.error('[AI Assistant API] Fatal caught error:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'AI request failed' }, { status: 500 });
    }
}
