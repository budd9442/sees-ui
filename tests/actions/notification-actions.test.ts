import { describe, it, expect, vi } from 'vitest';
import { getUserNotifications, getUnreadNotificationCount, markNotificationAsRead, clearAllNotifications } from '@/lib/actions/notification-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('notification-actions', () => {
  describe('getUserNotifications', () => {
    it('should return notifications for user', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.notification.findMany.mockResolvedValue([{
        notification_id: 'n1',
        user_id: 'u1',
        type: 'INFO',
        title: 'Hi',
        content: 'Msg',
        sent_at: new Date(),
        read_at: null
      }]);

      const result = await getUserNotifications();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Hi');
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return unread count', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.notification.count.mockResolvedValue(5);
      const result = await getUnreadNotificationCount();
      expect(result).toBe(5);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should update read_at for notification', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.notification.updateMany.mockResolvedValue({ count: 1 });
      const result = await markNotificationAsRead('n1');
      expect(result.success).toBe(true);
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { notification_id: 'n1', user_id: 'u1' }
      }));
    });
  });

  describe('clearAllNotifications', () => {
    it('should mark all unread as read', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.notification.updateMany.mockResolvedValue({ count: 5 });
      const result = await clearAllNotifications();
      expect(result.success).toBe(true);
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 'u1', read_at: null }
      }));
    });
  });
});
