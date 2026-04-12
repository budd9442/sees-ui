import { Suspense } from 'react';
import { getAdminAcademicYears } from '@/lib/actions/academic-year-admin';
import { AcademicGovernanceClient } from './_components/academic-governance-client';
import Loading from '../../loading';

export const metadata = {
  title: 'Academic Governance | Admin',
  description: 'Manage institutional academic cycles and temporal lifecycle settings.',
};

export default async function AcademicGovernancePage() {
  const yearsRes = await getAdminAcademicYears();
  
  return (
    <div className="space-y-6">
      <Suspense fallback={<Loading />}>
        <AcademicGovernanceClient 
          initialYears={yearsRes.success ? yearsRes.data : []} 
        />
      </Suspense>
    </div>
  );
}
