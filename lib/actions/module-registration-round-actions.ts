'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { levelsOverlap, studentMatchesRoundLevels } from '@/lib/module-registration-round-utils';
import { isWithinRegistrationWindow, MODULE_REGISTRATION_WINDOW_COPY } from '@/lib/registration-time-window';
import { notifyModuleRegistrationWindowOpened } from '@/lib/notifications/window-opened';

export type ModuleRegistrationRoundStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FINALIZED';

async function requireHodOrAdmin(): Promise<{ userId: string } | null> {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user?.id || (role !== 'hod' && role !== 'admin')) return null;
    return { userId: session.user.id as string };
}

function isWithinWindow(opens_at: Date | null, closes_at: Date | null, now: Date): { ok: true } | { ok: false; message: string } {
    return isWithinRegistrationWindow(opens_at, closes_at, now, MODULE_REGISTRATION_WINDOW_COPY);
}

/** Present after `npx prisma generate` with the current schema; otherwise null at runtime. */
function moduleRegistrationRoundTable(): any {
    return (prisma as unknown as { moduleRegistrationRound?: unknown }).moduleRegistrationRound ?? null;
}

// ─── HOD / admin ─────────────────────────────────────────────

export async function listModuleRegistrationRounds() {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const mrr = moduleRegistrationRoundTable();
        if (!mrr) {
            console.error('listModuleRegistrationRounds: Prisma client missing moduleRegistrationRound — run `npx prisma generate`');
            return {
                success: false,
                error: 'Server is missing module registration support. Run `npx prisma generate` and redeploy.',
            };
        }
        const rounds = await mrr.findMany({
            include: { academic_year: { select: { label: true, active: true } } },
            orderBy: { created_at: 'desc' },
        });
        return { success: true, data: rounds };
    } catch (e) {
        console.error('listModuleRegistrationRounds', e);
        return { success: false, error: 'Failed to list rounds' };
    }
}

export async function getModuleRegistrationRound(roundId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const mrr = moduleRegistrationRoundTable();
        if (!mrr) {
            console.error('getModuleRegistrationRound: run `npx prisma generate`');
            return { success: false, error: 'Server configuration error (Prisma client).' };
        }
        const round = await mrr.findUnique({
            where: { round_id: roundId },
            include: { academic_year: true },
        });
        if (!round) return { success: false, error: 'Round not found' };
        return { success: true, data: round };
    } catch (e) {
        console.error('getModuleRegistrationRound', e);
        return { success: false, error: 'Failed to load round' };
    }
}

export async function createModuleRegistrationRound(data: {
    academic_year_id: string;
    label: string;
    levels: string[];
    opens_at?: Date | null;
    closes_at?: Date | null;
    notes?: string | null;
    student_message?: string | null;
}) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const mrr = moduleRegistrationRoundTable();
        if (!mrr) {
            return { success: false, error: 'Server configuration error (Prisma client).' };
        }
        const round = await mrr.create({
            data: {
                academic_year_id: data.academic_year_id,
                label: data.label,
                levels: data.levels ?? [],
                opens_at: data.opens_at ?? null,
                closes_at: data.closes_at ?? null,
                notes: data.notes ?? null,
                student_message: data.student_message ?? null,
                status: 'DRAFT',
            },
        });
        revalidatePath('/dashboard/hod/module-registration');
        return { success: true, data: round };
    } catch (e) {
        console.error('createModuleRegistrationRound', e);
        return { success: false, error: 'Failed to create round' };
    }
}

export async function updateModuleRegistrationRoundMeta(
    roundId: string,
    data: Partial<{
        label: string;
        levels: string[];
        opens_at: Date | null;
        closes_at: Date | null;
        notes: string | null;
        student_message: string | null;
        features: object | null;
    }>
) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const mrr = moduleRegistrationRoundTable();
        if (!mrr) {
            return { success: false, error: 'Server configuration error (Prisma client).' };
        }
        const existing = await mrr.findUnique({ where: { round_id: roundId } });
        if (!existing) return { success: false, error: 'Round not found' };
        if (existing.status === 'FINALIZED') {
            return { success: false, error: 'Cannot edit a finalized round.' };
        }
        const round = await mrr.update({
            where: { round_id: roundId },
            data: {
                ...(data.label !== undefined ? { label: data.label } : {}),
                ...(data.levels !== undefined ? { levels: data.levels } : {}),
                ...(data.opens_at !== undefined ? { opens_at: data.opens_at } : {}),
                ...(data.closes_at !== undefined ? { closes_at: data.closes_at } : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
                ...(data.student_message !== undefined ? { student_message: data.student_message } : {}),
                ...(data.features !== undefined ? { features: data.features as object } : {}),
            },
        });
        revalidatePath('/dashboard/hod/module-registration');
        return { success: true, data: round };
    } catch (e) {
        console.error('updateModuleRegistrationRoundMeta', e);
        return { success: false, error: 'Failed to update round' };
    }
}

