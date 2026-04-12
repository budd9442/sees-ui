import { Suspense } from 'react';
import { getModuleRegistrationData } from '@/lib/actions/student-actions';
import { ModuleRegistrationView } from './module-registration-view';
import Loading from '../loading';
import { FEATURE_FLAGS } from '@/lib/constants/feature-flags';
import FeatureGuard from '@/components/feature-guard';
import { prisma } from '@/lib/db';

export default async function ModuleRegistrationPage() {
  const data = await getModuleRegistrationData();
  
  // Fetch registration flag for deadline info
  const regFlag = await prisma.featureFlag.findUnique({
    where: { key: FEATURE_FLAGS.ENABLE_MODULE_REGISTRATION }
  });

  return (
    <FeatureGuard featureKey={FEATURE_FLAGS.ENABLE_MODULE_REGISTRATION} userRole="STUDENT">
      <Suspense fallback={<Loading />}>
        <ModuleRegistrationView
          student={data.student}
          semesters={data.semesters}
          registeredModuleIds={data.registeredModuleIds}
          completedModuleCodes={data.completedModuleCodes}
          registrationDeadline={regFlag?.endDate}
        />
      </Suspense>
    </FeatureGuard>
  );
}
