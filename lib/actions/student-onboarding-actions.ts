'use server';

import { randomUUID } from 'crypto';
import type { Prisma } from '@prisma/client';
import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import {
    normalizeOnboardingQuestions,
    ONBOARDING_QUESTIONS_SETTING_KEY,
    onboardingAnswersSchema,
    onboardingQuestionsDocumentSchema,
    type OnboardingQuestion,
    type OnboardingQuestionsDocument,
} from '@/lib/onboarding/question-schema';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

function canManageOnboarding(role: string | undefined) {
    return role === 'admin' || role === 'hod';
}

async function requireAdminOrHod() {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role;
    if (!session?.user?.id || !canManageOnboarding(role)) {
        throw new Error('Unauthorized');
    }
    return { session, role: role! };
}

async function requireStudentSession() {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role;
    if (!session?.user?.id || role !== 'student') {
        throw new Error('Unauthorized');
    }
    return session;
}

async function readQuestionsDoc(): Promise<OnboardingQuestionsDocument> {
    const row = await prisma.systemSetting.findUnique({
        where: { key: ONBOARDING_QUESTIONS_SETTING_KEY },
    });
    if (!row?.value) {
        return { version: 1, questions: [] };
    }
    try {
        return normalizeOnboardingQuestions(JSON.parse(row.value));
    } catch {
        return { version: 1, questions: [] };
    }
}

export async function getOnboardingQuestionsForAdmin() {
    await requireAdminOrHod();
    return readQuestionsDoc();
}

export async function saveOnboardingQuestionsForAdmin(input: unknown) {
    const { session } = await requireAdminOrHod();
    const normalized = normalizeOnboardingQuestions(input);
    const normalizedAnalytics = {
        ...normalized,
        questions: normalized.questions.map((q) => ({ ...q, includeInAnalytics: true })),
    };
    const keys = new Set<string>();
    for (const q of normalizedAnalytics.questions) {
        if (keys.has(q.key)) {
            throw new Error(`Duplicate question key: ${q.key}`);
        }
        if ((q.type === 'select' || q.type === 'radio') && q.options.length === 0) {
            throw new Error(`Question "${q.label}" requires at least one option.`);
        }
        keys.add(q.key);
    }
    const payload = {
        ...normalizedAnalytics,
        updatedAt: new Date().toISOString(),
    };
    await prisma.systemSetting.upsert({
        where: { key: ONBOARDING_QUESTIONS_SETTING_KEY },
        create: {
            setting_id: randomUUID(),
            key: ONBOARDING_QUESTIONS_SETTING_KEY,
            value: JSON.stringify(payload),
            category: 'ACADEMIC',
            description: 'Student first-login onboarding questions',
            updated_at: new Date(),
        },
        update: {
            value: JSON.stringify(payload),
            updated_at: new Date(),
        },
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'UPDATE_ONBOARDING_QUESTIONS',
        entityType: 'SYSTEM_SETTING',
        entityId: ONBOARDING_QUESTIONS_SETTING_KEY,
        oldValue: null,
        newValue: JSON.stringify(payload),
        category: 'ADMIN',
        metadata: { questionCount: payload.questions.length },
    });
    return { ok: true, count: payload.questions.length };
}

export async function getStudentOnboardingState() {
    const session = await requireStudentSession();
    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        select: { metadata: true, onboarding_completed_at: true },
    });
    const doc = await readQuestionsDoc();
    if (!student) {
        // If no student profile exists, log out the user to prevent redirect loop.
        await signOut({ redirectTo: '/login' });
    }
    return {
        completed: !!student.onboarding_completed_at,
        completedAt: student.onboarding_completed_at?.toISOString() ?? null,
        questions: doc.questions,
        metadata: (student.metadata ?? {}) as Record<string, unknown>,
    };
}

function validateAnswersAgainstQuestions(questions: OnboardingQuestion[], answersRaw: unknown) {
    const answers = onboardingAnswersSchema.parse(answersRaw);
    const byKey = new Map(questions.map((q) => [q.key, q] as const));

    for (const [key, value] of Object.entries(answers)) {
        if (!byKey.has(key)) {
            delete answers[key];
            continue;
        }
        const q = byKey.get(key)!;
        const text = String(value ?? '').trim();
        if ((q.type === 'select' || q.type === 'radio') && q.options.length > 0 && !q.options.includes(text)) {
            throw new Error(`Invalid option selected for "${q.label}"`);
        }
        answers[key] = text;
    }

    for (const q of questions) {
        if (!q.required) continue;
        const value = String(answers[q.key] ?? '').trim();
        if (!value) throw new Error(`"${q.label}" is required.`);
    }

    return answers;
}

export async function submitStudentOnboardingAnswers(answersRaw: unknown) {
    const session = await requireStudentSession();
    const doc = onboardingQuestionsDocumentSchema.parse(await readQuestionsDoc());
    const answers = validateAnswersAgainstQuestions(doc.questions, answersRaw);
    const analyticsKeys = new Set(doc.questions.filter((q) => q.includeInAnalytics).map((q) => q.key));

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        select: { metadata: true },
    });
    if (!student) {
        await signOut({ redirectTo: '/login' });
    }

    const existing = (student.metadata ?? {}) as Record<string, unknown>;
    const nextMetadata = { ...existing, ...answers };
    const analyticsMetadata: Record<string, string> = {};
    for (const [key, value] of Object.entries(nextMetadata)) {
        if (!analyticsKeys.has(key)) continue;
        analyticsMetadata[key] = String(value ?? '');
    }

    await prisma.student.update({
        where: { student_id: session.user.id },
        data: {
            metadata: nextMetadata as Prisma.InputJsonValue,
            onboarding_completed_at: new Date(),
        },
    });

    return { ok: true, metadata: nextMetadata, analyticsMetadata };
}
