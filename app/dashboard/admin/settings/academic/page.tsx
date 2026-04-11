import { prisma } from '@/lib/db';
import AcademicSettingsClient from './_components/academic-settings-client';
import { ensureDefaultSettings } from '@/lib/actions/grading-actions';

export const dynamic = 'force-dynamic';

export default async function AcademicSettingsPage() {
    // Ensure we have defaults seeded
    await ensureDefaultSettings();

    const settings = await prisma.systemSetting.findMany({
        where: { key: { startsWith: 'threshold_' } }
    });

    const scheme = await prisma.gradingScheme.findFirst({
        where: { active: true },
        include: { bands: true }
    });

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <AcademicSettingsClient 
                initialSettings={settings}
                initialScheme={scheme}
            />
        </div>
    );
}
