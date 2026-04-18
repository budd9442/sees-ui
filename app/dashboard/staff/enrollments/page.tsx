export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { getEnrollmentStats } from '@/lib/actions/enrollment-actions';
import { StaffEnrollmentClient } from './_components/staff-enrollment-client';
import Loading from '../../loading';

export default async function StaffEnrollmentPage() {
    const stats = await getEnrollmentStats();

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Enrollment Management</h1>
                <p className="text-muted-foreground">
                    Monitor module demand and manage student registration capacities.
                </p>
            </div>

            <Suspense fallback={<Loading />}>
                <StaffEnrollmentClient initialStats={stats} />
            </Suspense>
        </div>
    );
}
