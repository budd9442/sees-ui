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
      include: {
        student: { include: { degree_path: true, specialization: true } },
        staff: { include: { hod: true } },
      }
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
    currentLevel: (dbUser as any)?.student?.current_level || undefined,
    degreeProgram: (dbUser as any)?.student?.degree_path?.code || undefined,
    specialization: (dbUser as any)?.student?.specialization?.code || undefined,
    isActive: dbUser ? dbUser.status === 'ACTIVE' : true,
    isHOD: !!dbUser?.staff?.hod,
    isGraduated:
      !!(dbUser as any)?.student &&
      (((dbUser as any)?.student?.current_level === 'GRADUATED') ||
        ((dbUser as any)?.student?.graduation_status === 'GRADUATED')),
    avatar: dbUser?.avatar || undefined,
    lastLoginDate: dbUser?.last_login_date || (session.user as any).lastLoginDate,
    phone: dbUser?.phone || undefined,
    linkedin: dbUser?.linkedin || undefined,
    github: dbUser?.github || undefined,
    address: dbUser?.address || undefined,
    bio: dbUser?.bio || undefined,
    emergency_contact: dbUser?.emergency_contact || undefined,
  };

  if ((dbUser as any)?.student && !(dbUser as any).student.onboarding_completed_at) {
    redirect('/onboarding/student');
  }

  // If onboarding is done but LMS import isn't committed yet, force the student
  // through the LMS import flow before exposing the dashboard.
  if ((dbUser as any)?.student && (dbUser as any).student.onboarding_completed_at) {
    const metadata = (dbUser as any).student.metadata as any;
    const lmsCompletedAt =
      metadata?.lms_import_completed_at ??
      metadata?.lmsImportCompletedAt ??
      (metadata?.lms_import_completed === true ? new Date().toISOString() : null);

    const lmsSkippedAt =
      metadata?.lms_import_skipped_at ??
      metadata?.lmsImportSkippedAt ??
      (metadata?.lms_import_skipped === true ? new Date().toISOString() : null);

    if (!lmsCompletedAt && !lmsSkippedAt) {
      redirect('/onboarding/student/lms-import');
    }
  }

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
