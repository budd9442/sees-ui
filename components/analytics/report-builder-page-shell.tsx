'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportBuilderPanel } from './report-builder-panel';
import type { ReportDefinition } from '@/lib/analytics/schema';
import type { AnalyticsQueryFilters } from '@/lib/analytics/schema';

type Props = {
    backHref: string;
    backLabel: string;
    defaultDefinition: ReportDefinition;
    filterContext: AnalyticsQueryFilters;
    /** Role for dataset allowlist (staff / advisor / hod). */
    builderRole: string;
    aggregatesSummary?: string;
};

export function ReportBuilderPageShell({
    backHref,
    backLabel,
    defaultDefinition,
    filterContext,
    builderRole,
    aggregatesSummary,
}: Props) {
    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href={backHref}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        {backLabel}
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">Report builder</h1>
            </div>
            <ReportBuilderPanel
                variant="fullPage"
                defaultDefinition={defaultDefinition}
                filterContext={filterContext}
                builderRole={builderRole}
                aggregatesSummary={aggregatesSummary}
            />
        </div>
    );
}
