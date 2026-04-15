'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { isWithinRegistrationWindow, SELECTION_ROUND_WINDOW_COPY } from '@/lib/registration-time-window';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type RoundStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'APPROVED';
export type RoundType = 'PATHWAY' | 'SPECIALIZATION';
export type SelectionMode = 'AUTO' | 'GPA' | 'FREE';

export interface RoundConfig {
    program_id?: string;
    spec_id?: string;
    capacity: number;
    priority?: number;
}

// ─────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────

async function requireHodOrAdmin(): Promise<{ userId: string } | null> {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user?.id || (role !== 'hod' && role !== 'admin')) return null;
    return { userId: session.user.id as string };
}

async function requireStudent(): Promise<{ userId: string } | null> {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user?.id || role !== 'student') return null;
    return { userId: session.user.id as string };
}

function slotIdFromConfig(c: { program_id: string | null; spec_id: string | null }) {
    return c.program_id || c.spec_id || '';
}

function isWithinRoundDates(
    opens_at: Date | null,
    closes_at: Date | null,
    now: Date
): { ok: true } | { ok: false; message: string } {
    return isWithinRegistrationWindow(opens_at, closes_at, now, SELECTION_ROUND_WINDOW_COPY);
}

function computeGraceEndsAt(approved_at: Date | null, graceDays: number): Date | null {
    if (!approved_at || !graceDays || graceDays <= 0) return null;
    const d = new Date(approved_at.getTime());
    d.setDate(d.getDate() + graceDays);
    return d;
}

// ─────────────────────────────────────────────────────────────
// Read actions (HOD / admin)
// ─────────────────────────────────────────────────────────────

export async function getSelectionRounds(academicYearId?: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const where = academicYearId ? { academic_year_id: academicYearId } : {};
        const rounds = await prisma.selectionRound.findMany({
            where,
            include: {
                academic_year: { select: { label: true } },
                configs: {
                    include: {
                        program: { select: { code: true, name: true } },
                        specialization: { select: { code: true, name: true } },
                    }
                },
                _count: { select: { applications: true } },
            },
            orderBy: { created_at: 'desc' },
        });

        return { success: true, data: rounds };
    } catch (error) {
        console.error('getSelectionRounds error:', error);
        return { success: false, error: 'Failed to fetch rounds' };
    }
}

export async function getSelectionRoundDetail(roundId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const round = await prisma.selectionRound.findUnique({
            where: { round_id: roundId },
            include: {
                academic_year: true,
                configs: {
                    include: {
                        program: true,
                        specialization: true,
                    }
                },
                applications: {
                    include: {},
                    orderBy: [{ status: 'asc' }, { gpa_at_time: 'desc' }],
                },
            },
        });

        if (!round) return { success: false, error: 'Round not found' };

        const studentIds = round.applications.map(a => a.student_id);
        const students = await prisma.user.findMany({
            where: { user_id: { in: studentIds } },
            select: {
                user_id: true,
                firstName: true,
                lastName: true,
                email: true,
                student: {
                    select: {
                        current_gpa: true,
                        current_level: true,
                        degree_path: { select: { code: true, name: true } },
                    },
                },
            },
        });

        const studentMap = new Map(students.map(s => [s.user_id, s]));

        const enrichedApps = round.applications.map(app => ({
            ...app,
            student: studentMap.get(app.student_id),
        }));

        const allocationSummary = {
            total: enrichedApps.length,
            allocated: enrichedApps.filter(a => a.status === 'ALLOCATED').length,
            waitlisted: enrichedApps.filter(a => a.status === 'WAITLISTED').length,
            pending: enrichedApps.filter(a => a.status === 'PENDING').length,
            rejected: enrichedApps.filter(a => a.status === 'REJECTED').length,
        };

        const slotStats = round.configs.map(cfg => {
            const id = slotIdFromConfig(cfg);
            const allocated = enrichedApps.filter(a => a.status === 'ALLOCATED' && a.allocated_to === id);
            const waitlisted = enrichedApps.filter(a => a.status === 'WAITLISTED' && a.preference_1 === id);
            const pending = enrichedApps.filter(a => a.status === 'PENDING' && a.preference_1 === id);
            const label = cfg.program?.name || cfg.specialization?.name || 'Unknown';
            const code = cfg.program?.code || cfg.specialization?.code || '';
            const avgGpa = allocated.length > 0
                ? allocated.reduce((s, a) => s + a.gpa_at_time, 0) / allocated.length
                : 0;

            return {
                config_id: cfg.config_id,
                id,
                label,
                code,
                capacity: cfg.capacity,
                allocated: allocated.length,
                waitlisted: waitlisted.length,
                pending: pending.length,
                avgGpa: Number(avgGpa.toFixed(2)),
                viabilityOk: round.type === 'SPECIALIZATION' ? allocated.length >= cfg.capacity : true,
                isFull: round.type === 'PATHWAY' ? allocated.length >= cfg.capacity : false,
            };
        });

        return {
            success: true,
            data: {
                ...round,
                applications: enrichedApps,
                slotStats,
                allocationSummary,
            },
        };
    } catch (error) {
        console.error('getSelectionRoundDetail error:', error);
        return { success: false, error: 'Failed to fetch round detail' };
    }
}

export async function getActiveSelectionRound(type: RoundType) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const round = await prisma.selectionRound.findFirst({
            where: { type, status: { in: ['OPEN', 'CLOSED'] } },
            orderBy: { created_at: 'desc' },
        });
        if (!round) return { success: true, data: null };
        return getSelectionRoundDetail(round.round_id);
    } catch (error) {
        return { success: false, error: 'Failed to fetch active round' };
    }
}

export async function getHODSelectionData() {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized', data: null };
        }

        const academicYears = await prisma.academicYear.findMany({
            orderBy: { start_date: 'desc' },
            select: { academic_year_id: true, label: true, active: true }
        });

        const allRounds = await prisma.selectionRound.findMany({
            include: {
                academic_year: { select: { label: true } },
                configs: {
                    include: {
                        program: { select: { code: true, name: true } },
                        specialization: { select: { code: true, name: true } },
                    }
                },
                _count: { select: { applications: true } },
            },
            orderBy: { created_at: 'desc' },
        });

        const programs = await prisma.degreeProgram.findMany({
            where: { active: true },
            select: { program_id: true, code: true, name: true }
        });
        const specializations = await prisma.specialization.findMany({
            where: { active: true },
            include: { degree_program: { select: { code: true } } }
        });

        const approvedRounds = allRounds.filter(r => r.status === 'APPROVED');

        return {
            success: true,
            data: {
                academicYears,
                allRounds,
                approvedRounds,
                programs,
                specializations,
            }
        };
    } catch (error) {
        console.error('getHODSelectionData error:', error);
        return { success: false, error: 'Failed to load selection data', data: null };
    }
}

