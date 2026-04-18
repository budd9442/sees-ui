export const dynamic = "force-dynamic";
import { Suspense } from 'react';
import { getSpecializationInitialData } from '@/lib/actions/specialization-actions';
import { SpecializationClient } from './_components/specialization-client';
import { PageHeader } from '@/components/layout/page-header';
import Loading from '../../loading';

export default async function SpecializationPage() {
    const initialData = await getSpecializationInitialData();

    return (
        <div className="p-6 space-y-6">
            <PageHeader 
                title="Specialization Selection"
                description="Choose your MIT specialized branch based on your academic performance."
            />

            <Suspense fallback={<Loading />}>
                <SpecializationClient initialData={initialData} />
            </Suspense>
        </div>
    );
}