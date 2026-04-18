export const dynamic = "force-dynamic";
import { getModuleRegistrationData } from '@/lib/actions/student-actions';
import { ModuleRegistrationView } from './module-registration-view';

export default async function ModuleRegistrationPage() {
    const data = await getModuleRegistrationData();

    return (
        <div className="container max-w-7xl py-8 px-4 md:px-8">
            <ModuleRegistrationView
                student={data.student}
                semesters={data.semesters}
                registeredModuleIds={data.registeredModuleIds}
                completedModuleCodes={data.completedModuleCodes}
                registrationWindow={data.registrationWindow}
            />
        </div>
    );
}
