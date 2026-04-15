'use client';

import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { MESSAGING_EVENTS, userPrivateChannelName } from '@/lib/realtime/channels';
import type { MessageEntry } from '@/types/messaging';

type NewPayload = { message: MessageEntry };
type ReadPayload = { messageIds: string[]; readerId?: string };

export function useMessagingRealtime(opts: {
  userId: string | null;
  enabled: boolean;
  onNewMessage: (payload: NewPayload) => void;
  onMessagesRead?: (payload: ReadPayload) => void;
}) {
  const onNewRef = useRef(opts.onNewMessage);
  const onReadRef = useRef(opts.onMessagesRead);
  onNewRef.current = opts.onNewMessage;
  onReadRef.current = opts.onMessagesRead;

  useEffect(() => {
    if (!opts.enabled || !opts.userId) return;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    const pusher = new Pusher(key, {
      cluster,
      authEndpoint: '/api/realtime/auth',
      authTransport: 'ajax',
    });

    const channelName = userPrivateChannelName(opts.userId);
    const channel = pusher.subscribe(channelName);

    channel.bind(MESSAGING_EVENTS.NEW_MESSAGE, (data: NewPayload) => {
      onNewRef.current(data);
    });
    channel.bind(MESSAGING_EVENTS.MESSAGES_READ, (data: ReadPayload) => {
      onReadRef.current?.(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [opts.enabled, opts.userId]);
}
