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
                // ─────────────────────────── EXISTING DATASETS ───────────────────────────
                case 'staff_module_grades': {
                    // "Staff Module Grades" now fetches all modules regardless of teacher
                    const registrations = await prisma.moduleRegistration.findMany({
                        where: {
                            status: { not: 'DROPPED' },
                            grade: { isNot: null },
                            ...(f.academicYearId ? { semester: { academic_year_id: f.academicYearId } } : {}),
                            ...(f.semesterId ? { semester_id: f.semesterId } : {}),
                            ...(f.moduleId ? { module_id: f.moduleId } : {}),
                        },
                        select: {
                            grade: { select: { letter_grade: true, grade_point: true } },
                            student: {
                                select: {
                                    degree_path: { select: { name: true } },
                                    current_level: true,
                                }
                            },
                        },
                    });

                    if (groupBy === 'pathway') {
                        const map = new Map<string, number>();
                        for (const r of registrations) {
                            const p = r.student.degree_path?.name || 'Unknown';
                            map.set(p, (map.get(p) ?? 0) + 1);
                        }
                        const rows = Array.from(map.entries()).map(([pathway, total_count]) => ({ pathway, total_count }));
                        return { columns: ['pathway', 'total_count'], rows };
                    }

                    const byLetter: Record<string, number> = {};
                    for (const r of registrations) {
                        const letter = r.grade?.letter_grade || '—';
                        byLetter[letter] = (byLetter[letter] ?? 0) + 1;
                    }

                    const rows = Object.entries(byLetter).map(([letter_grade, count]) => ({ letter_grade, count }));
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
                        if (!key) return { columns: ['metadata_value', 'student_count', 'avg_gpa'], rows: [] };
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
                    return { columns: ['student_id', 'name', 'gpa', 'pathway', 'level', ...metadataKeys], rows };
                }

                case 'hod_module_grades': {
                    const data = await getHODAnalyticsData({ pathway: f.pathway, level: f.level });
                    const modMap = new Map<string, { title: string; code: string; points: number[] }>();
                    for (const m of data.modules) modMap.set(m.id, { title: m.title, code: m.code, points: [] });
                    for (const g of data.grades) {
                        if (!g.isReleased || !modMap.has(g.moduleId)) continue;
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
                    return { columns: ['module_id', 'code', 'title', 'graded_count', 'avg_grade_point', 'pass_rate'], rows };
                }

                case 'hod_gpa_monthly': {
                    const t = await getHODTrendsData({ pathway: f.pathway, level: f.level });
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

                // ─────────────────────────── NEW ADMIN DATASETS ───────────────────────────

                case 'admin_enrollment_trends': {
                    const students = await prisma.student.findMany({
                        where: {
                            ...(f.enrollmentStatus ? { enrollment_status: f.enrollmentStatus } : {}),
                            ...(f.programId ? { degree_path_id: f.programId } : {}),
                        },
                        select: {
                            admission_year: true,
                            current_level: true,
                            enrollment_status: true,
                        },
                    });

                    if (groupBy === 'level') {
                        const map = new Map<string, number>();
                        for (const s of students) {
                            const k = s.current_level ?? 'Unknown';
                            map.set(k, (map.get(k) ?? 0) + 1);
                        }
                        const rows = [...map.entries()].map(([level, student_count]) => ({ level, student_count }));
                        return { columns: ['level', 'student_count'], rows };
                    }
                    if (groupBy === 'enrollment_status') {
                        const map = new Map<string, number>();
                        for (const s of students) {
                            const k = s.enrollment_status ?? 'Unknown';
                            map.set(k, (map.get(k) ?? 0) + 1);
                        }
                        const rows = [...map.entries()].map(([enrollment_status, student_count]) => ({ enrollment_status, student_count }));
                        return { columns: ['enrollment_status', 'student_count'], rows };
                    }
                    // Default: by admission year
                    const map = new Map<number, number>();
                    for (const s of students) {
                        map.set(s.admission_year, (map.get(s.admission_year) ?? 0) + 1);
                    }
                    const rows = [...map.entries()]
                        .sort(([a], [b]) => a - b)
                        .map(([admission_year, student_count]) => ({ admission_year: String(admission_year), student_count }));
                    return { columns: ['admission_year', 'student_count'], rows };
                }

                case 'admin_gpa_distribution': {
                    const students = await prisma.student.findMany({
                        where: {
                            ...(f.programId ? { degree_path_id: f.programId } : {}),
                            ...(f.level ? { current_level: f.level } : {}),
                            ...(f.admissionYear ? { admission_year: f.admissionYear } : {}),
                        },
                        select: { current_gpa: true },
                    });

                    const bucketMap = new Map<string, number>();
                    const ORDER = [
                        '3.5 – 4.0 (Dean\'s List)',
                        '3.0 – 3.5 (Good)',
                        '2.5 – 3.0 (Satisfactory)',
                        '2.0 – 2.5 (Passing)',
                        '1.5 – 2.0 (Warning)',
                        '1.0 – 1.5 (Probation)',
                        '0.0 – 1.0 (Critical)',
                    ];
                    for (const b of ORDER) bucketMap.set(b, 0);
                    for (const s of students) {
                        const b = gpaBucket(s.current_gpa);
                        bucketMap.set(b, (bucketMap.get(b) ?? 0) + 1);
                    }
                    const rows = ORDER.map((gpa_range) => ({
                        gpa_range,
                        student_count: bucketMap.get(gpa_range) ?? 0,
                    }));
                    return { columns: ['gpa_range', 'student_count'], rows };
                }

                case 'admin_module_performance': {
                    const modules = await prisma.module.findMany({
                        where: {
                            active: true,
                            ...(f.academicYearId ? { academic_year_id: f.academicYearId } : {}),
                            ...(f.moduleId ? { module_id: f.moduleId } : {}),
                        },
                        include: {
                            grades: {
                                where: { released_at: { not: null } },
                                select: { grade_point: true, letter_grade: true },
                            },
                        },
                    });

                    const rows = modules.map((m) => {
                        const n = m.grades.length;
                        const avg = n ? m.grades.reduce((s, g) => s + g.grade_point, 0) / n : 0;
                        const pass = n ? m.grades.filter((g) => g.grade_point >= 2.0).length : 0;
                        const fail = n - pass;
                        return {
                            module_code: m.code,
                            module_name: m.name,   // Module model uses 'name' not 'title'
                            level: m.level,
                            credits: m.credits,
                            graded_count: n,
                            avg_grade_point: Math.round(avg * 100) / 100,
                            pass_count: pass,
                            fail_count: fail,
                            pass_rate: n ? Math.round((pass / n) * 1000) / 10 : 0,
                        };
                    }).filter((r) => r.graded_count > 0);

                    return {
                        columns: ['module_code', 'module_name', 'level', 'credits', 'graded_count', 'avg_grade_point', 'pass_count', 'fail_count', 'pass_rate'],
                        rows,
                    };
                }

                case 'admin_pass_fail_by_program': {
                    const students = await prisma.student.findMany({
                        where: {
                            ...(f.level ? { current_level: f.level } : {}),
                        },
                        select: {
                            current_gpa: true,
                            degree_path: { select: { name: true, code: true } },
                        },
                    });

                    const map = new Map<string, { name: string; pass: number; fail: number }>();
                    for (const s of students) {
                        const code = s.degree_path?.code ?? 'Unknown';
                        const name = s.degree_path?.name ?? 'Unknown';
                        const cur = map.get(code) ?? { name, pass: 0, fail: 0 };
                        if (s.current_gpa >= 2.0) cur.pass++;
                        else cur.fail++;
                        map.set(code, cur);
                    }
                    const rows = [...map.entries()].map(([program_code, v]) => ({
                        program_code,
                        program_name: v.name,
                        pass_count: v.pass,
                        fail_count: v.fail,
                        total: v.pass + v.fail,
                        pass_rate: (v.pass + v.fail) > 0
                            ? Math.round((v.pass / (v.pass + v.fail)) * 1000) / 10
                            : 0,
                    }));
                    return { columns: ['program_code', 'program_name', 'pass_count', 'fail_count', 'total', 'pass_rate'], rows };
                }

                case 'admin_student_metadata': {
                    const analyticsQuestions = await getAnalyticsEnabledOnboardingQuestions();
                    const metadataKeys = analyticsQuestions.map((q) => q.key);

                    const students = await prisma.student.findMany({
                        where: {
                            ...(f.level ? { current_level: f.level } : {}),
                            ...(f.programId ? { degree_path_id: f.programId } : {}),
                        },
                        select: {
                            student_id: true,
                            current_gpa: true,
                            current_level: true,
                            metadata: true,
                            degree_path: { select: { name: true } },
                        },
                    });

                    const key = f.metadataKey?.trim();
                    if (!key) {
                        // Return onboarding question catalog
                        const rows = analyticsQuestions.map((q) => ({
                            metadata_key: q.key,
                            question_label: q.label ?? q.key,
                            type: q.type ?? 'text',
                        }));
                        return { columns: ['metadata_key', 'question_label', 'type'], rows };
                    }

                    if (groupBy === 'metadata') {
                        const map = new Map<string, { n: number; sumGpa: number }>();
                        for (const s of students) {
                            const meta = (s.metadata && typeof s.metadata === 'object') ? s.metadata as Record<string, unknown> : {};
                            const val = String(meta[key] ?? 'Unspecified') || 'Unspecified';
                            const cur = map.get(val) ?? { n: 0, sumGpa: 0 };
                            cur.n++;
                            cur.sumGpa += s.current_gpa;
                            map.set(val, cur);
                        }
                        const rows = [...map.entries()]
                            .sort(([, a], [, b]) => b.n - a.n)
                            .map(([metadata_value, v]) => ({
                                metadata_value,
                                student_count: v.n,
                                avg_gpa: v.n ? Math.round((v.sumGpa / v.n) * 100) / 100 : 0,
                            }));
                        return { columns: ['metadata_value', 'student_count', 'avg_gpa'], rows };
                    }

                    // Row-level data with all metadata fields
                    const rows = students.map((s) => {
                        const meta = (s.metadata && typeof s.metadata === 'object') ? s.metadata as Record<string, unknown> : {};
                        return {
                            student_id: s.student_id,
                            gpa: s.current_gpa,
                            level: s.current_level ?? '',
                            program: s.degree_path?.name ?? '',
                            ...Object.fromEntries(metadataKeys.map((k) => [k, String(meta[k] ?? '')])),
                        };
                    });
                    return { columns: ['student_id', 'gpa', 'level', 'program', ...metadataKeys], rows };
                }

                case 'admin_grade_heatmap': {
                    const grades = await prisma.grade.findMany({
                        where: {
                            released_at: { not: null },
                        },
                        select: {
                            letter_grade: true,
                            module: { select: { code: true, academic_year_id: true } },
                        },
                        take: 5000,
                    });

                    const filteredGrades = f.academicYearId
                        ? grades.filter((g) => g.module.academic_year_id === f.academicYearId)
                        : grades;

                    const matrix = new Map<string, Map<string, number>>();
                    const allLetters = new Set<string>();
                    for (const g of filteredGrades) {
                        const code = g.module.code;
                        const letter = g.letter_grade;
                        allLetters.add(letter);
                        if (!matrix.has(code)) matrix.set(code, new Map());
                        const row = matrix.get(code)!;
                        row.set(letter, (row.get(letter) ?? 0) + 1);
                    }

                    const letters = [...allLetters].sort();
                    const rows = [...matrix.entries()].map(([module_code, counts]) => {
                        const r: Record<string, unknown> = { module_code };
                        for (const l of letters) r[l] = counts.get(l) ?? 0;
                        return r;
                    });
                    return { columns: ['module_code', ...letters], rows };
                }

                case 'admin_internship_stats': {
                    const internships = await prisma.internship.findMany({
                        select: {
                            status: true,
                            company: true,
                            role: true,
                        },
                    });

                    if (groupBy === 'internship_status') {
                        const map = new Map<string, number>();
                        for (const i of internships) {
                            map.set(i.status, (map.get(i.status) ?? 0) + 1);
                        }
                        const rows = [...map.entries()].map(([status, count]) => ({ status, count }));
                        return { columns: ['status', 'count'], rows };
                    }

                    // Company diversity
                    const companyMap = new Map<string, number>();
                    for (const i of internships) {
                        companyMap.set(i.company, (companyMap.get(i.company) ?? 0) + 1);
                    }
                    const rows = [...companyMap.entries()]
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 25)
                        .map(([company, student_count]) => ({ company, student_count }));
                    return { columns: ['company', 'student_count'], rows };
                }

                case 'admin_academic_goals': {
                    const goals = await prisma.academicGoal.findMany({
                        select: {
                            goal_type: true,
                            status: true,
                            progress: true,
                            priority: true,
                        },
                    });

                    if (groupBy === 'goal_type') {
                        const map = new Map<string, { total: number; achieved: number; sumProgress: number }>();
                        for (const g of goals) {
                            const cur = map.get(g.goal_type) ?? { total: 0, achieved: 0, sumProgress: 0 };
                            cur.total++;
                            if (g.status === 'ACHIEVED') cur.achieved++;
                            cur.sumProgress += g.progress;
                            map.set(g.goal_type, cur);
                        }
                        const rows = [...map.entries()].map(([goal_type, v]) => ({
                            goal_type,
                            total_goals: v.total,
                            achieved_count: v.achieved,
                            achievement_rate: v.total ? Math.round((v.achieved / v.total) * 1000) / 10 : 0,
                            avg_progress: v.total ? Math.round(v.sumProgress / v.total) : 0,
                        }));
                        return { columns: ['goal_type', 'total_goals', 'achieved_count', 'achievement_rate', 'avg_progress'], rows };
                    }

                    // Status breakdown
                    const statusMap = new Map<string, number>();
                    for (const g of goals) {
                        statusMap.set(g.status, (statusMap.get(g.status) ?? 0) + 1);
                    }
                    const rows = [...statusMap.entries()].map(([status, count]) => ({ status, count }));
                    return { columns: ['status', 'count'], rows };
                }

                case 'admin_gpa_by_admission_year': {
                    const students = await prisma.student.findMany({
                        where: {
                            ...(f.programId ? { degree_path_id: f.programId } : {}),
                            ...(f.level ? { current_level: f.level } : {}),
                        },
                        select: {
                            admission_year: true,
                            current_gpa: true,
                            current_level: true,
                        },
                    });

                    const map = new Map<string, { sumGpa: number; n: number }>();
                    for (const s of students) {
                        const key = String(s.admission_year);
                        const cur = map.get(key) ?? { sumGpa: 0, n: 0 };
                        cur.sumGpa += s.current_gpa;
                        cur.n++;
                        map.set(key, cur);
                    }
                    const rows = [...map.entries()]
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([admission_year, v]) => ({
                            admission_year,
                            avg_gpa: v.n ? Math.round((v.sumGpa / v.n) * 100) / 100 : 0,
                            student_count: v.n,
                        }));
                    return { columns: ['admission_year', 'avg_gpa', 'student_count'], rows };
                }

                case 'admin_at_risk_students': {
                    const threshold = f.gpaMax ?? 2.0;
                    const students = await prisma.student.findMany({
                        where: {
                            current_gpa: { lt: threshold },
                            enrollment_status: f.enrollmentStatus ?? 'ENROLLED',
                            ...(f.level ? { current_level: f.level } : {}),
                            ...(f.programId ? { degree_path_id: f.programId } : {}),
                        },
                        select: {
                            student_id: true,
                            current_gpa: true,
                            current_level: true,
                            admission_year: true,
                            academic_class: true,
                            degree_path: { select: { name: true, code: true } },
                            user: { select: { firstName: true, lastName: true, email: true } },
                        },
                        orderBy: { current_gpa: 'asc' },
                        take: 200,
                    });

                    const rows = students.map((s) => ({
                        student_id: s.student_id,
                        name: `${s.user.firstName} ${s.user.lastName}`,
                        email: s.user.email,
                        gpa: s.current_gpa,
                        level: s.current_level ?? '',
                        program: s.degree_path?.name ?? '',
                        admission_year: s.admission_year,
                        academic_class: s.academic_class ?? '',
                    }));
                    return { columns: ['student_id', 'name', 'email', 'gpa', 'level', 'program', 'admission_year', 'academic_class'], rows };
                }

                case 'admin_ranking_trends': {
                    const rankings = await prisma.ranking.findMany({
                        select: {
                            rank: true,
                            gpa: true,
                            weighted_average: true,
                            created_at: true,
                            student: {
                                select: {
                                    current_level: true,
                                    degree_path: { select: { name: true } },
                                },
                            },
                        },
                        orderBy: { created_at: 'asc' },
                    });

                    if (groupBy === 'level') {
                        const map = new Map<string, { sumGpa: number; sumRank: number; n: number }>();
                        for (const r of rankings) {
                            const lv = r.student.current_level ?? 'Unknown';
                            const cur = map.get(lv) ?? { sumGpa: 0, sumRank: 0, n: 0 };
                            cur.sumGpa += r.gpa;
                            cur.sumRank += r.rank;
                            cur.n++;
                            map.set(lv, cur);
                        }
                        const rows = [...map.entries()].map(([level, v]) => ({
                            level,
                            avg_gpa: v.n ? Math.round((v.sumGpa / v.n) * 100) / 100 : 0,
                            avg_rank: v.n ? Math.round(v.sumRank / v.n) : 0,
                            student_count: v.n,
                        }));
                        return { columns: ['level', 'avg_gpa', 'avg_rank', 'student_count'], rows };
                    }

                    const rows = rankings.slice(0, 100).map((r) => ({
                        rank: r.rank,
                        gpa: r.gpa,
                        weighted_average: Math.round(r.weighted_average * 100) / 100,
                        level: r.student.current_level ?? '',
                        program: r.student.degree_path?.name ?? '',
                    }));
                    return { columns: ['rank', 'gpa', 'weighted_average', 'level', 'program'], rows };
                }

                case 'admin_module_yearly_trend': {
                    if (!f.moduleId) return { columns: ['academic_year', 'graded_count', 'avg_grade_point', 'pass_rate'], rows: [] };
                    const baseModule = await prisma.module.findUnique({ where: { module_id: f.moduleId }, select: { code: true } });
                    if (!baseModule) return { columns: ['academic_year', 'graded_count', 'avg_grade_point', 'pass_rate'], rows: [] };
                    const modules = await prisma.module.findMany({
                        where: { code: baseModule.code },
                        include: {
                            academic_year: true,
                            grades: { where: { released_at: { not: null } }, select: { grade_point: true } },
                        },
                    });
                    const rows = modules
                        .map((m) => {
                            const n = m.grades.length;
                            const avg = n ? m.grades.reduce((a, b) => a + b.grade_point, 0) / n : 0;
                            const pass = n ? m.grades.filter((g) => g.grade_point >= 2).length / n : 0;
                            return {
                                academic_year: m.academic_year.label,
                                graded_count: n,
                                avg_grade_point: Math.round(avg * 100) / 100,
                                pass_rate: Math.round(pass * 1000) / 10,
                            };
                        })
                        .sort((a, b) => a.academic_year.localeCompare(b.academic_year));
                    return { columns: ['academic_year', 'graded_count', 'avg_grade_point', 'pass_rate'], rows };
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
