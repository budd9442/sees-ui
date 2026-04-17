import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const email = session.user.email?.toLowerCase() || '';

    console.log('Dashboard Entry:', { email, user: session.user });

    const role = (session.user as any).role;
    console.log('Dashboard Entry:', { email, user: session.user, role });

    if (role === 'admin') {
        redirect('/dashboard/admin');
    }

    if (role === 'staff') {
        redirect('/dashboard/staff');
    }

    if (role === 'advisor') {
        redirect('/dashboard/advisor');
    }

    if (role === 'hod') {
        redirect('/dashboard/hod');
    }

    if (role === 'student') {
        redirect('/dashboard/student');
    }

    // Default fallback based on email if role is somehow missing (legacy check)
    if (email.includes('admin')) redirect('/dashboard/admin');
    if (email.includes('staff') || email.includes('lecturer')) redirect('/dashboard/staff');

    // Ultimate fallback for unknown-but-authenticated users.
    redirect('/dashboard/staff');
}
