'use server';

import { Suspense } from 'react';
import { getPathwayAllocationStatus } from '@/lib/actions/pathway-actions';
import { StaffPathwayClient } from './_components/staff-pathway-client';
import Loading from '../../loading';

export default async function StaffPathwayPage() {
    const stats = await getPathwayAllocationStatus();

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pathway Allocation Oversight</h1>
                <p className="text-muted-foreground">
                    Monitor student preferences and run the automated allocation engine.
                </p>
            </div>

            <Suspense fallback={<Loading />}>
                <StaffPathwayClient initialStats={stats} />
            </Suspense>
        </div>
    );
}
