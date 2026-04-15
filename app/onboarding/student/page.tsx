import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getStudentOnboardingState } from '@/lib/actions/student-onboarding-actions';
import StudentOnboardingClient from './student-onboarding-client';

export const dynamic = 'force-dynamic';

export default async function StudentOnboardingPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'student') {
        redirect('/login');
    }

    const state = await getStudentOnboardingState();
    if (state.completed) {
        redirect('/dashboard/student');
    }

    return (
        <StudentOnboardingClient
            questions={state.questions}
            initialMetadata={state.metadata}
        />
    );
}
