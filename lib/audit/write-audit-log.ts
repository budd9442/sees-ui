import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export type AuditCategory = 'AUTH' | 'EMAIL' | 'ADMIN' | 'STAFF' | 'SYSTEM';

export type WriteAuditLogInput = {
    adminId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: string | null;
    newValue?: string | null;
    category?: AuditCategory;
    metadata?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
};

/**
 * Persist an audit row. Never throws — failures are logged server-side only.
 * High-volume AUTH_LOGIN_FAILED may warrant rate limiting or sampling later.
 */
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
    const {
        adminId = null,
        action,
        entityType,
        entityId,
        oldValue = null,
        newValue = null,
        category = 'ADMIN',
        metadata = null,
        ipAddress = null,
        userAgent = null,
    } = input;

    try {
        const data: Prisma.AuditLogCreateInput = {
            admin_id: adminId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_value: oldValue,
            new_value: newValue,
            category,
            ip_address: ipAddress,
            user_agent: userAgent,
        };
        if (metadata != null) {
            data.metadata = metadata as Prisma.InputJsonValue;
        }
        await prisma.auditLog.create({ data });
    } catch (e) {
        console.error('[audit] writeAuditLog failed:', action, e);
    }
}

/** Best-effort client IP from Next.js request headers (behind proxies). */
export function clientIpFromHeaders(headersList: Headers): string | null {
    const forwarded = headersList.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }
    const realIp = headersList.get('x-real-ip');
    if (realIp?.trim()) return realIp.trim();
    return null;
}
