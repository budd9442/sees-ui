/** Pusher private channel per logged-in user (subscribe only to own channel). */
export function userPrivateChannelName(userId: string) {
  return `private-user-${userId}`;
}

export const MESSAGING_EVENTS = {
  NEW_MESSAGE: 'message:new',
  MESSAGES_READ: 'message:read',
} as const;
