import { describe, it, expect, vi } from 'vitest';
import { searchUsersForMessaging, getMyMessages, sendDirectMessage, markMessagesRead } from '@/lib/actions/message-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { publishUserEvent } from '@/lib/realtime/publish';

const prismaMock = prisma as any;

// Mock realtime publishing
vi.mock('@/lib/realtime/publish', () => ({
  publishUserEvent: vi.fn().mockResolvedValue({}),
}));

describe('message-actions', () => {
  describe('searchUsersForMessaging', () => {
    it('should return matching users for valid query', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.user.findMany.mockResolvedValue([{
        user_id: 'u2',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'a@ex.com',
        student: {}
      }]);

      const result = await searchUsersForMessaging('Alice');

      expect(result.rateLimited).toBe(false);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].name).toBe('Alice Smith');
    });

    it('should return rateLimited true if too many searches', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'u-limit' } });
        prismaMock.user.findMany.mockResolvedValue([]);
        for(let i=0; i<40; i++) await searchUsersForMessaging('test');
        const result = await searchUsersForMessaging('test');
        expect(result.rateLimited).toBe(true);
    });
  });

  describe('getMyMessages', () => {
    it('should return paginated history', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.message.findMany.mockResolvedValue([{
        message_id: 'm1',
        sender_id: 'u1',
        recipient_id: 'u2',
        subject: 'Hi',
        content: 'Hello',
        sent_at: new Date(),
        read_at: null,
        sender: { user_id: 'u1', firstName: 'Me', lastName: 'Self' },
        recipient: { user_id: 'u2', firstName: 'You', lastName: 'Other' }
      }]);

      const result = await getMyMessages({ limit: 10 });

      expect(result.messages).toHaveLength(1);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('sendDirectMessage', () => {
    it('should create message and publish events', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.user.findUnique.mockResolvedValue({ user_id: 'u2', status: 'ACTIVE' });
      prismaMock.message.create.mockResolvedValue({
        message_id: 'new-m',
        sender_id: 'u1',
        recipient_id: 'u2',
        subject: 'Sub',
        content: 'Body',
        sent_at: new Date(),
        read_at: null,
        sender: { firstName: 'S', lastName: '1' },
        recipient: { firstName: 'R', lastName: '1' }
      });

      const result = await sendDirectMessage({ recipientId: 'u2', content: 'Hello' });

      expect(result.success).toBe(true);
      expect(prismaMock.message.create).toHaveBeenCalled();
      expect(publishUserEvent).toHaveBeenCalledTimes(2); // One for recipient, one for sender
    });
  });

  describe('markMessagesRead', () => {
    it('should update read_at and publish events', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.message.findMany.mockResolvedValue([{ message_id: 'm1' }]);
      prismaMock.message.updateMany.mockResolvedValue({ count: 1 });

      const result = await markMessagesRead({ otherUserId: 'u2' });

      expect(result.updated).toBe(1);
      expect(prismaMock.message.updateMany).toHaveBeenCalled();
      expect(publishUserEvent).toHaveBeenCalled();
    });
  });
});
