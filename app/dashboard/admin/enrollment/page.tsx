export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { getBulkEnrollmentBatches } from '@/lib/actions/enrollment-bulk-actions';
import { BulkEnrollmentClient } from './_components/bulk-enrollment-client';
import Loading from '../../loading';

export default async function AdminEnrollmentPage() {
    const batches = await getBulkEnrollmentBatches();

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bulk Enrollment Management</h1>
                <p className="text-muted-foreground">
                    Securely upload and process mass student intake records using CSV files.
                </p>
            </div>

            <Suspense fallback={<Loading />}>
                <BulkEnrollmentClient initialBatches={batches} />
            </Suspense>
        </div>
    );
}
