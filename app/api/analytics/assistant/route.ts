import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { assistantResponseSchema } from '@/lib/analytics/schema';
import { isAnalyticsAssistantEnabled } from '@/lib/analytics/feature-env';
import { DATASET_DESCRIPTIONS } from '@/lib/analytics/catalog';

export const runtime = 'nodejs';

const SYSTEM = `You are the Official AI Analytics Expert for the Department of Industrial Management (DIM), SEES platform.
Your task is to help staff and HODs (Head of Department) visualize institutional academic data for Level 1-4 students across MIT and IT programs.
Respond ONLY with valid JSON.
Output Schema: { "narrative"?: string, "patch"?: { "updateTitle"?: string, "addVisuals"?: Visual[], "removeVisualIds"?: string[] } }
To clear or delete views, you must explicitly include their IDs in removeVisualIds.
CRITICAL: When adding visuals, you MUST generate a random 6-character string for both \`id\` and \`layout.i\` (they must match). Do not leave them empty!

Available Datasets (datasetId):
- core_student_metrics: Unified student metrics [student_id, name, email, gpa, level, program, admission_year, academic_class, enrollment_status]
- core_module_metrics: Unified module stats [module_code, module_name, level, credits, academic_year, graded_count, avg_grade_point, pass_count, fail_count, pass_rate]
- core_grade_distribution: Raw grade data [letter_grade, grade_point, module_code, level, pathway]
- core_career_goals: Career statistics [goal_type, total_goals, achieved_count, achievement_rate, avg_progress, status, company]

Visual Types: kpi, bar, line, area, pie, donut, table, scatter, gauge, radar, matrix.
Layout: 'i' (string matching visual id), x (0-11), y, w (1-12), h.
Encodings: Use field names from the dataset. For KPI/Gauge, use 'metric'. For charts, use 'x', 'y' or 'category', 'value'.
Filters: academicYearId, semesterId, programId, level, moduleId, gpaAbove, gpaBelow, minCredits, maxCredits, enrollmentStatus.

Keep patches helpful and concise. Ensure narratives reflect Department of Industrial Management institutional standards. If adding visuals, ensure they fit neatly.`;

export async function POST(req: Request) {
    if (!isAnalyticsAssistantEnabled()) {
        return NextResponse.json({ error: 'Assistant disabled' }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { prompt?: string; aggregatesSummary?: string; currentVisualIds?: string[] };
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
    if (!key) return NextResponse.json({ error: 'XAI_API_KEY missing' }, { status: 500 });

    const catalog = JSON.stringify(DATASET_DESCRIPTIONS);
    const currentVisualIds = body.currentVisualIds || [];
    const fullPrompt = `Dataset catalog: ${catalog}\nUser role: ${session.user.role}\nActive visual IDs: [${currentVisualIds.join(', ')}]\nAggregates context (optional): ${(body.aggregatesSummary || '').slice(0, 2000)}\nUser request: ${prompt}`;

    try {
        console.log('[Grok API] Starting request to https://api.x.ai/v1/chat/completions');
        console.log('[Grok API] Model:', process.env.XAI_MODEL || "grok-beta");
        console.log('[Grok API] System length:', SYSTEM.length, 'Prompt length:', fullPrompt.length);
        
        const startTime = Date.now();
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

        const duration = Date.now() - startTime;
        console.log(`[Grok API] Response received in ${duration}ms with status ${res.status}`);

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[Grok API] HTTP Error: ${errText}`);
            let errObj;
            try { errObj = JSON.parse(errText); } catch { errObj = {}; }
            return NextResponse.json({ error: `Grok API Error: ${errObj.error?.message || res.statusText}`, raw: errText }, { status: res.status });
        }

        const data = await res.json();
        console.log('[Grok API] Raw JSON Response:', JSON.stringify(data).substring(0, 500) + '...');
        
        const text = data?.choices?.[0]?.message?.content;
        if (!text) {
            console.error('[Grok API] Empty text payload! Payload was:', data);
            return NextResponse.json({ error: 'Empty response from Grok', payload: data }, { status: 502 });
        }

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            console.error('[Grok API] JSON parse error on text:', text);
            return NextResponse.json({ error: 'Could not parse response text as JSON', raw: text }, { status: 502 });
        }
        
        const safe = assistantResponseSchema.safeParse(parsed);
        if (!safe.success) {
            console.error('[Grok API] Validation failure!', safe.error.flatten());
            return NextResponse.json({ error: 'Invalid assistant JSON schema returned from Grok', issues: safe.error.flatten(), raw: parsed }, { status: 502 });
        }
        
        console.log('[Grok API] Success!');
        return NextResponse.json(safe.data);
    } catch (e: unknown) {
        console.error('[Grok API] Fatal caught error:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Grok request failed' }, { status: 500 });
    }
}
