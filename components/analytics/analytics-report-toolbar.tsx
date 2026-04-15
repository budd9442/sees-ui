'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { exportAnalyticsCsv, exportAnalyticsXlsxBase64 } from '@/lib/actions/analytics-actions';
import type { AnalyticsQueryInput } from '@/lib/analytics/schema';
import { toast } from 'sonner';

type Props = {
    exportQuery: AnalyticsQueryInput;
};

export function AnalyticsReportToolbar({ exportQuery }: Props) {
    const [pending, start] = useTransition();

    const downloadCsv = () => {
        start(async () => {
            try {
                const { csv, filename } = await exportAnalyticsCsv(exportQuery);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('CSV downloaded');
            } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : 'Export failed');
            }
        });
    };

    const downloadXlsx = () => {
        start(async () => {
            try {
                const { base64, filename } = await exportAnalyticsXlsxBase64(exportQuery);
                const bin = atob(base64);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                const blob = new Blob([bytes], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Excel downloaded');
            } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : 'Export failed');
            }
        });
    };

    return (
        <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={downloadCsv}>
                Export CSV (query)
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={downloadXlsx}>
                Export XLSX (query)
            </Button>
        </div>
    );
}