async function assertNoOpenConflict(
    academicYearId: string,
    levels: string[],
    excludeRoundId?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
    const mrr = moduleRegistrationRoundTable();
    if (!mrr) {
        return { ok: false, error: 'Server configuration error (Prisma client).' };
    }
    const openOthers = await mrr.findMany({
        where: {
            academic_year_id: academicYearId,
            status: 'OPEN',
            ...(excludeRoundId ? { round_id: { not: excludeRoundId } } : {}),
        },
    });
    for (const o of openOthers) {
        if (levelsOverlap(o.levels, levels)) {
            return {
                ok: false,
                error: 'Another open round already covers overlapping levels for this academic year. Close it first.',
            };
        }
    }
    return { ok: true };
}

export async function openModuleRegistrationRound(roundId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const mrr = moduleRegistrationRoundTable();
        if (!mrr) {
            return { success: false, error: 'Server configuration error (Prisma client).' };
        }
        const r = await mrr.findUnique({ where: { round_id: roundId } });
        if (!r) return { success: false, error: 'Round not found' };
        if (r.status !== 'DRAFT' && r.status !== 'CLOSED') {
            return { success: false, error: 'Only draft or closed rounds can be opened.' };
        }
        if (!r.closes_at) {
            return {
                success: false,
                error: 'Set a closing date before opening this round. After that time, students cannot change module selections.',
            };
        }
        const conflict = await assertNoOpenConflict(r.academic_year_id, r.levels, roundId);
        if (!conflict.ok) return { success: false, error: conflict.error };
        const updated = await mrr.update({
            where: { round_id: roundId },
            data: { status: 'OPEN' },
        });
        void notifyModuleRegistrationWindowOpened(roundId).catch((err) =>
            console.error('notifyModuleRegistrationWindowOpened', err)
        );
        revalidatePath('/dashboard/hod/module-registration');
        revalidatePath('/dashboard/student/modules');
        return { success: true, data: updated };
    } catch (e) {
        console.error('openModuleRegistrationRound', e);
        return { success: false, error: 'Failed to open round' };
    }
}

export async function closeModuleRegistrationRound(roundId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const mrr = moduleRegistrationRoundTable();
        if (!mrr) {
            return { success: false, error: 'Server configuration error (Prisma client).' };
        }
        const r = await mrr.findUnique({ where: { round_id: roundId } });
        if (!r) return { success: false, error: 'Round not found' };
        if (r.status !== 'OPEN') {
            return { success: false, error: 'Only open rounds can be closed.' };
        }
        const updated = await mrr.update({
            where: { round_id: roundId },
            data: { status: 'CLOSED' },
        });
        revalidatePath('/dashboard/hod/module-registration');
        revalidatePath('/dashboard/student/modules');
        return { success: true, data: updated };
    } catch (e) {
        console.error('closeModuleRegistrationRound', e);
        return { success: false, error: 'Failed to close round' };
    }
}

export type ModuleRegistrationRoundSnapshot = {
    round: {
        round_id: string;
        label: string;
        status: string;
        levels: string[];
        opens_at: string | null;
        closes_at: string | null;
        finalized_at: string | null;
        notes: string | null;
        student_message: string | null;
    };
    academic_year_label: string;
    semesters: { semester_id: string; label: string }[];
    summary: {
        totalRegistrations: number;
        uniqueStudents: number;
        byLevel: Record<string, { registrations: number; students: number }>;
        byModule: {
            module_id: string;
            code: string;
            name: string;
            credits: number;
            total: number;
            byLevel: Record<string, number>;
        }[];
    };
    rows: {
        reg_id: string;
        student_id: string;
        email: string;
        firstName: string;
        lastName: string;
        current_level: string;
        module_code: string;
        module_name: string;
        module_id: string;
        semester_label: string;
        semester_id: string;
        credits: number;
        status: string;
        registration_date: string;
    }[];
};

/**
 * Full registration picture for the round's academic year, filtered to students whose
 * level matches the round (empty round levels = all levels). HOD/admin only.
 */
