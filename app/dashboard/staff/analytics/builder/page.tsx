import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getStaffAnalytics } from '@/lib/actions/staff-subactions';
import { defaultStaffReportDefinition } from '@/lib/analytics/default-reports';
import { ReportBuilderPageShell } from '@/components/analytics/report-builder-page-shell';

export const dynamic = 'force-dynamic';

export default async function StaffAnalyticsBuilderPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const session = await auth();
    if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
        redirect('/login');
    }

    const sp = await searchParams;
    const academicYearId = typeof sp.year === 'string' ? sp.year : undefined;
    const semesterId = typeof sp.semester === 'string' ? sp.semester : undefined;

    const modules = await getStaffAnalytics({
        academicYearId: academicYearId === 'all' ? undefined : academicYearId,
        semesterId: semesterId === 'all' ? undefined : semesterId,
    });

    const p = new URLSearchParams();
    if (academicYearId && academicYearId !== 'all') p.set('year', academicYearId);
    if (semesterId && semesterId !== 'all') p.set('semester', semesterId);
    const q = p.toString();
    const backHref = `/dashboard/staff/analytics${q ? `?${q}` : ''}`;

    return (
        <Suspense
            fallback={
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <ReportBuilderPageShell
                defaultDefinition={defaultStaffReportDefinition()}
                filterContext={{
                    academicYearId: academicYearId === 'all' ? undefined : academicYearId,
                    semesterId: semesterId === 'all' ? undefined : semesterId,
                }}
                builderRole={session.user.role}
                aggregatesSummary={`Modules: ${modules.length}; year=${academicYearId ?? 'all'}; semester=${semesterId ?? 'all'}`}
            />
        </Suspense>
    );
}
