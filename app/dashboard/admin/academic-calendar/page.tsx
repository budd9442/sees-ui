import { Suspense } from 'react';
import CalendarClient from './_components/calendar-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getCalendarEvents } from '@/app/actions/calendar';
import { getFeatureFlags } from '@/app/actions/feature-flags';

export const dynamic = 'force-dynamic';

export default async function AdminCalendarPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }

  const [eventsRes, flagsRes] = await Promise.all([
    getCalendarEvents(),
    getFeatureFlags(),
  ]);

  const initialEvents = eventsRes.success && eventsRes.data ? eventsRes.data : [];
  const initialFlags = flagsRes.success && flagsRes.data ? flagsRes.data : [];

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <CalendarClient initialEvents={initialEvents} initialFlags={initialFlags} />
    </Suspense>
  );
}
