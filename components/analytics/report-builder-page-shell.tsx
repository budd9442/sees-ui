'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportBuilderPanel } from './report-builder-panel';
import type { ReportDefinition } from '@/lib/analytics/schema';
import type { AnalyticsQueryFilters } from '@/lib/analytics/schema';

type Props = {
    backHref?: string;
    backLabel?: string;
    defaultDefinition: ReportDefinition;
    filterContext: AnalyticsQueryFilters;
    builderRole: string;
    aggregatesSummary?: string;
    variant?: 'embedded' | 'fullPage';
};

export function ReportBuilderPageShell({
    backHref,
    backLabel,
    defaultDefinition,
    filterContext,
    builderRole,
    aggregatesSummary,
    variant = 'fullPage',
}: Props) {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 shrink-0 border-b">
                {backHref && backLabel && (
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={backHref}>
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            {backLabel}
                        </Link>
                    </Button>
                )}
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">Analytics Report Builder</h1>
                    <p className="text-[10px] text-muted-foreground">Build, save, and share custom analytics reports</p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden p-2">
                <ReportBuilderPanel
                    variant={variant}
                    defaultDefinition={defaultDefinition}
                    filterContext={filterContext}
                    builderRole={builderRole}
                    aggregatesSummary={aggregatesSummary}
                />
            </div>
        </div>
    );
}
