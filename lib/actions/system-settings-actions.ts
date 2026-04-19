'use server';

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

async function createAuditLog(adminId: string, action: string, entityId: string, oldVal: string | null, newVal: string | null) {
    await writeAuditLog({
        adminId,
        action,
        entityType: 'SYSTEM_SETTING',
        entityId,
        oldValue: oldVal,
        newValue: newVal,
        category: 'ADMIN',
    });
}

/**
 * Fetch all system settings categorized
 */
export async function getCategorizedSettings() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const settings = await prisma.systemSetting.findMany({
        orderBy: { key: 'asc' }
    });

    const categories = ['ACADEMIC', 'SYSTEM', 'SECURITY', 'BRANDING', 'OPERATIONS', 'GENERAL'];
    const result: Record<string, any[]> = {};
    
    categories.forEach(cat => result[cat] = []);
    
    settings.forEach(s => {
        const cat = s.category || 'GENERAL';
        if (!result[cat]) result[cat] = [];
        result[cat].push(s);
    });

    return result;
}

/**
 * Update a specific system setting with Audit Trail
 */
export async function updateSystemSettingWithAudit(key: string, value: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const existing = await prisma.systemSetting.findUnique({
        where: { key }
    });

    const updated = await prisma.systemSetting.upsert({
        where: { key },
        create: {
            setting_id: randomUUID(),
            key,
            value,
            category: 'GENERAL',
            updated_at: new Date(),
        },
        update: { value, updated_at: new Date() },
    });

    // Capture Audit Log
    await createAuditLog(
        session.user.id,
        'UPDATE_SETTING',
        updated.setting_id,
        existing?.value || null,
        value
    );

    revalidatePath('/dashboard/admin/dynamic-configuration');
    return { success: true };
}

/**
 * Bootstrap Default System Governance Keys
 */
export async function initializeSystemGovernance() {
    const defaults = [
        { key: 'is_registration_open', value: 'true', category: 'OPERATIONS', description: 'Global toggle for module registration' },
        { key: 'is_pathway_selection_open', value: 'true', category: 'OPERATIONS', description: 'Window for Level 1 preference collection' },
        { key: 'is_specialization_open', value: 'true', category: 'OPERATIONS', description: 'Window for Level 2 branch selection' },
        { key: 'maintenance_mode', value: 'false', category: 'SYSTEM', description: 'Safety lockdown for students and staff' },
        { key: 'institution_name', value: 'SEES Academic Platform', category: 'BRANDING', description: 'University name for portal UI' },
        { key: 'active_semester_id', value: 'SEM-CURRENT-UUID', category: 'ACADEMIC', description: 'System-wide active semester' },
        { key: 'ENFORCE_STAFF_2FA', value: 'false', category: 'SECURITY', description: 'Force all Staff and Admins to use Two-Factor Authentication' },
    ];

    return { success: true };
}

/**
 * Public System Info (No Auth)
 */
export async function getPublicSystemInfo() {
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: { in: ['institution_name', 'maintenance_mode'] }
        }
    });

    return {
        institutionName: settings.find(s => s.key === 'institution_name')?.value || 'SEES Platform',
        maintenanceMode: settings.find(s => s.key === 'maintenance_mode')?.value === 'true'
    };
}

/**
 * Fetch Audit Logs for history view
 */
export async function getAuditLogs() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error("Unauthorized");
    }

    return await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 50
    });
}
