import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { listModuleRegistrationRounds } from '@/lib/actions/module-registration-round-actions';
import { ModuleRegistrationRoundsClient } from './_components/module-registration-rounds-client';

export const dynamic = 'force-dynamic';

export default async function HodModuleRegistrationPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'hod' && session.user.role !== 'admin')) {
        redirect('/login');
    }

    const [roundsRes, academicYears] = await Promise.all([
        listModuleRegistrationRounds(),
        prisma.academicYear.findMany({ orderBy: { start_date: 'desc' } }),
    ]);

    return (
        <ModuleRegistrationRoundsClient
            initialRounds={roundsRes.success && roundsRes.data ? roundsRes.data : []}
            academicYears={academicYears}
        />
    );
}
