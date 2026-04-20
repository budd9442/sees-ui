import { Suspense } from 'react';
import { getHODDashboardData } from '@/lib/actions/hod-actions';
import { HodDashboardView } from './dashboard-view';
import Loading from '../student/loading';

export const dynamic = 'force-dynamic';

export default async function HodDashboardPage() {
  try {
    const data = await getHODDashboardData();

    if (!data) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground">You do not have a Head of Department profile associated with this account.</p>
        </div>
      );
    }
    return (
      <Suspense fallback={<Loading />}>
        <HodDashboardView
          hod={data.hod}
          totalStudents={data.totalStudents}
          totalStaff={data.totalStaff}
          totalModules={data.totalModules}
          pendingApprovals={data.pendingApprovals}
          pathwayDemandData={data.pathwayDemandData}
          academicPerformanceData={data.academicPerformanceData}
          modulePerformanceData={data.modulePerformanceData}
          staffWorkloadData={data.staffWorkloadData}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to load HOD dashboard:", error);
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard data. Please check your connection or contact support.
      </div>
    );
  }
}
