import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@/auth';
import { geminiAssistantResponseSchema } from '@/lib/analytics/schema';
import { isAnalyticsGeminiEnabled } from '@/lib/analytics/feature-env';
import { DATASET_DESCRIPTIONS } from '@/lib/analytics/catalog';

export const runtime = 'nodejs';

const SYSTEM = `You are an analytics assistant for a university SEES app. Reply with JSON only, no markdown.
Schema: { "narrative"?: string, "patch"?: { "updateTitle"?: string, "addVisuals"?: [...], "removeVisualIds"?: [...], "targetPageId"?: string } }
Visual objects must include: id (uuid string), type (kpi|bar|line|area|pie|table|scatter|gauge|matrix), datasetId (staff_module_grades|hod_student_summary|hod_module_grades|hod_gpa_monthly), layout { i, x, y, w, h integers }, optional title, filters, groupBy, encodings.
Encodings optional fields: x, y, category, value, metric (numeric field for kpi/gauge), kpiAggregation (first|sum|avg|min|max), tableColumns (string array column order), pivotRow, pivotCol, pivotValue (three distinct field names for matrix pivot).
Do not invent SQL. Keep patches small (at most 2 addVisuals).`;

export async function POST(req: Request) {
    if (!isAnalyticsGeminiEnabled()) {
        return NextResponse.json({ error: 'Assistant disabled' }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { prompt?: string; aggregatesSummary?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const prompt = (body.prompt || '').trim().slice(0, 4000);
    if (!prompt) {
        return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }

    const key = process.env.GEMINI_API_KEY!;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_ANALYTICS_MODEL || 'gemini-2.0-flash',
        systemInstruction: SYSTEM,
        generationConfig: { responseMimeType: 'application/json' },
    });

    const catalog = JSON.stringify(DATASET_DESCRIPTIONS);
    const result = await model.generateContent(
        `Dataset catalog: ${catalog}\nUser role: ${session.user.role}\nAggregates context (optional): ${(body.aggregatesSummary || '').slice(0, 2000)}\nUser request: ${prompt}`
    );

    const text = result.response.text();
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        return NextResponse.json({ error: 'Model did not return JSON', raw: text.slice(0, 500) }, { status: 502 });
    }

    const safe = geminiAssistantResponseSchema.safeParse(parsed);
    if (!safe.success) {
        return NextResponse.json({ error: 'Invalid assistant JSON', issues: safe.error.flatten() }, { status: 502 });
    }

    return NextResponse.json(safe.data);
}
