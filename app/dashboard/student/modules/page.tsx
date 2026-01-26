import { Suspense } from 'react';
import { getModuleRegistrationData } from '@/lib/actions/student-actions';
import { ModuleRegistrationView } from './module-registration-view';
import Loading from '../loading'; // Reusing student loading component

export default async function ModuleRegistrationPage() {
  try {
    const data = await getModuleRegistrationData();

    return (
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
    );
  } catch (error) {
    console.error("Failed to load module registration:", error);
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load module registration data. Please try again later.
      </div>
    );
  }
}
