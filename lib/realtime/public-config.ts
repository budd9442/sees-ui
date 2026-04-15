/** Client-safe Pusher config (NEXT_PUBLIC_* only). */
export function getPublicPusherConfig() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;
  return { key, cluster };
}
