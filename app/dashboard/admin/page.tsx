import { Suspense } from 'react';
import { getAdminMetrics, getRecentActivity, getSystemSettingsCount } from '@/lib/actions/admin';
import AdminDashboardClient from './_components/admin-dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [metrics, recentActivity, settingsCount] = await Promise.all([
    getAdminMetrics(),
    getRecentActivity(),
    getSystemSettingsCount()
  ]);

  return (
    <Suspense fallback={<div>Loading dashboard metrics...</div>}>
      <AdminDashboardClient
        metrics={metrics}
        recentActivity={recentActivity}
        settingsCount={settingsCount}
      />
    </Suspense>
  );
}
