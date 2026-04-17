'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { publishUserEvent } from '@/lib/realtime/publish';
import { MESSAGING_EVENTS } from '@/lib/realtime/channels';
import type { MessageCursor, MessageEntry } from '@/types/messaging';
import { appRoleFromUserRecord, type UserWithRelations } from '@/lib/messaging/user-app-role';

const userInclude = {
  student: true,
  staff: {
    include: {
      advisor: true,
      hod: true,
    },
  },
} as const;

function formatMessage(msg: {
  message_id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  sent_at: Date;
  read_at: Date | null;
  sender: UserWithRelations;
  recipient: UserWithRelations;
}): MessageEntry {
  const senderRole = appRoleFromUserRecord(msg.sender);
  const receiverRole = appRoleFromUserRecord(msg.recipient);
  return {
    id: msg.message_id,
    senderId: msg.sender_id,
    receiverId: msg.recipient_id,
    subject: msg.subject,
    content: msg.content,
    createdAt: msg.sent_at.toISOString(),
    isRead: !!msg.read_at,
    senderRole,
    senderName: `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim(),
    receiverRole,
    receiverName: `${msg.recipient.firstName || ''} ${msg.recipient.lastName || ''}`.trim(),
  };
}

const SEARCH_WINDOW_MS = 60_000;
const SEARCH_MAX_PER_WINDOW = 40;
const searchHits = new Map<string, number[]>();

function searchRateOk(userId: string): boolean {
  const now = Date.now();
  const arr = searchHits.get(userId) || [];
  const recent = arr.filter((t) => now - t < SEARCH_WINDOW_MS);
  if (recent.length >= SEARCH_MAX_PER_WINDOW) return false;
  recent.push(now);
  searchHits.set(userId, recent);
  return true;
}

export async function searchUsersForMessaging(query: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  if (!searchRateOk(session.user.id)) {
    return {
      users: [] as { id: string; firstName: string; lastName: string; name: string; role: string }[],
      rateLimited: true,
    };
  }

  const q = query.trim();
  if (q.length < 2) {
    return {
      users: [] as { id: string; firstName: string; lastName: string; name: string; role: string }[],
      rateLimited: false,
    };
  }

  const users = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      NOT: { user_id: session.user.id },
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 20,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    include: userInclude,
  });

  return {
    rateLimited: false,
    users: users.map((u) => {
      const firstName = u.firstName || '';
      const lastName = u.lastName || '';
      return {
        id: u.user_id,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || u.email,
        role: appRoleFromUserRecord(u as UserWithRelations),
      };
    }),
  };
}

export async function getMyMessages(opts?: { cursor?: MessageCursor | null; limit?: number }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 200);
  const cursor = opts?.cursor;

  const participation = {
    OR: [{ sender_id: session.user.id }, { recipient_id: session.user.id }],
  };

  const cursorWhere = cursor
    ? {
        OR: [
          { sent_at: { lt: new Date(cursor.sentAt) } },
          {
            AND: [{ sent_at: new Date(cursor.sentAt) }, { message_id: { lt: cursor.id } }],
          },
        ],
      }
    : {};

  const messages = await prisma.message.findMany({
    where: {
      AND: [participation, cursorWhere],
    },
    include: {
      sender: { include: userInclude },
      recipient: { include: userInclude },
    },
    orderBy: [{ sent_at: 'desc' }, { message_id: 'desc' }],
    take: limit + 1,
  });

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;
  const oldest = page[page.length - 1];
  const nextCursor: MessageCursor | null =
    hasMore && oldest
      ? { sentAt: oldest.sent_at.toISOString(), id: oldest.message_id }
      : null;

  const formatted: MessageEntry[] = page.map((m) => formatMessage(m as unknown as Parameters<typeof formatMessage>[0]));

  return { messages: formatted, nextCursor };
}

export async function sendDirectMessage(input: {
  recipientId: string;
  subject?: string;
  content: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { recipientId, content } = input;
  const subject = input.subject?.trim() || 'Direct Message';
  const body = content.trim();
  if (!body) throw new Error('Message content is required');
  if (recipientId === session.user.id) throw new Error('Cannot message yourself');

  const recipient = await prisma.user.findUnique({
    where: { user_id: recipientId },
    include: userInclude,
  });
  if (!recipient || recipient.status !== 'ACTIVE') {
    throw new Error('Recipient not found or inactive');
  }

  const message = await prisma.message.create({
    data: {
      sender_id: session.user.id,
      recipient_id: recipientId,
      subject,
      content: body,
    },
    include: {
      sender: { include: userInclude },
      recipient: { include: userInclude },
    },
  });

  const entry = formatMessage(message as unknown as Parameters<typeof formatMessage>[0]);

  const payload = { message: entry };

  await publishUserEvent(recipientId, MESSAGING_EVENTS.NEW_MESSAGE, payload);
  await publishUserEvent(session.user.id, MESSAGING_EVENTS.NEW_MESSAGE, payload);

  return {
    success: true as const,
    message_id: message.message_id,
    message: entry,
  };
}

export async function markMessagesRead(input: { otherUserId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { otherUserId } = input;

  const unread = await prisma.message.findMany({
    where: {
      sender_id: otherUserId,
      recipient_id: session.user.id,
      read_at: null,
    },
    select: { message_id: true },
  });

  if (unread.length === 0) {
    return { updated: 0 };
  }

  await prisma.message.updateMany({
    where: {
      sender_id: otherUserId,
      recipient_id: session.user.id,
      read_at: null,
    },
    data: { read_at: new Date() },
  });

  await publishUserEvent(otherUserId, MESSAGING_EVENTS.MESSAGES_READ, {
    readerId: session.user.id,
    messageIds: unread.map((m) => m.message_id),
  });

  return { updated: unread.length, messageIds: unread.map((m) => m.message_id) };
}

export async function getAvailableAdvisorsForMessaging() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const advisors = await prisma.advisor.findMany({
    where: {
      is_available_for_contact: true,
    },
    include: {
      staff: {
        include: {
          user: {
            include: userInclude,
          },
        },
      },
    },
    orderBy: {
      staff: {
        user: {
          lastName: 'asc',
        },
      },
    },
  });

  return advisors
    .map((a) => {
      const user = a.staff.user as UserWithRelations;
      if (!user || user.status !== 'ACTIVE' || user.user_id === session.user!.id) return null;
      const specialties = Array.isArray(a.specialty_areas)
        ? (a.specialty_areas as string[]).map((s) => String(s).trim()).filter(Boolean)
        : [];
      return {
        id: user.user_id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        role: appRoleFromUserRecord(user),
        department: a.staff.department,
        specialties,
        bio: a.bio ?? null,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);
}