// ─────────────────────────────────────────────────────────────
// Insights (HOD / admin)
// ─────────────────────────────────────────────────────────────

export async function getSelectionInsights() {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }

        const approved = await prisma.selectionRound.findMany({
            where: { status: 'APPROVED' },
            include: {
                academic_year: { select: { academic_year_id: true, label: true } },
                applications: {
                    select: {
                        preference_1: true,
                        allocated_to: true,
                        status: true,
                        gpa_at_time: true,
                    },
                },
                configs: {
                    select: {
                        program_id: true,
                        spec_id: true,
                        capacity: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        const yoy = new Map<string, { label: string; pathwayApps: number; specApps: number; rounds: number }>();
        for (const r of approved) {
            const key = r.academic_year_id;
            const label = r.academic_year?.label ?? key;
            const cur = yoy.get(key) ?? { label, pathwayApps: 0, specApps: 0, rounds: 0 };
            cur.rounds += 1;
            const n = r.applications.length;
            if (r.type === 'PATHWAY') cur.pathwayApps += n;
            else cur.specApps += n;
            yoy.set(key, cur);
        }

        const slotAgg = new Map<string, {
            label: string;
            code: string;
            type: RoundType;
            totalAllocated: number;
            totalWaitlisted: number;
            gpaSum: number;
            gpaCount: number;
            rounds: number;
        }>();

        for (const r of approved) {
            const configIds = new Map(r.configs.map(c => [slotIdFromConfig(c), c]));
            for (const app of r.applications) {
                const slot = app.allocated_to || app.preference_1;
                if (!slot) continue;
                const cfg = configIds.get(slot);
                const label = slot;
                const key = `${r.type}:${slot}`;
                const cur = slotAgg.get(key) ?? {
                    label,
                    code: slot.slice(0, 8),
                    type: r.type as RoundType,
                    totalAllocated: 0,
                    totalWaitlisted: 0,
                    gpaSum: 0,
                    gpaCount: 0,
                    rounds: 0,
                };
                if (app.status === 'ALLOCATED' && app.allocated_to) {
                    cur.totalAllocated += 1;
                    cur.gpaSum += app.gpa_at_time;
                    cur.gpaCount += 1;
                }
                if (app.status === 'WAITLISTED') cur.totalWaitlisted += 1;
                cur.rounds += 1;
                if (cfg && r.type === 'PATHWAY') {
                    cur.label = `program:${slot}`;
                }
                slotAgg.set(key, cur);
            }
        }

        const pathwayApproved = approved.filter(r => r.type === 'PATHWAY');
        let waitlistEvents = 0;
        let allocatedPathway = 0;
        for (const r of pathwayApproved) {
            for (const a of r.applications) {
                if (a.status === 'WAITLISTED') waitlistEvents += 1;
                if (a.status === 'ALLOCATED' && a.allocated_to && a.allocated_to !== a.preference_1) {
                    allocatedPathway += 1;
                }
            }
        }

        const gpaBuckets = ['0-2', '2-2.5', '2.5-3', '3-3.5', '3.5-4'] as const;
        const histogram: Record<string, number> = Object.fromEntries(gpaBuckets.map(b => [b, 0]));
        for (const r of approved) {
            for (const a of r.applications) {
                const g = a.gpa_at_time;
                if (g < 2) histogram['0-2'] += 1;
                else if (g < 2.5) histogram['2-2.5'] += 1;
                else if (g < 3) histogram['2.5-3'] += 1;
                else if (g < 3.5) histogram['3-3.5'] += 1;
                else histogram['3.5-4'] += 1;
            }
        }

        const competitive = [...slotAgg.entries()]
            .filter(([, v]) => v.type === 'PATHWAY' && v.totalWaitlisted + v.totalAllocated > 0)
            .map(([k, v]) => ({
                key: k,
                overflowRate: v.totalAllocated > 0 ? v.totalWaitlisted / (v.totalWaitlisted + v.totalAllocated) : 0,
                waitlisted: v.totalWaitlisted,
                allocated: v.totalAllocated,
                avgGpa: v.gpaCount > 0 ? Number((v.gpaSum / v.gpaCount).toFixed(2)) : 0,
            }))
            .sort((a, b) => b.overflowRate - a.overflowRate)
            .slice(0, 8);

        return {
            success: true,
            data: {
                yearOverYear: [...yoy.entries()]
                    .map(([academic_year_id, v]) => ({ academic_year_id, ...v }))
                    .sort((a, b) => a.label.localeCompare(b.label)),
                gpaHistogram: histogram,
                pathwayWaitlistCount: waitlistEvents,
                pathwaySecondChoiceAllocations: allocatedPathway,
                competitivePathways: competitive,
                approvedRoundCount: approved.length,
            },
        };
    } catch (error) {
        console.error('getSelectionInsights error:', error);
        return { success: false, error: 'Failed to load insights' };
    }
}

// ─────────────────────────────────────────────────────────────
// HOD Write Actions
// ─────────────────────────────────────────────────────────────

export async function createSelectionRound(data: {
    academic_year_id: string;
    type: RoundType;
    label: string;
    level: string;
    selection_mode: SelectionMode;
    opens_at?: string;
    closes_at?: string;
    allocation_change_grace_days?: number;
    configs: RoundConfig[];
}) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const round = await prisma.selectionRound.create({
            data: {
                academic_year_id: data.academic_year_id,
                type: data.type,
                label: data.label,
                level: data.level,
                selection_mode: data.selection_mode,
                allocation_change_grace_days: data.allocation_change_grace_days ?? 0,
                opens_at: data.opens_at ? new Date(data.opens_at) : null,
                closes_at: data.closes_at ? new Date(data.closes_at) : null,
                configs: {
                    create: data.configs.map(c => ({
                        program_id: c.program_id || null,
                        spec_id: c.spec_id || null,
                        capacity: c.capacity,
                        priority: c.priority || 0,
                    }))
                }
            }
        });

        revalidatePath('/dashboard/hod/pathways');
        return { success: true, data: round };
    } catch (error) {
        console.error('createSelectionRound error:', error);
        return { success: false, error: 'Failed to create selection round' };
    }
}

export async function updateRoundStatus(roundId: string, status: RoundStatus) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const existing = await prisma.selectionRound.findUnique({
            where: { round_id: roundId },
            select: { status: true, closes_at: true },
        });
        if (!existing) return { success: false, error: 'Round not found' };
        if (existing.status === 'APPROVED' && status !== 'APPROVED') {
            return { success: false, error: 'Cannot change status of an approved round' };
        }
        if (status === 'APPROVED') {
            return {
                success: false,
                error:
                    'Use “Approve & Finalize” on the Pathways live view. That commits allocations to student records; changing status alone does not.',
            };
        }
        if (status === 'OPEN' && !existing.closes_at) {
            return {
                success: false,
                error: 'Set a closing date before opening this round. After that time, students cannot submit or change applications.',
            };
        }

        const updateData: Record<string, unknown> = { status };

        await prisma.selectionRound.update({
            where: { round_id: roundId },
            data: updateData as { status: string; approved_at?: Date },
        });

        revalidatePath('/dashboard/hod/pathways');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update status' };
    }
}

