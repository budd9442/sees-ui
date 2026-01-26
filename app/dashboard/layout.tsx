import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardContent from './dashboard-layout';
import { StoreHydrator } from '@/components/auth/store-hydrator';
import type { User } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Convert NextAuth session user to app User type
  const user: User = {
    id: session.user.id || '',
    email: session.user.email || '',
    firstName: session.user.name?.split(' ')[0] || 'User',
    lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
    name: session.user.name || '',
    role: (session.user as any).role || 'student', // Fallback role
    isActive: true,
  };

  console.log('Layout Hydration User:', user);

  return (
    <>
      <StoreHydrator user={user} />
      <DashboardContent>{children}</DashboardContent>
    </>
  );
}
