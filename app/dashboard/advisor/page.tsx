import { Suspense } from 'react';
import { getAdvisorDashboardData } from '@/lib/actions/advisor-actions';
import { AdvisorDashboardView } from './dashboard-view';
import Loading from '../student/loading';

export const dynamic = 'force-dynamic';

export default async function AdvisorDashboardPage() {
  try {
    const data = await getAdvisorDashboardData();

    if (!data) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground">You do not have an advisor profile associated with this account.</p>
        </div>
      );
    }
    return (
      <Suspense fallback={<Loading />}>
        <AdvisorDashboardView
          advisor={data.advisor}
          myStudents={data.myStudents}
          atRiskStudents={data.atRiskStudents}
          pendingMessages={data.pendingMessages}
          averageGPA={data.averageGPA}
          performanceDistribution={data.performanceDistribution}
          gpaTrendData={data.gpaTrendData}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to load advisor dashboard:", error);
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard data. Please check your connection or contact support.
      </div>
    );
  }
}