export async function updateSelectionRoundMeta(
    roundId: string,
    data: {
        label?: string;
        selection_mode?: SelectionMode;
        opens_at?: string | null;
        closes_at?: string | null;
        notes?: string | null;
        level?: string;
        allocation_change_grace_days?: number;
    }
) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const round = await prisma.selectionRound.findUnique({
            where: { round_id: roundId },
            select: { status: true },
        });
        if (!round) return { success: false, error: 'Round not found' };
        if (round.status === 'APPROVED') {
            return { success: false, error: 'Cannot edit an approved round' };
        }

        await prisma.selectionRound.update({
            where: { round_id: roundId },
            data: {
                ...(data.label !== undefined ? { label: data.label } : {}),
                ...(data.selection_mode !== undefined ? { selection_mode: data.selection_mode } : {}),
                ...(data.opens_at !== undefined
                    ? { opens_at: data.opens_at ? new Date(data.opens_at) : null }
                    : {}),
                ...(data.closes_at !== undefined
                    ? { closes_at: data.closes_at ? new Date(data.closes_at) : null }
                    : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
                ...(data.level !== undefined ? { level: data.level } : {}),
                ...(data.allocation_change_grace_days !== undefined
                    ? { allocation_change_grace_days: Math.max(0, Math.floor(data.allocation_change_grace_days)) }
                    : {}),
            },
        });

        revalidatePath('/dashboard/hod/pathways');
        return { success: true };
    } catch (error) {
        console.error('updateSelectionRoundMeta error:', error);
        return { success: false, error: 'Failed to update round' };
    }
}

export async function updateRoundConfigs(roundId: string, configs: (RoundConfig & { config_id?: string })[]) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const round = await prisma.selectionRound.findUnique({
            where: { round_id: roundId },
            select: { status: true },
        });
        if (!round) return { success: false, error: 'Round not found' };
        if (round.status === 'APPROVED') {
            return { success: false, error: 'Cannot edit configs on an approved round' };
        }

        await prisma.$transaction([
            prisma.selectionRoundConfig.deleteMany({ where: { round_id: roundId } }),
            prisma.selectionRoundConfig.createMany({
                data: configs.map(c => ({
                    round_id: roundId,
                    program_id: c.program_id || null,
                    spec_id: c.spec_id || null,
                    capacity: c.capacity,
                    priority: c.priority || 0,
                }))
            })
        ]);

        revalidatePath('/dashboard/hod/pathways');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update configs' };
    }
}

// ─────────────────────────────────────────────────────────────
// Pathway allocation: capacity-triggered (AUTO)
// ─────────────────────────────────────────────────────────────
// When demand for a slot (1st or 2nd choice) is at or below capacity, order is
// FIFO (applied_at). When demand exceeds capacity, that slot uses GPA order.

type AllocApp = {
    app_id: string;
    preference_1: string;
    preference_2: string | null;
    gpa_at_time: number;
    applied_at: Date;
};

function sortFifo(a: AllocApp, b: AllocApp) {
    const t = a.applied_at.getTime() - b.applied_at.getTime();
    if (t !== 0) return t;
    return a.app_id.localeCompare(b.app_id);
}

function sortGpa(a: AllocApp, b: AllocApp) {
    const g = b.gpa_at_time - a.gpa_at_time;
    if (g !== 0) return g;
    return a.app_id.localeCompare(b.app_id);
}

function allocatePathwayCapacityTriggered(
    applications: AllocApp[],
    configs: { program_id: string | null; spec_id: string | null; capacity: number }[],
): { app_id: string; status: string; allocated_to: string | null; waitlist_pos: number | null }[] {
    const configMap = new Map(configs.map(c => [slotIdFromConfig(c), c]));
    const row = new Map<string, { status: string; allocated_to: string | null; waitlist_pos: number | null }>();
    const pending = new Set<string>();

    for (const app of applications) {
        if (!configMap.has(app.preference_1)) {
            row.set(app.app_id, { status: 'REJECTED', allocated_to: null, waitlist_pos: null });
        } else {
            pending.add(app.app_id);
        }
    }

    const slotCounts = new Map<string, number>();
    const countAt = (sid: string) => slotCounts.get(sid) || 0;
    const inc = (sid: string) => slotCounts.set(sid, countAt(sid) + 1);

    const byPref1 = new Map<string, AllocApp[]>();
    for (const app of applications) {
        if (!pending.has(app.app_id)) continue;
        const sid = app.preference_1;
        if (!byPref1.has(sid)) byPref1.set(sid, []);
        byPref1.get(sid)!.push(app);
    }

    for (const [slotId, pool] of byPref1) {
        const cfg = configMap.get(slotId);
        if (!cfg) continue;
        const cap = cfg.capacity;
        if (pool.length <= cap) {
            const ordered = [...pool].sort(sortFifo);
            for (const app of ordered) {
                row.set(app.app_id, { status: 'ALLOCATED', allocated_to: slotId, waitlist_pos: null });
                inc(slotId);
                pending.delete(app.app_id);
            }
        } else {
            const ordered = [...pool].sort(sortGpa);
            for (const app of ordered.slice(0, cap)) {
                row.set(app.app_id, { status: 'ALLOCATED', allocated_to: slotId, waitlist_pos: null });
                inc(slotId);
                pending.delete(app.app_id);
            }
        }
    }

    const byPref2 = new Map<string, AllocApp[]>();
    for (const app of applications) {
        if (!pending.has(app.app_id)) continue;
        const p2 = app.preference_2;
        if (!p2 || !configMap.has(p2)) continue;
        if (!byPref2.has(p2)) byPref2.set(p2, []);
        byPref2.get(p2)!.push(app);
    }

    for (const [slotId, pool] of byPref2) {
        const cfg = configMap.get(slotId);
        if (!cfg) continue;
        const used = countAt(slotId);
        let remaining = cfg.capacity - used;
        if (remaining <= 0) continue;

        const candidates = pool.filter(a => pending.has(a.app_id));
        if (candidates.length <= remaining) {
            const ordered = [...candidates].sort(sortFifo);
            for (const app of ordered) {
                row.set(app.app_id, { status: 'ALLOCATED', allocated_to: slotId, waitlist_pos: null });
                inc(slotId);
                pending.delete(app.app_id);
                remaining--;
            }
        } else {
            const ordered = [...candidates].sort(sortGpa);
            for (const app of ordered.slice(0, remaining)) {
                row.set(app.app_id, { status: 'ALLOCATED', allocated_to: slotId, waitlist_pos: null });
                inc(slotId);
                pending.delete(app.app_id);
            }
        }
    }

    const waitlistCounters = new Map<string, number>();
    const byWait = new Map<string, AllocApp[]>();
    for (const app of applications) {
        if (!pending.has(app.app_id)) continue;
        const sid = app.preference_1;
        if (!byWait.has(sid)) byWait.set(sid, []);
        byWait.get(sid)!.push(app);
    }
    for (const [slotId, pool] of byWait) {
        const ordered = [...pool].sort(sortGpa);
        for (const app of ordered) {
            const wPos = (waitlistCounters.get(slotId) || 0) + 1;
            waitlistCounters.set(slotId, wPos);
            row.set(app.app_id, { status: 'WAITLISTED', allocated_to: null, waitlist_pos: wPos });
            pending.delete(app.app_id);
        }
    }

    return applications.map(app => {
        const u = row.get(app.app_id);
        if (!u) return { app_id: app.app_id, status: 'REJECTED', allocated_to: null, waitlist_pos: null };
        return { app_id: app.app_id, ...u };
    });
}