export async function getModuleRegistrationRoundSnapshot(
    roundId: string
): Promise<{ success: true; data: ModuleRegistrationRoundSnapshot } | { success: false; error: string }> {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const mrr = moduleRegistrationRoundTable();
        if (!mrr) {
            return { success: false, error: 'Server configuration error (Prisma client).' };
        }
        const round = await mrr.findUnique({
            where: { round_id: roundId },
            include: { academic_year: { select: { label: true } } },
        });
        if (!round) return { success: false, error: 'Round not found' };

        const levels = (round.levels as string[]) ?? [];

        const semesters = await prisma.semester.findMany({
            where: { academic_year_id: round.academic_year_id },
            select: { semester_id: true, label: true },
            orderBy: { start_date: 'asc' },
        });
        const semesterIds = semesters.map(s => s.semester_id);

        if (semesterIds.length === 0) {
            const empty: ModuleRegistrationRoundSnapshot = {
                round: {
                    round_id: round.round_id,
                    label: round.label,
                    status: round.status,
                    levels,
                    opens_at: round.opens_at ? (round.opens_at as Date).toISOString() : null,
                    closes_at: round.closes_at ? (round.closes_at as Date).toISOString() : null,
                    finalized_at: round.finalized_at ? (round.finalized_at as Date).toISOString() : null,
                    notes: round.notes ?? null,
                    student_message: round.student_message ?? null,
                },
                academic_year_label: (round as { academic_year?: { label: string } }).academic_year?.label ?? '',
                semesters: [],
                summary: {
                    totalRegistrations: 0,
                    uniqueStudents: 0,
                    byLevel: {},
                    byModule: [],
                },
                rows: [],
            };
            return { success: true, data: empty };
        }

        const regs = await prisma.moduleRegistration.findMany({
            where: {
                semester_id: { in: semesterIds },
                status: { not: 'DROPPED' },
            },
            include: {
                module: { select: { module_id: true, code: true, name: true, credits: true } },
                semester: { select: { semester_id: true, label: true } },
                student: {
                    select: {
                        student_id: true,
                        current_level: true,
                        user: { select: { firstName: true, lastName: true, email: true } },
                    },
                },
            },
            orderBy: [{ registration_date: 'desc' }],
        });

        const filtered = regs.filter(r => studentMatchesRoundLevels(levels, r.student?.current_level));

        type LevelAgg = { registrationCount: number; studentIds: Set<string> };
        const byLevel: Record<string, LevelAgg> = {};
        const byModule = new Map<
            string,
            { code: string; name: string; credits: number; total: number; byLevel: Record<string, number> }
        >();

        for (const r of filtered) {
            const lvl = r.student?.current_level || 'Unknown';
            if (!byLevel[lvl]) byLevel[lvl] = { registrationCount: 0, studentIds: new Set() };
            byLevel[lvl].registrationCount++;
            byLevel[lvl].studentIds.add(r.student_id);

            const mid = r.module_id;
            if (!byModule.has(mid)) {
                byModule.set(mid, {
                    code: r.module.code,
                    name: r.module.name,
                    credits: r.module.credits ?? 0,
                    total: 0,
                    byLevel: {},
                });
            }
            const mm = byModule.get(mid)!;
            mm.total++;
            mm.byLevel[lvl] = (mm.byLevel[lvl] || 0) + 1;
        }

        const byLevelOut: ModuleRegistrationRoundSnapshot['summary']['byLevel'] = {};
        for (const [k, v] of Object.entries(byLevel)) {
            byLevelOut[k] = { registrations: v.registrationCount, students: v.studentIds.size };
        }

        const byModuleOut = [...byModule.entries()]
            .map(([module_id, v]) => ({
                module_id,
                code: v.code,
                name: v.name,
                credits: v.credits,
                total: v.total,
                byLevel: v.byLevel,
            }))
            .sort((a, b) => a.code.localeCompare(b.code));

        const rows: ModuleRegistrationRoundSnapshot['rows'] = filtered.map(r => ({
            reg_id: r.reg_id,
            student_id: r.student_id,
            email: r.student?.user?.email ?? '',
            firstName: r.student?.user?.firstName ?? '',
            lastName: r.student?.user?.lastName ?? '',
            current_level: r.student?.current_level ?? '',
            module_code: r.module.code,
            module_name: r.module.name,
            module_id: r.module_id,
            semester_label: r.semester.label,
            semester_id: r.semester_id,
            credits: r.module.credits ?? 0,
            status: r.status,
            registration_date: (r.registration_date as Date).toISOString(),
        }));

        const data: ModuleRegistrationRoundSnapshot = {
            round: {
                round_id: round.round_id,
                label: round.label,
                status: round.status,
                levels,
                opens_at: round.opens_at ? (round.opens_at as Date).toISOString() : null,
                closes_at: round.closes_at ? (round.closes_at as Date).toISOString() : null,
                finalized_at: round.finalized_at ? (round.finalized_at as Date).toISOString() : null,
                notes: round.notes ?? null,
                student_message: round.student_message ?? null,
            },
            academic_year_label: (round as { academic_year?: { label: string } }).academic_year?.label ?? '',
            semesters: semesters.map(s => ({ semester_id: s.semester_id, label: s.label })),
            summary: {
                totalRegistrations: filtered.length,
                uniqueStudents: new Set(filtered.map(r => r.student_id)).size,
                byLevel: byLevelOut,
                byModule: byModuleOut,
            },
            rows,
        };

        return { success: true, data };
    } catch (e) {
        console.error('getModuleRegistrationRoundSnapshot', e);
        return { success: false, error: 'Failed to build registration snapshot' };
    }
}

