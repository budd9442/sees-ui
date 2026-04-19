'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/**
 * Fetch latest notifications for the current user
 */
export async function getUserNotifications(limit = 20) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const notifications = await prisma.notification.findMany({
        where: { user_id: session.user.id },
        orderBy: { sent_at: 'desc' },
        take: limit
    });

    return notifications.map(n => ({
        id: n.notification_id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.content,
        sentAt: n.sent_at.toISOString(),
        isRead: !!n.read_at,
    }));
}

/**
 * Get unread count for navbar indicator
 */
export async function getUnreadNotificationCount() {
    const session = await auth();
    if (!session?.user?.id) return 0;

    return prisma.notification.count({
        where: {
            user_id: session.user.id,
            read_at: null
        }
    });
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await prisma.notification.updateMany({
        where: {
            notification_id: notificationId,
            user_id: session.user.id
        },
        data: {
            read_at: new Date()
        }
    });

    revalidatePath('/');
    return { success: true };
}

/**
 * Mark all notifications as read for the current user
 */
export async function clearAllNotifications() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await prisma.notification.updateMany({
        where: {
            user_id: session.user.id,
            read_at: null
        },
        data: {
            read_at: new Date()
        }
    });

    revalidatePath('/');
    return { success: true };
}
