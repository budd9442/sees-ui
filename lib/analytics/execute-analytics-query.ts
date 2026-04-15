import 'server-only';

import { auth } from '@/auth';
import { getStaffAnalytics } from '@/lib/actions/staff-subactions';
import { getHODAnalyticsData, getHODTrendsData } from '@/lib/actions/hod-actions';
import { assertDatasetAllowedForRole } from './catalog';
import { analyticsQueryInputSchema, type AnalyticsQueryInput } from './schema';
import { getAnalyticsEnabledOnboardingQuestions } from '@/lib/onboarding/analytics-metadata';

export type AnalyticsQueryResult = {
    columns: string[];
    rows: Record<string, unknown>[];
};

function monthKey(d: Date) {
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

const QUERY_BUDGET_MS = 25_000;

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Analytics query timeout')), ms);
        p.then(
            (v) => {
                clearTimeout(t);
                resolve(v);
            },
            (e) => {
                clearTimeout(t);
                reject(e);
            }
        );
    });
}

export async function executeAnalyticsQuery(raw: unknown): Promise<AnalyticsQueryResult> {
    const started = Date.now();
    const input: AnalyticsQueryInput = analyticsQueryInputSchema.parse(raw);
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    const role = session.user.role;

    assertDatasetAllowedForRole(input.datasetId, role);

    const f = input.filters ?? {};
    const groupBy = input.groupBy ?? 'none';

    const result = await withTimeout(
        (async (): Promise<AnalyticsQueryResult> => {
            switch (input.datasetId) {
                case 'staff_module_grades': {
                    const modules = await getStaffAnalytics({
                        academicYearId: f.academicYearId,
                        semesterId: f.semesterId,
                    });
                    if (groupBy === 'pathway') {
                        const map = new Map<string, Record<string, number>>();
                        for (const m of modules) {
                            if (f.moduleId && m.id !== f.moduleId) continue;
                            for (const g of m.grades) {
                                const p = g.studentPathway || 'Unknown';
                                if (!map.has(p)) map.set(p, {});
                                const row = map.get(p)!;
                                row[g.letterGrade] = (row[g.letterGrade] ?? 0) + 1;
                            }
                        }
                        const rows: Record<string, unknown>[] = [];
                        for (const [pathway, letters] of map) {
                            const total_count = Object.values(letters).reduce((a, b) => a + b, 0);
                            rows.push({ pathway, total_count });
                        }
                        return { columns: ['pathway', 'total_count'], rows };
                    }
                    const byLetter: Record<string, number> = {};
                    for (const m of modules) {
                        if (f.moduleId && m.id !== f.moduleId) continue;
                        for (const g of m.grades) {
                            byLetter[g.letterGrade] = (byLetter[g.letterGrade] ?? 0) + 1;
                        }
                    }
                    const rows = Object.entries(byLetter).map(([letter_grade, count]) => ({
                        letter_grade,
                        count,
                    }));
                    return { columns: ['letter_grade', 'count'], rows };
                }
                case 'hod_student_summary': {
                    const data = await getHODAnalyticsData({
                        pathway: f.pathway,
                        level: f.level,
                        metadataKey: f.metadataKey,
                        metadataValue: f.metadataValue,
                    });
                    const analyticsQuestions = await getAnalyticsEnabledOnboardingQuestions();
                    const metadataKeys = analyticsQuestions.map((q) => q.key);
                    if (groupBy === 'pathway') {
                        const map = new Map<string, { n: number; sumGpa: number }>();
                        for (const s of data.students) {
                            const p = s.specialization;
                            const cur = map.get(p) ?? { n: 0, sumGpa: 0 };
                            cur.n += 1;
                            cur.sumGpa += s.currentGPA;
                            map.set(p, cur);
                        }
                        const rows = [...map.entries()].map(([pathway, v]) => ({
                            pathway,
                            student_count: v.n,
                            avg_gpa: v.n ? Math.round((v.sumGpa / v.n) * 100) / 100 : 0,
                        }));
                        return { columns: ['pathway', 'student_count', 'avg_gpa'], rows };
                    }
                    if (groupBy === 'level') {
                        const map = new Map<string, { n: number; sumGpa: number }>();
                        for (const s of data.students) {
                            const lv = s.academicYear;
                            const cur = map.get(lv) ?? { n: 0, sumGpa: 0 };
                            cur.n += 1;
                            cur.sumGpa += s.currentGPA;
                            map.set(lv, cur);
                        }
                        const rows = [...map.entries()].map(([level, v]) => ({
                            level,
                            student_count: v.n,
                            avg_gpa: v.n ? Math.round((v.sumGpa / v.n) * 100) / 100 : 0,
                        }));
                        return { columns: ['level', 'student_count', 'avg_gpa'], rows };
                    }
                    if (groupBy === 'metadata') {
                        const key = f.metadataKey?.trim();
                        if (!key) {
                            return { columns: ['metadata_value', 'student_count', 'avg_gpa'], rows: [] };
                        }
                        const map = new Map<string, { n: number; sumGpa: number }>();
                        for (const s of data.students) {
                            const value = (s.analyticsMetadata?.[key] ?? 'Unspecified') || 'Unspecified';
                            const cur = map.get(value) ?? { n: 0, sumGpa: 0 };
                            cur.n += 1;
                            cur.sumGpa += s.currentGPA;
                            map.set(value, cur);
                        }
                        const rows = [...map.entries()].map(([metadata_value, v]) => ({
                            metadata_value,
                            student_count: v.n,
                            avg_gpa: v.n ? Math.round((v.sumGpa / v.n) * 100) / 100 : 0,
                        }));
                        return { columns: ['metadata_value', 'student_count', 'avg_gpa'], rows };
                    }
                    const rows = data.students.map((s) => ({
                        student_id: s.id,
                        name: s.name,
                        gpa: s.currentGPA,
                        pathway: s.specialization,
                        level: s.academicYear,
                        ...Object.fromEntries(metadataKeys.map((k) => [k, s.analyticsMetadata?.[k] ?? ''])),
                    }));
                    return {
                        columns: ['student_id', 'name', 'gpa', 'pathway', 'level', ...metadataKeys],
                        rows,
                    };
                }
                case 'hod_module_grades': {
                    const data = await getHODAnalyticsData({
                        pathway: f.pathway,
                        level: f.level,
                    });
                    const modMap = new Map<string, { title: string; code: string; points: number[] }>();
                    for (const m of data.modules) {
                        modMap.set(m.id, { title: m.title, code: m.code, points: [] });
                    }
                    for (const g of data.grades) {
                        if (!g.isReleased) continue;
                        if (!modMap.has(g.moduleId)) continue;
                        modMap.get(g.moduleId)!.points.push(g.points);
                    }
                    const rows = [...modMap.entries()].map(([module_id, v]) => {
                        const n = v.points.length;
                        const avg = n ? v.points.reduce((a, b) => a + b, 0) / n : 0;
                        const pass = n ? v.points.filter((p) => p >= 2).length / n : 0;
                        return {
                            module_id,
                            code: v.code,
                            title: v.title,
                            graded_count: n,
                            avg_grade_point: Math.round(avg * 100) / 100,
                            pass_rate: Math.round(pass * 1000) / 10,
                        };
                    });
                    return {
                        columns: [
                            'module_id',
                            'code',
                            'title',
                            'graded_count',
                            'avg_grade_point',
                            'pass_rate',
                        ],
                        rows,
                    };
                }
                case 'hod_gpa_monthly': {
                    const t = await getHODTrendsData({
                        pathway: f.pathway,
                        level: f.level,
                    });
                    const bucket = new Map<string, { total: number; n: number }>();
                    for (const row of t.history) {
                        const d = new Date(row.calculation_date);
                        const key = monthKey(d);
                        const cur = bucket.get(key) ?? { total: 0, n: 0 };
                        cur.total += row.gpa;
                        cur.n += 1;
                        bucket.set(key, cur);
                    }
                    const rows = [...bucket.entries()]
                        .sort(([a], [b]) => (a < b ? -1 : 1))
                        .map(([month, v]) => ({
                            month,
                            avg_gpa: v.n ? Math.round((v.total / v.n) * 100) / 100 : 0,
                            sample_size: v.n,
                        }));
                    return { columns: ['month', 'avg_gpa', 'sample_size'], rows };
                }
                default:
                    return { columns: [], rows: [] };
            }
        })(),
        QUERY_BUDGET_MS
    );

    const elapsed = Date.now() - started;
    if (elapsed > 10_000) {
        console.warn(`[analytics] slow query ${input.datasetId} ${elapsed}ms`);
    }

    return result;
}
