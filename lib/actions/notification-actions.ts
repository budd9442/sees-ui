'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/**
 * Fetch latest notifications for the current user
 */
/**
 * @swagger
 * /action/notification/getUserNotifications:
 *   post:
 *     summary: "[Server Action] List User Notifications"
 *     description: Returns the latest notifications for the currently authenticated user, including alerts, system messages, and announcements.
 *     tags:
 *       - Notification Actions
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: number
 *                 default: 20
 *     responses:
 *       200:
 *         description: Successfully fetched notifications
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
/**
 * @swagger
 * /action/notification/getUnreadNotificationCount:
 *   post:
 *     summary: "[Server Action] Get Unread Count"
 *     description: Returns the count of notifications that haven't been read by the current user.
 *     tags:
 *       - Notification Actions
 *     responses:
 *       200:
 *         description: Unread notification count
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
/**
 * @swagger
 * /action/notification/markNotificationAsRead:
 *   post:
 *     summary: "[Server Action] Mark as Read"
 *     description: Updates the status of a specific notification to 'read' for the authenticated user.
 *     tags:
 *       - Notification Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationId:
 *                 type: string
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
/**
 * @swagger
 * /action/notification/clearAllNotifications:
 *   post:
 *     summary: "[Server Action] Mark All as Read"
 *     description: Marks all unread notifications as read for the currently authenticated user.
 *     tags:
 *       - Notification Actions
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
