import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { assistantResponseSchema } from '@/lib/analytics/schema';
import { isAnalyticsGeminiEnabled } from '@/lib/analytics/feature-env';
import { DATASET_DESCRIPTIONS } from '@/lib/analytics/catalog';

export const runtime = 'nodejs';

const SYSTEM = `You are an AI Analytics Expert for the university SEES platform.
Your task is to help users visualize institutional data. Respond ONLY with valid JSON.
Output Schema: { "narrative"?: string, "patch"?: { "updateTitle"?: string, "addVisuals"?: Visual[], "removeVisualIds"?: string[] } }

Available Datasets (datasetId):
- staff_module_grades: Global Grade Distribution [letter_grade, count]
- hod_student_summary: Student List & GPA [student_id, name, gpa, pathway, level]
- hod_module_grades: Module Performance overview [code, title, avg_grade_point, pass_rate]
- hod_gpa_monthly: GPA Trend [month, avg_gpa, sample_size]
- admin_enrollment_trends: Student counts [admission_year, level, enrollment_status, student_count]
- admin_gpa_distribution: Histogram data [gpa_range, student_count]
- admin_module_performance: Performance stats [code, title, graded_count, avg_grade_point, pass_rate]
- admin_pass_fail_by_program: Success rates [program_name, pass_count, fail_count, pass_rate]
- admin_student_metadata: Survey/Question insights [question, answer, student_count]
- admin_grade_heatmap: Cross-tab [module_code, letter_grade, student_count]
- admin_internship_stats: Career data [company, intern_count, hired_count]
- admin_academic_goals: Goal progress [goal_type, met_count, unmet_count]
- admin_gpa_by_admission_year: Cohort GPA [admission_year, avg_gpa, student_count]
- admin_at_risk_students: Probations [name, gpa, level]
- admin_ranking_trends: Leaderboards [rank, gpa, weighted_average, level, program]
- admin_module_yearly_trend: History [academic_year, graded_count, avg_grade_point, pass_rate]

Visual Types: kpi, bar, line, area, pie, donut, table, scatter, gauge, radar, matrix.
Layout: x (0-11), y, w (1-12), h.
Encodings: Use field names from the dataset. For KPI/Gauge, use 'metric'. For charts, use 'x', 'y' or 'category', 'value'.
Filters: academicYearId, semesterId, programId, level, moduleId, gpaAbove, gpaBelow, minCredits, maxCredits, enrollmentStatus.

Keep patches helpful and concise. If adding visuals, ensure they fit neatly.`;

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

    const key = process.env.XAI_API_KEY!;
    if (!key) return NextResponse.json({ error: 'XAI_API_KEY missing' }, { status: 500 });

    const catalog = JSON.stringify(DATASET_DESCRIPTIONS);
    const fullPrompt = `Dataset catalog: ${catalog}\nUser role: ${session.user.role}\nAggregates context (optional): ${(body.aggregatesSummary || '').slice(0, 2000)}\nUser request: ${prompt}`;

    try {
        const res = await fetch("https://api.x.ai/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`
            },
            body: JSON.stringify({
                model: process.env.XAI_MODEL || "grok-beta",
                input: `${SYSTEM}\n\n${fullPrompt}`
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({ error: `Grok API Error: ${err.error?.message || res.statusText}` }, { status: res.status });
        }

        const data = await res.json();
        const text = data?.output?.[0]?.content?.[0]?.text;
        if (!text) return NextResponse.json({ error: 'Empty response from Grok' }, { status: 502 });

        const parsed = JSON.parse(text);
        const safe = assistantResponseSchema.safeParse(parsed);
        if (!safe.success) {
            return NextResponse.json({ error: 'Invalid assistant JSON', issues: safe.error.flatten() }, { status: 502 });
        }
        return NextResponse.json(safe.data);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Grok request failed' }, { status: 500 });
    }
}
