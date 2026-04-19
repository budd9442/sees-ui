import 'server-only';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
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

const QUERY_BUDGET_MS = 30_000;

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Analytics query timeout')), ms);
        p.then(
            (v) => { clearTimeout(t); resolve(v); },
            (e) => { clearTimeout(t); reject(e); }
        );
    });
}

/** Bucket a GPA value into 0.5-wide range label */
function gpaBucket(gpa: number): string {
    if (gpa >= 3.5) return '3.5 – 4.0 (Dean\'s List)';
    if (gpa >= 3.0) return '3.0 – 3.5 (Good)';
    if (gpa >= 2.5) return '2.5 – 3.0 (Satisfactory)';
    if (gpa >= 2.0) return '2.0 – 2.5 (Passing)';
    if (gpa >= 1.5) return '1.5 – 2.0 (Warning)';
    if (gpa >= 1.0) return '1.0 – 1.5 (Probation)';
    return '0.0 – 1.0 (Critical)';
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
                // ─────────────────────────── CORE UNIFIED DATASETS ───────────────────────────
                case 'core_student_metrics': {
                    const thresholdMin = f.gpaMin ?? 0.0;
                    const thresholdMax = f.gpaMax ?? 4.0;
                    
                    const analyticsQuestions = await getAnalyticsEnabledOnboardingQuestions();
                    const metadataKeys = analyticsQuestions.map((q) => q.key);

                    const students = await prisma.student.findMany({
                        where: {
                            current_gpa: { gte: thresholdMin, lte: thresholdMax },
                            ...(f.level ? { current_level: f.level } : {}),
                            ...(f.pathway ? { degree_path: { name: { contains: f.pathway, mode: 'insensitive' } } } : {}),
                            ...(f.programId ? { degree_path_id: f.programId } : {}),
                            ...(f.enrollmentStatus ? { enrollment_status: f.enrollmentStatus } : {}),
                            ...(f.graduationStatus ? { graduation_status: f.graduationStatus } : {}),
                            ...(f.admissionYear ? { admission_year: f.admissionYear } : {}),
                        },
                        select: {
                            student_id: true,
                            current_gpa: true,
                            current_level: true,
                            admission_year: true,
                            academic_class: true,
                            enrollment_status: true,
                            graduation_status: true,
                            metadata: true,
                            degree_path: { select: { name: true, code: true } },
                            user: { select: { firstName: true, lastName: true, email: true } },
                        },
                    });

                    const groupByField = (s: any): string | null => {
                        if (groupBy === 'level') return s.current_level ?? 'Unknown';
                        if (groupBy === 'pathway' || groupBy === 'program') return s.degree_path?.name ?? 'Unknown';
                        if (groupBy === 'admission_year') return String(s.admission_year);
                        if (groupBy === 'enrollment_status') return s.enrollment_status ?? 'Unknown';
                        if (groupBy === 'academic_class') return s.academic_class ?? 'Unknown';
                        if (groupBy === 'gpa_bucket') return gpaBucket(s.current_gpa);
                        if (groupBy === 'metadata') {
                            const key = f.metadataKey?.trim();
                            if (!key) return null;
                            const meta = (s.metadata && typeof s.metadata === 'object') ? s.metadata : {};
                            return String(meta[key] ?? 'Unspecified') || 'Unspecified';
                        }
                        return null;
                    };

                    if (groupBy !== 'none') {
                        const map = new Map<string, Acc>();
                        for (const s of students) {
                            const val = groupByField(s);
                            if (val === null) continue;
                            const cur = map.get(val) ?? { n: 0, sumGpa: 0 };
                            cur.n++;
                            cur.sumGpa += s.current_gpa;
                            map.set(val, cur);
                        }
                        const groupKey = groupBy === 'program' ? 'pathway' : groupBy;
                        const rows = [...map.entries()].map(([key, v]) => ({
                            [groupKey]: key,
                            student_count: v.n,
                            avg_gpa: v.n ? Math.round((v.sumGpa / v.n) * 100) / 100 : 0,
                        }));
                        return { columns: [groupKey, 'student_count', 'avg_gpa'], rows };
                    }

                    const rows = students.map((s) => {
                        const meta = (s.metadata && typeof s.metadata === 'object') ? s.metadata as Record<string, unknown> : {};
                        return {
                            student_id: s.student_id,
                            name: `${s.user.firstName} ${s.user.lastName}`,
                            email: s.user.email,
                            gpa: s.current_gpa,
                            level: s.current_level ?? '',
                            program: s.degree_path?.name ?? '',
                            admission_year: s.admission_year,
                            academic_class: s.academic_class ?? '',
                            enrollment_status: s.enrollment_status ?? '',
                            graduation_status: s.graduation_status ?? '',
                            ...Object.fromEntries(metadataKeys.map((k) => [k, String(meta[k] ?? '')])),
                        };
                    });
                    return { columns: ['student_id', 'name', 'email', 'gpa', 'level', 'program', 'admission_year', 'academic_class', 'enrollment_status', 'graduation_status', ...metadataKeys], rows };
                }

                case 'core_audit_logs': {
                    const logs = await prisma.auditLog.findMany({
                        where: {
                            ...(f.status ? { action: f.status } : {}), // reusing status for action type in logs
                            ...(f.metadataKey ? { category: f.metadataKey } : {}),
                        },
                        orderBy: { timestamp: 'desc' },
                        take: 500
                    });

                    if (groupBy === 'status' || groupBy === 'category') {
                        const map = new Map<string, number>();
                        for (const l of logs) {
                            const key = groupBy === 'status' ? l.action : l.category;
                            map.set(key, (map.get(key) ?? 0) + 1);
                        }
                        const rows = [...map.entries()].map(([key, count]) => ({ [groupBy]: key, count }));
                        return { columns: [groupBy, 'count'], rows };
                    }

                    const rows = logs.map(l => ({
                        log_id: l.log_id,
                        action: l.action,
                        category: l.category,
                        timestamp: l.timestamp,
                        ip: l.ip_address,
                        entity: `${l.entity_type}:${l.entity_id}`
                    }));
                    return { columns: ['log_id', 'action', 'category', 'timestamp', 'ip', 'entity'], rows };
                }

                case 'core_system_health': {
                    const metrics = await prisma.systemMetric.findMany({
                        orderBy: { timestamp: 'desc' },
                        take: 100
                    });

                    if (groupBy === 'month') {
                        const map = new Map<string, { n: number, cpu: number, mem: number }>();
                        for (const m of metrics) {
                            const key = monthKey(m.timestamp);
                            const cur = map.get(key) ?? { n: 0, cpu: 0, mem: 0 };
                            cur.n++;
                            cur.cpu += m.cpu;
                            cur.mem += m.memory;
                            map.set(key, cur);
                        }
                        const rows = [...map.entries()].map(([key, v]) => ({
                            month: key,
                            avg_cpu: Math.round(v.cpu / v.n),
                            avg_memory: Math.round(v.mem / v.n)
                        }));
                        return { columns: ['month', 'avg_cpu', 'avg_memory'], rows };
                    }

                    const rows = metrics.map(m => ({
                        timestamp: m.timestamp,
                        cpu: m.cpu,
                        memory: m.memory,
                        active_users: m.active_users,
                        health_score: m.health
                    }));
                    return { columns: ['timestamp', 'cpu', 'memory', 'active_users', 'health_score'], rows };
                }

                case 'core_module_metrics': {
                    const modules = await prisma.module.findMany({
                        where: {
                            active: true,
                            ...(f.academicYearId ? { academic_year_id: f.academicYearId } : {}),
                            ...(f.moduleId ? { module_id: f.moduleId } : {}),
                            ...(f.level ? { level: f.level } : {}),
                        },
                        include: {
                            academic_year: true,
                            grades: {
                                where: { released_at: { not: null } },
                                select: { grade_point: true, letter_grade: true },
                            },
                        },
                    });

                    type Acc = { nModules: number; nGrades: number; sumPoints: number; passCount: number; failCount: number };
                    const groupByField = (m: any): string | null => {
                        if (groupBy === 'level') return m.level ?? 'Unknown';
                        if (groupBy === 'academic_year') return m.academic_year?.label ?? 'Unknown';
                        return null;
                    };

                    if (groupBy !== 'none' && groupBy !== 'module') {
                        const map = new Map<string, Acc>();
                        for (const m of modules) {
                            const val = groupByField(m);
                            if (val === null) continue;
                            const cur = map.get(val) ?? { nModules: 0, nGrades: 0, sumPoints: 0, passCount: 0, failCount: 0 };
                            cur.nModules++;
                            for (const g of m.grades) {
                                cur.nGrades++;
                                cur.sumPoints += g.grade_point;
                                if (g.grade_point >= 2.0) cur.passCount++; else cur.failCount++;
                            }
                            map.set(val, cur);
                        }
                        const rows = [...map.entries()].map(([key, v]) => ({
                            [groupBy]: key,
                            module_count: v.nModules,
                            graded_count: v.nGrades,
                            avg_grade_point: v.nGrades ? Math.round((v.sumPoints / v.nGrades) * 100) / 100 : 0,
                            pass_count: v.passCount,
                            fail_count: v.failCount,
                            pass_rate: v.nGrades ? Math.round((v.passCount / v.nGrades) * 1000) / 10 : 0,
                        }));
                        return { columns: [groupBy, 'module_count', 'graded_count', 'avg_grade_point', 'pass_count', 'fail_count', 'pass_rate'], rows };
                    }

                    const rows = modules.map((m) => {
                        const n = m.grades.length;
                        const sumPoints = n ? m.grades.reduce((s, g) => s + g.grade_point, 0) : 0;
                        const pass = n ? m.grades.filter((g) => g.grade_point >= 2.0).length : 0;
                        return {
                            module_code: m.code,
                            module_name: m.name,
                            level: m.level,
                            credits: m.credits,
                            academic_year: m.academic_year?.label ?? '',
                            graded_count: n,
                            avg_grade_point: n ? Math.round((sumPoints / n) * 100) / 100 : 0,
                            pass_count: pass,
                            fail_count: n - pass,
                            pass_rate: n ? Math.round((pass / n) * 1000) / 10 : 0,
                        };
                    });
                    return { columns: ['module_code', 'module_name', 'level', 'credits', 'academic_year', 'graded_count', 'avg_grade_point', 'pass_count', 'fail_count', 'pass_rate'], rows };
                }

                case 'core_grade_distribution': {
                    const grades = await prisma.grade.findMany({
                        where: {
                            released_at: { not: null },
                            module: {
                                active: true,
                                ...(f.academicYearId ? { academic_year_id: f.academicYearId } : {}),
                                ...(f.moduleId ? { module_id: f.moduleId } : {}),
                            },
                        },
                        select: {
                            letter_grade: true,
                            grade_point: true,
                            module: { select: { code: true } },
                            student: { select: { current_level: true, degree_path: { select: { name: true } } } },
                        },
                    });

                    type Acc = { count: number; sumPoints: number };
                    const groupByField = (g: any): string | null => {
                        if (groupBy === 'letter_grade') return g.letter_grade ?? 'Unknown';
                        if (groupBy === 'module') return g.module.code ?? 'Unknown';
                        if (groupBy === 'level') return g.student.current_level ?? 'Unknown';
                        if (groupBy === 'pathway' || groupBy === 'program') return g.student.degree_path?.name ?? 'Unknown';
                        return null;
                    };

                    if (groupBy !== 'none') {
                        const map = new Map<string, Acc>();
                        for (const g of grades) {
                            const val = groupByField(g);
                            if (val === null) continue;
                            const cur = map.get(val) ?? { count: 0, sumPoints: 0 };
                            cur.count++;
                            cur.sumPoints += g.grade_point;
                            map.set(val, cur);
                        }
                        const groupKey = groupBy === 'program' ? 'pathway' : groupBy;
                        const rows = [...map.entries()].map(([key, v]) => ({
                            [groupKey]: key,
                            count: v.count,
                            avg_grade_point: v.count ? Math.round((v.sumPoints / v.count) * 100) / 100 : 0,
                        }));
                        return { columns: [groupKey, 'count', 'avg_grade_point'], rows };
                    }

                    // Return raw grades (limited)
                    const rows = grades.slice(0, 1000).map((g) => ({
                        letter_grade: g.letter_grade ?? '',
                        grade_point: g.grade_point,
                        module_code: g.module.code,
                        level: g.student.current_level ?? '',
                        pathway: g.student.degree_path?.name ?? '',
                    }));
                    return { columns: ['letter_grade', 'grade_point', 'module_code', 'level', 'pathway'], rows };
                }

                case 'core_career_goals': {
                    const goals = await prisma.academicGoal.findMany({ select: { goal_type: true, status: true, progress: true } });
                    const internships = await prisma.internship.findMany({ select: { status: true, company: true } });

                    if (f.metadataKey === 'internships') {
                        const groupByField = (i: any): string => {
                            if (groupBy === 'status') return i.status ?? 'Unknown';
                            if (groupBy === 'company') return i.company ?? 'Unknown';
                            return i.status ?? 'Unknown';
                        };
                        const map = new Map<string, number>();
                        for (const i of internships) {
                            const val = groupByField(i);
                            map.set(val, (map.get(val) ?? 0) + 1);
                        }
                        const groupKey = groupBy === 'company' ? 'company' : 'status';
                        const rows = [...map.entries()].sort(([,a], [,b]) => b - a).map(([key, count]) => ({ [groupKey]: key, count }));
                        return { columns: [groupKey, 'count'], rows };
                    }

                    // Default: goals
                    type Acc = { total: number; achieved: number; sumProgress: number };
                    const groupByField = (g: any): string => {
                        if (groupBy === 'status') return g.status ?? 'Unknown';
                        if (groupBy === 'goal_type') return g.goal_type ?? 'Unknown';
                        return g.goal_type ?? 'Unknown';
                    };
                    const map = new Map<string, Acc>();
                    for (const g of goals) {
                        const val = groupByField(g);
                        const cur = map.get(val) ?? { total: 0, achieved: 0, sumProgress: 0 };
                        cur.total++;
                        if (g.status === 'ACHIEVED') cur.achieved++;
                        cur.sumProgress += g.progress;
                        map.set(val, cur);
                    }
                    const groupKey = groupBy === 'status' ? 'status' : 'goal_type';
                    const rows = [...map.entries()].map(([key, v]) => ({
                        [groupKey]: key,
                        total_goals: v.total,
                        achieved_count: v.achieved,
                        achievement_rate: v.total ? Math.round((v.achieved / v.total) * 1000) / 10 : 0,
                        avg_progress: v.total ? Math.round(v.sumProgress / v.total) : 0,
                    }));
                    return { columns: [groupKey, 'total_goals', 'achieved_count', 'achievement_rate', 'avg_progress'], rows };
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
