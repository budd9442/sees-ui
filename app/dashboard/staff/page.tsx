import { Suspense } from 'react';
import { getStaffDashboardData } from '@/lib/actions/staff-actions';
import { StaffDashboardView } from './dashboard-view';
import Loading from '../student/loading'; // Assuming generic loading

export const dynamic = 'force-dynamic';

export default async function StaffDashboardPage() {
  try {
    const data = await getStaffDashboardData();

    if (!data) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground">You do not have a staff profile associated with this account.</p>
        </div>
      );
    }
    return (
      <Suspense fallback={<Loading />}>
        <StaffDashboardView
          staff={data.staff}
          myModules={data.myModules}
          totalStudents={data.totalStudents}
          pendingGrades={data.pendingGrades}
          upcomingClasses={data.upcomingClasses}
          gradeDistribution={data.gradeDistribution}
          moduleWorkload={data.moduleWorkload}
          recentActivities={data.recentActivities}
          upcomingDeadlines={data.upcomingDeadlines}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to load staff dashboard:", error);
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard data. Please check your connection or contact support.
      </div>
    );
  }
}
