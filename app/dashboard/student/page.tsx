import { Suspense } from 'react';
import { getStudentDashboardData, getStudentGPAHistory } from '@/lib/actions/student-actions';
import { DashboardView } from './dashboard-view';
import Loading from './loading';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  try {
    const [data, gpaHistory] = await Promise.all([
      getStudentDashboardData(),
      getStudentGPAHistory()
    ]);

    if (!data) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground">You do not have a student profile associated with this account.</p>
        </div>
      );
    }
    return (
      <Suspense fallback={<Loading />}>
        <DashboardView
          student={data.student}
          notifications={data.notifications}
          schedules={data.schedules}
          pathwayDemand={data.pathwayDemand}
          gpaHistory={gpaHistory}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to load student dashboard:", error);
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard data. Please check your connection or contact support.
      </div>
    );
  }
}