function allocatePathwayLegacy(
    applications: AllocApp[],
    configs: { program_id: string | null; spec_id: string | null; capacity: number }[],
    mode: 'GPA' | 'FREE',
): { app_id: string; status: string; allocated_to: string | null; waitlist_pos: number | null }[] {
    const sorted = [...applications].sort((a, b) => (mode === 'FREE' ? sortFifo(a, b) : sortGpa(a, b)));
    const configMap = new Map(configs.map(c => [slotIdFromConfig(c), c]));
    const slotCounts = new Map<string, number>();
    const updates: { app_id: string; status: string; allocated_to: string | null; waitlist_pos: number | null }[] = [];
    const waitlistCounters = new Map<string, number>();

    for (const app of sorted) {
        const slotId = app.preference_1;
        const cfg = configMap.get(slotId);
        if (!cfg) {
            updates.push({ app_id: app.app_id, status: 'REJECTED', allocated_to: null, waitlist_pos: null });
            continue;
        }

        const currentCount = slotCounts.get(slotId) || 0;
        if (currentCount < cfg.capacity) {
            slotCounts.set(slotId, currentCount + 1);
            updates.push({ app_id: app.app_id, status: 'ALLOCATED', allocated_to: slotId, waitlist_pos: null });
        } else {
            const pref2 = app.preference_2;
            const cfg2 = pref2 ? configMap.get(pref2) : null;
            const count2 = pref2 ? (slotCounts.get(pref2) || 0) : Infinity;

            if (cfg2 && count2 < cfg2.capacity) {
                slotCounts.set(pref2!, count2 + 1);
                updates.push({ app_id: app.app_id, status: 'ALLOCATED', allocated_to: pref2!, waitlist_pos: null });
            } else {
                const wPos = (waitlistCounters.get(slotId) || 0) + 1;
                waitlistCounters.set(slotId, wPos);
                updates.push({ app_id: app.app_id, status: 'WAITLISTED', allocated_to: null, waitlist_pos: wPos });
            }
        }
    }
    return updates;
}

function allocateSpecialization(
    applications: AllocApp[],
    configs: { program_id: string | null; spec_id: string | null; capacity: number }[],
    mode: 'AUTO' | 'GPA' | 'FREE',
): { app_id: string; status: string; allocated_to: string | null; waitlist_pos: number | null }[] {
    const sorted = [...applications].sort((a, b) => (mode === 'FREE' ? sortFifo(a, b) : sortGpa(a, b)));
    const configMap = new Map(configs.map(c => [slotIdFromConfig(c), c]));
    const slotCounts = new Map<string, number>();
    const updates: { app_id: string; status: string; allocated_to: string | null; waitlist_pos: number | null }[] = [];

    for (const app of sorted) {
        const slotId = app.preference_1;
        const cfg = configMap.get(slotId);
        if (!cfg) {
            updates.push({ app_id: app.app_id, status: 'REJECTED', allocated_to: null, waitlist_pos: null });
            continue;
        }
        const currentCount = slotCounts.get(slotId) || 0;
        slotCounts.set(slotId, currentCount + 1);
        updates.push({ app_id: app.app_id, status: 'ALLOCATED', allocated_to: slotId, waitlist_pos: null });
    }
    return updates;
}

// ─────────────────────────────────────────────────────────────
// Auto-allocation (AUTO / GPA / FREE)
// ─────────────────────────────────────────────────────────────

export async function runGPAAllocation(roundId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const roundFetched = await prisma.selectionRound.findUnique({
            where: { round_id: roundId },
            include: {
                configs: true,
                applications: true,
            },
        });
        if (!roundFetched) return { success: false, error: 'Round not found' };
        if (roundFetched.status !== 'CLOSED') {
            return { success: false, error: 'Round must be closed before running allocation' };
        }

        const mode = roundFetched.selection_mode as SelectionMode;
        const roundType = String(roundFetched.type ?? '').toUpperCase();
        const apps: AllocApp[] = roundFetched.applications.map(a => ({
            app_id: a.app_id,
            preference_1: a.preference_1,
            preference_2: a.preference_2,
            gpa_at_time: a.gpa_at_time,
            applied_at: a.applied_at,
        }));

        let updates: { app_id: string; status: string; allocated_to: string | null; waitlist_pos: number | null }[];

        if (roundType === 'PATHWAY') {
            if (mode === 'AUTO') {
                updates = allocatePathwayCapacityTriggered(apps, roundFetched.configs);
            } else if (mode === 'FREE') {
                updates = allocatePathwayLegacy(apps, roundFetched.configs, 'FREE');
            } else {
                updates = allocatePathwayLegacy(apps, roundFetched.configs, 'GPA');
            }
        } else {
            updates = allocateSpecialization(apps, roundFetched.configs, mode === 'FREE' ? 'FREE' : mode === 'AUTO' ? 'AUTO' : 'GPA');
        }

        await prisma.$transaction(
            updates.map(u =>
                prisma.selectionApplication.update({
                    where: { app_id: u.app_id },
                    data: { status: u.status, allocated_to: u.allocated_to, waitlist_pos: u.waitlist_pos }
                })
            )
        );

        revalidatePath('/dashboard/hod/pathways');
        return {
            success: true,
            summary: {
                allocated: updates.filter(u => u.status === 'ALLOCATED').length,
                waitlisted: updates.filter(u => u.status === 'WAITLISTED').length
            }
        };
    } catch (error) {
        console.error('runGPAAllocation error:', error);
        return { success: false, error: 'Allocation engine failed' };
    }
}

