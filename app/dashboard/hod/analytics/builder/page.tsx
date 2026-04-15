import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getHODAnalyticsData } from '@/lib/actions/hod-actions';
import { defaultHodReportDefinition } from '@/lib/analytics/default-reports';
import { ReportBuilderPageShell } from '@/components/analytics/report-builder-page-shell';

export const dynamic = 'force-dynamic';

export default async function HodAnalyticsBuilderPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'hod') {
        redirect('/login');
    }

    const sp = await searchParams;
    const pathway = typeof sp.pathway === 'string' ? sp.pathway : undefined;
    const level = typeof sp.level === 'string' ? sp.level : undefined;

    const data = await getHODAnalyticsData({
        pathway: pathway === 'all' ? undefined : pathway,
        level: level === 'all' ? undefined : level,
    });

    const p = new URLSearchParams();
    if (pathway && pathway !== 'all') p.set('pathway', pathway);
    if (level && level !== 'all') p.set('level', level);
    const q = p.toString();
    const backHref = `/dashboard/hod/analytics${q ? `?${q}` : ''}`;

    const students = data.students?.length ?? 0;
    const mods = data.modules?.length ?? 0;

    return (
        <Suspense
            fallback={
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <ReportBuilderPageShell
                backHref={backHref}
                backLabel="Back to department analytics"
                defaultDefinition={defaultHodReportDefinition()}
                filterContext={{
                    pathway: pathway === 'all' ? undefined : pathway,
                    level: level === 'all' ? undefined : level,
                }}
                builderRole="hod"
                aggregatesSummary={`Students: ${students}; modules: ${mods}; pathway=${pathway ?? 'all'}; level=${level ?? 'all'}`}
            />
        </Suspense>
    );
}
