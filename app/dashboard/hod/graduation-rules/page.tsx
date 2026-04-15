import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { listGraduationProgramsForEditor } from '@/lib/actions/graduation-eligibility-actions';
import GraduationRulesClient from './_components/graduation-rules-client';

export const dynamic = 'force-dynamic';

export default async function HodGraduationRulesPage() {
    const session = await auth();
    const role = session?.user?.role;
    if (!session?.user?.id || (role !== 'hod' && role !== 'admin')) {
        redirect('/login');
    }

    const programs = await listGraduationProgramsForEditor();

    return (
        <Suspense
            fallback={
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <GraduationRulesClient initialPrograms={programs} />
        </Suspense>
    );
}