// ─────────────────────────────────────────────────────────────
// HOD Approval — Commits Allocations to Student Records
// ─────────────────────────────────────────────────────────────

export async function approveSelectionRound(roundId: string, forceApprove = false) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const round = await prisma.selectionRound.findUnique({
            where: { round_id: roundId },
            include: { configs: true, applications: true }
        });
        if (!round) return { success: false, error: 'Round not found' };
        if (round.status !== 'CLOSED') {
            return { success: false, error: 'Round must be closed before approval' };
        }

        const roundType = String(round.type ?? '').toUpperCase();

        if (roundType === 'SPECIALIZATION' && !forceApprove) {
            const warnings: string[] = [];
            const specConfigMap = new Map(round.configs.map(c => [c.spec_id || '', c]));
            for (const [specId, cfg] of specConfigMap.entries()) {
                if (!specId) continue;
                const count = round.applications.filter(a => a.status === 'ALLOCATED' && a.allocated_to === specId).length;
                if (count < cfg.capacity) {
                    const spec = await prisma.specialization.findUnique({ where: { specialization_id: specId }, select: { name: true } });
                    warnings.push(`${spec?.name || specId}: only ${count} students (min threshold: ${cfg.capacity})`);
                }
            }
            if (warnings.length > 0) {
                return { success: false, needsForce: true as const, warnings };
            }
        }

        const allocated = round.applications.filter(a => a.status === 'ALLOCATED' && a.allocated_to);
        const waitlisted = round.applications.filter(a => a.status === 'WAITLISTED');

        await prisma.$transaction(async (tx) => {
            for (const app of allocated) {
                if (roundType === 'PATHWAY') {
                    await tx.student.update({
                        where: { student_id: app.student_id },
                        data: {
                            degree_path_id: app.allocated_to!,
                            pathway_locked: true,
                            pathway_selection_date: new Date(),
                        }
                    });
                } else {
                    await tx.student.update({
                        where: { student_id: app.student_id },
                        data: { specialization_id: app.allocated_to! }
                    });
                }
            }

            const slotCounts = new Map<string, number>();
            for (const app of allocated) {
                const k = app.allocated_to!;
                slotCounts.set(k, (slotCounts.get(k) || 0) + 1);
            }
            const configBySlot = new Map(round.configs.map(c => [slotIdFromConfig(c), c]));

            for (const app of waitlisted.sort((a, b) => (a.waitlist_pos || 99) - (b.waitlist_pos || 99))) {
                const pref2 = app.preference_2;
                const cfg2 = pref2 ? configBySlot.get(pref2) : null;
                const count2 = pref2 ? (slotCounts.get(pref2) || 0) : Infinity;

                if (cfg2 && count2 < cfg2.capacity) {
                    slotCounts.set(pref2!, count2 + 1);
                    await tx.selectionApplication.update({
                        where: { app_id: app.app_id },
                        data: { status: 'ALLOCATED', allocated_to: pref2!, waitlist_pos: null }
                    });
                    if (roundType === 'PATHWAY') {
                        await tx.student.update({
                            where: { student_id: app.student_id },
                            data: { degree_path_id: pref2!, pathway_locked: true, pathway_selection_date: new Date() }
                        });
                    } else {
                        await tx.student.update({
                            where: { student_id: app.student_id },
                            data: { specialization_id: pref2! }
                        });
                    }
                }
            }

            await tx.selectionRound.update({
                where: { round_id: roundId },
                data: { status: 'APPROVED', approved_at: new Date() }
            });
        });

        revalidatePath('/dashboard/hod/pathways');
        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('approveSelectionRound error:', error);
        return { success: false, error: 'Approval failed' };
    }
}

/**
 * Copy each student's approved pathway allocation onto `Student.degree_path_id`
 * (official record). Use after a pathway round is already APPROVED if records were
 * never updated or need to be reconciled.
 */
export async function commitApprovedPathwayAllocationsToStudents(roundId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const round = await prisma.selectionRound.findUnique({
            where: { round_id: roundId },
            include: { configs: true, applications: true },
        });
        if (!round) return { success: false, error: 'Round not found' };
        const roundType = String(round.type ?? '').toUpperCase();
        if (roundType !== 'PATHWAY') {
            return { success: false, error: 'Only pathway rounds use degree program records' };
        }
        if (round.status !== 'APPROVED') {
            return { success: false, error: 'Round must be approved first' };
        }

        const allowedSlots = new Set(
            round.configs.map(c => slotIdFromConfig(c)).filter(Boolean)
        );
        const allocated = round.applications.filter(
            a => a.status === 'ALLOCATED' && a.allocated_to && allowedSlots.has(a.allocated_to)
        );
        if (allocated.length === 0) {
            return { success: true, updated: 0 };
        }

        const selectionDate = round.approved_at ?? new Date();

        await prisma.$transaction(
            allocated.map(app =>
                prisma.student.update({
                    where: { student_id: app.student_id },
                    data: {
                        degree_path_id: app.allocated_to!,
                        pathway_locked: true,
                        pathway_selection_date: selectionDate,
                    },
                })
            )
        );

        revalidatePath('/dashboard/hod/pathways');
        revalidatePath('/dashboard/admin/users');
        revalidatePath('/dashboard/student/pathway');
        return { success: true, updated: allocated.length };
    } catch (error) {
        console.error('commitApprovedPathwayAllocationsToStudents error:', error);
        return { success: false, error: 'Failed to update student degree records' };
    }
}

export async function moveWaitlistStudent(appId: string, targetSlotId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const app = await prisma.selectionApplication.findUnique({
            where: { app_id: appId },
            include: { round: { include: { configs: true } } },
        });
        if (!app) return { success: false, error: 'Application not found' };
        if (app.round.status !== 'CLOSED') {
            return { success: false, error: 'Round must be closed to move allocations' };
        }
        const valid = app.round.configs.some(c => slotIdFromConfig(c) === targetSlotId);
        if (!valid) return { success: false, error: 'Invalid target slot' };

        await prisma.selectionApplication.update({
            where: { app_id: appId },
            data: { status: 'ALLOCATED', allocated_to: targetSlotId, waitlist_pos: null }
        });
        revalidatePath('/dashboard/hod/pathways');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to move student' };
    }
}