export async function finalizeModuleRegistrationRound(roundId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const mrr = moduleRegistrationRoundTable();
        if (!mrr) {
            return { success: false, error: 'Server configuration error (Prisma client).' };
        }
        const r = await mrr.findUnique({ where: { round_id: roundId } });
        if (!r) return { success: false, error: 'Round not found' };
        if (r.status !== 'CLOSED') {
            return { success: false, error: 'Close the round before finalizing.' };
        }
        const updated = await mrr.update({
            where: { round_id: roundId },
            data: { status: 'FINALIZED', finalized_at: new Date() },
        });
        revalidatePath('/dashboard/hod/module-registration');
        revalidatePath('/dashboard/student/modules');
        return { success: true, data: updated };
    } catch (e) {
        console.error('finalizeModuleRegistrationRound', e);
        return { success: false, error: 'Failed to finalize round' };
    }
}

// ─── Student ─────────────────────────────────────────────────

export type StudentModuleRegistrationWindow = {
    round: {
        round_id: string;
        label: string;
        status: string;
        opens_at: Date | null;
        closes_at: Date | null;
        student_message: string | null;
        levels: string[];
    } | null;
    windowOk: boolean;
    message?: string;
    canEdit: boolean;
};

/**
 * Resolves whether the student may edit module registrations for the active academic year.
 */
export async function getStudentModuleRegistrationWindow(): Promise<StudentModuleRegistrationWindow> {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user?.id || role !== 'student') {
        return { round: null, windowOk: false, canEdit: false, message: 'Not signed in as a student.' };
    }

    const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
    if (!activeYear) {
        return { round: null, windowOk: false, canEdit: false, message: 'No active academic year.' };
    }

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        select: { current_level: true },
    });
    if (!student) {
        return { round: null, windowOk: false, canEdit: false, message: 'Student profile not found.' };
    }

    const mrr = moduleRegistrationRoundTable();
    if (!mrr) {
        console.error('getStudentModuleRegistrationWindow: Prisma client missing moduleRegistrationRound — run `npx prisma generate`');
        return {
            round: null,
            windowOk: false,
            canEdit: false,
            message:
                'Module registration is temporarily unavailable. The server needs `npx prisma generate` after the last database schema update.',
        };
    }

    const openRounds = await mrr.findMany({
        where: {
            academic_year_id: activeYear.academic_year_id,
            status: 'OPEN',
        },
        orderBy: { created_at: 'desc' },
    });

    const now = new Date();
    type OpenRoundRow = {
        round_id: string;
        label: string;
        status: string;
        opens_at: Date | null;
        closes_at: Date | null;
        student_message: string | null;
        levels: string[];
    };
    const applicableOpen = (openRounds as OpenRoundRow[]).filter(r =>
        studentMatchesRoundLevels(r.levels, student.current_level)
    );

    if (openRounds.length > 0 && applicableOpen.length === 0) {
        return {
            round: null,
            windowOk: false,
            canEdit: false,
            message: 'Module registration is not open for your study level.',
        };
    }

    for (const r of applicableOpen) {
        const w = isWithinWindow(r.opens_at, r.closes_at, now);
        const payload = {
            round_id: r.round_id,
            label: r.label,
            status: r.status,
            opens_at: r.opens_at,
            closes_at: r.closes_at,
            student_message: r.student_message,
            levels: r.levels,
        };
        if (!w.ok) {
            return { round: payload, windowOk: false, canEdit: false, message: w.message };
        }
        return { round: payload, windowOk: true, canEdit: true };
    }

    const anyRound = await mrr.findFirst({
        where: { academic_year_id: activeYear.academic_year_id },
        orderBy: { created_at: 'desc' },
    });

    if (!anyRound) {
        return {
            round: null,
            windowOk: false,
            canEdit: false,
            message: 'Your department has not opened module registration for this year yet.',
        };
    }

    return {
        round: {
            round_id: anyRound.round_id,
            label: anyRound.label,
            status: anyRound.status,
            opens_at: anyRound.opens_at,
            closes_at: anyRound.closes_at,
            student_message: anyRound.student_message,
            levels: anyRound.levels,
        },
        windowOk: false,
        canEdit: false,
        message:
            anyRound.status === 'FINALIZED'
                ? 'Module registration period is not active at the moment.'
                : anyRound.status === 'CLOSED'
                  ? 'The module registration window is closed.'
                  : 'Module registration is not available for your level or the window is not open.',
    };
}
