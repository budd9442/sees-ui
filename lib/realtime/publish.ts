import Pusher from 'pusher';
import { userPrivateChannelName } from './channels';

function getPusherServer(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;
  if (!appId || !key || !secret || !cluster) return null;
  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}

export function isRealtimeConfigured(): boolean {
  return !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER
  );
}

export async function publishUserEvent(userId: string, event: string, data: unknown) {
  const pusher = getPusherServer();
  if (!pusher) return;
  try {
    await pusher.trigger(userPrivateChannelName(userId), event, data);
  } catch (e) {
    console.error('[realtime] publish failed', e);
  }
}
