import { Suspense } from 'react';
import { getAdminDashboardData } from '@/lib/actions/admin-actions';
import { AdminDashboardView } from './dashboard-view';
import Loading from '../student/loading';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  try {
    const data = await getAdminDashboardData();

    if (!data) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground">You do not have a System Admin profile associated with this account.</p>
        </div>
      );
    }
    return (
      <Suspense fallback={<Loading />}>
        <AdminDashboardView
          admin={data.admin}
          totalUsers={data.totalUsers}
          activeSessions={data.activeSessions}
          systemErrors={data.systemErrors}
          databaseSize={data.databaseSize}
          roleDistribution={data.roleDistribution}
          featureFlags={data.featureFlags}
          systemMetrics={data.systemMetrics}
          performanceData={data.performanceData}
          recentLogs={data.recentLogs}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard data. Please check your connection or contact support. Verify you are logged into a admin account.
      </div>
    );
  }
}