export async function rejectApplication(appId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const app = await prisma.selectionApplication.findUnique({
            where: { app_id: appId },
            include: { round: { select: { status: true } } },
        });
        if (!app) return { success: false, error: 'Application not found' };
        if (app.round.status !== 'CLOSED') {
            return { success: false, error: 'Applications can only be rejected while the round is closed' };
        }

        await prisma.selectionApplication.update({
            where: { app_id: appId },
            data: { status: 'REJECTED', allocated_to: null, waitlist_pos: null },
        });
        revalidatePath('/dashboard/hod/pathways');
        return { success: true };
    } catch (error) {
        console.error('rejectApplication error:', error);
        return { success: false, error: 'Failed to reject application' };
    }
}

/** Option A: move students off under-threshold specializations to 2nd choice where configured. */
export async function redistributeUnderThresholdSpecs(roundId: string, specIds?: string[]) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const round = await prisma.selectionRound.findUnique({
            where: { round_id: roundId },
            include: { configs: true, applications: true },
        });
        if (!round) return { success: false, error: 'Round not found' };
        if (round.type !== 'SPECIALIZATION') {
            return { success: false, error: 'Only specialization rounds support this action' };
        }
        if (round.status !== 'CLOSED') {
            return { success: false, error: 'Round must be closed' };
        }

        const configMap = new Map(round.configs.map(c => [c.spec_id || '', c]));
        const underThreshold = new Set<string>();
        for (const cfg of round.configs) {
            const sid = cfg.spec_id;
            if (!sid) continue;
            const count = round.applications.filter(a => a.status === 'ALLOCATED' && a.allocated_to === sid).length;
            if (count < cfg.capacity) underThreshold.add(sid);
        }

        const targets = specIds?.length
            ? specIds.filter(id => underThreshold.has(id))
            : [...underThreshold];

        if (targets.length === 0) {
            return { success: true, moved: 0, message: 'No under-threshold specializations to process' };
        }

        let moved = 0;
        await prisma.$transaction(async (tx) => {
            for (const app of round.applications) {
                if (app.status !== 'ALLOCATED' || !app.allocated_to) continue;
                if (!targets.includes(app.allocated_to)) continue;

                const pref2 = app.preference_2;
                if (pref2 && pref2 !== app.allocated_to && configMap.has(pref2)) {
                    await tx.selectionApplication.update({
                        where: { app_id: app.app_id },
                        data: { status: 'ALLOCATED', allocated_to: pref2, waitlist_pos: null },
                    });
                    moved += 1;
                } else {
                    await tx.selectionApplication.update({
                        where: { app_id: app.app_id },
                        data: { status: 'PENDING', allocated_to: null, waitlist_pos: null },
                    });
                }
            }
        });

        revalidatePath('/dashboard/hod/pathways');
        return { success: true, moved };
    } catch (error) {
        console.error('redistributeUnderThresholdSpecs error:', error);
        return { success: false, error: 'Redistribution failed' };
    }
}

// ─────────────────────────────────────────────────────────────
// Student actions (student portal)
// ─────────────────────────────────────────────────────────────

