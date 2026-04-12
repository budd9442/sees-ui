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

  // Fetch fresh user data from DB to ensure we aren't using stale session details
  // (Critical for recoveries after DB re-seeding)
  let dbUser = null;
  if (session.user.email) {
    const { prisma } = await import('@/lib/db');
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { student: true, staff: true }
    });
  }

  // Fallback to session data if DB lookup fails (though unlikely if logged in)
  const user: User = {
    id: dbUser?.user_id || session.user.id || '',
    email: dbUser?.email || session.user.email || '',
    firstName: dbUser?.firstName || (session.user as any).firstName || session.user.name?.split(' ')[0] || 'User',
    lastName: dbUser?.lastName || (session.user as any).lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
    name: dbUser ? `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() : session.user.name || '',
    // Determine role from DB record if possible
    role: (dbUser as any)?.student
      ? 'student'
      : (dbUser as any)?.staff?.staff_type === 'ADMIN' || (dbUser as any)?.staff?.staff_type === 'REGISTRAR'
        ? 'admin'
        : (dbUser as any)?.staff
          ? 'staff'
          : (session.user as any).role || 'student',
    isActive: dbUser ? dbUser.status === 'ACTIVE' : true,
    avatar: undefined // Explicitly undefined if not present
  };

  // Fetch Feature Flags
  const { getFeatureFlags } = await import('@/app/actions/feature-flags');
  const flagsRes = await getFeatureFlags();
  const featureFlags: Record<string, boolean> = {};

  if (flagsRes.success && flagsRes.data) {
    const now = new Date();
    flagsRes.data.forEach((flag) => {
      let isEnabled = flag.isEnabled;

      // Date Check
      if (flag.startDate && now < flag.startDate) isEnabled = false;
      if (flag.endDate && now > flag.endDate) isEnabled = false;

      // Role Check
      // We check against the resolved 'user.role' from above
      if (isEnabled && flag.targetRoles.length > 0 && user.role) {
        if (!flag.targetRoles.includes(user.role)) isEnabled = false;
      }

      featureFlags[flag.key] = isEnabled;
    });
  }

  console.log('Layout Hydration User:', user);

  // [MAINTENANCE LOCKDOWN]
  // If maintenance mode is active, block all non-admins
  const { prisma } = await import('@/lib/db');
  const maintenanceSetting = await prisma.systemSetting.findUnique({ where: { key: 'maintenance_mode' } });
  if (maintenanceSetting?.value === 'true' && user.role !== 'admin') {
    redirect('/maintenance');
  }

  return (
    <>
      <StoreHydrator user={user} />
      <DashboardContent featureFlags={featureFlags}>{children}</DashboardContent>
    </>
  );
}
