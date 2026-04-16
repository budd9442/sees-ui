import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HodTrendsBuilderPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const sp = await searchParams;
    const pathway = typeof sp.pathway === 'string' ? sp.pathway : undefined;
    const level = typeof sp.level === 'string' ? sp.level : undefined;

    const p = new URLSearchParams();
    if (pathway && pathway !== 'all') p.set('pathway', pathway);
    if (level && level !== 'all') p.set('level', level);
    const q = p.toString();
    redirect(q ? `/dashboard/hod/analytics?${q}` : '/dashboard/hod/analytics');
}
