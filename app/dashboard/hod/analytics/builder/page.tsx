import { Suspense } from 'react';
import { getHODAnalyticsData } from '@/lib/actions/hod-actions';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ReportBuilderPanel } from '@/components/analytics/report-builder-panel';
import { defaultHodReportDefinition } from '@/lib/analytics/default-reports';

export const dynamic = 'force-dynamic';

export default async function HODReportsBuilderPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'hod') {
        redirect('/login');
    }

    // We fetch a slice of data to provide context to the builder (e.g. for aggregates summary)
    const data = await getHODAnalyticsData();

    const aggregateSummary = `HOD Context: ${data.department} · Students: ${data.students.length} · Modules: ${data.modules.length}`;

    const filterContext = {
        // HODs typically build reports for their entire department slice by default
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Reports Builder</h1>
                <p className="text-muted-foreground mt-1">
                    Design and save custom analytics reports for {data.department}
                </p>
            </div>

            <div className="flex-1 min-h-0 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col p-4">
                <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <ReportBuilderPanel
                        variant="fullPage"
                        builderRole="hod"
                        defaultDefinition={defaultHodReportDefinition()}
                        filterContext={filterContext}
                        aggregatesSummary={aggregateSummary}
                    />
                </Suspense>
            </div>
        </div>
    );
}