export async function getStudentActiveSelectionRound(type: RoundType) {
    try {
        const studentSess = await requireStudent();
        if (!studentSess) {
            return { success: false, error: 'Unauthorized' };
        }
        const studentId = studentSess.userId;

        const student = await prisma.student.findUnique({
            where: { student_id: studentId },
            select: {
                current_level: true,
                current_gpa: true,
                degree_path: { select: { program_id: true, code: true, name: true } },
            },
        });
        if (!student) return { success: false, error: 'Student not found' };
        if (!student.current_level) {
            return { success: true, data: null };
        }

        const roundOpen = await prisma.selectionRound.findFirst({
            where: {
                type,
                status: 'OPEN',
                level: student.current_level,
            },
            include: {
                configs: {
                    include: {
                        program: { select: { program_id: true, code: true, name: true, description: true } },
                        specialization: {
                            select: { specialization_id: true, code: true, name: true, description: true },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        if (roundOpen) {
            const existingApp = await prisma.selectionApplication.findUnique({
                where: { round_id_student_id: { round_id: roundOpen.round_id, student_id: studentId } },
            });

            const roundApps = await prisma.selectionApplication.findMany({
                where: { round_id: roundOpen.round_id },
                select: {
                    student_id: true,
                    preference_1: true,
                    preference_2: true,
                    gpa_at_time: true,
                    status: true,
                    waitlist_pos: true,
                    allocated_to: true,
                },
            });

            let pathwayStats:
                | Record<
                      string,
                      {
                          capacity: number;
                          firstChoiceCount: number;
                          secondChoiceCount: number;
                      }
                  >
                | undefined;
            let pathwayRankingApps:
                | { student_id: string; preference_1: string; gpa_at_time: number }[]
                | undefined;
            let cohort: { gpaRank: number; peerCount: number; gpa: number } | undefined;

            if (roundOpen.type === 'PATHWAY') {
                pathwayStats = {};
                pathwayRankingApps = roundApps.map(a => ({
                    student_id: a.student_id,
                    preference_1: a.preference_1,
                    gpa_at_time: a.gpa_at_time,
                }));
                for (const cfg of roundOpen.configs) {
                    const pid = cfg.program_id;
                    if (!pid) continue;
                    const firstChoiceCount = roundApps.filter(a => a.preference_1 === pid).length;
                    const secondChoiceCount = roundApps.filter(a => a.preference_2 === pid).length;
                    pathwayStats[pid] = {
                        capacity: cfg.capacity,
                        firstChoiceCount,
                        secondChoiceCount,
                    };
                }

                const peerCount = await prisma.student.count({
                    where: { current_level: student.current_level! },
                });
                const betterGpa = await prisma.student.count({
                    where: {
                        current_level: student.current_level!,
                        current_gpa: { gt: student.current_gpa ?? 0 },
                    },
                });
                cohort = {
                    gpaRank: betterGpa + 1,
                    peerCount,
                    gpa: student.current_gpa ?? 0,
                };
            }

            const now = new Date();
            const windowOk = isWithinRoundDates(roundOpen.opens_at, roundOpen.closes_at, now);

            return {
                success: true,
                data: {
                    phase: 'OPEN' as const,
                    viewerId: studentId,
                    round: roundOpen,
                    existingApp,
                    currentGpa: student.current_gpa,
                    degreePathProgram: null,
                    windowOk: windowOk.ok,
                    windowMessage: windowOk.ok ? undefined : windowOk.message,
                    pathwayStats,
                    pathwayRankingApps,
                    cohort,
                    graceEndsAt: null,
                    canRequestChange: false,
                    pendingChangeRequest: null,
                    changeRequestLockReason: null,
                },
            };
        }

        const approvedRound = await prisma.selectionRound.findFirst({
            where: {
                type,
                status: 'APPROVED',
                level: student.current_level,
                approved_at: { not: null },
                applications: { some: { student_id: studentId } },
            },
            include: {
                configs: {
                    include: {
                        program: { select: { program_id: true, code: true, name: true, description: true } },
                        specialization: {
                            select: { specialization_id: true, code: true, name: true, description: true },
                        },
                    },
                },
            },
            orderBy: { approved_at: 'desc' },
        });

        if (!approvedRound) return { success: true, data: null };

        const existingApp = await prisma.selectionApplication.findUnique({
            where: { round_id_student_id: { round_id: approvedRound.round_id, student_id: studentId } },
        });

        const latestChangeRequest = await prisma.selectionAllocationChangeRequest.findFirst({
            where: {
                round_id: approvedRound.round_id,
                student_id: studentId,
            },
            orderBy: { created_at: 'desc' },
            select: { request_id: true, status: true },
        });

        const pendingChangeRequest =
            latestChangeRequest?.status === 'PENDING'
                ? { request_id: latestChangeRequest.request_id }
                : null;

        const changeRequestLockReason =
            latestChangeRequest?.status === 'APPROVED'
                ? 'Your change request was approved and your record was updated. Only one allocation change request is allowed per selection round.'
                : latestChangeRequest?.status === 'REJECTED'
                  ? 'Your allocation change request for this round was not approved. Only one request is allowed per round. Contact your HOD if you still need a different allocation.'
                  : null;

        const graceEndsAt = computeGraceEndsAt(
            approvedRound.approved_at,
            approvedRound.allocation_change_grace_days
        );
        const now = new Date();
        const graceActive = graceEndsAt != null && now.getTime() <= graceEndsAt.getTime();
        const canRequestChange =
            graceActive &&
            approvedRound.allocation_change_grace_days > 0 &&
            existingApp?.status === 'ALLOCATED' &&
            !!existingApp?.allocated_to &&
            !latestChangeRequest;

        const approvedType = String(approvedRound.type ?? '').toUpperCase();
        const degreePathProgram =
            approvedType === 'PATHWAY' ? student.degree_path : null;

        return {
            success: true,
            data: {
                phase: 'POST_APPROVAL' as const,
                viewerId: studentId,
                round: approvedRound,
                existingApp,
                currentGpa: student.current_gpa,
                degreePathProgram,
                windowOk: false,
                windowMessage: 'This selection round is complete. Your outcome is shown below.',
                pathwayStats: undefined,
                pathwayRankingApps: undefined,
                cohort: undefined,
                graceEndsAt,
                canRequestChange,
                pendingChangeRequest,
                changeRequestLockReason,
            },
        };
    } catch (error) {
        console.error('getStudentActiveSelectionRound error:', error);
        return { success: false, error: 'Failed to fetch active round' };
    }
}

export async function submitAllocationChangeRequest(data: {
    round_id: string;
    requested_preference_1: string;
    requested_preference_2?: string;
    reason?: string;
}) {
    try {
        const studentSess = await requireStudent();
        if (!studentSess) {
            return { success: false, error: 'Unauthorized' };
        }
        const studentId = studentSess.userId;

        const round = await prisma.selectionRound.findUnique({
            where: { round_id: data.round_id },
            include: { configs: true },
        });
        if (!round || round.status !== 'APPROVED') {
            return { success: false, error: 'This round does not accept allocation change requests.' };
        }

        const graceEndsAt = computeGraceEndsAt(round.approved_at, round.allocation_change_grace_days);
        if (!graceEndsAt || new Date() > graceEndsAt) {
            return { success: false, error: 'The allocation change period has ended.' };
        }

        const existingApp = await prisma.selectionApplication.findUnique({
            where: { round_id_student_id: { round_id: data.round_id, student_id: studentId } },
        });
        if (!existingApp || existingApp.status !== 'ALLOCATED' || !existingApp.allocated_to) {
            return { success: false, error: 'You do not have an allocated place to change.' };
        }

        const existingRequest = await prisma.selectionAllocationChangeRequest.findFirst({
            where: { round_id: data.round_id, student_id: studentId },
            orderBy: { created_at: 'desc' },
            select: { status: true },
        });
        if (existingRequest) {
            if (existingRequest.status === 'PENDING') {
                return { success: false, error: 'You already have a pending change request.' };
            }
            if (existingRequest.status === 'APPROVED') {
                return {
                    success: false,
                    error:
                        'Your change request was already approved. Only one allocation change request is allowed per selection round.',
                };
            }
            return {
                success: false,
                error:
                    'You already used your allocation change request for this round. Only one request is allowed. Contact your HOD if you still need a change.',
            };
        }

        const allowed = new Set(round.configs.map(c => slotIdFromConfig(c)).filter(Boolean));
        if (!allowed.has(data.requested_preference_1)) {
            return { success: false, error: 'Invalid first choice for this round.' };
        }
        if (data.requested_preference_2) {
            if (!allowed.has(data.requested_preference_2)) {
                return { success: false, error: 'Invalid second choice for this round.' };
            }
            if (data.requested_preference_2 === data.requested_preference_1) {
                return { success: false, error: 'First and second choices must be different.' };
            }
        }

        const pathwaySlotCount = round.configs.filter(c => c.program_id).length;
        if (round.type === 'PATHWAY' && !data.requested_preference_2 && pathwaySlotCount !== 2) {
            return {
                success: false,
                error: 'Choose a second pathway preference for this round.',
            };
        }

        await prisma.selectionAllocationChangeRequest.create({
            data: {
                round_id: data.round_id,
                student_id: studentId,
                requested_preference_1: data.requested_preference_1,
                requested_preference_2: data.requested_preference_2 ?? null,
                reason: data.reason?.trim() || null,
            },
        });

        revalidatePath('/dashboard/hod/pathways');
        revalidatePath('/dashboard/student/pathway');
        revalidatePath('/dashboard/student/specialization');
        return { success: true };
    } catch (error) {
        console.error('submitAllocationChangeRequest error:', error);
        return { success: false, error: 'Failed to submit change request' };
    }
}

export async function listAllocationChangeRequestsForRound(roundId: string) {
    try {
        if (!(await requireHodOrAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        const round = await prisma.selectionRound.findUnique({
            where: { round_id: roundId },
            select: { round_id: true },
        });
        if (!round) return { success: false, error: 'Round not found' };

        const requests = await prisma.selectionAllocationChangeRequest.findMany({
            where: { round_id: roundId, status: 'PENDING' },
            include: {
                student: {
                    include: {
                        user: { select: { firstName: true, lastName: true, email: true } },
                    },
                },
            },
            orderBy: { created_at: 'asc' },
        });

        const apps = await prisma.selectionApplication.findMany({
            where: {
                round_id: roundId,
                student_id: { in: requests.map(r => r.student_id) },
            },
        });
        const appByStudent = new Map(apps.map(a => [a.student_id, a]));

        return {
            success: true,
            data: requests.map(r => ({
                ...r,
                current_application: appByStudent.get(r.student_id) ?? null,
            })),
        };
    } catch (error) {
        console.error('listAllocationChangeRequestsForRound error:', error);
        return { success: false, error: 'Failed to list requests' };
    }
}

export async function resolveAllocationChangeRequest(requestId: string, decision: 'APPROVE' | 'REJECT') {
    try {
        const hod = await requireHodOrAdmin();
        if (!hod) {
            return { success: false, error: 'Unauthorized' };
        }

        const req = await prisma.selectionAllocationChangeRequest.findUnique({
            where: { request_id: requestId },
            include: {
                round: { include: { configs: true } },
            },
        });
        if (!req || req.status !== 'PENDING') {
            return { success: false, error: 'Request not found or already resolved' };
        }

        if (decision === 'REJECT') {
            await prisma.selectionAllocationChangeRequest.update({
                where: { request_id: requestId },
                data: {
                    status: 'REJECTED',
                    resolved_at: new Date(),
                    resolved_by_user_id: hod.userId,
                },
            });
            revalidatePath('/dashboard/hod/pathways');
            revalidatePath('/dashboard/student/pathway');
            revalidatePath('/dashboard/student/specialization');
            return { success: true };
        }

        const round = req.round;
        const roundType = String(round.type ?? '').toUpperCase();
        const app = await prisma.selectionApplication.findUnique({
            where: {
                round_id_student_id: { round_id: round.round_id, student_id: req.student_id },
            },
        });
        if (!app) return { success: false, error: 'Application missing' };

        const targetSlot = req.requested_preference_1;
        const config = round.configs.find(c => slotIdFromConfig(c) === targetSlot);
        if (!config) return { success: false, error: 'Invalid target slot' };

        const occupied = await prisma.selectionApplication.count({
            where: {
                round_id: round.round_id,
                status: 'ALLOCATED',
                allocated_to: targetSlot,
                app_id: { not: app.app_id },
            },
        });
        if (occupied >= config.capacity && app.allocated_to !== targetSlot) {
            return { success: false, error: 'Target is at capacity. Reject this request or free a seat first.' };
        }

        await prisma.$transaction(async tx => {
            await tx.selectionApplication.update({
                where: { app_id: app.app_id },
                data: {
                    preference_1: req.requested_preference_1,
                    preference_2: req.requested_preference_2,
                    allocated_to: targetSlot,
                    status: 'ALLOCATED',
                    waitlist_pos: null,
                },
            });
            if (roundType === 'PATHWAY') {
                await tx.student.update({
                    where: { student_id: req.student_id },
                    data: {
                        degree_path_id: targetSlot,
                        pathway_locked: true,
                        pathway_selection_date: new Date(),
                    },
                });
            } else {
                await tx.student.update({
                    where: { student_id: req.student_id },
                    data: { specialization_id: targetSlot },
                });
            }
            await tx.selectionAllocationChangeRequest.update({
                where: { request_id: requestId },
                data: {
                    status: 'APPROVED',
                    resolved_at: new Date(),
                    resolved_by_user_id: hod.userId,
                },
            });
        });

        revalidatePath('/dashboard/hod/pathways');
        revalidatePath('/dashboard/student/pathway');
        revalidatePath('/dashboard/student/specialization');
        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('resolveAllocationChangeRequest error:', error);
        return { success: false, error: 'Failed to resolve request' };
    }
}

export async function submitSelectionApplication(data: {
    round_id: string;
    preference_1: string;
    preference_2?: string;
}) {
    try {
        const studentSess = await requireStudent();
        if (!studentSess) {
            return { success: false, error: 'Unauthorized' };
        }
        const studentId = studentSess.userId;

        const round = await prisma.selectionRound.findUnique({
            where: { round_id: data.round_id },
            include: { configs: true },
        });
        if (!round || round.status !== 'OPEN') {
            return { success: false, error: 'This selection round is not open for applications.' };
        }

        const now = new Date();
        const window = isWithinRoundDates(round.opens_at, round.closes_at, now);
        if (!window.ok) {
            return { success: false, error: window.message };
        }

        const allowed = new Set(round.configs.map(c => slotIdFromConfig(c)).filter(Boolean));
        if (!allowed.has(data.preference_1)) {
            return { success: false, error: 'Invalid first preference for this round.' };
        }
        if (data.preference_2) {
            if (!allowed.has(data.preference_2)) {
                return { success: false, error: 'Invalid second preference for this round.' };
            }
            if (data.preference_2 === data.preference_1) {
                return { success: false, error: 'First and second preferences must be different.' };
            }
        }

        const pathwaySlotCount = round.configs.filter(c => c.program_id).length;
        if (round.type === 'PATHWAY' && !data.preference_2 && pathwaySlotCount !== 2) {
            return {
                success: false,
                error: 'Choose a second preference, or use a round with only two pathways (second choice is optional there).',
            };
        }

        const student = await prisma.student.findUnique({
            where: { student_id: studentId },
            select: { current_gpa: true, current_level: true },
        });
        if (!student) return { success: false, error: 'Student not found' };
        if (round.level && student.current_level && round.level !== student.current_level) {
            return { success: false, error: 'You are not eligible for this selection round (level mismatch).' };
        }

        const gpa_at_time = student.current_gpa;

        const app = await prisma.selectionApplication.upsert({
            where: { round_id_student_id: { round_id: data.round_id, student_id: studentId } },
            create: {
                round_id: data.round_id,
                student_id: studentId,
                preference_1: data.preference_1,
                preference_2: data.preference_2 || null,
                gpa_at_time,
            },
            update: {
                preference_1: data.preference_1,
                preference_2: data.preference_2 || null,
                gpa_at_time,
                status: 'PENDING',
                allocated_to: null,
                waitlist_pos: null,
            }
        });

        revalidatePath('/dashboard/student');
        revalidatePath('/dashboard/student/pathway');
        revalidatePath('/dashboard/student/specialization');
        return { success: true, data: app };
    } catch (error) {
        console.error('submitSelectionApplication error:', error);
        return { success: false, error: 'Failed to submit application' };
    }
}
