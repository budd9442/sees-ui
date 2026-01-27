import { Suspense } from 'react';
import { getModuleRegistrationData } from '@/lib/actions/student-actions';
import { ModuleRegistrationView } from './module-registration-view';
import Loading from '../loading';
import { FEATURE_FLAGS } from '@/lib/services/feature-flags';
import FeatureGuard from '@/components/feature-guard';

export default async function ModuleRegistrationPage() {
  const data = await getModuleRegistrationData();

  return (
    <FeatureGuard featureKey={FEATURE_FLAGS.ENABLE_MODULE_REGISTRATION} userRole="STUDENT">
      <Suspense fallback={<Loading />}>
        <ModuleRegistrationView
          student={data.student}
          currentSemester={data.currentSemester}
          availableModules={data.availableModules}
          registeredModuleIds={data.registeredModuleIds}
          completedModuleCodes={data.completedModuleCodes}
          compulsoryModuleIds={data.compulsoryModuleIds}
        />
      </Suspense>
    </FeatureGuard>
  );
}
