import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HodAnalyticsBuilderPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const sp = await searchParams;
    const pathway = typeof sp.pathway === 'string' ? sp.pathway : undefined;
    const level = typeof sp.level === 'string' ? sp.level : undefined;
    const metadataKey = typeof sp.metadataKey === 'string' ? sp.metadataKey : undefined;
    const metadataValue = typeof sp.metadataValue === 'string' ? sp.metadataValue : undefined;

    const p = new URLSearchParams();
    if (pathway && pathway !== 'all') p.set('pathway', pathway);
    if (level && level !== 'all') p.set('level', level);
    if (metadataKey && metadataKey !== 'all') p.set('metadataKey', metadataKey);
    if (metadataValue && metadataValue !== 'all') p.set('metadataValue', metadataValue);
    const q = p.toString();
    redirect(q ? `/dashboard/hod/analytics?${q}` : '/dashboard/hod/analytics');
}
