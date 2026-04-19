import { Suspense } from 'react';
import { FEATURE_FLAGS } from '@/lib/constants/feature-flags';
import FeatureGuard from '@/components/feature-guard';
import ReportsClient from './_components/reports-client';

import { getReportCategories, getStudentReportsData } from '@/lib/actions/report-actions';

export const dynamic = 'force-dynamic';

export default async function AnonymousReportsPage() {
  const [categories, reportData] = await Promise.all([
    getReportCategories(),
    getStudentReportsData()
  ]);

  return (
    <FeatureGuard featureKey={FEATURE_FLAGS.ENABLE_ANONYMOUS_REPORTS} userRole="STUDENT">
      <Suspense fallback={<div>Loading...</div>}>
        <ReportsClient 
          categories={categories} 
          initialReports={reportData.reports} 
        />
      </Suspense>
    </FeatureGuard>
  );
}

