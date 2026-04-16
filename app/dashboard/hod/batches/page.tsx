import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getBatchDetailsForOperator, getBatchOverviewForOperator } from '@/lib/actions/academic-transition-actions';
import { BatchManagementClient } from './_components/batch-management-client';

export const dynamic = 'force-dynamic';

export default async function HodBatchManagementPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'hod' && session.user.role !== 'admin')) {
        redirect('/login');
    }

    const [overviewRes, detailRes] = await Promise.all([
        getBatchOverviewForOperator(),
        getBatchDetailsForOperator('L1'),
    ]);

    return (
        <BatchManagementClient
            initialOverview={overviewRes.success && overviewRes.data ? overviewRes.data : []}
            initialDetail={detailRes.success && detailRes.data ? detailRes.data : null}
        />
    );
}
