import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ModuleRegistrationReportClient } from '../../_components/module-registration-report-client';

export const dynamic = 'force-dynamic';

function parseIntent(raw: string | string[] | undefined): 'close' | 'finalize' | null {
    const v = Array.isArray(raw) ? raw[0] : raw;
    if (v === 'close' || v === 'finalize') return v;
    return null;
}

export default async function ModuleRegistrationRoundReportPage({
    params,
    searchParams,
}: {
    params: Promise<{ roundId: string }>;
    searchParams: Promise<{ intent?: string | string[] }>;
}) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'hod' && session.user.role !== 'admin')) {
        redirect('/login');
    }

    const { roundId } = await params;
    const sp = await searchParams;
    const intent = parseIntent(sp.intent);

    return <ModuleRegistrationReportClient roundId={roundId} intent={intent} />;
}
