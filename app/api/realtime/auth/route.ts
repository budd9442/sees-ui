import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { auth } from '@/auth';
import { userPrivateChannelName } from '@/lib/realtime/channels';

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

/**
 * @swagger
 * /api/realtime/auth:
 *   post:
 *     summary: Pusher channel authorization
 *     description: Authorizes a user to join a private Pusher channel.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               socket_id:
 *                 type: string
 *               channel_name:
 *                 type: string
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               socket_id:
 *                 type: string
 *               channel_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully authorized
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden channel
 *       503:
 *         description: Realtime service not configured
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pusher = getPusherServer();
  if (!pusher) {
    return NextResponse.json({ error: 'Realtime not configured' }, { status: 503 });
  }

  const contentType = req.headers.get('content-type') || '';
  let socketId: string | null = null;
  let channelName: string | null = null;

  if (contentType.includes('application/json')) {
    const json = (await req.json()) as { socket_id?: string; channel_name?: string };
    socketId = json.socket_id ?? null;
    channelName = json.channel_name ?? null;
  } else {
    const body = await req.text();
    const params = new URLSearchParams(body);
    socketId = params.get('socket_id');
    channelName = params.get('channel_name');
  }

  if (!socketId || !channelName) {
    return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
  }

  const expected = userPrivateChannelName(session.user.id);
  if (channelName !== expected) {
    return NextResponse.json({ error: 'Forbidden channel' }, { status: 403 });
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
